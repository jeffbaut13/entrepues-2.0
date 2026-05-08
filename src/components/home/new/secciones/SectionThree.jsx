import { Button } from "../../../ui/Button";

export const SectionThree = () => {
  return (
    <div className="hide-logo-section size-full flex justify-center items-center text-secondary">
      <div className="flex-1 hidden lg:inline-flex" />
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <span
            className={`font-amithen text-5xl`}
            role="text"
            aria-label="Subtítulo"
          >
            Recorra
          </span>
          <h2
            id="title-heading"
            className={`font-parkson md:text-[11rem] text-9xl  md:leading-[10rem]`}
          >
            Colombia
          </h2>
          <h2
            id="title-heading"
            className={`font-parkson md:text-6xl text-5xl`}
          >
            A través de sus sabores
          </h2>
        </div>
        <figure className="w-28 inline-block mt-12">
          <img
            className="w-full h-full object-contain inline-block"
            src="/iconos/360.webp"
            alt="Icono de 360"
          />
        </figure>
        <Button
          customClass="mt-12"
          fontSize="2xl"
          type="enlace"
          title={"Recorido 360º"}
          href={"/descubrenos"}
        />
      </div>
    </div>
  );
};
