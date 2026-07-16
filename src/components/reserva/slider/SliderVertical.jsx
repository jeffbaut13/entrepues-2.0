import { useRef, useEffect } from "react";
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
import PlatosSeleccion from "../PlatosSeleccion";

export default function SliderVertical({
  stepinvert = false,
  onRegionChange,
  onPagoSuccess,
  registerConfirmar,
}) {
  const swiperRef = useRef(null);

  const {
    currentStep,
    setCurrentStep,
    pasosReserva,
    reservaData,
    updateReservaData,
    setHasUserSelectedDate,
    setHasUserSelectedTime,
    detalleAsistentes,
  } = useReservaStore();

  const selectedDate = reservaData.selectedDate
    ? new Date(reservaData.selectedDate)
    : new Date();
  const hour = reservaData.hour;
  const minute = reservaData.minute;
  const adults = reservaData.adults;
  const children = reservaData.children;
  const mascotas = reservaData.mascotas;

  const isNonDefaultTime =
    String(hour || "09").padStart(2, "0") !== "09" ||
    String(minute || "00").padStart(2, "0") !== "00";

  // Orden condicional de pasos según stepinvert
  const orderedSteps = stepinvert
    ? ["region", "cantidad", "datos", "fecha", "hora", "platos"]
    : ["datos", "region", "cantidad", "fecha", "hora", "platos"];

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
    if (isMountedRef.current && swiperRef.current?.swiper) {
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

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSlideChange = (swiper) => {
    if (!isMountedRef.current) return;
    setCurrentStep(swiper.activeIndex);
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
      {orderedSteps.map((stepName, index) => {
        if (stepName === "region") {
          return (
            <SwiperSlide key={`region-${index}`} className="size-full">
              <div className="w-full flex flex-col items-center justify-center">
                <div className="w-full flex-1 flex flex-col items-center justify-center">
                  <PasoRegion onRegionChange={onRegionChange} />
                </div>
              </div>
            </SwiperSlide>
          );
        }

        if (stepName === "cantidad") {
          return (
            <SwiperSlide key={`cantidad-${index}`} className="size-full">
              <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full flex-1 flex flex-col items-center justify-center">
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
        }

        if (stepName === "datos") {
          return (
            <SwiperSlide key={`datos-${index}`} className="w-full">
              <Datos />
            </SwiperSlide>
          );
        }

        if (stepName === "fecha") {
          return (
            <SwiperSlide key={`fecha-${index}`} className="size-full">
              <div className="w-full flex flex-col items-center justify-center ">
                <div className="w-full lg:flex-1 max-lg:flex-col flex items-center">
                  <div className="flex lg:flex-1 flex-col md:items-start justify-center pl-4">
                    <h2 className="font-parkson mb-4 !text-4xl text-start">
                      <TitleSlider head="Elija la fecha de su reserva" />
                    </h2>
                    <p>¿Qué día nos va a visitar?</p>
                  </div>

                  <div className="flex-1 w-full flex items-center justify-center pr-8">
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
            <SwiperSlide key={`hora-${index}`} className="slide-content">
              <div className="w-full flex flex-col items-center justify-center">
                <div className="w-full lg:flex-1 max-lg:flex-col flex items-center">
                  <div className="flex flex-1 flex-col items-start justify-center pl-4">
                    <h2 className="font-parkson mb-4 !text-4xl text-start">
                      <TitleSlider head="Elija la hora de su reserva" />
                    </h2>
                  </div>
                  <div className="flex-1 flex justify-center items-center">
                    <div className="flex-1 max-w-84 w-full flex items-center justify-center">
                      <PasoHora
                        hour={hour}
                        minute={minute}
                        setHour={setHour}
                        setMinute={setMinute}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        }

        if (stepName === "platos") {
          return (
            <SwiperSlide key={`${stepName + index}`} className="size-full">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-full h-full flex-1 flex flex-col items-center justify-center">
                  <PlatosSeleccion
                    asistentes={detalleAsistentes}
                    firestoreId={null}
                    onPagoSuccess={(pago) => onPagoSuccess?.(pago)}
                    registerConfirmar={registerConfirmar}
                  />
                </div>
              </div>
            </SwiperSlide>
          );
        }

        return null;
      })}
    </Swiper>
  );
}

const TitleSlider = ({ head }) => {
  return <span className="lg:!text-5xl !text-5xl">{head} </span>;
};
