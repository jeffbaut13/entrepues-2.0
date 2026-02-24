import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { capitalizeFirst } from "../../constants/firsLetterUppercase";
import {
  normalizarClaveCatalogo,
  obtenerCatalogoNormalizado,
  obtenerCategoriasCatalogo,
  obtenerProductosCatalogo,
} from "../../firebase/actions";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "../slider/styleVertical.css";
import { Check, ChevronLeft, Trash } from "lucide-react";
import { IncremenAndDecrementComponent } from "../common/IncrementAndDrecrement";
import { useNavigate } from "react-router-dom";
import useReservaStore from "../../store/reservaStore";

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
      })
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
  onConfirmar,
  onVolver,
}) {
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
  const navigate = useNavigate();
  const {
    reservaData,
    setReservaResult,
    closeBooking,

    updatePlatosSeleccionados,
    prepararDatosCheckout,
  } = useReservaStore();

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
        (_, i) => `Adulto ${i + 1}`
      );
      const asistentesNinos = Array.from(
        { length: ninosCount },
        (_, i) => `Niño ${i + 1}`
      );

      return [...asistentesAdultos, ...asistentesNinos];
    }

    return [];
  }, [asistentes]);

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
    return obtenerCategoriasCatalogo(catalogo).map(
      (categoria) => categoria.key
    );
  }, [catalogo]);

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
    }
  }, [asistentesLista, categorias.length, productosIndexados]);

  // ===========================
  // FUNCIONES DE UTILIDAD DEL COMPONENTE
  // ===========================

  // Obtener productos por categoría específica
  const getProductosPorCategoria = (categoria) => {
    return obtenerProductosCatalogo(catalogo, { categoria });
  };

  const esPlatoSeleccionado = (platoId) => {
    return (platosSeleccionados[asistenteActual] || []).some(
      (p) => p.id === platoId
    );
  };

  // ===========================
  // MANEJADORES DE EVENTOS
  // ===========================

  // Manejar cambio de categoría y slider
  const handleCategoriaChange = (categoria) => {
    const categoriaIndex = categorias.indexOf(categoria);
    setCategoriActual(categoria);

    // Cambiar el slide del swiper
    if (swiperRef.current && categoriaIndex >= 0) {
      swiperRef.current.swiper.slideTo(categoriaIndex);
    }
  };

  // Manejar cambio de slide
  const handleSlideChange = (swiper) => {
    const categoriaSeleccionada = categorias[swiper.activeIndex];
    if (categoriaSeleccionada && categoriaSeleccionada !== categoriaActual) {
      setCategoriActual(categoriaSeleccionada);
    }
  };

  const handleAsistenteSlideChange = (swiper) => {
    const currentIndex = swiper.activeIndex;
    setAsistenteActual(currentIndex);
    resumenSwiperRef.current?.swiper?.slideTo(currentIndex);
  };

  const handleSelectAsistente = (index) => {
    setAsistenteActual(index);
    asistentesSwiperRef.current?.swiper?.slideTo(index);
    resumenSwiperRef.current?.swiper?.slideTo(index);
  };

  const handleSeleccionarPlato = (plato) => {
    setPlatosSeleccionados((prev) => {
      const actual = prev[asistenteActual] || [];
      const existe = actual.some((p) => p.id === plato.id);

      if (existe) {
        return {
          ...prev,
          [asistenteActual]: actual.filter((p) => p.id !== plato.id),
        };
      } else {
        // Agregar plato con cantidad por defecto de 1
        const platoConCantidad = {
          ...plato,
          cantidad: 1,
        };
        return {
          ...prev,
          [asistenteActual]: [...actual, platoConCantidad],
        };
      }
    });
  };

  const handleIncrementarCantidad = (platoId) => {
    setPlatosSeleccionados((prev) => {
      const actual = prev[asistenteActual] || [];
      const actualizado = actual.map((p) =>
        p.id === platoId ? { ...p, cantidad: p.cantidad + 1 } : p
      );
      return {
        ...prev,
        [asistenteActual]: actualizado,
      };
    });
  };

  const handleDisminuirCantidad = (platoId) => {
    setPlatosSeleccionados((prev) => {
      const actual = prev[asistenteActual] || [];
      const actualizado = actual.map((p) => {
        if (p.id === platoId) {
          const nuevaCantidad = p.cantidad - 1;
          // Si la cantidad llega a 0, mantener el plato pero con cantidad 1
          return { ...p, cantidad: nuevaCantidad < 1 ? 1 : nuevaCantidad };
        }
        return p;
      });
      return {
        ...prev,
        [asistenteActual]: actualizado,
      };
    });
  };

  const irAlSiguiente = () => {
    if (asistenteActual < asistentesLista.length - 1) {
      setAsistenteActual(asistenteActual + 1);
    }
  };

  const irAlAnterior = () => {
    if (asistenteActual > 0) {
      setAsistenteActual(asistenteActual - 1);
    }
  };

  const handleConfirmar = async () => {
    // Validar que todos los asistentes tienen al menos un plato
    const asistentesSinPlatos = [];
    for (let i = 0; i < asistentesLista.length; i++) {
      if (!platosSeleccionados[i] || platosSeleccionados[i].length === 0) {
        asistentesSinPlatos.push(asistentesLista[i]);
      }
    }

    // Si hay asistentes sin platos, mostrar alerta
    if (asistentesSinPlatos.length > 0) {
      const asistentesTexto = asistentesSinPlatos.join(", ");
      alert(
        `⚠️ Los siguientes asistentes no tienen platos seleccionados:\n\n${asistentesTexto}\n\nPor favor, agrega al menos un plato para cada asistente antes de continuar.`
      );
      return; // No continuar
    }

    setGuardando(true);
    try {
      // Generar datos JSON para los platos seleccionados
      const datosJSON = generarJSON(
        firestoreId || checkoutTempIdRef.current || `temp-${Date.now()}`,
        platosSeleccionados,
        asistentesLista
      );

      // Usar la función del store para preparar datos de checkout
      const resultado = prepararDatosCheckout(datosJSON.platosSeleccionados);

      if (!resultado.ok) {
        throw new Error(resultado.error || "No se pudieron preparar los datos");
      }

      console.log("✅ Datos guardados temporalmente para checkout");

      closeBooking(); // Cerrar modal de reserva

      // Redirigir al checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error al preparar datos para checkout:", error);
      alert("Error al preparar la reserva. Por favor, intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  // ===========================
  // VARIABLES DERIVADAS
  // ===========================

  const platosDelAsistente = platosSeleccionados[asistenteActual] || [];

  // Calcular totales para el asistente actual
  const totalCantidad = platosDelAsistente.reduce(
    (sum, plato) => sum + plato.cantidad,
    0
  );
  const totalPrecio = platosDelAsistente.reduce(
    (sum, plato) => sum + plato.precio * plato.cantidad,
    0
  );

  // Calcular totales generales de toda la reserva
  const totalGeneralCantidad = Object.values(platosSeleccionados).reduce(
    (total, platos) =>
      total + platos.reduce((sum, plato) => sum + plato.cantidad, 0),
    0
  );
  const totalGeneralPrecio = Object.values(platosSeleccionados).reduce(
    (total, platos) =>
      total +
      platos.reduce((sum, plato) => sum + plato.precio * plato.cantidad, 0),
    0
  );

  const resumenAsistentes = useMemo(() => {
    return asistentesLista.map((asistente, index) => {
      const platos = platosSeleccionados[index] || [];
      const cantidad = platos.reduce((sum, plato) => sum + plato.cantidad, 0);
      const total = platos.reduce(
        (sum, plato) => sum + plato.precio * plato.cantidad,
        0
      );

      return {
        asistente,
        cantidad,
        total,
      };
    });
  }, [asistentesLista, platosSeleccionados]);

  const totalAdultos = useMemo(() => {
    if (asistentes && typeof asistentes === "object" && !Array.isArray(asistentes)) {
      const adultosCount = Number(asistentes.adultos || 0);
      if (!Number.isNaN(adultosCount) && adultosCount > 0) return adultosCount;
    }
    return asistentesLista.length;
  }, [asistentes, asistentesLista.length]);

  const ultimoAdultoIndex = Math.max(
    0,
    Math.min(totalAdultos, asistentesLista.length) - 1
  );

  const primerAsistenteTienePlatos =
    (platosSeleccionados[0] || []).length > 0;

  const ctaEsPago = asistenteActual >= ultimoAdultoIndex;

  const handleBottomCta = () => {
    if (ctaEsPago) {
      handleConfirmar();
      return;
    }

    const siguienteIndex = Math.min(asistenteActual + 1, ultimoAdultoIndex);
    handleSelectAsistente(siguienteIndex);
  };

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="w-full h-full flex flex-col  max-w-4xl mx-auto">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="size-full text-center bg-dark/10 animate-pulse text-dark flex items-center justify-center rounded-lg flex-col"
          >
            <span />
          </motion.div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-fit flex flex-col bg-[#faf7f1] rounded-2xl px-6 py-8"
          >
            <h4 className="text-center text-xl font-bold mb-6">
              Seleccione los platos por persona
            </h4>

            <div className="w-full flex items-start gap-2">
              <button
                type="button"
                onClick={() => {
                  asistentesSwiperRef.current?.swiper?.slidePrev();
                  const idx = asistentesSwiperRef.current?.swiper?.activeIndex;
                  if (typeof idx === "number") {
                    resumenSwiperRef.current?.swiper?.slideTo(idx);
                  }
                }}
                className="h-10 w-10 shrink-0 flex items-center justify-center text-dark"
                aria-label="Asistente anterior"
              >
                <ChevronLeft className="text-dark" />
              </button>

              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <Swiper
                  ref={asistentesSwiperRef}
                  slidesPerView={3}
                  spaceBetween={0}
                  className="w-full border border-dark rounded-full"
                  watchSlidesProgress
                  onSlideChange={handleAsistenteSlideChange}
                >
                  {asistentesLista.map((asistente, index) => {
                    const nombreAsistente = String(
                      asistente || `Persona ${index + 1}`
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
                              opacity: asistenteActual === index ? 1 : 0.45,
                            }}
                            transition={{ type: "spring", stiffness: 320, damping: 24 }}
                            className={`w-fit h-fit flex items-center justify-center font-parkson !text-3xl transition-opacity ${
                              asistenteActual === index
                                ? "opacity-100 text-dark"
                                : "opacity-40 text-dark"
                            }`}
                          >
                            {nombreAsistente}
                          </motion.button>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                <Swiper
                  ref={resumenSwiperRef}
                  slidesPerView={3}
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
                        <motion.span
                          key={`qty-${index}-${resumen.cantidad}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="text-4xl font-medium"
                        >
                          x{resumen.cantidad}
                        </motion.span>
                        <motion.span
                          key={`total-${index}-${resumen.total}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="text-4xl font-medium"
                        >
                          ${resumen.total.toLocaleString("es-CO")}
                        </motion.span>
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <button
                type="button"
                onClick={() => {
                  asistentesSwiperRef.current?.swiper?.slideNext();
                  const idx = asistentesSwiperRef.current?.swiper?.activeIndex;
                  if (typeof idx === "number") {
                    resumenSwiperRef.current?.swiper?.slideTo(idx);
                  }
                }}
                className="h-10 w-10 shrink-0 flex items-center justify-center text-dark"
                aria-label="Siguiente asistente"
              >
                <ChevronLeft className="text-dark rotate-180" />
              </button>
            </div>
          </motion.div>
          <div className="w-full">
            <MenuSelected
              categorias={categorias}
              categoriaActual={categoriaActual}
              handleCategoriaChange={handleCategoriaChange}
              swiperRef={swiperRef}
              handleSlideChange={handleSlideChange}
              getProductosPorCategoria={getProductosPorCategoria}
              esPlatoSeleccionado={esPlatoSeleccionado}
              handleSeleccionarPlato={handleSeleccionarPlato}
            />
          </div>

          {primerAsistenteTienePlatos && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
            >
              <Button
                onClick={handleBottomCta}
                title={guardando ? "Guardando..." : ctaEsPago ? "Pagar" : "Siguiente persona"}
                type="button-dark"
                customClass="w-full py-3"
                disabled={guardando}
              />
            </motion.div>
          )}
        </>
      )}
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
  handleCategoriaChange,
  swiperRef,
  handleSlideChange,
  getProductosPorCategoria,
  esPlatoSeleccionado,
  handleSeleccionarPlato,
}) => {
  return (
    <div className="w-full grid grid-rows-[auto,minmax(0,1fr)] h-full max-h-[85vh] overflow-hidden rounded-lg mt-12">
      {/* Nombres de Categorías */}
      {categorias.length > 0 && (
        <div className="font-parkson shrink-0 mb-4">
          {/*  <h2 className="text-7xl mb-4 w-full text-center py-6">Menú</h2> */}
          <div className="flex justify-between overflow-x-auto">
            {categorias.map((categoria, index) => (
              <div
                className={`size-full relative flex items-center justify-center border-dark/20 ${
                  index !== categorias.length - 1 ? "border-r-1" : ""
                }`}
                key={categoria}
              >
                {/* {categoriaActual === categoria && (
                  <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-2/5 h-0.5 rounded-full bg-brown" />
                )} */}
                <Button
                  key={categoria}
                  type="button-thirty"
                  onClick={() => handleCategoriaChange(categoria)}
                  title={capitalizeFirst(categoria.replace(/_/g, " "))}
                  customClass={`!text-2xl text-start ${
                    categoriaActual === categoria
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-80"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platos de la categoría con Slider Vertical */}
      <div className="w-full min-h-0 h-full overflow-hidden bg-secondary rounded-lg pt-6">
        <Swiper
          ref={swiperRef}
          //direction="vertical"
          pagination={false}
          modules={[]}
          className="mySwiper w-full !h-full"
          onSlideChange={handleSlideChange}
          initialSlide={categorias.indexOf(categoriaActual)}
          allowTouchMove={true}
          simulateTouch={true}
          keyboard={false}
        >
          {categorias.map((categoria) => {
            const productosCategoria = getProductosPorCategoria(categoria);

            return (
              <SwiperSlide key={categoria} className="!h-full !overflow-hidden">
                <div className="w-full h-full min-h-0 overflow-y-auto overscroll-contain grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 content-start auto-rows-max">
                  {productosCategoria.length > 0 ? (
                    productosCategoria.map((plato) => (
                      <motion.div
                        key={plato.id}
                        className={`bg-[#faf7f1] flex max-h-[25rem] flex-col items-center rounded-lg transition-all cursor-pointer hover:bg-dark/10 relative overflow-hidden`}
                        onClick={() => handleSeleccionarPlato(plato)}
                      >
                        <div className="w-full flex flex-col items-start justify-center p-4">
                          <p className="font-medium text-sm text-dark text-start line-clamp-1 max-w-86">
                            {plato.nombre}
                          </p>
                          <div className="w-full flex justify-between">
                            <p className="text-xs font-semibold text-dark mt-1 text-start">
                              ${plato.precio.toLocaleString("es-CO")}
                            </p>
                            {esPlatoSeleccionado(plato.id) && (
                              <div className="flex-1 flex justify-end gap-2">
                                <span className="bg-red-100 size-8 flex items-center justify-center rounded-full">
                                  <Trash className="text-red-400" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <picture className="size-full inline-block">
                          <img
                            className="size-full object-cover inline-block"
                            src={plato.img}
                            alt={plato.nombre}
                          />
                        </picture>
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
    </div>
  );
};
