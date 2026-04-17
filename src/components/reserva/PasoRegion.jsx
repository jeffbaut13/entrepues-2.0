import { useEffect } from "react";

import useReservaStore from "../../store/reservaStore";
import RegionImageSlider from "./RegionImageSlider";
import { Mapa } from "../ui/Mapa";
import { useIsMobile } from "../../hooks/useIsMobile";

const PasoRegion = ({ onRegionChange }) => {
  const isMobile = useIsMobile();

  const { reservaZonaData, seleccionarZona, setActiveMesas } = useReservaStore();

  const selectedZoneName = reservaZonaData?.selectedZoneName || "general";
  const selectedZoneId = reservaZonaData?.selectedZoneId || null;

  const pushZone = (name) => {
    seleccionarZona(name);
    setActiveMesas(true);
    onRegionChange?.(name);
  };

  useEffect(() => {
    if (selectedZoneId) {
      setActiveMesas(true);
    }
  }, [selectedZoneId, setActiveMesas]);

  return (
    <>
      <h2 className="font-parkson mb-4 !text-4xl">Donde quieres comer?</h2>
      <div className="size-full flex flex-col items-center justify-center gap-8">
        <div className="w-full flex max-lg:flex-col-reverse lg:h-96 gap-6 md:px-14 px-2 transition-all duration-300">
          <div className="flex-1 min-w-0 h-full md:border border-black/8 rounded-xl overflow-hidden">
            <div className="w-full h-full md:p-6">
              <Mapa
                handleShowZone={pushZone}
                regionActive={reservaZonaData?.selectedZoneName || ""}
                size={"w-full h-full flex"}
                sizeText={`${isMobile ? "sm" : "xl"}`}
              />
            </div>
          </div>

          <RegionImageSlider selectedZoneName={selectedZoneName} />
        </div>
      </div>
    </>
  );
};

export default PasoRegion;


