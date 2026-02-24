import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PlatosSeleccion from "./PlatosSeleccion";
import useReservaStore from "../../store/reservaStore";

export const SeleccionPlatosComponent = () => {
  const navigate = useNavigate();
  const detalleAsistentes = useReservaStore((state) => state.detalleAsistentes);
  const isDatosReservaCompletados = useReservaStore(
    (state) => state.isDatosReservaCompletados
  );
  const hasAsistentes = (detalleAsistentes?.asistentes || []).length > 0;
  const canAccessSeleccionPlatos =
    isDatosReservaCompletados && hasAsistentes;

  useEffect(() => {
    if (!canAccessSeleccionPlatos) {
      navigate("/reservar", { replace: true });
    }
  }, [canAccessSeleccionPlatos, navigate]);

  if (!canAccessSeleccionPlatos) {
    return null;
  }

  return (
    <motion.div
      className="w-full lg:h-full h-full mx-auto flex justify-center items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="py-8 md:max-w-7xl w-full max-h-180 h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        <PlatosSeleccion asistentes={detalleAsistentes} />
      </motion.div>
    </motion.div>
  );
};
