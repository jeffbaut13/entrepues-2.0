import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import scrollDownAnimation from "../../data/Scroll-Icon.json";

const hexToNormalizedRgb = (hexColor) => {
  const normalized = (hexColor || "#FFFFFF").replace("#", "").trim();
  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const safeHex = /^[0-9A-Fa-f]{6}$/.test(fullHex) ? fullHex : "FFFFFF";

  const red = parseInt(safeHex.slice(0, 2), 16) / 255;
  const green = parseInt(safeHex.slice(2, 4), 16) / 255;
  const blue = parseInt(safeHex.slice(4, 6), 16) / 255;

  return [red, green, blue];
};

const recolorAnimation = (node, rgb) => {
  if (!node || typeof node !== "object") return;

  if (
    (node.ty === "fl" || node.ty === "st") &&
    node.c &&
    Array.isArray(node.c.k) &&
    node.c.k.length >= 4 &&
    node.c.a === 0
  ) {
    node.c.k = [rgb[0], rgb[1], rgb[2], node.c.k[3]];
  }

  Object.values(node).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => recolorAnimation(item, rgb));
      return;
    }

    recolorAnimation(value, rgb);
  });
};

export const ScrollDownLottie = ({
  color = "#FFFFFF",
  className = "",
  size = 56,
  showScrollHint,
  fixed = true,
  position = "sm",
}) => {
  const animationData = useMemo(() => {
    const cloned = JSON.parse(JSON.stringify(scrollDownAnimation));
    recolorAnimation(cloned, hexToNormalizedRgb(color));
    return cloned;
  }, [color]);

  const positionBottom = () => {
    switch (position) {
      case "sm":
        return "bottom-6";
      case "md":
        return "bottom-12";
      case "lg":
        return "bottom-68";
      default:
        return "bottom-6";
    }
  };

  return (
    <AnimatePresence>
      {showScrollHint && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`pointer-events-none ${
            fixed ? "fixed" : "absolute"
          } ${positionBottom()} left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center ${
            className ? className : ""
          }`}
        >
          <div
            style={{
              width: size,
              height: size,
              minWidth: size,
              minHeight: size,
            }}
            className="animate-mouse-float"
          >
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <span className="text-white text-center font-parkson lg:!text-3xl !text-2xl">
            Desliza
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
