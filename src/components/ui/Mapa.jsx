export const Mapa = ({
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
    caribe: "CARIBE",
    pacifica: "PACÍFICA",
    amazonia: "AMAZONÍA",
    orinoquia: "ORINOQUÍA",
    andina: "ANDINA",
  };

  const isRegionActive = (name) => regionActive === name;

  const getRegionShapeClass = (name) => {
    const baseClass = "transition-all duration-300 ease-in-out";

    if (isRegionActive(name)) {
      return `fill-secondary stroke-secondary opacity-100 ${baseClass}`;
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
    const name = region.dataset.name;
    if (name === "Capa 1" || name === "Capa 2") return;
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
            {/* <g
              transform="translate(25 234) scale(0.3)"
              className={`${getRegionLabelClass(
                "caribe"
              )} transition-colors duration-300 ease-in-out`}
            >
              <path d="M115.98,25.89c-.67,8.91-2.95,15.69-7.78,21.52-2.99,3.6-6.71,6.09-11.11,7.61-2.33.8-4.56.78-6.93-.05-3.21-1.13-5.78-3-7.86-5.64-2.55-3.24-4.06-6.98-4.51-10.98-1.07-9.36.78-18.13,6.28-25.94,2.9-4.13,6.67-7.24,11.53-8.79,4.67-1.49,8.96-.69,12.8,2.44,4.01,3.27,6.19,7.62,7.08,12.57.51,2.85.43,5.8.52,7.25Z" />
              <path d="M31.92,21.33c.18-2.22.29-5.5,1.58-8.61,1.5-3.63,3.68-6.72,6.9-8.99,3.84-2.71,7.95-3.33,12.42-1.49,3.11,1.27,5.91,2.98,8.03,5.52,8.79,10.55,10.78,22.49,6.35,35.34-1.79,5.18-5.49,8.96-11.1,10.47-2.39.64-4.62.58-6.94-.33-5.32-2.08-9.26-5.74-12.25-10.48-3.01-4.76-5.57-12.09-5-21.42Z" />
              <path d="M144.37,66.3c-.65,6.81-3.68,14.07-9.59,19.98-3.14,3.14-6.91,5.12-11.26,6.36-5.75,1.63-11.61-1.62-14.21-5.7-2.45-3.84-3.53-8.07-3.21-12.49.52-7.23,2.86-13.89,7.55-19.55,3.57-4.31,7.95-7.24,13.46-8.83,5.6-1.61,11.17,1.46,13.85,5.29,2.5,3.57,3.78,8.33,3.41,14.94Z" />
              <path d="M.94,60.68c-.1-2.62.65-5.1,1.4-7.52,2.49-8.06,11.39-11.92,18.98-8.11,9.3,4.67,14.45,12.53,16.5,22.56.89,4.36.63,8.71-.52,13.01-.83,3.1-2.44,5.7-4.93,7.69-3.5,2.79-7.32,3.8-11.76,2.27-3.88-1.34-7.31-3.31-10.19-6.19-6.55-6.54-9.4-14.58-9.48-23.71Z" />
              <path d="M119.78,119.54c-.87-2.2-1.49-4.53-2.57-6.62-5.33-10.26-11.74-19.78-19.94-28.01-2.33-2.34-4.95-4.32-7.68-6.18-5.13-3.48-10.75-5.35-17.02-5.2-11.4.16-21.1,4.51-28.54,12.98-8.54,9.73-14.51,20.99-17.39,33.74-.53,2.33-.71,4.67-.46,7.08.62,5.96,6.83,12.8,13.88,12.36,2.55-.16,5.07-.25,7.59-.88,4.62-1.16,9-2.99,13.46-4.59,9.69-3.48,19.26-3.59,28.78.72,3.15,1.43,6.44,2.56,9.66,3.84,3.5,1.4,7.12,1.53,10.78.89,6.35-1.11,10.34-5.67,10.57-12.05.1-2.75-.1-5.48-1.12-8.09ZM92.09,98.48h0l-19.91,20.43c-1.02,1.05-2.38,1.58-3.74,1.58-1.32,0-2.63-.49-3.65-1.48l-1.84-1.79h0s-9.59-9.34-9.59-9.34c-1-.97-1.56-2.28-1.58-3.68-.02-1.4.51-2.72,1.48-3.72,2.01-2.06,5.33-2.11,7.39-.1l7.69,7.49,16.26-16.69c2.01-2.06,5.33-2.11,7.39-.1,2.06,2.01,2.11,5.33.1,7.39Z" />
              <g>
                <path d="M46.63,157.58h-1.99v5.05h1.71c1.35,0,2.3-.23,2.84-.7.55-.47.82-1.07.82-1.8s-.24-1.31-.71-1.81-1.36-.74-2.67-.74Z" />
                <path d="M32.09,146.45v35.69h79.27v-35.69H32.09ZM54.76,165.28c-1.37,1.29-3.47,1.93-6.29,1.93h-3.83v8.4h-7.03v-22.64h11.63c2.53,0,4.43.6,5.69,1.81,1.26,1.2,1.89,2.92,1.89,5.14s-.69,4.07-2.06,5.36ZM80.98,175.61h-19.09v-22.64h18.75v4.83h-11.74v3.6h10.89v4.62h-10.89v4.46h12.08v5.13ZM105.84,158.57h-7.13v17.05h-7v-17.05h-7.13v-5.59h21.26v5.59Z" />
              </g>
              <g>
                <path d="M32.7,198.3v-11.82h7.97v1.39h-6.41v3.66h5.55v1.39h-5.55v5.37h-1.56Z" />
                <path d="M42.73,198.3v-11.82h5.24c1.05,0,1.85.11,2.4.32.55.21.99.59,1.31,1.12.33.54.49,1.13.49,1.78,0,.84-.27,1.55-.81,2.12-.54.58-1.38.94-2.52,1.1.41.2.73.39.94.59.46.42.89.94,1.3,1.57l2.06,3.22h-1.97l-1.56-2.46c-.46-.71-.83-1.25-1.13-1.63-.3-.38-.56-.64-.79-.79-.23-.15-.47-.26-.71-.31-.18-.04-.47-.06-.87-.06h-1.81v5.25h-1.56ZM44.29,191.7h3.36c.71,0,1.27-.07,1.68-.22.4-.15.71-.38.92-.71.21-.33.31-.68.31-1.06,0-.56-.2-1.02-.61-1.38-.41-.36-1.05-.54-1.92-.54h-3.74v3.91Z" />
                <path d="M54.89,198.3v-11.82h1.56v11.82h-1.56Z" />
                <path d="M59.25,198.3v-11.82h8.54v1.39h-6.98v3.62h6.54v1.39h-6.54v4.02h7.25v1.39h-8.82Z" />
                <path d="M70.21,198.3v-11.82h1.6l6.21,9.28v-9.28h1.5v11.82h-1.6l-6.21-9.29v9.29h-1.5Z" />
                <path d="M82.15,198.3v-11.82h4.07c.92,0,1.62.06,2.1.17.68.16,1.25.44,1.73.85.62.53,1.09,1.2,1.4,2.02.31.82.46,1.76.46,2.81,0,.9-.1,1.69-.31,2.39-.21.69-.48,1.27-.81,1.72-.33.45-.69.81-1.08,1.07-.39.26-.86.46-1.41.59-.55.13-1.18.2-1.9.2h-4.26ZM83.71,196.91h2.52c.78,0,1.39-.07,1.83-.22.44-.15.8-.35,1.06-.61.37-.37.66-.87.87-1.5.21-.63.31-1.39.31-2.28,0-1.24-.2-2.19-.61-2.85-.41-.66-.9-1.11-1.48-1.33-.42-.16-1.09-.24-2.02-.24h-2.48v9.03Z" />
                <path d="M94,198.3v-11.82h1.56v10.42h5.82v1.39h-7.38Z" />
                <path d="M105.35,198.3v-5.01l-4.55-6.81h1.9l2.33,3.56c.43.67.83,1.33,1.2,2,.35-.62.78-1.31,1.29-2.09l2.29-3.47h1.82l-4.72,6.81v5.01h-1.56Z" />
              </g>
            </g> */}
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
