import { create } from "zustand";
import { persist } from "zustand/middleware";
import { REGIONES, RESERVA_ZONAS_ORDER, regionToSlug } from "../data/puntos";

const STORAGE_KEY = "reserva:state:v1";
const MAX_OCUPACION_TOTAL = 12;
const MAX_MASCOTAS = 4;
export const MESA_AUN_SIN_SELECCION = "sin seleccionar";

const normalizeZoneName = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeMesaAsignada = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const numericValue = Number(trimmed);
    return Number.isNaN(numericValue) ? trimmed : numericValue;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
};

const DEFAULT_RESERVA_DATA = {
  selectedDate: new Date().toISOString(),
  hour: "09",
  minute: "00",
  adults: 0,
  children: 0,
  mascotas: 0,
  mesa: null,
  name: "",
  email: "",
  whatsapp: "",
};

export const RESERVA_ZONAS_CONFIG = RESERVA_ZONAS_ORDER.map((slug, index) => {
  const region = REGIONES.find((item) => regionToSlug(item.slug) === slug);

  return {
    id: `zona-${index + 1}`,
    nombre: region?.slug || slug,
    permiteMascotas: slug === "pet-family",
    mesasBase: [4, 6],
  };
});

const EMPTY_DETALLE_ASISTENTES = {
  adultos: 0,
  ninos: 0,
  mascotas: 0,
  asistentes: [],
};
const getTotalOcupacion = (reservaData = {}) =>
  Number(reservaData?.adults || 0) +
  Number(reservaData?.children || 0) +
  Number(reservaData?.mascotas || 0);

const buildDetalleAsistentes = (reservaData = {}) => {
  const adultosCount = Number(reservaData?.adults || 0);
  const ninosCount = Number(reservaData?.children || 0);
  const mascotasCount = Number(reservaData?.mascotas || 0);

  const asistentesAdultos = Array.from(
    { length: adultosCount },
    (_, i) => `Adulto ${i + 1}`,
  );
  const asistentesNinos = Array.from(
    { length: ninosCount },
    (_, i) => `Niño ${i + 1}`,
  );
  const asistentesMascotas = Array.from(
    { length: mascotasCount },
    (_, i) => `Mascota ${i + 1}`,
  );

  return {
    adultos: adultosCount,
    ninos: ninosCount,
    mascotas: mascotasCount,
    asistentes: [...asistentesAdultos, ...asistentesNinos, ...asistentesMascotas],
  };
};

const getNextCapacityInPlan = (mesasBase = [], capacidadActual) => {
  const capacities = [...new Set((mesasBase || []).map(Number))].filter(
    (value) => value > 0,
  );

  if (capacities.length <= 1) {
    return capacidadActual;
  }

  if (capacities.includes(4) && capacities.includes(6)) {
    return capacidadActual === 4 ? 6 : capacidadActual === 6 ? 4 : 4;
  }

  const fallback = capacities.find((value) => value !== capacidadActual);
  return fallback || capacidadActual;
};

const buildMesasPlan = (zona, capacidadInicial, totalOcupacion) => {
  const capacidadesZona = (zona?.mesasBase || [])
    .map(Number)
    .filter((v) => v > 0);
  if (capacidadesZona.length === 0) {
    return [];
  }

  const capacidadBase = capacidadesZona.includes(capacidadInicial)
    ? capacidadInicial
    : capacidadesZona[0];

  const objetivo = Math.max(1, Math.min(totalOcupacion, MAX_OCUPACION_TOTAL));

  // Regla esperada por UX:
  // 1-4 => [4]
  // 5-6 => [6]
  // 7-10 => [6,4]
  // 11-12 => [6,6]
  if (capacidadesZona.includes(4) && capacidadesZona.includes(6)) {
    if (objetivo <= 4) return [4];
    if (objetivo <= 6) return [6];
    if (objetivo <= 10) return [6, 4];
    return [6, 6];
  }

  const plan = [capacidadBase];
  let capacidadAcumulada = capacidadBase;

  while (capacidadAcumulada < objetivo) {
    const siguiente = getNextCapacityInPlan(
      capacidadesZona,
      plan[plan.length - 1],
    );
    plan.push(siguiente);
    capacidadAcumulada += siguiente;
  }

  return plan;
};

const buildMesaOptions = (zona, totalOcupacion) => {
  if (!zona) return [];

  return (zona.mesasBase || []).map((capacidadBase) => {
    const mesasPlan = buildMesasPlan(zona, capacidadBase, totalOcupacion);
    const mesasUnidas = mesasPlan.length;
    const capacidadTotal = mesasPlan.reduce((sum, item) => sum + item, 0);
    const labelPlan = mesasPlan.join(" + ");

    return {
      capacidadBase,
      mesasUnidas,
      mesasPlan,
      capacidadTotal,
      label:
        mesasUnidas > 1
          ? `${labelPlan} (${capacidadTotal} sillas)`
          : `Mesa de ${capacidadBase}`,
    };
  });
};

