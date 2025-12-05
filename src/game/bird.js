import { GAME_HEIGHT, GAME_WIDTH, GROUND_HEIGHT } from '../constants.js'

const DEFAULTS = {
  frameDuration: 0.06,
  idleBobAmplitude: 6,
  idleBobSpeed: 2,
  scale: 0.86, // ~10% smaller than previous
  gravity: 750, // px/s^2 (heavier fall)
  flapImpulse: -280, // px/s (snappier lift to match gravity)
  rotationFactor: 0.0025, // radians per px/s
  maxRotationDeg: 60,
  collisionPaddingX: 3,
  collisionPaddingY: 2,
  trailRepeatCount: 4,
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
    this.collisionPaddingX = options.collisionPaddingX ?? DEFAULTS.collisionPaddingX
    this.collisionPaddingY = options.collisionPaddingY ?? DEFAULTS.collisionPaddingY

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

    this.physicsEnabled = true
    this.idleBobAmplitude = options.idleBobAmplitude ?? DEFAULTS.idleBobAmplitude
    this.idleBobSpeed = options.idleBobSpeed ?? DEFAULTS.idleBobSpeed
    this.idleBaseY = this.y
    this.idlePhase = 0
    this.frozen = false

    // Optional trailing animation (e.g., rainbow)
    this.trailFrames = options.trailFrames ?? null
    if (this.trailFrames && this.trailFrames.length > 0) {
      this.trailFrameIndex = 0
      this.trailFrameTimer = 0
      this.trailFrameDuration = options.trailFrameDuration ?? this.frameDuration
      const trailBase = this.trailFrames[0]
      this.trailScale = options.trailScale ?? this.scale
      this.trailWidth = trailBase.width * this.trailScale
      this.trailHeight = trailBase.height * this.trailScale
      this.trailOffsetX =
        options.trailOffsetX ?? -(this.drawWidth * 0.9 + this.trailWidth * 0.2)
      this.trailOffsetY = options.trailOffsetY ?? 0
      this.trailRepeatCount = options.trailRepeatCount ?? DEFAULTS.trailRepeatCount
      this.trailSpacing =
        options.trailSpacing ?? -(this.trailWidth * 0.85) // negative = to the left
    }
  }

  update(dt) {
    if (this.frozen) return

    // Animate wings
    this.frameTimer += dt
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer -= this.frameDuration
      this.frameIndex = (this.frameIndex + 1) % this.frames.length
    }

    if (this.trailFrames && this.trailFrames.length > 1) {
      this.trailFrameTimer += dt
      if (this.trailFrameTimer >= this.trailFrameDuration) {
        this.trailFrameTimer -= this.trailFrameDuration
        this.trailFrameIndex = (this.trailFrameIndex + 1) % this.trailFrames.length
      }
    }

    if (this.physicsEnabled) {
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

      // Tilt based on velocity
      this.rotation = clamp(
        this.vy * this.rotationFactor,
        -this.maxRotation,
        this.maxRotation
      )
    } else {
      // Idle bobbing without physics
      this.idlePhase += dt * this.idleBobSpeed
      this.y = this.idleBaseY + Math.sin(this.idlePhase) * this.idleBobAmplitude
      this.rotation = 0
    }
  }

  flap() {
    this.vy = this.flapImpulse
  }

  draw(ctx) {
    const sprite = this.frames[this.frameIndex]
    ctx.save()
    ctx.translate(this.x, this.y)

    // Draw trails without rotation so the ribbon stays horizontal
    if (this.trailFrames && this.trailFrames.length > 0) {
      const trailSprite = this.trailFrames[this.trailFrameIndex]
      for (let i = 0; i < this.trailRepeatCount; i += 1) {
        const offsetX = this.trailOffsetX + this.trailSpacing * i
        ctx.drawImage(
          trailSprite,
          -this.trailWidth / 2 + offsetX,
          -this.trailHeight / 2 + this.trailOffsetY,
          this.trailWidth,
          this.trailHeight
        )
      }
    }

    // Draw cat with its rotation
    ctx.save()
    ctx.rotate(this.rotation)
    ctx.drawImage(
      sprite,
      -this.drawWidth / 2,
      -this.drawHeight / 2,
      this.drawWidth,
      this.drawHeight
    )
    ctx.restore()

    ctx.restore()
  }

  getAABB() {
    return {
      x: this.x - this._halfW + this.collisionPaddingX,
      y: this.y - this._halfH + this.collisionPaddingY,
      w: this.drawWidth - this.collisionPaddingX * 2,
      h: this.drawHeight - this.collisionPaddingY * 2,
    }
  }

  setPhysicsEnabled(enabled) {
    this.physicsEnabled = enabled
    if (!enabled) {
      this.idleBaseY = this.y
      this.idlePhase = 0
      this.vy = 0
    }
  }

  reset(positionY = GAME_HEIGHT * 0.4) {
    this.y = positionY
    this.vy = 0
    this.rotation = 0
    this.physicsEnabled = false
    this.idleBaseY = this.y
    this.idlePhase = 0
    this.frozen = false
  }

  freeze() {
    this.frozen = true
    this.vy = 0
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
