import './style.css'
import birdUpSrc from './assets/birds/yellowbird-upflap.png'
import birdMidSrc from './assets/birds/yellowbird-midflap.png'
import birdDownSrc from './assets/birds/yellowbird-downflap.png'
import pipeSrc from './assets/pipe/pipe-green.png'
import messageSrc from './assets/message/message.png'
import gameOverSrc from './assets/message/gameover.png'
import bgSrc from './assets/background/background-day.png'
import baseSrc from './assets/background/base.png'
import { Game } from './game/game.js'
import { Bird } from './game/bird.js'
import { PipeSystem } from './game/pipes.js'
import { Background, Base } from './game/background.js'
import { loadImage, loadImages } from './utils/assets.js'
import { GAME_HEIGHT, PIPE_SCORE_OFFSET, PIPE_SPEED } from './constants.js'
import { GameState, STATE_PLAYING } from './state/gameState.js'
import { createInputHandler } from './input/input.js'
import { renderOverlay } from './ui/overlay.js'

async function init() {
  const app = document.querySelector('#app')
  const canvas = document.createElement('canvas')
  app.innerHTML = ''
  app.appendChild(canvas)

  const [frames, pipeImage, messageImage, gameOverImage, bgImage, baseImage] = await Promise.all([
    loadImages([birdUpSrc, birdMidSrc, birdDownSrc]),
    loadImages([pipeSrc]),
    loadImage(messageSrc),
    loadImage(gameOverSrc),
    loadImage(bgSrc),
    loadImage(baseSrc),
  ])

  const bird = new Bird(frames, {
    y: GAME_HEIGHT * 0.35,
  })

  const pipes = new PipeSystem(pipeImage[0], {
    scale: 0.96,
    scoreOffset: PIPE_SCORE_OFFSET,
  })
  const background = new Background(bgImage)
  const base = new Base(baseImage, PIPE_SPEED)
  const state = new GameState({ bird, pipes, base })

  const game = new Game(canvas)
  game.setBackground(background)
  game.setBase(base)
  game.addEntity(bird)
  game.addEntity(pipes)
  game.setInputHandler(
    createInputHandler({
      state,
      bird,
      onStart: () => state.startRun(),
      onRestart: () => state.resetToStart(),
    })
  )
  game.setCollisionHandler(() => {
    if (state.mode !== STATE_PLAYING) return

    const gained = pipes.scoreIfPassed(bird)
    if (gained > 0) state.score += gained

    if (pipes.collidesWith(bird)) {
      state.gameOver()
    }
  })
  game.setOverlayRenderer((ctx) => {
    renderOverlay(ctx, { state, messageImage, gameOverImage })
  })
  game.start()

  // Initialize to start screen state
  state.resetToStart()
}

init().catch((err) => {
  console.error('Failed to load assets', err)
})
