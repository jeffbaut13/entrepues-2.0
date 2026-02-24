import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  guardarReservaEnFirestore,
  obtenerSiguienteNumeroReserva,
} from "../firebase/firestore";
import useCartStore from "./cartStore";

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
      mesaCounts: { 4: 6, 6: 6 },
      maxMesas: 12,
      gridCols: { base: 2, md: 6 },
    },
  },
  {
    id: "zona-2",
    nombre: "pacifica",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 5, 6: 5 },
      maxMesas: 10,
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
      gridCols: { base: 2, md: 6 },
    },
  },
  {
    id: "zona-4",
    nombre: "insular",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 6, 6: 4 },
      maxMesas: 10,
      gridCols: { base: 2, md: 5 },
    },
  },
  {
    id: "zona-5",
    nombre: "orinoquia",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 6, 6: 6 },
      maxMesas: 12,
      gridCols: { base: 2, md: 6 },
    },
  },
  {
    id: "zona-6",
    nombre: "andina",
    permiteMascotas: false,
    mesaLayout: {
      mesaCounts: { 4: 6, 6: 6 },
      maxMesas: 12,
      gridCols: { base: 2, md: 6 },
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
        toPositiveNumber(zona?.mesaLayout?.gridCols?.base, DEFAULT_MESA_GRID_COLS.base)
      ),
      md: Math.floor(
        toPositiveNumber(zona?.mesaLayout?.gridCols?.md, DEFAULT_MESA_GRID_COLS.md)
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
    for (let index = 0; index < cantidad && mesas.length < maxMesas; index += 1) {
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
    opcionesMesa.find((opcion) => opcion.capacidadBase === preferredMesaOptionId) ||
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
export const useReservaStore = create(
  persist(
    (set, get) => ({
      // ===== ESTADO DEL MODAL =====
      isBookingOpen: false,
      originOpen: "", // Rastrear de dónde se abrió el modal
      currentStep: 0,
      completedSteps: [false, false, false, false],
      showResumen: false, // Flag para mostrar el resumen (todos los pasos completados)
      showMenu: false, // Flag para mostrar el menú
      showThankYou: false, // Flag para mostrar la página de agradecimiento
      isZonaExpanded: false,
      isDatosReservaCompletados: false,

      // ===== DATOS DE LA RESERVA =====
      reservaData: DEFAULT_RESERVA_DATA,
      detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
      reservaZonaData: buildZonaReservaData(DEFAULT_RESERVA_DATA, "zona-1"),
      reservaResult: {},

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
          const reservaZonaData = buildZonaReservaData(
            state.reservaData,
            zonaId,
            mesaOptionId
          );
          return { reservaZonaData };
        }),

      // ===== DATOS DE SELECCIÓN DE PLATOS =====
      platosSeleccionados: {}, // Estructura: { asistenteIndex: [platos] }

      updatePlatosSeleccionados: (datos) =>
        set({
          platosSeleccionados: datos,
        }),

      guardarPlatosSeleccionados: (firestoreId, platosData) => {
        set((state) => ({
          platosSeleccionados: {
            firestoreId,
            fecha: new Date().toISOString(),
            platosSeleccionados: platosData,
          },
        }));
      },

      obtenerPlatosSeleccionados: () => get().platosSeleccionados,

      resetPlatosSeleccionados: () =>
        set({
          platosSeleccionados: {},
        }),

      setReservaResult: (data) =>
        set({
          reservaResult: data,
        }),

      // ===== DATOS TEMPORALES PARA CHECKOUT =====

      /**
       * Prepara y guarda los datos temporales para el checkout
       * Incluye validación y persistencia en localStorage
       */
      prepararDatosCheckout: (platosSeleccionados) => {
        const { reservaData } = get();

        // Crear estructura temporal para checkout
        const checkoutData = {
          id: `temp-${Date.now()}`,
          fechaCreacion: new Date().toISOString(),
          estado: "temporal",
          reservaData: reservaData,
          platosSeleccionados: platosSeleccionados,
          uiState: {
            showMenu: true,
          },
          validado: true,
        };

        try {
          // Guardar en localStorage como backup
          localStorage.setItem(
            "checkout:reserva:temp",
            JSON.stringify(checkoutData)
          );

          // Actualizar estado de Zustand
          set((state) => ({
            platosSeleccionados: {
              ...state.platosSeleccionados,
              checkoutData: checkoutData,
            },
          }));

          console.log("✅ Datos preparados para checkout:", checkoutData);
          return { ok: true, data: checkoutData };
        } catch (error) {
          console.error("❌ Error preparando datos para checkout:", error);
          return { ok: false, error: error.message };
        }
      },

      /**
       * Obtiene los datos temporales del checkout desde Zustand o localStorage
       */
      obtenerDatosCheckout: () => {
        try {
          // Primero intentar desde Zustand
          const state = get();
          if (state.platosSeleccionados?.checkoutData) {
            return state.platosSeleccionados.checkoutData;
          }

          // Si no está en Zustand, intentar desde localStorage
          const stored = localStorage.getItem("checkout:reserva:temp");
          if (stored) {
            return JSON.parse(stored);
          }

          return null;
        } catch (error) {
          console.error("❌ Error obteniendo datos de checkout:", error);
          return null;
        }
      },

      /**
       * Limpia los datos temporales del checkout
       */
      limpiarDatosCheckout: () => {
        try {
          localStorage.removeItem("checkout:reserva:temp");
          set((state) => ({
            platosSeleccionados: {
              ...state.platosSeleccionados,
              checkoutData: null,
            },
          }));
        } catch (error) {
          console.error("❌ Error limpiando datos de checkout:", error);
        }
      },

      // ===== ESTADO DE ENVÍO =====

      isSending: false,
      lastSentAt: null,

      // ===== ACCIONES DEL MODAL =====
      openBooking: () => {
        const { showResumen, currentStep } = get();
        // Si el resumen ya está completo, abre directamente en el resumen
        if (showResumen) {
          set({ isBookingOpen: true, currentStep: 4 });
        } else {
          set({ isBookingOpen: true });
        }
      },
      openBookingWithOrigin: (origin = "") => {
        const { showResumen } = get();
        // Si el resumen ya está completo, abre directamente en el resumen
        if (showResumen) {
          set({ isBookingOpen: true, originOpen: origin, currentStep: 4 });
        } else {
          set({ isBookingOpen: true, originOpen: origin });
        }
      },
      closeBooking: () => set({ isBookingOpen: false, originOpen: "" }),

      setOriginOpen: (origin) => set({ originOpen: origin }),
      clearOriginOpen: () => set({ originOpen: "" }),

      setDatosReservaCompletados: (value) =>
        set({ isDatosReservaCompletados: Boolean(value) }),

      // ===== ACCIONES DE PASOS =====
      setCurrentStep: (step) => {
        set({ currentStep: step });
        // Persistir el currentStep inmediatamente
        localStorage.setItem("reserva:currentStep", JSON.stringify(step));
      },
      setCompletedSteps: (steps) => {
        // Solo actualizar los pasos completados, NO activar resumen automáticamente
        set({ completedSteps: steps });
      },

      // Acción para marcar que el resumen fue mostrado (todos pasos completados)
      markResumenAsShown: () => set({ showResumen: true, currentStep: 4 }),

      // Acción para volver a editar (desde el resumen)
      editarReserva: (stepToEdit) => {
        set({
          currentStep: stepToEdit,
          showResumen: false,
          showThankYou: false,
        });
        // Persistir el currentStep inmediatamente
        localStorage.setItem("reserva:currentStep", JSON.stringify(stepToEdit));
      },

      // Acción para mostrar Thank You Page después de enviar
      showThankYouPage: () => {
        set({
          showThankYou: true,
          showResumen: false,
        });
      },
      // Acción para mostrar Thank You Page después de enviar
      showMenuSelected: (state) => {
        const nextShowMenu = state !== undefined ? state : true;
        set({
          showMenu: nextShowMenu,
        });

        try {
          const raw = localStorage.getItem("checkout:reserva:temp");
          if (raw) {
            const parsed = JSON.parse(raw);
            const actualizado = {
              ...parsed,
              uiState: {
                ...(parsed?.uiState || {}),
                showMenu: nextShowMenu,
              },
            };
            localStorage.setItem(
              "checkout:reserva:temp",
              JSON.stringify(actualizado)
            );
          }
        } catch (error) {
          console.error(
            "❌ Error sincronizando showMenu en checkout temp:",
            error
          );
        }
      },

      // Acción para cerrar Thank You y resetear todo EXCEPTO reservaResult
      closeThankYou: () => {
        const nextReservaData = {
          ...DEFAULT_RESERVA_DATA,
          selectedDate: new Date().toISOString(),
        };
        set({
          showThankYou: false,
          isBookingOpen: false,
          currentStep: 0,
          completedSteps: [false, false, false, false],
          showResumen: false,
          isZonaExpanded: false,
          isDatosReservaCompletados: false,
          reservaData: nextReservaData,
          detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
          reservaZonaData: buildZonaReservaData(nextReservaData, "zona-1"),
          // reservaResult se mantiene intacto
        });
        // Solo limpiar el carrito
        localStorage.removeItem("carrito:items:v1");
        // El store se persiste automáticamente con reservaResult intacto
      },

      // ===== ACCIONES DE DATOS =====
      updateReservaData: (data) =>
        set((state) => {
          const selectedZoneId =
            state.reservaZonaData?.selectedZoneId || "zona-1";
          const zona =
            RESERVA_ZONAS_CONFIG.find((item) => item.id === selectedZoneId) ||
            RESERVA_ZONAS_CONFIG[0];

          const newData = { ...state.reservaData, ...data };

          const totalOcupacion = getTotalOcupacion(newData);
          if (totalOcupacion > MAX_OCUPACION_TOTAL) {
            console.warn("⚠️ No se puede exceder 12 visitantes en total");
            return state; // No actualizar si excede el límite
          }

          // Validación: máximo 4 mascotas
          if ((newData.mascotas || 0) > MAX_MASCOTAS) {
            console.warn("⚠️ No se pueden agregar más de 4 mascotas");
            return state; // No actualizar si excede el límite
          }

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

      /** Guarda el objeto completo en localStorage y en estado */
      guardarDatos: (payload) => {
        try {
          const selectedZoneId =
            get().reservaZonaData?.selectedZoneId || "zona-1";
          const zona =
            RESERVA_ZONAS_CONFIG.find((item) => item.id === selectedZoneId) ||
            RESERVA_ZONAS_CONFIG[0];
          const nextPayload = { ...payload };

          // Validar límites antes de guardar
          const totalOcupacion = getTotalOcupacion(nextPayload);
          if (totalOcupacion > MAX_OCUPACION_TOTAL) {
            console.warn("⚠️ No se puede exceder 12 visitantes en total");
            return;
          }
          if ((nextPayload.mascotas || 0) > MAX_MASCOTAS) {
            console.warn("⚠️ No se pueden agregar más de 4 mascotas");
            return;
          }

          if (
            !zona?.permiteMascotas &&
            Number(nextPayload?.mascotas || 0) > 0
          ) {
            nextPayload.mascotas = 0;
          }

          const preferredMesaBase =
            get().reservaZonaData?.mesaSeleccionada?.optionId ||
            get().reservaZonaData?.mesaSeleccionada?.capacidadBase ||
            null;

          set({
            reservaData: nextPayload,
            reservaZonaData: buildZonaReservaData(
              nextPayload,
              selectedZoneId,
              preferredMesaBase
            ),
          });
        } catch (error) {
          console.error("Error guardando datos", error);
        }
      },

      // ===== RESET =====
      resetReserva: () =>
        set(() => {
          const nextReservaData = {
            ...DEFAULT_RESERVA_DATA,
            selectedDate: new Date().toISOString(),
          };

          return {
            currentStep: 0,
            completedSteps: [false, false, false, false],
            showResumen: false,
            showThankYou: false,
            isZonaExpanded: false,
            isDatosReservaCompletados: false,
            platosSeleccionados: {},
            reservaData: nextReservaData,
            detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
            reservaZonaData: buildZonaReservaData(nextReservaData, "zona-1"),
          };
        }),

      // ===== ENVÍO A FIRESTORE =====
      /**
       * Envía los datos a Firestore incluyendo productos del carrito
       * @param {Object} extras - Datos adicionales opcionales
       * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
       */
      enviarDatos: async (productos = {}) => {
        set({ isSending: true });
        const { reservaData, reservaZonaData } = get();

        if (!reservaData) {
          set({ isSending: false });
          return { ok: false, error: "No hay datos para enviar" };
        }

        // Obtener productos del carrito
        const cartItems = useCartStore.getState().cartItems;
        const productosFormateados = useCartStore.getState().getFormattedCart();

        // Formatear fecha
        const fecha = new Date(reservaData.selectedDate);
        const fechaFormateada = fecha.toLocaleDateString("es-CO", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        // Formatear hora a "HH:MM am/pm"
        const hour24 = parseInt(reservaData.hour);
        const minute = reservaData.minute;
        let hour12 = hour24;
        let period = "am";

        if (hour24 >= 12) {
          period = "pm";
          if (hour24 > 12) {
            hour12 = hour24 - 12;
          }
        }
        if (hour24 === 0) {
          hour12 = 12;
        }

        const horaFormateada = `${String(hour12).padStart(
          2,
          "0"
        )}:${minute} ${period}`;

        const numeroReserva = await obtenerSiguienteNumeroReserva();
        const numeroReservaFormateado = String(numeroReserva).padStart(4, "0");

        const payload = {
          "numero-de-reserva": numeroReservaFormateado,
          nombre: reservaData.name,
          email: reservaData.email,
          whatsapp: reservaData.whatsapp,
          fecha: fechaFormateada,
          hora: horaFormateada,
          adultos: reservaData.adults,
          ninos: reservaData.children,
          mascotas: reservaData.mascotas,
          zonaId: reservaZonaData?.selectedZoneId || null,
          zonaNombre:
            reservaZonaData?.zonas?.find(
              (zona) => zona.id === reservaZonaData?.selectedZoneId
            )?.nombre || null,
          mesaOptionId: reservaZonaData?.mesaSeleccionada?.optionId || null,
          mesaBase: reservaZonaData?.mesaSeleccionada?.capacidadBase || null,
          mesasUnidas: reservaZonaData?.mesaSeleccionada?.mesasUnidas || null,
          capacidadMesa:
            reservaZonaData?.mesaSeleccionada?.capacidadTotal || null,
          productos: productosFormateados,
          cantidadProductos: cartItems.length,
          totalProductos: useCartStore.getState().getCartItemsCount(),
          montoTotal: useCartStore.getState().getCartTotal(),

          estado: "confirmada",
          fechaCreacion: new Date().toISOString(),
        };

        try {
          const res = await guardarReservaEnFirestore(payload);
          if (!res.ok) throw new Error(res.error);

          // Guardar el resultado completo con id de Firestore y todos los datos
          const resultado = {
            firestoreId: res.id,
            ...payload,
          };

          set({
            reservaResult: resultado,
            isDatosReservaCompletados: false,
            isSending: false,
          });

          return { ok: true, id: res.id, data: payload };
        } catch (error) {
          set({ isSending: false, reservaResult: {} });
          console.error("❌ Error enviando reserva:", error);
          return { ok: false, error: error.message || "Error desconocido" };
        }
      },

      /**
       * Validar que hay productos antes de procesar
       */
      validarCarrito: () => {
        const cartItems = useCartStore.getState().cartItems;
        if (!cartItems || cartItems.length === 0) {
          return { valid: false, error: "El carrito está vacío" };
        }
        return { valid: true };
      },

      /** Limpia el localStorage manualmente */
      limpiarStorage: () => {
        try {
          const nextReservaData = {
            ...DEFAULT_RESERVA_DATA,
            selectedDate: new Date().toISOString(),
          };

          set({
            reservaData: nextReservaData,
            isDatosReservaCompletados: false,
            detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
            reservaZonaData: buildZonaReservaData(nextReservaData, "zona-1"),
          });
        } catch (_) {}
      },

      /** Limpia completamente todo incluyendo reservaResult */
      limpiarTodo: () => {
        const nextReservaData = {
          ...DEFAULT_RESERVA_DATA,
          selectedDate: new Date().toISOString(),
        };

        set({
          showThankYou: false,
          isBookingOpen: false,
          currentStep: 0,
          completedSteps: [false, false, false, false],
          showResumen: false,
          isZonaExpanded: false,
          isDatosReservaCompletados: false,
          reservaData: nextReservaData,
          detalleAsistentes: EMPTY_DETALLE_ASISTENTES,
          reservaZonaData: buildZonaReservaData(nextReservaData, "zona-1"),
          reservaResult: {}, // Limpiar también el resultado
        });
        localStorage.removeItem("reserva:state:v1");
        localStorage.removeItem("carrito:items:v1");
      },
    }),
    {
      name: STORAGE_KEY,
      version: 0,
    }
  )
);

export default useReservaStore;
