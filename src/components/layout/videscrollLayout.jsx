import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../header/Header";
import { ReservaPopupFlow } from "../reserva/popup/ReservaPopupFlow";

const VideoScrollLayout = () => {
  const [isReservePopupOpen, setIsReservePopupOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [showHeader, setShowHeader] = useState(false);

  const openReservePopup = (regionName = "") => {
    setSelectedRegion(regionName || "");

    setIsReservePopupOpen(true);
  };

  const closeReservePopup = () => {
    setIsReservePopupOpen(false);
  };

  return (
    <>
      <Header loading={true} logo={showHeader} />
      <Outlet
        context={{
          onOpenReservePopup: openReservePopup,
          setShowHeader,
          showHeader,
        }}
      />

      <ReservaPopupFlow
        isOpen={isReservePopupOpen}
        selectedRegion={selectedRegion}
        onClose={closeReservePopup}
      />
    </>
  );
};

export default VideoScrollLayout;
