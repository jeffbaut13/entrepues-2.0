import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  obtenerCatalogoNormalizado,
  obtenerCategoriasCatalogo,
  obtenerNombreCategoriaDisplay,
  obtenerProductosCatalogo,
  resolverCategoriaKey,
} from "../../firebase/actions";
import { Intro } from "./Intro";
import { Loader } from "../ui/Loader";
import { useHeaderChangeStore } from "../../store/headerChangeStore";

export const CartaComponent = () => {
  const [catalogo, setDataCatalogo] = useState({});
  const [loading, setLoading] = useState(false);
  const [categoriaSelected, setCategoriaSelected] = useState(null);
  const scrollContainerRef = useRef(null);
  const subcategoriaRefs = useRef({});
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});
  const categoriaDesdeScrollRef = useRef(false);
  const bloquearObserverHastaRef = useRef(0);
  const { setChangeDark } = useHeaderChangeStore();

  // Cargar todo el catalogo de productos de firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const dataCatalogo = await obtenerCatalogoNormalizado();
        setDataCatalogo(dataCatalogo);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const catalogoTodo = obtenerProductosCatalogo(catalogo);

  const productosAgrupadosPorSubcategoria = useMemo(() => {
    const grupos = new Map();

    catalogoTodo.forEach((producto) => {
      const categoriaKey = producto.categoria || "sin_categoria";
      const subcategoriaKey = producto.subcategoria || "sin_subcategoria";
      const key = `${categoriaKey}__${subcategoriaKey}`;

      if (!grupos.has(key)) {
        grupos.set(key, {
          key,
          categoria: categoriaKey,
          categoriaNombre:
            producto.categoriaDisplayName ||
            producto.categoriaNombre ||
            categoriaKey,
          subcategoriaKey,
          nombre:
            producto.subcategoriaNombre || producto.subcategoria || "Otros",
          productos: [],
        });
      }

      grupos.get(key).productos.push(producto);
    });

    return Array.from(grupos.values());
  }, [catalogoTodo]);

  /* Obtener los titulso de las categorias */
  const categorias = useMemo(() => {
    return obtenerCategoriasCatalogo(catalogo).map(
      (categoria) => categoria.displayName || categoria.nombre
    );
  }, [catalogo]);

  const categoriaDisplayPorKey = useMemo(() => {
    const mapa = {};
    obtenerCategoriasCatalogo(catalogo).forEach((categoria) => {
      const key = categoria?.key;
      if (!key) return;
      mapa[key] = categoria.displayName || categoria.nombre;
    });
    return mapa;
  }, [catalogo]);

  const categoriaKeySeleccionada = resolverCategoriaKey(categoriaSelected);

  const subcategoriaObjetivoKey = useMemo(() => {
    if (!categoriaKeySeleccionada) return null;

    const objetivo = productosAgrupadosPorSubcategoria.find(
      (subcategoria) => subcategoria.categoria === categoriaKeySeleccionada
    );

    return objetivo?.key || null;
  }, [productosAgrupadosPorSubcategoria, categoriaKeySeleccionada]);

  useEffect(() => {
    if (categoriaDesdeScrollRef.current) {
      categoriaDesdeScrollRef.current = false;
      return;
    }

    if (!categoriaKeySeleccionada || !subcategoriaObjetivoKey) return;
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const target = subcategoriaRefs.current[subcategoriaObjetivoKey];
    if (!target) return;

    bloquearObserverHastaRef.current = Date.now() + 2000;

    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetTop =
        container.scrollTop + (targetRect.top - containerRect.top) - 8;

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    });
  }, [categoriaKeySeleccionada, subcategoriaObjetivoKey]);

  useEffect(() => {
    if (!categoriaSelected) return;
    if (!tabsContainerRef.current) return;

    const tabElement = tabRefs.current[categoriaSelected];
    if (!tabElement) return;

    tabElement.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [categoriaSelected]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (!productosAgrupadosPorSubcategoria.length) return;

    let rafId = null;

    const updateCategoriaFromScroll = () => {
      if (Date.now() < bloquearObserverHastaRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const activationLine = containerRect.top + 24;

      let categoriaKeyActiva = null;

      for (const subcategoria of productosAgrupadosPorSubcategoria) {
        const element = subcategoriaRefs.current[subcategoria.key];
        if (!element) continue;

        const sectionTop = element.getBoundingClientRect().top;
        if (sectionTop <= activationLine) {
          categoriaKeyActiva = subcategoria.categoria;
        } else if (!categoriaKeyActiva) {
          categoriaKeyActiva = subcategoria.categoria;
          break;
        } else {
          break;
        }
      }

      if (!categoriaKeyActiva) return;

      const categoriaActualKey = resolverCategoriaKey(categoriaSelected);
      if (categoriaActualKey === categoriaKeyActiva) return;

      const displayName =
        categoriaDisplayPorKey[categoriaKeyActiva] ||
        obtenerNombreCategoriaDisplay(categoriaKeyActiva);

      categoriaDesdeScrollRef.current = true;
      setCategoriaSelected(displayName);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCategoriaFromScroll);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", onScroll);
    };
  }, [
    categoriaSelected,
    categoriaDisplayPorKey,
    productosAgrupadosPorSubcategoria,
  ]);

  const handleChange = (categoria) => {
    setChangeDark();
    setCategoriaSelected(categoria);
  };

  if (loading) {
    return <Loader />;
  }

  if (categoriaSelected === null) {
    return (
      <div className="w-full h-dvh">
        <Intro categorias={categorias} setCategoriaSelected={handleChange} />
      </div>
    );
  }

  return (
    <div className="w-full h-dvh">
      <div className={styles.main}>
        <div className="size-full md:max-w-md rounded-lg overflow-hidden">
          <div className="h-12" />
          <div className="text-center size-full rounded-lg flex flex-col items-center justify-center">
            <div
              ref={tabsContainerRef}
              className="overflow-x-auto scrollbar-hide w-full"
            >
              <div className="flex w-max">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    ref={(element) => {
                      if (element) {
                        tabRefs.current[cat] = element;
                      } else {
                        delete tabRefs.current[cat];
                      }
                    }}
                    className={`relative flex justify-center items-center font-parkson tracking-widest min-w-34 min-h-[50px] px-4 py-2 border-r border-dark/30 whitespace-nowrap hover:bg-gray-300 transition-colors ${
                      cat === categoriaSelected ? "opacity-100" : "opacity-40"
                    }`}
                    onClick={() => setCategoriaSelected(cat)}
                  >
                    <span className="w-fit relative flex flex-col items-center !text-[20px]">
                      {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                      {cat === categoriaSelected && (
                        <motion.span
                          layoutId="carta-categoria-underline"
                          className="h-1 w-full rounded-full bg-dark"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={categoriaKeySeleccionada || "categoria-vacia"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full relative z-10 flex bg-white items-center min-h-[92px] max-h-[93px] overflow-hidden"
              >
                <h2 className="pl-[28px] font-parkson w-1/2 inline-flex ">
                  <span className="!text-[45px] tracking-widest w-full text-start leading-[70px]">
                    {categoriaSelected}
                  </span>{" "}
                </h2>
                <picture className="flex-1 overflow-hidden">
                  <img
                    className="object-cover w-full h-full"
                    src={`/imagenes/carta/${categoriaKeySeleccionada}.webp`}
                    alt={categoriaSelected}
                  />
                </picture>
              </motion.div>
            </AnimatePresence>

            <div className="w-full px-[16px] bg-[#fff6ea] rounded-t-[16px] -translate-y-4 pt-0.5 z-20 relative">
              <div
                ref={scrollContainerRef}
                className="space-y-8 text-start overflow-auto max-h-[60vh] px-[12px] mt-[35px] pb-[35px]"
              >
                {productosAgrupadosPorSubcategoria.map((subcategoria) => (
                  <div
                    key={subcategoria.key}
                    ref={(element) => {
                      if (element) {
                        subcategoriaRefs.current[subcategoria.key] = element;
                      } else {
                        delete subcategoriaRefs.current[subcategoria.key];
                      }
                    }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-2xl pb-2">
                      {subcategoria.nombre.charAt(0).toUpperCase() +
                        subcategoria.nombre.slice(1).toLowerCase()}
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      {subcategoria.productos.map((producto) => (
                        <div key={producto.id}>
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-semibold !text-[14px] leading-tight">
                              {producto.nombre}
                            </h4>
                            <p className="font-bold !text-[14px] whitespace-nowrap">
                              ${producto.precio?.toLocaleString("es-CO") || "0"}
                            </p>
                          </div>

                          {producto.descripcion && (
                            <p className="!text-[11px] text-dark/80">
                              {producto.descripcion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  main: "size-full mx-auto flex justify-center items-center bg-[#fff6ea] flex-col",
  color: "!text-[#fff6ea]",
};
