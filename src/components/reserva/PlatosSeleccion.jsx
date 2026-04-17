import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Swiper, SwiperSlide } from "swiper/react";
import { BookCheck, ChevronLeft, Plus } from "lucide-react";
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
  onBackToReserva,
  onPagoSuccess,
}) {
  const MENU_INFANTIL_KEY = "menu_infantil";
  // ===========================
  // ESTADOS
  // ===========================
  const [asistenteActual, setAsistenteActual] = useState(0);
  const [platosSeleccionados, setPlatosSeleccionados] = useState({});
  const [categoriaActual, setCategoriActual] = useState("desayunos");
  const [catalogo, setCatalogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const asistentesSwiperRef = useRef(null);
  const resumenSwiperRef = useRef(null);
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

      const asistentesAdultos = Array.from(
        { length: adultosCount },
        (_, i) => `Adulto ${i + 1}`,
      );
      const asistentesNinos = Array.from(
        { length: ninosCount },
        (_, i) => `Niño ${i + 1}`,
      );

      return [...asistentesAdultos, ...asistentesNinos];
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

  useEffect(() => {
    if (categorias.length === 0) return;

    const existeCategoriaActual = categorias.some(
      (categoria) => categoria.key === categoriaActual,
    );

    if (!existeCategoriaActual) {
      setCategoriActual(categorias[0].key);
    }
  }, [categorias, categoriaActual]);

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
    const categoriaIndex = categorias.findIndex(
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
    const categoriaSeleccionada = categorias[swiper.activeIndex];
    if (
      categoriaSeleccionada?.key &&
      categoriaSeleccionada.key !== categoriaActual
    ) {
      setCategoriActual(categoriaSeleccionada.key);
    }
  };

  const handleAsistenteSlideChange = (swiper) => {
    const currentIndex = swiper.activeIndex;
    setAsistenteActual(currentIndex);
    resumenSwiperRef.current?.swiper?.slideTo(currentIndex);
  };

  const handleSelectAsistente = (index) => {
    const safeIndex = Math.max(0, Math.min(index, asistentesLista.length - 1));
    setAsistenteActual(safeIndex);
    asistentesSwiperRef.current?.swiper?.slideTo(safeIndex);
    resumenSwiperRef.current?.swiper?.slideTo(safeIndex);
  };

  const esAsistenteNino = (asistente) =>
    normalizarClaveCatalogo(String(asistente || "")).startsWith("nino");

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

  useEffect(() => {
    if (categorias.length === 0 || asistentesLista.length === 0) return;
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

  //Ir atras a datos dereserva

  const Atras = () => {
    onBackToReserva?.();
  };

  const validarPlatosPorAsistente = () => {
    const adultosSinPlatos = [];

    for (let i = 0; i < asistentesLista.length; i++) {
      const asistente = asistentesLista[i];
      if (esAsistenteNino(asistente)) continue;

      if (!platosSeleccionados[i] || platosSeleccionados[i].length === 0) {
        adultosSinPlatos.push(asistentesLista[i]);
      }
    }

    if (adultosSinPlatos.length > 0) {
      const asistentesTexto = adultosSinPlatos.join(", ");
      alert(
        `⚠️ Los siguientes adultos no tienen platos seleccionados:\n\n${asistentesTexto}\n\nPor favor, agrega al menos un plato para cada adulto antes de continuar.`,
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
  const todosAdultosConPlatos =
    asistentesLista.length > 0 &&
    asistentesLista.every((asistente, index) => {
      if (esAsistenteNino(asistente)) return true;
      return Array.isArray(platosSeleccionados[index])
        ? platosSeleccionados[index].length > 0
        : false;
    });

  const handleBottomCta = () => {
    if (ctaEsPago) {
      if (!todosAdultosConPlatos) return;
      handleConfirmar();
      return;
    }

    const siguienteIndex = Math.min(asistenteActual + 1, ultimoAsistenteIndex);
    handleSelectAsistente(siguienteIndex);
  };

  // ===========================
  // RENDER
  // ===========================

  return (
    <>
      <Button
        type="button-secondary"
        Icon={ChevronLeft}
        title="Volver"
        fontSize="xl"
        customClass={`absolute left-2 top-2`}
        onClick={Atras}
      />
      <div className="w-full h-full mx-auto lg:pt-6">
        <div className="w-full h-full flex lg:flex-row flex-col max-lg:gap-2 items-center justify-center max-lg:pt-6">
          {/* Interaccion de personas */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 max-lg:w-full lg:h-fit flex lg:flex-col flex-row items-center md:items-start lg:justify-between justify-center flex-wrap content-center"
          >
            <div className="lg:w-fit w-56">
              <h4 className="text-start font-parkson font-bold">
                <span className="lg:!text-5xl !text-3xl">Selecciona</span>
                <br />
                <span className="lg:!text-8xl lg:!leading-14 !text-6xl !leading-11">
                  tus platos
                </span>
              </h4>
            </div>

            <div className="lg:w-96 w-28 space-y-4 lg:mt-8">
              <div className="w-full flex items-start gap-2">
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <Swiper
                    ref={asistentesSwiperRef}
                    slidesPerView={isMobile ? 1 : 3}
                    spaceBetween={0}
                    className="w-full"
                    watchSlidesProgress
                    onSlideChange={handleAsistenteSlideChange}
                  >
                    {asistentesLista.map((asistente, index) => {
                      const nombreAsistente = String(
                        asistente || `Persona ${index + 1}`,
                      )
                        .replace(/_/g, " ")
                        .toUpperCase();

                      return (
                        <SwiperSlide key={`${nombreAsistente}-${index}`}>
                          <div className="w-full flex flex-col items-center px-1">
                            <motion.button
                              type="button"
                              onClick={() => handleSelectAsistente(index)}
                              whileTap={{ scale: 0.95 }}
                              animate={{
                                scale: asistenteActual === index ? 1 : 0.96,
                                opacity: asistenteActual === index ? 1 : 0.2,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 320,
                                damping: 24,
                              }}
                              className={`w-fit h-fit flex flex-col items-center justify-center font-parkson !text-3xl transition-opacity ${
                                asistenteActual === index
                                  ? "opacity-100 text-dark"
                                  : "opacity-40 text-dark"
                              }`}
                            >
                              <i className="bg-white rounded-full overflow-hidden mt-6 shadow-lg self-start size-24 flex items-center justify-center pt-4">
                                <img
                                  className="size-full object-contain inline-block"
                                  src="/iconos/user.svg"
                                  alt=""
                                />
                              </i>
                              {nombreAsistente}
                            </motion.button>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              </div>

              {!isMobile && (
                <div className="w-full flex items-start gap-2">
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <Swiper
                      ref={resumenSwiperRef}
                      slidesPerView={1}
                      spaceBetween={0}
                      className="w-full"
                      allowTouchMove={false}
                    >
                      {resumenAsistentes.map((resumen, index) => (
                        <SwiperSlide key={`resumen-${index}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: asistenteActual === index ? 1 : 0.97,
                            }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="w-full flex items-center justify-center gap-4 text-dark"
                          >
                            {!(
                              resumen.cantidad === 0 && resumen.total === 0
                            ) ? (
                              <>
                                <motion.span
                                  key={`qty-${index}-${resumen.cantidad}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className="!text-xl font-bold"
                                >
                                  x{resumen.cantidad}
                                </motion.span>
                                <motion.span
                                  key={`total-${index}-${resumen.total}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className="!text-5xl font-bold"
                                >
                                  ${resumen.total.toLocaleString("es-CO")}
                                </motion.span>
                              </>
                            ) : (
                              <motion.div
                                key={`qty-${index}-${resumen.cantidad}`}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="!text-xl italic font-bold opacity-50 h-12 flex items-center justify-center"
                              >
                                <p>Elige al menos un plato</p>
                              </motion.div>
                            )}
                          </motion.div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          {/* Menu dinamico */}
          <div className="flex-3 lg:flex-1 lg:h-full h-20 max-lg:w-full min-w-0 flex items-center">
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
                categorias={categorias}
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
                component={
                  <>
                    <div className="w-full flex flex-wrap items-center justify-center gap-4">
                      <div className="w-full flex justify-around">
                        <div>
                          <span className="!text-xl font-light mr-2">
                            {ctaEsPago && todosAdultosConPlatos
                              ? "Total a pagar"
                              : "Subtotal:"}
                          </span>
                          <span className="!text-2xl font-bold">
                            ${totalGeneralPrecio.toLocaleString("es-CO")}
                          </span>
                        </div>
                      </div>

                      <div className="w-full flex items-center gap-4 justify-center">
                        {asistenteActual >= 1 && (
                          <Button
                            type="button-secondary"
                            Icon={ChevronLeft}
                            disabled={guardando}
                            //title={`Anterior`}
                            fontSize="xl"
                            width="ajustado"
                            customClass="!p-0 border"
                            onClick={() =>
                              handleSelectAsistente(
                                Math.max(asistenteActual - 1, 0),
                              )
                            }
                          />
                        )}
                        {ctaEsPago && todosAdultosConPlatos && (
                          <Button
                            onClick={handleOpenResumen}
                            //title="Resumen"
                            type="button-secondary"
                            customClass="!p-0 flex-col !text-xs"
                            width="ajustado"
                            fontSize="xl"
                            Icon={BookCheck}
                            disabled={guardando || pagoEnProceso}
                          />
                        )}
                        <Button
                          onClick={handleBottomCta}
                          title={
                            guardando || pagoEnProceso
                              ? "Guardando..."
                              : ctaEsPago
                                ? "Pagar"
                                : "Siguiente"
                          }
                          type="button-dark"
                          width="min"
                          fontSize="xl"
                          disabled={
                            guardando ||
                            pagoEnProceso ||
                            (ctaEsPago && !todosAdultosConPlatos)
                          }
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center gap-2">
                      <p className="!text-base text-center whitespace-break-spaces">
                        Para continuar debes pagar los platos de tu reserva
                      </p>
                    </div>
                  </>
                }
              />
            )}
          </div>
        </div>
      </div>
    </>
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
  component,
}) => {
  return (
    <div className="w-full max-w-full min-w-0 h-full bg-white grid grid-rows-[auto minmax(0,1fr)_auto] overflow-x-hidden overflow-y-hidden rounded-3xl gap-4 px-4 pt-4 pb-2">
      {/* <h3 className="text-xl px-4">Selecciona los platos por persona</h3> */}
      {/* Nombres de Categorías */}
      {categorias.length > 0 && (
        <div className="font-parkson shrink-0 px-2 max-w-full overflow-x-hidden">
          <div
            className={`w-full flex overflow-x-auto ${
              isMobile ? "gap-2" : "justify-between"
            }`}
          >
            {categorias.map((categoria) => (
              <div
                className={`relative flex items-center justify-center border-dark/20 ${
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
                    String(categoria.displayName || categoria.key).replace(
                      /_/g,
                      " ",
                    ),
                  )}
                  fontSize="2xl"
                  customClass={`text-start ${
                    categoriaActual === categoria.key
                      ? "opacity-100"
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
            const productosCategoria = getProductosPorCategoria(categoria.key);

            return (
              <SwiperSlide
                key={categoria.key}
                className="!h-full !overflow-hidden"
              >
                <div className="w-full max-w-full h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain grid grid-cols-1 gap-3 content-start auto-rows-max pl-2 pr-2">
                  {productosCategoria.length > 0 ? (
                    productosCategoria.map((plato) => (
                      <motion.div
                        key={plato.id}
                        className={`group p-1.5 h-20 min-h-20 flex items-center gap-2 rounded-2xl border border-[#e6e6e6] transition-all cursor-pointer ${
                          esPlatoSeleccionado(plato.id) ? "bg-[#e6e6e6]" : ""
                        } hover:bg-dark/10 relative overflow-hidden`}
                        onClick={() => handleSeleccionarPlato(plato)}
                      >
                        <PlatoThumbnail src={plato.img} alt={plato.nombre} />
                        <p className="pl-1 font-medium flex-1 min-w-0 text-start lg:line-clamp-1 line-clamp-2 whitespace-normal">
                          {plato.nombre}
                        </p>
                        <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-md bg-dark text-white absolute left-[22%] top-0 !text-xs transition-all duration-500 delay-200">
                          {plato.nombre}
                        </span>

                        <p className="font-bold mt-1 text-start shrink-0 whitespace-nowrap">
                          ${plato.precio.toLocaleString("es-CO")}
                        </p>

                        <div
                          className="w-fit shrink-0 flex flex-col items-start justify-center p-1"
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
                                className="rounded-full border border-dark/15 px-2 py-1 bg-white/40"
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
                                className="p-1 w-8 h-8 rounded-full bg-[#65c566]"
                              >
                                <Plus className={"text-secondary size-full"} />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-dark/60 py-8">
                      <p className="text-sm">No hay platos en esta categoría</p>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      <>{component}</>
    </div>
  );
};

const PlatoThumbnail = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <picture className="relative w-20 h-20 max-lg:w-16 max-lg:h-16 shrink-0 block rounded-2xl overflow-hidden border border-[#e6e6e6] bg-[#f5f1ea]">
      {!isLoaded && !hasError && (
        <span className="absolute inset-0 inline-block animate-pulse bg-gradient-to-br from-[#efe7da] via-[#f7f3eb] to-[#e8dece]" />
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
