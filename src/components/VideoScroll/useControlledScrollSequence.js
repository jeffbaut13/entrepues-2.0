import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const easingMap = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2,
};

const clampFrame = (frame, totalFrames) =>
  Math.max(0, Math.min(totalFrames - 1, frame));

export const useControlledScrollSequence = ({
  totalFrames,
  stepFrames = 12,
  transitionDuration = 350,
  cooldownMs = 200,
  wheelThreshold = 30,
  reducedMotion = false,
  initialFrame = 0,
  easing = "easeInOutCubic",
  resolveTargetFrame,
  onFrameChange,
  onStepAccepted,
  onStateChange,
}) => {
  const [currentFrame, setCurrentFrame] = useState(() =>
    clampFrame(initialFrame, totalFrames),
  );
  const [state, setState] = useState("idle");

  const currentFrameRef = useRef(clampFrame(initialFrame, totalFrames));
  const animationFrameRef = useRef(null);
  const cooldownTimeoutRef = useRef(null);
  const touchStartYRef = useRef(0);
  const currentStateRef = useRef("idle");

  const updateFrame = useCallback(
    (frame) => {
      const next = clampFrame(frame, totalFrames);
      if (next === currentFrameRef.current) return;

      currentFrameRef.current = next;
      setCurrentFrame(next);
      onFrameChange?.(next);
    },
    [onFrameChange, totalFrames],
  );

  const updateState = useCallback(
    (nextState) => {
      if (currentStateRef.current === nextState) return;
      currentStateRef.current = nextState;
      setState(nextState);
      onStateChange?.(nextState);
    },
    [onStateChange],
  );

  const finishCooldown = useCallback(() => {
    cooldownTimeoutRef.current = null;
    updateState("idle");
  }, [updateState]);

  const beginCooldown = useCallback(() => {
    updateState("cooldown");
    if (cooldownTimeoutRef.current) {
      window.clearTimeout(cooldownTimeoutRef.current);
    }
    cooldownTimeoutRef.current = window.setTimeout(finishCooldown, cooldownMs);
  }, [cooldownMs, finishCooldown, updateState]);

  const animateToFrame = useCallback(
    (targetFrame) => {
      const fromFrame = currentFrameRef.current;
      const toFrame = clampFrame(targetFrame, totalFrames);

      if (fromFrame === toFrame) {
        beginCooldown();
        return;
      }

      if (reducedMotion || transitionDuration <= 0) {
        updateFrame(toFrame);
        beginCooldown();
        return;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      updateState("animating");
      const startedAt = performance.now();

      const tick = (now) => {
        const elapsed = now - startedAt;
        const progress = Math.min(elapsed / transitionDuration, 1);
        const easeFn = easingMap[easing] || easingMap.easeInOutCubic;
        const eased = easeFn(progress);
        const frame = Math.round(fromFrame + (toFrame - fromFrame) * eased);

        updateFrame(frame);

        if (progress >= 1) {
          animationFrameRef.current = null;
          updateFrame(toFrame);
          beginCooldown();
          return;
        }

        animationFrameRef.current = requestAnimationFrame(tick);
      };

      animationFrameRef.current = requestAnimationFrame(tick);
    },
    [
      beginCooldown,
      reducedMotion,
      totalFrames,
      transitionDuration,
      easing,
      updateFrame,
      updateState,
    ],
  );

  const acceptDirection = useCallback(
    (direction) => {
      if (currentStateRef.current !== "idle") return false;

      const fromFrame = currentFrameRef.current;
      const resolvedTarget =
        typeof resolveTargetFrame === "function"
          ? resolveTargetFrame({
              direction,
              fromFrame,
              stepFrames,
              totalFrames,
            })
          : fromFrame + direction * stepFrames;

      const nextFrame = clampFrame(resolvedTarget, totalFrames);

      onStepAccepted?.({
        direction,
        fromFrame,
        toFrame: nextFrame,
      });
      animateToFrame(nextFrame);
      return true;
    },
    [
      animateToFrame,
      onStepAccepted,
      resolveTargetFrame,
      stepFrames,
      totalFrames,
    ],
  );

  const handleWheelIntent = useCallback(
    (deltaY) => {
      if (Math.abs(deltaY) < wheelThreshold) return false;
      return acceptDirection(deltaY > 0 ? 1 : -1);
    },
    [acceptDirection, wheelThreshold],
  );

  const touchHandlers = useMemo(
    () => ({
      onTouchStart: (event) => {
        touchStartYRef.current = event.touches[0]?.clientY ?? 0;
      },
      onTouchEnd: (event) => {
        const deltaY =
          touchStartYRef.current - (event.changedTouches[0]?.clientY ?? 0);
        if (Math.abs(deltaY) < wheelThreshold) return false;
        return acceptDirection(deltaY > 0 ? 1 : -1);
      },
    }),
    [acceptDirection, wheelThreshold],
  );

  const jumpToFrame = useCallback(
    (frame, options) => {
      const target = clampFrame(frame, totalFrames);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (cooldownTimeoutRef.current) {
        window.clearTimeout(cooldownTimeoutRef.current);
        cooldownTimeoutRef.current = null;
      }

      if (options?.immediate || reducedMotion) {
        updateFrame(target);
        updateState("idle");
        return;
      }

      animateToFrame(target);
    },
    [animateToFrame, reducedMotion, totalFrames, updateFrame, updateState],
  );

  useEffect(() => {
    onFrameChange?.(currentFrameRef.current);
  }, [onFrameChange]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (cooldownTimeoutRef.current) {
        window.clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentFrame,
    state,
    handleWheelIntent,
    touchHandlers,
    jumpToFrame,
    currentFrameRef,
  };
};
