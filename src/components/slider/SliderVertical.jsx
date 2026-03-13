import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./styleVertical.css";

import useReservaStore from "../../store/reservaStore";
import PasoFecha from "../reserva/datepicker/PasoFecha";
import PasoHora from "../reserva/PasoHoraMain";
import PasoCantidad from "../reserva/PasoCantidad";
import { Button } from "../ui/Button";
import { BanknoteArrowUp, ChevronLeft, X } from "lucide-react";

export default function SliderVertical({
  isZonaExpanded = false,
  setZonaExpanded = () => {},
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
  const stepKeys = ["visitantes", "fecha", "hora", "platos"];

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
  }, [pasosReserva?.fecha?.completado, pasosReserva?.hora?.completado, isNonDefaultTime]);

  const handleSlideChange = (swiper) => {
    setCurrentStep(swiper.activeIndex);
  };

  const handleElegirMenu = async () => {
    const newCompleted = [...safeCompletedSteps];
    newCompleted[2] = true;
    setCompletedSteps(newCompleted);
    marcarPasoComoConfirmado(2);
    setDatosReservaCompletados(true);
  };

  const handleOpenMenuConfirm = () => {
    setShowMenuConfirmPopup(true);
  };

  const handleCancelMenuConfirm = () => {
    setShowMenuConfirmPopup(false);
  };

  const handleContinueMenuConfirm = async () => {
    setShowMenuConfirmPopup(false);
    await handleElegirMenu();
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
      newCompleted[2] = true;
      setCompletedSteps(newCompleted);
      marcarPasoComoConfirmado(2);
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
    if (currentStep === 0 && !canContinueFromCantidad) {
      alert("Selecciona una zona, una mesa y al menos 1 adulto para continuar");
      return;
    }

    if (currentStep === 1 && !canContinueFromFecha) {
      alert("Selecciona una fecha para continuar");
      return;
    }

    if (currentStep === 2 && !canContinueFromHora) {
      alert("Selecciona una hora para continuar");
      return;
    }

    const newCompleted = [...safeCompletedSteps];
    newCompleted[currentStep] = true;
    marcarPasoComoConfirmado(currentStep);

    if (currentStep === 0) {
      setZonaExpanded(false);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Al completar los 4 pasos, marcar resumen como mostrado
      // Esto se dispara desde el store
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideTo(4);
      }
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
        {/* PASO 0: Fecha */}
        <SwiperSlide className="size-full">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full flex-1 flex flex-col">
              <div className="flex-1">
                <PasoCantidad
                  adults={adults}
                  children={children}
                  mascotas={mascotas}
                  isZonaExpanded={isZonaExpanded}
                  setZonaExpanded={setZonaExpanded}
                  setAdults={setAdults}
                  setChildren={setChildren}
                  setMascotas={setMascotas}
                  onConfirm={confirmarPaso}
                  canConfirm={canContinueFromCantidad}
                />
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* PASO 1: Hora */}
        <SwiperSlide className="size-full">
          <div className="w-full h-full flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-lg flex-1 flex flex-col">
              <h2 className="font-parkson !text-4xl">
                Elige la fecha de tu reserva
              </h2>
              <div className="flex-1 flex items-center justify-center">
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

        {/* PASO 2: Cantidad de personas */}
        <SwiperSlide className="slide-content">
          <div className="w-full h-full flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-sm flex-1 flex flex-col">
              <h2 className="font-parkson !text-4xl">¿A qué hora te esperamos?</h2>
              <div className="flex-1 flex items-center justify-center">
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

      <AnimatePresence>
        {showMenuConfirmPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[30000] bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-lg bg-[#faf6ef] rounded-2xl p-6"
            >
              <BanknoteArrowUp size={62} className="mx-auto mb-6" />
              <p className="text-center mb-6">
                Para continuar deberás seleccionar{" "}
                <br className=" hidden md:block " /> y pagar los platos de tu
                reserva
              </p>
              <div className="w-full flex justify-center gap-3">
                <Button
                  onClick={handleCancelMenuConfirm}
                  title="Cancelar"
                  Icon={X}
                  type="button-secondary"
                  width="min"
                  fontSize="xl"
                />
                <Button
                  onClick={handleContinueMenuConfirm}
                  title="Continuar"
                  type="button-dark"
                  width="min"
                  fontSize="xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
