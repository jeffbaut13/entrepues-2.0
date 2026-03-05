import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";

export const VideoScrollLoader = ({
  visible,
  progress = 0,
  isReady,
  onStart,
  onOpenReservePopup,
}) => {
  const videoRef = useRef(null);
  const [delayedReady, setDelayedReady] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (isReady) {
      timeoutId = setTimeout(() => {
        setDelayedReady(true);
      }, 1000);
    } else {
      setDelayedReady(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isReady]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[200] bg-gradient-to-t from-black via-transparent to-black/60 text-white flex items-center justify-center"
        >
          <div className="size-full">
            <AnimatePresence mode="wait" initial={false}>
              {delayedReady ? (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="size-full flex items-end justify-center gap-12 pb-24"
                >
                  <Button
                    type="button-primary"
                    fontSize="2xl"
                    onClick={onStart}
                    title={"Explorar las regiones"}
                  />

                  <Button
                    type="button-primary"
                    fontSize="2xl"
                    onClick={() => onOpenReservePopup(null)}
                    title={"Reservar ahora"}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="size-full flex items-center justify-center flex-col bg-[#f4eee5]"
                >
                  <div className="relative size-72 mx-auto">
                    <video
                      ref={videoRef}
                      defaultMuted={true}
                      muted={true}
                      className="size-full object-cover "
                      autoPlay
                      loop
                      playsInline
                      preload="auto"
                      poster=""
                    >
                      <source src="/video/loader/loader.mp4" />
                    </video>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