const buildZonaReservaData = (
  reservaData,
  selectedZoneId,
  preferredMesaBase = null,
) => {
  const totalOcupacion = getTotalOcupacion(reservaData);
  const zonaSeleccionada = RESERVA_ZONAS_CONFIG.find(
    (zona) => zona.id === selectedZoneId,
  );

  if (!zonaSeleccionada) {
    return {
      zonas: RESERVA_ZONAS_CONFIG,
      selectedZoneId: null,
      selectedZoneName: "general",
      permiteMascotas: false,
      totalOcupacion,
      opcionesMesa: [],
      mesaSeleccionada: null,
      mesaAsignada: normalizeMesaAsignada(reservaData?.mesa),
    };
  }

  const opcionesMesa = buildMesaOptions(zonaSeleccionada, totalOcupacion);

  const mesaSeleccionada =
    opcionesMesa.find((opcion) => opcion.capacidadBase === preferredMesaBase) ||
    opcionesMesa[0] ||
    null;

  return {
    zonas: RESERVA_ZONAS_CONFIG,
    selectedZoneId: zonaSeleccionada?.id || null,
    selectedZoneName: zonaSeleccionada?.nombre || null,
    permiteMascotas: Boolean(zonaSeleccionada?.permiteMascotas),
    totalOcupacion,
    opcionesMesa,
    mesaSeleccionada,
    mesaAsignada: normalizeMesaAsignada(reservaData?.mesa),
  };
};

/**
 * Store unificado para manejar:
 * 1. Estado del modal de reserva (UI)
 * 2. Datos de la reserva
 * 3. Persistencia en localStorage
 * 4. Envio a Firestore
 */
const INITIAL_PASOS_RESERVA = {
  visitantes: { completado: false, habilitado: true },
  fecha: { completado: false, habilitado: false },
  hora: { completado: false, habilitado: false },
  platos: { completado: false, habilitado: false },
};

const FLOW_STEPS = ["reserva", "platos"];
const FLOW_STEPS_VALID = [...FLOW_STEPS, "succes"];

const buildFreshReservaData = () => ({
  ...DEFAULT_RESERVA_DATA,
  selectedDate: new Date().toISOString(),
});

