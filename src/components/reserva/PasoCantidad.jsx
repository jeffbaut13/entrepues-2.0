import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, FishOff } from "lucide-react";
import { IncremenAndDecrementComponent } from "../common/IncrementAndDrecrement";
import { MesasSelectorx4, MesasSelectorx6 } from "../common/MesasSelector";
import { Button } from "../ui/Button";
import useReservaStore from "../../store/reservaStore";

import { Mapa } from "../ui/Mapa";

const MAX_OCUPACION_TOTAL = 12;
const MAX_MASCOTAS = 4;

const getGridColsClass = (mesaGridCols) => {
  const baseCols = Number(mesaGridCols?.base || 2);
  const mdCols = Number(mesaGridCols?.md || 6);

  const baseMap = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  const mdMap = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  };

  return `${baseMap[baseCols] || "grid-cols-2"} ${
    mdMap[mdCols] || "md:grid-cols-6"
  }`;
};

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
  const {
    actualizarDetalleAsistentes,
    limpiarDetalleAsistentes,
    reservaZonaData,
    seleccionarZona,
    seleccionarMesaBase,
    isZonaExpanded,
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
  const mesaGridCols = reservaZonaData?.mesaGridCols;
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

  const renderMesaUnit = (
    capacidadBase,
    ocupadas,
    size = "sm",
    selected = false,
    petSeats = []
  ) => {
    const className = selected ? "ring-2 ring-dark rounded-md" : "";

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
            className="w-full h-full rounded-2xl flex flex-col gap-3"
          >
            {/* Increment and decrement */}
            <div className="w-full flex justify-center gap-12">
              <div className="flex justify-between flex-col items-center gap-3">
                <p>Adultos</p>
                <IncremenAndDecrementComponent
                  item={adultsNum}
                  increaseQuantity={() => {
                    if (totalOcupacion < MAX_OCUPACION_TOTAL) {
                      const nextAdults = adultsNum + 1;
                      setAdults(nextAdults);
                      syncAsistentes(nextAdults, childrenNum);
                    }
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
                    if (totalOcupacion < MAX_OCUPACION_TOTAL) {
                      const nextChildren = childrenNum + 1;
                      setChildren(nextChildren);
                      syncAsistentes(adultsNum, nextChildren);
                    }
                  }}
                  decreaseQuantity={() => {
                    const nextChildren = Math.max(childrenNum - 1, 0);
                    setChildren(nextChildren);
                    syncAsistentes(adultsNum, nextChildren);
                  }}
                />
              </div>

              <div className="flex justify-between flex-col items-center gap-3">
                <p>Mascotas</p>
                <IncremenAndDecrementComponent
                  item={mascotasNum}
                  increaseQuantity={() => {
                    if (!permiteMascotas) {
                      return;
                    }
                    if (mascotasNum >= MAX_MASCOTAS) {
                      return;
                    }
                    if (totalOcupacion >= MAX_OCUPACION_TOTAL) {
                      return;
                    }
                    setMascotas(mascotasNum + 1);
                  }}
                  decreaseQuantity={() => {
                    setMascotas(Math.max(mascotasNum - 1, 0));
                  }}
                />
              </div>
            </div>
            {/* Mesas y botones */}
            <div className="size-full flex flex-col justify-end bg-white/40 rounded-2xl">
              <div className="size-full rounded-2xl p-3 overflow-auto relative flex justify-center items-center">
                <p className="text-end mb-2  absolute right-2 top-2">
                  {!permiteMascotas && (
                    <>
                      <FishOff className="text-red-600 ml-1" />
                    </>
                  )}
                </p>

                <div className={`grid ${getGridColsClass(mesaGridCols)} gap-3`}>
                  {opcionesMesa.map((opcion) => {
                    const isSelected =
                      mesaSeleccionada?.optionId === opcion.optionId;

                    return (
                      <button
                        key={opcion.optionId}
                        type="button"
                        onClick={() => seleccionarMesaBase(opcion.optionId)}
                        className={`rounded-xl p-2 transition ${
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

export default PasoCantidad;
