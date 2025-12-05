import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_HEIGHT,
  PIPE_GAP_MAX,
  PIPE_GAP_MIN,
  PIPE_SPEED,
  PIPE_SPAWN_INTERVAL,
  PIPE_VERTICAL_MARGIN,
} from '../constants.js'

export class PipeSystem {
  constructor(pipeImage, options = {}) {
    this.pipeImage = pipeImage
    this.pipeWidth = pipeImage.width
    this.pipeHeight = pipeImage.height
    this.scale = options.scale ?? 1
    this.scaledWidth = this.pipeWidth * this.scale
    this.speed = options.speed ?? PIPE_SPEED
    this.spawnInterval = options.spawnInterval ?? PIPE_SPAWN_INTERVAL
    this.gapMin = options.gapMin ?? PIPE_GAP_MIN
    this.gapMax = options.gapMax ?? PIPE_GAP_MAX
    this.margin = options.margin ?? PIPE_VERTICAL_MARGIN
    this.scoreOffset = options.scoreOffset ?? 0

    this.pipes = []
    this.timeSinceLastSpawn = 0
  }

  update(dt) {
    this.timeSinceLastSpawn += dt
    if (this.timeSinceLastSpawn >= this.spawnInterval) {
      this.spawnPipePair()
      this.timeSinceLastSpawn = 0
    }

    this.pipes.forEach((pipe) => {
      pipe.x -= this.speed * dt
    })

    this.pipes = this.pipes.filter(
      (pipe) => pipe.x + this.scaledWidth > 0
    )
  }

  spawnPipePair() {
    const gapSize = randomInRange(this.gapMin, this.gapMax)
    const maxY = GAME_HEIGHT - GROUND_HEIGHT - this.margin - gapSize / 2
    const minY = this.margin + gapSize / 2
    const gapY = randomInRange(minY, maxY)

    this.pipes.push({
      x: GAME_WIDTH + this.scaledWidth,
      gapY,
      gapSize,
      scored: false,
    })
  }

  draw(ctx) {
    const w = this.scaledWidth

    this.pipes.forEach((pipe) => {
      // Top pipe (flipped)
      const topHeight = pipe.gapY - pipe.gapSize / 2
      ctx.save()
      ctx.translate(pipe.x + w / 2, topHeight)
      ctx.scale(1, -1)
      ctx.drawImage(this.pipeImage, -w / 2, 0, w, topHeight)
      ctx.restore()

      // Bottom pipe
      const bottomY = pipe.gapY + pipe.gapSize / 2
      const bottomHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomY
      ctx.drawImage(this.pipeImage, pipe.x, bottomY, w, bottomHeight)
    })
  }

  collidesWith(bird) {
    const birdBox = bird.getAABB()
    return this.pipes.some((pipe) => {
      const w = this.scaledWidth
      const topHeight = pipe.gapY - pipe.gapSize / 2
      const bottomY = pipe.gapY + pipe.gapSize / 2
      const topRect = { x: pipe.x, y: 0, w, h: topHeight }
      const bottomRect = {
        x: pipe.x,
        y: bottomY,
        w,
        h: GAME_HEIGHT - GROUND_HEIGHT - bottomY,
      }
      return rectsOverlap(birdBox, topRect) || rectsOverlap(birdBox, bottomRect)
    })
  }

  scoreIfPassed(bird) {
    const w = this.scaledWidth
    let gained = 0
    this.pipes.forEach((pipe) => {
      if (!pipe.scored && bird.x > pipe.x + w - this.scoreOffset) {
        pipe.scored = true
        gained += 1
      }
    })
    return gained
  }
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min
}
