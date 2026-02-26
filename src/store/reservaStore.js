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
    mesaLayout: {
      mesaCounts: { 4: 3, 6: 3 },
      maxMesas: 6,
      gridCols: { base: 2, md: 5 },
    },
  },
  {
    id: "zona-2",
    nombre: "pacifica",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 3, 6: 3 },
      maxMesas: 6,
      gridCols: { base: 2, md: 5 },
    },
  },
  {
    id: "zona-3",
    nombre: "amazonia",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 3, 6: 3 },
      maxMesas: 6,
      gridCols: { base: 2, md: 5 },
    },
  },
  {
    id: "zona-4",
    nombre: "insular",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 3, 6: 3 },
      maxMesas: 6,
      gridCols: { base: 2, md: 5 },
    },
  },
  {
    id: "zona-5",
    nombre: "orinoquia",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 3, 6: 3 },
      maxMesas: 6,
      gridCols: { base: 2, md: 5 },
    },
  },
  {
    id: "zona-6",
    nombre: "andina",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 3, 6: 3 },
      maxMesas: 6,
      gridCols: { base: 2, md: 5 },
    },
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

const DEFAULT_MESA_GRID_COLS = { base: 2, md: 6 };

const toPositiveNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : fallback;
};

const buildMesaCountsFromMesasBase = (mesasBase = []) =>
  (mesasBase || []).reduce((acc, capacidad) => {
    const capacidadNum = Number(capacidad);
    if (!Number.isFinite(capacidadNum) || capacidadNum <= 0) {
      return acc;
    }
    acc[capacidadNum] = (acc[capacidadNum] || 0) + 1;
    return acc;
  }, {});

const getZonaMesaLayout = (zona) => {
  const fallbackCounts = buildMesaCountsFromMesasBase(zona?.mesasBase || []);
  const layoutCountsRaw = zona?.mesaLayout?.mesaCounts || fallbackCounts;

  const mesaCounts = Object.entries(layoutCountsRaw || {}).reduce(
    (acc, [capacidad, cantidad]) => {
      const capacidadNum = toPositiveNumber(capacidad, 0);
      const cantidadNum = Math.floor(toPositiveNumber(cantidad, 0));
      if (capacidadNum > 0 && cantidadNum > 0) {
        acc[capacidadNum] = cantidadNum;
      }
      return acc;
    },
    {}
  );

  const totalMesasDisponibles = Object.values(mesaCounts).reduce(
    (sum, qty) => sum + qty,
    0
  );

  const maxMesasConfigured = Math.floor(
    toPositiveNumber(zona?.mesaLayout?.maxMesas, totalMesasDisponibles)
  );
  const maxMesas = Math.max(
    1,
    Math.min(maxMesasConfigured, Math.max(1, totalMesasDisponibles))
  );

  return {
    mesaCounts,
    maxMesas,
    gridCols: {
      base: Math.floor(
        toPositiveNumber(
          zona?.mesaLayout?.gridCols?.base,
          DEFAULT_MESA_GRID_COLS.base
        )
      ),
      md: Math.floor(
        toPositiveNumber(
          zona?.mesaLayout?.gridCols?.md,
          DEFAULT_MESA_GRID_COLS.md
        )
      ),
    },
  };
};

const expandMesasDisponibles = (mesaCounts = {}, maxMesas = Infinity) => {
  const mesas = [];
  const orderedCapacities = Object.keys(mesaCounts)
    .map(Number)
    .sort((a, b) => a - b);

  for (const capacidad of orderedCapacities) {
    const cantidad = Math.floor(toPositiveNumber(mesaCounts[capacidad], 0));
    for (
      let index = 0;
      index < cantidad && mesas.length < maxMesas;
      index += 1
    ) {
      mesas.push(capacidad);
    }
    if (mesas.length >= maxMesas) {
      break;
    }
  }

  return mesas;
};

const pickNextCapacity = ({
  availableCounts,
  capacities,
  lastCapacity,
  remaining,
}) => {
  if (capacities.length === 0) {
    return null;
  }

  if (capacities.includes(4) && capacities.includes(6)) {
    const preferred = lastCapacity === 4 ? 6 : 4;
    if ((availableCounts[preferred] || 0) > 0) {
      return preferred;
    }

    const fallback = preferred === 4 ? 6 : 4;
    if ((availableCounts[fallback] || 0) > 0) {
      return fallback;
    }
  }

  const closestFit = capacities
    .filter((capacity) => (availableCounts[capacity] || 0) > 0)
    .sort((a, b) => {
      const aDiff = Math.abs(a - remaining);
      const bDiff = Math.abs(b - remaining);
      if (aDiff === bDiff) {
        return a - b;
      }
      return aDiff - bDiff;
    })[0];

  return closestFit || null;
};

