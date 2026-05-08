import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { SectionOne } from "./secciones/SectionOne";
import { SectionTwo } from "./secciones/SectionTwo";
import { SectionThree } from "./secciones/SectionThree";
import { SectionFour } from "./secciones/SectionFour";
import { SiteFooter } from "../../footer/SiteFooter";
import { useIsMobile } from "../../../hooks/useIsMobile";

const sections = [
  {
    id: "s1",
    title: "Caja 1",
    img: "/imagenes/home/seccion_uno/background_home.webp",
    imgMobile: "/imagenes/home/seccion_uno/background_homeM.webp",
    scaleEffect: true,
    component: <SectionOne />,
  },
  {
    id: "menu",
    title: "Caja 2",
    img: "/imagenes/home/menu/background_menu.webp",
    imgMobile: "/imagenes/home/menu/background_menuM.webp",
    scaleEffect: false,
    component: <SectionTwo />,
  },
  {
    id: "recorrido",
    title: "Caja 3",
    img: "/imagenes/home/recorrido/background_recorrido.webp",
    imgMobile: "/imagenes/home/recorrido/background_recorridoM.webp",
    scaleEffect: false,
    component: <SectionThree />,
  },
  {
    id: "streaming",
    title: "Caja 4",
    img: "/imagenes/home/streaming/background_Stream.webp",
    imgMobile: "/imagenes/home/streaming/background_StreamM.webp",
    scaleEffect: false,
    component: <SectionFour />,
  },
  {
    id: "footer",
    title: "Footer",
    img: "",
    imgMobile: "",
    scaleEffect: false,
    component: <SiteFooter />,
  },
];

const contentVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -14, transition: { duration: 0.25, ease: "easeIn" } },
};

export const HomeComponentNew = () => {
  const location = useLocation();
  const layerRefs = useRef([]);
  const hasInitializedRef = useRef(false);
  const touchStartY = useRef(0);
  const isLockedRef = useRef(false);
  const unlockTimerRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();

  const maxIndex = useMemo(() => sections.length - 1, []);

  const getIndexFromHash = (rawHash) => {
    const normalizedHash = (rawHash || "").replace(/^#\/?/, "");
    if (!normalizedHash) return -1;
    return sections.findIndex((section) => section.id === normalizedHash);
  };

  useEffect(() => {
    const initialIndexFromHash = getIndexFromHash(location.hash);
    const initialIndex =
      initialIndexFromHash >= 0 && initialIndexFromHash <= maxIndex
        ? initialIndexFromHash
        : 0;

    activeIndexRef.current = initialIndex;
    setActiveIndex(initialIndex);

    layerRefs.current.forEach((layer, index) => {
      if (!layer) return;
      gsap.set(layer, { yPercent: index === initialIndex ? 0 : 100 });
    });

    hasInitializedRef.current = true;

    return () => {
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

  const lockForTwoSeconds = () => {
    isLockedRef.current = true;
    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => {
      isLockedRef.current = false;
    }, 1000);
  };

  const goToSection = (nextIndex, options = {}) => {
    const { force = false, syncHash = true } = options;
    const currentIndex = activeIndexRef.current;

    if ((!force && isLockedRef.current) || nextIndex === currentIndex) return;
    if (nextIndex < 0 || nextIndex > maxIndex) return;

    const currentLayer = layerRefs.current[currentIndex];
    const nextLayer = layerRefs.current[nextIndex];
    const movingForward = nextIndex > currentIndex;

    if (!currentLayer || !nextLayer) return;

    gsap.killTweensOf(layerRefs.current.filter(Boolean));

    if (force) {
      isLockedRef.current = false;
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    } else {
      lockForTwoSeconds();
    }

    if (movingForward) {
      gsap.set(nextLayer, { yPercent: 100, zIndex: nextIndex + 10 });
      gsap.to(nextLayer, {
        yPercent: 0,
        duration: 0.85,
        ease: "power3.out",
      });
    } else {
      gsap.set(nextLayer, { yPercent: 0, zIndex: nextIndex + 10 });
      gsap.to(currentLayer, {
        yPercent: 100,
        duration: 0.85,
        ease: "power3.inOut",
      });
    }

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);

    if (syncHash) {
      const nextSectionId = sections[nextIndex]?.id;
      if (nextSectionId) {
        window.history.replaceState(null, "", `/#${nextSectionId}`);
      }
    }
  };

  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const rawHash = location.hash || "";
    if (!rawHash) return;
    const targetIndex = getIndexFromHash(rawHash);
    if (targetIndex === -1 || targetIndex === activeIndexRef.current) return;

    layerRefs.current.forEach((layer, index) => {
      if (!layer) return;
      gsap.set(layer, { yPercent: index === targetIndex ? 0 : 100 });
    });
    goToSection(targetIndex, { force: true, syncHash: false });
  }, [location.hash]);

  useEffect(() => {
    const onNavigateSection = (event) => {
      const sectionId = event?.detail?.sectionId;
      if (!sectionId) return;

      const targetIndex = sections.findIndex(
        (section) => section.id === sectionId,
      );
      if (targetIndex === -1 || targetIndex === activeIndexRef.current) return;

      layerRefs.current.forEach((layer, index) => {
        if (!layer) return;
        gsap.set(layer, { yPercent: index === targetIndex ? 0 : 100 });
      });
      goToSection(targetIndex, { force: true, syncHash: false });
    };

    window.addEventListener("home:navigate-section", onNavigateSection);

    return () => {
      window.removeEventListener("home:navigate-section", onNavigateSection);
    };
  }, []);

  useEffect(() => {
    const onWheel = (event) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 8) return;

      if (event.deltaY > 0) goToSection(activeIndexRef.current + 1);
      if (event.deltaY < 0) goToSection(activeIndexRef.current - 1);
    };

    const onTouchStart = (event) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event) => {
      event.preventDefault();
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = touchStartY.current - currentY;
      if (Math.abs(delta) < 22) return;

      if (delta > 0) goToSection(activeIndexRef.current + 1);
      if (delta < 0) goToSection(activeIndexRef.current - 1);
      touchStartY.current = currentY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <section className="relative h-dvh w-full overflow-hidden">
      {sections.map((section, index) => {
        const isActive = index === activeIndex;

        return (
          <section
            id={section.id}
            key={section.id}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
            className={`w-full absolute inset-0 flex items-center justify-center bg-black`}
            style={{ zIndex: index + 1 }}
          >
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  key={`${section.id}-content`}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={contentVariants}
                  className="size-full text-center"
                >
                  <div className="size-full flex justify-center items-center">
                    {section.img == "" ? (
                      <div />
                    ) : (
                      <figure className="size-full absolute top-0 left-0 z-1">
                        <motion.img
                          initial={{ scale: 1 }}
                          animate={{ scale: section.scaleEffect ? 3 : 1 }}
                          transition={{
                            duration: 200,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="size-full object-cover"
                          src={isMobile ? section.imgMobile : section.img}
                          alt="Home page"
                        />
                      </figure>
                    )}
                    <div className="size-full relative z-10 flex justify-center items-center">
                      {section.component}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </section>
  );
};
