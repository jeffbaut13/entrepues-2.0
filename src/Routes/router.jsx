import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Layout
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/admin/AdminLayout";
import VideoScrollLayout from "../components/layout/videscrollLayout";

// Admin Pages
import AdminPage from "../pages/admin/AdminPage";
import AdminReservasPage from "../pages/admin/AdminReservasPage";
import AdminConfigPage from "../pages/admin/AdminConfigPage";
import AdminStoragePage from "../pages/admin/AdminStoragePage";

// Pages
import HomePage from "../pages/home/HomePage";
import { VideoScrollComponent } from "../components/VideoScroll/VideoScrollComponent";
import NotFoundPage from "../pages/NotFoundPage";
import CartaPage from "../pages/carta/CartaPage";
import { RecetaSemanalPage } from "../pages/Receta-semanal/RecetaSemanalPage";

/**
 * Configuración centralizada de rutas de la aplicación
 * Define todas las rutas, sus componentes y lógica de renderizado
 */
function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Layout principal - contiene Header y Modal */}
        <Route element={<MainLayout />}>
          {/* Ruta principal - Home */}
          <Route path="/" element={<HomePage />} />

          <Route path="/carta" element={<CartaPage />} />
          <Route path="/receta-semanal" element={<RecetaSemanalPage />} />

        </Route>
        <Route path="/descubrenos" element={<VideoScrollLayout />}>
          <Route index element={<VideoScrollComponent />} />
        </Route>

        {/* Panel de Administración */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} />
          <Route path="reservas" element={<AdminReservasPage />} />
          <Route path="configuracion" element={<AdminConfigPage />} />
          <Route path="storage" element={<AdminStoragePage />} />
        </Route>

        {/* Ruta 404 - Cualquier ruta no encontrada (sin Layout) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
