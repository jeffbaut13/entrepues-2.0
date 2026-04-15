import { ZonePet } from "./ZonePet";

export const Mapa = ({
  handleShowZone,
  theme,
  regionActive,
  sizeText,
  size,
}) => {
  const MAP_WIDTH = 603.55;
  const MAP_HEIGHT = 378.36;

  const normalizeRegionName = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

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

  const REGION_LABELS = {
    zonaPet: "ZONA PET",
    caribe: "CARIBE",
    pacifica: "PACÍFICA",
    amazonia: "AMAZONÍA",
    orinoquia: "ORINOQUÍA",
    andina: "ANDINA",
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

  const regions = [
    {
      name: "zona-pet",
      label: REGION_LABELS.zonaPet,
      box: { x: 0, y: 32.59, width: 65.53, height: 345.19 },
      labelPos: { x: 20.5, y: 205.18 },
      icon: (iconClassName) => <ZonePet size={iconClassName} />,
      col: true,
    },
    {
      name: "caribe",
      label: REGION_LABELS.caribe,
      box: { x: 65.53, y: 32.59, width: 85.53, height: 345.19 },
      labelPos: { x: 70.03, y: 205.18 },
      icon: (iconClassName) => (
        <IconoZona
          url={"iconos/zonas/caribe.svg"}
          className={iconClassName}
        />
      ),
      col: false,
    },
    {
      name: "pacífica",
      label: REGION_LABELS.pacifica,
      box: { x: 151.06, y: 32.63, width: 156.26, height: 85.15 },
      labelPos: { x: 177.86, y: 75.21 },
      icon: (iconClassName) => (
        <IconoZona
          url={"iconos/zonas/pacifica.svg"}
          className={iconClassName}
        />
      ),
      col: false,
    },
    {
      name: "Amazonía",
      label: REGION_LABELS.amazonia,
      box: { x: 151.06, y: 117.86, width: 151.66, height: 260 },
      labelPos: { x: 175.31, y: 247.86 },
      icon: (iconClassName) => (
        <IconoZona
          url={"iconos/zonas/amazonia.svg"}
          className={iconClassName}
        />
      ),
      col: false,
    },
    {
      name: "orinoquía",
      label: REGION_LABELS.orinoquia,
      box: { x: 301, y: 232.73, width: 196.94, height: 144 },
      labelPos: { x: 349.52, y: 304.73 },
      icon: (iconClassName) => (
        <IconoZona
          url={"iconos/zonas/orinoquia.svg"}
          className={iconClassName}
        />
      ),
      col: false,
    },
    {
      name: "andina",
      label: REGION_LABELS.andina,
      box: { x: 390.88, y: 15.13, width: 212.17, height: 216.76 },
      labelPos: { x: 507.3, y: 123.51 },
      icon: (iconClassName) => (
        <IconoZona
          url={"iconos/zonas/andina.svg"}
          className={iconClassName}
        />
      ),
      col: false,
    },
  ];

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
