// Opt-in helper for sections that overlay text on a photo: samples a decoded
// <img>'s pixel data to decide whether the image reads as visually 'light' or
// 'dark', so a consumer can swap text color instead of assuming a fixed
// light-on-dark treatment. DOM-dependent (canvas), unlike the pure color math
// in ./color.js: only usable in the browser, after the image has loaded.

import { relativeLuminance } from './color'

// Downscales onto a tiny offscreen canvas (cheap regardless of the source
// image's real size) and averages WCAG relative luminance across the sampled
// pixels. Returns null if the canvas can't be read (e.g. a cross-origin image
// served without CORS headers taints the canvas): callers should keep their
// existing default in that case rather than throw.
export function sampleImageTone(imgEl, { sampleSize = 12, threshold = 0.4 } = {}) {
  if (!imgEl || !imgEl.naturalWidth) return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = sampleSize
    canvas.height = sampleSize
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgEl, 0, 0, sampleSize, sampleSize)
    const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize)
    let sum = 0
    let count = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += relativeLuminance({ r: data[i], g: data[i + 1], b: data[i + 2] })
      count++
    }
    return sum / count > threshold ? 'light' : 'dark'
  } catch {
    return null
  }
}

// Loads `src` and resolves the same 'light' | 'dark' | null tone as
// sampleImageTone(), for callers that only have a URL, not a mounted <img>.
export function loadImageTone(src, options) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(sampleImageTone(img, options))
    img.onerror = () => resolve(null)
    img.src = src
  })
}
