import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useScrollLock } from "../../../hooks/useScrollLock";
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
    validateStepAtIndex,
  } = useReservaStore();

  const isMobile = useIsMobile();

  useScrollLock(isOpen);

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

    return "80rem";
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

  const currentValidation = validateStepAtIndex(currentStep, orderedSteps);
  const currentStepName = orderedSteps[currentStep] || orderedSteps[0];
  const isContinueDisabled = !currentValidation.isValid;

  const handleBackAction = () => {
    if (currentStep <= 0) {
      handlePopupClose();
      return;
    }

    setCurrentStep(currentStep - 1);
  };

  const handleContinueAction = () => {
    if (!currentValidation.isValid) {
      alert(currentValidation.message);
      return;
    }

    if (currentStepName === "hora") {
      setFlowStep("platos");
      return;
    }

    if (currentStep < orderedSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
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
          className="fixed inset-0 z-[20000] p-20 bg-black/60 inline-flex flex-col justify-center items-center gap-2"
          onClick={handlePopupClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden w-full flex-1 max-w-320 p-6 bg-amber-opacity rounded-t-[3rem] rounded-b-lg rounded-br-lg shadow-glow backdrop-blur-4xl flex flex-col justify-end items-center gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className="w-full flex justify-end items-center">
              {flowStep !== "succes" && (
                <Button
                  type="just-icon-white"
                  onClick={handlePopupClose}
                  Icon={X}
                  props={{ "aria-label": "Cerrar popup de reserva" }}
                />
              )}
            </motion.div>

            <motion.div
              className="h-fit overflow-hidden w-full border-[1px] border-secondary/60 flex-1 mx-auto flex items-center justify-center p-4 rounded-2xl"
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
            >
              <div className="w-full p-10 min-h-157 h-1 overflow-hidden text-secondary">
                <AnimatePresence mode="wait">
                  {flowStep === "reserva" && (
                    <ReservaComponent
                      key="reserva-base"
                      stepinvert={stepinvert}
                      region={selectedRegion}
                      onRegionChange={onRegionChange}
                      onReservaSinMenuCheckout={() => setFlowStep("platos")}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          <div className="w-full max-w-320 px-6 py-4 bg-stone-300/10 rounded-tl-lg rounded-tr-lg rounded-bl-[48px] rounded-br-[48px] shadow-glow backdrop-blur-4xl inline-flex flex-col justify-end items-center gap-8">
            <div className="w-full flex justify-center items-center gap-4">
              <Button
                onClick={handleBackAction}
                title={currentStep <= 0 ? "Cerrar" : "Volver"}
                Icon={ChevronLeft}
                type="button-secondary"
                fontSize="xl"
                width="flex"
                customClass="min-h-12"
              />
              <Button
                onClick={handleContinueAction}
                title="Continuar"
                Icon={ChevronRight}
                type="button-dark"
                fontSize="xl"
                width="flex"
                customClass="min-h-12"
                disabled={isContinueDisabled}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
