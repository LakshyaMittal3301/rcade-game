import { GAME_HEIGHT, GAME_WIDTH, GROUND_HEIGHT } from '../constants.js'

export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.canvas.width = GAME_WIDTH
    this.canvas.height = GAME_HEIGHT

    this.entities = []
    this.running = false
    this.lastTimestamp = 0
    this.inputHandler = null
  }

  addEntity(entity) {
    this.entities.push(entity)
  }

  setInputHandler(handler) {
    this.inputHandler = handler
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTimestamp = performance.now()
    requestAnimationFrame(this.loop.bind(this))
  }

  loop(timestamp) {
    if (!this.running) return
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05)
    this.lastTimestamp = timestamp

    this.update(dt)
    this.render()
    requestAnimationFrame(this.loop.bind(this))
  }

  update(dt) {
    if (this.inputHandler) {
      this.inputHandler(dt)
    }

    this.entities.forEach((entity) => {
      if (entity.update) entity.update(dt)
    })
  }

  render() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Background
    ctx.fillStyle = '#0d1b2a'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Entities
    this.entities.forEach((entity) => {
      if (entity.draw) entity.draw(ctx)
    })

    // Ground strip
    ctx.fillStyle = '#1b263b'
    ctx.fillRect(0, this.canvas.height - GROUND_HEIGHT, this.canvas.width, GROUND_HEIGHT)
  }
}
