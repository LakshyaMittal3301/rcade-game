import './style.css'
import birdUpSrc from './assets/birds/yellowbird-upflap.png'
import birdMidSrc from './assets/birds/yellowbird-midflap.png'
import birdDownSrc from './assets/birds/yellowbird-downflap.png'
import pipeSrc from './assets/pipe/pipe-green.png'
import { PLAYER_1 } from '@rcade/plugin-input-classic'
import { Game } from './game/game.js'
import { Bird } from './game/bird.js'
import { PipeSystem } from './game/pipes.js'
import { loadImages } from './utils/assets.js'
import { GAME_HEIGHT, GAME_WIDTH, PIPE_SCORE_OFFSET } from './constants.js'

async function init() {
  const app = document.querySelector('#app')
  const canvas = document.createElement('canvas')
  app.innerHTML = ''
  app.appendChild(canvas)

  const [frames, pipeImage] = await Promise.all([
    loadImages([birdUpSrc, birdMidSrc, birdDownSrc]),
    loadImages([pipeSrc]),
  ])

  let score = 0

  const bird = new Bird(frames, {
    y: GAME_HEIGHT * 0.35,
  })

  const pipes = new PipeSystem(pipeImage[0], {
    scale: 0.96,
    scoreOffset: PIPE_SCORE_OFFSET,
  })

  const game = new Game(canvas)
  game.addEntity(bird)
  game.addEntity(pipes)
  game.setInputHandler(() => {
    const aPressed = PLAYER_1.A
    if (aPressed && !game._prevAPressed) {
      bird.flap()
    }
    game._prevAPressed = aPressed
  })
  game.setCollisionHandler(() => {
    const gained = pipes.scoreIfPassed(bird)
    if (gained > 0) {
      score += gained
    }

    if (pipes.collidesWith(bird)) {
      game.stop()
    }
  })
  game.setOverlayRenderer((ctx) => {
    ctx.fillStyle = '#e0e6ed'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, 24)
  })
  game.start()
}

init().catch((err) => {
  console.error('Failed to load assets', err)
})
