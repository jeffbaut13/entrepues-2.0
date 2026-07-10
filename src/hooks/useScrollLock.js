import { useEffect, useRef } from "react";
import useReservaStore from "../store/reservaStore";
import useMenuStore from "../store/menuStore";
import useCartStore from "../store/cartStore";

/**
 * Hook que bloquea el scroll del documento cuando algún modal está abierto
 * Solo permite scroll dentro del contenido del modal
 * 
 * Uso:
 * En el componente más alto que envuelve los modales (MainLayout)
 */
export const useScrollLock = (isReservePopupOpen) => {
  const scrollYRef = useRef(0);
  const wasLockedRef = useRef(false);

  const setModalLockState = (isLocked) => {
    if (typeof document === "undefined") return;

    const value = isLocked ? "true" : "false";
    document.body.dataset.modalOpen = value;
    document.documentElement.dataset.modalOpen = value;
  };

  // Suscribirse a los cambios de los stores
  const isBookingOpen = useReservaStore((state) => state.isBookingOpen);
  const isMenuOpen = useMenuStore((state) => state.isMenuOpen);
  const isCartOpen = useCartStore((state) => state.isCartOpen);

  // Detectar si algún modal está abierto
  const isAnyModalOpen = isBookingOpen || isMenuOpen || isCartOpen || isReservePopupOpen;

  useEffect(() => {
    if (isAnyModalOpen && !wasLockedRef.current) {
      // Guardar posición actual para restaurarla al cerrar popup/modal.
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      wasLockedRef.current = true;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      setModalLockState(true);
      return;
    }

    if (!isAnyModalOpen && wasLockedRef.current) {
      const savedScrollY = scrollYRef.current;

      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      setModalLockState(false);

      window.scrollTo(0, savedScrollY);
      wasLockedRef.current = false;
    }

    // Cleanup al desmontar o cuando se cierre el modal
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      setModalLockState(false);

      if (wasLockedRef.current) {
        window.scrollTo(0, scrollYRef.current);
        wasLockedRef.current = false;
      }
    };
  }, [isAnyModalOpen]);
};

export default useScrollLock;
