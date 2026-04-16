import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { app, db } from "./config";

const storage = getStorage(app);

const normalizeReservaAdminDoc = (id, data = {}) => {
  const detalles = data?.detalles || {};
  const detallesPago = data?.detallesPago || {};

  const contacto = {
    nombre: data?.contacto?.nombre || data?.nombre || data?.name || "",
    email: data?.contacto?.email || data?.email || "",
    whatsapp: data?.contacto?.whatsapp || data?.whatsapp || "",
    observaciones:
      data?.contacto?.observaciones || data?.observaciones || "",
  };

  const reserva = {
    numeroReserva: detalles?.numeroReserva || data?.["numero-de-reserva"] || "",
    region:
      detalles?.region ||
      data?.reserva?.region ||
      data?.region ||
      data?.selectedZoneName ||
      "",
    zonaId: detalles?.zonaId || data?.reserva?.zonaId || data?.selectedZoneId || null,
    mesa:
      detalles?.numeroMesa ??
      data?.reserva?.mesa ??
      data?.mesa ??
      data?.mesaAsignada ??
      null,
    fechaISO: detalles?.fechaISO || data?.reserva?.fechaISO || data?.selectedDate || null,
    fecha: detalles?.fecha || data?.reserva?.fecha || data?.fecha || data?.date || "",
    hora: detalles?.hora || data?.reserva?.hora || data?.hora || "",
    servicio: detalles?.servicio || data?.reserva?.servicio || data?.servicio || "",
    estado: detalles?.estado || data?.reserva?.estado || data?.estado || "",
  };

  const asistentes = {
    adultos:
      data?.asistentes?.resumen?.adultos ??
      data?.asistentes?.adultos ??
      data?.adultos ??
      data?.adults ??
      0,
    ninos:
      data?.asistentes?.resumen?.ninos ??
      data?.asistentes?.ninos ??
      data?.ninos ??
      data?.children ??
      data?.niños ??
      0,
    mascotas:
      data?.asistentes?.resumen?.mascotas ??
      data?.asistentes?.mascotas ??
      data?.mascotas ??
      0,
    total:
      data?.asistentes?.resumen?.total ??
      data?.asistentes?.total ??
      ((data?.asistentes?.resumen?.adultos ??
        data?.asistentes?.adultos ??
        data?.adultos ??
        data?.adults ??
        0) +
        (data?.asistentes?.resumen?.ninos ??
          data?.asistentes?.ninos ??
          data?.ninos ??
          data?.children ??
          data?.niños ??
          0) +
        (data?.asistentes?.resumen?.mascotas ??
          data?.asistentes?.mascotas ??
          data?.mascotas ??
          0)),
    detalle:
      data?.asistentes?.quienesVan ||
      data?.asistentes?.detalle ||
      data?.productos?.detalleAsistentes ||
      [],
    totalPlatos:
      data?.asistentes?.totalPlatos ??
      data?.productos?.totalProductos ??
      data?.totalProductos ??
      0,
  };

  const checkout = {
    subtotal: detallesPago?.subtotal ?? data?.checkout?.subtotal ?? 0,
    impuestos: detallesPago?.impuestos ?? data?.checkout?.impuestos ?? 0,
    total:
      detallesPago?.montoTotal ??
      detallesPago?.total ??
      data?.checkout?.total ??
      data?.montoTotal ??
      0,
    currency: detallesPago?.currency || data?.checkout?.currency || "COP",
    estado: detallesPago?.estado || data?.checkout?.estado || "",
  };

  const transaccion = {
    id: detallesPago?.id || data?.transaccion?.id || "",
    referencia: detallesPago?.referencia || data?.transaccion?.referencia || "",
    estado: detallesPago?.estadoTransaccion || data?.transaccion?.estado || "",
    pasarela:
      detallesPago?.estadoPasarela ||
      data?.transaccion?.pasarela ||
      data?.pasarela?.estado ||
      "",
  };

  const productos = {
    totalProductos:
      data?.asistentes?.totalPlatos ??
      data?.productos?.totalProductos ??
      data?.totalProductos ??
      0,
    montoTotal:
      detallesPago?.montoTotal ??
      data?.productos?.montoTotal ??
      data?.montoTotal ??
      0,
    detalleAsistentes:
      data?.asistentes?.quienesVan || data?.productos?.detalleAsistentes || [],
  };

  const metadata = {
    origen: data?.metadata?.origen || "",
    versionPayload: data?.metadata?.versionPayload || "",
  };

  return {
    id,
    ...data,
    contacto,
    reserva,
    asistentes,
    checkout,
    transaccion,
    productos,
    metadata,

    // Compatibilidad para la UI actual/admin.
    nombre: contacto.nombre,
    email: contacto.email,
    whatsapp: contacto.whatsapp,
    observaciones: contacto.observaciones,
    region: reserva.region,
    mesa: reserva.mesa,
    fecha: reserva.fecha,
    hora: reserva.hora,
    estado: reserva.estado,
    servicio: reserva.servicio,
    adultos: asistentes.adultos,
    ninos: asistentes.ninos,
    mascotas: asistentes.mascotas,
    totalAsistentes: asistentes.total,
    numeroReserva: reserva.numeroReserva,
  };
};

