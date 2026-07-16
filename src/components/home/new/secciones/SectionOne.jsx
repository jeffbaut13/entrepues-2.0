import { AnimatePresence, motion } from "framer-motion";
import { useLoaderContext } from "../../../../context/LoaderContext";
import { RedesSociales } from "../../../common/CallToAction/CallToActions";
import { Button } from "../../../ui/Button";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

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
                title={
                  <span className="flex justify-center items-center gap-3 transition-all ease-in-out duration-300">
                    <span>Recorre EntrePues</span>
                    <i className="w-6 h-6 inline-flex">
                      <img
                        src="/iconos/play-circle.svg"
                        alt="ir a Reservar"
                        className="size-full inline-block object-contain"
                      />
                    </i>
                  </span>
                }
                type="enlace"
                href={"/descubrenos"}
                fontSize="base"
                customClass="min-h-12 min-w-60!"
                motionProps={{
                  initial: { y: 100 },
                  animate: { y: 0 },
                }}
              />
              <ButtonCarta />
              <ButtonReserva onOpenReservePopup={onOpenReservePopup} />
            </div>

            {/* <RedesSociales
              //isSectionVisible={isSectionVisible}
              dontLocation={false}
            /> */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ButtonReserva = ({ onOpenReservePopup, transition = true }) => {
  return (
    <Button
      type="newAnclaActive"
      width={"full"}
      motionProps={
        transition
          ? {
              initial: { y: 100 },
              animate: { y: 0 },
            }
          : {}
      }
      title={
        <span className="flex justify-center items-center gap-3 transition-all ease-in-out duration-300">
          <span>Reservar</span>
          <i className="w-6 h-6 inline-flex">
            <img
              src="/iconos/flame.svg"
              alt="ir a Reservar"
              className="size-full inline-block object-contain "
            />
          </i>
        </span>
      }
      fontSize="base"
      customClass="min-h-12 lg:min-w-60!"
      onClick={() => onOpenReservePopup(null)}
    />
  );
};
export const ButtonCarta = ({ transition }) => {
  return (
    <Button
      width={"full"}
      type="enlace"
      href={"/carta"}
      title={
        <span className="flex justify-center items-center gap-3 transition-all ease-in-out duration-300">
          <span>Menú</span>
          <i className="w-6 h-6 inline-flex">
            <img
              src="/iconos/capas.svg"
              alt="ir a Reservar"
              className="size-full inline-block object-contain "
            />
          </i>
        </span>
      }
      fontSize="base"
      customClass="min-h-12 lg:min-w-60!"
      motionProps={
        transition
          ? {
              initial: { y: 100 },
              animate: { y: 0 },
            }
          : {}
      }
    />
  );
};
