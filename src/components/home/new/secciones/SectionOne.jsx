
import { RedesSociales } from "../../../common/CallToAction/CallToActions";
import { Button } from "../../../ui/Button";

export const SectionOne = () => {
  return (
    <div className="size-full relative flex flex-col justify-end items-center py-14">
      <div className="md:max-w-3xl max-w-56 w-full flex flex-col md:gap-6 gap-4 text-2xl z-20">
        <div className="w-full flex md:flex-row flex-col justify-center items-center gap-4 overflow-hidden">
          <Button
            width={"full"}
            type="enlace"
            fontSize="2xl"
            href={"/carta"}
            title="Menú"
            motionProps={{
              initial: { y: 100 },
              animate: { y: 0 },
            }}
          />
          <Button
            width={"full"}
            type="enlace"
            fontSize="2xl"
            href={"/#streaming"}
            title="Entrepues a la cocina"
            motionProps={{
              initial: { y: 100 },
              animate: { y: 0 },
            }}
          />
          <Button
            width={"full"}
            type="enlace"
            href={"/descubrenos"}
            title="Recorre EntrePues"
            fontSize="2xl"
            motionProps={{
              initial: { y: 100 },
              animate: { y: 0 },
            }}
          />
        </div>

        <RedesSociales
          //isSectionVisible={isSectionVisible}
          dontLocation={false}
        />
      </div>
    </div>
  );
};
