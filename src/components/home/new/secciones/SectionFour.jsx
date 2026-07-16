import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStreamingStore } from "../../../../store/streamingStore";
import { useOutletContext } from "react-router-dom";
import { Button } from "../../../ui/Button";
import { streamingData as allData } from "../../../../data/streaming";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import { Play } from "../../../header/Header";

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
    <div className="hide-logo-section size-full flex items-center justify-center text-lg overflow-x-hidden">
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
          aplicalros aca
          <source
            src="/video/historia/historia.mp4"
            // TODO Cuando se tengan los videos se llenan en el json para
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
      <div className="size-full relative z-10 flex flex-col justify-center items-center">
        <div className="flex-1 w-full grid lg:grid-cols-2 grid-cols-1 pb-24">
          <div className="col-start-2 flex-1 flex flex-col justify-end md:items-start items-center">
            <h2 className="font-parkson text-5xl text-secondary">
              {title}
            </h2>

            <AnimatePresence mode="wait">
              {showDescription && (
                <motion.div
                  initial={
                    isMobile
                      ? { opacity: 0, height: "auto" }
                      : { opacity: 0, height: 0 }
                  }
                  animate={{ opacity: 1, height: "auto" }}
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
                    className="text-secondary my-3 lg:max-w-2xl max-lg:px-4"
                  >
                    {description}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              type="newAnclaActive"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              title={
                <span className="flex justify-center items-center gap-3 transition-all ease-in-out duration-300">
                  <span>Reproducir</span>
                  <span className="size-6 [&_.icon-svg]:stroke-brown">
                    <Play />
                  </span>
                </span>
              }
              fontSize="base"
              customClass="min-h-12 min-w-60! mt-4"
              onClick={onOpenHistoriaVideoPopup}
            />
          </div>
        </div>

        <div className="w-full z-20 pb-8">
          {isMobile ? (
            <MobileStreamingSlider
              currentStreamingId={currentStreamingId}
              changeStreaming={changeStreaming}
            />
          ) : (
            <DesktopStreamingSlider
              currentStreamingId={currentStreamingId}
              changeStreaming={changeStreaming}
              onOpenHistoriaVideoPopup={onOpenHistoriaVideoPopup}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const DesktopStreamingSlider = ({
  currentStreamingId,
  changeStreaming,
  onOpenHistoriaVideoPopup,
}) => {
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

  const handleSlideChange = (swiper) => {
    const centerItem = allData[swiper.realIndex];
    if (centerItem) changeStreaming(centerItem.id);
  };

  return (
    <div className="w-full">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChangeTransitionEnd={handleSlideChange}
        slidesPerView="auto"
        spaceBetween={20}
        loop={false}
        style={{ marginLeft: "max(80px, calc((100vw - 1280px) / 2 + 60px))" }}
        className="!overflow-visible"
      >
        {allData.map((item) => (
          <SwiperSlide key={item.id} className="!w-[320px]">
            <motion.button
              onMouseEnter={() => changeStreaming(item.id)}
              onClick={onOpenHistoriaVideoPopup}
              className={`relative w-full h-[200px] overflow-hidden rounded-2xl inline-block cursor-pointer ${
                currentStreamingId === item.id
                  ? "scale-105 opacity-100"
                  : "opacity-50 hover:opacity-80 hover:scale-105"
              } transition-all duration-300`}
            >
              <div className="bg-black size-full absolute top-0 left-0 opacity-40 z-1" />
              <img
                src={item.thumbnail}
                alt={item.title}
                className="object-cover size-full absolute top-0 left-0 z-0"
              />
              <div className="absolute bottom-3 left-3 z-10 text-secondary text-start">
                <h2 className="font-parkson text-3xl leading-tight">
                  {item.title}
                </h2>
                <p className="text-sm mt-1">{item.shortDescription}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <img src="/iconos/play.svg" alt="play" className="w-5 h-5" />
                </div>
              </div>
            </motion.button>
          </SwiperSlide>
        ))}
      </Swiper>
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
