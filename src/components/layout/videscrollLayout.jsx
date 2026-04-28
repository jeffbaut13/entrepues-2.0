import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { Header } from "../header/Header";
import { ReservaPopupFlow } from "../reserva/popup/ReservaPopupFlow";
import { PuntosDeReserva } from "../VideoScroll/PuntosDeReserva";
import useReservaStore from "../../store/reservaStore";
import { VIDEO_SCROLL_POINTS_FLAT, timeToFrame } from "../../data/puntos";
import { logVideoScrollDebugTables } from "../../data/puntos.debug";

const DEBUG_VIDEO_SCROLL_TIME = true;
const getPointRenderKey = (point, index) =>
  [
    point.checkpoint,
    point.timeShow,
    point.timeout,
    point.mesa,
    point.keyId || point.id,
    index,
  ].join("-");

const VideoScrollLayout = () => {
  const [isReservePopupOpen, setIsReservePopupOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [forcedStartStep, setForcedStartStep] = useState(null);
  const [showHeader, setShowHeader] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const regionChangeHandlerRef = useRef(null);
  const setMesaAsignada = useReservaStore((state) => state.setMesaAsignada);
  const seleccionarZona = useReservaStore((state) => state.seleccionarZona);
  const CHECKPOINT_EPSILON = 0.16;
  const lastLoggedTimeRef = useRef(-1);

  const isPointVisible = (point) => {
    const start = Number(point.timeShow || 0);
    const rawTimeout = Number(point.timeout || 0);
    const end = rawTimeout > start ? rawTimeout : start + rawTimeout;

    return (
      currentVideoTime >= start - CHECKPOINT_EPSILON &&
      currentVideoTime <= end + CHECKPOINT_EPSILON
    );
  };

  const openReservePopup = (regionName = "", options = {}) => {
    setSelectedRegion(regionName || "");
    setForcedStartStep(options?.startStep || null);
    if (regionName) {
      seleccionarZona(regionName);
    }
    setMesaAsignada(options?.mesa ?? null);
    setIsReservePopupOpen(true);
  };

  const closeReservePopup = () => {
    setIsReservePopupOpen(false);
    setForcedStartStep(null);
  };

  const registerVideoRegionChangeHandler = (handler) => {
    regionChangeHandlerRef.current = handler;
  };

  const handlePopupRegionChange = (regionName = "") => {
    setSelectedRegion(regionName || "");

    if (regionName) {
      seleccionarZona(regionName);
      regionChangeHandlerRef.current?.(regionName);
    }
  };

  useEffect(() => {
    if (!DEBUG_VIDEO_SCROLL_TIME) return;

    // Evita ruido excesivo en consola sin perder precisión para calibrar puntos.
    if (Math.abs(currentVideoTime - lastLoggedTimeRef.current) < 0.08) {
      return;
    }

    lastLoggedTimeRef.current = currentVideoTime;

    const visiblePoints = VIDEO_SCROLL_POINTS_FLAT.filter((point) => {
      const start = Number(point.timeShow || 0);
      const rawTimeout = Number(point.timeout || 0);
      const end = rawTimeout > start ? rawTimeout : start + rawTimeout;

      return (
        currentVideoTime >= start - CHECKPOINT_EPSILON &&
        currentVideoTime <= end + CHECKPOINT_EPSILON
      );
    }).map((point) => point.keyId || point.id);
  }, [currentVideoTime]);

  useEffect(() => {
    if (!DEBUG_VIDEO_SCROLL_TIME) return;
    logVideoScrollDebugTables();
  }, []);

  return (
    <>
      <Header loading={true} logo={showHeader} fullwidth />

      <Outlet
        context={{
          onOpenReservePopup: openReservePopup,
          registerVideoRegionChangeHandler,
          setShowHeader,
          showHeader,
          setVideoScrollTime: setCurrentVideoTime,
        }}
      />

      <ReservaPopupFlow
        stepinvert={true}
        isOpen={isReservePopupOpen}
        selectedRegion={selectedRegion}
        forcedStartStep={forcedStartStep}
        onRegionChange={handlePopupRegionChange}
        onClose={closeReservePopup}
      />

      {VIDEO_SCROLL_POINTS_FLAT.map((point, index) => (
        <AnimatePresence key={getPointRenderKey(point, index)}>
          {isPointVisible(point) && (
            <PuntosDeReserva
              region={point.region}
              name={point.name}
              mesa={point.mesa}
              left={point.left}
              right={point.right}
              top={point.top}
              bottom={point.bottom}
              isVisible={true}
              onContinueToPopup={openReservePopup}
            />
          )}
        </AnimatePresence>
      ))}
    </>
  );
};

export default VideoScrollLayout;
