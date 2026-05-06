import { create } from "zustand";
import { streamingData } from "../data/streaming";

const arrayStreaming = streamingData.map((item) => item.id);
const streamingById = streamingData.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

const getStreamingById = (id) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 0) return null;
  return streamingById[numericId] || null;
};

const initialStreaming = getStreamingById(1) || streamingData[0] || null;

export const useStreamingStore = create((set) => ({
  arrayStreaming,
  streamingData: initialStreaming,
  currentStreamingId: initialStreaming?.id ?? 1,
  setStreamingById: (id) => {
    const nextStreaming = getStreamingById(id);
    if (!nextStreaming) return;
    set((state) => {
      if (state.currentStreamingId === nextStreaming.id) return state;
      return {
        streamingData: nextStreaming,
        currentStreamingId: nextStreaming.id,
      };
    });
  },
}));
