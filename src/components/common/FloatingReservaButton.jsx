import { AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * Botón flotante siempre presente para abrir la reserva.
 * Se oculta automáticamente cuando el popup ya está abierto.
 */
export const FloatingReservaButton = ({ onOpen, isPopupOpen = false }) => {
  return (
    <AnimatePresence>
      {!isPopupOpen && (
        <div className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center gap-4 pointer-events-none">
          <Button
            type="button-primary"
            title="Reservar"
            iconSize="small"
            fontSize="lg"
            onClick={() => onOpen?.()}
            aria-label="Abrir reserva"
            customClass="pointer-events-auto shadow-xl shadow-black/30"
            motionProps={{
              initial: { opacity: 0, scale: 0.7, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.7, y: 20 },
              transition: { type: "spring", stiffness: 320, damping: 24 },
              whileHover: { scale: 1.06 },
              whileTap: { scale: 0.95 },
            }}
          />
          <Button
            type="enlace"
            title="Recorrer entrepues"
            href={"/descubrenos"}
            iconSize="small"
            fontSize="lg"
            aria-label="Recorrer entrepues"
            customClass="pointer-events-auto shadow-xl shadow-black/30"
            motionProps={{
              initial: { opacity: 0, scale: 0.7, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.7, y: 20 },
              transition: {
                type: "spring",
                stiffness: 320,
                damping: 24,
                delay: 0.1,
              },
              whileHover: { scale: 1.06 },
              whileTap: { scale: 0.95 },
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
