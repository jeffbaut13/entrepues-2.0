import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";
import {
  guardarReservaEnFirestore,
  obtenerSiguienteNumeroReserva,
} from "./firestore";

const CATEGORIAS = [
  "desayunos",
  "entradas",
  "platos_fuertes",
  "bebidas",
  "postres",
];

export const NOMBRES_CATEGORIAS_PERSONALIZADOS = {
  platos_fuertes: "Almuerzos",
  entradas: "Pa'picar",
};

const normalizarTexto = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

const formatearNombreCategoria = (categoria = "") =>
  String(categoria)
    .split("_")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");

export const normalizarClaveCatalogo = normalizarTexto;

export const resolverCategoriaKey = (categoria = "") => {
  const categoriaNormalizada = normalizarClaveCatalogo(categoria);

  if (!categoriaNormalizada) return "";
  if (CATEGORIAS.includes(categoriaNormalizada)) return categoriaNormalizada;

  const entradaPorNombrePersonalizado = Object.entries(
    NOMBRES_CATEGORIAS_PERSONALIZADOS
  ).find(
    ([, nombrePersonalizado]) =>
      normalizarClaveCatalogo(nombrePersonalizado) === categoriaNormalizada
  );

  if (entradaPorNombrePersonalizado) {
    return entradaPorNombrePersonalizado[0];
  }

  return categoriaNormalizada;
};

export const obtenerNombreCategoriaDisplay = (categoria) => {
  const categoriaKey = resolverCategoriaKey(categoria);
  if (!categoriaKey) return "";

  return (
    NOMBRES_CATEGORIAS_PERSONALIZADOS[categoriaKey] ||
    formatearNombreCategoria(categoriaKey)
  );
};

