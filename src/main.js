import './style.css'
import birdUpSrc from './assets/birds/yellowbird-upflap.png'
import birdMidSrc from './assets/birds/yellowbird-midflap.png'
import birdDownSrc from './assets/birds/yellowbird-downflap.png'
import pipeSrc from './assets/pipe/pipe-green.png'
import messageSrc from './assets/message/message.png'
import gameOverSrc from './assets/message/gameover.png'
import { PLAYER_1, SYSTEM } from '@rcade/plugin-input-classic'
import { Game } from './game/game.js'
import { Bird } from './game/bird.js'
import { PipeSystem } from './game/pipes.js'
import { loadImage, loadImages } from './utils/assets.js'
import { GAME_HEIGHT, GAME_WIDTH, PIPE_SCORE_OFFSET } from './constants.js'

const STATE_START = 'start'
const STATE_PLAYING = 'playing'
const STATE_GAME_OVER = 'game_over'

async function init() {
  const app = document.querySelector('#app')
  const canvas = document.createElement('canvas')
  app.innerHTML = ''
  app.appendChild(canvas)

  const [frames, pipeImage, messageImage, gameOverImage] = await Promise.all([
    loadImages([birdUpSrc, birdMidSrc, birdDownSrc]),
    loadImages([pipeSrc]),
    loadImage(messageSrc),
    loadImage(gameOverSrc),
  ])

  let gameState = STATE_START
  let score = 0
  let best = 0

  const bird = new Bird(frames, {
    y: GAME_HEIGHT * 0.35,
  })

  const pipes = new PipeSystem(pipeImage[0], {
    scale: 0.96,
    scoreOffset: PIPE_SCORE_OFFSET,
  })
  const resetToStart = () => {
    gameState = STATE_START
    score = 0
    pipes.reset()
    pipes.active = false
    bird.reset(GAME_HEIGHT * 0.35)
    bird.setPhysicsEnabled(false)
  }

  const game = new Game(canvas)
  game.addEntity(bird)
  game.addEntity(pipes)
  game.setInputHandler(() => {
    const aPressed = PLAYER_1.A
    const startPressed = SYSTEM.ONE_PLAYER

    // Start with A from start screen
    if (gameState === STATE_START && aPressed && !game._prevAPressed) {
      startGame()
    }

    // Restart to start screen with 1P after game over
    if (gameState === STATE_GAME_OVER && startPressed && !game._prevStartPressed) {
      resetToStart()
    }

    // Flap on A during play
    if (gameState === STATE_PLAYING && aPressed && !game._prevAPressed) {
      bird.flap()
    }

    game._prevAPressed = aPressed
    game._prevStartPressed = startPressed
  })
  game.setCollisionHandler(() => {
    if (gameState !== STATE_PLAYING) return

    const gained = pipes.scoreIfPassed(bird)
    if (gained > 0) score += gained

    if (pipes.collidesWith(bird)) {
      gameOver()
    }
  })
  game.setOverlayRenderer((ctx) => {
    if (gameState === STATE_START) {
      const msgScale = 0.9
      const w = messageImage.width * msgScale
      const h = messageImage.height * msgScale
      const x = (GAME_WIDTH - w) / 2
      const y = (GAME_HEIGHT - h) / 2 + 6
      ctx.drawImage(messageImage, x, y, w, h)

      drawTextOutlined(ctx, 'Press A to start', GAME_WIDTH / 2, GAME_HEIGHT - 36, {
        fill: '#f6f7fb',
      })
    } else if (gameState === STATE_PLAYING) {
      drawTextOutlined(ctx, `Score: ${score}`, GAME_WIDTH / 2, 24, {
        font: 'bold 18px sans-serif',
        fill: '#f6f7fb',
      })
    } else if (gameState === STATE_GAME_OVER) {
      const overScale = 0.9
      const w = gameOverImage.width * overScale
      const h = gameOverImage.height * overScale
      const x = (GAME_WIDTH - w) / 2
      const y = (GAME_HEIGHT - h) / 2 - 22
      ctx.drawImage(gameOverImage, x, y, w, h)

      drawTextOutlined(ctx, `Score: ${score}`, GAME_WIDTH / 2, y + h + 18, {
        font: 'bold 18px sans-serif',
        fill: '#f6f7fb',
      })
      drawTextOutlined(ctx, `Best: ${best}`, GAME_WIDTH / 2, y + h + 36, {
        font: 'bold 14px sans-serif',
        fill: '#d7deea',
      })
      drawTextOutlined(ctx, 'Press 1P to restart', GAME_WIDTH / 2, GAME_HEIGHT - 42, {
        font: 'bold 16px sans-serif',
        fill: '#f6f7fb',
      })
    }
  })
  game.start()

  // Initialize to start screen state
  resetToStart()

  function startGame() {
    score = 0
    gameState = STATE_PLAYING
    pipes.reset()
    pipes.active = true
    bird.reset(GAME_HEIGHT * 0.35)
    bird.setPhysicsEnabled(true)
    bird.flap()
  }

  function gameOver() {
    gameState = STATE_GAME_OVER
    pipes.active = false
    bird.freeze()
    best = Math.max(best, score)
  }
}

function drawTextOutlined(ctx, text, x, y, options = {}) {
  const { font = 'bold 16px sans-serif', fill = '#f6f7fb', stroke = '#0a0c14', strokeWidth = 3 } =
    options
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = stroke
  ctx.fillStyle = fill
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
}

init().catch((err) => {
  console.error('Failed to load assets', err)
})
