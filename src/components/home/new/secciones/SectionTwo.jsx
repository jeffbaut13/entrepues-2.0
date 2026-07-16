import { useOutletContext } from "react-router-dom";
import { ButtonCarta, ButtonReserva } from "./SectionOne";

export const SectionTwo = () => {
  const { onOpenReservePopup } = useOutletContext();
  return (
    <div className="size-full flex justify-center items-center text-secondary">
      <div className="absolute bg-black/50 size-full top-0 left-0 z-1" />
      <div className="z-2 relative size-full max-w-7xl mx-auto grid lg:grid-cols-2 grid-cols-1">
        <div className="flex flex-col justify-center gap-6 lg:items-end items-center lg:col-start-2 lg:justify-self-end">
          <span role="text" aria-label="Subtítulo">
            Plato de la semana
          </span>
          <h2 id="title-heading" className="font-parkson text-5xl">
            Bandeja paisa
          </h2>
          <h2 id="title-heading" className={`max-w-2xl md:text-end`}>
            Aquí hemos juntado lo mejor de cada rincón de Colombia{" "}
            <br /> pero sin perder lo nuestro.
          </h2>
          <div className="flex gap-2">
            <ButtonCarta transition={false} />
            <ButtonReserva
              onOpenReservePopup={onOpenReservePopup}
              transition={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