export const useReservaStore = create(
  persist(
    (set, get) => ({
      isBookingOpen: false,
      flowStep: "reserva",
      currentStep: 0,
      activeMesas: false,
      completedSteps: [false, false, false, false, false],
      pasosReserva: INITIAL_PASOS_RESERVA,

      isDatosReservaCompletados: false,
      reservaData: DEFAULT_RESERVA_DATA,
      detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
      reservaZonaData: buildZonaReservaData(DEFAULT_RESERVA_DATA, null),

      actualizarDetalleAsistentes: (reservaData = get().reservaData) => {
        const detalle = buildDetalleAsistentes(reservaData);
        const totalAsistentes = (detalle?.asistentes || []).length;

        set({
          detalleAsistentes:
            totalAsistentes > 0 ? detalle : EMPTY_DETALLE_ASISTENTES,
        });
      },

      limpiarDetalleAsistentes: () =>
        set({ detalleAsistentes: EMPTY_DETALLE_ASISTENTES }),

      seleccionarZona: (zoneName) =>
        set((state) => {
          const zoneNameNormalized = normalizeZoneName(zoneName);
          const zona = RESERVA_ZONAS_CONFIG.find(
            (item) => normalizeZoneName(item.nombre) === zoneNameNormalized,
          );
          if (!zona) return state;

          const nextReservaData = { ...state.reservaData };
          if (
            !zona.permiteMascotas &&
            Number(nextReservaData?.mascotas || 0) > 0
          ) {
            nextReservaData.mascotas = 0;
          }

          const preferredMesaBase =
            state.reservaZonaData?.mesaSeleccionada?.capacidadBase || null;

          return {
            reservaData: nextReservaData,
            reservaZonaData: buildZonaReservaData(
              nextReservaData,
              zona.id,
              preferredMesaBase,
            ),
          };
        }),

      seleccionarMesaBase: (capacidadBase) =>
        set((state) => {
          const zonaId = state.reservaZonaData?.selectedZoneId;
          if (!zonaId) return state;
          return {
            reservaZonaData: buildZonaReservaData(
              state.reservaData,
              zonaId,
              capacidadBase,
            ),
          };
        }),

      setMesaAsignada: (mesa) =>
        set((state) => {
          const mesaNormalizada = normalizeMesaAsignada(mesa);

          const nextReservaData = {
            ...state.reservaData,
            mesa: mesaNormalizada,
          };

          return {
            reservaData: nextReservaData,
            reservaZonaData: buildZonaReservaData(
              nextReservaData,
              state.reservaZonaData?.selectedZoneId || null,
              state.reservaZonaData?.mesaSeleccionada?.capacidadBase || null,
            ),
          };
        }),

      prepararDatosCheckout: (platosSeleccionados) => {
        const { reservaData, reservaZonaData } = get();
        const checkoutData = {
          id: `temp-${Date.now()}`,
          fechaCreacion: new Date().toISOString(),
          estado: "temporal",
          reservaData,
          reservaZonaData: {
            selectedZoneId: reservaZonaData?.selectedZoneId || null,
            selectedZoneName: reservaZonaData?.selectedZoneName || null,
            mesaAsignada: reservaZonaData?.mesaAsignada ?? null,
          },
          platosSeleccionados,
          uiState: { showMenu: true },
          validado: true,
        };

        try {
          localStorage.setItem(
            "checkout:reserva:temp",
            JSON.stringify(checkoutData),
          );
          return { ok: true, data: checkoutData };
        } catch (error) {
          console.error("Error preparando datos para checkout:", error);
          return { ok: false, error: error.message };
        }
      },

      limpiarDatosCheckout: () => {
        try {
          localStorage.removeItem("checkout:reserva:temp");
        } catch (error) {
          console.error("Error limpiando datos de checkout:", error);
        }
      },

      openBookingWithOrigin: () => set({ isBookingOpen: true }),
      closeBooking: () => set({ isBookingOpen: false }),

      setFlowStep: (step) => {
        if (!FLOW_STEPS_VALID.includes(step)) return;
        set({ flowStep: step });
      },

      goToNextFlowStep: () =>
        set((state) => {
          const currentIndex = FLOW_STEPS.indexOf(state.flowStep);
          const safeIndex = currentIndex < 0 ? 0 : currentIndex;
          const nextIndex = Math.min(safeIndex + 1, FLOW_STEPS.length - 1);
          return { flowStep: FLOW_STEPS[nextIndex] };
        }),

      goToPrevFlowStep: () =>
        set((state) => {
          const currentIndex = FLOW_STEPS.indexOf(state.flowStep);
          const safeIndex = currentIndex < 0 ? 0 : currentIndex;
          const prevIndex = Math.max(safeIndex - 1, 0);
          return { flowStep: FLOW_STEPS[prevIndex] };
        }),

      resetFlowStep: () => set({ flowStep: "reserva" }),

      resumeOrStartFlowStep: () =>
        set((state) => {
          const persistedFlowStep = FLOW_STEPS.includes(state.flowStep)
            ? state.flowStep
            : "reserva";

          const hasReservaProgress =
            Boolean(state.pasosReserva?.visitantes?.completado) ||
            Number(state.reservaData?.adults || 0) > 0 ||
            Number(state.reservaData?.children || 0) > 0 ||
            Number(state.reservaData?.mascotas || 0) > 0;

          // Si retoma en Reserva y ya habia progreso, abrimos selector de zona expandido.
          if (persistedFlowStep === "reserva" && hasReservaProgress) {
            return {
              flowStep: persistedFlowStep,
            };
          }

          return {
            flowStep: persistedFlowStep,
          };
        }),

      setDatosReservaCompletados: (value) =>
        set({ isDatosReservaCompletados: Boolean(value) }),

      setCurrentStep: (step) => {
        set({ currentStep: step });
        localStorage.setItem("reserva:currentStep", JSON.stringify(step));
      },

      setActiveMesas: (value) => set({ activeMesas: Boolean(value) }),

      setCompletedSteps: (steps) =>
        set({ completedSteps: Array.isArray(steps) ? steps : [] }),

      setPasoReserva: (paso, data) =>
        set((state) => ({
          pasosReserva: {
            ...state.pasosReserva,
            [paso]: { ...state.pasosReserva[paso], ...data },
          },
        })),

      updateReservaData: (data) =>
        set((state) => {
          const selectedZoneId = state.reservaZonaData?.selectedZoneId || null;
          const zona = RESERVA_ZONAS_CONFIG.find(
            (item) => item.id === selectedZoneId,
          );

          const newData = { ...state.reservaData, ...data };
          const totalOcupacion = getTotalOcupacion(newData);

          if (totalOcupacion > MAX_OCUPACION_TOTAL) return state;
          if ((newData.mascotas || 0) > MAX_MASCOTAS) return state;

          if (!zona?.permiteMascotas && Number(newData?.mascotas || 0) > 0) {
            newData.mascotas = 0;
          }

          const preferredMesaBase =
            state.reservaZonaData?.mesaSeleccionada?.capacidadBase || null;

          return {
            reservaData: newData,
            reservaZonaData: buildZonaReservaData(
              newData,
              selectedZoneId,
              preferredMesaBase,
            ),
          };
        }),

      resetReserva: () =>
        set(() => {
          const nextReservaData = buildFreshReservaData();
          return {
            flowStep: "reserva",
            currentStep: 0,
            activeMesas: false,
            completedSteps: [false, false, false, false, false],
            pasosReserva: INITIAL_PASOS_RESERVA,

            isDatosReservaCompletados: false,
            reservaData: nextReservaData,
            detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
            reservaZonaData: buildZonaReservaData(nextReservaData, null),
          };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => {
        const { ...persistedState } = state;
        return persistedState;
      },
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }
        if (version < 1) {
          const { ...rest } = persistedState;
          return rest;
        }
        return persistedState;
      },
    },
  ),
);

export default useReservaStore;





