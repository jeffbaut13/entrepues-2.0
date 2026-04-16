import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControlledScrollSequence } from "./useControlledScrollSequence";
import { getSharedSequenceFrameCache } from "./sequenceFrameCache";

const drawCoverImage = (context, image, canvasWidth, canvasHeight) => {
  const sourceWidth =
    image instanceof HTMLImageElement ? image.naturalWidth : image.width;
  const sourceHeight =
    image instanceof HTMLImageElement ? image.naturalHeight : image.height;

  if (!sourceWidth || !sourceHeight) return;

  const scale = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = (canvasWidth - drawWidth) / 2;
  const drawY = (canvasHeight - drawHeight) / 2;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
};

const noop = () => {};

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
};

export const CanvasScrollSequence = forwardRef(function CanvasScrollSequence(
  {
    totalFrames,
    getFrameSrc,
    stepFrames = 12,
    transitionDuration = 350,
    cooldownMs = 200,
    easing = "easeInOutCubic",
    preloadRadius = 16,
    className,
    wheelThreshold = 30,
    cacheKey = "video-scroll-sequence",
    cacheSize = 80,
    resolveTargetFrame,
    onFrameChange,
    onFrameLoadStateChange,
    onStepAccepted,
    onReady,
  },
  ref,
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const isNearViewportRef = useRef(false);
  const lastDrawnFrameRef = useRef(null);
  const lastCanvasSizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const readyRef = useRef(false);
  const pendingFrameRef = useRef(null);

  const frameCache = useMemo(
    () =>
      getSharedSequenceFrameCache({
        cacheKey,
        totalFrames,
        getFrameSrc,
        maxEntries: cacheSize,
      }),
    [cacheKey, cacheSize, getFrameSrc, totalFrames],
  );

  const drawFrame = useCallback(
    (frame) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const image = frameCache.getCached(frame);

      if (!image) return;

      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;

      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.max(1, Math.round(width * dpr));
      const targetHeight = Math.max(1, Math.round(height * dpr));
      const sizeChanged =
        lastCanvasSizeRef.current.width !== targetWidth ||
        lastCanvasSizeRef.current.height !== targetHeight ||
        lastCanvasSizeRef.current.dpr !== dpr;

      if (sizeChanged) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastCanvasSizeRef.current = {
          width: targetWidth,
          height: targetHeight,
          dpr,
        };
        lastDrawnFrameRef.current = null;
      }

      if (lastDrawnFrameRef.current === frame && !sizeChanged) return;

      drawCoverImage(context, image, width, height);
      lastDrawnFrameRef.current = frame;

      if (!readyRef.current) {
        readyRef.current = true;
        onReady?.();
      }
    },
    [frameCache, onReady, preloadRadius],
  );

  const drawCurrentFrame = useCallback(
    (frame) => {
      const previousFrame = lastDrawnFrameRef.current ?? frame;
      const cachedFrame = frameCache.getCached(frame);

      if (!cachedFrame) {
        pendingFrameRef.current = frame;
        onFrameLoadStateChange?.(true, frame);

        frameCache
          .load(frame)
          .then(() => {
            if (pendingFrameRef.current !== frame) return;
            drawFrame(frame);
            onFrameLoadStateChange?.(false, frame);
          })
          .catch(() => {
            if (pendingFrameRef.current !== frame) return;
            onFrameLoadStateChange?.(false, frame);
          });
      } else {
        pendingFrameRef.current = null;
        onFrameLoadStateChange?.(false, frame);
        drawFrame(frame);
      }
      onFrameChange?.(frame);

      if (isNearViewportRef.current) {
        const priorityBias = frame - previousFrame;
        void frameCache.preloadWindow(frame, preloadRadius, priorityBias);
      }
    },
    [drawFrame, frameCache, onFrameChange, onFrameLoadStateChange, preloadRadius],
  );

  const {
    currentFrame,
    state,
    handleWheelIntent,
    touchHandlers,
    jumpToFrame,
    currentFrameRef,
  } = useControlledScrollSequence({
    totalFrames,
    stepFrames,
    transitionDuration,
    cooldownMs,
    easing,
    wheelThreshold,
    reducedMotion: prefersReducedMotion,
    resolveTargetFrame,
    onFrameChange: drawCurrentFrame,
    onStepAccepted,
  });

  useImperativeHandle(
    ref,
    () => ({
      jumpToFrame,
      getCurrentFrame: () => currentFrameRef.current,
    }),
    [currentFrameRef, jumpToFrame],
  );

  useEffect(() => {
    let cancelled = false;

    frameCache
      .load(0)
      .then(() => {
        if (cancelled) return;
        if (!readyRef.current) {
          readyRef.current = true;
          onReady?.();
        }
        drawFrame(currentFrameRef.current);
        onFrameLoadStateChange?.(false, currentFrameRef.current);
        void frameCache.preloadWindow(currentFrameRef.current, preloadRadius);
      })
      .catch(noop);

    return () => {
      cancelled = true;
    };
  }, [
    drawFrame,
    frameCache,
    onFrameLoadStateChange,
    onReady,
    preloadRadius,
    currentFrameRef,
  ]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (typeof IntersectionObserver === "undefined") {
      isNearViewportRef.current = true;
      void frameCache.preloadWindow(currentFrameRef.current, preloadRadius);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isNearViewportRef.current =
          entry.isIntersecting || entry.intersectionRatio > 0.15;

        if (isNearViewportRef.current) {
          void frameCache.preloadWindow(currentFrameRef.current, preloadRadius);
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: [0, 0.15, 0.4],
      },
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, [frameCache, preloadRadius, currentFrameRef]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleWheel = (event) => {
      if (!isNearViewportRef.current) return;

      const accepted = handleWheelIntent(event.deltaY);
      if (accepted || state !== "idle") {
        event.preventDefault();
      }
    };

    const handleTouchStart = (event) => {
      touchHandlers.onTouchStart(event);
    };

    const handleTouchEnd = (event) => {
      if (!isNearViewportRef.current) return;

      const accepted = touchHandlers.onTouchEnd(event);
      if (accepted || state !== "idle") {
        event.preventDefault();
      }
    };

    root.addEventListener("wheel", handleWheel, { passive: false });
    root.addEventListener("touchstart", handleTouchStart, { passive: true });
    root.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      root.removeEventListener("wheel", handleWheel);
      root.removeEventListener("touchstart", handleTouchStart);
      root.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheelIntent, state, touchHandlers]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(() => {
        drawFrame(currentFrameRef.current);
      });

      resizeObserverRef.current.observe(root);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      window.removeEventListener("resize", handleResize);
    };
  }, [currentFrameRef, drawFrame]);

  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  return (
    <div ref={rootRef} className={className}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
});
