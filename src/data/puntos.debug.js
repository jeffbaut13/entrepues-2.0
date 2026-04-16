import {
  VIDEO_SCROLL_CHECKPOINT_DEBUG,
  VIDEO_SCROLL_TIMELINE,
  frameToTime,
  timeToFrame,
} from "./puntos";

export const DEBUG_SAMPLE_STEP_SECONDS = 1;

export const buildTimelineDebugRows = (stepSeconds = DEBUG_SAMPLE_STEP_SECONDS) => {
  const rows = [];

  for (let second = 0; second <= VIDEO_SCROLL_TIMELINE.durationSeconds; second += stepSeconds) {
    rows.push({
      time: Number(second.toFixed(2)),
      frame: timeToFrame(second),
    });
  }

  return rows;
};

export const logVideoScrollDebugTables = () => {
  console.groupCollapsed("[VideoScroll][Debug] Checkpoints");
  console.table(VIDEO_SCROLL_CHECKPOINT_DEBUG);
  console.groupEnd();

  console.groupCollapsed("[VideoScroll][Debug] Time <-> Frame (1s)");
  console.table(buildTimelineDebugRows(1));
  console.groupEnd();

  console.groupCollapsed("[VideoScroll][Debug] Frame <-> Time (sample)");
  console.table([
    { frame: 0, time: Number(frameToTime(0).toFixed(2)) },
    {
      frame: Math.round(VIDEO_SCROLL_TIMELINE.frameCount / 2),
      time: Number(frameToTime(Math.round(VIDEO_SCROLL_TIMELINE.frameCount / 2)).toFixed(2)),
    },
    {
      frame: VIDEO_SCROLL_TIMELINE.frameCount - 1,
      time: Number(frameToTime(VIDEO_SCROLL_TIMELINE.frameCount - 1).toFixed(2)),
    },
  ]);
  console.groupEnd();
};
