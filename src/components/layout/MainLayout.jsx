import { Outlet } from "react-router-dom";

import { useScrollLock } from "../../hooks/useScrollLock";
import { Loader } from "../LoaderComponents/Loader";
import { LoaderProvider } from "../../context/LoaderContext";
import { Header } from "../header/Header";
import { useLoaderStore } from "../../store/loaderStore";
import { ReservaComponent } from "../reserva/ReservarComponent";
import { ReservaPopupFlow } from "../reserva/popup/ReservaPopupFlow";
import { useState } from "react";

/**
 * Layout principal de la aplicación
 * Contiene header y otros componentes que aparecen en todas las páginas
 * Los modales se renderizan aquí según el estado global
 */
export default function MainLayout() {
  const [isReservePopupOpen, setIsReservePopupOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");

  const openReservePopup = (regionName = "") => {
    setSelectedRegion(regionName || "");

    setIsReservePopupOpen(true);
  };

  const closeReservePopup = () => {
    setIsReservePopupOpen(false);
  };

  const hasSeenLoader = useLoaderStore((state) => state.hasSeenLoader);
  const markLoaderAsSeen = useLoaderStore((state) => state.markLoaderAsSeen);

  const showLoader = !hasSeenLoader;
  const loadingComplete = hasSeenLoader;

  const handleLoaderComplete = () => {
    markLoaderAsSeen();
  };

  // Bloquea el scroll del home cuando algún modal está abierto
  useScrollLock(isReservePopupOpen);

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
          }}
        />
      </main>

      <ReservaPopupFlow
        isOpen={isReservePopupOpen}
        selectedRegion={selectedRegion}
        onClose={closeReservePopup}
      />
    </LoaderProvider>
  );
}
