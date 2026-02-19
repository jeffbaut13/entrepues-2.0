import { Outlet } from "react-router-dom";

import { useScrollLock } from "../../hooks/useScrollLock";
import { Loader } from "../LoaderComponents/Loader";
import { LoaderProvider } from "../../context/LoaderContext";
import { Header } from "../header/Header";
import { useLoaderStore } from "../../store/loaderStore";

/**
 * Layout principal de la aplicación
 * Contiene header y otros componentes que aparecen en todas las páginas
 * Los modales se renderizan aquí según el estado global
 */
export default function MainLayout() {
  const hasSeenLoader = useLoaderStore((state) => state.hasSeenLoader);
  const markLoaderAsSeen = useLoaderStore((state) => state.markLoaderAsSeen);

  const showLoader = !hasSeenLoader;
  const loadingComplete = hasSeenLoader;

  const handleLoaderComplete = () => {
    markLoaderAsSeen();
  };

  // Bloquea el scroll del home cuando algún modal está abierto
  useScrollLock();

  return (
    <LoaderProvider loadingComplete={loadingComplete}>
      <Header loading={loadingComplete} />
      <main className="w-full relative bg-black text-brown">
        {/* Loader */}
        {showLoader && <Loader onLoadingComplete={handleLoaderComplete} />}

        {/* Contenido de las páginas - Siempre renderizado, visible detrás del loader */}
        <Outlet />
      </main>
    </LoaderProvider>
  );
}
