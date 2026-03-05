import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Outlet } from "react-router-dom";
import { ReservaComponent } from "../reserva/ReservarComponent";
import useReservaStore from "../../store/reservaStore";
import PlatosSeleccion from "../reserva/PlatosSeleccion";
import { Header } from "../header/Header";
import { CheckoutComponent } from "../Checkout/CheckoutComponent";
import { CheckoutSuccesComponent } from "../Checkout/CheckoutSuccesComponent";
import { Button } from "../ui/Button";

const VideoScrollLayout = () => {
  const {
    detalleAsistentes,
    currentStep,
    pasosReserva,
    setPasoReserva,
    setCurrentStep,
  } = useReservaStore();

  const [isReservePopupOpen, setIsReservePopupOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [showHeader, setShowHeader] = useState(false);
  const [checkoutResultado, setCheckoutResultado] = useState(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [checkoutSuccessVisible, setCheckoutSuccessVisible] = useState(false);
  const [checkoutSinMenu, setCheckoutSinMenu] = useState(false);
  const [checkoutOrigin, setCheckoutOrigin] = useState(null);

  const openReservePopup = (regionName = "") => {
    setSelectedRegion(regionName || "");
    setCheckoutResultado(null);
    setCheckoutVisible(false);
    setCheckoutSuccessVisible(false);
    setCheckoutSinMenu(false);
    setCheckoutOrigin(null);

    // Abre en Visitantes sin resetear la data ya diligenciada.
    setCurrentStep(0);

    setIsReservePopupOpen(true);
  };

  const closeReservePopup = () => {
    setIsReservePopupOpen(false);
    setCheckoutResultado(null);
    setCheckoutVisible(false);
    setCheckoutSuccessVisible(false);
    setCheckoutSinMenu(false);
    setCheckoutOrigin(null);
  };

  const platosHabilitado = pasosReserva.platos.habilitado;
  const mostrarPlatos =
    platosHabilitado && !checkoutVisible && !checkoutSuccessVisible;

  const handleCheckoutReady = (resultado) => {
    setCheckoutResultado(resultado || null);
    setPasoReserva("platos", { habilitado: false, completado: true });
    setCheckoutSinMenu(false);
    setCheckoutOrigin("menu");
    setCheckoutVisible(true);
    setCheckoutSuccessVisible(false);
  };

  const handleCheckoutSuccess = () => {
    setCheckoutVisible(false);
    setCheckoutSuccessVisible(true);
  };

  const handleReservaSinMenuCheckout = (resultado) => {
    setCheckoutResultado(resultado || null);
    setCheckoutSinMenu(true);
    setCheckoutOrigin("sin_menu");
    setCheckoutVisible(false);
    setCheckoutVisible(true);
    setCheckoutSuccessVisible(false);
  };

  const handleCheckoutFinalizar = () => {
    closeReservePopup();
  };

  const handleCheckoutBackToMenu = () => {
    setCheckoutVisible(false);
    setCheckoutSuccessVisible(false);

    if (checkoutOrigin === "menu") {
      setCheckoutSinMenu(false);
      setCheckoutResultado(null);
      setPasoReserva("platos", { habilitado: true, completado: false });
      return;
    }

    setCheckoutSinMenu(false);
    setCheckoutResultado(null);
    setPasoReserva("platos", { habilitado: false, completado: false });
    setCurrentStep(2);
  };

  return (
    <>
      <Header loading={true} logo={showHeader} />
      <Outlet
        context={{
          onOpenReservePopup: openReservePopup,
          setShowHeader,
          showHeader,
        }}
      />

      <AnimatePresence>
        {isReservePopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-white/5 backdrop-blur-xl flex items-center justify-center"
            onClick={closeReservePopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-fit rounded-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="just-icon"
                onClick={closeReservePopup}
                Icon={X}
                iconSize="small"
                customClass="absolute right-2 top-2 z-20"
                props={{ "aria-label": "Cerrar popup de reserva" }}
              />

              <motion.div
                className="flex-1 h-full mx-auto flex items-center justify-center bg-secondary rounded-2xl"
                initial={{
                  opacity: 0,
                  y: 40,
                  width: "64rem",
                  height: "40.2060625rem",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  width: currentStep === 0
                    ? "70rem"
                    : checkoutVisible
                    ? "40rem"
                    : mostrarPlatos
                    ? "80rem"
                    : "64rem",
                  height:
                    mostrarPlatos || checkoutVisible
                      ? "50rem"
                      : "40.2060625rem",
                }}
                transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
              >
                <AnimatePresence mode="wait">
                  <div key="reserva-base" className="size-full relative z-0">
                    <ReservaComponent
                      region={selectedRegion}
                      onReservaSinMenuCheckout={handleReservaSinMenuCheckout}
                    />
                  </div>
                  {mostrarPlatos && (
                    <motion.div
                      key="platos"
                      initial={{ opacity: 0, width: "0" }}
                      animate={{ opacity: 1, width: "100%" }}
                      exit={{ opacity: 0, width: "0" }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="flex-1 h-full flex flex-col items-center justify-center py-10 absolute right-0 top-0 z-10 bg-secondary whitespace-nowrap"
                    >
                      <PlatosSeleccion
                        asistentes={detalleAsistentes}
                        onCheckoutReady={handleCheckoutReady}
                      />
                    </motion.div>
                  )}
                  {checkoutVisible && (
                    <motion.div
                      key="checkout"
                      initial={{ opacity: 0, width: "0" }}
                      animate={{ opacity: 1, width: "100%" }}
                      exit={{ opacity: 0, width: "0" }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="flex-1 h-full flex flex-col items-center justify-center py-10 absolute right-0 top-0 z-10 bg-secondary whitespace-nowrap"
                    >
                      <CheckoutComponent
                        reservaResultado={checkoutResultado}
                        isSinMenuFlow={checkoutSinMenu}
                        onBackToMenu={handleCheckoutBackToMenu}
                        onSuccess={handleCheckoutSuccess}
                      />
                    </motion.div>
                  )}
                  {checkoutSuccessVisible && (
                    <motion.div
                      key="checkout-success"
                      initial={{ opacity: 0, width: "0" }}
                      animate={{ opacity: 1, width: "100%" }}
                      exit={{ opacity: 0, width: "0" }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="flex-1 h-full flex flex-col items-center justify-center py-10 absolute right-0 top-0 z-10 bg-secondary whitespace-nowrap"
                    >
                      <CheckoutSuccesComponent
                        onFinalizar={handleCheckoutFinalizar}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoScrollLayout;
