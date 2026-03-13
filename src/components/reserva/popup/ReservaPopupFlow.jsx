import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";

import { ReservaComponent } from "../ReservarComponent";
import useReservaStore from "../../../store/reservaStore";
import PlatosSeleccion from "../PlatosSeleccion";
import { Button } from "../../ui/Button";
import { Datos } from "../datos/Datos";

export const ReservaPopupFlow = ({ isOpen, selectedRegion = "", onClose }) => {
  const [isZonaExpanded, setZonaExpanded] = useState(false);
  const {
    detalleAsistentes,
    currentStep,
    pasosReserva,
    setCurrentStep,
    setPasoReserva,
  } = useReservaStore();

  const [flowStep, setFlowStep] = useState("datos");

  useEffect(() => {
    if (flowStep === "reserva" && pasosReserva.platos.habilitado) {
      setFlowStep("platos");
    }
  }, [flowStep, pasosReserva.platos.habilitado]);

  const handleDatosContinue = () => {
    setFlowStep("reserva");
  };

  const handleBackToReservaFromPlatos = () => {
    setPasoReserva("platos", { habilitado: false, completado: false });
    setCurrentStep(2);
    setFlowStep("reserva");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[20000] bg-white/5 backdrop-blur-xl flex items-center justify-center"
          onClick={onClose}
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
              onClick={onClose}
              Icon={X}
              iconSize="small"
              customClass="absolute right-2 top-2 z-20"
              props={{ "aria-label": "Cerrar popup de reserva" }}
            />

            {flowStep === "reserva" && !isZonaExpanded && (
              <Button
                type="button-secondary"
                onClick={() => setFlowStep("datos")}
                Icon={ChevronLeft}
                //title="Volver"
                fontSize="xl"
                customClass="absolute left-2 top-2 z-20"
              />
            )}

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
                width:
                  flowStep === "datos"
                    ? "30rem"
                    : flowStep === "platos"
                      ? "80rem"
                      : currentStep === 0
                        ? "70rem"
                        : "64rem",
                height: flowStep === "platos" ? "50rem" : "40.2060625rem",
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
                    className="flex-1 h-full flex flex-col items-center justify-center py-10 px-6 absolute right-0 top-0 z-10 bg-secondary whitespace-nowrap"
                  >
                    <Datos onContinue={handleDatosContinue} />
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
                    className="flex-1 h-full flex flex-col items-center justify-center py-10 absolute right-0 top-0 z-10 bg-secondary whitespace-nowrap"
                  >
                    <PlatosSeleccion
                      asistentes={detalleAsistentes}
                      onBackToReserva={handleBackToReservaFromPlatos}
                      onPagoSuccess={onClose}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
