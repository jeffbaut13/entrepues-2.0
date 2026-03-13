import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "reserva:state:v1";
const MAX_OCUPACION_TOTAL = 12;
const MAX_MASCOTAS = 4;

const DEFAULT_RESERVA_DATA = {
  selectedDate: new Date().toISOString(),
  hour: "09",
  minute: "00",
  adults: 0,
  children: 0,
  mascotas: 0,
  name: "",
  email: "",
  whatsapp: "",
};

export const RESERVA_ZONAS_CONFIG = [
  {
    id: "zona-1",
    nombre: "caribe",
    permiteMascotas: true,
    mesasBase: [4, 6],
  },
  {
    id: "zona-2",
    nombre: "pacífica",
    permiteMascotas: false,
    mesasBase: [4, 6],
  },
  {
    id: "zona-3",
    nombre: "amazonía",
    permiteMascotas: false,
    mesasBase: [4, 6],
  },
  {
    id: "zona-4",
    nombre: "insular",
    permiteMascotas: false,
    mesasBase: [4, 6],
  },
  {
    id: "zona-5",
    nombre: "orinoquía",
    permiteMascotas: false,
    mesasBase: [4, 6],
  },
  {
    id: "zona-6",
    nombre: "andina",
    permiteMascotas: false,
    mesasBase: [4, 6],
  },
];

const EMPTY_DETALLE_ASISTENTES = { adultos: 0, ninos: 0, asistentes: [] };
const getTotalOcupacion = (reservaData = {}) =>
  Number(reservaData?.adults || 0) +
  Number(reservaData?.children || 0) +
  Number(reservaData?.mascotas || 0);

const buildDetalleAsistentes = (reservaData = {}) => {
  const adultosCount = Number(reservaData?.adults || 0);
  const ninosCount = Number(reservaData?.children || 0);

  const asistentesAdultos = Array.from(
    { length: adultosCount },
    (_, i) => `Adulto ${i + 1}`
  );
  const asistentesNinos = Array.from(
    { length: ninosCount },
    (_, i) => `Niño ${i + 1}`
  );

  return {
    adultos: adultosCount,
    ninos: ninosCount,
    asistentes: [...asistentesAdultos, ...asistentesNinos],
  };
};

const getNextCapacityInPlan = (mesasBase = [], capacidadActual) => {
  const capacities = [...new Set((mesasBase || []).map(Number))].filter(
    (value) => value > 0
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
  const capacidadesZona = (zona?.mesasBase || []).map(Number).filter((v) => v > 0);
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
    const siguiente = getNextCapacityInPlan(capacidadesZona, plan[plan.length - 1]);
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
  preferredMesaBase = null
) => {
  const zonaSeleccionada =
    RESERVA_ZONAS_CONFIG.find((zona) => zona.id === selectedZoneId) ||
    RESERVA_ZONAS_CONFIG[0];

  const totalOcupacion = getTotalOcupacion(reservaData);
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
  };
};

/**
 * Store unificado para manejar:
 * 1. Estado del modal de reserva (UI)
 * 2. Datos de la reserva
 * 3. Persistencia en localStorage
 * 4. Envío a Firestore
 */
const INITIAL_PASOS_RESERVA = {
  visitantes: { completado: false, habilitado: true },
  fecha: { completado: false, habilitado: false },
  hora: { completado: false, habilitado: false },
  platos: { completado: false, habilitado: false },
};

const buildFreshReservaData = () => ({
  ...DEFAULT_RESERVA_DATA,
  selectedDate: new Date().toISOString(),
});

export const useReservaStore = create(
  persist(
    (set, get) => ({
      isBookingOpen: false,
      currentStep: 0,
      completedSteps: [false, false, false, false],
      pasosReserva: INITIAL_PASOS_RESERVA,
      isZonaExpanded: false,
      isDatosReservaCompletados: false,
      reservaData: DEFAULT_RESERVA_DATA,
      detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
      reservaZonaData: buildZonaReservaData(DEFAULT_RESERVA_DATA, "zona-1"),

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

      setZonaExpanded: (value) =>
        set({ isZonaExpanded: value !== undefined ? Boolean(value) : true }),

      seleccionarZona: (zoneName) =>
        set((state) => {
          const zona = RESERVA_ZONAS_CONFIG.find(
            (item) => item.nombre === zoneName
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
              preferredMesaBase
            ),
          };
        }),

      seleccionarMesaBase: (capacidadBase) =>
        set((state) => {
          const zonaId = state.reservaZonaData?.selectedZoneId || "zona-1";
          return {
            reservaZonaData: buildZonaReservaData(
              state.reservaData,
              zonaId,
              capacidadBase
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
          },
          platosSeleccionados,
          uiState: { showMenu: true },
          validado: true,
        };

        try {
          localStorage.setItem(
            "checkout:reserva:temp",
            JSON.stringify(checkoutData)
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

      setDatosReservaCompletados: (value) =>
        set({ isDatosReservaCompletados: Boolean(value) }),

      setCurrentStep: (step) => {
        set({ currentStep: step });
        localStorage.setItem("reserva:currentStep", JSON.stringify(step));
      },

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
          const selectedZoneId =
            state.reservaZonaData?.selectedZoneId || "zona-1";
          const zona =
            RESERVA_ZONAS_CONFIG.find((item) => item.id === selectedZoneId) ||
            RESERVA_ZONAS_CONFIG[0];

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
              preferredMesaBase
            ),
          };
        }),

      resetReserva: () =>
        set(() => {
          const nextReservaData = buildFreshReservaData();
          return {
            currentStep: 0,
            completedSteps: [false, false, false, false],
            pasosReserva: INITIAL_PASOS_RESERVA,
            isZonaExpanded: false,
            isDatosReservaCompletados: false,
            reservaData: nextReservaData,
            detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
            reservaZonaData: buildZonaReservaData(nextReservaData, "zona-1"),
          };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => {
        const { isZonaExpanded, ...persistedState } = state;
        return persistedState;
      },
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }
        if (version < 1) {
          const { isZonaExpanded, ...rest } = persistedState;
          return rest;
        }
        return persistedState;
      },
    }
  )
);

export default useReservaStore;
