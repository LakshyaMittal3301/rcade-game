export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function loadImages(sources) {
  return Promise.all(sources.map(loadImage))
}

export async function loadGifFrames(src) {
  // Draw animated GIFs by repeatedly drawing the same Image element; browsers
  // advance its internal frames, so we don't need to decode frames manually.
  const [img] = await loadImages([src])
  return [img]
}
