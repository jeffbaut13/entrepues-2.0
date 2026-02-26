import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
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
    seleccionarMesaBase,
    isZonaExpanded,
    seleccionarZona,
    setZonaExpanded,
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
  const opcionesMesa = reservaZonaData?.opcionesMesa || [];
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
    size = "sm",
    selected = false,
    petSeats = []
  ) => {
    const className = selected ? "ring-2 ring-dark/30 rounded-md" : "";

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
    size = "sm",
    selected = false,
    mesaState = null
  ) => {
    const capacidadMesa = Number(opcion?.capacidadBase || 0);
    const ocupadasMesa = Math.max(
      0,
      Math.min(capacidadMesa, Number(mesaState?.ocupadas || 0))
    );
    const personasEnMesa = Math.max(
      0,
      Math.min(ocupadasMesa, Number(mesaState?.personas || 0))
    );
    const mascotasEnMesa = Math.max(
      0,
      Math.min(ocupadasMesa - personasEnMesa, Number(mesaState?.mascotas || 0))
    );

    const petSeats = Array.from(
      { length: mascotasEnMesa },
      (_, petIndex) => personasEnMesa + petIndex
    );

    return (
      <div
        key={`${opcion.optionId || opcion.capacidadBase}-${size}`}
        className="flex items-center justify-center"
      >
        {renderMesaUnit(capacidadMesa, ocupadasMesa, size, selected, petSeats)}
      </div>
    );
  };

  const buildOcupacionPorMesa = () => {
    const selectedOptionId = mesaSeleccionada?.optionId;
    if (!selectedOptionId || totalOcupacion <= 0) {
      return {};
    }

    const selectedIndex = opcionesMesa.findIndex(
      (opcion) => opcion.optionId === selectedOptionId
    );
    if (selectedIndex < 0) {
      return {};
    }

    const distribucion = {};
    let personasRestantes = totalPersonas;
    let mascotasRestantes = mascotasNum;
    let ocupacionRestante = totalOcupacion;

    for (
      let index = selectedIndex;
      index < opcionesMesa.length && ocupacionRestante > 0;
      index += 1
    ) {
      const opcion = opcionesMesa[index];
      const capacidadMesa = Number(opcion?.capacidadBase || 0);
      if (capacidadMesa <= 0) {
        continue;
      }

      const ocupadas = Math.min(capacidadMesa, ocupacionRestante);
      const personas = Math.min(personasRestantes, ocupadas);
      const mascotas = Math.min(mascotasRestantes, ocupadas - personas);

      distribucion[opcion.optionId] = {
        ocupadas,
        personas,
        mascotas,
      };

      ocupacionRestante -= ocupadas;
      personasRestantes -= personas;
      mascotasRestantes -= mascotas;
    }

    return distribucion;
  };

  const ocupacionPorMesa = buildOcupacionPorMesa();

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
          <Mapa handleShowZone={pushZone} />
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
                </p>
                <div className="w-full flex-1 min-h-0 flex gap-3 overflow-hidden">
                  <div
                    className={`w-1/2 border border-dark flex flex-wrap items-center justify-between h-full min-h-0 overflow-y-auto gap-3 pr-1`}
                  >
                    {opcionesMesa.map((opcion) => {
                      const isSelected =
                        mesaSeleccionada?.optionId === opcion.optionId;

                      return (
                        <button
                          key={opcion.optionId}
                          type="button"
                          onClick={() => seleccionarMesaBase(opcion.optionId)}
                          className={`w-27 h-auto rounded-xl p-2 transition ${
                            isSelected ? "bg-white" : "bg-white/40"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {renderMesaGroup(
                              opcion,
                              "sm",
                              isSelected,
                              ocupacionPorMesa[opcion.optionId] || null
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-1 h-full min-h-0 overflow-hidden">
                    <RegionImageSlider />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-3 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setZonaExpanded(false)}
                  className="rounded-xl px-3 py-1.5 flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Otra zona
                </button>

                <Button
                  onClick={onConfirm}
                  title="Confirmar"
                  type="button-dark"
                  width="min"
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

const RegionImageSlider = () => {
  const slides = [
    { src: "/imagenes/regiones/img-1.webp", alt: "Imagen región 1" },
    { src: "/imagenes/regiones/img-2.webp", alt: "Imagen región 2" },
    { src: "/imagenes/regiones/img-3.webp", alt: "Imagen región 3" },
  ];

  return (
    <div className="w-full h-full overflow-hidden relative bg-black/10">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        speed={700}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.src} className="w-full h-full">
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PasoCantidad;

