import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import useReservaStore from "../../store/reservaStore";
import { useIsMobile } from "../../hooks/useIsMobile";
import { formatRegionLabel } from "../../data/puntos";

const buildPositionStyle = ({ top, right, bottom, left }) =>
  Object.fromEntries(
    Object.entries({ top, right, bottom, left }).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

export const PuntosDeReserva = ({
  region = "",
  mesa = null,
  name,
  top,
  right,
  bottom,
  left,
  zIndex = 110,
  className = "",
  iconAlt = "Abrir punto de reserva",
  isVisible = true,
  onContinueToPopup,
}) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isReopenLocked, setIsReopenLocked] = useState(false);
  const containerRef = useRef(null);
  const hoverLeaveTimeoutRef = useRef(null);
  const reopenUnlockTimeoutRef = useRef(null);

  const { seleccionarZona, setActiveMesas, setMesaAsignada } =
    useReservaStore();

  const positionStyle = useMemo(
    () => buildPositionStyle({ top, right, bottom, left }),
    [top, right, bottom, left],
  );

  const leftPercent = useMemo(() => {
    if (left === undefined || left === null) return null;

    const rawValue = typeof left === "number" ? left : parseFloat(String(left));
    return Number.isFinite(rawValue) ? rawValue : null;
  }, [left]);

  const isRightAnchored = leftPercent !== null && leftPercent > 70;
  const shouldExpand = isMobile ? isExpanded : isHovering;
  const effectiveZIndex = shouldExpand ? zIndex + 200 : zIndex;
  const regionLabel = formatRegionLabel(region);
  const textLabel = `Reserva aquí`;
  const collapsedSize = 14; // w-3.5 / h-3.5
  const expandedWidth = 220;
  const expandedHeight = 40;

  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isMobile || !isExpanded) return;

    const handleOutsideClick = (event) => {
      const container = containerRef.current;
      if (!container) return;

      if (!container.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isExpanded, isMobile]);

  useEffect(() => {
    return () => {
      if (hoverLeaveTimeoutRef.current) {
        clearTimeout(hoverLeaveTimeoutRef.current);
      }
      if (reopenUnlockTimeoutRef.current) {
        clearTimeout(reopenUnlockTimeoutRef.current);
      }
    };
  }, []);

  const handleTriggerClick = () => {
    if (isMobile && !isExpanded) {
      setIsExpanded(true);
      return;
    }

    if (!isMobile) {
      setIsHovering(true);
      return;
    }

    handleContinue();
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (isReopenLocked) return;
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
    }
    hoverLeaveTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsReopenLocked(true);
      if (reopenUnlockTimeoutRef.current) {
        clearTimeout(reopenUnlockTimeoutRef.current);
      }
      reopenUnlockTimeoutRef.current = setTimeout(() => {
        setIsReopenLocked(false);
      }, 220);
    }, 120);
  };

  const handleContinue = () => {
    if (region) {
      seleccionarZona(region);
    }

    setActiveMesas(true);
    setMesaAsignada(mesa);
    setIsExpanded(false);
    setIsHovering(false);
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }
    if (reopenUnlockTimeoutRef.current) {
      clearTimeout(reopenUnlockTimeoutRef.current);
      reopenUnlockTimeoutRef.current = null;
    }
    setIsReopenLocked(false);

    onContinueToPopup?.(region, {
      mesa,
      startStep: "cantidad",
      source: "video-point",
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ ...positionStyle, zIndex: effectiveZIndex }}
      initial={{ scale: 0, transformOrigin: "left bottom" }}
      animate={{ scale: 1, transformOrigin: "left bottom" }}
      exit={{ scale: 0, transformOrigin: "left bottom" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div
        ref={containerRef}
        className="pointer-events-auto relative w-3.5 h-3.5 overflow-visible"
      >
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 ${isRightAnchored ? "right-0" : "left-0"}`}
          animate={{ x: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            {!shouldExpand && (
              <>
                <motion.span
                  className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/45"
                  animate={{
                    scale: [1, 4.8],
                    opacity: [0, 0.45, 0],
                  }}
                  transition={{
                    duration: 1.7,
                    ease: "easeOut",
                    repeat: Infinity,
                    times: [0, 0.2, 1],
                  }}
                />
                <motion.span
                  className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/30"
                  animate={{
                    scale: [1, 4.8],
                    opacity: [0, 0.36, 0],
                  }}
                  transition={{
                    duration: 1.7,
                    ease: "easeOut",
                    repeat: Infinity,
                    delay: 0.85,
                    times: [0, 0.2, 1],
                  }}
                />
              </>
            )}

            <AnimatePresence initial={false} mode="wait">
              {shouldExpand ? (
                <motion.button
                  key="expanded"
                  type="button"
                  onClick={handleContinue}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  initial={{
                    width: collapsedSize,
                    height: collapsedSize,
                    opacity: 0.9,
                  }}
                  animate={{
                    width: expandedWidth,
                    height: expandedHeight,
                    opacity: 1,
                  }}
                  exit={{
                    width: collapsedSize,
                    height: collapsedSize,
                    opacity: 0.92,
                  }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative z-10 overflow-hidden rounded-full border border-secondary/80 bg-secondary/95 text-dark shadow-lg backdrop-blur-sm ${isRightAnchored ? "origin-right" : "origin-left"}`}
                  aria-label={`${iconAlt} ${name}${mesa ? ` mesa ${mesa}` : ""}${region ? ` en zona ${regionLabel}` : ""}`}
                >
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center font-parkson text-3xl uppercase tracking-[0.2em] whitespace-nowrap text-center leading-none"
                    initial={{ opacity: 0, x: isRightAnchored ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRightAnchored ? 10 : -10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {textLabel}
                  </motion.span>
                </motion.button>
              ) : (
                <motion.button
                  key="trigger"
                  type="button"
                  onClick={handleTriggerClick}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  initial={{ opacity: 0.95, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.95, scale: 0.94 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: collapsedSize, height: collapsedSize }}
                  className="relative z-10 rounded-full border border-secondary/80 bg-secondary/95 shadow-lg backdrop-blur-sm"
                  aria-label={iconAlt}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
