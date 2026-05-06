import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { SectionOne } from "./secciones/SectionOne";
import { SectionTwo } from "./secciones/SectionTwo";
import { SectionThree } from "./secciones/SectionThree";
import { SectionFour } from "./secciones/SectionFour";
import { Footer } from "./secciones/Footer";

const sections = [
  {
    id: "s1",
    title: "Caja 1",
    img: "/imagenes/background-home.jpg",
    scaleEffect: true,
    component: <SectionOne />,
  },
  {
    id: "s2",
    title: "Caja 2",
    img: "",
    scaleEffect: false,
    component: <SectionTwo />,
  },
  {
    id: "s3",
    title: "Caja 3",
    img: "",
    scaleEffect: false,
    component: <SectionThree />,
  },
  {
    id: "s4",
    title: "Caja 4",
    img: "",
    scaleEffect: false,
    component: <SectionFour />,
  },
  {
    id: "footer",
    title: "Footer",
    img: "",
    scaleEffect: false,
    component: <Footer />,
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
  const layerRefs = useRef([]);
  const touchStartY = useRef(0);
  const isLockedRef = useRef(false);
  const unlockTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const maxIndex = useMemo(() => sections.length - 1, []);

  useEffect(() => {
    layerRefs.current.forEach((layer, index) => {
      if (!layer) return;
      gsap.set(layer, { yPercent: index === 0 ? 0 : 100 });
    });

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

  const goToSection = (nextIndex) => {
    if (isLockedRef.current || nextIndex === activeIndex) return;
    if (nextIndex < 0 || nextIndex > maxIndex) return;

    const currentLayer = layerRefs.current[activeIndex];
    const nextLayer = layerRefs.current[nextIndex];
    const movingForward = nextIndex > activeIndex;

    if (!currentLayer || !nextLayer) return;

    lockForTwoSeconds();

    if (movingForward) {
      gsap.set(nextLayer, { yPercent: 100, zIndex: nextIndex + 10 });
      gsap.to(nextLayer, {
        yPercent: 0,
        duration: 0.85,
        ease: "power3.out",
      });
    } else {
      gsap.to(currentLayer, {
        yPercent: 100,
        duration: 0.85,
        ease: "power3.inOut",
      });
      gsap.set(nextLayer, { zIndex: nextIndex + 10 });
    }

    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    const onWheel = (event) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 8) return;

      if (event.deltaY > 0) goToSection(activeIndex + 1);
      if (event.deltaY < 0) goToSection(activeIndex - 1);
    };

    const onTouchStart = (event) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event) => {
      event.preventDefault();
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = touchStartY.current - currentY;
      if (Math.abs(delta) < 22) return;

      if (delta > 0) goToSection(activeIndex + 1);
      if (delta < 0) goToSection(activeIndex - 1);
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
  }, [activeIndex]);

  return (
    <section className="relative h-dvh w-full overflow-hidden">
      {sections.map((section, index) => {
        const isActive = index === activeIndex;

        return (
          <section
            key={section.id}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
            className={`w-full absolute inset-0 flex items-center justify-center bg-dark`}
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
                    <figure className="size-full absolute top-0 left-0 z-1">
                      <motion.img
                        initial={{ scale: 1 }}
                        animate={{ scale: section.scaleEffect ? 5 : 1 }}
                        transition={{
                          duration: 200,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="size-full object-cover"
                        src={section.img}
                        alt="Home page"
                      />
                    </figure>
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
