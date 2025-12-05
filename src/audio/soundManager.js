export class SoundManager {
  constructor(sources = {}) {
    this.sounds = {}
    Object.entries(sources).forEach(([key, src]) => {
      const audio = new Audio(src)
      audio.preload = 'auto'
      this.sounds[key] = audio
    })
  }

  play(name) {
    const base = this.sounds[name]
    if (!base) return
    try {
      const instance = base.cloneNode(true)
      instance.currentTime = 0
      instance.play()
    } catch (err) {
      // Ignore play errors (e.g., without user gesture)
      console.warn('Audio play failed', name, err)
    }
  }
}
