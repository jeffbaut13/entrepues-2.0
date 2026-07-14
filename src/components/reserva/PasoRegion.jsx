import { useEffect } from "react";

import useReservaStore from "../../store/reservaStore";
import RegionImageSlider from "./RegionImageSlider";
import { Mapa } from "../ui/Mapa";
import { useIsMobile } from "../../hooks/useIsMobile";

const PasoRegion = ({ onRegionChange }) => {
  const isMobile = useIsMobile();

  const { reservaZonaData, seleccionarZona, setActiveMesas } =
    useReservaStore();

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
    <div className="size-full flex flex-col items-center justify-center gap-8">
      <div className="w-full h-full flex max-lg:flex-col items-center gap-6 transition-all duration-300 py-[1px]">
        <div className="flex-1 w-full overflow-hidden flex flex-col items-start justify-center md:gap-6 gap-2">
          <h2 className="text-5xl font-parkson">Elija una región</h2>
          <p>¿Dónde quiere comer?</p>
          <div className="w-full h-full">
            <Mapa
              handleShowZone={pushZone}
              regionActive={reservaZonaData?.selectedZoneName || ""}
              sizeText={"base"}
            />
          </div>
        </div>

        <RegionImageSlider selectedZoneName={selectedZoneName} />
      </div>
    </div>
  );
};

export default PasoRegion;
