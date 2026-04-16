const sharedCaches = new Map();

const buildCacheKey = (cacheKey, totalFrames) => `${cacheKey}::${totalFrames}`;

export class SequenceFrameCache {
  constructor(totalFrames, getFrameSrc, maxEntries = 80) {
    this.totalFrames = totalFrames;
    this.getFrameSrc = getFrameSrc;
    this.maxEntries = maxEntries;
    this.records = new Map();
  }

  getCached(index) {
    const clampedIndex = this.clamp(index);
    const record = this.records.get(clampedIndex);

    if (!record || record.status !== "loaded") {
      return null;
    }

    record.lastAccessedAt = performance.now();
    return record.image;
  }

  load(index) {
    const clampedIndex = this.clamp(index);
    const existing = this.records.get(clampedIndex);

    if (existing?.status === "loaded") {
      existing.lastAccessedAt = performance.now();
      return Promise.resolve(existing.image);
    }

    if (existing?.promise) {
      existing.lastAccessedAt = performance.now();
      return existing.promise;
    }

    const image = new Image();
    image.decoding = "async";
    image.src = this.getFrameSrc(clampedIndex);

    const promise = new Promise((resolve, reject) => {
      image.onload = () => {
        const record = this.records.get(clampedIndex);
        if (record) {
          record.status = "loaded";
          record.promise = null;
          record.lastAccessedAt = performance.now();
        }
        this.evictIfNeeded(clampedIndex);
        resolve(image);
      };

      image.onerror = () => {
        const record = this.records.get(clampedIndex);
        if (record) {
          record.status = "error";
          record.promise = null;
          record.lastAccessedAt = performance.now();
        }
        reject(new Error(`Failed to load frame ${clampedIndex}`));
      };
    });

    this.records.set(clampedIndex, {
      image,
      status: "loading",
      promise,
      lastAccessedAt: performance.now(),
    });

    return promise;
  }

  preloadWindow(centerIndex, radius, priorityBias = 0) {
    const tasks = [];
    const indices = this.buildWindow(centerIndex, radius, priorityBias);

    indices.forEach((index) => {
      tasks.push(this.load(index).catch(() => null));
    });

    return Promise.all(tasks);
  }

  findNearestLoaded(index, radius = 6) {
    const clampedIndex = this.clamp(index);
    const direct = this.getCached(clampedIndex);
    if (direct) return direct;

    for (let offset = 1; offset <= radius; offset += 1) {
      const before = this.getCached(clampedIndex - offset);
      if (before) return before;

      const after = this.getCached(clampedIndex + offset);
      if (after) return after;
    }

    return null;
  }

  buildWindow(centerIndex, radius, priorityBias) {
    const clampedCenter = this.clamp(centerIndex);
    const indices = [clampedCenter];
    const direction = Math.sign(priorityBias || 1);

    for (let offset = 1; offset <= radius; offset += 1) {
      const preferred = clampedCenter + offset * direction;
      const secondary = clampedCenter - offset * direction;

      if (preferred >= 0 && preferred < this.totalFrames) {
        indices.push(preferred);
      }

      if (
        secondary >= 0 &&
        secondary < this.totalFrames &&
        secondary !== preferred
      ) {
        indices.push(secondary);
      }
    }

    return indices;
  }

  evictIfNeeded(preserveIndex) {
    if (this.records.size <= this.maxEntries) return;

    const loadedEntries = [...this.records.entries()]
      .filter(
        ([index, record]) =>
          record.status === "loaded" && index !== preserveIndex,
      )
      .sort((a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt);

    while (this.records.size > this.maxEntries && loadedEntries.length > 0) {
      const [index] = loadedEntries.shift();
      this.records.delete(index);
    }
  }

  clamp(index) {
    return Math.max(0, Math.min(this.totalFrames - 1, index));
  }
}

export const getSharedSequenceFrameCache = ({
  cacheKey,
  totalFrames,
  getFrameSrc,
  maxEntries,
}) => {
  const key = buildCacheKey(cacheKey, totalFrames);

  if (!sharedCaches.has(key)) {
    sharedCaches.set(
      key,
      new SequenceFrameCache(totalFrames, getFrameSrc, maxEntries),
    );
  }

  return sharedCaches.get(key);
};
