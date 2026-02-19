import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";
import {
  obtenerCatalogoNormalizado,
  obtenerCategoriasCatalogo,
  obtenerSubcategoriasConProductos,
  obtenerNombreCategoriaDisplay,
} from "../../firebase/actions";
import { capitalizeFirst } from "../../constants/firsLetterUppercase";

export const MenuComponent = () => {
  // ===========================
  // ESTADOS
  // ===========================
  const [catalogo, setCatalogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [scrollSpyReady, setScrollSpyReady] = useState(false);
  const scrollContainerRef = useRef(null);
  const subcategoriaRefs = useRef({});
  const navCategoriasRef = useRef(null);
  const categoryButtonRefs = useRef({});
  const categoryChangeTimeoutRef = useRef(null);

  // ===========================
  // EFECTOS Y MEMOS
  // ===========================

  // Cargar datos de Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await obtenerCatalogoNormalizado();
        setCatalogo(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
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

  // Detectar categoría activa al hacer scroll manual (scroll-spy)
  useEffect(() => {
    if (!mostrarProductos) {
      setScrollSpyReady(false);
      return;
    }

    let rafId = null;

    const waitForContainer = () => {
      if (scrollContainerRef.current) {
        setScrollSpyReady(true);
        return;
      }

      rafId = requestAnimationFrame(waitForContainer);
    };

    waitForContainer();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mostrarProductos]);

  // Detectar categoría activa al hacer scroll manual (scroll-spy)
  useEffect(() => {
    if (
      !mostrarProductos ||
      !scrollSpyReady ||
      !scrollContainerRef.current ||
      categorias.length === 0
    ) {
      return;
    }

    const container = scrollContainerRef.current;

    let rafId = null;
    let initRafId = null;
    let initTimeoutId = null;
    let observer = null;

    const updateActiveCategory = () => {
      const sections = categorias
        .map((categoria) => ({
          categoria,
          element: subcategoriaRefs.current[categoria],
        }))
        .filter((item) => item.element);

      if (sections.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const activationLine = containerRect.top + 72;

      let activeCategory = sections[0].categoria;

      for (const { categoria, element } of sections) {
        const sectionTop = element.getBoundingClientRect().top;
        if (sectionTop <= activationLine) {
          activeCategory = categoria;
        } else {
          break;
        }
      }

      setCategoriaSeleccionada((prev) =>
        prev === activeCategory ? prev : activeCategory
      );
    };

    const onScroll = () => {
      if (categoryChangeTimeoutRef.current) {
        clearTimeout(categoryChangeTimeoutRef.current);
        categoryChangeTimeoutRef.current = null;
      }

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveCategory);
    };

    observer = new IntersectionObserver(
      () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateActiveCategory);
      },
      {
        root: container,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    categorias.forEach((categoria) => {
      const element = subcategoriaRefs.current[categoria];
      if (element) observer.observe(element);
    });

    updateActiveCategory();
    initRafId = requestAnimationFrame(() => {
      updateActiveCategory();
    });
    initTimeoutId = setTimeout(updateActiveCategory, 220);
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (initRafId) cancelAnimationFrame(initRafId);
      if (initTimeoutId) clearTimeout(initTimeoutId);
      if (observer) observer.disconnect();
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mostrarProductos, scrollSpyReady, categorias]);

  useEffect(() => {
    return () => {
      if (categoryChangeTimeoutRef.current) {
        clearTimeout(categoryChangeTimeoutRef.current);
      }
    };
  }, []);

  // Establecer categoría inicial al mostrar productos
  useEffect(() => {
    if (mostrarProductos && categorias.length > 0 && !categoriaSeleccionada) {
      setCategoriaSeleccionada(categorias[0]);
    }
  }, [mostrarProductos, categorias, categoriaSeleccionada]);

  // Mantener visible el botón activo en mobile
  useEffect(() => {
    if (
      !mostrarProductos ||
      !categoriaSeleccionada ||
      !navCategoriasRef.current
    ) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const activeButton = categoryButtonRefs.current[categoriaSeleccionada];
    if (!activeButton) return;

    activeButton.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [mostrarProductos, categoriaSeleccionada]);

  // ===========================
  // FUNCIONES UTILITARIAS
  // ===========================

  // Obtener productos por categoría específica
  const getProductosPorCategoria = (categoria) => {
    return obtenerSubcategoriasConProductos(catalogo, categoria);
  };

  const categoriaActiva = categoriaSeleccionada || categorias[0] || "";

  // ===========================
  // MANEJADORES DE EVENTOS
  // ===========================

  const handleCategorySelect = (categoria) => {
    setMostrarProductos(true);
    if (categoryChangeTimeoutRef.current) {
      clearTimeout(categoryChangeTimeoutRef.current);
    }

    categoryChangeTimeoutRef.current = setTimeout(() => {
      setCategoriaSeleccionada(categoria);
      categoryChangeTimeoutRef.current = null;
    }, 140);
  };

  const handleKategoryNavigation = (categoria) => {
    if (categoryChangeTimeoutRef.current) {
      clearTimeout(categoryChangeTimeoutRef.current);
    }

    categoryChangeTimeoutRef.current = setTimeout(() => {
      setCategoriaSeleccionada(categoria);
      categoryChangeTimeoutRef.current = null;
    }, 140);

    // Scroll automático a la subcategoría
    const subcategoriaElement = subcategoriaRefs.current[categoria];
    if (subcategoriaElement && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const sectionRect = subcategoriaElement.getBoundingClientRect();
      const targetTop =
        container.scrollTop + (sectionRect.top - containerRect.top) - 10;

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    }
  };

  const handleVolver = () => {
    if (categoryChangeTimeoutRef.current) {
      clearTimeout(categoryChangeTimeoutRef.current);
      categoryChangeTimeoutRef.current = null;
    }

    setMostrarProductos(false);
    setCategoriaSeleccionada(null);
  };

  // ===========================
  // RENDER
  // ===========================

  if (loading) {
    return (
      <div
        className="w-full h-dvh relative overflow-hidden bg-cover bg-center flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/imagenes/background-home.jpg')" }}
      >
        <div className="absolute size-full top-0 left-0 bg-black/20 backdrop-blur-md z-0" />
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <p className="text-2xl font-semibold">Cargando menú...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh relative overflow-hidden bg-cover bg-center flex flex-col bg-dark text-white">
      {mostrarProductos ? (
        <div className="absolute size-full top-0 left-0 bg-secondary z-0" />
      ) : (
        <div className="absolute size-full top-0 left-0 bg-black/20 backdrop-blur-md z-0" />
      )}

      <AnimatePresence mode="wait">
        {!mostrarProductos ? (
          // Vista inicial - Solo categorías
          <motion.div
            key="categorias"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 relative z-10 flex items-center justify-center"
          >
            <div className="max-w-4xl flex flex-col items-center text-center">
              <h1 className={styles.title}>Menú</h1>

              <div className="w-full flex flex-col justify-center gap-4 max-w-xs">
                {categorias.map((categoria) => (
                  <motion.div
                    key={categoria}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleCategorySelect(categoria)}
                      title={obtenerNombreCategoriaDisplay(categoria)}
                      type="button-primary"
                      customClass="w-full !py-4 !bg-black/40 !text-secondary !border-secondary backdrop-blur-xs text-xl font-semibold !rounded-2xl md:!text-3xl"
                    />
                  </motion.div>
                ))}
              </div>
              <p className="mt-12 ">
                Si usted tiene alguna observación con respecto <br />a alergias,
                por favor notifíquelas antes de ordenar
              </p>
            </div>
          </motion.div>
        ) : (
          // Vista de productos
          <motion.div
            key="productos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 relative z-10 flex w-full min-w-0 flex-col overflow-hidden text-dark max-w-4xl mx-auto md:py-12 py-4"
          >
            <div className="absolute size-full top-0 left-0 bg-gradient-to-t to-10% from-2% from-secondary pointer-events-none z-50" />
            {/* Categorías horizontales */}
            <div className="flex-shrink-0 mb-4 w-full min-w-0 overflow-hidden px-6">
              <div
                ref={navCategoriasRef}
                className="flex w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2 md:justify-between"
              >
                {categorias.map((categoria, index) => (
                  <button
                    key={categoria}
                    ref={(el) => {
                      categoryButtonRefs.current[categoria] = el;
                    }}
                    onClick={() => handleKategoryNavigation(categoria)}
                    className={`px-4 shrink-0 whitespace-nowrap font-bold font-parkson md:text-4xl text-2xl flex flex-col ${
                      categoriaSeleccionada === categoria
                        ? "opacity-100"
                        : "opacity-40"
                    }`}
                  >
                    {obtenerNombreCategoriaDisplay(categoria)}
                    {categoriaSeleccionada === categoria && (
                      <span className="w-full md:h-1 h-0.5 rounded-full bg-dark" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="w-full h-36 bg-center bg-cover flex items-center justify-center relative"
              style={{
                backgroundImage: `url('/imagenes/menu/${categoriaActiva}.webp')`,
              }}
            >
              <div className="absolute size-full top-0 left-0 bg-black/40 z-0" />
              <h2 className="font-parkson text-5xl text-center text-secondary relative z-10">
                {obtenerNombreCategoriaDisplay(categoriaActiva)}
              </h2>
            </div>

            {/* Contenido de productos con scroll */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pb-6 bg-secondary rounded-t-2xl -translate-y-4"
            >
              <div className="max-w-6xl mx-auto space-y-12">
                {categorias.map((categoria) => {
                  const subcategoriasConProductos =
                    getProductosPorCategoria(categoria);

                  return (
                    <div
                      key={categoria}
                      ref={(el) => (subcategoriaRefs.current[categoria] = el)}
                      data-categoria={categoria}
                      className="space-y-8 pt-6 px-6"
                    >
                      {subcategoriasConProductos.map((subcategoriaData) => (
                        <div
                          key={subcategoriaData.nombre}
                          className="space-y-4 "
                        >
                          <h3 className="font-semibold text-2xl border-b border-white/30 pb-2">
                            {capitalizeFirst(
                              subcategoriaData.nombre.replace(/_/g, " ")
                            )}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {subcategoriaData.productos.map((producto) => (
                              <motion.div key={producto.id}>
                                <div className="flex flex-col items-start gap-4">
                                  <div className="w-full flex justify-between">
                                    <h4 className="font-semibold text-lg">
                                      {producto.nombre}
                                    </h4>
                                    <p className="font-bold text-xl ">
                                      $
                                      {producto.precio?.toLocaleString(
                                        "es-CO"
                                      ) || "0"}
                                    </p>
                                  </div>
                                  <p className="">
                                    {producto.descripcion ||
                                      "Delicioso plato de nuestra cocina"}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  title: "font-parkson text-[42px] text-center tracking-widest",
};