const parsearPrecio = (precio) => {
  if (typeof precio === "number") return precio;

  const valor = Number(String(precio ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(valor) ? valor : 0;
};

const obtenerCategoriasOrdenadas = (estructuraCategorias = {}) => {
  const disponibles = Object.keys(estructuraCategorias);

  const prioritarias = CATEGORIAS.filter((catEsperada) =>
    disponibles.some(
      (catReal) =>
        normalizarClaveCatalogo(catReal) ===
        normalizarClaveCatalogo(catEsperada)
    )
  ).map((catEsperada) =>
    disponibles.find(
      (catReal) =>
        normalizarClaveCatalogo(catReal) ===
        normalizarClaveCatalogo(catEsperada)
    )
  );

  const extras = disponibles.filter(
    (catReal) =>
      !prioritarias.some(
        (catOrdenada) =>
          normalizarClaveCatalogo(catOrdenada) ===
          normalizarClaveCatalogo(catReal)
      )
  );

  return [...prioritarias.filter(Boolean), ...extras];
};

/**
 * Parsear productos desde un documento
 * @private
 */
const parsearProductos = (subcategoriaData, nombreSubcategoria) => {
  const productos = [];

  Object.entries(subcategoriaData).forEach(
    ([nombreProducto, datosProducto]) => {
      if (
        datosProducto &&
        typeof datosProducto === "object" &&
        datosProducto.precio
      ) {
        productos.push({
          id: nombreProducto,
          nombre: datosProducto.nombre || nombreProducto,
          precio: datosProducto.precio,
          descripcion: datosProducto.descripcion || "",
          img: datosProducto.img || "/imagenes/default.jpg",
          subcategoria: nombreSubcategoria,
        });
      }
    }
  );

  return productos;
};

/**
 * Normalizar el catálogo completo para consumo reutilizable en UI
 * @param {Object} estructuraCategorias
 * @returns {Object}
 */
export const normalizarCatalogo = (estructuraCategorias = {}) => {
  const categorias = [];
  const subcategorias = [];
  const productos = [];

  const indices = {
    categoriasByKey: {},
    subcategoriasById: {},
    subcategoriasByKey: {},
    productos: {
      byId: {},
      byCompositeId: {},
      byOriginalId: {},
      byNombre: {},
    },
  };

  const categoriasOrdenadas = obtenerCategoriasOrdenadas(estructuraCategorias);

  categoriasOrdenadas.forEach((nombreCategoriaOriginal) => {
    const categoriaData = estructuraCategorias[nombreCategoriaOriginal] || {};
    const categoriaKey = normalizarClaveCatalogo(nombreCategoriaOriginal);
    const categoriaNombre = categoriaData?.nombre || nombreCategoriaOriginal;

    const subcategoriasNormalizadas = [];
    const productosCategoria = [];

    const subcategoriasData = categoriaData?.subcategorias || {};

    Object.entries(subcategoriasData).forEach(
      ([nombreSubcategoria, subData]) => {
        const subcategoriaKey = normalizarClaveCatalogo(nombreSubcategoria);

        const productosNormalizados = (subData?.productos || []).map(
          (producto, index) => {
            const originalId = String(
              producto?.id ?? `${subcategoriaKey}_${index + 1}`
            );
            const productoId = `${categoriaKey}__${subcategoriaKey}__${originalId}__${index}`;
            const productoNombre = producto?.nombre || originalId;

            const productoNormalizado = {
              ...producto,
              id: productoId,
              originalId,
              nombre: productoNombre,
              descripcion: producto?.descripcion || "",
              precio: parsearPrecio(producto?.precio),
              img: producto?.img || "/imagenes/default.jpg",
              categoria: categoriaKey,
              categoriaNombre,
              subcategoria: subcategoriaKey,
              subcategoriaNombre: nombreSubcategoria,
            };

            const nombreNormalizado = normalizarClaveCatalogo(productoNombre);

            indices.productos.byId[productoId] = productoNormalizado;
            indices.productos.byCompositeId[productoId] = productoNormalizado;
            if (!indices.productos.byOriginalId[originalId]) {
              indices.productos.byOriginalId[originalId] = productoNormalizado;
            }
            if (
              nombreNormalizado &&
              !indices.productos.byNombre[nombreNormalizado]
            ) {
              indices.productos.byNombre[nombreNormalizado] =
                productoNormalizado;
            }

            productos.push(productoNormalizado);
            productosCategoria.push(productoNormalizado);

            return productoNormalizado;
          }
        );

        const subcategoriaNormalizada = {
          id: `${categoriaKey}__${subcategoriaKey}`,
          key: subcategoriaKey,
          nombre: nombreSubcategoria,
          categoria: categoriaKey,
          categoriaNombre,
          productos: productosNormalizados,
        };

        indices.subcategoriasById[subcategoriaNormalizada.id] =
          subcategoriaNormalizada;
        if (!indices.subcategoriasByKey[categoriaKey]) {
          indices.subcategoriasByKey[categoriaKey] = {};
        }
        indices.subcategoriasByKey[categoriaKey][subcategoriaKey] =
          subcategoriaNormalizada;

        subcategorias.push(subcategoriaNormalizada);
        subcategoriasNormalizadas.push(subcategoriaNormalizada);
      }
    );

    const categoriaNormalizada = {
      id: categoriaKey,
      key: categoriaKey,
      nombre: categoriaNombre,
      subcategorias: subcategoriasNormalizadas,
      productos: productosCategoria,
      totalSubcategorias: subcategoriasNormalizadas.length,
      totalProductos: productosCategoria.length,
    };

    indices.categoriasByKey[categoriaKey] = categoriaNormalizada;
    categorias.push(categoriaNormalizada);
  });

  return {
    categorias,
    subcategorias,
    productos,
    indices,
  };
};

/**
 * Obtener catálogo completo ya normalizado para cualquier componente
 */
export const obtenerCatalogoNormalizado = async () => {
  const estructura = await obtenerTodasLasCategorias();
  return normalizarCatalogo(estructura);
};

export const obtenerCategoriasCatalogo = (catalogo) =>
  (catalogo?.categorias || []).map((categoria) => {
    const key = resolverCategoriaKey(categoria?.key || categoria?.id || "");
    const displayName = obtenerNombreCategoriaDisplay(key);

    return {
      ...categoria,
      id: key || categoria?.id,
      key: key || categoria?.key,
      nombre: displayName,
      displayName,
      serializedName: normalizarClaveCatalogo(displayName),
    };
  });

export const obtenerCategoriasDisplayCatalogo = (catalogo) =>
  obtenerCategoriasCatalogo(catalogo).map((categoria) =>
    obtenerNombreCategoriaDisplay(categoria.key)
  );

export const obtenerCategoriasConDisplay = async () => {
  const catalogo = await obtenerCatalogoNormalizado();

  return obtenerCategoriasDisplayCatalogo(catalogo);
};

const formatearNombreSubcategoria = (nombre = "") =>
  String(nombre)
    .split("_")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");

export const obtenerSubcategoriasStringCatalogo = (catalogo, filtros = {}) =>
  obtenerSubcategoriasCatalogo(catalogo, filtros).map((subcategoria) =>
    formatearNombreSubcategoria(subcategoria.nombre || subcategoria.key)
  );

export const obtenerSubcategoriasConDisplay = async (categoria) => {
  const catalogo = await obtenerCatalogoNormalizado();

  return obtenerSubcategoriasStringCatalogo(
    catalogo,
    categoria ? { categoria } : {}
  );
};

export const obtenerSubcategoriasCatalogo = (catalogo, filtros = {}) => {
  const categoriaFiltro = filtros?.categoria
    ? resolverCategoriaKey(filtros.categoria)
    : null;

  const lista = catalogo?.subcategorias || [];

  if (!categoriaFiltro) return lista;
  return lista.filter((item) => item.categoria === categoriaFiltro);
};

export const obtenerProductosCatalogo = (catalogo, filtros = {}) => {
  const categoriaFiltro = filtros?.categoria
    ? normalizarClaveCatalogo(filtros.categoria)
    : null;
  const subcategoriaFiltro = filtros?.subcategoria
    ? normalizarClaveCatalogo(filtros.subcategoria)
    : null;

  return (catalogo?.productos || []).filter((producto) => {
    if (categoriaFiltro && producto.categoria !== categoriaFiltro) return false;
    if (subcategoriaFiltro && producto.subcategoria !== subcategoriaFiltro) {
      return false;
    }
    return true;
  });
};

export const obtenerSubcategoriasConProductos = (catalogo, categoria) => {
  return obtenerSubcategoriasCatalogo(catalogo, { categoria })
    .filter((subcategoria) => (subcategoria?.productos || []).length > 0)
    .map((subcategoria) => ({
      nombre: subcategoria.nombre,
      key: subcategoria.key,
      categoria: subcategoria.categoria,
      productos: subcategoria.productos,
    }));
};

export const existeCategoriaCatalogo = (catalogo, categoria) => {
  const categoriaKey = resolverCategoriaKey(categoria);
  return Boolean(catalogo?.indices?.categoriasByKey?.[categoriaKey]);
};

export const existeSubcategoriaCatalogo = (
  catalogo,
  subcategoria,
  categoria
) => {
  const subcategoriaKey = normalizarClaveCatalogo(subcategoria);

  if (categoria) {
    const categoriaKey = resolverCategoriaKey(categoria);
    return Boolean(
      catalogo?.indices?.subcategoriasByKey?.[categoriaKey]?.[subcategoriaKey]
    );
  }

  const lista = catalogo?.subcategorias || [];
  return lista.some((item) => item.key === subcategoriaKey);
};

/**
 * Obtener todas las categorías con subcategorías y productos
 * @returns {Promise<Object>} Estructura: {categoria: {nombre, subcategorias: {subcategoria: {nombre, productos}}}}
 */
export const obtenerTodasLasCategorias = async () => {
  try {
    const estructuraCategorias = {};

    for (const nombreCategoria of CATEGORIAS) {
      const categoriaRef = collection(db, nombreCategoria);
      const subcategoriasSnapshot = await getDocs(categoriaRef);

      const subcategorias = {};

      for (const subcategoriaDoc of subcategoriasSnapshot.docs) {
        const nombreSubcategoria = subcategoriaDoc.id;
        const productos = parsearProductos(
          subcategoriaDoc.data(),
          nombreSubcategoria
        );

        subcategorias[nombreSubcategoria] = {
          nombre: nombreSubcategoria,
          productos: productos,
        };
      }

      estructuraCategorias[nombreCategoria] = {
        nombre: nombreCategoria,
        subcategorias: subcategorias,
      };
    }

    return estructuraCategorias;
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    throw error;
  }
};

/**
 * Crear una reserva completa desde checkout en estado pending
 * La pasarela de pago puede estar deshabilitada (modo temporal)
 * @param {Object} params
 * @param {Object} params.datosReserva - Datos temporales guardados desde selección
 * @param {Object} params.datosContacto - Datos ingresados en checkout
 * @param {string} params.metodoPago - Método seleccionado por usuario
 * @param {number} params.montoTotal - Subtotal
 * @param {number} params.impuestos - Impuestos calculados
 * @param {number} params.montoFinal - Total final
 * @param {Object} params.transaccion - Referencia transaccional local
 * @returns {Promise<{ok: boolean, id?: string, data?: Object, error?: string}>}
 */
export const crearReservaPendienteDesdeCheckout = async ({
  datosReserva,
  datosContacto,
  metodoPago,
  montoTotal,
  impuestos,
  montoFinal,
  transaccion,
}) => {
  try {
    if (!datosReserva?.reservaData) {
      return { ok: false, error: "No hay datos de reserva para guardar" };
    }

    const reservaData = datosReserva.reservaData;
    const detalleAsistentes = Array.isArray(datosReserva.platosSeleccionados)
      ? datosReserva.platosSeleccionados
      : [];

    const adultos = Number(reservaData.adults || 0);
    const ninos = Number(reservaData.children || 0);
    const mascotas = Number(reservaData.mascotas || 0);

    const fechaObj = new Date(reservaData.selectedDate);
    const fechaFormateada = fechaObj.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const hour24 = parseInt(reservaData.hour, 10);
    const minute = String(reservaData.minute || "00").padStart(2, "0");
    const period = hour24 >= 12 ? "pm" : "am";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const horaFormateada = `${String(hour12).padStart(
      2,
      "0"
    )}:${minute} ${period}`;

    const totalProductos = detalleAsistentes.reduce((sum, asistente) => {
      const totalPlatosAsistente = Number(asistente?.totalPlatos || 0);
      if (totalPlatosAsistente > 0) return sum + totalPlatosAsistente;

      return (
        sum +
        (Array.isArray(asistente?.platos)
          ? asistente.platos.reduce(
              (acc, plato) => acc + Number(plato?.cantidad || 1),
              0
            )
          : 0)
      );
    }, 0);

    const numeroReserva = await obtenerSiguienteNumeroReserva();
    const numeroReservaFormateado = String(numeroReserva).padStart(4, "0");
    const ahora = new Date().toISOString();

    const payload = {
      "numero-de-reserva": numeroReservaFormateado,
      nombre: datosContacto?.nombre || reservaData.name || "",
      email: datosContacto?.email || reservaData.email || "",
      whatsapp: datosContacto?.whatsapp || reservaData.whatsapp || "",
      fecha: fechaFormateada,
      hora: horaFormateada,
      adultos,
      ninos,
      mascotas,
      estado: "pending",
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
      servicio: "checkout_onepage",
      observaciones: datosContacto?.notas || "",
      metodoPago: metodoPago || "tarjeta",
      pasarela: {
        habilitada: false,
        proveedor: null,
        estado: "disabled",
      },
      checkout: {
        subtotal: Number(montoTotal || 0),
        impuestos: Number(impuestos || 0),
        total: Number(montoFinal || 0),
        currency: "COP",
      },
      transaccion: {
        id: transaccion?.id || `TXN-${Date.now()}`,
        referencia: transaccion?.referencia || `REF-${Date.now()}`,
        estado: "pending",
        pasarela: "disabled",
      },
      productos: {
        totalProductos,
        montoTotal: Number(montoFinal || 0),
        detalleAsistentes,
      },
      cantidadProductos: totalProductos,
      totalProductos,
      montoTotal: Number(montoFinal || 0),
    };

    const res = await guardarReservaEnFirestore(payload);

    if (!res.ok) {
      return { ok: false, error: res.error || "No se pudo guardar la reserva" };
    }

    return {
      ok: true,
      id: res.id,
      data: payload,
    };
  } catch (error) {
    console.error("❌ Error creando reserva pending desde checkout:", error);
    return {
      ok: false,
      error: error?.message || "Error guardando reserva desde checkout",
    };
  }
};