const buildReservaAdminUpdatePayload = (datos = {}) => {
  const payload = { ...datos };

  if (datos.detalles || datos.detallesPago) {
    return payload;
  }

  if (datos.contacto) {
    payload.nombre = datos.contacto.nombre ?? payload.nombre;
    payload.email = datos.contacto.email ?? payload.email;
    payload.whatsapp = datos.contacto.whatsapp ?? payload.whatsapp;
    payload.observaciones =
      datos.contacto.observaciones ?? payload.observaciones;
  }

  if (datos.reserva) {
    payload.region = datos.reserva.region ?? payload.region;
    payload.mesa = datos.reserva.mesa ?? payload.mesa;
    payload.fecha = datos.reserva.fecha ?? payload.fecha;
    payload.hora = datos.reserva.hora ?? payload.hora;
    payload.servicio = datos.reserva.servicio ?? payload.servicio;
    payload.estado = datos.reserva.estado ?? payload.estado;

    if (datos.reserva.numeroReserva !== undefined) {
      payload["numero-de-reserva"] = datos.reserva.numeroReserva;
    }
  }

  if (datos.asistentes) {
    payload.adultos = datos.asistentes.adultos ?? payload.adultos;
    payload.ninos = datos.asistentes.ninos ?? payload.ninos;
    payload.mascotas = datos.asistentes.mascotas ?? payload.mascotas;
  }

  if (datos.checkout) {
    payload.montoTotal = datos.checkout.total ?? payload.montoTotal;
  }

  return payload;
};

// ===== CATEGORÍAS (colecciones de productos) =====

const CATEGORIAS = [
  "bebidas",
  "desayunos",
  "entradas",
  "platos_fuertes",
  "postres",
];

/**
 * Obtener la lista de categorías disponibles
 */
export const obtenerCategorias = () => CATEGORIAS;

/**
 * Obtener todas las subcategorías de una categoría
 */
