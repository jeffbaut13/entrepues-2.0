import { Button } from "../../../ui/Button";
import { IconoSeparador } from "../../../ui/IconoSeparador";

export const SectionTwo = () => {
  return (
    <div className="size-full flex justify-center items-center text-secondary">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-4">
          <span
            className={`font-amithen text-5xl mb-4`}
            role="text"
            aria-label="Subtítulo"
          >
            Aquí
          </span>
          <h2 id="title-heading" className={`font-parkson text-8xl leading-6`}>
            La tradición
          </h2>
          <h2 id="title-heading" className={`font-parkson text-[3.2rem]`}>
            se sirve en cada plato
          </h2>
        </div>
        <IconoSeparador theme="light" />
        <Button
          customClass="mt-6"
          type="enlace"
          title={"ver menú"}
          href={"/carta"}
          fontSize="2xl"
        />
      </div>

      <div className="flex-1">vacio</div>
    </div>
  );
};
