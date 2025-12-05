import './style.css'
import birdUpSrc from './assets/birds/yellowbird-upflap.png'
import birdMidSrc from './assets/birds/yellowbird-midflap.png'
import birdDownSrc from './assets/birds/yellowbird-downflap.png'
import pipeSrc from './assets/pipe/pipe-green.png'
import messageSrc from './assets/message/message.png'
import { PLAYER_1 } from '@rcade/plugin-input-classic'
import { Game } from './game/game.js'
import { Bird } from './game/bird.js'
import { PipeSystem } from './game/pipes.js'
import { loadImage, loadImages } from './utils/assets.js'
import { GAME_HEIGHT, GAME_WIDTH, PIPE_SCORE_OFFSET } from './constants.js'

const STATE_START = 'start'
const STATE_PLAYING = 'playing'

async function init() {
  const app = document.querySelector('#app')
  const canvas = document.createElement('canvas')
  app.innerHTML = ''
  app.appendChild(canvas)

  const [frames, pipeImage, messageImage] = await Promise.all([
    loadImages([birdUpSrc, birdMidSrc, birdDownSrc]),
    loadImages([pipeSrc]),
    loadImage(messageSrc),
  ])

  let gameState = STATE_START
  let score = 0

  const bird = new Bird(frames, {
    y: GAME_HEIGHT * 0.35,
  })

  const pipes = new PipeSystem(pipeImage[0], {
    scale: 0.96,
    scoreOffset: PIPE_SCORE_OFFSET,
  })
  pipes.active = false
  pipes.reset()

  bird.setPhysicsEnabled(false)

  const game = new Game(canvas)
  game.addEntity(bird)
  game.addEntity(pipes)
  game.setInputHandler(() => {
    const aPressed = PLAYER_1.A
    if (aPressed && !game._prevAPressed) {
      if (gameState === STATE_START) {
        startGame()
      } else if (gameState === STATE_PLAYING) {
        bird.flap()
      }
    }
    game._prevAPressed = aPressed
  })
  game.setCollisionHandler(() => {
    if (gameState !== STATE_PLAYING) return

    const gained = pipes.scoreIfPassed(bird)
    if (gained > 0) score += gained

    if (pipes.collidesWith(bird)) {
      game.stop()
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

      ctx.fillStyle = '#e0e6ed'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Press A to start', GAME_WIDTH / 2, GAME_HEIGHT - 36)
    } else if (gameState === STATE_PLAYING) {
      ctx.fillStyle = '#e0e6ed'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, 24)
    }
  })
  game.start()

  function startGame() {
    score = 0
    gameState = STATE_PLAYING
    pipes.reset()
    pipes.active = true
    bird.reset(GAME_HEIGHT * 0.35)
    bird.setPhysicsEnabled(true)
    bird.flap()
  }
}

init().catch((err) => {
  console.error('Failed to load assets', err)
})
