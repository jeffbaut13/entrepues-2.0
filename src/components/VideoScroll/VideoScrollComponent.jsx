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
  { start: 55, title: "caribe" },
];

/* Easing natural para evitar saltos bruscos */
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

const SCROLL_STEP_SECONDS = 3;
const STEP_TRANSITION_MS = 1500;

const TOUCH_THRESHOLD = 30;

export const VideoScrollComponent = () => {
  const { onOpenReservePopup, setShowHeader } = useOutletContext();

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  /* Refs de navegación */
  const isTransitioningRef = useRef(false);
  const transitionStartRef = useRef(0);
  const transitionFromRef = useRef(0);
  const transitionToRef = useRef(0);

  /* Ref para detección de swipe */
  const touchStartYRef = useRef(0);

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
     NAVEGAR A TIEMPO
  ========================== */

  const navigateToTime = (targetTime) => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration || 60;
    const clampedTargetTime = Math.max(0, Math.min(duration, targetTime));

    const fromTime = video.currentTime;
    const toTime = clampedTargetTime;

    if (Math.abs(fromTime - toTime) < 0.05) {
      isTransitioningRef.current = false;
      return;
    }

    isTransitioningRef.current = true;
    transitionStartRef.current = performance.now();
    transitionFromRef.current = fromTime;
    transitionToRef.current = toTime;
  };

  /* =========================
     RAF LOOP (ease-in-out cinematográfico)
  ========================== */

  const animationLoop = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isTransitioningRef.current) {
      const elapsed = performance.now() - transitionStartRef.current;
      const rawProgress = Math.min(elapsed / STEP_TRANSITION_MS, 1);
      const eased = easeInOutSine(rawProgress);

      const from = transitionFromRef.current;
      const to = transitionToRef.current;
      const time = from + (to - from) * eased;

      video.currentTime = time;

      setShowHeader(time > 1.5);
      setShowScrollHint(time < 3);
      updateRegion(time);

      if (rawProgress >= 1) {
        video.currentTime = transitionToRef.current;
        updateRegion(transitionToRef.current);
        isTransitioningRef.current = false;
      }
    } else {
      const time = video.currentTime;
      setShowHeader(time > 1.5);
      setShowScrollHint(time < 3);
      updateRegion(time);
    }

    animationRef.current = requestAnimationFrame(animationLoop);
  };

  /* =========================
      WHEEL → avance/retroceso fijo por segundos
     (bloqueado durante transición)
  ========================== */

  const handleWheel = (e) => {
    e.preventDefault();

    if (isTransitioningRef.current) return;

    const video = videoRef.current;
    if (!video) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    const nextTime = video.currentTime + direction * SCROLL_STEP_SECONDS;

    navigateToTime(nextTime);
  };

  /* =========================
      TOUCH → swipe en pasos de 2 segundos
     (bloqueado durante transición)
  ========================== */

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (isTransitioningRef.current) return;

    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;

    const video = videoRef.current;
    if (!video) return;

    const direction = deltaY > 0 ? 1 : -1;
    const nextTime = video.currentTime + direction * SCROLL_STEP_SECONDS;

    navigateToTime(nextTime);
  };

  /* =========================
     REGION CLICK (salto directo, sin bloqueo)
  ========================== */

  const handleRegionSelect = (regionName) => {
    if (isTransitioningRef.current) return;

    const regionIndex = REGIONES.findIndex(
      (region) => region.title === regionName,
    );

    if (regionIndex < 0) return;

    navigateToTime(REGIONES[regionIndex].start);
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

    setTimeout(() => {
      navigateToTime(2);
    }, 1000);
  }, [videoReady]);

  /* =========================
     WHEEL + TOUCH LISTENERS
  ========================== */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
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
        className="w-full h-dvh overflow-hidden"
      >
        <div className="relative h-full w-full">
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
