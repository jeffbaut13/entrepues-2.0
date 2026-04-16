import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

import { ScrollDownLottie } from "../ui/ScrollDownLottie";
import { RegionOverlayControls } from "./RegionOverlayControls";
import { VideoScrollLoader } from "./VideoScrollLoader";
import { CanvasScrollSequence } from "./CanvasScrollSequence";

const AUDIO_URL = "/audios/audio.mp3";
const FRAME_COUNT = 677;
const VIDEO_DURATION_SECONDS = 56.41;
const FRAMES_PER_SECOND = FRAME_COUNT / VIDEO_DURATION_SECONDS;
const STEP_FRAMES = 48;
const TRANSITION_DURATION_MS = 1000;
const COOLDOWN_MS = 200;
const PRELOAD_RADIUS = 16;
const TRANSITION_EASING = "easeInOutCubic";

const REGIONES = [
  { start: 0, title: "Bienvenido" },
  { start: 4, title: "Andina" },
  { start: 14, title: "Orinoquía" },
  { start: 35, title: "Pacífica" },
  { start: 40, title: "Amazonía" },
  { start: 46, title: "Caribe" },
  { start: 51, title: "Zona Pet" },
];

const getFrameSrc = (index) =>
  `/video/recorrido/frames-webp-hq/frame_${String(index + 1).padStart(4, "0")}.webp`;

const timeToFrame = (time) =>
  Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(time * FRAMES_PER_SECOND)));

const frameToTime = (frame) => frame / FRAMES_PER_SECOND;

export const VideoScrollComponent = () => {
  const { onOpenReservePopup, setShowHeader, setVideoScrollTime } =
    useOutletContext();

  const sequenceRef = useRef(null);
  const audioRef = useRef(null);
  const bootTimeoutRef = useRef(null);
  const regionJumpTimeoutRef = useRef(null);
  const regionFlashEndTimeoutRef = useRef(null);
  const lastHeaderVisibleRef = useRef(false);
  const lastScrollHintVisibleRef = useRef(true);
  const lastRegionIndexRef = useRef(0);

  const [sequenceReady, setSequenceReady] = useState(false);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [activeRegion, setActiveRegion] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isRegionJumpOverlayVisible, setIsRegionJumpOverlayVisible] =
    useState(false);
  const [isFrameLoadingOverlayVisible, setIsFrameLoadingOverlayVisible] =
    useState(false);

  const zoneActive = REGIONES[activeTextIndex]?.title || REGIONES[0].title;

  const syncUiState = (time) => {
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
    for (let i = REGIONES.length - 1; i >= 0; i -= 1) {
      if (time >= REGIONES[i].start - offset) {
        if (lastRegionIndexRef.current !== i) {
          lastRegionIndexRef.current = i;
          setActiveRegion(i);
          setActiveTextIndex(i);
        }
        return;
      }
    }
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

  const handleFrameChange = (frame) => {
    syncUiState(frameToTime(frame));
  };

  const handleFrameLoadStateChange = (isLoading) => {
    setIsFrameLoadingOverlayVisible(isLoading);
  };

  const handleRegionSelect = (regionName) => {
    const regionIndex = REGIONES.findIndex(
      (region) => region.title === regionName,
    );

    if (regionIndex < 0) return;

    const targetFrame = timeToFrame(REGIONES[regionIndex].start);

    lastRegionIndexRef.current = regionIndex;
    setActiveRegion(regionIndex);
    setActiveTextIndex(regionIndex);

    if (regionJumpTimeoutRef.current) {
      clearTimeout(regionJumpTimeoutRef.current);
    }
    if (regionFlashEndTimeoutRef.current) {
      clearTimeout(regionFlashEndTimeoutRef.current);
    }

    setIsRegionJumpOverlayVisible(true);

    regionJumpTimeoutRef.current = setTimeout(() => {
      sequenceRef.current?.jumpToFrame(targetFrame, { immediate: true });
      syncUiState(REGIONES[regionIndex].start);
    }, 70);

    regionFlashEndTimeoutRef.current = setTimeout(() => {
      setIsRegionJumpOverlayVisible(false);
    }, 320);
  };

  useEffect(() => {
    if (!sequenceReady) return;

    tryPlayAudio();

    bootTimeoutRef.current = setTimeout(() => {
      sequenceRef.current?.jumpToFrame(timeToFrame(4));
    }, 1000);

    return () => {
      if (bootTimeoutRef.current) clearTimeout(bootTimeoutRef.current);
    };
  }, [sequenceReady]);

  useEffect(() => {
    return () => {
      if (bootTimeoutRef.current) clearTimeout(bootTimeoutRef.current);
      if (regionJumpTimeoutRef.current) clearTimeout(regionJumpTimeoutRef.current);
      if (regionFlashEndTimeoutRef.current) {
        clearTimeout(regionFlashEndTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />

      <VideoScrollLoader visible={!sequenceReady} />

      <div className="w-full h-dvh overflow-hidden">
        <div className="relative h-full w-full">
          <CanvasScrollSequence
            ref={sequenceRef}
            totalFrames={FRAME_COUNT}
            getFrameSrc={getFrameSrc}
            stepFrames={STEP_FRAMES}
            transitionDuration={TRANSITION_DURATION_MS}
            cooldownMs={COOLDOWN_MS}
            easing={TRANSITION_EASING}
            preloadRadius={PRELOAD_RADIUS}
            className="h-full w-full"
            cacheKey="descubrenos-sequence"
            onFrameChange={handleFrameChange}
            onFrameLoadStateChange={handleFrameLoadStateChange}
            onReady={() => setSequenceReady(true)}
          />

          <AnimatePresence>
            {(isRegionJumpOverlayVisible || isFrameLoadingOverlayVisible) && (
              <motion.div
                key="region-jump-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 z-[160] bg-black"
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
