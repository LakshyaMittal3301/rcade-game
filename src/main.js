import './style.css'
import birdUpSrc from './assets/birds/yellowbird-upflap.png'
import birdMidSrc from './assets/birds/yellowbird-midflap.png'
import birdDownSrc from './assets/birds/yellowbird-downflap.png'

const GAME_WIDTH = 336
const GAME_HEIGHT = 262

class Bird {
  constructor(frames) {
    this.frames = frames
    this.frameIndex = 0
    this.frameTimer = 0
    this.frameDuration = 0.12 // seconds per frame

    this.x = GAME_WIDTH * 0.3
    this.baseY = GAME_HEIGHT * 0.5
    this.bobAmplitude = 6
    this.bobSpeed = 2
    this.bobPhase = 0

    this.scale = 1.2
  }

  update(dt) {
    this.frameTimer += dt
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer -= this.frameDuration
      this.frameIndex = (this.frameIndex + 1) % this.frames.length
    }

    this.bobPhase += dt * this.bobSpeed
    this.y = this.baseY + Math.sin(this.bobPhase) * this.bobAmplitude
  }

  draw(ctx) {
    const sprite = this.frames[this.frameIndex]
    const drawWidth = sprite.width * this.scale
    const drawHeight = sprite.height * this.scale
    const drawX = this.x - drawWidth / 2
    const drawY = this.y - drawHeight / 2
    ctx.drawImage(sprite, drawX, drawY, drawWidth, drawHeight)
  }
}

class Game {
  constructor(canvas, bird) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.canvas.width = GAME_WIDTH
    this.canvas.height = GAME_HEIGHT
    this.bird = bird
    this.lastTimestamp = 0
    this.running = false
  }

  start() {
    this.running = true
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
    this.bird.update(dt)
  }

  render() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Background
    ctx.fillStyle = '#0d1b2a'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Ground hint
    ctx.fillStyle = '#1b263b'
    ctx.fillRect(0, this.canvas.height - 32, this.canvas.width, 32)

    // Bird
    this.bird.draw(ctx)

    // Label
    ctx.fillStyle = '#e0e6ed'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Idle animation scaffold', this.canvas.width / 2, 22)
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function init() {
  const app = document.querySelector('#app')
  const canvas = document.createElement('canvas')
  app.innerHTML = ''
  app.appendChild(canvas)

  const frameSources = [birdUpSrc, birdMidSrc, birdDownSrc]
  const frames = await Promise.all(frameSources.map(loadImage))

  const bird = new Bird(frames)
  const game = new Game(canvas, bird)
  game.start()
}

init().catch((err) => {
  console.error('Failed to load assets', err)
})
