import React, { useRef, useEffect, useState } from "react";

// ============================================
// CONFIGURACIÓN DE TIEMPOS Y CONTENIDO
// ============================================
// Modifica los segundos (start/end) según la duración de tu video
// El audio se reproducirá durante todo el rango de tiempo asignado

const REGIONES = [
  {
    // BIENVENIDA - Sin audio
    start: 0, // Segundo donde inicia
    end: 2, // Segundo donde termina
    title: "Bienvenido",
    description:
      "Honramos y exaltamos los sabores de nuestra tierra, por esa razón hemos creado un espacio por cada una de las regiones de nuestro país. Conócelas deslizando hacia abajo.",
    audio: null,
  },
  {
    // REGIÓN ANDINA
    start: 2,
    end: 9,
    title: "Región andina",
    description:
      "Hemos querido capturar un poco de la magia de la montaña andina, por eso te encontrarás con detalles únicos, cómo las cerámicas de Carmen de Viboral, el barro de Ráquira, las ollas de La Chamba, el fique y las ruanas de Boyacá,.",
    audio: "/audios/andina-musica.mp3.mpeg",
  },
  {
    // REGIÓN ORINOQUIA
    start: 9,
    end: 21,
    title: "REGIÓN ORINOQUIA",
    description:
      "Aquí podrías sentir la belleza de los llanos y sus horizontes, con sus sombreros en palma de moriche, artesanías en madera y chinchorros tejidos. El lugar perfecto para pedir una buena carne a la llanera.",
    audio: "/audios/orinoquia.mp3.mpeg",
  },
  {
    // REGIÓN AMAZONIA
    start: 18,
    end: 26,
    title: "REGIÓN AMAZONIA",
    description:
      "Esta es la amazonía, un lugar dónde casi no hay personas, pero sí mucha naturaleza, ambientado con tejidos en chambira, bejuco y cumare que honran nuestra raíz indígena,. Es un espacio para respirar naturaleza y dejar que sus sabores te sorprendan.",
    audio: "/audios/amazonia-2.mp3.mpeg",
  },
  {
    // REGIÓN CARIBE
    start: 26,
    end: 33,
    title: "REGIÓN CARIBE",
    description:
      "La alegría del caribe en un espacio que se viste con yute, caña flecha y palma de seje, perfecto para disfrutar de un buen pescado frito con arroz de coco.",
    audio: "/audios/caribe-2.mp3.mpeg",
  },
  {
    // REGIÓN INSULAR
    start: 33,
    end: 37,
    title: "REGIÓN INSULAR",
    description:
      "Es un espacio donde podrás bailar y disfrutar de nuestros shows con artistas invitados en tarima con musica de todos los ritmos hermosos de nuestra región.",
    audio: "/audios/insular.mp3.mpeg",
  },
  {
    // REGIÓN PACÍFICO
    start: 37,
    end: 39,
    title: "REGIÓN PACÍFICO",
    description:
      "Nos trajimos los miles de colores del Pacífico, un bar que fue diseñado con detalles de cestería en werregue y fibras de coco, que le dan una identidad propia. Si estás sentado en este lugar, lo mejor es que te pidas un buen cóctel.",
    audio: "/audios/pacifico.mp3.mpeg",
  },
];

// ============================================
// FIN DE CONFIGURACIÓN
// ============================================

