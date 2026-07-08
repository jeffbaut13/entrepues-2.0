import { AnimatePresence, motion } from "framer-motion";
import { useLoaderContext } from "../../../../context/LoaderContext";
import { RedesSociales } from "../../../common/CallToAction/CallToActions";
import { Button } from "../../../ui/Button";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { useOutletContext } from "react-router-dom";

export const SectionOne = () => {
  const { loadingComplete } = useLoaderContext();
  const { onOpenReservePopup } = useOutletContext();
  const isMobile = useIsMobile();
  return (
    <AnimatePresence mode="wait">
      {loadingComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="size-full relative flex flex-col justify-end items-center py-14"
        >
          <div className="md:max-w-3xl max-w-56 w-full flex flex-col md:gap-6 gap-4 text-2xl z-20">
            <div className="w-full flex md:flex-row flex-col justify-center items-center gap-4 overflow-hidden">
              <Button
                width={"full"}
                type="enlace"
                fontSize={isMobile ? "xl" : "2xl"}
                href={"/#streaming"}
                title="Entrepues a la cocina"
                motionProps={{
                  initial: { y: 100 },
                  animate: { y: 0 },
                }}
              />

              <Button
                type="button-primary"
                width={"full"}
                fontSize={isMobile ? "sm" : "3xl"}
                motionProps={{
                  initial: { y: 100 },
                  animate: { y: 0 },
                }}
                title={
                  <>
                    <i className="w-6 h-6 animate-pulse inline-flex">
                      <img
                        src="/iconos/reservar.svg"
                        alt="ir a Reservar"
                        className="size-full inline-block object-contain"
                      />
                    </i>
                    <span className="text-secondary">Reservar</span>
                  </>
                }
                customClass={"!text-dark justify-self-end"}
                onClick={() => onOpenReservePopup(null)}
              />
              <Button
                width={"full"}
                type="enlace"
                href={"/descubrenos"}
                title="Recorre EntrePues"
                fontSize={isMobile ? "xl" : "2xl"}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
