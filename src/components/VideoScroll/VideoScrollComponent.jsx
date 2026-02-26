import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Title } from "../ui/Title";
import { Mapa } from "../ui/Mapa";
import { Button } from "../ui/Button";
import { ScrollDownLottie } from "../ui/ScrollDownLottie";

const REGIONES = [
  {
    start: 0,
    end: 2,
    title: "Bienvenido",
    description:
      "Honramos y exaltamos los sabores de nuestra tierra, por esa razón hemos creado un espacio por cada una de las regiones de nuestro país. Conócelas deslizando hacia abajo.",
    audio: null,
  },
  {
    start: 2,
    end: 9,
    title: "andina",
    description:
      "Hemos querido capturar un poco de la magia de la montaña andina, por eso te encontrarás con detalles únicos, cómo las cerámicas de Carmen de Viboral, el barro de Ráquira, las ollas de La Chamba, el fique y las ruanas de Boyacá,.",
    audio: "/audios/andina-musica.mp3.mpeg",
  },
  {
    start: 9,
    end: 21,
    title: "orinoquia",
    description:
      "Aquí podrías sentir la belleza de los llanos y sus horizontes, con sus sombreros en palma de moriche, artesanías en madera y chinchorros tejidos. El lugar perfecto para pedir una buena carne a la llanera.",
    audio: "/audios/orinoquia.mp3.mpeg",
  },
  {
    start: 18,
    end: 26,
    title: "amazonia",
    description:
      "Esta es la amazonía, un lugar dónde casi no hay personas, pero sí mucha naturaleza, ambientado con tejidos en chambira, bejuco y cumare que honran nuestra raíz indígena,. Es un espacio para respirar naturaleza y dejar que sus sabores te sorprendan.",
    audio: "/audios/amazonia-2.mp3.mpeg",
  },
  {
    start: 26,
    end: 33,
    title: "caribe",
    description:
      "La alegría del caribe en un espacio que se viste con yute, caña flecha y palma de seje, perfecto para disfrutar de un buen pescado frito con arroz de coco.",
    audio: "/audios/caribe-2.mp3.mpeg",
  },
  {
    start: 33,
    end: 37,
    title: "insular",
    description:
      "Es un espacio donde podrás bailar y disfrutar de nuestros shows con artistas invitados en tarima con musica de todos los ritmos hermosos de nuestra región.",
    audio: "/audios/insular.mp3.mpeg",
  },
  {
    start: 37,
    end: 39,
    title: "pacifica",
    description:
      "Nos trajimos los miles de colores del Pacífico, un bar que fue diseñado con detalles de cestería en werregue y fibras de coco, que le dan una identidad propia. Si estás sentado en este lugar, lo mejor es que te pidas un buen cóctel.",
    audio: "/audios/pacifico.mp3.mpeg",
  },
];

