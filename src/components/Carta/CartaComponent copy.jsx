import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  obtenerCatalogoNormalizado,
  obtenerCategoriasCatalogo,
  obtenerProductosCatalogo,
  obtenerSubcategoriasConProductos,
  resolverCategoriaKey,
} from "../../firebase/actions";
import { Intro } from "./Intro";
import { Loader } from "../ui/Loader";

export const CartaComponent = () => {
  const [catalogo, setDataCatalogo] = useState({});
  const [loading, setLoading] = useState(false);
  const [categoriaSelected, setCategoriaSelected] = useState(null);

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
  console.log(catalogoTodo);

  /* Obtener los titulso de las categorias */
  const categorias = useMemo(() => {
    return obtenerCategoriasCatalogo(catalogo).map(
      (categoria) => categoria.displayName || categoria.nombre
    );
  }, [catalogo]);

  /* Obtener subcategorias con productos */
  const getProductosPorCategoria = (seleccion) => {
    return obtenerSubcategoriasConProductos(
      catalogo,
      resolverCategoriaKey(seleccion)
    );
  };

  const ProductosSelccionados = getProductosPorCategoria(categoriaSelected);
  const categoriaKeySeleccionada = resolverCategoriaKey(categoriaSelected);
  console.log(categorias);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full h-dvh">
      <AnimatePresence mode="wait" initial={false}>
        {categoriaSelected === null ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.985, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.99, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="size-full"
          >
            <Intro
              categorias={categorias}
              setCategoriaSelected={setCategoriaSelected}
            />
          </motion.div>
        ) : (
          <motion.div
            key="categoria"
            initial={{ opacity: 0, scale: 0.985, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.99, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={styles.main}
          >
            <div className="size-full md:max-w-md rounded-lg overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.35, ease: "easeOut" }}
                className="text-center size-full rounded-lg flex flex-col items-center justify-center"
              >
                <div className="overflow-x-auto scrollbar-hide w-full">
                  <div className="flex w-max">
                    {categorias.map((cat) => (
                      <button
                        key={cat}
                        className={`relative flex justify-center items-center font-parkson tracking-widest min-w-34 min-h-[50px] px-4 py-2 border-r border-dark/30 whitespace-nowrap hover:bg-gray-300 transition-colors ${
                          cat === categoriaSelected
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                        onClick={() => setCategoriaSelected(cat)}
                      >
                        <span className="w-fit relative flex flex-col items-center !text-[20px]">
                          {cat.charAt(0).toUpperCase() +
                            cat.slice(1).toLowerCase()}
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
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div className="relative z-10 flex bg-white items-center max-h-[92px] overflow-hidden">
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
                    </div>

                    <div className="w-full px-[16px] bg-[#fff6ea] rounded-t-[16px] -translate-y-4 pt-0.5 z-20 relative">
                      <div className="space-y-8 text-start overflow-auto max-h-[70vh] px-[12px] mt-[35px] pb-[35px]">
                        {catalogo.map((subcategoria) => (
                          <motion.div
                            key={subcategoria.key}
                            className="space-y-4"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            {subcategoria.nombre !== categoriaSelected && (
                              <h3 className="font-semibold text-2xl border-b border-dark/20 pb-2">
                                {subcategoria.nombre.charAt(0).toUpperCase() +
                                  subcategoria.nombre.slice(1).toLowerCase()}
                              </h3>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                              {subcategoria.productos.map((producto) => (
                                <motion.div
                                  key={producto.id}
                                  className="space-y-2"
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <h4 className="font-semibold !text-[14px] leading-tight">
                                      {producto.nombre}
                                    </h4>
                                    <p className="font-bold !text-[14px] whitespace-nowrap">
                                      $
                                      {producto.precio?.toLocaleString(
                                        "es-CO"
                                      ) || "0"}
                                    </p>
                                  </div>

                                  {producto.descripcion && (
                                    <p className="!text-[11px] text-dark/80">
                                      {producto.descripcion}
                                    </p>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  main: "size-full mx-auto flex justify-center items-center bg-[#fff6ea] flex-col",
  color: "!text-[#fff6ea]",
};
