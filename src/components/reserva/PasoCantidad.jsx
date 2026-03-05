import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { IncremenAndDecrementComponent } from "../common/IncrementAndDrecrement";
import { MesasSelectorx4, MesasSelectorx6 } from "../common/MesasSelector";
import { Button } from "../ui/Button";
import useReservaStore from "../../store/reservaStore";

import { Mapa } from "../ui/Mapa";
import { DontPet } from "../ui/DontPet";

const MAX_OCUPACION_TOTAL = 12;
const MAX_MASCOTAS = 4;

const PasoCantidad = ({
  adults = 0,
  children = 0,
  mascotas = 0,
  isZonaExpanded = false,
  setZonaExpanded = () => {},
  setAdults,
  setChildren,
  setMascotas,
  onConfirm,
  canConfirm = false,
}) => {
  const [errorAsistentes, setErrorAsistentes] = useState("");

  const {
    actualizarDetalleAsistentes,
    limpiarDetalleAsistentes,
    reservaZonaData,
    seleccionarZona,
  } = useReservaStore();

  const adultsNum = Math.max(0, Number(adults) || 0);
  const childrenNum = Math.max(0, Number(children) || 0);
  const mascotasNum = Math.max(0, Number(mascotas) || 0);
  const totalPersonas = adultsNum + childrenNum;
  const totalOcupacion = adultsNum + childrenNum + mascotasNum;

  const zonas = reservaZonaData?.zonas || [];
  const selectedZoneId = reservaZonaData?.selectedZoneId || zonas?.[0]?.id;
  const selectedZoneName =
    reservaZonaData?.selectedZoneName ||
    zonas.find((zona) => zona.id === selectedZoneId)?.nombre ||
    "";
  const mesaSeleccionada = reservaZonaData?.mesaSeleccionada;
  const permiteMascotas = Boolean(reservaZonaData?.permiteMascotas);

  const syncAsistentes = (nextAdults, nextChildren) => {
    const total = Number(nextAdults || 0) + Number(nextChildren || 0);
    if (total > 0) {
      actualizarDetalleAsistentes({
        adults: nextAdults,
        children: nextChildren,
      });
      return;
    }
    limpiarDetalleAsistentes();
  };

  const showMaxAsistentesError = () => {
    setErrorAsistentes(
      `Has alcanzado el máximo de ${MAX_OCUPACION_TOTAL} asistentes.`
    );
  };

  const renderMesaUnit = (
    capacidadBase,
    ocupadas,
    size,
    selected = false,
    petSeats = []
  ) => {
    const className = selected ? "" : "";

    if (capacidadBase <= 4) {
      return (
        <div className={className}>
          <MesasSelectorx4
            index={ocupadas}
            size={size}
            colorRelleno="fill-brown"
            strokeSecondary="var(--secondary)"
            strokeDark="var(--dark)"
            petSeats={petSeats}
          />
        </div>
      );
    }

    return (
      <div className={className}>
        <MesasSelectorx6
          index={ocupadas}
          size={size}
          colorRelleno="fill-brown"
          strokeSecondary="var(--secondary)"
          strokeDark="var(--dark)"
          petSeats={petSeats}
        />
      </div>
    );
  };

  const renderMesaGroup = (
    opcion,
    size,
    selected = false,
    ocupacionManual = null
  ) => {
    const mesasPlan =
      opcion?.mesasPlan?.length > 0
        ? opcion.mesasPlan
        : Array.from(
            { length: opcion.mesasUnidas || 1 },
            () => opcion.capacidadBase
          );

    const ocupacionBase =
      ocupacionManual !== null ? ocupacionManual : totalOcupacion;
    const ocupacionAUsar = Math.min(ocupacionBase, opcion.capacidadTotal || 0);

    let ocupacionRestante = ocupacionAUsar;
    let personasRestantes = Math.min(totalPersonas, ocupacionAUsar);
    let mascotasRestantes = Math.min(
      mascotasNum,
      Math.max(0, ocupacionAUsar - personasRestantes)
    );

    return mesasPlan.map((capacidadMesa, idx) => {
      const ocupadasMesa = Math.max(
        0,
        Math.min(capacidadMesa, ocupacionRestante)
      );
      ocupacionRestante = Math.max(0, ocupacionRestante - capacidadMesa);

      const personasEnMesa = Math.min(personasRestantes, ocupadasMesa);
      personasRestantes = Math.max(0, personasRestantes - personasEnMesa);

      const mascotasEnMesa = Math.min(
        mascotasRestantes,
        Math.max(0, ocupadasMesa - personasEnMesa)
      );
      mascotasRestantes = Math.max(0, mascotasRestantes - mascotasEnMesa);

      const petSeats = Array.from(
        { length: mascotasEnMesa },
        (_, petIndex) => personasEnMesa + petIndex
      );

      return (
        <div
          key={`${opcion.capacidadBase}-${capacidadMesa}-${size}-${idx}`}
          className="flex items-center justify-center"
        >
          {renderMesaUnit(
            capacidadMesa,
            ocupadasMesa,
            size,
            selected && idx === 0,
            petSeats
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    syncAsistentes(adultsNum, childrenNum);
  }, [adultsNum, childrenNum]);

  useEffect(() => {
    if (totalOcupacion < MAX_OCUPACION_TOTAL && errorAsistentes) {
      setErrorAsistentes("");
    }
  }, [totalOcupacion, errorAsistentes]);

  useEffect(() => {
    if (!permiteMascotas && mascotasNum > 0) {
      setMascotas(0);
    }
  }, [permiteMascotas, mascotasNum, setMascotas]);

  const pushZone = (name) => {
    seleccionarZona(name);
    setZonaExpanded(true);
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!isZonaExpanded ? (
          <div className="size-full flex justify-center items-center flex-col">
            <h2 className="font-parkson !text-4xl">¿Dónde quieres comer?</h2>
            <Mapa handleShowZone={pushZone} size={"w-full h-96 flex"} />
          </div>
        ) : (
          <motion.div
            key="zona-map"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full min-h-0 rounded-2xl flex flex-col gap-3"
          >
            {/* Increment and decrement */}
            <div className="w-full flex justify-center gap-12">
              <div className="flex justify-between flex-col items-center gap-3">
                <p>Adultos</p>
                <IncremenAndDecrementComponent
                  item={adultsNum}
                  increaseQuantity={() => {
                    if (totalOcupacion >= MAX_OCUPACION_TOTAL) {
                      showMaxAsistentesError();
                      return;
                    }
                    const nextAdults = adultsNum + 1;
                    setAdults(nextAdults);
                    syncAsistentes(nextAdults, childrenNum);
                  }}
                  decreaseQuantity={() => {
                    const nextAdults = Math.max(adultsNum - 1, 0);
                    setAdults(nextAdults);
                    syncAsistentes(nextAdults, childrenNum);
                  }}
                />
              </div>

              <div className="flex justify-between flex-col items-center gap-3">
                <p>Niños</p>
                <IncremenAndDecrementComponent
                  item={childrenNum}
                  increaseQuantity={() => {
                    if (totalOcupacion >= MAX_OCUPACION_TOTAL) {
                      showMaxAsistentesError();
                      return;
                    }
                    const nextChildren = childrenNum + 1;
                    setChildren(nextChildren);
                    syncAsistentes(adultsNum, nextChildren);
                  }}
                  decreaseQuantity={() => {
                    const nextChildren = Math.max(childrenNum - 1, 0);
                    setChildren(nextChildren);
                    syncAsistentes(adultsNum, nextChildren);
                  }}
                />
              </div>

              {permiteMascotas && (
                <div className="flex justify-between flex-col items-center gap-3">
                  <p>Mascotas</p>
                  <IncremenAndDecrementComponent
                    item={mascotasNum}
                    increaseQuantity={() => {
                      if (mascotasNum >= MAX_MASCOTAS) {
                        return;
                      }
                      if (totalOcupacion >= MAX_OCUPACION_TOTAL) {
                        showMaxAsistentesError();
                        return;
                      }
                      setMascotas(mascotasNum + 1);
                    }}
                    decreaseQuantity={() => {
                      setMascotas(Math.max(mascotasNum - 1, 0));
                    }}
                  />
                </div>
              )}
            </div>

            {errorAsistentes && (
              <p className="text-center text-sm text-red-500 px-3">
                {errorAsistentes}
              </p>
            )}

            {/* Mesas y botones */}
            <div className="size-full min-h-0 flex flex-col justify-between bg-white/40 rounded-2xl overflow-hidden">
              <div />
              <div className="w-full h-100 min-h-0 rounded-2xl p-3 relative flex flex-col justify-start items-stretch overflow-hidden">
                <p className="w-full text-center !text-5xl font-parkson mb-4">
                  {selectedZoneName}
                </p>
                <p className="text-end mb-2  absolute right-2 top-2">
                  {!permiteMascotas && (
                    <>
                      <DontPet size="w-6 h-auto" color="fill-dark/40" />
                    </>
                  )}
                  {permiteMascotas && (
                    <>
                      <i className="w-6 h-fit inline-block mr-4">
                        <img
                          className="size-full object-contain inline-block"
                          src="/iconos/zona-pet.svg"
                          alt="Zona Pet"
                        />
                      </i>
                      <span className="text-sm text-dark">Zona Pet</span>
                    </>
                  )}
                </p>
                <div className="w-full flex-1 min-h-0 flex gap-3 overflow-hidden">
                  <div
                    className={`w-1/2 border border-dark flex flex-wrap items-center justify-between h-full min-h-0 overflow-y-auto gap-3 pr-1`}
                  >
                    {mesaSeleccionada && (
                      <div className="w-full h-full rounded-xl p-2 bg-white/50 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-2">
                          {renderMesaGroup(
                            mesaSeleccionada,
                            "lg",
                            true,
                            totalOcupacion
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 h-full min-h-0 overflow-hidden">
                    <RegionImageSlider selectedZoneName={selectedZoneName} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-3 flex justify-center gap-3">
                <Button
                  onClick={() => setZonaExpanded(false)}
                  type="button-secondary"
                  iconSize="lg"
                  fontSize="xl"
                  title={<>Otra región</>}
                  Icon={ChevronLeft}
                />
                <Button
                  onClick={onConfirm}
                  title="Confirmar"
                  type="button-dark"
                  width="min"
                  fontSize="xl"
                  customClass={`${
                    canConfirm ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!canConfirm}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RegionImageSlider = ({ selectedZoneName }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const zoneSlug = (selectedZoneName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const slides = [1, 2, 3].map((index) => ({
    src: `/imagenes/regiones/${zoneSlug}-${index}.webp`,
    alt: `${selectedZoneName || "Region"} ${index}`,
  }));
  const navPrevClass = `gallery-prev-${zoneSlug || "default"}`;
  const navNextClass = `gallery-next-${zoneSlug || "default"}`;

  useEffect(() => {
    setActiveSlide(0);
  }, [zoneSlug]);

  return (
    <>
      <div className="w-full h-full overflow-hidden relative bg-dark/10 rounded-xl">
        <Swiper
          modules={[Autoplay, Pagination]}
          loop={true}
          slidesPerView={1}
          centeredSlides={true}
          spaceBetween={8}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 2800,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={650}
          onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
          className="w-full h-full [&_.swiper-pagination]:!bottom-2 [&_.swiper-pagination-bullet]:!h-2.5 [&_.swiper-pagination-bullet]:!w-2.5 [&_.swiper-pagination-bullet]:!bg-secondary/70 [&_.swiper-pagination-bullet]:!opacity-100 [&_.swiper-pagination-bullet-active]:!bg-secondary [&_.swiper-pagination-bullet]:ring-2 [&_.swiper-pagination-bullet]:ring-dark/10"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.src} className="w-full h-full">
              <button
                type="button"
                onClick={() => {
                  setActiveSlide(index);
                  setIsGalleryOpen(true);
                }}
                className="w-full h-full"
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {isGalleryOpen &&
        createPortal(
          <div className="fixed inset-0 z-[119999] bg-black/60 flex items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-5 right-5 z-[10000] text-white bg-black/40 hover:bg-black/60 transition rounded-full p-2"
              aria-label="Cerrar galeria"
            >
              <X size={24} />
            </button>

            <div className="w-full h-full max-h-[95vh]">
              <button
                type="button"
                className={`${navPrevClass} absolute left-4 top-1/2 -translate-y-1/2 z-[10001] bg-dark/40 hover:bg-dark/60 text-secondary rounded-full p-2.5 transition`}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                className={`${navNextClass} absolute right-4 top-1/2 -translate-y-1/2 z-[10001] bg-dark/40 hover:bg-dark/60 text-secondary rounded-full p-2.5 transition`}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} />
              </button>

              <Swiper
                modules={[Pagination, Navigation]}
                loop={true}
                initialSlide={activeSlide}
                pagination={{ clickable: true }}
                navigation={{
                  prevEl: `.${navPrevClass}`,
                  nextEl: `.${navNextClass}`,
                }}
                className="w-full h-full [&_.swiper-pagination]:!bottom-2 [&_.swiper-pagination-bullet]:!h-2.5 [&_.swiper-pagination-bullet]:!w-2.5 [&_.swiper-pagination-bullet]:!bg-secondary/70 [&_.swiper-pagination-bullet]:!opacity-100 [&_.swiper-pagination-bullet-active]:!bg-secondary [&_.swiper-pagination-bullet]:ring-2 [&_.swiper-pagination-bullet]:ring-dark/10"
              >
                {slides.map((slide) => (
                  <SwiperSlide
                    key={`gallery-${slide.src}`}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="w-full h-full object-contain"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
export default PasoCantidad;
