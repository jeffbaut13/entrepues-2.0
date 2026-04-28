import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";
import { RegionOverlayControls } from "./RegionOverlayControls";
import {
  getVideoScrollFrameSrc,
  startVideoScrollFramePreload,
} from "../../lib/videoScrollFramePreloader";

const AUDIO_URL = "/audios/audio.mp3";
const FRAME_COUNT = 677;
const VIDEO_DURATION_SECONDS = 56.41;
const FRAMES_PER_SECOND = FRAME_COUNT / VIDEO_DURATION_SECONDS;
const SCROLL_STEP_SECONDS = 2;
const INPUT_STEP_FRAMES = Math.round(SCROLL_STEP_SECONDS * FRAMES_PER_SECOND);
const INPUT_CAPTURE_MS = 1000;
const SPRING_STIFFNESS = 22;
const SPRING_DAMPING = 10;
const MAX_VELOCITY = 220;
const TOUCH_THRESHOLD = 30;

const REGIONES = [
  { start: 0, title: "Bienvenido" },
  { start: 2, title: "Andina" },
  { start: 14, title: "Orinoquía" },
  { start: 35, title: "Pacífica" },
  { start: 40, title: "Amazonía" },
  { start: 46, title: "Caribe" },
  { start: 51, title: "Pet family" },
];

const getReachableRegionStart = (start) =>
  Math.max(0, Math.min(Number(start) || 0, VIDEO_DURATION_SECONDS - 0.05));

const alignTimeToStepGrid = (timeInSeconds) =>
  Math.round(timeInSeconds / SCROLL_STEP_SECONDS) * SCROLL_STEP_SECONDS;

const getAlignedRegionStart = (start) => {
  const reachable = getReachableRegionStart(start);
  const aligned = alignTimeToStepGrid(reachable);
  return Math.max(0, Math.min(aligned, VIDEO_DURATION_SECONDS - 0.05));
};

