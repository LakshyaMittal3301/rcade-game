import { GAME_HEIGHT, GAME_WIDTH, GROUND_HEIGHT } from '../constants.js'

export class Background {
  constructor(imageOrVideo) {
    this.imageOrVideo = imageOrVideo
  }

  draw(ctx) {
    if (!this.imageOrVideo) return
    ctx.save()
    const targetHeight = GAME_HEIGHT - GROUND_HEIGHT
    const sourceW = this.imageOrVideo.videoWidth || this.imageOrVideo.width
    const sourceH = this.imageOrVideo.videoHeight || this.imageOrVideo.height
    // Slightly smaller scale so we tile more copies across
    const scale = (targetHeight / sourceH) * 0.65
    const tileSize = Math.ceil(sourceW * scale)
    const cols = Math.ceil(GAME_WIDTH / tileSize) + 2
    const rows = Math.ceil(targetHeight / tileSize) + 2

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const x = col * tileSize
        const y = row * tileSize
        ctx.drawImage(this.imageOrVideo, x, y, tileSize + 1, tileSize + 1)
      }
    }
    ctx.restore()
  }
}

export class Base {
  constructor(image, speed = 0) {
    this.image = image
    this.offset = 0
    this.speed = speed
    this.active = true
    this.targetHeight = GROUND_HEIGHT
    this.scale = this.targetHeight / this.image.height
    this.tileWidth = Math.ceil(this.image.width * this.scale)
  }

  update(dt) {
    if (!this.active) return
    this.offset = (this.offset - this.speed * dt) % this.tileWidth
    if (this.offset < -this.tileWidth) {
      this.offset += this.tileWidth
    }
  }

  draw(ctx) {
    const y = GAME_HEIGHT - this.targetHeight
    const tileWidth = this.tileWidth
    const tiles = Math.ceil(GAME_WIDTH / tileWidth) + 2
    let xStart = this.offset % tileWidth
    if (xStart > 0) xStart -= tileWidth

    ctx.save()
    for (let i = 0; i < tiles; i++) {
      const x = xStart + i * tileWidth
      ctx.drawImage(this.image, x, y, tileWidth + 1, this.targetHeight)
    }
    ctx.restore()
  }

  setActive(active) {
    this.active = active
  }
}
