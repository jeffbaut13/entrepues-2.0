import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";

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
  const isMobile = useIsMobile();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [showQuickFlipButton, setShowQuickFlipButton] = useState(true);
  const [viewport, setViewport] = useState({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 720 : window.innerHeight,
  });
  const touchGestureRef = useRef({
    startX: 0,
    startY: 0,
    tracking: false,
    multiTouch: false,
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

    const pageAspect = 0.69;

    if (isMobile) {
      const maxPageWidth = vw * 0.92;
      const maxPageHeight = vh * 0.82;
      const pageHeight = Math.max(
        420,
        Math.round(Math.min(maxPageHeight, maxPageWidth / pageAspect))
      );
      const pageWidth = Math.max(280, Math.round(pageHeight * pageAspect));

      return { width: pageWidth, height: pageHeight };
    }

    // Aspect ratio de doble pagina: 2 * (width/height) con pagina aprox 0.69
    const spreadAspect = pageAspect * 2;
    const maxSpreadWidth = vw * 0.96;
    const maxSpreadHeight = vh * 0.9;
    const spreadHeight = Math.min(
      maxSpreadHeight,
      maxSpreadWidth / spreadAspect
    );
    const pageHeight = Math.max(420, Math.round(spreadHeight));
    const pageWidth = Math.max(280, Math.round(pageHeight * pageAspect));

    return { width: pageWidth, height: pageHeight };
  }, [isMobile, viewport]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, []);

  useEffect(() => {
    if (!isMobile || typeof window === "undefined" || !window.visualViewport) {
      setIsZoomed(false);
      return;
    }

    const syncZoomState = () => {
      setIsZoomed(window.visualViewport.scale > 1.01);
    };

    syncZoomState();
    window.visualViewport.addEventListener("resize", syncZoomState);
    window.visualViewport.addEventListener("scroll", syncZoomState);

    return () => {
      window.visualViewport?.removeEventListener("resize", syncZoomState);
      window.visualViewport?.removeEventListener("scroll", syncZoomState);
    };
  }, [isMobile]);

  const handleQuickFlip = () => {
    const flipApi = flipBookRef.current?.pageFlip?.();
    if (flipApi) {
      flipApi.turnToNextPage();
    }
    setShowQuickFlipButton(false);
  };

  const goToPreviousPage = () => {
    const flipApi = flipBookRef.current?.pageFlip?.();
    if (!flipApi || currentPageIndex <= 0) return;

    flipApi.turnToPrevPage();
    setShowQuickFlipButton(false);
  };

  const goToNextPage = () => {
    const flipApi = flipBookRef.current?.pageFlip?.();
    if (!flipApi || currentPageIndex >= PAGES.length - 1) return;

    flipApi.turnToNextPage();
    setShowQuickFlipButton(false);
  };

  const handleMobileTouchStart = (event) => {
    if (!isMobile) return;

    if (isZoomed) {
      touchGestureRef.current = {
        startX: 0,
        startY: 0,
        tracking: false,
        multiTouch: false,
      };
      return;
    }

    if (event.touches.length !== 1) {
      touchGestureRef.current = {
        startX: 0,
        startY: 0,
        tracking: false,
        multiTouch: true,
      };
      return;
    }

    const touch = event.touches[0];
    touchGestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      tracking: true,
      multiTouch: false,
    };
  };

  const handleMobileTouchMove = (event) => {
    if (!isMobile) return;

    if (isZoomed || event.touches.length > 1) {
      touchGestureRef.current.multiTouch = true;
      touchGestureRef.current.tracking = false;
    }
  };

  const handleMobileTouchEnd = (event) => {
    if (!isMobile) return;

    const gesture = touchGestureRef.current;

    if (
      isZoomed ||
      !gesture.tracking ||
      gesture.multiTouch ||
      event.changedTouches.length !== 1
    ) {
      touchGestureRef.current = {
        startX: 0,
        startY: 0,
        tracking: false,
        multiTouch: false,
      };
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    const minSwipeDistance = 60;

    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < 50) {
      const viewportMidpoint = viewport.width / 2;

      if (gesture.startX >= viewportMidpoint) {
        goToNextPage();
      } else {
        goToPreviousPage();
      }
    }

    touchGestureRef.current = {
      startX: 0,
      startY: 0,
      tracking: false,
      multiTouch: false,
    };
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
              <div
                className="relative flex flex-col items-center gap-4"
                style={{
                  touchAction: isMobile ? "auto" : undefined,
                }}
                onTouchStart={handleMobileTouchStart}
                onTouchMove={handleMobileTouchMove}
                onTouchEnd={handleMobileTouchEnd}
              >
                <HTMLFlipBook
                  key={isMobile ? "mobile" : "desktop"}
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
                  style={{
                    backgroundColor: "transparent",
                    touchAction: isMobile ? "auto" : "pan-y",
                  }}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={900}
                  usePortrait={isMobile}
                  startZIndex={0}
                  autoSize={true}
                  clickEventForward={true}
                  useMouseEvents={!isMobile}
                  swipeDistance={isMobile ? 60 : 30}
                  showPageCorners={true}
                  disableFlipByClick={isMobile}
                  onInit={(event) => setCurrentPageIndex(event.data.page)}
                  onFlip={(event) => setCurrentPageIndex(event.data)}
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
                {isMobile && (
                  <div className="flex items-center gap-3 absolute bottom-0 z-20 pointer-events-auto">
                    <button
                      type="button"
                      onClick={goToPreviousPage}
                      disabled={currentPageIndex <= 0}
                      className="rounded-full bg-stone-900/80 px-4 py-2 text-sm text-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={goToNextPage}
                      disabled={currentPageIndex >= PAGES.length - 1}
                      className="rounded-full bg-stone-900/80 px-4 py-2 text-sm text-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Flipbook;
