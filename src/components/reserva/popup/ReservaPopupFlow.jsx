import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";

import useReservaStore from "../../../store/reservaStore";
import useCheckoutStore from "../../../store/checkoutStore";
import PlatosSeleccion from "../PlatosSeleccion";
import { ResumenReservaModal } from "./ResumenReservaModal";
import { Button } from "../../ui/Button";

import { CheckoutSuccesComponent } from "../../Checkout/CheckoutSuccesComponent";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { ReservaComponent } from "../ReservaComponent";

export const ReservaPopupFlow = ({ stepinvert, isOpen, selectedRegion = "", onClose }) => {
  const wasOpenRef = useRef(false);
  const shouldForceReservaFromRegion =
    String(selectedRegion || "").trim().length > 0;
  const { datosContacto, resetCheckout, showResumen, setShowResumen } =
    useCheckoutStore();

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

    currentStep,
    activeMesas,
    pasosReserva,
    setCurrentStep,
    setPasoReserva,
    resetReserva,
  } = useReservaStore();
  const isMobile = useIsMobile();
  const datosStepIndex = stepinvert ? 1 : 0;
  const cantidadStepIndex = stepinvert ? 0 : 1;

  const getReservaPopupWidth = () => {
    if (isMobile) return "100%";
    if (flowStep === "succes") return "30rem";
    if (flowStep === "platos") return "80rem";

    const widthsByStep = {
      [datosStepIndex]: "32rem",
      [cantidadStepIndex]: "80rem",
      2: "58rem",
      3: "58rem",
    };

    return widthsByStep[currentStep] || "64rem";
  };

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
    setShowResumen(false);
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

    const visitantesCompletado = Boolean(pasosReserva?.visitantes?.completado);

    if (shouldForceReservaFromRegion && hasDatosCompletos) {
      setFlowStep("reserva");
      setCurrentStep(visitantesCompletado ? 2 : cantidadStepIndex);

      return;
    }

    if (shouldForceReservaFromRegion && !hasDatosCompletos) {
      setFlowStep("reserva");
      setCurrentStep(datosStepIndex);

      return;
    }

    resumeOrStartFlowStep();
  }, [
    isOpen,
    shouldForceReservaFromRegion,
    resumeOrStartFlowStep,
    setCurrentStep,
    setFlowStep,
    hasDatosCompletos,
    pasosReserva?.visitantes?.completado,
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
    setShowResumen(false);
    setPasoReserva("platos", { habilitado: false, completado: false });
    setCurrentStep(3);
    setFlowStep("reserva");
  };

  const handlePagoSuccess = () => {
    setShowResumen(false);
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
            className="lg:w-fit w-full max-lg:bg-secondary lg:rounded-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {flowStep !== "succes" && (
              <Button
                type="just-icon"
                onClick={handlePopupClose}
                Icon={X}
                iconSize="small"
                customClass="absolute right-2 top-2 z-20"
                props={{ "aria-label": "Cerrar popup de reserva" }}
              />
            )}

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
                width: getReservaPopupWidth(),
                height:
                  flowStep === "platos" && !isMobile
                    ? "50rem"
                    : flowStep === "reserva" && currentStep === cantidadStepIndex && activeMesas && !isMobile
                      ? "42rem"
                    : isMobile
                      ? "100dvh"
                      : "40.2060625rem",
              }}
              transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                {flowStep === "reserva" && (
                  <div key="reserva-base" className="size-full relative z-0">
                    <ReservaComponent
                      stepinvert={stepinvert}
                      region={selectedRegion}
                      onReservaSinMenuCheckout={() => setFlowStep("platos")}
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

              {flowStep === "platos" && <ResumenReservaModal />}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