export const VideoScrollComponent = () => {
  const { onOpenReservePopup, setShowHeader, setVideoScrollTime } =
    useOutletContext();

  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const bootTimeoutRef = useRef(null);
  const regionJumpTimeoutRef = useRef(null);
  const regionFlashEndTimeoutRef = useRef(null);
  const touchStartYRef = useRef(0);
  const currentPositionRef = useRef(0);
  const targetFrameRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const lastAcceptedInputAtRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastHeaderVisibleRef = useRef(false);
  const lastScrollHintVisibleRef = useRef(true);
  const lastRegionIndexRef = useRef(0);
  const lastSettledFrameRef = useRef(null);

  const [frameReady, setFrameReady] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [activeRegion, setActiveRegion] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isRegionJumpFlashVisible, setIsRegionJumpFlashVisible] =
    useState(false);

  const zoneActive = REGIONES[activeTextIndex]?.title || REGIONES[0].title;
  const currentFrameSrc = getVideoScrollFrameSrc(currentFrame);

  const frameToTime = (frameIndex) => frameIndex / FRAMES_PER_SECOND;

  const syncUiState = (frameIndex) => {
    const time = frameToTime(frameIndex);
    setVideoScrollTime?.(time);

    const nextHeaderVisible = time > 1.5;
    if (lastHeaderVisibleRef.current !== nextHeaderVisible) {
      lastHeaderVisibleRef.current = nextHeaderVisible;
      setShowHeader(nextHeaderVisible);
    }

    const nextScrollHintVisible = time < 3;
    if (lastScrollHintVisibleRef.current !== nextScrollHintVisible) {
      lastScrollHintVisibleRef.current = nextScrollHintVisible;
      setShowScrollHint(nextScrollHintVisible);
    }

    const offset = 0.15;
    for (let i = REGIONES.length - 1; i >= 0; i--) {
      const regionStart = getAlignedRegionStart(REGIONES[i].start);
      if (time >= regionStart - offset) {
        if (lastRegionIndexRef.current !== i) {
          lastRegionIndexRef.current = i;
          setActiveRegion(i);
          setActiveTextIndex(i);
        }
        return;
      }
    }
  };

  const setFrame = (frameIndex) => {
    const nextFrame = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));
    currentFrameRef.current = nextFrame;
    setCurrentFrame(nextFrame);
    syncUiState(nextFrame);
  };

  const preloadNearbyFrames = (frameIndex) => {
    const preloadTargets = [
      frameIndex + 1,
      frameIndex + 2,
      frameIndex + 3,
      frameIndex - 1,
    ].filter((index) => index >= 0 && index < FRAME_COUNT);

    preloadTargets.forEach((index) => {
      const img = new Image();
      img.src = getVideoScrollFrameSrc(index);
    });
  };

  const clampFrame = (frame) => Math.max(0, Math.min(FRAME_COUNT - 1, frame));

  const nudgeTargetFrame = (deltaFrames) => {
    const nextTarget = clampFrame(targetFrameRef.current + deltaFrames);
    targetFrameRef.current = nextTarget;
  };

  const tryCaptureInput = (direction) => {
    const now = performance.now();
    if (now - lastAcceptedInputAtRef.current < INPUT_CAPTURE_MS) return;

    lastAcceptedInputAtRef.current = now;
    nudgeTargetFrame(direction * INPUT_STEP_FRAMES);
  };

  const navigateToFrame = (targetFrame) => {
    targetFrameRef.current = clampFrame(targetFrame);
  };

  const snapToFrame = (targetFrame) => {
    const nextFrame = clampFrame(targetFrame);
    targetFrameRef.current = nextFrame;
    currentPositionRef.current = nextFrame;
    velocityRef.current = 0;
    lastAcceptedInputAtRef.current = performance.now();
    lastSettledFrameRef.current = nextFrame;
    setFrame(nextFrame);
  };

  const animationLoop = (timestamp) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }

    const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05);
    lastTimestampRef.current = timestamp;

    const current = currentPositionRef.current;
    const target = targetFrameRef.current;
    const displacement = target - current;

    if (
      Math.abs(displacement) > 0.001 ||
      Math.abs(velocityRef.current) > 0.001
    ) {
      const acceleration =
        displacement * SPRING_STIFFNESS - velocityRef.current * SPRING_DAMPING;

      velocityRef.current += acceleration * dt;
      velocityRef.current = Math.max(
        -MAX_VELOCITY,
        Math.min(MAX_VELOCITY, velocityRef.current),
      );

      currentPositionRef.current = clampFrame(
        currentPositionRef.current + velocityRef.current * dt,
      );

      if (
        Math.abs(target - currentPositionRef.current) < 0.02 &&
        Math.abs(velocityRef.current) < 0.02
      ) {
        currentPositionRef.current = target;
        velocityRef.current = 0;

        const settledFrame = Math.round(target);
        if (lastSettledFrameRef.current !== settledFrame) {
          lastSettledFrameRef.current = settledFrame;
           
        }
      }
    }

    const nextFrame = Math.round(currentPositionRef.current);
    if (nextFrame !== currentFrameRef.current) {
      setFrame(nextFrame);
    } else {
      syncUiState(nextFrame);
    }

    animationRef.current = requestAnimationFrame(animationLoop);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    tryCaptureInput(e.deltaY > 0 ? 1 : -1);
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const deltaY = touchStartYRef.current - e.touches[0].clientY;
    if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;

    tryCaptureInput(deltaY > 0 ? 1 : -1);
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
    tryCaptureInput(deltaY > 0 ? 1 : -1);
  };

  const handleRegionSelect = (regionName) => {
    const regionIndex = REGIONES.findIndex(
      (region) => region.title === regionName,
    );

    if (regionIndex < 0) return;

    const regionStart = getAlignedRegionStart(REGIONES[regionIndex].start);
    const nextFrame = Math.round(regionStart * FRAMES_PER_SECOND);

    // Refleja el estado seleccionado de inmediato (antes del salto visual).
    lastRegionIndexRef.current = regionIndex;
    setActiveRegion(regionIndex);
    setActiveTextIndex(regionIndex);

    if (regionJumpTimeoutRef.current)
      clearTimeout(regionJumpTimeoutRef.current);
    if (regionFlashEndTimeoutRef.current) {
      clearTimeout(regionFlashEndTimeoutRef.current);
    }

    setIsRegionJumpFlashVisible(true);

    // Pequeña ráfaga visual para enmascarar el salto abrupto de frame.
    regionJumpTimeoutRef.current = setTimeout(() => {
      snapToFrame(nextFrame);
    }, 55);

    regionFlashEndTimeoutRef.current = setTimeout(() => {
      setIsRegionJumpFlashVisible(false);
    }, 170);
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
      return;
    }

    audio.pause();
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    startVideoScrollFramePreload();
  }, []);

  useEffect(() => {
    preloadNearbyFrames(currentFrame);
  }, [currentFrame]);

  useEffect(() => {
    const firstFrame = new Image();
    firstFrame.src = getVideoScrollFrameSrc(0);
    firstFrame.onload = () => {
      currentPositionRef.current = 0;
      targetFrameRef.current = 0;
      velocityRef.current = 0;
      lastAcceptedInputAtRef.current = 0;
      lastSettledFrameRef.current = 0;
      setFrame(0);
      setFrameReady(true);
    };
  }, []);

  useEffect(() => {
    if (!frameReady) return;

    tryPlayAudio();
    animationRef.current = requestAnimationFrame(animationLoop);

    bootTimeoutRef.current = setTimeout(() => {
      navigateToFrame(Math.round(2 * FRAMES_PER_SECOND));
    }, 1000);

    return () => {
      if (bootTimeoutRef.current) clearTimeout(bootTimeoutRef.current);
    };
  }, [frameReady]);

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

  useEffect(() => {
    return () => {
      if (bootTimeoutRef.current) clearTimeout(bootTimeoutRef.current);
      if (regionJumpTimeoutRef.current)
        clearTimeout(regionJumpTimeoutRef.current);
      if (regionFlashEndTimeoutRef.current) {
        clearTimeout(regionFlashEndTimeoutRef.current);
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimestampRef.current = 0;
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />

      <div ref={containerRef} className="w-full h-dvh overflow-hidden">
        <div className="relative h-full w-full">
          <img
            src={currentFrameSrc}
            alt=""
            className="h-full w-full object-cover select-none"
            draggable={false}
          />

          <AnimatePresence>
            {isRegionJumpFlashVisible && (
              <motion.div
                key="region-jump-flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.34 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 z-[160] bg-white"
              />
            )}
          </AnimatePresence>

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
        type="button"
        onClick={toggleAudio}
        className="fixed bottom-5 right-5 z-[210] rounded-full bg-black/35 p-3 text-white backdrop-blur-sm transition hover:bg-black/50"
        aria-label={isAudioPlaying ? "Silenciar audio" : "Activar audio"}
      >
        {isAudioPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </>
  );
};
