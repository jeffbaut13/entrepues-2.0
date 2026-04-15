import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { Header } from "../header/Header";
import { ReservaPopupFlow } from "../reserva/popup/ReservaPopupFlow";
import { PuntosDeReserva } from "../VideoScroll/PuntosDeReserva";
import useReservaStore from "../../store/reservaStore";

const VIDEO_SCROLL_POINTS = [
  /* Primer checkpoint */
  {
    id: "punto-01",
    region: "andina",
    mesa: 1,
    name: "mesa",
    timeShow: 4,
    timeout: 4.4,
    left: "16%",
    bottom: "28%",
  },
  {
    id: "punto-02",
    keyId: "punto-02-a",
    region: "andina",
    mesa: 4,
    name: "Mesa en la barra",
    timeShow: 4,
    timeout: 4.4,
    left: "60%",
    bottom: "46%",
  },
  /* Segundo checkpoint */
  {
    id: "punto-02",
    keyId: "punto-02-b",
    region: "andina",
    mesa: 2,
    name: "mesa",
    timeShow: 8,
    timeout: 8.4,
    left: "26%",
    bottom: "41%",
  },
  {
    id: "punto-03",
    region: "andina",
    mesa: 3,
    name: "mesa",
    timeShow: 8,
    timeout: 8.4,
    left: "16%",
    bottom: "36%",
  },
  {
    id: "punto-04",
    region: "andina",
    mesa: 4,
    name: "Mesa en la barra",
    timeShow: 8,
    timeout: 8.4,
    left: "60%",
    bottom: "46%",
  },
  /* Segundo checkpoint */
];

const VideoScrollLayout = () => {
  const [isReservePopupOpen, setIsReservePopupOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [showHeader, setShowHeader] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const setMesaAsignada = useReservaStore((state) => state.setMesaAsignada);
  const CHECKPOINT_EPSILON = 0.16;

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
    setMesaAsignada(options?.mesa ?? null);
    setIsReservePopupOpen(true);
  };

  const closeReservePopup = () => {
    setIsReservePopupOpen(false);
  };

  return (
    <>
      <Header loading={true} logo={showHeader} fullwidth />

      <Outlet
        context={{
          onOpenReservePopup: openReservePopup,
          setShowHeader,
          showHeader,
          setVideoScrollTime: setCurrentVideoTime,
        }}
      />

      <ReservaPopupFlow
        stepinvert={true}
        isOpen={isReservePopupOpen}
        selectedRegion={selectedRegion}
        onClose={closeReservePopup}
      />

      {VIDEO_SCROLL_POINTS.map((point) => (
        <AnimatePresence key={point.keyId || point.id}>
          {isPointVisible(point) && (
            <PuntosDeReserva
              key={point.keyId || point.id}
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
