import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStreamingStore } from "../../../../store/streamingStore";
import { useOutletContext } from "react-router-dom";
import { Button } from "../../../ui/Button";
import { streamingData as allData } from "../../../../data/streaming";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";

export const SectionFour = () => {
  return (
    <div className="size-full relative flex flex-col justify-end items-center">
      <InteractiveHover />
    </div>
  );
};

const InteractiveHover = () => {
  const {
    streamingData: { videoUrl, title, description, id },
    setStreamingById,
    currentStreamingId,
    arrayStreaming,
  } = useStreamingStore();

  console.log(allData);

  const [isMobile, setIsMobile] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const pendingIdRef = useRef(null);
  const titleTimerRef = useRef(null);
  const descriptionTimerRef = useRef(null);
  const swapTimerRef = useRef(null);
  const videoRef = useRef(null);
  const { onOpenHistoriaVideoPopup } = useOutletContext();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      if (descriptionTimerRef.current)
        clearTimeout(descriptionTimerRef.current);
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, []);

  const revealTextSequence = () => {
    if (isMobile) {
      setShowTitle(true);
      setShowDescription(true);
      return;
    }

    setShowTitle(false);
    setShowDescription(false);
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    if (descriptionTimerRef.current) clearTimeout(descriptionTimerRef.current);

    titleTimerRef.current = setTimeout(() => {
      setShowTitle(true);
    }, 100);

    descriptionTimerRef.current = setTimeout(() => {
      setShowDescription(true);
    }, 2000);
  };

  const changeStreaming = (nextId) => {
    if (
      !nextId ||
      nextId === currentStreamingId ||
      pendingIdRef.current === nextId
    ) {
      return;
    }

    pendingIdRef.current = nextId;
    setOverlayVisible(true);
    if (!isMobile) {
      setShowTitle(false);
      setShowDescription(false);
    }

    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    if (isMobile) {
      setStreamingById(nextId);
      return;
    }

    swapTimerRef.current = setTimeout(() => {
      setStreamingById(nextId);
    }, 500);
  };

  const handleVideoReady = () => {
    if (pendingIdRef.current !== id) return;
    pendingIdRef.current = null;

    setOverlayVisible(false);
    revealTextSequence();
    videoRef.current?.play?.().catch(() => {});
  };

  return (
    <div className="hide-logo-section size-full flex items-center justify-center text-lg">
      <div className="size-full absolute top-0 left-0 z-1">
        <div className="overlay bg-black/60!" />
        <video
          key={id}
          ref={videoRef}
          autoPlay
          playsInline
          muted
          loop
          className="size-full object-cover inline-block"
          onLoadedData={handleVideoReady}
        >
          <source
            src="/video/historia/historia.mp4"
            //src={videoUrl}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      <motion.div
        className="absolute inset-0 z-[5] bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: overlayVisible ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />
      <div className="size-full md:px-24 px-6 relative z-10 flex flex-col justify-center items-center">
        <div className="md:flex-2/3 flex-1 w-full flex justify-center md:items-end gap-4">
          <div className="flex-1 flex flex-col justify-end md:items-start items-center">
            <figure className="lg:w-56 w-32 h-auto inline-block mb-3">
              <img
                className="size-full object-contain inline-block"
                src="/iconos/logo-subtitle.svg"
                alt="Logo EntrePues"
              />
            </figure>

            <AnimatePresence mode="wait">
              {showDescription && (
                <motion.div
                  initial={
                    isMobile
                      ? { opacity: 0, height: "auto" }
                      : { opacity: 0, height: 0 }
                  }
                  animate={
                    isMobile
                      ? { opacity: 1, height: "auto" }
                      : { opacity: 1, height: "auto" }
                  }
                  exit={
                    isMobile
                      ? { opacity: 0, height: "auto" }
                      : { opacity: 0, height: 0 }
                  }
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-full md:text-start text-center "
                >
                  <motion.p
                    key={`description-${id}`}
                    initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={isMobile ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="text-secondary my-3 max-w-2xl"
                  >
                    {description}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              type="button-white"
              title={
                <>
                  <span>Reproducir</span>
                  <i className="w-8 h-8 flex justify-center items-center p-2 pl-2.5 bg-white rounded-full">
                    <img
                      src="/iconos/play.svg"
                      alt="play icon"
                      className="size-full inline-block object-contain invert"
                    />
                  </i>
                </>
              }
              fontSize="2xl"
              onClick={onOpenHistoriaVideoPopup}
              customClass="mt-3"
            />
          </div>
          <div className="flex-1 hidden lg:inline-flex" />
        </div>

        <div className="flex md:flex-2/5 flex-1 w-full justify-center items-center">
          {isMobile ? (
            <MobileStreamingSlider
              currentStreamingId={currentStreamingId}
              changeStreaming={changeStreaming}
            />
          ) : (
            <div className="w-full flex justify-between items-center gap-12">
              {allData.map((item) => (
                <motion.button
                  onMouseEnter={() => {
                    if (!isMobile) changeStreaming(item.id);
                  }}
                  onClick={onOpenHistoriaVideoPopup}
                  key={item.id}
                  className={`relative w-103 h-61 overflow-hidden rounded-2xl inline-block ${currentStreamingId === item.id ? "scale-110 opacity-100" : "hover:scale-110 opacity-40 hover:opacity-80"} transition-all duration-300  `}
                >
                  <div className="bg-black size-full absolute top-0 left-0 opacity-40 z-1" />
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="object-cover size-full absolute top-0 left-0 z-0"
                  />
                  <div className="absolute bottom-0 left-0 p-2 z-10 text-secondary text-start">
                    <h2 className="font-parkson text-4xl">{item.title}</h2>
                    <p className="text-sm">{item.shortDescription}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MobileStreamingSlider = ({ currentStreamingId, changeStreaming }) => {
  const swiperRef = useRef(null);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const targetIndex = allData.findIndex(
      (item) => item.id === currentStreamingId,
    );
    if (targetIndex >= 0 && targetIndex !== swiper.realIndex) {
      swiper.slideToLoop(targetIndex);
    }
  }, [currentStreamingId]);

  const handleCenteredSlide = (swiper) => {
    const centerItem = allData[swiper.realIndex];
    if (centerItem) changeStreaming(centerItem.id);
  };

  return (
    <div className="w-full">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          handleCenteredSlide(swiper);
        }}
        onSlideChangeTransitionEnd={handleCenteredSlide}
        slidesPerView={1.5}
        centeredSlides
        spaceBetween={16}
        loop
        className="w-full pb-10"
      >
        {allData.map((item) => (
          <SwiperSlide key={item.id}>
            <button
              type="button"
              onClick={() => {
                changeStreaming(item.id);
                swiperRef.current?.slideToLoop(
                  allData.findIndex((slide) => slide.id === item.id),
                );
              }}
              className={`relative w-full h-61 overflow-hidden rounded-2xl inline-block ${currentStreamingId === item.id ? "opacity-100" : "opacity-40"} transition-opacity duration-300`}
            >
              <div className="bg-black size-full absolute top-0 left-0 opacity-40 z-1" />
              <img
                src={item.thumbnail}
                alt={item.title}
                className="object-cover size-full absolute top-0 left-0 z-0"
              />
              <div className="absolute bottom-0 left-0 p-2 z-10 text-secondary text-start">
                <h2 className="font-parkson text-4xl">{item.title}</h2>
                <p className="text-sm">{item.shortDescription}</p>
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="mt-2 w-full flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => swiperRef.current?.slidePrev()}
          className="size-12 inline-flex items-center justify-center text-secondary"
        >
          <ChevronLeft className="size-10" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => swiperRef.current?.slideNext()}
          className="size-12 inline-flex items-center justify-center text-secondary"
        >
          <ChevronRight className="size-10" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
