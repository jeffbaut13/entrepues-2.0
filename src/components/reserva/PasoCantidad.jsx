import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useReservaStore from "../../store/reservaStore";
import ContadorAsistentes from "./ContadorAsistentes";
import MesasDisplay from "./MesasDisplay";
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
}) => {
  const [errorAsistentes, setErrorAsistentes] = useState("");
  const isMobile = useIsMobile();

  const {
    actualizarDetalleAsistentes,
    limpiarDetalleAsistentes,
    reservaZonaData,
  } = useReservaStore();

  const adultsNum = Math.max(0, Number(adults) || 0);
  const childrenNum = Math.max(0, Number(children) || 0);
  const mascotasNum = Math.max(0, Number(mascotas) || 0);
  const totalPersonas = adultsNum + childrenNum;
  const totalOcupacion = adultsNum + childrenNum + mascotasNum;

  const selectedZoneName = reservaZonaData?.selectedZoneName || "general";
  const mesaSeleccionada = reservaZonaData?.mesaSeleccionada;
  const permiteMascotas = Boolean(reservaZonaData?.permiteMascotas);

  const syncAsistentes = (nextAdults, nextChildren, nextMascotas) => {
    const total =
      Number(nextAdults || 0) +
      Number(nextChildren || 0) +
      Number(nextMascotas || 0);
    if (total > 0) {
      actualizarDetalleAsistentes({
        adults: nextAdults,
        children: nextChildren,
        mascotas: nextMascotas,
      });
      return;
    }
    limpiarDetalleAsistentes();
  };

  const showMaxAsistentesError = () => {
    setErrorAsistentes(
      `Has alcanzado el maximo de ${MAX_OCUPACION_TOTAL} asistentes.`,
    );
  };

  useEffect(() => {
    syncAsistentes(adultsNum, childrenNum, mascotasNum);
  }, [adultsNum, childrenNum, mascotasNum]);

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
  const title = "¿Cuántos Son?";
  return (
    <>
      <h2 className="font-parkson mb-4 !text-4xl lg:hidden">
        {/* {permiteMascotas
          ? "¿CUÁNTAS PERSONAS Y PELUDITOS NOS VISITARÁN?"
          : "¿CUÁNTOS VENDRÁN?"} */}
        {title}
      </h2>

      <div className="w-full flex flex-col justify-center lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full min-h-0 flex max-lg:flex-col-reverse items-center justify-center"
        >
          <div className="md:w-80 w-full">
            <h2 className="text-start font-parkson !text-4xl max-lg:hidden lg:mb-12">
              {title}
            </h2>
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
      </div>
    </>
  );
};

export default PasoCantidad;
