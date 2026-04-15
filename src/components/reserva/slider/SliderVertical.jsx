import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./styleVertical.css";

import useReservaStore from "../../../store/reservaStore";
import { Datos } from "../datos/Datos";
import PasoFecha from "../datepicker/PasoFecha";
import PasoHora from "../PasoHoraMain";
import PasoCantidad from "../PasoCantidad";
import { Button } from "../../ui/Button";
import { BanknoteArrowUp, ChevronLeft, X } from "lucide-react";

export default function SliderVertical({
  onReservaSinMenuCheckout = () => {},
}) {
  const swiperRef = useRef(null);
  const [isPreparingWithoutMenu, setIsPreparingWithoutMenu] = useState(false);
  const [showMenuConfirmPopup, setShowMenuConfirmPopup] = useState(false);
  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);
  const [hasUserSelectedTime, setHasUserSelectedTime] = useState(false);

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
  } = useReservaStore();

  const selectedDate = reservaData.selectedDate
    ? new Date(reservaData.selectedDate)
    : new Date();
  const hour = reservaData.hour;
  const minute = reservaData.minute;
  const adults = reservaData.adults;
  const children = reservaData.children;
  const mascotas = reservaData.mascotas;
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
    : [false, false, false, false];
  const stepKeys = [null, "visitantes", "fecha", "hora"];

  const marcarPasoComoConfirmado = (stepIndex) => {
    const currentStepKey = stepKeys[stepIndex];
    const nextStepKey = stepKeys[stepIndex + 1];

    if (currentStepKey) {
      setPasoReserva(currentStepKey, { completado: true, habilitado: true });
    }

    if (nextStepKey) {
      setPasoReserva(nextStepKey, { habilitado: true });
    }
  };

  // Funciones helper
  const updateReservaField = (field, value) => {
    updateReservaData({ [field]: value });
  };

  const setSelectedDate = (date) => {
    setHasUserSelectedDate(true);
    const isoString = date instanceof Date ? date.toISOString() : date;
    updateReservaField("selectedDate", isoString);
  };
  const setHour = (hour) => {
    setHasUserSelectedTime(true);
    updateReservaField("hour", hour);
  };
  const setMinute = (minute) => {
    setHasUserSelectedTime(true);
    updateReservaField("minute", minute);
  };
  const setAdults = (adults) => updateReservaField("adults", adults);
  const setChildren = (children) => updateReservaField("children", children);
  const setMascotas = (mascotas) => updateReservaField("mascotas", mascotas);

  // Sincronizar Swiper con currentStep
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

  const handleContinueFromDatos = () => {
    const newCompleted = [...safeCompletedSteps];
    newCompleted[0] = true;
    setCompletedSteps(newCompleted);
    setCurrentStep(1);
  };

  const handleElegirMenu = async () => {
    const newCompleted = [...safeCompletedSteps];
    newCompleted[3] = true;
    setCompletedSteps(newCompleted);
    marcarPasoComoConfirmado(3);
    setDatosReservaCompletados(true);
  };

  const handleOpenMenuConfirm = () => {
    setShowMenuConfirmPopup(true);
  };

  const handleCancelMenuConfirm = () => {
    setShowMenuConfirmPopup(false);
  };

  const handleContinueMenuConfirm = async () => {
    if (!canContinueFromHora) return;
    setShowMenuConfirmPopup(false);
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
      newCompleted[3] = true;
      setCompletedSteps(newCompleted);
      marcarPasoComoConfirmado(3);
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
    if (currentStep === 1 && !canContinueFromCantidad) {
      alert("Selecciona una zona, una mesa y al menos 1 adulto para continuar");
      return;
    }

    if (currentStep === 2 && !canContinueFromFecha) {
      alert("Selecciona una fecha para continuar");
      return;
    }

    if (currentStep === 3 && !canContinueFromHora) {
      alert("Selecciona una hora para continuar");
      return;
    }

    const newCompleted = [...safeCompletedSteps];
    newCompleted[currentStep] = true;
    marcarPasoComoConfirmado(currentStep);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }

    setCompletedSteps(newCompleted);
  };

  const goToPreviousStep = () => {
    if (currentStep <= 0) return;
    setCurrentStep(currentStep - 1);
  };

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
        {/* Paso 0 datos */}
        <SwiperSlide className="size-full">
          <div className="w-full h-full flex flex-col items-center justify-center  ">
            <div className="w-full max-w-xl flex-1 flex items-center justify-center">
              <Datos onContinue={handleContinueFromDatos} />
            </div>
          </div>
        </SwiperSlide>

        {/* PASO 1: cantidad yo region */}
        <SwiperSlide className="size-full">
          <div className="size-full h-full flex flex-col items-center justify-center py-4">
            <div className="size-full flex-1 flex flex-col items-center justify-center">
              <PasoCantidad
                adults={adults}
                children={children}
                mascotas={mascotas}
                setAdults={setAdults}
                setChildren={setChildren}
                setMascotas={setMascotas}
                onConfirm={confirmarPaso}
                canConfirm={canContinueFromCantidad}
              />

              <div className="flex w-full max-w-lg justify-center gap-6">
                <ConfirmarPasoBoton
                  confirmarPaso={goToPreviousStep}
                  texto="Anterior"
                  variantType="button-secondary"
                />
                <ConfirmarPasoBoton
                  confirmarPaso={confirmarPaso}
                  isDisabled={!canContinueFromCantidad}
                />
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* PASO 2: fecha */}
        <SwiperSlide className="size-full">
          <div className="w-full h-full flex flex-col items-center justify-center py-4">
            <div className="w-full flex-1 flex items-center lg:px-14">
              <div className="flex flex-1 flex-col items-start justify-center">
                <h2 className="font-parkson mb-4 !text-4xl text-start">
                  <TitleSlider head="Elige la fecha" content="De tu reserva" />
                </h2>
              </div>

              <div className="flex-1 border-l border-black/20 pl-14 flex items-center justify-center">
                <PasoFecha
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </div>
            </div>
            <div className="flex w-full max-w-lg justify-center gap-6">
              <ConfirmarPasoBoton
                confirmarPaso={goToPreviousStep}
                texto="Anterior"
                variantType="button-secondary"
              />
              <ConfirmarPasoBoton
                confirmarPaso={confirmarPaso}
                isDisabled={!canContinueFromFecha}
              />
            </div>
          </div>
        </SwiperSlide>

        {/* PASO 3: horas */}
        <SwiperSlide className="slide-content">
          <div className="w-full h-full flex flex-col items-center justify-center py-4">
            <div className="w-full flex-1 flex items-center lg:px-14">
              <div className="flex flex-1 flex-col items-start justify-center">
                <h2 className="font-parkson mb-4 !text-4xl text-start">
                  <TitleSlider head="Elige la hora" content="De tu reserva" />
                </h2>
              </div>

              <div className="flex-1 border-l border-black/20 pl-14 flex items-center justify-center">
                <PasoHora
                  hour={hour}
                  minute={minute}
                  setHour={setHour}
                  setMinute={setMinute}
                />
              </div>
            </div>

            <div className="flex w-full max-w-lg justify-center gap-6">
              <ConfirmarPasoBoton
                confirmarPaso={goToPreviousStep}
                texto="Anterior"
                variantType="button-secondary"
              />
              <ConfirmarPasoBoton
                confirmarPaso={handleContinueMenuConfirm}
                texto="Continuar"
                isDisabled={!canContinueFromHora}
              />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </>
  );
}

const ConfirmarPasoBoton = ({
  confirmarPaso,
  texto = "Continuar",
  isDisabled = false,
  variantType = "button-dark",
}) => {
  return (
    <Button
      onClick={confirmarPaso}
      title={texto === "Anterior" ? "Volver" : texto}
      Icon={texto === "Anterior" ? ChevronLeft : null}
      type={variantType}
      fontSize="xl"
      width={texto === "Anterior" ? "" : "min"}
      customClass={`mt-4`}
      disabled={isDisabled}
    />
  );
};

const TitleSlider = ({ head, content }) => {
  return (
    <>
      <span className="lg:!text-5xl !text-5xl">{head} </span>
      <br className="max-lg:hidden" />
      <span className="lg:!text-7xl lg:!leading-14 !text-5xl">{content}</span>
    </>
  );
};
