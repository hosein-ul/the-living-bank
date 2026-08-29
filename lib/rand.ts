/**
 * Mulberry32 seeded pseudo-random number generator
 * Seed 1848 per §5 spec for reproducible sessions and honest cards
 */
export function mulberry32(seed: number = 1848) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const defaultRng = mulberry32(1848);
