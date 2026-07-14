import { ZonePet } from "./ZonePet";
import {
  formatRegionLabel,
  MAPA_REGION_LAYOUT,
  normalizeRegionName,
} from "../../data/puntos";

export const Mapa = ({ handleShowZone, theme, regionActive, sizeText }) => {
  const fontSize = () => {
    switch (sizeText) {
      case "xs":
        return "!text-xs";
      case "sm":
        return "!text-sm";
      case "md":
        return "!text-md";
      case "base":
        return "!text-base";
      case "lg":
        return "!text-lg";
      case "xl":
        return "!text-xl";
      case "2xl":
        return "!text-2xl";
      default:
        return "";
    }
  };

  const isRegionActive = (name) =>
    normalizeRegionName(regionActive) === normalizeRegionName(name);

  const ICON_BASE_CLASS =
    "size-7 border border-secondary/40 p-0.5 rounded-lg transition-all duration-300 ease-in-out";

  const getRegionBoxClass = (name) => {
    const baseClass = "transition-all duration-300 ease-in-out";

    if (isRegionActive(name)) {
      return `bg-amber-full/40 ${baseClass}`;
    }

    return `bg-amber-full/10 hover:bg-amber-full/40 ${baseClass}`;
  };

  const getRegionLabelClass = (name) => {
    const baseClass = "text-secondary transition-all duration-300 ease-in-out";

    if (isRegionActive(name)) {
      return `opacity-100 ${baseClass}`;
    }

    return `${baseClass}`;
  };

  const getRegionIconClass = (name) => {
    if (isRegionActive(name)) {
      return `${ICON_BASE_CLASS} opacity-100`;
    }

    return `${ICON_BASE_CLASS} `;
  };

  const regions = MAPA_REGION_LAYOUT.map((region) => ({
    name: region.slug,
    label: formatRegionLabel(region.slug),
    box: region.box,
    labelPos: region.labelPos,
    col: region.col,
    icon: (iconClassName) => (
      <IconoZona
        url={region.icon?.url || "iconos/zonas/caribe.svg"}
        className={iconClassName}
      />
    ),
  }));

  const handleMapaClick = (name) => {
    if (typeof handleShowZone === "function") {
      handleShowZone(name);
    }
  };

  return (
    <div className="grid grid-cols-3 grid-rows-2 md:gap-4 gap-2">
      {regions.map((region) => {
        return (
          <button
            type="button"
            key={region.name}
            data-name={region.name}
            className={`group font-bold size-full flex items-center justify-start group cursor-pointer border-none md:py-6 py-3 md:px-4 px-2 md:rounded-3xl rounded-2xl ${getRegionBoxClass(region.name)}`}
            onClick={() => handleMapaClick(region.name)}
            aria-label={`Seleccionar zona ${region.label}`}
          >
            <div className={`flex flex-col gap-1 items-start justify-start`}>
              {region.icon(getRegionIconClass(region.name))}
              <span
                className={`pointer-events-none ${getRegionLabelClass(region.name)}`}
              >
                {region.name !== "pet-family" && (
                  <span className="md:inline-block hidden">Región</span>
                )}{" "}
                {region.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const IconoZona = ({ className, url, name }) => {
  return (
    <i className={`${className} inline-block`}>
      <img
        src={url || "/iconos/zonas/caribe.svg"}
        alt={name}
        className={`inline-block size-full object-contain`}
      />
    </i>
  );
};
