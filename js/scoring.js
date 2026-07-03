// scoring.js — turn zoom level + guess accuracy into points.

export const MAX_POINTS = 1000;
export const MAX_SCALE = 8; // most zoomed-in (start of every round)
export const MIN_SCALE = 1; // fully zoomed-out (whole image visible)

// Fraction of points still available at the current zoom scale.
// Full zoom (scale=8) -> 1.0 ; fully out (scale=1) -> 0.1.
export function zoomMultiplier(scale) {
  const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
  return 0.1 + 0.9 * ((clamped - MIN_SCALE) / (MAX_SCALE - MIN_SCALE));
}

// Points a correct/partial guess would earn right now.
export function scoreFor(scale, accuracy) {
  return Math.round(MAX_POINTS * zoomMultiplier(scale) * accuracy);
}

// The maximum points still on the table at this zoom (assuming a perfect guess).
export function potentialPoints(scale) {
  return scoreFor(scale, 1);
}