export const obtenerSubcategorias = async (categoria) => {
  try {
    const categoriaRef = collection(db, categoria);
    const snapshot = await getDocs(categoriaRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error obteniendo subcategorías de ${categoria}:`, error);
    throw error;
  }
};

/**
 * Crear una nueva subcategoría (documento vacío en la colección)
 */
export const crearSubcategoria = async (categoria, nombreSubcategoria) => {
  try {
    const subcategoriaRef = doc(db, categoria, nombreSubcategoria);
    await setDoc(subcategoriaRef, {});
    return { ok: true, id: nombreSubcategoria };
  } catch (error) {
    console.error("Error creando subcategoría:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Eliminar subcategoría completa (documento)
 */
export const eliminarSubcategoria = async (categoria, nombreSubcategoria) => {
  try {
    const subcategoriaRef = doc(db, categoria, nombreSubcategoria);
    await deleteDoc(subcategoriaRef);
    return { ok: true };
  } catch (error) {
    console.error("Error eliminando subcategoría:", error);
    return { ok: false, error: error.message };
  }
};

// ===== PRODUCTOS =====

/**
 * Obtener todos los productos de una subcategoría
 */
export const obtenerProductos = async (categoria, subcategoria) => {
  try {
    const subcategoriaRef = doc(db, categoria, subcategoria);
    const snap = await getDoc(subcategoriaRef);

    if (!snap.exists()) return [];

    const data = snap.data();
    return Object.entries(data).map(([id, producto]) => ({
      id,
      ...producto,
    }));
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    throw error;
  }
};

/**
 * Crear o actualizar un producto dentro de una subcategoría
 * Soporta campos dinámicos (custom fields)
 */
export const guardarProducto = async (
  categoria,
  subcategoria,
  productoId,
  datosProducto
) => {
  try {
    const subcategoriaRef = doc(db, categoria, subcategoria);
    // Construir objeto con todos los campos (fijos + custom)
    const productoData = {};
    Object.entries(datosProducto).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        productoData[key] = value;
      }
    });
    // Asegurar campos mínimos
    if (!productoData.nombre) productoData.nombre = productoId;
    if (!productoData.img) productoData.img = "/imagenes/default.jpg";

    await updateDoc(subcategoriaRef, {
      [productoId]: productoData,
    });
    return { ok: true, id: productoId };
  } catch (error) {
    // Si el doc no existe, crear con setDoc
    if (error.code === "not-found") {
      try {
        const subcategoriaRef = doc(db, categoria, subcategoria);
        const productoData = {};
        Object.entries(datosProducto).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            productoData[key] = value;
          }
        });
        if (!productoData.nombre) productoData.nombre = productoId;
        if (!productoData.img) productoData.img = "/imagenes/default.jpg";

        await setDoc(subcategoriaRef, {
          [productoId]: productoData,
        });
        return { ok: true, id: productoId };
      } catch (innerError) {
        console.error("Error creando producto:", innerError);
        return { ok: false, error: innerError.message };
      }
    }
    console.error("Error guardando producto:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Eliminar un producto de una subcategoría
 */
export const eliminarProducto = async (
  categoria,
  subcategoria,
  productoId
) => {
  try {
    const subcategoriaRef = doc(db, categoria, subcategoria);
    await updateDoc(subcategoriaRef, {
      [productoId]: deleteField(),
    });
    return { ok: true };
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return { ok: false, error: error.message };
  }
};

// ===== RESERVAS =====

/**
 * Obtener todas las reservas
 */
export const obtenerReservas = async () => {
  try {
    const reservasRef = collection(db, "reservas");
    const snapshot = await getDocs(reservasRef);
    return snapshot.docs.map((doc) => ({
      ...normalizeReservaAdminDoc(doc.id, doc.data()),
    }));
  } catch (error) {
    console.error("Error obteniendo reservas:", error);
    throw error;
  }
};

/**
 * Obtener una reserva por ID
 */
export const obtenerReservaPorId = async (reservaId) => {
  try {
    const reservaRef = doc(db, "reservas", reservaId);
    const snap = await getDoc(reservaRef);
    if (!snap.exists()) return null;
    return normalizeReservaAdminDoc(snap.id, snap.data());
  } catch (error) {
    console.error("Error obteniendo reserva:", error);
    throw error;
  }
};

/**
 * Actualizar campos de una reserva
 */
export const actualizarReserva = async (reservaId, datos) => {
  try {
    const reservaRef = doc(db, "reservas", reservaId);
    const payload = buildReservaAdminUpdatePayload(datos);
    await updateDoc(reservaRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    console.error("Error actualizando reserva:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Eliminar una reserva
 */
export const eliminarReserva = async (reservaId) => {
  try {
    const reservaRef = doc(db, "reservas", reservaId);
    await deleteDoc(reservaRef);
    return { ok: true };
  } catch (error) {
    console.error("Error eliminando reserva:", error);
    return { ok: false, error: error.message };
  }
};

// ===== CONFIGURACIÓN =====

/**
 * Obtener documentos de configuración
 */
export const obtenerConfiguracion = async () => {
  try {
    const configRef = collection(db, "configuracion");
    const snapshot = await getDocs(configRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error obteniendo configuración:", error);
    throw error;
  }
};

/**
 * Actualizar un documento de configuración
 */
export const actualizarConfiguracion = async (docId, datos) => {
  try {
    const configRef = doc(db, "configuracion", docId);
    await setDoc(configRef, datos, { merge: true });
    return { ok: true };
  } catch (error) {
    console.error("Error actualizando configuración:", error);
    return { ok: false, error: error.message };
  }
};

// ===== FIREBASE STORAGE =====

/**
 * Subir una imagen a Firebase Storage
 */
export const subirImagen = async (file, path = "productos") => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { ok: true, url, path: `${path}/${fileName}` };
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Listar imágenes en una carpeta de Storage
 */
export const listarImagenes = async (path = "productos") => {
  try {
    const listRef = ref(storage, path);
    const result = await listAll(listRef);
    const items = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url,
        };
      })
    );
    return items;
  } catch (error) {
    console.error("Error listando imágenes:", error);
    return [];
  }
};

/**
 * Eliminar una imagen de Storage
 */
export const eliminarImagen = async (fullPath) => {
  try {
    const imageRef = ref(storage, fullPath);
    await deleteObject(imageRef);
    return { ok: true };
  } catch (error) {
    console.error("Error eliminando imagen:", error);
    return { ok: false, error: error.message };
  }
};
