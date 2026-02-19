import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, Home, Timer, User } from "lucide-react";

import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";
import SliderVertical from "../slider/SliderVertical";
import HeaderPaso from "./HeaderPaso";
import { useIsMobile } from "../../hooks/useIsMobile";
import { convertTo12Hour, getAmPm } from "./horaUtils";
import PlatosSeleccion from "./PlatosSeleccion";

import useReservaStore from "../../store/reservaStore";

export const ReservarComponent = () => {
  return (
    <motion.main
      className="w-full h-dvh flex flex-col overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-full z-1 scale-102"
        pointerEvents="none"
      >
        <img
          src="/imagenes/background_texture.webp"
          alt="Background textura"
          className="size-full object-cover object-center"
        />
      </motion.div>

      <div className="relative flex-1 w-full z-20 overflow-y-auto overflow-x-hidden flex items-center justify-center">
        <ReservaComponent />
      </div>
    </motion.main>
  );
};

const ReservaComponent = () => {
  /* Estados locales */
  const [detalleAsistentes, setDetalleAsistentes] = useState({
    adultos: 0,
    ninos: 0,
    asistentes: [],
  });
  // Estados derivados del store
  const stepRefs = useRef([]);

  /* zustand */

  const {
    showMenu,
    showMenuSelected,
    currentStep,
    setCurrentStep,
    completedSteps,
    reservaData,
    closeThankYou,
  } = useReservaStore();

  const isMobile = useIsMobile();

  // Estados derivados del store
  const selectedDate = reservaData.selectedDate
    ? new Date(reservaData.selectedDate)
    : new Date();
  const hour = reservaData.hour;
  const minute = reservaData.minute;
  const adults = reservaData.adults;
  const children = reservaData.children;
  const mascotas = reservaData.mascotas;

  const pasos = [
    {
      titulo: "Fecha",
      icon: Calendar,
      descripcion: completedSteps[0]
        ? selectedDate.toLocaleDateString("es-CO", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })
        : "",
    },
    {
      titulo: "Hora",
      icon: Timer,
      descripcion: completedSteps[1]
        ? `${convertTo12Hour(hour)}:${minute} ${getAmPm(hour)}`
        : "",
    },
    {
      titulo: "Visitantes",
      icon: User,
      descripcion: completedSteps[2]
        ? `${adults} adulto${adults !== 1 ? "s" : ""}${
            children > 0 ? `, ${children} niño${children !== 1 ? "s" : ""}` : ""
          }${
            mascotas > 0
              ? `, ${mascotas} mascota${mascotas !== 1 ? "s" : ""}`
              : ""
          }`
        : "",
    },
  ];

  useEffect(() => {
    const adultosCount = Number(reservaData?.adults || 0);
    const ninosCount = Number(reservaData?.children || 0);

    const asistentesAdultos = Array.from(
      { length: adultosCount },
      (_, i) => `Adulto ${i + 1}`
    );
    const asistentesNinos = Array.from(
      { length: ninosCount },
      (_, i) => `Niño ${i + 1}`
    );

    setDetalleAsistentes({
      adultos: adultosCount,
      ninos: ninosCount,
      asistentes: [...asistentesAdultos, ...asistentesNinos],
    });
  }, [reservaData?.adults, reservaData?.children]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout:reserva:temp");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const debeAbrirMenu =
        parsed?.estado === "temporal" && parsed?.uiState?.showMenu === true;

      if (debeAbrirMenu) {
        showMenuSelected(true);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error(
        "Error restaurando estado de menú desde checkout temp:",
        error
      );
    }
  }, [showMenuSelected, setCurrentStep]);

  if (showMenu) {
    return (
      <motion.div
        className="w-full lg:h-[48rem] h-full mx-auto flex justify-center items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="py-8 md:max-w-7xl w-full h-full flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <PlatosSeleccion asistentes={detalleAsistentes} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex-1 w-full h-full max-w-5xl mx-auto px-2 md:px-4 flex items-center justify-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="w-full lg:h-[40.2060625rem] h-full flex lg:flex-row flex-col items-stretch bg-white/20 text-dark rounded-xl lg:gap-6 gap-3 lg:p-6 p-3 md:py-4 overflow-hidden"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="lg:w-1/3 w-full lg:h-full h-auto flex flex-col justify-start lg:justify-between overflow-y-auto lg:overflow-y-visible max-lg:gap-2 lg:py-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          <motion.h2
            className="lg:pl-4 font-parkson lg:mb-8 mb-4 flex-shrink-0 lg:text-start text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
          >
            <span className="lg:!text-4xl !text-5xl">Realiza tu</span>{" "}
            <br className="max-lg:hidden" />
            <span className=" lg:!text-9xl lg:!leading-20 !text-5xl">
              reserva
            </span>
          </motion.h2>

          <AnimatePresence>
            {pasos.map((paso, index) => {
              const isExpanded = currentStep === index;
              const isCompleted = completedSteps[index];

              return (
                <motion.div
                  ref={(el) => (stepRefs.current[index] = el)}
                  key={index}
                  className={`${
                    index !== pasos.length - 1 ? "lg:border-b" : ""
                  } lg:border-l border-dark/20 flex-shrink-0 lg:flex-1`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 1.1 + index * 0.1,
                    ease: "easeOut",
                  }}
                >
                  {/* Header del paso */}
                  <HeaderPaso
                    index={index}
                    paso={paso}
                    pasos={pasos}
                    content={
                      <>
                        {paso.descripcion === "" ? (
                          <></>
                        ) : (
                          <>
                            <p className="text-start lg:!text-xl md:!text-base">
                              {paso.descripcion || "-- /--"}
                            </p>
                          </>
                        )}
                      </>
                    }
                    isExpanded={isExpanded}
                    isCompleted={isCompleted}
                    currentStep={currentStep}
                    onClick={() => {
                      if (isCompleted || index < currentStep) {
                        setCurrentStep(index);
                      }
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {/* Slider Vertical con Swiper */}
        <motion.div
          className="flex-1 lg:h-full h-auto bg-[#faf7f1] text-dark rounded-lg overflow-hidden min-h-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <SliderVertical />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
