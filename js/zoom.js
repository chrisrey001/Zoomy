// zoom.js — controls the zoom viewport for a single round.
// Renders the image as a background so we can anchor zoom to a random focal point.

import { MAX_SCALE, MIN_SCALE } from "./scoring.js";

export class ZoomView {
  /**
   * @param {HTMLElement} el   the viewport element (square, overflow hidden)
   * @param {(scale:number)=>void} onChange callback when the scale changes
   */
  constructor(el, onChange) {
    this.el = el;
    this.onChange = onChange || (() => {});
    this.scale = MAX_SCALE;
    this.focal = { x: 0.5, y: 0.5 };
  }

  // Load a new round's image, resetting to maximum zoom.
  load(imageUrl, focal) {
    this.focal = focal || { x: 0.5, y: 0.5 };
    this.scale = MAX_SCALE;
    this.el.style.backgroundImage = `url("${imageUrl.replace(/"/g, '%22')}")`;
    this.render();
  }

  render() {
    const pct = this.scale * 100;
    this.el.style.backgroundSize = `${pct}% ${pct}%`;
    // background-position percentage keeps the focal point fixed while zooming
    this.el.style.backgroundPosition = `${this.focal.x * 100}% ${this.focal.y * 100}%`;
    this.el.dataset.scale = String(this.scale);
    this.onChange(this.scale);
  }

  zoomOut() {
    if (this.scale > MIN_SCALE) {
      this.scale -= 1;
      this.render();
      return true;
    }
    return false;
  }

  // Zoom back in, but never past the starting maximum.
  zoomIn() {
    if (this.scale < MAX_SCALE) {
      this.scale += 1;
      this.render();
      return true;
    }
    return false;
  }

  // Reveal the whole image (used on the result screen).
  revealFull() {
    this.scale = MIN_SCALE;
    this.render();
  }

  get atMinZoom() {
    return this.scale <= MIN_SCALE;
  }
  get atMaxZoom() {
    return this.scale >= MAX_SCALE;
  }
}
