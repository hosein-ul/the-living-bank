export const EASINGS = {
  stamp: [0.16, 1, 0.3, 1] as const,
  slam: [0.7, 0, 0.84, 0] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
  linear: [0, 0, 1, 1] as const,
};

export const DURATIONS = {
  fast: 0.12, // 120ms
  slam: 0.24, // 240ms
  scene: 0.42, // 420ms
  stamp: 0.64, // 640ms
  stream: 0.9, // 900ms
};
