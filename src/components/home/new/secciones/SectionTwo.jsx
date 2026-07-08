import { Button } from "../../../ui/Button";

export const SectionTwo = () => {
  return (
    <div className="size-full flex justify-center items-center text-secondary">
      <div className="absolute bg-black/50 size-full top-0 left-0 z-1" />
      <div className="flex-1 flex flex-col justify-center items-center required z-10">
        <div className="flex flex-col justify-center items-center gap-4">
          <span
            className={`font-parkson text-4xl mb-4`}
            role="text"
            aria-label="Subtítulo"
          >
            Plato de la semana
          </span>
          <h2 id="title-heading" className={`font-parkson text-8xl leading-6`}>
            Bandeja paisa
          </h2>
          <h2 id="title-heading" className={`mt-14 max-w-2xl`}>
            Aquí hemos ido juntando lo mejor de cada rincón de Colombia, pero
            sin perder lo nuestro, <br className="hidden lg:block" /> lo bien
            paisa, lo de antes.
          </h2>
        </div>

        <Button
          customClass="mt-6"
          type="enlace"
          title={"ver menú"}
          href={"/carta"}
          fontSize="2xl"
        />
      </div>
    </div>
  );
};
