import { AnimatePresence, motion } from "framer-motion";

const easing = [0.22, 1, 0.36, 1];

export const Loader = () => {
  return (
    <motion.div
      key="overlay"
      className="fixed top-0 left w-full h-dvh bg-black z-[50] flex items-center justify-center"
      initial={{ y: "0%", opacity: 1 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ duration: 1, ease: easing }}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-12 h-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};
