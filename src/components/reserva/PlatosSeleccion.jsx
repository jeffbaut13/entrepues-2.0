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
import { ChevronLeft } from "lucide-react";
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
  onCheckoutReady,
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
  const { prepararDatosCheckout, setPasoReserva, setCurrentStep } =
    useReservaStore();

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
    return obtenerCategoriasCatalogo(catalogo).map((categoria) => ({
      key: categoria.key,
      displayName: categoria.displayName || categoria.nombre,
    }));
  }, [catalogo]);

  useEffect(() => {
    if (categorias.length === 0) return;

    const existeCategoriaActual = categorias.some(
      (categoria) => categoria.key === categoriaActual
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
    }
  }, [asistentesLista, categorias.length, productosIndexados]);

  // ===========================
  // FUNCIONES DE UTILIDAD DEL COMPONENTE
  // ===========================

  // Obtener productos por categoría específica
  const getProductosPorCategoria = (categoriaKey) => {
    return obtenerProductosCatalogo(catalogo, { categoria: categoriaKey });
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
  const handleCategoriaChange = (categoriaKey) => {
    const categoriaIndex = categorias.findIndex(
      (categoria) => categoria.key === categoriaKey
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

  //Ir atras a datos dereserva

  const Atras = () => {
    setPasoReserva("platos", { habilitado: false });
    setCurrentStep(2);
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

      onCheckoutReady?.(resultado.data);
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

  const ultimoAsistenteIndex = Math.max(0, asistentesLista.length - 1);

  const ctaEsPago =
    asistentesLista.length > 0 && asistenteActual >= ultimoAsistenteIndex;

  const handleBottomCta = () => {
    if (ctaEsPago) {
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
      <div className="w-full h-full flex mx-auto items-center justify-center pt-6 px-4">
        <div className="flex-1 h-full flex items-center justify-center">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="size-full text-center flex items-center justify-between gap-4"
            >
              <div className="bg-black/20 animate-pulse h-full w-1/2 rounded-2xl p-6 flex flex-col items-center justify-evenly">
                <div className="bg-black/5 w-full h-16 rounded-full" />
                <div className="bg-black/5 w-full h-80 rounded-2xl" />
                <div className="bg-black/5 w-full h-10 rounded-full" />
              </div>
              <div className="bg-black/20 animate-pulse h-full w-1/2 rounded-2xl p-6 flex flex-col items-center justify-evenly">
                <div className="bg-black/5 w-full h-10 rounded-full" />
                <div className="bg-black/5 w-full h-14 rounded-full" />
                <div className="bg-black/5 w-full h-126 rounded-2xl" />
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-fit flex flex-col items-center justify-between"
              >
                <div className="w-fit">
                  <h2 className="text-start !text-5xl font-parkson">Hola,</h2>
                  <h4 className="text-start !text-8xl !leading-18 font-parkson font-bold">
                    Elige tus platos <br /> desde ahora
                  </h4>
                  <h2 className="text-start mt-8 !text-xl">
                    Estarán 5 minutos después de que llegues a tu mesa
                  </h2>
                </div>

                <div className="w-96 space-y-4 mt-12">
                  <div className="w-full flex items-start gap-2">
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <Swiper
                        ref={asistentesSwiperRef}
                        slidesPerView={3}
                        spaceBetween={0}
                        className="w-full"
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
                                    opacity:
                                      asistenteActual === index ? 1 : 0.2,
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
                                  <p>Elige almenos un plato</p>
                                </motion.div>
                              )}
                            </motion.div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="flex-1 h-full flex items-center">
                <MenuSelected
                  categorias={categorias}
                  categoriaActual={categoriaActual}
                  handleCategoriaChange={handleCategoriaChange}
                  swiperRef={swiperRef}
                  handleSlideChange={handleSlideChange}
                  getProductosPorCategoria={getProductosPorCategoria}
                  esPlatoSeleccionado={esPlatoSeleccionado}
                  handleSeleccionarPlato={handleSeleccionarPlato}
                  component={
                    <>
                      <div className="w-full flex flex-wrap items-center justify-center gap-4">
                        <span className="!text-2xl font-semibold">
                          Subtotal:
                        </span>
                        <span className="!text-2xl font-bold">
                          ${totalGeneralPrecio.toLocaleString("es-CO")}
                        </span>
                        <div className="w-full flex justify-center items-center gap-4">
                          {asistenteActual >= 1 && (
                            <Button
                              type="just-icon"
                              Icon={ChevronLeft}
                              disabled={guardando}
                              onClick={() =>
                                handleSelectAsistente(
                                  Math.max(asistenteActual - 1, 0)
                                )
                              }
                            />
                          )}
                          <Button
                            onClick={handleBottomCta}
                            title={
                              guardando
                                ? "Guardando..."
                                : ctaEsPago
                                ? "Pagar"
                                : "Siguiente persona"
                            }
                            type="button-dark"
                            width="medio"
                            fontSize="xl"
                            disabled={guardando}
                          />
                        </div>
                      </div>
                    </>
                  }
                />
              </div>
            </>
          )}
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
  handleCategoriaChange,
  swiperRef,
  handleSlideChange,
  getProductosPorCategoria,
  esPlatoSeleccionado,
  handleSeleccionarPlato,
  component,
}) => {
  return (
    <div className="w-full  h-full bg-white grid grid-rows-[auto minmax(0,1fr)] overflow-hidden rounded-3xl gap-4 px-4 py-6">
      {/* <h3 className="text-xl px-4">Selecciona los platos por persona</h3> */}
      {/* Nombres de Categorías */}
      {categorias.length > 0 && (
        <div className="font-parkson shrink-0 px-2">
          <div className="w-full flex justify-between overflow-x-auto">
            {categorias.map((categoria) => (
              <div
                className={`w-fit relative flex items-center justify-center border-dark/20 `}
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
                      " "
                    )
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
      {/* Platos de la categoría con Slider Vertical */}
      <div className="w-full min-h-0 h-full overflow-hidden">
        <Swiper
          ref={swiperRef}
          //direction="vertical"
          pagination={false}
          modules={[]}
          className="mySwiper w-full !h-full"
          onSlideChange={handleSlideChange}
          initialSlide={Math.max(
            0,
            categorias.findIndex(
              (categoria) => categoria.key === categoriaActual
            )
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
                <div className="w-full h-full min-h-0 overflow-y-auto overscroll-contain grid grid-cols-1 gap-3 content-start auto-rows-max pl-2 pr-4">
                  {productosCategoria.length > 0 ? (
                    productosCategoria.map((plato) => (
                      <motion.div
                        key={plato.id}
                        className={`group p-1.5 max-h-20 flex items-center justify-between rounded-2xl border border-[#e6e6e6] transition-all cursor-pointer ${
                          esPlatoSeleccionado(plato.id) ? "bg-[#e6e6e6]" : ""
                        } hover:bg-dark/10 relative overflow-hidden`}
                        onClick={() => handleSeleccionarPlato(plato)}
                      >
                        <picture className="w-20 h-full inline-block rounded-2xl overflow-hidden">
                          <img
                            className="size-full object-cover inline-block"
                            src={plato.img}
                            alt={plato.nombre}
                          />
                        </picture>
                        <p className="pl-4 font-medium text-sm w-62 text-start line-clamp-1 whitespace-normal">
                          {plato.nombre}
                        </p>
                        <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-md bg-dark text-white absolute left-[22%] top-0 !text-xs transition-all duration-500 delay-200">
                          {plato.nombre}
                        </span>

                        <p className="font-bold mt-1 text-start">
                          ${plato.precio.toLocaleString("es-CO")}
                        </p>

                        <div className="w-fits flex flex-col items-start justify-center p-4">
                          <div className="w-full flex justify-end">
                            <span
                              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                esPlatoSeleccionado(plato.id)
                                  ? "bg-[#22ae63]"
                                  : "bg-dark/15"
                              }`}
                            >
                              <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                  esPlatoSeleccionado(plato.id)
                                    ? "translate-x-7"
                                    : "translate-x-1"
                                }`}
                              />
                            </span>
                          </div>
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
