import { formatRegionLabel, normalizeRegionName, regionToSlug } from "../../data/puntos";

export const MapaSvgCopy = ({
  handleShowZone,
  theme,
  regionActive,
  sizeText,
  size,
}) => {
  const fontSize = () => {
    switch (sizeText) {
      case "sm":
        return "!text-2xl";
      case "md":
        return "!text-3xl";
      case "lg":
        return "!text-5xl";
      default:
        return "!text-3xl";
    }
  };

  const REGION_LABELS = {
    caribe: formatRegionLabel("caribe").toUpperCase(),
    pacifica: formatRegionLabel("pacifica").toUpperCase(),
    amazonia: formatRegionLabel("amazonia").toUpperCase(),
    orinoquia: formatRegionLabel("orinoquia").toUpperCase(),
    andina: formatRegionLabel("andina").toUpperCase(),
  };

  const isRegionActive = (name) =>
    normalizeRegionName(regionActive) === normalizeRegionName(name);

  const getRegionShapeClass = (name) => {
    const baseClass = "transition-all duration-300 ease-in-out";

    if (isRegionActive(name)) {
      return `fill-secondary/20 stroke-dark opacity-100 ${baseClass}`;
    }

    return theme === "light"
      ? `fill-secondary/5 stroke-secondary/40 opacity-40 group-hover:opacity-100 ${baseClass}`
      : `fill-dark/5 stroke-dark/40 opacity-40 group-hover:opacity-100 ${baseClass}`;
  };

  const getRegionLabelClass = (name) => {
    const baseClass = "transition-all duration-300 ease-in-out";

    if (isRegionActive(name)) {
      return `fill-dark opacity-100 ${baseClass}`;
    }

    return theme === "light"
      ? `fill-secondary opacity-40 group-hover:opacity-100 ${baseClass}`
      : `fill-dark opacity-40 group-hover:opacity-100 ${baseClass}`;
  };

  const handleMapaClick = (e) => {
    const region = e.target.closest("g[data-name]");
    if (!region) return;
    const name = regionToSlug(region.dataset.name);
    if (name === "capa-1" || name === "capa-2") return;
    if (typeof handleShowZone === "function") {
      handleShowZone(name);
    }
  };

  return (
    <picture className={`${size ? size : "size-full inline-block"}`}>
      <svg
        id="uuid-fe5ee73b-e389-4a25-bee8-8cdab55967c4"
        data-name="Capa 2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 603.55 378.36"
        className={`fill-dark size-full object-contain inline-block ${
          theme === "light" ? "fill-secondary" : "fill-dark"
        }`}
        onClick={handleMapaClick}
      >
        <g id="uuid-6da69bc6-be7f-483b-b072-7902bd1a6471" data-name="Capa 1">
          <g data-name="caribe" className="group cursor-pointer">
            <rect
              x=".5"
              y="32.59"
              width="99.06"
              height="345.19"
              className={getRegionShapeClass("caribe")}
              style={{ strokeMiterlimit: 10 }}
            />
            <text
              x="50.03"
              y="205.18"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${getRegionLabelClass(
                "caribe",
              )} font-parkson ${fontSize()} transition-colors duration-300 ease-in-out`}
            >
              {REGION_LABELS.caribe}
            </text>
          </g>

          <g data-name="pacífica" className="group cursor-pointer">
            <rect
              x="99.73"
              y="32.63"
              width="156.26"
              height="85.15"
              className={getRegionShapeClass("pacífica")}
              style={{ strokeMiterlimit: 10 }}
            />
            <text
              x="177.86"
              y="75.21"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${getRegionLabelClass(
                "pacífica",
              )} font-parkson ${fontSize()} transition-colors duration-300 ease-in-out`}
            >
              {REGION_LABELS.pacifica}
            </text>
          </g>

          <g data-name="Amazonía" className="group cursor-pointer">
            <rect
              x="99.48"
              y="117.86"
              width="151.66"
              height="260"
              className={getRegionShapeClass("Amazonía")}
              style={{ strokeMiterlimit: 10 }}
            />
            <text
              x="175.31"
              y="247.86"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${getRegionLabelClass(
                "Amazonía",
              )} font-parkson ${fontSize()} transition-colors duration-300 ease-in-out`}
            >
              {REGION_LABELS.amazonia}
            </text>
          </g>

          <g data-name="orinoquía" className="group cursor-pointer">
            <rect
              x="251.05"
              y="232.73"
              width="196.94"
              height="144"
              className={getRegionShapeClass("orinoquía")}
              style={{ strokeMiterlimit: 10 }}
            />
            <text
              x="349.52"
              y="304.73"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${getRegionLabelClass(
                "orinoquía",
              )} font-parkson ${fontSize()} transition-colors duration-300 ease-in-out`}
            >
              {REGION_LABELS.orinoquia}
            </text>
          </g>

          <g data-name="andina" className="group cursor-pointer">
            <polygon
              points="411.56 15.13 411.56 117.77 390.88 117.77 390.88 231.89 411.56 231.89 428.41 231.89 603.05 231.89 603.05 15.13 411.56 15.13"
              className={getRegionShapeClass("andina")}
              style={{ strokeMiterlimit: 10 }}
            />
            <text
              x="507.3"
              y="123.51"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${getRegionLabelClass(
                "andina",
              )} font-parkson ${fontSize()} transition-colors duration-300 ease-in-out`}
            >
              {REGION_LABELS.andina}
            </text>
          </g>
        </g>
      </svg>
    </picture>
  );
};
