import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { AnimatePresence, motion } from "framer-motion";

const buildPagePath = (index) => {
  const page = String(index).padStart(2, "0");
  return `/carta/pages/page-${page}.png`;
};

const PAGES = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  src: buildPagePath(index + 1),
}));

export const Flipbook = () => {
  const videoRef = useRef(null);
  const flipBookRef = useRef(null);
  const [videoFinished, setVideoFinished] = useState(false);
  const [showQuickFlipButton, setShowQuickFlipButton] = useState(true);
  const [viewport, setViewport] = useState({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 720 : window.innerHeight,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const bookSize = useMemo(() => {
    const vw = viewport.width;
    const vh = viewport.height;

    // Aspect ratio de doble pagina: 2 * (width/height) con pagina aprox 0.69
    const spreadAspect = 1.38;
    const maxSpreadWidth = vw * 0.96;
    const maxSpreadHeight = vh * 0.9;
    const spreadHeight = Math.min(
      maxSpreadHeight,
      maxSpreadWidth / spreadAspect
    );
    const pageHeight = Math.max(420, Math.round(spreadHeight));
    const pageWidth = Math.max(280, Math.round(pageHeight * 0.69));

    return { width: pageWidth, height: pageHeight };
  }, [viewport]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, []);

  const handleQuickFlip = () => {
    const flipApi = flipBookRef.current?.pageFlip?.();
    if (flipApi) {
      flipApi.flipNext();
    }
    setShowQuickFlipButton(false);
  };

  return (
    <section className="relative w-full h-dvh overflow-hidden bg-transparent">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/video/menu/ver-carta.mp4"
        ref={videoRef}
        defaultMuted={true}
        muted={true}
        autoPlay
        playsInline
        preload="auto"
        poster=""
        onEnded={() => setVideoFinished(true)}
      />

      <AnimatePresence>
        {videoFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="w-full h-full absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "transparent" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 1.2 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.08, ease: "easeOut" }}
              className="bg-transparent relative"
            >
              {showQuickFlipButton && (
                <button
                  type="button"
                  onClick={handleQuickFlip}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-16 w-16 rounded-full  flex items-center justify-center "
                >
                  <span className="rounded-full bg-amber-100 w-8 h-8 inline-flex animate-ping absolute" />
                  <span className="rounded-full bg-amber-400 w-14 h-14 inline-flex animate-ping absolute" />
                  <span className="rounded-full bg-amber-600 w-10 h-10 inline-flex animate-pulse" />
                </button>
              )}
              <HTMLFlipBook
                ref={flipBookRef}
                width={bookSize.width}
                height={bookSize.height}
                size="stretch"
                minWidth={bookSize.width}
                maxWidth={1400}
                minHeight={bookSize.height}
                maxHeight={2200}
                maxShadowOpacity={0.35}
                showCover={true}
                mobileScrollSupport={true}
                className="bg-transparent"
                style={{ backgroundColor: "transparent" }}
                startPage={0}
                drawShadow={true}
                flippingTime={900}
                usePortrait={false}
                startZIndex={0}
                autoSize={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
              >
                {PAGES.map((page) => (
                  <div
                    key={page.id}
                    className="w-full h-full bg-transparent select-none"
                  >
                    <img
                      src={page.src}
                      alt={`Pagina ${page.id}`}
                      loading={page.id <= 4 ? "eager" : "lazy"}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Flipbook;
