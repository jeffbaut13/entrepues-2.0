import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useReservaStore from "../../store/reservaStore";
import ContadorAsistentes from "./ContadorAsistentes";
import MesasDisplay from "./MesasDisplay";
import RegionImageSlider from "./RegionImageSlider";

import { Mapa } from "../ui/Mapa";
import { useIsMobile } from "../../hooks/useIsMobile";

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
  const isMobile = useIsMobile();

  const {
    actualizarDetalleAsistentes,
    limpiarDetalleAsistentes,
    reservaZonaData,
    seleccionarZona,
    activeMesas,
    setActiveMesas,
  } = useReservaStore();

  const adultsNum = Math.max(0, Number(adults) || 0);
  const childrenNum = Math.max(0, Number(children) || 0);
  const mascotasNum = Math.max(0, Number(mascotas) || 0);
  const totalPersonas = adultsNum + childrenNum;
  const totalOcupacion = adultsNum + childrenNum + mascotasNum;

  const selectedZoneName = reservaZonaData?.selectedZoneName || "general";
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
      `Has alcanzado el máximo de ${MAX_OCUPACION_TOTAL} asistentes.`,
    );
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
    setActiveMesas(true);
  };

  return (
    <>
      <h2 className="font-parkson mb-4 !text-4xl">
        {selectedZoneName === "general"
          ? "¿Dónde quieres comer?"
          : permiteMascotas
            ? "¿Cuántos nos visitarán? ¿Vendrás con mascotas?"
            : "¿Cuántos vendrán?"}
      </h2>
      <div className="size-full flex flex-col items-center justify-center gap-8">
        <div
          className={`w-full flex max-lg:flex-col ${activeMesas ? "lg:h-82" : "lg:h-96"} gap-6 px-14 transition-all duration-300`}
        >
          <div className="flex-1 min-w-0 h-full border border-black/8 rounded-xl overflow-hidden">
            <div className="w-full h-full p-6">
              <Mapa
                handleShowZone={pushZone}
                regionActive={reservaZonaData?.selectedZoneName || ""}
                size={"w-full h-full flex"}
                sizeText={`${isMobile ? "lg" : "xl"}`}
              />
            </div>
          </div>

          <RegionImageSlider selectedZoneName={selectedZoneName} />
        </div>
        <AnimatePresence mode="wait">
          {activeMesas && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="max-w-96 min-h-0 flex max-lg:flex-col items-center justify-center gap-4"
            >
              <div className="flex-1">
                <ContadorAsistentes
                  errorAsistentes={errorAsistentes}
                  permiteMascotas={permiteMascotas}
                  adultsNum={adultsNum}
                  childrenNum={childrenNum}
                  mascotasNum={mascotasNum}
                  setAdults={setAdults}
                  setChildren={setChildren}
                  setMascotas={setMascotas}
                  syncAsistentes={syncAsistentes}
                  showMaxAsistentesError={showMaxAsistentesError}
                  MAX_OCUPACION_TOTAL={MAX_OCUPACION_TOTAL}
                  MAX_MASCOTAS={MAX_MASCOTAS}
                  totalOcupacion={totalOcupacion}
                />
              </div>
              <div className="flex-1">
                <MesasDisplay
                  selectedZoneName={selectedZoneName}
                  mesaSeleccionada={mesaSeleccionada}
                  isMobile={isMobile}
                  totalOcupacion={totalOcupacion}
                  totalPersonas={totalPersonas}
                  childrenNum={childrenNum}
                  mascotasNum={mascotasNum}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PasoCantidad;
