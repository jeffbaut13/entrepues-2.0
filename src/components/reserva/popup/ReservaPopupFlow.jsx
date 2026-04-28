import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import useReservaStore from "../../../store/reservaStore";
import useCheckoutStore from "../../../store/checkoutStore";
import PlatosSeleccion from "../PlatosSeleccion";
import { ResumenReservaModal } from "./ResumenReservaModal";
import { Button } from "../../ui/Button";

import { CheckoutSuccesComponent } from "../../Checkout/CheckoutSuccesComponent";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { ReservaComponent } from "../ReservaComponent";

export const ReservaPopupFlow = ({
  stepinvert = false,
  isOpen,
  selectedRegion = "",
  forcedStartStep = null,
  onRegionChange,
  onClose,
}) => {
  const wasOpenRef = useRef(false);
  const shouldForceReservaFromRegion =
    String(selectedRegion || "").trim().length > 0;
  const shouldForceCantidadFromPoint =
    shouldForceReservaFromRegion && forcedStartStep === "cantidad";
  const { resetCheckout, setShowResumen } = useCheckoutStore();

  const {
    detalleAsistentes,
    flowStep,
    setFlowStep,
    resumeOrStartFlowStep,
    currentStep,
    activeMesas,
    pasosReserva,
    setCurrentStep,
    setPasoReserva,
    resetReserva,
  } = useReservaStore();

  const isMobile = useIsMobile();

  // Orden condicional de pasos
  const orderedSteps = stepinvert
    ? ["region", "cantidad", "datos", "fecha", "hora"]
    : ["datos", "region", "cantidad", "fecha", "hora"];

  // Índices calculados dinámicamente
  const regionStepIndex = orderedSteps.indexOf("region");
  const cantidadStepIndex = orderedSteps.indexOf("cantidad");
  const datosStepIndex = orderedSteps.indexOf("datos");
  const fechaStepIndex = orderedSteps.indexOf("fecha");
  const horaStepIndex = orderedSteps.indexOf("hora");

  const getReservaPopupWidth = () => {
    if (isMobile) return "100%";
    if (flowStep === "succes") return "30rem";
    if (flowStep === "platos") return "80rem";

    const widthsByStep = {
      [regionStepIndex]: "80rem",
      [cantidadStepIndex]: "40rem",
      [datosStepIndex]: "32rem",
      [fechaStepIndex]: "58rem",
      [horaStepIndex]: "58rem",
    };

    return widthsByStep[currentStep] || "64rem";
  };

  const getReservaPopupHeight = () => {
    if (isMobile) return "100dvh";
    if (flowStep === "succes") return "40rem";
    if (flowStep === "platos") return "50rem";

    const heightsByStep = {
      [regionStepIndex]: "40rem",
      [cantidadStepIndex]: "25rem",
      [datosStepIndex]: "45rem",
      [fechaStepIndex]: "34rem",
      [horaStepIndex]: "34rem",
    };

    return heightsByStep[currentStep] || "auto";
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

    if (shouldForceReservaFromRegion) {
      setFlowStep("reserva");

      if (shouldForceCantidadFromPoint) {
        setCurrentStep(cantidadStepIndex);
        return;
      }

      if (stepinvert) {
        if (visitantesCompletado) {
          setCurrentStep(datosStepIndex);
          return;
        }

        setCurrentStep(regionStepIndex);
        return;
      }

      setCurrentStep(datosStepIndex);
      return;
    }

    resumeOrStartFlowStep();
  }, [
    isOpen,
    stepinvert,
    shouldForceReservaFromRegion,
    shouldForceCantidadFromPoint,
    forcedStartStep,
    resumeOrStartFlowStep,
    setCurrentStep,
    setFlowStep,
    pasosReserva?.visitantes?.completado,
    regionStepIndex,
    cantidadStepIndex,
    datosStepIndex,
  ]);

  useEffect(() => {
    if (
      !shouldForceReservaFromRegion &&
      flowStep === "reserva" &&
      pasosReserva.platos.habilitado
    ) {
      setFlowStep("platos");
    }
  }, [
    flowStep,
    pasosReserva.platos.habilitado,
    shouldForceReservaFromRegion,
    setFlowStep,
  ]);

  const handleBackToReservaFromPlatos = () => {
    setShowResumen(false);
    setPasoReserva("platos", { habilitado: false, completado: false });
    setCurrentStep(horaStepIndex);
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
                height: getReservaPopupHeight(),
              }}
              transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                {flowStep === "reserva" && (
                  <div key="reserva-base" className="size-full relative z-0">
                    <ReservaComponent
                      stepinvert={stepinvert}
                      region={selectedRegion}
                      onRegionChange={onRegionChange}
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
