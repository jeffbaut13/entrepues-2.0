const FRAME_COUNT = 677;
const FRAME_PREFIX = "/video/recorrido/frames-webp-hq/frame_";
const FRAME_SUFFIX = ".webp";
const DEFAULT_CONCURRENCY = 3;

let preloadPromise = null;
let hasStarted = false;

const getFrameSrc = (frameIndex) =>
  `${FRAME_PREFIX}${String(frameIndex + 1).padStart(4, "0")}${FRAME_SUFFIX}`;

const preloadFrame = (frameIndex) =>
  new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = getFrameSrc(frameIndex);
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });

export const getVideoScrollFrameSrc = getFrameSrc;

export const startVideoScrollFramePreload = ({
  concurrency = DEFAULT_CONCURRENCY,
} = {}) => {
  if (hasStarted) return preloadPromise;

  hasStarted = true;

  preloadPromise = new Promise((resolve) => {
    let nextFrame = 0;
    let activeLoads = 0;

    const pump = () => {
      while (activeLoads < concurrency && nextFrame < FRAME_COUNT) {
        const frameIndex = nextFrame;
        nextFrame += 1;
        activeLoads += 1;

        preloadFrame(frameIndex).finally(() => {
          activeLoads -= 1;

          if (nextFrame >= FRAME_COUNT && activeLoads === 0) {
            resolve();
            return;
          }

          pump();
        });
      }
    };

    pump();
  });

  return preloadPromise;
};

export const scheduleVideoScrollFramePreload = (delayMs = 1500) => {
  const run = () => startVideoScrollFramePreload();

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: delayMs + 2000 });
    return;
  }

  window.setTimeout(run, delayMs);
};
