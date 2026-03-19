import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Timer, User } from "lucide-react";

import SliderVertical from "./slider/SliderVertical";
import HeaderPaso from "./HeaderPaso";
import { convertTo12Hour, getAmPm } from "./horaUtils";

import useReservaStore from "../../store/reservaStore";
import { useIsMobile } from "../../hooks/useIsMobile";

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
    orinoquia: "orinoquía",
    amazonia: "amazonía",
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
  // Estados derivados del store
  const stepRefs = useRef([]);
  const isMobile = useIsMobile();
  /* zustand */

  const {
    currentStep,
    setCurrentStep,
    pasosReserva,
    reservaData,
    seleccionarZona,
    reservaZonaData,
  } = useReservaStore();

  const regionFromUrl = region || null;

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
      titulo: "¿Cuantos nos visitán?",
      icon: User,
      descripcion: pasosReserva.visitantes.completado
        ? `${adults} adulto${adults !== 1 ? "s" : ""}${
            children > 0 ? `, ${children} niño${children !== 1 ? "s" : ""}` : ""
          }${
            mascotas > 0
              ? `, ${mascotas} mascota${mascotas !== 1 ? "s" : ""}`
              : ""
          } en región ${reservaZonaData.selectedZoneName}`
        : "",
      habilitado: pasosReserva.visitantes.habilitado,
      completado: pasosReserva.visitantes.completado,
    },
    {
      key: "fecha",
      titulo: "Elige la fecha",
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
      titulo: "Elige la hora",
      icon: Timer,
      descripcion: pasosReserva.hora.completado
        ? `${convertTo12Hour(hour)}:${minute} ${getAmPm(hour)}`
        : "",
      habilitado: pasosReserva.hora.habilitado,
      completado: pasosReserva.hora.completado,
    },
    // Puedes agregar más pasos aquí si es necesario
  ];

  const TitleSlider = ({ head, content }) => {
    return (
      <>
        <span className="lg:!text-5xl !text-5xl">{head} </span>
        <br className="max-lg:hidden" />
        <span className="lg:!text-7xl lg:!leading-14 !text-5xl">{content}</span>
      </>
    );
  };
  const titlePaso = (stepKey) => {
    switch (stepKey) {
      case "visitantes":
        return <TitleSlider head="¿Dónde " content="Quieres comer?" />;
      case "fecha":
        return <TitleSlider head="Elige la fecha" content="de tu reserva" />;
      case "hora":
        return <TitleSlider head="¿A qué hora" content=" te esperamos?" />;
      default:
        return <></>;
    }
  };

  const currentStepKey = pasos[currentStep]?.key;

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

  const showContent = isMobile && !isZonaExpanded;
  return (
    <>
      <motion.div
        className="w-full lg:h-[40.2060625rem] h-full flex lg:flex-row flex-col max-lg:justify-center lg:items-stretch items-center bg-white/20 text-dark lg:rounded-2xl lg:gap-6 gap-3 lg:py-4 md:px-6 px-0 overflow-hidden relative"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {showContent && (
          <AnimatePresence>
            <motion.div
              className={`w-full h-auto flex justify-center items-center mb-4`}
              initial={{ opacity: 0, height: "fit-content" }}
              animate={{
                opacity: 1,
                height: showContent ? "0%" : "auto",
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.h2
                className="font-parkson lg:mb-8 mb-4 flex-shrink-0 lg:text-start text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {titlePaso(currentStepKey)}
              </motion.h2>
            </motion.div>
          </AnimatePresence>
        )}
        {!isMobile && (
          <motion.div
            className={`lg:w-1/3 w-full lg:h-full h-auto flex flex-col justify-start lg:justify-between overflow-y-auto lg:overflow-y-visible max-lg:gap-2 lg:py-10`}
            initial={{ opacity: 0, x: -30 }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h2
              className="lg:pl-4 font-parkson lg:mb-8 mb-4 flex-shrink-0 lg:text-start text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {titlePaso(currentStepKey)}
            </motion.h2>

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
                            <p className="hidden lg:inline-block text-start lg:!text-xl md:!text-base">
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
        )}

        <div
          className={`lg:absolute right-0 top-0 lg:h-full z-10 lg:p-6  ${
            isZonaExpanded ? "w-full h-full" : "lg:w-[37.875rem] w-full h-126"
          } transition-all duration-500 ease-in-out`}
        >
          <div
            className={`size-full bg-[#faf7f1] ${showContent ? "max-lg:!rounded-2xl" : ""}   max-lg:p-4`}
          >
            <SliderVertical
              isZonaExpanded={isZonaExpanded}
              setZonaExpanded={setZonaExpanded}
              onReservaSinMenuCheckout={onReservaSinMenuCheckout}
            />
          </div>
        </div>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, height: "fit-content" }}
              animate={{
                opacity: 1,
                height: showContent ? "0%" : "fit-content",
              }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
              className={`w-full h-fit my-4 flex justify-between px-4`}
            >
              {pasos.map((paso, index) => {
                const isExpanded = currentStep === index;
                return (
                  <motion.div
                    ref={(el) => (stepRefs.current[index] = el)}
                    key={paso.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,

                      ease: "easeOut",
                    }}
                  >
                    {/* Header del paso */}
                    <button
                      onClick={() => {
                        if (paso.habilitado) {
                          setCurrentStep(index);
                        }
                      }}
                      className={`text-md border-dark ${isExpanded ? "opacity-100 border-b-4" : "opacity-60"} `}
                    >
                      {paso.titulo}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Slider Vertical con Swiper */}
      </motion.div>
    </>
  );
};
