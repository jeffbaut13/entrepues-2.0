import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./styleVertical.css";

import useReservaStore from "../../store/reservaStore";
import PasoFecha from "../reserva/datepicker/PasoFecha";
import PasoHora from "../reserva/PasoHoraMain";
import PasoCantidad from "../reserva/PasoCantidad";
import PasoContacto from "../reserva/PasoContacto";
import ResumenReserva from "../reserva/ResumenReserva";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function SliderVertical({ setactiveFull }) {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const [isContactDataValid, setIsContactDataValid] = useState(false);

  const {
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    reservaData,
    reservaZonaData,
    updateReservaData,
    setZonaExpanded,
    setDatosReservaCompletados,

    editarReserva,
    enviarDatos,
    showThankYouPage,
  } = useReservaStore();

  const selectedDate = reservaData.selectedDate
    ? new Date(reservaData.selectedDate)
    : new Date();
  const hour = reservaData.hour;
  const minute = reservaData.minute;
  const adults = reservaData.adults;
  const children = reservaData.children;
  const mascotas = reservaData.mascotas;
  const name = reservaData.name;
  const email = reservaData.email;
  const whatsapp = reservaData.whatsapp;
  const totalOcupacion =
    Number(adults || 0) + Number(children || 0) + Number(mascotas || 0);
  const canContinueFromCantidad =
    Boolean(reservaZonaData?.selectedZoneId) &&
    Boolean(reservaZonaData?.mesaSeleccionada) &&
    Number(adults || 0) > 0;

  // Funciones helper
  const updateReservaField = (field, value) => {
    updateReservaData({ [field]: value });
  };

  const setSelectedDate = (date) => {
    const isoString = date instanceof Date ? date.toISOString() : date;
    updateReservaField("selectedDate", isoString);
  };
  const setHour = (hour) => updateReservaField("hour", hour);
  const setMinute = (minute) => updateReservaField("minute", minute);
  const setAdults = (adults) => updateReservaField("adults", adults);
  const setChildren = (children) => updateReservaField("children", children);
  const setMascotas = (mascotas) => updateReservaField("mascotas", mascotas);
  const setName = (name) => updateReservaField("name", name);
  const setEmail = (email) => updateReservaField("email", email);
  const setWhatsapp = (whatsapp) => updateReservaField("whatsapp", whatsapp);

  // Sincronizar Swiper con currentStep
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(currentStep);
    }
  }, [currentStep]);

  const handleSlideChange = (swiper) => {
    setCurrentStep(swiper.activeIndex);
  };

  const handleElegirMenu = async () => {
    setDatosReservaCompletados(true);
    navigate("/reservar/elegir-platos");
  };

  const handleConfirmarReserva = async () => {
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      alert("Por favor completa todos los datos de contacto");
      return;
    }

    const result = await enviarDatos();
    if (result.ok) {
      showThankYouPage();
    } else {
      alert("Error al confirmar la reserva: " + result.error);
    }
  };

  const handleEditarReserva = () => {
    const lastCompletedStep = completedSteps.reduce(
      (lastIndex, completed, index) => {
        return completed ? index : lastIndex;
      },
      0
    );
    editarReserva(lastCompletedStep);
  };

  const confirmarPaso = async () => {
    if (currentStep === 0 && !canContinueFromCantidad) {
      alert("Selecciona una zona, una mesa y al menos 1 adulto para continuar");
      return;
    }

    // Si estamos en el paso de contacto (3), validar datos completos
    if (currentStep === 3) {
      if (!isContactDataValid) {
        alert("Por favor completa todos los datos de contacto");
        return;
      }
    }

    const newCompleted = [...completedSteps];
    newCompleted[currentStep] = true;

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

  return (
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
            <div className="flex-1 flex items-center justify-center">
              <PasoFecha
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
          </div>
          <ConfirmarPasoBoton confirmarPaso={confirmarPaso} />
        </div>
      </SwiperSlide>

      {/* PASO 2: Cantidad de personas */}
      <SwiperSlide className="slide-content">
        <div className="w-full h-full flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-sm flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <PasoHora
                hour={hour}
                minute={minute}
                setHour={setHour}
                setMinute={setMinute}
              />
            </div>
          </div>
          <ConfirmarPasoBoton
            confirmarPaso={handleElegirMenu}
            texto="Seleccionar platos"
          />
        </div>
      </SwiperSlide>
    </Swiper>
  );
}

const ConfirmarPasoBoton = ({
  confirmarPaso,
  texto = "Continuar",
  isDisabled = false,
}) => {
  return (
    <Button
      onClick={confirmarPaso}
      className="mt-6"
      title={texto}
      type="button-dark"
      //width="min"
      customClass={`min-w-80 py-1.5 ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={isDisabled}
    />
  );
};
