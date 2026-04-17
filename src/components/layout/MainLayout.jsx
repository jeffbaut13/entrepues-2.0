import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useScrollLock } from "../../hooks/useScrollLock";
import { Loader } from "../LoaderComponents/Loader";
import { LoaderProvider } from "../../context/LoaderContext";
import { Header } from "../header/Header";
import { useLoaderStore } from "../../store/loaderStore";
import useReservaStore, {
  MESA_AUN_SIN_SELECCION,
} from "../../store/reservaStore";
 
import { ReservaPopupFlow } from "../reserva/popup/ReservaPopupFlow";
import { useEffect, useRef, useState } from "react";

/**
 * Layout principal de la aplicación
 * Contiene header y otros componentes que aparecen en todas las páginas
 * Los modales se renderizan aquí según el estado global
 */
export default function MainLayout() {
  const [isReservePopupOpen, setIsReservePopupOpen] = useState(false);
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const historiaVideoRef = useRef(null);
  const setMesaAsignada = useReservaStore((state) => state.setMesaAsignada);

  const openReservePopup = (regionName = "") => {
    setSelectedRegion(regionName || "");
    setMesaAsignada(MESA_AUN_SIN_SELECCION);

    setIsReservePopupOpen(true);
  };

  const closeReservePopup = () => {
    setIsReservePopupOpen(false);
  };

  const openHistoriaVideoPopup = () => {
    setIsVideoLoading(true);
    setIsVideoPopupOpen(true);
  };

  const closeHistoriaVideoPopup = () => {
    setIsVideoPopupOpen(false);
    setIsVideoLoading(false);
  };

  useEffect(() => {
    if (!isVideoPopupOpen || !historiaVideoRef.current) return;

    const playOnOpen = async () => {
      try {
        await historiaVideoRef.current.play();
      } catch (_) {}
    };

    playOnOpen();
  }, [isVideoPopupOpen]);

  const hasSeenLoader = useLoaderStore((state) => state.hasSeenLoader);
  const markLoaderAsSeen = useLoaderStore((state) => state.markLoaderAsSeen);

  const showLoader = !hasSeenLoader;
  const loadingComplete = hasSeenLoader;

  const handleLoaderComplete = () => {
    markLoaderAsSeen();
  };

  // Bloquea el scroll del home cuando algún modal está abierto
  useScrollLock(isReservePopupOpen || isVideoPopupOpen);

  return (
    <LoaderProvider loadingComplete={loadingComplete}>
      <Header loading={loadingComplete} />
      <main className="w-full relative bg-black text-brown">
        {/* Loader */}
        {showLoader && <Loader onLoadingComplete={handleLoaderComplete} />}

        {/* Contenido de las páginas - Siempre renderizado, visible detrás del loader */}
        <Outlet
          context={{
            onOpenReservePopup: openReservePopup,
            onOpenHistoriaVideoPopup: openHistoriaVideoPopup,
            isReservePopupOpen,
            isVideoPopupOpen,
          }}
        />
      </main>

      <ReservaPopupFlow
        isOpen={isReservePopupOpen}
        selectedRegion={selectedRegion}
        onClose={closeReservePopup}
      />

      <AnimatePresence>
        {isVideoPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeHistoriaVideoPopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeHistoriaVideoPopup}
                aria-label="Cerrar video de historia"
                className="absolute top-3 right-3 z-10 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-all duration-200"
              >
                <X size={20} />
              </button>

              {isVideoLoading && (
                <div className="absolute inset-0 z-[5] bg-black flex items-center justify-center">
                  <div
                    className="w-14 h-14 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin"
                    aria-label="Cargando video"
                    role="status"
                  />
                </div>
              )}

              <video
                ref={historiaVideoRef}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full h-auto max-h-[85dvh] bg-black"
                src="/video/historia/historia.mp4"
                onLoadedData={() => setIsVideoLoading(false)}
                onCanPlay={() => setIsVideoLoading(false)}
                onError={() => setIsVideoLoading(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoaderProvider>
  );
}
