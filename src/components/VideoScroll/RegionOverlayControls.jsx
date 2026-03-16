import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Title } from "../ui/Title";

export const RegionOverlayControls = ({
  activeRegion,
  activeTextIndex,
  regiones,
  zoneActive,
  onSelectRegion,
  onOpenReservePopup,
}) => {
  
  
  return (
    <AnimatePresence>
      {activeRegion > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay absolute"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute md:bottom-6 bottom-6 w-full flex flex-col items-center gap-6 "
          >
            <div className="w-full grid grid-cols-5 md:max-w-2xl max-w-sm relative">
              {regiones
                .filter((text) => text.title !== "Bienvenido")
                .map((text, index) => (
                  <Button
                    key={index}
                    type="button-thirty"
                    customClass={`relative hover:opacity-80 ${
                      activeTextIndex ===
                      regiones.findIndex((region) => region.title === text.title)
                        ? "opacity-100"
                        : "opacity-40"
                    } text-white`}
                    title={
                      <>
                        <Title
                          headContent={"Región"}
                          content={text.title}
                          theme="light"
                          headingLevel="h3"
                          className={`md:scale-75 transition-all duration-500 ${
                            activeTextIndex ===
                            regiones.findIndex(
                              (region) => region.title === text.title
                            )
                              ? "-translate-y-4"
                              : ""
                          }`}
                        />
                        <span className="w-2 h-2 inline-block bg-secondary rounded-full absolute left-1/2 -translate-x-1/2 -bottom-1" />
                      </>
                    }
                    onClick={() => onSelectRegion(text.title)}
                  />
                ))}
              <span className="w-full h-px rounded-full bg-white absolute bottom-0" />
            </div>

            <Button
              title={"Reservar en esta región"}
              width="min"
              type="button-primary"
              fontSize="2xl"
              onClick={() => onOpenReservePopup?.(zoneActive)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
