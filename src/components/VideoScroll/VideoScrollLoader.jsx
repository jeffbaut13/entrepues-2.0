import { AnimatePresence, motion } from "framer-motion";
import { useRef, useEffect } from "react";

export const VideoScrollLoader = ({ visible }) => {
  const videoRef = useRef(null);

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
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] bg-[#f4eee5] flex items-center justify-center"
        >
          <div className="relative size-72">
            <video
              ref={videoRef}
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="size-full object-cover"
            >
              <source src="/video/loader/loader.mp4" />
            </video>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
