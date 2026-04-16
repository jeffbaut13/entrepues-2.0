import { ZonePet } from "./ZonePet";
import {
  formatRegionLabel,
  MAPA_REGION_LAYOUT,
  normalizeRegionName,
} from "../../data/puntos";

export const Mapa = ({
  handleShowZone,
  theme,
  regionActive,
  sizeText,
  size,
}) => {
  const MAP_WIDTH = 603.55;
  const MAP_HEIGHT = 378.36;

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

  const ICON_BASE_CLASS = "w-4 transition-all duration-300 ease-in-out";

  const getRegionBoxClass = (name) => {
    const baseClass = "transition-all duration-300 ease-in-out";

    if (isRegionActive(name)) {
      return `bg-secondary/20 border-dark opacity-100 ${baseClass}`;
    }

    return theme === "light"
      ? `bg-secondary/5 border-secondary/40 opacity-40 group-hover:opacity-100 ${baseClass}`
      : `bg-dark/5 border-dark/40 opacity-40 group-hover:opacity-100 ${baseClass}`;
  };

  const getRegionLabelClass = (name) => {
    const baseClass = "transition-all duration-300 ease-in-out";

    if (isRegionActive(name)) {
      return `text-dark opacity-100 ${baseClass}`;
    }

    return theme === "light"
      ? `text-secondary opacity-40 group-hover:opacity-100 ${baseClass}`
      : `text-dark opacity-40 group-hover:opacity-100 ${baseClass}`;
  };

  const getRegionIconClass = (name) => {
    if (isRegionActive(name)) {
      return `${ICON_BASE_CLASS} opacity-100`;
    }

    return `${ICON_BASE_CLASS} opacity-40 group-hover:opacity-100`;
  };

  const toPctX = (value) => `${(value / MAP_WIDTH) * 100}%`;
  const toPctY = (value) => `${(value / MAP_HEIGHT) * 100}%`;

  const regions = MAPA_REGION_LAYOUT.map((region) => ({
    name: region.slug,
    label: formatRegionLabel(region.slug).toUpperCase(),
    box: region.box,
    labelPos: region.labelPos,
    col: region.col,
    icon: (iconClassName) =>
      region.icon?.type === "zone-pet" ? (
        <ZonePet size={iconClassName} />
      ) : (
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
    <picture className={`${size ? size : "size-full inline-block"}`}>
      <div
        className="relative size-full flex items-center justify-center"
        style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
      >
        {regions.map((region) => {
          const regionStyle = {
            left: toPctX(region.box.x),
            top: toPctY(region.box.y),
            width: toPctX(region.box.width),
            height: toPctY(region.box.height),
          };

          return (
            <button
              type="button"
              key={region.name}
              data-name={region.name}
              className={`group size-full flex items-center justify-center group absolute cursor-pointer bg-transparent border-none p-0 m-0`}
              style={regionStyle}
              onClick={() => handleMapaClick(region.name)}
              aria-label={`Seleccionar zona ${region.label}`}
            >
              <span
                className={`absolute inset-0 border ${getRegionBoxClass(region.name)}`}
                aria-hidden="true"
              />

              <div
                className={`flex ${region.col ? "flex-col" : "flex-row gap-1"} items-center justify-center`}
              >
                {region.icon(getRegionIconClass(region.name))}
                <span
                  className={`pointer-events-none font-parkson ${fontSize()} ${getRegionLabelClass(region.name)}`}
                >
                  {region.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </picture>
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
