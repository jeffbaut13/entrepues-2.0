import React, { useRef, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";
import { VideoScrollLoader } from "./VideoScrollLoader";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Volume2, VolumeX } from "lucide-react";
import { RegionOverlayControls } from "./RegionOverlayControls";

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
  const { onOpenReservePopup, setShowHeader } = useOutletContext();

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);

  const animationRef = useRef(null);

  const isMobile = useIsMobile();
  const VIDEO_URL = `/video/recorrido/recorrido${isMobile ? "M" : ""}.mp4`;

  const [videoReady, setVideoReady] = useState(false);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [activeRegion, setActiveRegion] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
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

  /* =========================
     RAF LOOP (suaviza el video)
  ========================== */

  const animationLoop = () => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration || 60;

    // interpolación simple
    progressRef.current +=
      (targetProgressRef.current - progressRef.current) * 0.12;

    const time = progressRef.current * duration;

    video.currentTime = time;

    setShowHeader(time > 1.5);
    setShowScrollHint(time < 3);

    updateRegion(time);

    animationRef.current = requestAnimationFrame(animationLoop);
  };

  /* =========================
     SCROLL → target progress
  ========================== */

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const maxScroll = SCROLL_AREA - window.innerHeight;

    targetProgressRef.current = container.scrollTop / maxScroll;
  };

  /* =========================
     REGION CLICK
  ========================== */

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

    const maxScroll = SCROLL_AREA - window.innerHeight;

    container.scrollTo({
      top: progress * maxScroll,
      behavior: "smooth",
    });
  };

  /* =========================
     AUDIO
  ========================== */

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

  /* =========================
     VIDEO READY
  ========================== */

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      video.currentTime = 0.01;
    };

    const handleSeeked = () => {
      video.pause();
      setVideoReady(true);
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("seeked", handleSeeked);

    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  /* =========================
     START EXPERIENCE
  ========================== */

  useEffect(() => {
    if (!videoReady) return;

    tryPlayAudio();

    requestAnimationFrame(animationLoop);

    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    const startSecond = 2;
    const duration = video.duration || 60;

    const progress = startSecond / duration;

    const maxScroll = SCROLL_AREA - window.innerHeight;

    setTimeout(() => {
      container.scrollTo({
        top: progress * maxScroll,
        behavior: "smooth",
      });
    }, 1000);
  }, [videoReady]);

  /* =========================
     SCROLL LISTENER
  ========================== */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================
     CLEAN RAF
  ========================== */

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />

      <VideoScrollLoader visible={!videoReady} />

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
            disablePictureInPicture
          />

          <RegionOverlayControls
            activeRegion={activeRegion}
            activeTextIndex={activeTextIndex}
            regiones={REGIONES}
            zoneActive={zoneActive}
            onSelectRegion={handleRegionSelect}
            onOpenReservePopup={onOpenReservePopup}
          />
        </div>

        <div style={{ height: `${SCROLL_AREA}px` }} />

        <ScrollDownLottie
          color="#FFFFFF"
          size={60}
          showScrollHint={showScrollHint}
          position="lg"
        />
      </div>

      <button
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-[210] rounded-full bg-black/70 hover:bg-black/85 text-white p-3"
      >
        {isAudioPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </button>
    </>
  );
};
