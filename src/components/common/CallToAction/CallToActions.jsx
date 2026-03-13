import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "../../ui/Button";
import { redes } from "../../../constants/redesSociales";
import { useObserverVisibility } from "../../../hooks/useObserverVisibility";
import { useLoaderContext } from "../../../context/LoaderContext";
import { useIsMobile } from "../../../hooks/useIsMobile";

export const CallToActions = ({ onOpenReservePopup }) => {
  const isSectionVisible = useObserverVisibility(".hide-logo-section");
  const { loadingComplete } = useLoaderContext();
  const isMobile = useIsMobile();

  const getAnimationDelay = (originalDelay) => {
    return loadingComplete ? originalDelay : 2 + originalDelay;
  };

  const visibleMobile = isMobile && isSectionVisible;
  return (
    <div
      className={`fixed bottom-0 size-full z-[51] flex flex-col items-center justify-end pb-6 ${visibleMobile ? "hidden" : ""}`}
    >
      <div className="md:max-w-2xl max-w-sm w-full flex flex-col md:gap-6 gap-4 text-2xl z-20">
        <div className="w-full flex md:flex-row flex-col justify-center items-center gap-4 overflow-hidden">
          <Button
            width={isMobile ? "medio" : "full"}
            type="enlace"
            fontSize="2xl"
            href={"/carta"}
            title="Menú"
            motionProps={{
              initial: { y: 100 },
              animate: { y: 0 },
              transition: {
                delay: getAnimationDelay(0.8),
                ease: "easeInOut",
                duration: 1,
              },
            }}
          />
          <Button
            width={isMobile ? "medio" : "full"}
            type="button-primary"
            title="Reservar"
            onClick={()=>onOpenReservePopup(null)}
            fontSize="2xl"
            motionProps={{
              initial: { y: 100 },
              animate: { y: 0 },
              transition: {
                delay: getAnimationDelay(1.2),
                ease: "easeInOut",
                duration: 1,
              },
            }}
          />
          <Button
            width={isMobile ? "medio" : "full"}
            type="enlace"
            href={"/descubrenos"}
            title="Recorre EntrePues"
            fontSize="2xl"
            motionProps={{
              initial: { y: 100 },
              animate: { y: 0 },
              transition: {
                delay: getAnimationDelay(1.6),
                ease: "easeInOut",
                duration: 1,
              },
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: getAnimationDelay(2.0),
            ease: "easeInOut",
            duration: 1,
          }}
          className="flex justify-center items-center gap-12 max-md:mt-4"
        >
          <div
            className={`flex items-center justify-center gap-8 ${
              isSectionVisible ? "text-brown" : "text-secondary"
            } `}
          >
            {redes.map((red, inx) => {
              const IconComponent = red.icon;
              return (
                <Button
                  type="just-icon"
                  target="_blank"
                  href={red.url}
                  key={inx}
                  props={{ "aria-label": red.label }}
                  Icon={IconComponent}
                  iconSize="small"
                />
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
