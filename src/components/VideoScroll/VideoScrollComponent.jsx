import React, { useRef, useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { Title } from "../ui/Title";
import { Mapa } from "../ui/Mapa";
import { Button } from "../ui/Button";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";
import { VideoScrollLoader } from "./VideoScrollLoader";

const TOUR_AUDIO_URL = "/audios/andina-musica.mp3.mpeg";

const REGIONES = [
  {
    start: 0,
    end: 2,
    title: "Bienvenido",
    description:
      "Honramos y exaltamos los sabores de nuestra tierra, por esa razon hemos creado un espacio por cada una de las regiones de nuestro pais. Conocelas deslizando hacia abajo.",
  },
  {
    start: 2,
    end: 14,
    title: "andina",
    description:
      "Hemos querido capturar un poco de la magia de la montana andina, por eso te encontraras con detalles unicos, como las ceramicas de Carmen de Viboral, el barro de Raquira, las ollas de La Chamba, el fique y las ruanas de Boyaca.",
  },
  {
    start: 14,
    end: 35,
    title: "orinoquia",
    description:
      "Aqui podrias sentir la belleza de los llanos y sus horizontes, con sus sombreros en palma de moriche, artesanias en madera y chinchorros tejidos. El lugar perfecto para pedir una buena carne a la llanera.",
  },
  {
    start: 35,
    end: 40,
    title: "pacifica",
    description:
      "Nos trajimos los miles de colores del Pacifico, un bar que fue disenado con detalles de cesteria en werregue y fibras de coco, que le dan una identidad propia. Si estas sentado en este lugar, lo mejor es que te pidas un buen coctel.",
  },
  {
    start: 40,
    end: 46,
    title: "amazonia",
    description:
      "Esta es la amazonia, un lugar donde casi no hay personas, pero si mucha naturaleza, ambientado con tejidos en chambira, bejuco y cumare que honran nuestra raiz indigena. Es un espacio para respirar naturaleza y dejar que sus sabores te sorprendan.",
  },
  {
    start: 46,
    end: 56,
    title: "caribe",
    description:
      "La alegria del caribe en un espacio que se viste con yute, cana flecha y palma de seje, perfecto para disfrutar de un buen pescado frito con arroz de coco.",
  },
];

export const VideoScrollComponent = () => {
  const { onOpenReservePopup, setShowHeader } = useOutletContext();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const seekingRef = useRef(false);
  const directionRef = useRef(0);

  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [hasStartedExperience, setHasStartedExperience] = useState(false);

  const zoneActive = REGIONES[activeTextIndex]?.title || REGIONES[0].title;

  const progress = useMemo(() => {
    const loaded = Number(videoReady) + Number(audioReady);
    return Math.round((loaded / 2) * 100);
  }, [videoReady, audioReady]);

  const isReady = progress === 100;

  
  
  useEffect(() => {
    !showScrollHint  ? setShowHeader(true) : setShowHeader(false);
  }, [showScrollHint]);

  useEffect(() => {
    const audio = new Audio(TOUR_AUDIO_URL);
    audio.preload = "auto";
    audio.loop = true;

    const markAudioReady = () => setAudioReady(true);

    audio.addEventListener("canplaythrough", markAudioReady, { once: true });
    audio.addEventListener("loadeddata", markAudioReady, { once: true });
    audio.addEventListener("error", markAudioReady, { once: true });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const startAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setIsAudioPlaying(true);
    } catch (error) {
      setIsAudioPlaying(false);
    }
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsAudioPlaying(true);
      } catch (error) {
        setIsAudioPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsAudioPlaying(false);
  };

  const handleStartExperience = async () => {
    await startAudio();
    setHasStartedExperience(true);
  };

  const handleRegionSelect = (regionName) => {
    const regionIndex = REGIONES.findIndex(
      (region) => region.title === regionName
    );

    if (regionIndex < 0) return;

    const regionStart = REGIONES[regionIndex].start || 0;
    targetTimeRef.current = regionStart;
    currentTimeRef.current = regionStart;
    setActiveTextIndex(regionIndex);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = regionStart;

      const container = containerRef.current;
      const scrollRange =
        (container?.scrollHeight || 0) - (container?.clientHeight || 0);
      const videoDuration = videoRef.current.duration;
      const fallbackDuration = REGIONES[REGIONES.length - 1]?.end || 1;
      const duration =
        Number.isFinite(videoDuration) && videoDuration > 0
          ? videoDuration
          : fallbackDuration;

      if (container && scrollRange > 0 && duration > 0) {
        const ratio = Math.min(Math.max(regionStart / duration, 0), 1);
        container.scrollTop = ratio * scrollRange;
      }
    }

    setShowScrollHint(regionStart <= 10 / 1000);
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    const onSeeked = () => {
      seekingRef.current = false;
      currentTimeRef.current = video.currentTime;
    };
    video.addEventListener("seeked", onSeeked);

    const getActiveIndex = (time) => {
      for (let i = REGIONES.length - 1; i >= 0; i -= 1) {
        if (time >= REGIONES[i].start) return i;
      }
      return 0;
    };

    const onReady = () => {
      video.pause();
      video.currentTime = 0;
      currentTimeRef.current = 0;
      setVideoReady(true);

      const tick = () => {
        const target = targetTimeRef.current;
        const current = currentTimeRef.current;
        const diff = target - current;

        if (Math.abs(diff) < 0.03) {
          if (!video.paused) video.pause();
          directionRef.current = 0;
        } else if (diff > 0) {
          directionRef.current = 1;
          const speed = Math.min(Math.max(diff * 3, 0.25), 4);
          video.playbackRate = speed;
          if (video.paused) video.play().catch(() => {});
          currentTimeRef.current = video.currentTime;
        } else {
          directionRef.current = -1;
          if (!video.paused) video.pause();

          if (!seekingRef.current) {
            seekingRef.current = true;
            const step = Math.max(Math.abs(diff) * 0.15, 1 / 30);
            const newTime = Math.max(0, current - step);
            video.currentTime = newTime;
          }
        }

        if (!video.paused) {
          currentTimeRef.current = video.currentTime;
        }

        const newIndex = getActiveIndex(currentTimeRef.current);
        setActiveTextIndex((prev) => (prev !== newIndex ? newIndex : prev));

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setShowScrollHint(scrollTop <= 10);

      if (!video.duration) return;

      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progressRatio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      targetTimeRef.current = progressRatio * video.duration;
    };

    const syncInitialHintVisibility = () => {
      setShowScrollHint(container.scrollTop <= 10);
    };

    if (video.readyState >= 1) {
      onReady();
    } else {
      video.addEventListener("loadedmetadata", onReady, { once: true });
    }

    syncInitialHintVisibility();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("seeked", onSeeked);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.pause();
    };
  }, []);

  return (
    <>
      <VideoScrollLoader
        visible={!hasStartedExperience}
        progress={progress}
        isReady={isReady}
        onStart={handleStartExperience}
      />

      <div
        ref={containerRef}
        className="w-full h-screen overflow-y-scroll overflow-x-hidden"
      >
        <div className="sticky top-0 w-full h-screen flex items-center justify-center bg-white">
          <video
            ref={videoRef}
            src="/video/recorrido/recorrido-cortado.mp4"
            className="w-full h-full object-cover"
            preload="auto"
            muted
            playsInline
          />

          <AnimatePresence mode="wait">
            {activeTextIndex > 0 && (
              <motion.div
                initial={{ opacity: 0, width: "0rem" }}
                animate={{
                  opacity: 1,
                  width: activeTextIndex > 0 ? "30rem" : "0rem",
                }}
                exit={{ opacity: 0, width: "0rem" }}
                className="absolute h-screen bg-black/60 right-0 top-0"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="size-full flex flex-col items-center justify-center"
                >
                  {REGIONES.map((text, index) => {
                    if (activeTextIndex === index) {
                      return (
                        <Title
                          key={index}
                          headContent={"Region"}
                          content={text.title}
                          theme="light"
                        />
                      );
                    }
                    return null;
                  })}

                  <div className="w-full px-14 py-12">
                    <Mapa
                      theme={"light"}
                      regionActive={zoneActive}
                      handleShowZone={handleRegionSelect}
                      sizeText={"lg"}
                    />
                  </div>

                  <div className="w-full flex justify-center">
                    <Button
                      title={"Reservar en esta region"}
                      customClass="px-6 py-1.5"
                      type="button-dark"
                      onClick={() => onOpenReservePopup?.(zoneActive)}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[500vh]"></div>

        <ScrollDownLottie
          color="#FFFFFF"
          size={60}
          showScrollHint={showScrollHint}
        />
      </div>

      {hasStartedExperience && (
        <button
          type="button"
          onClick={toggleAudio}
          className="fixed bottom-6 right-6 z-[210] rounded-full bg-black/70 hover:bg-black/85 text-white p-3 transition"
          aria-label={isAudioPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isAudioPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
      )}
    </>
  );
};
