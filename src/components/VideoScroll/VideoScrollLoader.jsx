import { AnimatePresence, motion } from "framer-motion";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";

export const VideoScrollLoader = ({
  visible,
  progress = 0,
  isReady,
  onStart,
}) => {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const radius = 96;
  const strokeWidth = 16;
  const size = 256;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[200] bg-black/90 text-white flex items-center justify-center px-6"
        >
          <div className="w-full max-w-md text-center">
            {safeProgress < 100 && (
              <p className="text-sm tracking-[0.2em] uppercase opacity-75 mb-6">
                Cargando
              </p>
            )}

            <div className="relative w-64 h-64 mx-auto">
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute inset-0 -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={normalizedRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={normalizedRadius}
                  fill="none"
                  stroke="rgba(255,255,255,1)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-300 ease-out"
                />
              </svg>

              {isReady && (
                <>
                  <motion.span
                    className="absolute inset-[62px] rounded-full border border-white/45 pointer-events-none"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.15, 0.7] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <motion.span
                    className="absolute inset-[64px] rounded-full border border-white pointer-events-none"
                    animate={{
                      scale: [1, 1.12, 1],
                      opacity: [0.45, 0.08, 0.45],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 0.35,
                    }}
                  />
                </>
              )}

              <button
                type="button"
                onClick={isReady ? onStart : undefined}
                disabled={!isReady}
                className={`absolute inset-[56px] rounded-full border border-white/10 flex items-center justify-center text-center transition ${
                  isReady
                    ? "cursor-pointer hover:bg-white/10"
                    : "cursor-default"
                }`}
              >
                <span className="font-parkson !text-4xl leading-none">
                  {isReady ? "Iniciar" : `${safeProgress}%`}
                </span>
              </button>
            </div>

            {isReady ? (
              <div className="mt-8 space-y-4">
                <p className="text-base sm:text-lg opacity-90">
                 Copy que indique que debe dar click para poder iniciar la experiencia, o que puede empezar a explorar
                </p>
              </div>
            ) : (
              <p className="mt-8 text-sm opacity-70">
                Preparando experiencia...
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
