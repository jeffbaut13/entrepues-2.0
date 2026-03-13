import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Button } from "../ui/Button";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";
import { VideoScrollLoader } from "./VideoScrollLoader";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Title } from "../ui/Title";
import { Volume2, VolumeX } from "lucide-react";

const AUDIO_URL = "/audios/audio.mp3";

const REGIONES = [
  { start: 0, title: "Bienvenido" },
  { start: 2, title: "andina" },
  { start: 14, title: "orinoquía" },
  { start: 35, title: "pacífica" },
  { start: 40, title: "amazonía" },
  { start: 46, title: "caribe" },
];

const SCROLL_AREA = 6000;

export const VideoScrollComponent = () => {
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const { onOpenReservePopup, setShowHeader } = useOutletContext();

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const lastProgressRef = useRef(0);

  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationRef = useRef(null);

  const isMobile = useIsMobile();
  const VIDEO_URL = `/video/recorrido/recorrido${isMobile ? "M" : ""}.mp4`;

  const [videoReady, setVideoReady] = useState(false);
  const [hasStartedExperience, setHasStartedExperience] = useState(false);
  const [activeRegion, setActiveRegion] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const zoneActive = REGIONES[activeTextIndex]?.title || REGIONES[0].title;

  const updateRegion = (time) => {
    const OFFSET = 0.15;

    for (let i = REGIONES.length - 1; i >= 0; i--) {
      if (time >= REGIONES[i].start - OFFSET) {
        setActiveRegion(i);
        setActiveTextIndex(i);

        return;
      }
    }
  };

  const SMOOTHING = 0.09;
  const MAX_SPEED = 0.03;

  const animationLoop = () => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration || 60;

    let diff = targetProgressRef.current - progressRef.current;

    let step = diff * SMOOTHING;

    if (step > MAX_SPEED) step = MAX_SPEED;
    if (step < -MAX_SPEED) step = -MAX_SPEED;

    progressRef.current += step;

    const time = progressRef.current * duration;
    setShowHeader(time > 1.5);
    setShowScrollHint(time < 3);

    video.currentTime = time;

    updateRegion(time);

    animationRef.current = requestAnimationFrame(animationLoop);
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const maxScroll = SCROLL_AREA - window.innerHeight;

    let nextProgress = scrollTop / maxScroll;

    // limitar salto máximo por evento de scroll
    const MAX_SCROLL_DELTA = 0.05;

    const diff = nextProgress - lastProgressRef.current;

    if (Math.abs(diff) > MAX_SCROLL_DELTA) {
      nextProgress =
        lastProgressRef.current + Math.sign(diff) * MAX_SCROLL_DELTA;
    }

    lastProgressRef.current = nextProgress;

    targetProgressRef.current = nextProgress;
  };

  const handleRegionSelect = (regionName) => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    const regionIndex = REGIONES.findIndex(
      (region) => region.title === regionName,
    );

    if (regionIndex < 0) return;

    const region = REGIONES[regionIndex];

    const duration = video.duration || 60;

    const progress = region.start / duration;

    targetProgressRef.current = progress;

    const maxScroll = SCROLL_AREA - window.innerHeight;

    container.scrollTo({
      top: progress * maxScroll,
      behavior: "smooth",
    });
  };

  const tryPlayAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setIsAudioPlaying(true);
    } catch {
      setIsAudioPlaying(false);
    }
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  const startExperience = async () => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    setHasStartedExperience(true);

    requestAnimationFrame(animationLoop);

    await tryPlayAudio();

    const startSecond = 2;
    const duration = video.duration || 60;

    const progress = startSecond / duration;

    targetProgressRef.current = progress;

    const maxScroll = SCROLL_AREA - window.innerHeight;

    container.scrollTo({
      top: progress * maxScroll,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleReady = () => {
      video.pause();
      setVideoReady(true);
    };

    // escuchar varios eventos porque mobile es inconsistente
    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("canplaythrough", handleReady);

    // 🔴 fuerza carga cuando vienes de refresh
    video.load();

    return () => {
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("canplaythrough", handleReady);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />

      <VideoScrollLoader
        visible={!hasStartedExperience}
        progress={videoReady ? 100 : 0}
        isReady={true}
        onStart={startExperience}
        onOpenReservePopup={onOpenReservePopup}
      />

      <div
        ref={containerRef}
        className="w-full h-dvh overflow-y-auto overflow-x-hidden"
      >
        <div className="sticky top-0 h-dvh w-full">
          <video
            ref={videoRef}
            src={VIDEO_URL}
            className="w-full h-full object-cover"
            preload="auto"
            playsInline
            muted
            webkit-playsinline="true"
            disablePictureInPicture
          />

          <AnimatePresence>
            {activeRegion > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overlay absolute"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute md:bottom-6 bottom-6 w-full flex flex-col items-center gap-6 "
                >
                  <div className="w-full grid grid-cols-5 md:max-w-2xl max-w-sm relative">
                    {REGIONES.filter((text) => text.title !== "Bienvenido").map(
                      (text, index) => (
                        <Button
                          key={index}
                          type="button-thirty"
                          customClass={`relative hover:opacity-80 ${
                            activeTextIndex ===
                            REGIONES.findIndex(
                              (region) => region.title === text.title,
                            )
                              ? "opacity-100"
                              : "opacity-40"
                          } text-white`}
                          title={
                            <>
                              <Title
                                headContent={"Región"}
                                content={text.title}
                                theme="light"
                                headingLevel="h3"
                                className={`md:scale-75 transition-all duration-500 ${
                                  activeTextIndex ===
                                  REGIONES.findIndex(
                                    (region) => region.title === text.title,
                                  )
                                    ? "-translate-y-4"
                                    : ""
                                }`}
                              />
                              <span className="w-2 h-2 inline-block bg-secondary rounded-full absolute left-1/2 -translate-x-1/2 -bottom-1" />
                            </>
                          }
                          onClick={() => handleRegionSelect(text.title)}
                        />
                      ),
                    )}
                    <span className="w-full h-px rounded-full bg-white absolute bottom-0" />
                  </div>

                  <Button
                    title={"Reservar en esta región"}
                    width="min"
                    type="button-primary"
                    fontSize="2xl"
                    onClick={() => onOpenReservePopup?.(zoneActive)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: `${SCROLL_AREA}px` }} />

        {hasStartedExperience && (
          <ScrollDownLottie
            color="#FFFFFF"
            size={60}
            showScrollHint={showScrollHint}
            position="lg"
          />
        )}
      </div>

      {hasStartedExperience && (
        <button
          onClick={toggleAudio}
          className="fixed bottom-6 right-6 z-[210] rounded-full bg-black/70 hover:bg-black/85 text-white p-3"
        >
          {isAudioPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      )}
    </>
  );
};
