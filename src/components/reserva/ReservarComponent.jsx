import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Timer, User } from "lucide-react";

import SliderVertical from "../slider/SliderVertical";
import HeaderPaso from "./HeaderPaso";
import { convertTo12Hour, getAmPm } from "./horaUtils";

import useReservaStore from "../../store/reservaStore";

const normalizeRegionParam = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const resolveRegionName = (value = "") => {
  const normalized = normalizeRegionParam(value);

  const aliases = {
    pacifico: "pacífica",
  };

  return aliases[normalized] || normalized;
};

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

export const ReservaComponent = ({
  region,
  onReservaSinMenuCheckout,
  isZonaExpanded,
  setZonaExpanded,
}) => {
  const [searchParams] = useSearchParams();

  // Estados derivados del store
  const stepRefs = useRef([]);

  /* zustand */

  const {
    currentStep,
    setCurrentStep,
    pasosReserva,
    reservaData,
    seleccionarZona,
  } = useReservaStore();

  const regionFromUrl = searchParams.get("región") || region || null;

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
      key: "visitantes",
      titulo: "Visitantes",
      icon: User,
      descripcion: pasosReserva.visitantes.completado
        ? `${adults} adulto${adults !== 1 ? "s" : ""}${
            children > 0 ? `, ${children} niño${children !== 1 ? "s" : ""}` : ""
          }${
            mascotas > 0
              ? `, ${mascotas} mascota${mascotas !== 1 ? "s" : ""}`
              : ""
          }`
        : "",
      habilitado: pasosReserva.visitantes.habilitado,
      completado: pasosReserva.visitantes.completado,
    },
    {
      key: "fecha",
      titulo: "Fecha",
      icon: Calendar,
      descripcion: pasosReserva.fecha.completado
        ? selectedDate.toLocaleDateString("es-CO", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })
        : "",
      habilitado: pasosReserva.fecha.habilitado,
      completado: pasosReserva.fecha.completado,
    },
    {
      key: "hora",
      titulo: "Hora",
      icon: Timer,
      descripcion: pasosReserva.hora.completado
        ? `${convertTo12Hour(hour)}:${minute} ${getAmPm(hour)}`
        : "",
      habilitado: pasosReserva.hora.habilitado,
      completado: pasosReserva.hora.completado,
    },
    // Puedes agregar más pasos aquí si es necesario
  ];

  useEffect(() => {
    if (regionFromUrl) return;

    try {
      const raw = localStorage.getItem("checkout:reserva:temp");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const debeAbrirMenu =
        parsed?.estado === "temporal" && parsed?.uiState?.showMenu === true;

      if (debeAbrirMenu) {
        setCurrentStep(2);
      }
    } catch (error) {
      console.error(
        "Error restaurando estado de menú desde checkout temp:",
        error,
      );
    }
  }, [regionFromUrl, setCurrentStep]);

  useEffect(() => {
    if (!regionFromUrl) return;

    const regionToSelect = resolveRegionName(regionFromUrl);
    if (!regionToSelect) return;

    seleccionarZona(regionToSelect);
  }, [regionFromUrl, seleccionarZona]);

  useEffect(() => {
    if (!regionFromUrl) return;

    setZonaExpanded(true);
  }, [regionFromUrl, setZonaExpanded]);

  useEffect(() => {
    // Mantener expansión de zona solo en el paso Visitantes.
    if (currentStep !== 0 && isZonaExpanded) {
      setZonaExpanded(false);
    }
  }, [currentStep, isZonaExpanded, setZonaExpanded]);

  return (
    <>
      <motion.div
        className="w-full lg:h-[40.2060625rem] h-full flex lg:flex-row flex-col items-stretch bg-white/20 text-dark rounded-xl lg:gap-6 gap-3 py-4 md:px-6 px-4 overflow-hidden relative"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className={`lg:w-1/3 w-full lg:h-full h-auto flex flex-col justify-start lg:justify-between overflow-y-auto lg:overflow-y-visible max-lg:gap-2 lg:py-24`}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          {/* <motion.h2
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
          </motion.h2> */}

          <AnimatePresence>
            {pasos.map((paso, index) => {
              const isExpanded = currentStep === index;
              return (
                <motion.div
                  ref={(el) => (stepRefs.current[index] = el)}
                  key={paso.key}
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
                    habilitado={paso.habilitado}
                    content={
                      <>
                        {paso.descripcion === "" ? null : (
                          <p className="text-start lg:!text-xl md:!text-base">
                            {paso.descripcion || "-- /--"}
                          </p>
                        )}
                      </>
                    }
                    isExpanded={isExpanded}
                    onClick={() => {
                      if (paso.habilitado) {
                        setCurrentStep(index);
                      }
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <div
          className={`absolute right-0 top-0 h-full z-10 p-6 bg-white/20 ${
            isZonaExpanded ? "w-full" : " w-[37.875rem]"
          } transition-all duration-500 ease-in-out`}
        >
          <div className="size-full bg-[#faf7f1]">
            <SliderVertical
              isZonaExpanded={isZonaExpanded}
              setZonaExpanded={setZonaExpanded}
              onReservaSinMenuCheckout={onReservaSinMenuCheckout}
            />
          </div>
        </div>
        {/* Slider Vertical con Swiper */}
      </motion.div>
    </>
  );
};
