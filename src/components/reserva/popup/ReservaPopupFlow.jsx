import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useScrollLock } from "../../../hooks/useScrollLock";
import useReservaStore from "../../../store/reservaStore";
import useCheckoutStore from "../../../store/checkoutStore";
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
    flowStep,
    setFlowStep,
    resumeOrStartFlowStep,
    currentStep,
    pasosReserva,
    setCurrentStep,
    resetReserva,
    validateStepAtIndex,
  } = useReservaStore();

  const isMobile = useIsMobile();

  useScrollLock(isOpen);

  // Orden condicional de pasos (incluye "platos" como último paso del slider)
  const orderedSteps = stepinvert
    ? ["region", "cantidad", "datos", "fecha", "hora", "platos"]
    : ["datos", "region", "cantidad", "fecha", "hora", "platos"];

  // Índices calculados dinámicamente
  const regionStepIndex = orderedSteps.indexOf("region");
  const cantidadStepIndex = orderedSteps.indexOf("cantidad");
  const datosStepIndex = orderedSteps.indexOf("datos");
  const fechaStepIndex = orderedSteps.indexOf("fecha");
  const horaStepIndex = orderedSteps.indexOf("hora");
  const platosStepIndex = orderedSteps.indexOf("platos");

  const getReservaPopupWidth = () => {
    if (isMobile) return "100%";

    return "80rem";
  };

  const getReservaPopupHeight = () => {
    if (isMobile) return "100dvh";
    if (flowStep === "succes") return "40rem";

    const heightsByStep = {
      [regionStepIndex]: "40rem",
      [cantidadStepIndex]: "25rem",
      [datosStepIndex]: "45rem",
      [fechaStepIndex]: "34rem",
      [horaStepIndex]: "34rem",
      [platosStepIndex]: "50rem",
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

  const currentValidation = validateStepAtIndex(currentStep, orderedSteps);
  const currentStepName = orderedSteps[currentStep] || orderedSteps[0];
  const isLastStep = currentStepName === "platos";
  const isFirstStep = currentStep === 0;
  
  // Ref para almacenar las funciones de PlatosSeleccion (continuar/volver)
  const platosActionsRef = useRef(null);
  const [isReadyToPay, setIsReadyToPay] = useState(false);
  const [isLastAsistente, setIsLastAsistente] = useState(false);
  const registerConfirmar = (actions) => {
    platosActionsRef.current = actions;
    setIsReadyToPay(actions?.isReadyToPay?.() ?? false);
    setIsLastAsistente(actions?.isLastAsistente?.() ?? false);
  };

  // Disabled: en el último paso y último asistente, solo si no está listo para pagar
  const isContinueDisabled = isLastStep
    ? (isLastAsistente && !isReadyToPay)
    : !currentValidation.isValid;

  const handleBackAction = () => {
    // Si estamos en el paso de platos, intentar retroceder entre asistentes
    if (isLastStep) {
      const handled = platosActionsRef.current?.volver?.();
      if (handled) return; // Retrocedió al asistente anterior
      // Si no pudo retroceder (primer asistente), volver al paso anterior del slider
    }

    // Si es el primer paso, cierra el modal
    if (isFirstStep) {
      handlePopupClose();
      return;
    }

    // En otros pasos, retrocede sin cerrar
    setCurrentStep(currentStep - 1);
  };

  const handleContinueAction = () => {
    // En el paso de platos, ejecutar la función de continuar (siguiente asistente o pagar)
    if (isLastStep) {
      platosActionsRef.current?.continuar?.();
      return;
    }

    if (!currentValidation.isValid) {
      alert(currentValidation.message);
      return;
    }

    // Avanza al siguiente paso
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
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed max-md:w-full h-dvh inset-0 z-[20000] bg-black/60 flex justify-center items-center"
            onClick={handlePopupClose}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-md:w-full max-md:h-full max-md:bg-amber-opacity max-md:backdrop-blur-[3rem] inline-flex flex-col justify-center items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full relative overflow-hidden"
              >
                <div className="w-full flex-1 md:max-w-220 lg:max-w-320 p-6 flex flex-col justify-end items-center gap-8 md:bg-amber-opacity rounded-t-[3rem] rounded-b-lg rounded-br-lg md:shadow-[0_-1px_1px_0_rgba(255,255,255,0.10)_inset,0_1px_1px_0_rgba(255,255,255,0.25)_inset] md:backdrop-blur-[3rem]">
                  <motion.div className="w-full flex justify-end items-center ">
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
                    className="w-full h-fit overflow-hidden border-[1px] border-secondary/60 flex-1 mx-auto flex items-center justify-center p-4 rounded-2xl"
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
                    <div className="w-full min-h-140 h-1 overflow-hidden text-secondary">
                      <AnimatePresence mode="wait">
                        {flowStep === "reserva" && (
                          <ReservaComponent
                            key="reserva-base"
                            stepinvert={stepinvert}
                            region={selectedRegion}
                            onRegionChange={onRegionChange}
                            onPagoSuccess={handlePagoSuccess}
                            registerConfirmar={registerConfirmar}
                          />
                        )}
                        {flowStep === "succes" && (
                          <CheckoutSuccesComponent
                            key="checkout-success"
                            onFinalizar={handleFinalizarSuccess}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full md:max-w-220 lg:max-w-320 px-6 py-4 md:bg-amber-opacity rounded-tl-lg rounded-tr-lg rounded-bl-[3rem] rounded-br-[3rem] md:shadow-[0_-1px_1px_0_rgba(255,255,255,0.10)_inset,0_1px_1px_0_rgba(255,255,255,0.25)_inset] md:backdrop-blur-[3rem] inline-flex flex-col justify-end items-center gap-8"
              >
                <div className="w-full flex justify-center items-center gap-4">
                  {flowStep !== "succes" && (
                    <>
                      <Button
                        onClick={handleBackAction}
                        title={
                          <span className="flex justify-center items-center gap-3">
                            <ChevronLeft className="border border-secondary rounded-full" />
                            <span>Volver</span>
                          </span>
                        }
                        type="button-secondary"
                        fontSize="base"
                        customClass="min-h-12"
                      />
                      <Button
                        onClick={handleContinueAction}
                        title={
                          <span className="flex justify-center items-center gap-3">
                            <span>
                              {isLastStep && isLastAsistente
                                ? "Pagar"
                                : "Continuar"}
                            </span>
                            <ChevronRight className="border border-brown rounded-full" />
                          </span>
                        }
                        type="button-primary"
                        fontSize="base"
                        customClass={`min-h-12 ${isContinueDisabled ? "opacity-20" : ""}`}
                        disabled={isContinueDisabled}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ResumenReservaModal />
    </>
  );
};