const buildMesasPlan = (zona, capacidadInicial, totalOcupacion) => {
  const mesaLayout = getZonaMesaLayout(zona);
  const availableCounts = { ...mesaLayout.mesaCounts };
  const capacities = Object.keys(availableCounts)
    .map(Number)
    .filter((capacity) => capacity > 0)
    .sort((a, b) => a - b);

  if (capacities.length === 0) {
    return [];
  }

  const objetivo = Math.max(
    1,
    Math.min(toPositiveNumber(totalOcupacion, 1), MAX_OCUPACION_TOTAL)
  );

  const plan = [];

  const consume = (capacity) => {
    if (!capacity || (availableCounts[capacity] || 0) <= 0) {
      return false;
    }
    availableCounts[capacity] -= 1;
    plan.push(capacity);
    return true;
  };

  const initialCapacity = capacities.includes(capacidadInicial)
    ? capacidadInicial
    : capacities[0];

  if (!consume(initialCapacity)) {
    const firstAvailable = capacities.find(
      (capacity) => (availableCounts[capacity] || 0) > 0
    );
    if (!firstAvailable || !consume(firstAvailable)) {
      return [];
    }
  }

  let capacidadAcumulada = plan.reduce((sum, capacity) => sum + capacity, 0);

  while (
    capacidadAcumulada < objetivo &&
    plan.length < mesaLayout.maxMesas &&
    Object.values(availableCounts).some((count) => count > 0)
  ) {
    const remaining = objetivo - capacidadAcumulada;
    const lastCapacity = plan[plan.length - 1];

    const nextCapacity = pickNextCapacity({
      availableCounts,
      capacities,
      lastCapacity,
      remaining,
    });

    if (!nextCapacity || !consume(nextCapacity)) {
      break;
    }

    capacidadAcumulada += nextCapacity;
  }

  return plan;
};

const buildMesaOptions = (zona, totalOcupacion) => {
  if (!zona) return [];

  const mesaLayout = getZonaMesaLayout(zona);
  const mesasDisponibles = expandMesasDisponibles(
    mesaLayout.mesaCounts,
    mesaLayout.maxMesas
  );

  return mesasDisponibles.map((capacidadBase, index) => {
    const mesasPlan = buildMesasPlan(zona, capacidadBase, totalOcupacion);
    const mesasUnidas = mesasPlan.length;
    const capacidadTotal = mesasPlan.reduce((sum, item) => sum + item, 0);
    const labelPlan = mesasPlan.join(" + ");
    const optionId = `${zona.id}-mesa-${index + 1}`;

    return {
      optionId,
      mesaIndex: index + 1,
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
  preferredMesaOptionId = null
) => {
  const zonaSeleccionada =
    RESERVA_ZONAS_CONFIG.find((zona) => zona.id === selectedZoneId) ||
    RESERVA_ZONAS_CONFIG[0];

  const totalOcupacion = getTotalOcupacion(reservaData);
  const opcionesMesa = buildMesaOptions(zonaSeleccionada, totalOcupacion);
  const mesaLayout = getZonaMesaLayout(zonaSeleccionada);

  const mesaSeleccionada =
    opcionesMesa.find((opcion) => opcion.optionId === preferredMesaOptionId) ||
    opcionesMesa.find(
      (opcion) => opcion.capacidadBase === preferredMesaOptionId
    ) ||
    opcionesMesa[0] ||
    null;

  return {
    zonas: RESERVA_ZONAS_CONFIG,
    selectedZoneId: zonaSeleccionada?.id || null,
    selectedZoneName: zonaSeleccionada?.nombre || null,
    permiteMascotas: Boolean(zonaSeleccionada?.permiteMascotas),
    mesaGridCols: mesaLayout.gridCols,
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
            state.reservaZonaData?.mesaSeleccionada?.optionId ||
            state.reservaZonaData?.mesaSeleccionada?.capacidadBase ||
            null;

          return {
            reservaData: nextReservaData,
            reservaZonaData: buildZonaReservaData(
              nextReservaData,
              zona.id,
              preferredMesaBase
            ),
          };
        }),

      seleccionarMesaBase: (mesaOptionId) =>
        set((state) => {
          const zonaId = state.reservaZonaData?.selectedZoneId || "zona-1";
          return {
            reservaZonaData: buildZonaReservaData(
              state.reservaData,
              zonaId,
              mesaOptionId
            ),
          };
        }),

      prepararDatosCheckout: (platosSeleccionados) => {
        const { reservaData } = get();
        const checkoutData = {
          id: `temp-${Date.now()}`,
          fechaCreacion: new Date().toISOString(),
          estado: "temporal",
          reservaData,
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
            state.reservaZonaData?.mesaSeleccionada?.optionId ||
            state.reservaZonaData?.mesaSeleccionada?.capacidadBase ||
            null;

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
      version: 0,
    }
  )
);

export default useReservaStore;
