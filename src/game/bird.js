import { GAME_HEIGHT, GAME_WIDTH, GROUND_HEIGHT } from '../constants.js'

const DEFAULTS = {
  frameDuration: 0.12,
  bobAmplitude: 0,
  bobSpeed: 0,
  scale: 1.2,
  gravity: 520, // px/s^2
  flapImpulse: -230, // px/s
  rotationFactor: 0.0025, // radians per px/s
  maxRotationDeg: 60,
}

const degToRad = (deg) => (deg * Math.PI) / 180

export class Bird {
  constructor(frames, options = {}) {
    this.frames = frames
    this.frameIndex = 0
    this.frameTimer = 0
    this.frameDuration = options.frameDuration ?? DEFAULTS.frameDuration

    this.scale = options.scale ?? DEFAULTS.scale
    this.spriteWidth = frames[0].width
    this.spriteHeight = frames[0].height
    this.drawWidth = this.spriteWidth * this.scale
    this.drawHeight = this.spriteHeight * this.scale

    this.x = options.x ?? GAME_WIDTH * 0.3
    this.y = options.y ?? GAME_HEIGHT * 0.4
    this.vy = options.vy ?? 0
    this.gravity = options.gravity ?? DEFAULTS.gravity
    this.flapImpulse = options.flapImpulse ?? DEFAULTS.flapImpulse

    this.rotation = 0
    this.rotationFactor = options.rotationFactor ?? DEFAULTS.rotationFactor
    this.maxRotation = degToRad(options.maxRotationDeg ?? DEFAULTS.maxRotationDeg)

    this.groundY = options.groundY ?? GAME_HEIGHT - GROUND_HEIGHT
    this.ceilingY = options.ceilingY ?? 0

    this._halfW = this.drawWidth / 2
    this._halfH = this.drawHeight / 2
  }

  update(dt) {
    // Animate wings
    this.frameTimer += dt
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer -= this.frameDuration
      this.frameIndex = (this.frameIndex + 1) % this.frames.length
    }

    // Apply gravity
    this.vy += this.gravity * dt
    this.y += this.vy * dt

    // Constrain to world bounds
    const halfH = this._halfH
    if (this.y + halfH >= this.groundY) {
      this.y = this.groundY - halfH
      this.vy = 0
    }
    if (this.y - halfH <= this.ceilingY) {
      this.y = this.ceilingY + halfH
      this.vy = 0
    }

    // Tilt bird based on vertical speed
    this.rotation = clamp(
      this.vy * this.rotationFactor,
      -this.maxRotation,
      this.maxRotation
    )
  }

  flap() {
    this.vy = this.flapImpulse
  }

  draw(ctx) {
    const sprite = this.frames[this.frameIndex]
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.drawImage(
      sprite,
      -this.drawWidth / 2,
      -this.drawHeight / 2,
      this.drawWidth,
      this.drawHeight
    )
    ctx.restore()
  }

  getAABB() {
    return {
      x: this.x - this._halfW,
      y: this.y - this._halfH,
      w: this.drawWidth,
      h: this.drawHeight,
    }
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
