import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "../../ui/Button";
import { redes } from "../../../constants/redesSociales";
import { useObserverVisibility } from "../../../hooks/useObserverVisibility";
import { useLoaderContext } from "../../../context/LoaderContext";

export const CallToActions = ({ site = "home" }) => {
  const isSectionVisible = useObserverVisibility(".hide-logo-section");
  const { loadingComplete } = useLoaderContext();

  // Los delays se calculan desde el final del loader (2s) + delay adicional
  // Los delays originales se mantienen sumando 2s
  const getAnimationDelay = (originalDelay) => {
    return loadingComplete ? originalDelay : 2 + originalDelay;
  };

  return (
    <div className="fixed bottom-0 size-full z-[51] flex flex-col items-center justify-end pb-6">
      <div className="md:max-w-md max-w-sm w-full flex flex-col md:gap-6 gap-4 text-2xl z-20">
        <div className="w-full flex md:flex-row flex-col justify-center items-center gap-4 overflow-hidden">
          <Button
            width="full"
            customClass={`order-2 ${
              site == "home" ? "md:order-1" : "md:order-3"
            }`}
            type="enlace"
            fontSize="2xl"
            href={"/carta"}
            title="Menú"
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
            width="full"
            customClass="order-1  md:order-2 !bg-secondary !text-brown !border !border-brown"
            type="enlace"
            href={"/descubrenos"}
            title="Reservar"
            fontSize="2xl"
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
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: getAnimationDelay(1.5),
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