export const VideoScrollComponent = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const seekingRef = useRef(false);
  const directionRef = useRef(0);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const zoneActive = REGIONES[activeTextIndex].title;

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
        const progress = Math.min(Math.max(regionStart / duration, 0), 1);
        container.scrollTop = progress * scrollRange;
      }
    }

    setShowScrollHint(regionStart <= 10 / 1000);
  };

  const audioCtxRef = useRef(null);
  const audioBuffersRef = useRef({});
  const currentSourceRef = useRef(null);
  const currentGainRef = useRef(null);
  const audioLoadedRef = useRef(false);
  const audioInitializedRef = useRef(false);
  const pendingAudioRef = useRef(null);

  const rawBuffersRef = useRef({});
  useEffect(() => {
    const audioUrls = REGIONES.map((r) => r.audio).filter(Boolean);

    const fetchAll = async () => {
      await Promise.all(
        audioUrls.map(async (url) => {
          try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            rawBuffersRef.current[url] = arrayBuffer;
            /* console.log("📥 Audio descargado:", url); */
          } catch (err) {
            console.error("❌ Error descargando audio:", url, err);
          }
        })
      );
     /*  console.log("✅ Todos los audios descargados"); */
    };

    fetchAll();
  }, []);

  const playAudioInternal = (url) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx || !audioBuffersRef.current[url]) return;

    stopCurrentAudio();

    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = audioBuffersRef.current[url];
    source.loop = true;
    source.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.5);

    source.start(0);
    currentSourceRef.current = source;
    currentGainRef.current = gain;
    console.log("▶️ Reproduciendo:", url);
  };

  const decodeAndPlay = async (audioCtx) => {
    if (audioLoadedRef.current) return;

    const urls = Object.keys(rawBuffersRef.current);
    await Promise.all(
      urls.map(async (url) => {
        if (audioBuffersRef.current[url]) return;
        try {
          const bufferCopy = rawBuffersRef.current[url].slice(0);
          const audioBuffer = await audioCtx.decodeAudioData(bufferCopy);
          audioBuffersRef.current[url] = audioBuffer;
          console.log("🎵 Audio decodificado:", url);
        } catch (err) {
          console.error("❌ Error decodificando:", url, err);
        }
      })
    );

    audioLoadedRef.current = true;
    console.log("✅ Todos los audios listos para reproducir");

    if (pendingAudioRef.current) {
      playAudioInternal(pendingAudioRef.current);
      pendingAudioRef.current = null;
    }
  };

  useEffect(() => {
    let cleanedUp = false;

    const removeAllListeners = () => {
      GESTURE_EVENTS.forEach(({ event, opts }) => {
        window.removeEventListener(event, handleGesture, opts);
      });
    };

    const GESTURE_EVENTS = [
      { event: "click", opts: {} },
      { event: "mousedown", opts: {} },
      { event: "pointerdown", opts: {} },
      { event: "touchstart", opts: {} },
      { event: "keydown", opts: {} },
      { event: "wheel", opts: { passive: true } },
      { event: "touchmove", opts: { passive: true } },
    ];

    const handleGesture = async () => {
      if (cleanedUp) return;

      if (!audioCtxRef.current) {
        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        audioInitializedRef.current = true;
        /* console.log("✅ AudioContext creado (state:", audioCtx.state, ")"); */
      }

      const audioCtx = audioCtxRef.current;

      if (audioCtx.state === "suspended") {
        try {
          await audioCtx.resume();
          console.log("✅ AudioContext reanudado (state:", audioCtx.state, ")");
        } catch (e) {
          console.log("⏳ No se pudo reanudar, esperando gesto válido...");
          return;
        }
      }

      if (audioCtx.state === "running") {
        console.log("✅ AudioContext corriendo — eliminando listeners");
        removeAllListeners();
        decodeAndPlay(audioCtx);
      }
    };

    GESTURE_EVENTS.forEach(({ event, opts }) => {
      window.addEventListener(event, handleGesture, opts);
    });

    return () => {
      cleanedUp = true;
      removeAllListeners();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const playAudio = (url) => {
    if (!audioInitializedRef.current || !audioLoadedRef.current) {
      pendingAudioRef.current = url;
      return;
    }
    playAudioInternal(url);
  };

  const stopCurrentAudio = () => {
    const audioCtx = audioCtxRef.current;
    if (currentSourceRef.current && currentGainRef.current && audioCtx) {
      try {
        currentGainRef.current.gain.linearRampToValueAtTime(
          0,
          audioCtx.currentTime + 0.3
        );
        const oldSource = currentSourceRef.current;
        setTimeout(() => {
          try {
            oldSource.stop();
          } catch (e) {}
        }, 350);
      } catch (e) {}
    }
    currentSourceRef.current = null;
    currentGainRef.current = null;
  };

  useEffect(() => {
    const currentAudio = REGIONES[activeTextIndex]?.audio;

    if (!currentAudio) {
      stopCurrentAudio();
      pendingAudioRef.current = null;
      return;
    }

    playAudio(currentAudio);
  }, [activeTextIndex]);

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
      for (let i = REGIONES.length - 1; i >= 0; i--) {
        if (time >= REGIONES[i].start) return i;
      }
      return 0;
    };

    const onReady = () => {
      video.pause();
      video.currentTime = 0;
      currentTimeRef.current = 0;

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
      const progress = scrollTop / scrollHeight;
      targetTimeRef.current = progress * video.duration;
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
    <div
      ref={containerRef}
      className="w-full h-screen overflow-y-scroll overflow-x-hidden"
    >
      <div className="sticky top-0 w-full h-screen flex items-center justify-center bg-white">
        <video
          ref={videoRef}
          src="/video/recorrido/recorrido.mp4"
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
                        headContent={"Región"}
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
                    title={"Reservar en esta región"}
                    customClass="px-6 py-1.5"
                    type="enlace"
                    href={`/reservar/?region=${encodeURIComponent(zoneActive)}`}
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
        size={120}
        showScrollHint={showScrollHint}
      />
    </div>
  );
};
