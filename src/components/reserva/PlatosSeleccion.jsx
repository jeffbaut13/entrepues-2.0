import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BookCheck,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import {
  normalizarClaveCatalogo,
  obtenerCatalogoNormalizado,
  obtenerCategoriasCatalogo,
  obtenerProductosCatalogo,
} from "../../firebase/actions";
import useReservaStore from "../../store/reservaStore";
import useCheckoutStore from "../../store/checkoutStore";

import { capitalizeFirst } from "../../constants/firsLetterUppercase";
import { IncremenAndDecrementComponent } from "../common/IncrementAndDrecrement";
import { Button } from "../ui/Button";
import "swiper/css";
import "swiper/css/pagination";
import "./slider/styleVertical.css";

// ===========================
// FUNCIONES UTILITARIAS
// ===========================

/**
 * Generar JSON con los datos de la reserva
 */
const generarJSON = (firestoreId, platosSeleccionados, asistentes) => {
  return {
    firestoreId,
    fecha: new Date().toISOString(),
    platosSeleccionados: Object.entries(platosSeleccionados).map(
      ([asistenteIndex, platos]) => ({
        asistente: asistentes[asistenteIndex],
        asistenteIndex: parseInt(asistenteIndex),
        platos: platos.map((p) => ({
          id: p.originalId || p.id, // Usar el ID original para Firestore
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.cantidad,
          categoria: p.categoria,
          subcategoria: p.subcategoria,
          subtotal: p.precio * p.cantidad,
        })),
        totalPlatos: platos.reduce((sum, p) => sum + p.cantidad, 0),
        totalPrecio: platos.reduce((sum, p) => sum + p.precio * p.cantidad, 0),
      }),
    ),
  };
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

/**
 * Componente para la selección de platos por asistente
 */
export default function PlatosSeleccion({
  asistentes,
  firestoreId,
  onPagoSuccess,
  registerConfirmar,
}) {
  const MENU_INFANTIL_KEY = "menu_infantil";
  const MENU_MASCOTAS_KEY = "menu_mascotas";
  // ===========================
  // ESTADOS
  // ===========================
  const [asistenteActual, setAsistenteActual] = useState(0);
  const [platosSeleccionados, setPlatosSeleccionados] = useState({});
  const [categoriaActual, setCategoriActual] = useState("desayunos");
  const [catalogo, setCatalogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mobileDetalleOpen, setMobileDetalleOpen] = useState(false);
  const swiperRef = useRef(null);
  const hydratedRef = useRef(false);
  const checkoutTempIdRef = useRef(null);
  const previousAsistentesCountRef = useRef(null);
  const { prepararDatosCheckout } = useReservaStore();
  const {
    setShowResumen,
    pagoEnProceso,
    cargarDatosReservaDesdeResultado,
    iniciarPago,
    clearError,
  } = useCheckoutStore();

  const isMobile = useIsMobile();

  const asistentesLista = useMemo(() => {
    if (Array.isArray(asistentes)) return asistentes;

    if (asistentes && typeof asistentes === "object") {
      if (Array.isArray(asistentes.asistentes)) {
        return asistentes.asistentes;
      }

      const adultosCount = Number(asistentes.adultos || 0);
      const ninosCount = Number(asistentes.ninos || 0);
      const mascotasCount = Number(
        asistentes.mascotas || asistentes.mascota || asistentes.pets || 0,
      );

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

      return [...asistentesAdultos, ...asistentesNinos, ...asistentesMascotas];
    }

    return [];
  }, [asistentes]);

  const mensajePlatosUsuario =
    "Estarán 5 minutos después de que llegues a tu mesa";

  const buildPlatosPayload = (sourcePlatos) => {
    return asistentesLista.map((asistente, index) => ({
      asistente,
      asistenteIndex: index,
      platos: Array.isArray(sourcePlatos?.[index]) ? sourcePlatos[index] : [],
    }));
  };

  // ===========================
  // EFECTOS Y MEMOS
  // ===========================

  // Cargar datos de Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await obtenerCatalogoNormalizado();
        setCatalogo(data);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Obtener categorías ordenadas
  const categorias = useMemo(() => {
    return obtenerCategoriasCatalogo(catalogo).map((categoria) => ({
      key: categoria.key,
      displayName: categoria.displayName || categoria.nombre,
    }));
  }, [catalogo]);

  const claveAsistenteActual = normalizarClaveCatalogo(
    String(asistentesLista[asistenteActual] || ""),
  );
  const esAsistenteActualMascota =
    claveAsistenteActual.includes("mascota") ||
    claveAsistenteActual.includes("pet");
  const categoriasConMascotas = esAsistenteActualMascota
    ? [{ key: MENU_MASCOTAS_KEY, displayName: "menu mascotas" }]
    : categorias;

  useEffect(() => {
    if (categoriasConMascotas.length === 0) return;

    const existeCategoriaActual = categoriasConMascotas.some(
      (categoria) => categoria.key === categoriaActual,
    );

    if (!existeCategoriaActual) {
      setCategoriActual(categoriasConMascotas[0].key);
    }
  }, [categoriasConMascotas, categoriaActual]);

  //Listar los productos indexados para facilitar la rehidratación desde localStorage
  const productosIndexados = useMemo(() => {
    return (
      catalogo?.indices?.productos || {
        byOriginalId: {},
        byCompositeId: {},
        byNombre: {},
      }
    );
  }, [catalogo]);

  // Inicializar / rehidratar desde localStorage cuando ya hay catálogo y asistentes
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!asistentesLista.length || categorias.length === 0) return;

    const inicial = {};
    asistentesLista.forEach((_, index) => {
      inicial[index] = [];
    });

    try {
      const raw = localStorage.getItem("checkout:reserva:temp");
      if (!raw) {
        setPlatosSeleccionados(inicial);
        setAsistenteActual(0);
        hydratedRef.current = true;
        return;
      }

      const parsed = JSON.parse(raw);
      checkoutTempIdRef.current = parsed?.id || null;
      const guardados = Array.isArray(parsed?.platosSeleccionados)
        ? parsed.platosSeleccionados
        : [];

      const restaurados = { ...inicial };
      const indicesConDatos = [];

      guardados.forEach((asistenteData) => {
        const idx = Number(asistenteData?.asistenteIndex);
        if (Number.isNaN(idx) || idx < 0 || idx >= asistentesLista.length)
          return;

        const platos = Array.isArray(asistenteData?.platos)
          ? asistenteData.platos
          : [];

        const platosNormalizados = platos
          .map((platoGuardado, i) => {
            const fromOriginal =
              productosIndexados.byOriginalId[String(platoGuardado?.id)];
            const fromComposite =
              productosIndexados.byCompositeId[platoGuardado?.id];
            const fromNombre =
              productosIndexados.byNombre[
                normalizarClaveCatalogo(platoGuardado?.nombre)
              ];

            const base = fromOriginal || fromComposite || fromNombre;

            return {
              id:
                base?.id ||
                `restored__${idx}__${String(platoGuardado?.id || i)}__${i}`,
              originalId: base?.originalId || platoGuardado?.id,
              nombre: base?.nombre || platoGuardado?.nombre || "Plato",
              descripcion: base?.descripcion || "",
              precio: Number(base?.precio ?? platoGuardado?.precio ?? 0),
              categoria: base?.categoria || platoGuardado?.categoria || "",
              subcategoria:
                base?.subcategoria || platoGuardado?.subcategoria || "",
              img: base?.img || platoGuardado?.img || "",
              cantidad: Math.max(1, Number(platoGuardado?.cantidad || 1)),
            };
          })
          .filter((plato) => plato.nombre && !Number.isNaN(plato.precio));

        restaurados[idx] = platosNormalizados;
        if (platosNormalizados.length > 0) {
          indicesConDatos.push(idx);
        }
      });

      setPlatosSeleccionados(restaurados);

      if (indicesConDatos.length > 0) {
        const ordenados = [...new Set(indicesConDatos)].sort((a, b) => a - b);
        const ultimoConDatos = ordenados[ordenados.length - 1];
        setAsistenteActual(Math.max(0, ultimoConDatos));
      } else {
        setAsistenteActual(0);
      }
    } catch (error) {
      console.error("Error rehidratando platos desde localStorage:", error);
      setPlatosSeleccionados(inicial);
      setAsistenteActual(0);
    } finally {
      hydratedRef.current = true;
      previousAsistentesCountRef.current = asistentesLista.length;
    }
  }, [asistentesLista, categorias.length, productosIndexados]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const previousCount = previousAsistentesCountRef.current;
    const currentCount = asistentesLista.length;

    if (previousCount === null) {
      previousAsistentesCountRef.current = currentCount;
      return;
    }

    if (previousCount !== currentCount) {
      const emptyByAsistente = {};
      asistentesLista.forEach((_, index) => {
        emptyByAsistente[index] = [];
      });

      setPlatosSeleccionados(emptyByAsistente);
      setAsistenteActual(0);
      previousAsistentesCountRef.current = currentCount;
      return;
    }

    previousAsistentesCountRef.current = currentCount;
  }, [asistentesLista.length, asistentesLista]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    try {
      prepararDatosCheckout(buildPlatosPayload(platosSeleccionados));
    } catch (error) {
      console.error("Error persistiendo platos temporalmente:", error);
    }
  }, [platosSeleccionados, asistentesLista, prepararDatosCheckout]);

  // ===========================
  // FUNCIONES DE UTILIDAD DEL COMPONENTE
  // ===========================

  // Obtener productos por categoría específica
  const getProductosPorCategoria = (categoriaKey) => {
    return obtenerProductosCatalogo(catalogo, { categoria: categoriaKey });
  };

  const esPlatoSeleccionado = (platoId) => {
    return (platosSeleccionados[asistenteActual] || []).some(
      (p) => p.id === platoId,
    );
  };

  const obtenerCantidadPlato = (platoId) => {
    const plato = (platosSeleccionados[asistenteActual] || []).find(
      (p) => p.id === platoId,
    );
    return Number(plato?.cantidad || 0);
  };

  // ===========================
  // MANEJADORES DE EVENTOS
  // ===========================

  // Manejar cambio de categoría y slider
  const handleCategoriaChange = (categoriaKey) => {
    const categoriaIndex = categoriasConMascotas.findIndex(
      (categoria) => categoria.key === categoriaKey,
    );
    setCategoriActual(categoriaKey);

    // Cambiar el slide del swiper
    if (swiperRef.current && categoriaIndex >= 0) {
      swiperRef.current.swiper.slideTo(categoriaIndex);
    }
  };

  // Manejar cambio de slide
  const handleSlideChange = (swiper) => {
    const categoriaSeleccionada = categoriasConMascotas[swiper.activeIndex];
    if (
      categoriaSeleccionada?.key &&
      categoriaSeleccionada.key !== categoriaActual
    ) {
      setCategoriActual(categoriaSeleccionada.key);
    }
  };

  const handleSelectAsistente = (index) => {
    const safeIndex = Math.max(0, Math.min(index, asistentesLista.length - 1));
    setAsistenteActual(safeIndex);
  };

  const esAsistenteNino = (asistente) =>
    normalizarClaveCatalogo(String(asistente || "")).startsWith("nino");

  const esAsistenteMascota = (asistente) => {
    const clave = normalizarClaveCatalogo(String(asistente || ""));
    return clave.includes("mascota") || clave.includes("pet");
  };

  const obtenerAvatarAsistente = (asistente) => {
    const clave = normalizarClaveCatalogo(String(asistente || ""));

    if (clave.includes("nino")) return "/iconos/avatars/children.svg";
    if (clave.includes("mascota") || clave.includes("pet")) {
      return "/iconos/avatars/pet.svg";
    }

    return "/iconos/avatars/adulto.svg";
  };

  const moverACategoriaMenuInfantilSiAplica = (asistenteIndex) => {
    const asistente = asistentesLista[asistenteIndex];
    if (!esAsistenteNino(asistente)) return;

    const categoriaIndex = categorias.findIndex(
      (categoria) => categoria.key === MENU_INFANTIL_KEY,
    );

    if (categoriaIndex < 0) return;

    setCategoriActual(MENU_INFANTIL_KEY);
    swiperRef.current?.swiper?.slideTo(categoriaIndex);
  };

  const moverACategoriaMascotasSiAplica = (asistenteIndex) => {
    const asistente = asistentesLista[asistenteIndex];
    if (!esAsistenteMascota(asistente)) return;
    setCategoriActual(MENU_MASCOTAS_KEY);
  };

  useEffect(() => {
    if (categorias.length === 0 || asistentesLista.length === 0) return;
    moverACategoriaMascotasSiAplica(asistenteActual);
    moverACategoriaMenuInfantilSiAplica(asistenteActual);
  }, [asistenteActual, categorias, asistentesLista]);

  const handleSeleccionarPlato = (plato) => {
    setPlatosSeleccionados((prev) => {
      const actual = prev[asistenteActual] || [];
      const existe = actual.some((p) => p.id === plato.id);

      if (existe) {
        return prev;
      }

      const platoConCantidad = {
        ...plato,
        cantidad: 1,
      };

      return {
        ...prev,
        [asistenteActual]: [...actual, platoConCantidad],
      };
    });
  };

  const incrementarCantidadPlato = (plato) => {
    setPlatosSeleccionados((prev) => {
      const actual = prev[asistenteActual] || [];
      const idx = actual.findIndex((p) => p.id === plato.id);

      if (idx === -1) {
        return {
          ...prev,
          [asistenteActual]: [...actual, { ...plato, cantidad: 1 }],
        };
      }

      return {
        ...prev,
        [asistenteActual]: actual.map((item, index) =>
          index === idx
            ? { ...item, cantidad: Number(item.cantidad || 0) + 1 }
            : item,
        ),
      };
    });
  };

  const decrementarCantidadPlato = (platoId) => {
    setPlatosSeleccionados((prev) => {
      const actual = prev[asistenteActual] || [];
      const idx = actual.findIndex((p) => p.id === platoId);
      if (idx === -1) return prev;

      const plato = actual[idx];
      const nextCantidad = Number(plato?.cantidad || 0) - 1;

      if (nextCantidad <= 0) {
        return {
          ...prev,
          [asistenteActual]: actual.filter((p) => p.id !== platoId),
        };
      }

      return {
        ...prev,
        [asistenteActual]: actual.map((item, index) =>
          index === idx ? { ...item, cantidad: nextCantidad } : item,
        ),
      };
    });
  };

  const eliminarPlatoDeAsistente = (asistenteIndex, platoId) => {
    setPlatosSeleccionados((prev) => ({
      ...prev,
      [asistenteIndex]: (prev[asistenteIndex] || []).filter(
        (p) => p.id !== platoId,
      ),
    }));
  };

  const validarPlatosPorAsistente = () => {
    const asistentesSinPlatos = [];

    for (let i = 0; i < asistentesLista.length; i++) {
      const asistente = asistentesLista[i];
      if (esAsistenteMascota(asistente)) continue;

      if (!platosSeleccionados[i] || platosSeleccionados[i].length === 0) {
        asistentesSinPlatos.push(asistentesLista[i]);
      }
    }

    if (asistentesSinPlatos.length > 0) {
      const asistentesTexto = asistentesSinPlatos.join(", ");
      alert(
        `⚠️ Los siguientes asistentes no tienen platos seleccionados:\n\n${asistentesTexto}\n\nPor favor, agrega al menos un plato para cada adulto y niño antes de continuar.`,
      );
      return false;
    }

    return true;
  };

  const prepararCheckoutDesdePlatos = () => {
    const datosJSON = generarJSON(
      firestoreId || checkoutTempIdRef.current || `temp-${Date.now()}`,
      platosSeleccionados,
      asistentesLista,
    );

    const resultado = prepararDatosCheckout(datosJSON.platosSeleccionados);
    if (!resultado.ok) {
      throw new Error(resultado.error || "No se pudieron preparar los datos");
    }

    const carga = cargarDatosReservaDesdeResultado(resultado.data);
    if (!carga.ok) {
      throw new Error(carga.error || "No se pudieron cargar datos de checkout");
    }

    return resultado.data;
  };

  const handleOpenResumen = () => {
    if (!validarPlatosPorAsistente()) return;

    try {
      prepararCheckoutDesdePlatos();
      setShowResumen(true);
    } catch (error) {
      console.error("Error preparando resumen:", error);
      alert("No se pudo abrir el resumen. Intenta de nuevo.");
    }
  };

  const handleConfirmar = async () => {
    if (!validarPlatosPorAsistente()) return;

    setGuardando(true);
    try {
      clearError();
      const checkoutData = prepararCheckoutDesdePlatos();

      const reservaSnapshot = useReservaStore.getState();
      const checkoutSnapshot = useCheckoutStore.getState();

      /* console.log("[ReservaStore]", {
        reservaData: reservaSnapshot.reservaData,
        reservaZonaData: reservaSnapshot.reservaZonaData,
        detalleAsistentes: reservaSnapshot.detalleAsistentes,
      });
      console.log("[CheckoutStore]", {
        datosContacto: checkoutSnapshot.datosContacto,
        montoTotal: checkoutSnapshot.montoTotal,
        impuestos: checkoutSnapshot.impuestos,
        montoFinal: checkoutSnapshot.montoFinal,
      });
      console.log("[CheckoutPayload]", checkoutData); */

      const pago = await iniciarPago({ sinMenu: false });
      if (!pago.ok) {
        throw new Error(pago.error || "No se pudo guardar la reserva");
      }

      onPagoSuccess?.(pago);
    } catch (error) {
      console.error("Error al procesar pago:", error);
      alert("Error al guardar la reserva. Por favor, intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  // ===========================
  // VARIABLES DERIVADAS
  // ===========================

  const totalGeneralPrecio = Object.values(platosSeleccionados).reduce(
    (total, platos) =>
      total +
      platos.reduce((sum, plato) => sum + plato.precio * plato.cantidad, 0),
    0,
  );

  const resumenAsistentes = useMemo(() => {
    return asistentesLista.map((asistente, index) => {
      const platos = platosSeleccionados[index] || [];
      const cantidad = platos.reduce((sum, plato) => sum + plato.cantidad, 0);
      const total = platos.reduce(
        (sum, plato) => sum + plato.precio * plato.cantidad,
        0,
      );

      return {
        asistente,
        cantidad,
        total,
      };
    });
  }, [asistentesLista, platosSeleccionados]);

  const ultimoAsistenteIndex = Math.max(0, asistentesLista.length - 1);

  const ctaEsPago =
    asistentesLista.length > 0 && asistenteActual >= ultimoAsistenteIndex;
  const asistentesRequeridosSinPlato = asistentesLista.filter(
    (asistente, index) =>
      !esAsistenteMascota(asistente) &&
      (!Array.isArray(platosSeleccionados[index]) ||
        platosSeleccionados[index].length === 0),
  );
  const todosRequeridosConPlatos =
    asistentesLista.length > 0 && asistentesRequeridosSinPlato.length === 0;

  const handleBottomCta = () => {
    if (ctaEsPago) {
      if (!todosRequeridosConPlatos) return;
      handleConfirmar();
      return;
    }

    const siguienteIndex = Math.min(asistenteActual + 1, ultimoAsistenteIndex);
    handleSelectAsistente(siguienteIndex);
  };

  // Exponer handleBottomCta al padre a través del callback
  useEffect(() => {
    registerConfirmar?.({
      continuar: () => handleBottomCta(),
      volver: () => {
        // Si estamos en el primer asistente, no podemos retroceder más
        if (asistenteActual <= 0) return false;
        // Retroceder al asistente anterior
        handleSelectAsistente(asistenteActual - 1);
        return true;
      },
      isLastAsistente: () => ctaEsPago,
      isReadyToPay: () => todosRequeridosConPlatos,
      isLoading: () => guardando || pagoEnProceso,
    });
  });

  const helpTextRequired = Object.values(platosSeleccionados).some(
    (platos) =>
      Array.isArray(platos) &&
      platos.reduce((sum, p) => sum + p.cantidad, 0) > 0,
  );

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="w-full h-full mx-auto">
      <div className="w-full h-full flex lg:flex-row flex-col max-lg:gap-2 items-center justify-center max-lg:pt-6">
        {/* Interaccion de personas */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 max-lg:w-full lg:h-full flex lg:flex-col flex-row items-center md:items-start ${helpTextRequired ? "lg:justify-between justify-center" : "justify-center"} flex-wrap content-center`}
        >
          <div className="lg:w-fit w-full text-center lg:text-start">
            <h4 className="font-parkson font-bold">
              <span className="!text-5xl">Seleccione sus platos</span>
            </h4>
            <p className="my-4 text-sm">
              Si reserva sus platos desde ya, cuando llegue a la mesa, los
              serviremos en 5 minutos.
            </p>

            {isMobile && (
              <div className="w-full flex flex-col items-center gap-1">
                <span className="text-yellow">
                  {String(
                    asistentesLista[asistenteActual] ||
                      `Persona ${asistenteActual + 1}`,
                  )
                    .replaceAll("_", " ")
                    .toUpperCase()}
                </span>
                {(platosSeleccionados[asistenteActual]?.length ?? 0) <= 0 && (
                  <p className="text-yellow !text-sm">
                    Al menos reserve un plato
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="lg:w-96 hidden lg:inline-block w-28 space-y-4">
            {!isMobile && (
              <ResumenPlatosDetalle
                asistentesLista={asistentesLista}
                asistenteActual={asistenteActual}
                platosSeleccionados={platosSeleccionados}
                resumenAsistentes={resumenAsistentes}
                eliminarPlatoDeAsistente={eliminarPlatoDeAsistente}
                handleSelectAsistente={handleSelectAsistente}
                obtenerAvatarAsistente={obtenerAvatarAsistente}
                helpTextRequired={helpTextRequired}
                totalGeneralPrecio={totalGeneralPrecio}
                showAvatars
                maxHeight="max-h-80"
              />
            )}
          </div>
        </motion.div>
        {/* Menu dinamico */}
        <div className="flex-3 lg:flex-1/5 lg:h-full h-20 max-lg:w-full min-w-0 flex items-center">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-black/20 animate-pulse h-full w-full rounded-2xl p-6 flex flex-col items-center justify-evenly gap-4"
            >
              <div className="bg-black/5 w-full h-10 rounded-full" />
              <div className="bg-black/5 w-full h-14 rounded-full" />
              <div className="bg-black/5 w-full h-126 rounded-2xl" />
            </motion.div>
          ) : (
            <MenuSelected
              categorias={categoriasConMascotas}
              categoriaActual={categoriaActual}
              isMobile={isMobile}
              handleCategoriaChange={handleCategoriaChange}
              swiperRef={swiperRef}
              handleSlideChange={handleSlideChange}
              getProductosPorCategoria={getProductosPorCategoria}
              esPlatoSeleccionado={esPlatoSeleccionado}
              handleSeleccionarPlato={handleSeleccionarPlato}
              obtenerCantidadPlato={obtenerCantidadPlato}
              incrementarCantidadPlato={incrementarCantidadPlato}
              decrementarCantidadPlato={decrementarCantidadPlato}
              ComponenteDetalle={
                isMobile ? (
                  <div className="w-full flex flex-col gap-2 px-2 pb-2">
                    {/* Resumen compacto + toggle */}
                    <div className="w-full flex items-center justify-between">
                      <span className="text-yellow !text-sm font-bold">
                        Total (
                        {resumenAsistentes.reduce(
                          (sum, r) => sum + r.cantidad,
                          0,
                        )}
                        ) ${totalGeneralPrecio.toLocaleString("es-CO")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMobileDetalleOpen(!mobileDetalleOpen)}
                        className="flex items-center gap-1 text-secondary/80 !text-sm"
                      >
                        <span>
                          {mobileDetalleOpen
                            ? "Menos detalles"
                            : "Ver detalles"}
                        </span>
                        {mobileDetalleOpen ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                    {/* Panel desplegable con el mismo detalle reutilizable */}
                    <AnimatePresence>
                      {mobileDetalleOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "50dvh", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="h-full pt-2 border-t border-secondary/20 overflow-y-auto">
                            <ResumenPlatosDetalle
                              asistentesLista={asistentesLista}
                              asistenteActual={asistenteActual}
                              platosSeleccionados={platosSeleccionados}
                              resumenAsistentes={resumenAsistentes}
                              eliminarPlatoDeAsistente={
                                eliminarPlatoDeAsistente
                              }
                              handleSelectAsistente={handleSelectAsistente}
                              obtenerAvatarAsistente={obtenerAvatarAsistente}
                              helpTextRequired={helpTextRequired}
                              totalGeneralPrecio={totalGeneralPrecio}
                              showAvatars
                              maxHeight=""
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <></>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// COMPONENTE MENU SELECTED
// ===========================

/**
 * Componente para mostrar el menú de categorías y platos
 */
const MenuSelected = ({
  categorias,
  categoriaActual,
  isMobile,
  handleCategoriaChange,
  swiperRef,
  handleSlideChange,
  getProductosPorCategoria,
  esPlatoSeleccionado,
  handleSeleccionarPlato,
  obtenerCantidadPlato,
  incrementarCantidadPlato,
  decrementarCantidadPlato,
  ComponenteDetalle,
}) => {
  const MENU_MASCOTAS_KEY = "menu_mascotas";

  return (
    <div className="w-full max-w-full min-w-0 h-full grid grid-rows-[auto minmax(0,1fr)_auto] overflow-x-hidden overflow-y-hidden rounded-3xl gap-4 px-4 pt-4 pb-2">
      {/* Nombres de Categorías */}
      {categorias.length > 0 && (
        <div className="bg-secondary min-h-8 rounded-full shrink-0 px-2 max-w-full overflow-x-hidden">
          <div
            className={`w-full flex overflow-x-auto ${
              isMobile ? "gap-2" : "justify-between"
            }`}
          >
            {categorias.map((categoria) => (
              <div
                className={`relative flex items-center justify-center border-dark/20  ${
                  isMobile ? "min-w-[28.571%] shrink-0" : "w-fit"
                }`}
                key={categoria.key}
              >
                {/* {categoriaActual === categoria && (
                  <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-2/5 h-0.5 rounded-full bg-brown" />
                )} */}
                <Button
                  key={categoria.key}
                  type="button-thirty"
                  onClick={() => handleCategoriaChange(categoria.key)}
                  title={capitalizeFirst(
                    String(categoria.displayName || categoria.key).replaceAll(
                      "_",
                      " ",
                    ),
                  )}
                  customClass={`p-2! text-sm! min-w-28! font-bold! text-dark! whitespace-nowrap text-start ${
                    categoriaActual === categoria.key
                      ? "opacity-100 rounded-full shadow-md"
                      : "opacity-40 hover:opacity-80"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Platos de la categoría con Slider   */}
      <div className="w-full max-w-full min-h-0 h-full overflow-x-hidden overflow-y-hidden">
        <Swiper
          ref={swiperRef}
          pagination={false}
          modules={[]}
          className="mySwiper w-full !h-full"
          onSlideChange={handleSlideChange}
          initialSlide={Math.max(
            0,
            categorias.findIndex(
              (categoria) => categoria.key === categoriaActual,
            ),
          )}
          allowTouchMove={true}
          simulateTouch={true}
          keyboard={false}
        >
          {categorias.map((categoria) => {
            const esMenuMascotas = categoria.key === MENU_MASCOTAS_KEY;
            const productosCategoria = getProductosPorCategoria(categoria.key);

            let contenidoCategoria;
            if (esMenuMascotas) {
              contenidoCategoria = (
                <div className="h-full min-h-[240px] flex items-center justify-center text-center px-6">
                  <p className="text-dark/70 !text-xl font-semibold">
                    Muy pronto tu mascota podrá <br /> disfrutar lo mejor de
                    EntrePues.
                  </p>
                </div>
              );
            } else if (productosCategoria.length > 0) {
              contenidoCategoria = productosCategoria.map((plato) => (
                <motion.div
                  key={plato.id}
                  className={`group p-4 h-94 min-h-20 flex flex-col justify-between gap-2 rounded-2xl transition-all cursor-pointer bg-amber-full/25 hover:bg-amber-full/10 relative overflow-hidden`}
                  onClick={() => handleSeleccionarPlato(plato)}
                >
                  <div className="grid grid-cols-2">
                    <PlatoThumbnail src={plato.img} alt={plato.nombre} />
                  </div>
                  <div className="w-fit flex items-center gap-2 bg-secondary text-dark px-4 py-1.5 rounded-full">
                    <span className="font-bold">4.0</span>
                    <span className="size-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 8 8"
                        className="fill-yellow size-full object-contain"
                      >
                        <path
                          d="M6.47078 8L4 6.64108L1.52827 8L2.00142 5.11972L0 3.08035L2.76319 2.66039L4 0L5.23681 2.66039L8 3.08035L5.99858 5.12071L6.47078 8Z"
                          fill="#FFC529"
                        />
                      </svg>
                    </span>
                    <span className="opacity-60">(999+)</span>
                  </div>
                  <p className="min-w-0 text-start lg:line-clamp-1 line-clamp-2 whitespace-normal">
                    {plato.nombre}
                  </p>
                  
                  <p className="font-bold text-3xl text-start shrink-0 whitespace-nowrap">
                    ${plato.precio.toLocaleString("es-CO")}
                  </p>
                  <div className="flex items-center gap-2 w-fit">
                    <span className="bg-yellow text-xs text-dark font-bold py-2 px-4 rounded-full">
                      -10%
                    </span>
                    <span className="line-through text-base">41000</span>
                  </div>

                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                  <div
                    className="w-full shrink-0 flex flex-col items-start justify-center p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {obtenerCantidadPlato(plato.id) > 0 ? (
                        <motion.div
                          key={`cantidad-${plato.id}`}
                          initial={{ opacity: 0, scale: 0.92, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: -4 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="w-full"
                        >
                          <IncremenAndDecrementComponent
                            item={obtenerCantidadPlato(plato.id)}
                            increaseQuantity={() =>
                              incrementarCantidadPlato(plato)
                            }
                            decreaseQuantity={() =>
                              decrementarCantidadPlato(plato.id)
                            }
                            colorItems="text-dark"
                          />
                        </motion.div>
                      ) : (
                        <motion.button
                          key={`add-${plato.id}`}
                          type="button"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          onClick={() => incrementarCantidadPlato(plato)}
                          aria-label={`Agregar ${plato.nombre}`}
                          className="w-full h-12 flex gap-2 items-center justify-center rounded-full shadow-glow backdrop-blur-4xl"
                        >
                          Agregar
                          <Plus className={"text-secondary size-6"} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ));
            } else {
              contenidoCategoria = (
                <div className="text-center text-dark/60 py-8">
                  <p className="text-sm">No hay platos en esta categoría</p>
                </div>
              );
            }

            return (
              <SwiperSlide
                key={categoria.key}
                className="!h-full !overflow-hidden"
              >
                <div className="w-full max-w-full h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain grid md:grid-cols-2 grid-cols-1 gap-3 content-start auto-rows-max pl-2 pr-2">
                  {contenidoCategoria}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      {ComponenteDetalle}
    </div>
  );
};

// ===========================
// COMPONENTE RESUMEN
// ===========================

const ResumenPlatosDetalle = ({
  asistentesLista,
  asistenteActual,
  platosSeleccionados,
  resumenAsistentes,
  eliminarPlatoDeAsistente,
  handleSelectAsistente,
  obtenerAvatarAsistente,
  helpTextRequired,
  totalGeneralPrecio,
  showAvatars = false,
  maxHeight = "max-h-42",
}) => {
  return (
    <div className={`w-full flex flex-col gap-3 ${maxHeight} overflow-y-auto`}>
      {/* Avatars de asistentes */}
      {showAvatars && helpTextRequired && asistentesLista.length > 1 && (
        <div className="w-full flex items-center gap-6 pb-2 border-b border-secondary/20">
          {asistentesLista.map((asistente, index) => {
            const nombreAsistente = String(asistente || `Persona ${index + 1}`)
              .replaceAll("_", " ")
              .toUpperCase();
            return (
              <button
                key={`avatar-${index}`}
                type="button"
                onClick={() => handleSelectAsistente(index)}
                className={`flex flex-col items-center gap-1 transition-opacity ${
                  asistenteActual === index ? "opacity-100" : "opacity-40"
                }`}
              >
                <i className="bg-white rounded-full overflow-hidden shadow-lg lg:size-18 size-12 flex items-center justify-center pt-1">
                  <img
                    className="size-full object-contain inline-block"
                    src={obtenerAvatarAsistente(asistente)}
                    alt=""
                  />
                </i>
                <span className="!text-[10px] font-bold">
                  {nombreAsistente}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Lista de platos por asistente activo */}
      {resumenAsistentes.map((resumen, index) => {
        const platosDelAsistente = platosSeleccionados[index] || [];
        return (
          <div
            key={`detalle-${index}`}
            className="w-full flex flex-col gap-1"
            style={{ display: asistenteActual === index ? "flex" : "none" }}
          >
            {platosDelAsistente.length > 0 ? (
              <>
                {platosDelAsistente.map((plato) => (
                  <div
                    key={plato.id}
                    className="w-full flex items-center justify-between gap-2"
                  >
                    <span className="text-start !text-sm flex-1 truncate">
                      {plato.nombre} x{plato.cantidad} $
                      {(plato.precio * plato.cantidad).toLocaleString("es-CO")}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarPlatoDeAsistente(index, plato.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      aria-label={`Eliminar ${plato.nombre}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="w-full flex items-center justify-between mt-1 text-yellow">
                  <span className="!text-sm font-bold">
                    Subtotal ({resumen.cantidad})
                  </span>
                  <span className="!text-sm font-bold">
                    ${resumen.total.toLocaleString("es-CO")}
                  </span>
                </div>
              </>
            ) : (
              !helpTextRequired && (
                <p className="text-start text-yellow !text-sm">
                  Al menos reserve un plato
                </p>
              )
            )}
          </div>
        );
      })}

      {/* Total general */}
      {totalGeneralPrecio > 0 && (
        <div className="w-full flex items-center justify-between pt-2 border-t border-secondary/20 text-yellow">
          <span className="!text-sm font-bold">
            Total a pagar(
            {resumenAsistentes.reduce((sum, r) => sum + r.cantidad, 0)})
          </span>
          <span className="!text-sm font-bold">
            ${totalGeneralPrecio.toLocaleString("es-CO")}
          </span>
        </div>
      )}
    </div>
  );
};

// ===========================
// Componente para renderizar la imagen
// ===========================


const PlatoThumbnail = ({ src, alt }) => {
 
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <picture className="relative w-26 h-26 shrink-0 block rounded-2xl overflow-hidden">
      {!isLoaded && !hasError && (
        <span className="absolute inset-0 inline-block animate-pulse bg-dark/20" />
      )}

      {!hasError && src ? (
        <img
          className={`size-full object-cover inline-block transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
        />
      ) : null}
    </picture>
  );
};
