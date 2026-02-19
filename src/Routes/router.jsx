import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/admin/AdminLayout";
import CheckoutLayout from "../components/layout/CheckoutLayout";

// Admin Pages
import AdminPage from "../pages/admin/AdminPage";
import AdminReservasPage from "../pages/admin/AdminReservasPage";
import AdminConfigPage from "../pages/admin/AdminConfigPage";
import AdminStoragePage from "../pages/admin/AdminStoragePage";

// Pages
import HomePage from "../pages/home/HomePage";
import VideoScrollPage from "../pages/descubrenos/VideoScrollPage";
import Video360Page from "../pages/descubrenos/Video360Page";
import MenuPage from "../pages/menu/MenuPage";
import ReservarPage from "../pages/reservar/ReservarPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import CheckoutSuccesPage from "../pages/checkout/CheckoutSuccesPage";
import NotFoundPage from "../pages/NotFoundPage";
import CartaPage from "../pages/carta/CartaPage";

/**
 * Configuración centralizada de rutas de la aplicación
 * Define todas las rutas, sus componentes y lógica de renderizado
 */
function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Layout principal - contiene Header y Modal */}
        <Route element={<MainLayout />}>
          {/* Ruta principal - Home */}
          <Route path="/" element={<HomePage />} />

          {/* Logica de reserva y checkout */}
          <Route path="/reservar" element={<ReservarPage />} />

          {/* Logica menu y productos */}
          <Route path="/menu" element={<MenuPage />} />
          {/* Ruta de descubrenos - Video 360 */}
          <Route path="/descubrenos" element={<VideoScrollPage />} />
          {/* <Route path="/descubrenos" element={<Video360Page />} /> */}
        </Route>
        <Route path="/carta" element={<CartaPage />} />

        <Route element={<CheckoutLayout />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccesPage />} />
          <Route path="/checkout/cancel" element={<CheckoutPage />} />
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
