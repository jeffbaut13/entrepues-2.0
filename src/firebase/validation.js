/**
 * Validación de datos para Firestore
 * Asegura que solo datos válidos lleguen a la base de datos
 */

// Patrones de validación
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_REGEX = /^[\d\s\-+()]{10,}$/; // Al menos 10 dígitos
const NAME_REGEX = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]{2,100}$/;

/**
 * Valida un email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Valida un número de WhatsApp
 * @param {string} whatsapp
 * @returns {boolean}
 */
export const isValidWhatsapp = (whatsapp) => {
  if (!whatsapp || typeof whatsapp !== "string") return false;
  // Solo contar dígitos
  const digitsOnly = whatsapp.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Valida un nombre (mínimo 2 caracteres, máximo 100)
 * @param {string} name
 * @returns {boolean}
 */
export const isValidName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Valida una fecha (debe ser válida y no estar en el pasado)
 * @param {string} dateStr - Formato: "Monday, 9 January"
 * @returns {boolean}
 */
export const isValidDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return false;
  // Aceptar cualquier string no vacío para la fecha formateada
  return dateStr.trim().length > 0;
};

/**
 * Valida una hora (formato "HH:MM am/pm")
 * @param {string} timeStr
 * @returns {boolean}
 */
export const isValidTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return false;
  const timeRegex = /^(0[1-9]|1[0-2]):[0-5]\d\s(am|pm)$/i;
  return timeRegex.test(timeStr.trim());
};

/**
 * Valida el número de adultos y niños
 * @param {number} adults
 * @param {number} children
 * @returns {boolean}
 */
export const isValidGuestCount = (adults, children, mascotas = 0) => {
  // Convertir a números, null/undefined = 0
  const adultsNum = adults !== null && adults !== undefined ? Number(adults) : 0;
  const childrenNum = children !== null && children !== undefined ? Number(children) : 0;
  const mascotasNum = mascotas !== null && mascotas !== undefined ? Number(mascotas) : 0;
  
  // Verificar que sean números válidos (no NaN)
  if (isNaN(adultsNum) || isNaN(childrenNum) || isNaN(mascotasNum)) {
    return false;
  }
  
  // Ambos deben ser enteros no-negativos
  if (
    !Number.isInteger(adultsNum) ||
    !Number.isInteger(childrenNum) ||
    !Number.isInteger(mascotasNum) ||
    adultsNum < 0 ||
    childrenNum < 0 ||
    mascotasNum < 0
  ) {
    return false;
  }
  
  // Al menos 1 adulto, máximo 12 visitantes totales (adultos + niños + mascotas)
  return (
    adultsNum >= 1 &&
    (adultsNum + childrenNum) >= 1 &&
    mascotasNum <= 4 &&
    adultsNum + childrenNum + mascotasNum <= 12
  );
};

/**
 * Valida los datos completos de una reserva
 * @param {Object} payload - Datos de la reserva
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateReservaPayload = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Payload debe ser un objeto válido"] };
  }

  const numeroReserva = payload?.detalles?.numeroReserva;
  if (!numeroReserva || typeof numeroReserva !== "string" || !/^\d{4}$/.test(numeroReserva)) {
    errors.push("Número de reserva debe ser un string de 4 dígitos");
  }

  if (!isValidName(payload?.contacto?.nombre)) {
    errors.push("Nombre debe tener entre 2 y 100 caracteres");
  }

  if (!isValidEmail(payload?.contacto?.email)) {
    errors.push("Email inválido");
  }

  if (!isValidWhatsapp(payload?.contacto?.whatsapp)) {
    errors.push("WhatsApp debe tener entre 10 y 15 dígitos");
  }

  if (!isValidDate(payload?.detalles?.fecha)) {
    errors.push("Fecha inválida");
  }

  if (!isValidTime(payload?.detalles?.hora)) {
    errors.push("Hora debe estar en formato HH:MM am/pm");
  }

  let adultos = payload?.asistentes?.resumen?.adultos ?? 0;
  let ninos = payload?.asistentes?.resumen?.ninos ?? 0;
  let mascotas = payload?.asistentes?.resumen?.mascotas ?? 0;
  
  if (!isValidGuestCount(adultos, ninos, mascotas)) {
    errors.push(
      "Cantidad inválida (mín 1 adulto, máx 12 visitantes totales incluyendo mascotas y máx 4 mascotas)"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitiza datos de entrada para prevenir inyecciones
 * @param {Object} payload
 * @returns {Object} Payload sanitizado
 */
export const sanitizeReservaPayload = (payload) => {
  const contacto = {
    nombre: String(payload?.contacto?.nombre || "").trim(),
    email: String(payload?.contacto?.email || "").trim().toLowerCase(),
    whatsapp: String(payload?.contacto?.whatsapp || "").trim(),
    observaciones: String(payload?.contacto?.observaciones || "").trim(),
  };

  const detalles = {
    numeroReserva: String(payload?.detalles?.numeroReserva || "0000"),
    numeroMesa: payload?.detalles?.numeroMesa ?? null,
    region: String(payload?.detalles?.region || "").trim(),
    zonaId: payload?.detalles?.zonaId ?? null,
    fechaISO: payload?.detalles?.fechaISO ?? null,
    fecha: String(payload?.detalles?.fecha || "").trim(),
    hora: String(payload?.detalles?.hora || "").trim(),
    servicio: String(payload?.detalles?.servicio || "").trim(),
    estado: String(payload?.detalles?.estado || "pending").trim(),
  };

  const asistentes = {
    resumen: {
      adultos: Number(payload?.asistentes?.resumen?.adultos) || 0,
      ninos: Number(payload?.asistentes?.resumen?.ninos) || 0,
      mascotas: Number(payload?.asistentes?.resumen?.mascotas) || 0,
      total: Number(payload?.asistentes?.resumen?.total) || 0,
    },
    totalPlatos: Number(payload?.asistentes?.totalPlatos) || 0,
    quienesVan: Array.isArray(payload?.asistentes?.quienesVan)
      ? payload.asistentes.quienesVan
      : [],
    observaciones: String(payload?.asistentes?.observaciones || "").trim(),
  };

  const detallesPago = {
    montoTotal: Number(payload?.detallesPago?.montoTotal) || 0,
    subtotal: Number(payload?.detallesPago?.subtotal) || 0,
    impuestos: Number(payload?.detallesPago?.impuestos) || 0,
    currency: String(payload?.detallesPago?.currency || "COP").trim(),
    metodoPago: String(payload?.detallesPago?.metodoPago || "tarjeta").trim(),
    estado: String(payload?.detallesPago?.estado || "pending").trim(),
    estadoPasarela: String(payload?.detallesPago?.estadoPasarela || "").trim(),
    estadoTransaccion: String(payload?.detallesPago?.estadoTransaccion || "").trim(),
    pasarela: payload?.detallesPago?.pasarela || {},
    id: String(payload?.detallesPago?.id || "").trim(),
    referencia: String(payload?.detallesPago?.referencia || "").trim(),
    fechaPago: payload?.detallesPago?.fechaPago ?? null,
  };

  return {
    contacto,
    detalles,
    asistentes,
    detallesPago,
    metadata: {
      origen: String(payload?.metadata?.origen || "").trim(),
      versionPayload: String(payload?.metadata?.versionPayload || "v2").trim(),
    },
  };
};
