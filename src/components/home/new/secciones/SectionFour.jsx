import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStreamingStore } from "../../../../store/streamingStore";
import { useOutletContext } from "react-router-dom";
import { Button } from "../../../ui/Button";
import { streamingData as allData } from "../../../../data/streaming";

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
    setShowTitle(false);
    setShowDescription(false);

    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
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
      <div className="size-full max-w-7xl relative z-10 flex flex-col justify-center items-center gap-4">
        <div className="flex-1 w-full flex justify-center items-end gap-4">
          <div className="flex-1 flex flex-col justify-center items-start">
            <figure className="w-56 h-auto inline-block mb-3">
              <img
                className="size-full object-contain inline-block"
                src="/iconos/logo-subtitle.svg"
                alt="Logo EntrePues"
              />
            </figure>

            <AnimatePresence mode="wait">
              {showDescription && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-full text-start"
                >
                  <motion.p
                    key={`description-${id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="text-secondary my-3"
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
          <div className="flex-1" />
        </div>

        <div className="flex flex-1 w-full justify-center items-center">
          <div className="w-full flex justify-between items-center gap-12">
            {allData.map((item) => (
              <motion.button
                onMouseEnter={() => {
                  if (!isMobile) changeStreaming(item.id);
                }}
                onTouchStart={() => {
                  if (isMobile) changeStreaming(item.id);
                }}
                onClick={() => {
                  onOpenHistoriaVideoPopup();
                  if (isMobile) changeStreaming(item.id);
                }}
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
        </div>
      </div>
    </div>
  );
};
