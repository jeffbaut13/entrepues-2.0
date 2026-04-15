import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import useReservaStore from "../../store/reservaStore";
import ContadorAsistentes from "../reserva/ContadorAsistentes";
import MesasDisplay from "../reserva/MesasDisplay";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Button } from "../ui/Button";

const MAX_OCUPACION_TOTAL = 12;
const MAX_MASCOTAS = 4;

const buildPositionStyle = ({ top, right, bottom, left }) =>
  Object.fromEntries(
    Object.entries({ top, right, bottom, left }).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

export const PuntosDeReserva = ({
  region = "",
  mesa = null,
  name,
  top,
  right,
  bottom,
  left,
  zIndex = 110,
  className = "",
  iconSrc = "/iconos/flag.svg",
  iconAlt = "Abrir punto de reserva",
  isVisible = true,
  onContinueToPopup,
}) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorAsistentes, setErrorAsistentes] = useState("");

  const {
    reservaData,
    reservaZonaData,
    actualizarDetalleAsistentes,
    limpiarDetalleAsistentes,
    seleccionarZona,
    updateReservaData,
    setActiveMesas,
    setPasoReserva,
    setMesaAsignada,
  } = useReservaStore();

  const adultsNum = Math.max(0, Number(reservaData?.adults) || 0);
  const childrenNum = Math.max(0, Number(reservaData?.children) || 0);
  const mascotasNum = Math.max(0, Number(reservaData?.mascotas) || 0);
  const totalPersonas = adultsNum + childrenNum;
  const totalOcupacion = adultsNum + childrenNum + mascotasNum;

  const mesaSeleccionada = reservaZonaData?.mesaSeleccionada;
  const permiteMascotas = Boolean(reservaZonaData?.permiteMascotas);
  const mesaCompactSize = "md";
  const mesasPlanLength = mesaSeleccionada?.mesasPlan?.length || 0;
  const mesaPreviewWidth = isMobile
    ? mesasPlanLength >= 2
      ? 220
      : 160
    : mesasPlanLength >= 2
      ? 260
      : 208;
  const canContinue =
    Boolean(reservaZonaData?.selectedZoneId) &&
    Boolean(mesaSeleccionada) &&
    adultsNum > 0;

  const positionStyle = useMemo(
    () => buildPositionStyle({ top, right, bottom, left }),
    [top, right, bottom, left],
  );

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
      `Has alcanzado el maximo de ${MAX_OCUPACION_TOTAL} asistentes.`,
    );
  };

  useEffect(() => {
    syncAsistentes(adultsNum, childrenNum);
  }, [adultsNum, childrenNum]);

  useEffect(() => {
    if (totalOcupacion < MAX_OCUPACION_TOTAL && errorAsistentes) {
      setErrorAsistentes("");
    }
  }, [errorAsistentes, totalOcupacion]);

  useEffect(() => {
    if (!permiteMascotas && mascotasNum > 0) {
      updateReservaData({ mascotas: 0 });
    }
  }, [permiteMascotas, mascotasNum, updateReservaData]);

  useEffect(() => {
    if (!isExpanded) return;
    if (!region) return;

    seleccionarZona(region);
    setActiveMesas(true);
    setMesaAsignada(mesa);
  }, [
    isExpanded,
    mesa,
    region,
    seleccionarZona,
    setActiveMesas,
    setMesaAsignada,
  ]);

  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible]);

  const updateReservaField = (field, value) => {
    updateReservaData({ [field]: value });
  };

  const setAdults = (value) => updateReservaField("adults", value);
  const setChildren = (value) => updateReservaField("children", value);
  const setMascotas = (value) => updateReservaField("mascotas", value);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (isMobile) return;
    setIsExpanded(false);
  };

  const handleTriggerClick = () => {
    if (!isMobile) {
      handleExpand();
      return;
    }

    setIsExpanded((prev) => !prev);
  };

  const handleContinue = () => {
    if (!canContinue) return;

    setPasoReserva("visitantes", { completado: true, habilitado: true });
    setPasoReserva("fecha", { habilitado: true });
    setActiveMesas(true);
    setMesaAsignada(mesa);
    onContinueToPopup?.(region, { mesa });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ ...positionStyle, zIndex }}
      onHoverStart={isMobile ? undefined : handleExpand}
      onHoverEnd={isMobile ? undefined : handleCollapse}
      initial={{ scale: 0, transformOrigin: "left bottom" }}
      animate={{ scale: 1, transformOrigin: "left bottom" }}
      exit={{ scale: 0, transformOrigin: "left bottom" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="pointer-events-auto">
        <AnimatePresence initial={false} mode="wait">
          {!isExpanded ? (
            <motion.button
              key="trigger"
              type="button"
              onClick={handleTriggerClick}
              initial={{ scale: 0.78, y: 6 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.84, y: 4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left bottom" }}
              className="size-10 p-2 flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md"
              aria-label={iconAlt}
            >
              <img className="size-full object-contain" src={iconSrc} alt="" />
            </motion.button>
          ) : (
            <motion.div
              key="panel"
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left bottom" }}
              className={`rounded-[2rem] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md p-4 overflow-hidden ${
                isMobile ? "w-fit max-w-[92vw]" : "w-fit"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className={`${isMobile ? "max-w-[calc(92vw-2rem)]" : "max-w-none"}`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="min-w-0">
                    {mesa && (
                      <p className="font-parkson text-3xl mt-1">
                        {name} #{mesa} {region ? `en zona ${region}` : ""}
                      </p>
                    )}
                  </div>

                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="shrink-0 rounded-full p-2 text-dark/70"
                      aria-label="Cerrar punto de reserva"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <motion.div
                  layout
                  className="mt-4 inline-flex items-center gap-4"
                >
                  <div className="min-w-[14rem]">
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

                  <motion.div
                    layout
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: mesaPreviewWidth,
                      minWidth: mesaPreviewWidth,
                    }}
                  >
                    <MesasDisplay
                      selectedZoneName={
                        reservaZonaData?.selectedZoneName || "general"
                      }
                      mesaSeleccionada={mesaSeleccionada}
                      isMobile={isMobile}
                      sizeOverride={mesaCompactSize}
                      totalOcupacion={totalOcupacion}
                      totalPersonas={totalPersonas}
                      childrenNum={childrenNum}
                      mascotasNum={mascotasNum}
                    />
                  </motion.div>
                </motion.div>
                <div className="w-full flex items-center justify-center mt-6">
                  <Button
                    type="button-dark"
                    disabled={!canContinue}
                    width="ajustado"
                    onClick={handleContinue}
                    title={"Continuar"}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
