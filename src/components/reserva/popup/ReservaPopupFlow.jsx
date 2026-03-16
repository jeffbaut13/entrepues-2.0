import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";

import { ReservaComponent } from "../ReservarComponent";
import useReservaStore from "../../../store/reservaStore";
import useCheckoutStore from "../../../store/checkoutStore";
import PlatosSeleccion from "../PlatosSeleccion";
import { Button } from "../../ui/Button";
import { Datos } from "../datos/Datos";
import { CheckoutSuccesComponent } from "../../Checkout/CheckoutSuccesComponent";
import { useIsMobile } from "../../../hooks/useIsMobile";

export const ReservaPopupFlow = ({ isOpen, selectedRegion = "", onClose }) => {
  const wasOpenRef = useRef(false);
  const shouldForceReservaFromRegion =
    String(selectedRegion || "").trim().length > 0;
  const { datosContacto, resetCheckout } = useCheckoutStore();

  const hasDatosCompletos =
    String(datosContacto?.nombre || "").trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(datosContacto?.email || "").trim(),
    ) &&
    /^\d{10}$/.test(String(datosContacto?.whatsapp || "").replace(/\D/g, ""));

  const {
    detalleAsistentes,
    flowStep,
    setFlowStep,
    goToNextFlowStep,
    resumeOrStartFlowStep,
    isZonaExpanded,
    setZonaExpanded,
    currentStep,
    pasosReserva,
    setCurrentStep,
    setPasoReserva,
    resetReserva,
  } = useReservaStore();
  const isMobile = useIsMobile();
  const clearReservationState = () => {
    resetCheckout();
    resetReserva();

    try {
      localStorage.removeItem("checkout:reserva:temp");
      localStorage.removeItem("checkout:firebase:response");
      localStorage.removeItem("checkout:state:v1");
      localStorage.removeItem("reserva:currentStep");
      localStorage.removeItem("reserva:state:v1");
    } catch (_) {}
  };

  const handlePopupClose = () => {
    if (flowStep === "succes") {
      clearReservationState();
    }
    onClose?.();
  };

  useEffect(() => {
    const isOpening = isOpen && !wasOpenRef.current;

    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }

    if (!isOpening) {
      return;
    }

    wasOpenRef.current = true;

    if (shouldForceReservaFromRegion && hasDatosCompletos) {
      setFlowStep("reserva");
      setCurrentStep(0);
      setZonaExpanded(true);
      return;
    }

    if (shouldForceReservaFromRegion && !hasDatosCompletos) {
      setFlowStep("datos");
      setZonaExpanded(false);
      return;
    }

    resumeOrStartFlowStep();
  }, [
    isOpen,
    shouldForceReservaFromRegion,
    resumeOrStartFlowStep,
    setCurrentStep,
    setFlowStep,
    setZonaExpanded,
    hasDatosCompletos,
  ]);

  useEffect(() => {
    if (
      !(shouldForceReservaFromRegion && hasDatosCompletos) &&
      flowStep === "reserva" &&
      pasosReserva.platos.habilitado
    ) {
      setFlowStep("platos");
    }
  }, [
    flowStep,
    pasosReserva.platos.habilitado,
    shouldForceReservaFromRegion,
    hasDatosCompletos,
    setFlowStep,
  ]);

  const handleBackToReservaFromPlatos = () => {
    setPasoReserva("platos", { habilitado: false, completado: false });
    setCurrentStep(2);
    setFlowStep("reserva");
  };

  const handlePagoSuccess = () => {
    setFlowStep("succes");
  };

  const handleFinalizarSuccess = () => {
    clearReservationState();
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[20000] bg-white/5 backdrop-blur-xl flex items-center justify-center"
          onClick={handlePopupClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="lg:w-fit w-full lg:rounded-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="just-icon"
              onClick={handlePopupClose}
              Icon={X}
              iconSize="small"
              customClass="absolute right-2 top-2 z-20"
              props={{ "aria-label": "Cerrar popup de reserva" }}
            />

            <motion.div
              className="flex-1 h-full mx-auto flex items-center justify-center lg:bg-secondary bg-secondary/10 lg:rounded-2xl"
              initial={{
                opacity: 0,
                y: 40,
                width: "64rem",
                height: "40.2060625rem",
              }}
              animate={{
                opacity: 1,
                y: 0,
                width: isMobile
                  ? "100%"
                  : flowStep === "datos"
                    ? "30rem"
                    : flowStep === "platos"
                      ? "80rem"
                      : currentStep === 0
                        ? "70rem"
                        : "64rem",
                height:
                  flowStep === "platos"
                    ? "50rem"
                    : isMobile
                      ? "100dvh"
                      : "40.2060625rem",
              }}
              transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                {flowStep === "datos" && (
                  <motion.div
                    key="datos"
                    initial={{ opacity: 0, width: "0" }}
                    animate={{ opacity: 1, width: "100%" }}
                    exit={{ opacity: 0, width: "0" }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    className="flex-1 h-full flex flex-col items-center justify-center lg:py-10 py-0 lg:px-6 px-4 absolute right-0 top-0 z-10 bg-secondary whitespace-nowrap"
                  >
                    <Datos onContinue={goToNextFlowStep} />
                  </motion.div>
                )}
                {flowStep === "reserva" && (
                  <div key="reserva-base" className="size-full relative z-0">
                    <ReservaComponent
                      region={selectedRegion}
                      onReservaSinMenuCheckout={() => setFlowStep("platos")}
                      isZonaExpanded={isZonaExpanded}
                      setZonaExpanded={setZonaExpanded}
                    />
                  </div>
                )}
                {flowStep === "platos" && (
                  <motion.div
                    key="platos"
                    initial={{ opacity: 0, width: "0" }}
                    animate={{ opacity: 1, width: "100%" }}
                    exit={{ opacity: 0, width: "0" }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    className="flex-1 h-full flex flex-col items-center justify-center lg:py-10 py-0 lg:px-6 px-4 absolute right-0 top-0 z-10 bg-secondary whitespace-nowrap"
                  >
                    <PlatosSeleccion
                      asistentes={detalleAsistentes}
                      onBackToReserva={handleBackToReservaFromPlatos}
                      onPagoSuccess={handlePagoSuccess}
                    />
                  </motion.div>
                )}

                {flowStep === "succes" && (
                  <CheckoutSuccesComponent
                    onFinalizar={handleFinalizarSuccess}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
