import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./styleVertical.css";

import useReservaStore from "../../../store/reservaStore";
import { Datos } from "../datos/Datos";
import PasoFecha from "../datepicker/PasoFecha";
import PasoHora from "../PasoHoraMain";
import PasoCantidad from "../PasoCantidad";
import PasoRegion from "../PasoRegion";

export default function SliderVertical({
  stepinvert = false,
  onRegionChange,
  onReservaSinMenuCheckout = () => {},
}) {
  const swiperRef = useRef(null);
  const [isPreparingWithoutMenu, setIsPreparingWithoutMenu] = useState(false);

  const {
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    setPasoReserva,
    pasosReserva,
    reservaData,
    reservaZonaData,
    updateReservaData,
    setDatosReservaCompletados,
    setFlowStep,
    hasUserSelectedDate,
    hasUserSelectedTime,
    setHasUserSelectedDate,
    setHasUserSelectedTime,
  } = useReservaStore();

  const selectedDate = reservaData.selectedDate
    ? new Date(reservaData.selectedDate)
    : new Date();
  const hour = reservaData.hour;
  const minute = reservaData.minute;
  const adults = reservaData.adults;
  const children = reservaData.children;
  const mascotas = reservaData.mascotas;

  const canContinueFromRegion = Boolean(reservaZonaData?.selectedZoneId);
  const canContinueFromCantidad =
    Boolean(reservaZonaData?.selectedZoneId) &&
    Boolean(reservaZonaData?.mesaSeleccionada) &&
    Number(adults || 0) > 0;

  const isNonDefaultTime =
    String(hour || "09").padStart(2, "0") !== "09" ||
    String(minute || "00").padStart(2, "0") !== "00";
  const canContinueFromFecha =
    hasUserSelectedDate || Boolean(pasosReserva?.fecha?.completado);
  const canContinueFromHora =
    hasUserSelectedTime ||
    Boolean(pasosReserva?.hora?.completado) ||
    isNonDefaultTime;

  const safeCompletedSteps = Array.isArray(completedSteps)
    ? completedSteps
    : [false, false, false, false, false];

  // Orden condicional de pasos según stepinvert
  const orderedSteps = stepinvert
    ? ["region", "cantidad", "datos", "fecha", "hora"]
    : ["datos", "region", "cantidad", "fecha", "hora"];

  const currentStepName = orderedSteps[currentStep] || orderedSteps[0];

  // Índices de los pasos
  const getStepIndex = (stepName) => orderedSteps.indexOf(stepName);
  const datosStepIndex = getStepIndex("datos");
  const regionStepIndex = getStepIndex("region");
  const cantidadStepIndex = getStepIndex("cantidad");
  const fechaStepIndex = getStepIndex("fecha");
  const horaStepIndex = getStepIndex("hora");

  const getPasoKeyByStepName = (stepName) => {
    if (stepName === "cantidad") return "visitantes";
    if (stepName === "fecha") return "fecha";
    if (stepName === "hora") return "hora";
    return null;
  };

  const marcarPasoComoConfirmado = (stepName) => {
    const currentStepKey = getPasoKeyByStepName(stepName);

    let nextStepKey = null;

    if (stepName === "cantidad") {
      nextStepKey = "fecha";
    }

    if (stepName === "fecha") {
      nextStepKey = "hora";
    }

    if (currentStepKey) {
      setPasoReserva(currentStepKey, { completado: true, habilitado: true });
    }

    if (nextStepKey) {
      setPasoReserva(nextStepKey, { habilitado: true });
    }
  };

  const updateReservaField = (field, value) => {
    updateReservaData({ [field]: value });
  };

  const setSelectedDate = (date) => {
    setHasUserSelectedDate(true);
    const isoString = date instanceof Date ? date.toISOString() : date;
    updateReservaField("selectedDate", isoString);
  };

  const setHour = (nextHour) => {
    setHasUserSelectedTime(true);
    updateReservaField("hour", nextHour);
  };

  const setMinute = (nextMinute) => {
    setHasUserSelectedTime(true);
    updateReservaField("minute", nextMinute);
  };

  const setAdults = (nextAdults) => updateReservaField("adults", nextAdults);
  const setChildren = (nextChildren) =>
    updateReservaField("children", nextChildren);
  const setMascotas = (nextMascotas) =>
    updateReservaField("mascotas", nextMascotas);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    if (pasosReserva?.fecha?.completado) {
      setHasUserSelectedDate(true);
    }

    if (pasosReserva?.hora?.completado || isNonDefaultTime) {
      setHasUserSelectedTime(true);
    }
  }, [
    pasosReserva?.fecha?.completado,
    pasosReserva?.hora?.completado,
    isNonDefaultTime,
  ]);

  const handleSlideChange = (swiper) => {
    setCurrentStep(swiper.activeIndex);
  };

  const handleElegirMenu = async () => {
    const newCompleted = [...safeCompletedSteps];
    newCompleted[currentStep] = true;
    setCompletedSteps(newCompleted);
    marcarPasoComoConfirmado("hora");
    setDatosReservaCompletados(true);
  };

  const handleContinueMenuConfirm = async () => {
    if (!canContinueFromHora) return;
    await handleElegirMenu();
    setFlowStep("platos");
  };

  const handleReservarSinMenu = async () => {
    if (isPreparingWithoutMenu) return;

    setIsPreparingWithoutMenu(true);

    try {
      const checkoutDataSinMenu = {
        id: `temp-sin-menu-${Date.now()}`,
        fechaCreacion: new Date().toISOString(),
        estado: "temporal",
        datosReserva: {
          reservaData,
          reservaZonaData: {
            selectedZoneId: reservaZonaData?.selectedZoneId || null,
            selectedZoneName: reservaZonaData?.selectedZoneName || null,
            mesaAsignada: reservaZonaData?.mesaAsignada ?? null,
          },
          platosSeleccionados: [],
        },
        uiState: { showMenu: false, withoutMenu: true },
        validado: true,
      };

      try {
        localStorage.setItem(
          "checkout:reserva:temp",
          JSON.stringify(checkoutDataSinMenu.datosReserva),
        );
      } catch (_) {}

      const newCompleted = [...safeCompletedSteps];
      newCompleted[currentStep] = true;
      setCompletedSteps(newCompleted);
      marcarPasoComoConfirmado("hora");
      setPasoReserva("platos", { habilitado: false, completado: false });
      setDatosReservaCompletados(true);

      onReservaSinMenuCheckout(checkoutDataSinMenu.datosReserva);
    } catch (error) {
      alert(error?.message || "Error preparando checkout sin menu");
    } finally {
      setIsPreparingWithoutMenu(false);
    }
  };

  const confirmarPaso = async () => {
    if (currentStepName === "region" && !canContinueFromRegion) {
      alert("Selecciona una zona para continuar");
      return;
    }

    if (currentStepName === "cantidad" && !canContinueFromCantidad) {
      alert("Selecciona una mesa y al menos 1 adulto para continuar");
      return;
    }

    if (currentStepName === "fecha" && !canContinueFromFecha) {
      alert("Selecciona una fecha para continuar");
      return;
    }

    if (currentStepName === "hora" && !canContinueFromHora) {
      alert("Selecciona una hora para continuar");
      return;
    }

    const newCompleted = [...safeCompletedSteps];
    newCompleted[currentStep] = true;
    marcarPasoComoConfirmado(currentStepName);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (currentStep < orderedSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }

    setCompletedSteps(newCompleted);
  };

  const goToPreviousStep = () => {
    if (currentStep <= 0) return;
    setCurrentStep(currentStep - 1);
  };

  const regionSlide = (
    <SwiperSlide key="region" className="size-full">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <PasoRegion onRegionChange={onRegionChange} />
        </div>
      </div>
    </SwiperSlide>
  );

  const cantidadSlide = (
    <SwiperSlide key="cantidad" className="size-full">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full flex-1 flex flex-col items-center md:justify-between justify-center max-lg:gap-14">
          <PasoCantidad
            adults={adults}
            children={children}
            mascotas={mascotas}
            setAdults={setAdults}
            setChildren={setChildren}
            setMascotas={setMascotas}
          />
        </div>
      </div>
    </SwiperSlide>
  );

  const datosSlide = (
    <SwiperSlide key="datos" className="w-full">
      <Datos />
    </SwiperSlide>
  );

  return (
    <>
      <Swiper
        ref={swiperRef}
        direction="vertical"
        pagination={false}
        modules={[]}
        className="mySwiper"
        onSlideChange={handleSlideChange}
        initialSlide={currentStep}
        allowTouchMove={false}
        simulateTouch={false}
        keyboard={false}
      >
        {orderedSteps.map((stepName) => {
          if (stepName === "region") return regionSlide;
          if (stepName === "cantidad") return cantidadSlide;
          if (stepName === "datos") return datosSlide;
          if (stepName === "fecha") {
            return (
              <SwiperSlide key="fecha" className="size-full">
                <div className="w-full  flex flex-col items-center justify-center lg:py-4 gap-16 md:gap-0">
                  <div className="w-full lg:flex-1 max-lg:flex-col flex items-center lg:px-14 max-lg:gap-16">
                    <div className="flex lg:flex-1 flex-col items-start justify-center">
                      <h2 className="font-parkson mb-4 !text-4xl text-start">
                        <TitleSlider
                          head="Elija la fecha"
                          content="De su reserva"
                        />
                      </h2>
                    </div>

                    <div className="flex-1 w-full max-lg:px-8 lg:border-l border-black/20 lg:pl-14 flex items-center justify-center">
                      <PasoFecha
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          }
          if (stepName === "hora") {
            return (
              <SwiperSlide key="hora" className="slide-content">
                <div className="w-full flex flex-col items-center justify-center lg:py-4 gap-16 md:gap-0">
                  <div className="w-full lg:flex-1 max-lg:flex-col flex items-center lg:px-14 max-lg:gap-16">
                    <div className="flex lg:flex-1 flex-col items-start justify-center">
                      <h2 className="font-parkson mb-4 !text-4xl text-start">
                        <TitleSlider
                          head="Elija la hora"
                          content="De su reserva"
                        />
                      </h2>
                    </div>

                    <div className="flex-1 w-full max-lg:px-8 lg:border-l border-black/20 lg:pl-14 flex items-center justify-center">
                      <PasoHora
                        hour={hour}
                        minute={minute}
                        setHour={setHour}
                        setMinute={setMinute}
                      />
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            );
          }
          return null;
        })}
      </Swiper>
    </>
  );
}

const TitleSlider = ({ head, content }) => {
  return (
    <>
      <span className="lg:!text-5xl !text-5xl">{head} </span>
      <br className="max-lg:hidden" />
      <span className="lg:!text-7xl lg:!leading-14 !text-5xl">{content}</span>
    </>
  );
};
