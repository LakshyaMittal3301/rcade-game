import { GAME_HEIGHT, GAME_WIDTH, GROUND_HEIGHT } from '../constants.js'

export class Background {
  constructor(image) {
    this.image = image
  }

  draw(ctx) {
    ctx.save()
    const targetHeight = GAME_HEIGHT - GROUND_HEIGHT
    const scale = targetHeight / this.image.height
    const tileWidth = Math.ceil(this.image.width * scale)
    const tiles = Math.ceil(GAME_WIDTH / tileWidth) + 2

    // Slight overlap to hide seams between tiles
    for (let i = -1; i < tiles; i++) {
      const x = i * tileWidth
      ctx.drawImage(this.image, x, 0, tileWidth + 1, targetHeight)
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