export const VideoScrollComponent = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const seekingRef = useRef(false);
  const directionRef = useRef(0);
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  // Web Audio API refs
  const audioCtxRef = useRef(null);
  const audioBuffersRef = useRef({});
  const currentSourceRef = useRef(null);
  const currentGainRef = useRef(null);
  const audioLoadedRef = useRef(false);
  const audioInitializedRef = useRef(false);
  const pendingAudioRef = useRef(null);

  // Precargar audios (fetch como ArrayBuffer pero sin decodificar todavía)
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
            console.log("📥 Audio descargado:", url);
          } catch (err) {
            console.error("❌ Error descargando audio:", url, err);
          }
        })
      );
      console.log("✅ Todos los audios descargados");
    };

    fetchAll();
  }, []);

  // Decodificar audios descargados cuando el AudioContext esté listo
  const decodeAndPlay = async (audioCtx) => {
    if (audioLoadedRef.current) return;

    const urls = Object.keys(rawBuffersRef.current);
    await Promise.all(
      urls.map(async (url) => {
        if (audioBuffersRef.current[url]) return; // Ya decodificado
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

    // Si hay un audio pendiente, reproducirlo ahora
    if (pendingAudioRef.current) {
      playAudioInternal(pendingAudioRef.current);
      pendingAudioRef.current = null;
    }
  };

  // Escuchar gestos del usuario para crear/reanudar AudioContext
  useEffect(() => {
    let cleanedUp = false;

    const removeAllListeners = () => {
      GESTURE_EVENTS.forEach(({ event, opts }) => {
        window.removeEventListener(event, handleGesture, opts);
      });
    };

    // Eventos que SÍ son user activation en Chrome:
    // click, mousedown, mouseup, touchstart, touchend, keydown, keyup, pointerdown, pointerup
    // wheel y touchmove NO son user activation
    const GESTURE_EVENTS = [
      { event: "click", opts: {} },
      { event: "mousedown", opts: {} },
      { event: "pointerdown", opts: {} },
      { event: "touchstart", opts: {} },
      { event: "keydown", opts: {} },
      // Estos no son user activation pero pueden crear el contexto en algunos navegadores
      { event: "wheel", opts: { passive: true } },
      { event: "touchmove", opts: { passive: true } },
    ];

    const handleGesture = async () => {
      if (cleanedUp) return;

      // Paso 1: Crear el AudioContext si no existe
      if (!audioCtxRef.current) {
        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        audioInitializedRef.current = true;
        console.log("✅ AudioContext creado (state:", audioCtx.state, ")");
      }

      const audioCtx = audioCtxRef.current;

      // Paso 2: Intentar reanudar si está suspendido
      if (audioCtx.state === "suspended") {
        try {
          await audioCtx.resume();
          console.log("✅ AudioContext reanudado (state:", audioCtx.state, ")");
        } catch (e) {
          // No se pudo reanudar con este evento, seguir escuchando
          console.log("⏳ No se pudo reanudar, esperando gesto válido...");
          return;
        }
      }

      // Paso 3: Si llegamos aquí con state "running", éxito!
      if (audioCtx.state === "running") {
        console.log("✅ AudioContext corriendo — eliminando listeners");
        removeAllListeners();
        // Decodificar audios
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

  // Función interna para reproducir audio
  const playAudioInternal = (url) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx || !audioBuffersRef.current[url]) return;

    // Detener el audio actual con fade out
    stopCurrentAudio();

    // Crear nuevo source y gain
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = audioBuffersRef.current[url];
    source.loop = true;
    source.connect(gain);
    gain.connect(audioCtx.destination);

    // Fade in suave
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.5);

    source.start(0);
    currentSourceRef.current = source;
    currentGainRef.current = gain;
    console.log("▶️ Reproduciendo:", url);
  };

  // Función para reproducir un audio
  const playAudio = (url) => {
    if (!audioInitializedRef.current || !audioLoadedRef.current) {
      // Guardar como pendiente y se reproducirá cuando se inicialice
      pendingAudioRef.current = url;
      return;
    }
    playAudioInternal(url);
  };

  // Función para detener el audio actual con fade out
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
          } catch (e) {
            // Ya estaba detenido
          }
        }, 350);
      } catch (e) {
        // Ignorar errores si ya estaba detenido
      }
    }
    currentSourceRef.current = null;
    currentGainRef.current = null;
  };

  // Effect para manejar el cambio de audio según la región activa
  useEffect(() => {
    const currentAudio = REGIONES[activeTextIndex]?.audio;

    if (!currentAudio) {
      // Sin audio: detener
      stopCurrentAudio();
      pendingAudioRef.current = null;
      return;
    }

    // Reproducir el audio de la región
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

        // Actualizar texto activo según el tiempo del video
        const newIndex = getActiveIndex(currentTimeRef.current);
        setActiveTextIndex((prev) => (prev !== newIndex ? newIndex : prev));

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      if (!video.duration) return;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollTop / scrollHeight;
      targetTimeRef.current = progress * video.duration;
    };

    if (video.readyState >= 1) {
      onReady();
    } else {
      video.addEventListener("loadedmetadata", onReady, { once: true });
    }

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
      {/* Video fijo en la pantalla */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center bg-white">
        <div className="absolute bg-gradient-to-r from-black/70 to-transparent w-1/2 h-full left-0" />
        <video
          ref={videoRef}
          src="/video/videoScroll.mp4"
          className="w-full h-full object-cover"
          preload="auto"
          muted
          playsInline
        />

        <div className="absolute bottom-40 left-20 text-white text-3xl font-bold w-auto">
          {REGIONES.map((text, index) => (
            <div
              key={index}
              className="absolute bottom-0 left-0 transition-all duration-700 ease-in-out max-w-lg"
              style={{
                opacity: activeTextIndex === index ? 1 : 0,
                transform:
                  activeTextIndex === index
                    ? "translateY(0)"
                    : activeTextIndex > index
                    ? "translateY(-30px)"
                    : "translateY(30px)",
                pointerEvents: activeTextIndex === index ? "auto" : "none",
              }}
            >
              <h2 className="uppercase border-b-2 text-6xl whitespace-nowrap">
                {text.title}
              </h2>
              <p className="mt-4 text-xl w-auto">{text.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Espaciador para crear el scroll */}
      <div className="h-[500vh]"></div>
    </div>
  );
};
 
