import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Button } from "../ui/Button";
import regionesFotos from "../../data/regionesFotos";

const RegionImageSlider = ({ selectedZoneName }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const gridScrollRef = useRef(null);
  const savedScrollTopRef = useRef(0);

  const normalizeRegionKey = (value = "") =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  const normalizedZone = normalizeRegionKey(selectedZoneName);

  const normalizedRegionesFotos = Object.fromEntries(
    Object.entries(regionesFotos).map(([key, value]) => [
      normalizeRegionKey(key),
      value,
    ]),
  );

  const regionAliases = {
    "ZONA PET": "CARIBE",
  };

  const resolvedZone = regionAliases[normalizedZone] || normalizedZone;
  const regionImages = normalizedRegionesFotos[resolvedZone] || [];
  const isGeneralZone = normalizedZone === "GENERAL";

  const zoneSlug = (selectedZoneName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const slides = regionImages.map((src, index) => ({
    src,
    alt: `${selectedZoneName || "Región"} ${index}`,
  }));
  const selectedSlide = slides.find((slide) => slide.src === selectedImageSrc);
  const fastSpring = {
    type: "spring",
    stiffness: 420,
    damping: 34,
    mass: 0.32,
  };

  useEffect(() => {
    setSelectedImageSrc(null);
    savedScrollTopRef.current = 0;
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 0;
    }
  }, [zoneSlug, selectedZoneName]);

  const handleSelectImage = (src) => {
    if (selectedImageSrc === src) {
      setSelectedImageSrc(null);
      requestAnimationFrame(() => {
        if (gridScrollRef.current) {
          gridScrollRef.current.scrollTop = savedScrollTopRef.current;
        }
      });
      return;
    }

    if (gridScrollRef.current) {
      savedScrollTopRef.current = gridScrollRef.current.scrollTop;
    }
    setSelectedImageSrc(src);
    requestAnimationFrame(() => {
      if (gridScrollRef.current) {
        gridScrollRef.current.scrollTop = 0;
      }
    });
  };

  const handleBackToGrid = () => {
    setSelectedImageSrc(null);
    requestAnimationFrame(() => {
      if (gridScrollRef.current) {
        gridScrollRef.current.scrollTop = savedScrollTopRef.current;
      }
    });
  };

  return (
    <>
      <div className="flex-1 min-w-0 h-full min-h-0 overflow-hidden relative bg-dark/10 rounded-xl">
        <Swiper
          modules={[Autoplay, Pagination]}
          loop={true}
          slidesPerView={1}
          centeredSlides={true}
          spaceBetween={8}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 2800,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={650}
          className="absolute inset-0 w-full h-full [&_.swiper-pagination]:!bottom-2 [&_.swiper-pagination-bullet]:!h-2.5 [&_.swiper-pagination-bullet]:!w-2.5 [&_.swiper-pagination-bullet]:!bg-secondary/70 [&_.swiper-pagination-bullet]:!opacity-100 [&_.swiper-pagination-bullet-active]:!bg-secondary [&_.swiper-pagination-bullet]:ring-2 [&_.swiper-pagination-bullet]:ring-dark/10"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.src} className="w-full h-full">
              <button
                type="button"
                onClick={() => {
                  setIsGalleryOpen(true);
                }}
                className="w-full h-full"
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {isGalleryOpen &&
        createPortal(
          <div className="fixed inset-0 z-[119999] bg-black/80 backdrop-blur-md p-4 md:p-6">
            <button
              type="button"
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-5 right-5 z-[10000] text-white bg-black/40 hover:bg-black/60 transition rounded-full p-2"
              aria-label="Cerrar galeria"
            >
              <X size={24} />
            </button>

            <div className="w-full max-w-4xl mx-auto h-full max-h-[95vh] overflow-hidden rounded-2xl  ">
              <div className="sticky top-0 z-20 px-5 py-4">
                <h3 className="text-secondary !text-4xl font-parkson text-center">
                  {isGeneralZone ? "Elige una zona" : `Región ${selectedZoneName}`}
                </h3>
              </div>
              {selectedImageSrc && (
                <div className="w-full flex justify-center">
                  <Button
                    type="button-secondary"
                    Icon={X}
                    onClick={handleBackToGrid}
                    customClass="absolute bottom-12 text-white flex-col items-center justify-center z-100"
                    title={"cerrar"}
                    fontSize={"md"}
                  >
                    Ver todas las fotos
                  </Button>
                </div>
              )}
              <div
                ref={gridScrollRef}
                className={`h-[calc(95vh-5.5rem)] py-4 md:py-5 no-scrollbar ${
                  selectedImageSrc ? "overflow-hidden" : "overflow-y-auto"
                }`}
              >
                {slides.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-secondary/80">
                    {isGeneralZone
                      ? "Elige una zona para ver sus fotos."
                      : "No hay fotos disponibles para esta zona."}
                  </div>
                ) : (
                  <LayoutGroup id={`zone-gallery-${zoneSlug || "default"}`}>
                    <div className="relative h-full">
                      <motion.div
                        layout
                        animate={{ opacity: selectedImageSrc ? 0 : 1 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[18rem] ${
                          selectedImageSrc ? "pointer-events-none" : ""
                        }`}
                      >
                        {slides.map((slide, index) => {
                          const tilePattern = [
                            "md:row-span-2",
                            "md:row-span-1",
                            "md:row-span-1",
                            "md:col-span-2 md:row-span-2",
                            "md:row-span-2",
                            "md:row-span-1",
                          ];

                          return (
                            <motion.button
                              layout
                              type="button"
                              onClick={() => handleSelectImage(slide.src)}
                              key={`gallery-grid-${slide.src}`}
                              initial={{ opacity: 0.9, scale: 0.99 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.1, ease: "easeOut" }}
                              className={`relative overflow-hidden rounded-xl bg-secondary/10 ${tilePattern[index % tilePattern.length]}`}
                            >
                              <motion.img
                                layoutId={`gallery-image-${slide.src}`}
                                src={slide.src}
                                alt={slide.alt}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                transition={fastSpring}
                              />
                            </motion.button>
                          );
                        })}
                      </motion.div>

                      <AnimatePresence initial={false}>
                        {selectedImageSrc && selectedSlide ? (
                          <motion.div
                            key="selected-image"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                            className="absolute inset-0 z-10 flex items-center justify-center"
                          >
                            <motion.img
                              layoutId={`gallery-image-${selectedSlide.src}`}
                              src={selectedSlide.src}
                              alt={selectedSlide.alt}
                              className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl border border-secondary/30 bg-black"
                              transition={fastSpring}
                              onClick={handleBackToGrid}
                            />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </LayoutGroup>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default RegionImageSlider;
