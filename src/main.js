import './style.css'
import nyanFrame0 from './assets/nyan-cat/frame_00_delay-0.07s.gif'
import nyanFrame1 from './assets/nyan-cat/frame_01_delay-0.07s.gif'
import nyanFrame2 from './assets/nyan-cat/frame_02_delay-0.07s.gif'
import nyanFrame3 from './assets/nyan-cat/frame_03_delay-0.07s.gif'
import nyanFrame4 from './assets/nyan-cat/frame_04_delay-0.07s.gif'
import nyanFrame5 from './assets/nyan-cat/frame_05_delay-0.07s.gif'
import nyanFrame6 from './assets/nyan-cat/frame_06_delay-0.07s.gif'
import nyanFrame7 from './assets/nyan-cat/frame_07_delay-0.07s.gif'
import nyanFrame8 from './assets/nyan-cat/frame_08_delay-0.07s.gif'
import nyanFrame9 from './assets/nyan-cat/frame_09_delay-0.07s.gif'
import nyanFrame10 from './assets/nyan-cat/frame_10_delay-0.07s.gif'
import nyanFrame11 from './assets/nyan-cat/frame_11_delay-0.07s.gif'
import trailFrame0 from './assets/nyan-trails/frame_0_delay-0.07s.gif'
import trailFrame1 from './assets/nyan-trails/frame_1_delay-0.07s.gif'
import trailFrame2 from './assets/nyan-trails/frame_2_delay-0.07s.gif'
import trailFrame3 from './assets/nyan-trails/frame_3_delay-0.07s.gif'
import pipeGreenSrc from './assets/pipe/pipe-green.png'
import pipeRedSrc from './assets/pipe/pipe-red.png'
import messageSrc from './assets/message/message.png'
import gameOverSrc from './assets/message/gameover.png'
import bgVideoSrc from './assets/nyan-bg/nyan-bg.mp4'
import baseSrc from './assets/background/base.png'
import wingSrc from './assets/sounds/wing.ogg'
import pointSrc from './assets/sounds/point.ogg'
import hitSrc from './assets/sounds/hit.ogg'
import swooshSrc from './assets/sounds/swoosh.ogg'
import { Game } from './game/game.js'
import { Bird } from './game/bird.js'
import { PipeSystem } from './game/pipes.js'
import { Background, Base } from './game/background.js'
import { loadImage, loadImages } from './utils/assets.js'
import { GAME_HEIGHT, PIPE_SCORE_OFFSET, PIPE_SPEED } from './constants.js'
import { GameState, STATE_PLAYING } from './state/gameState.js'
import { createInputHandler } from './input/input.js'
import { renderOverlay } from './ui/overlay.js'
import { SoundManager } from './audio/soundManager.js'

async function init() {
  const app = document.querySelector('#app')
  const canvas = document.createElement('canvas')
  app.innerHTML = ''
  app.appendChild(canvas)

  const nyanSources = [
    nyanFrame0,
    nyanFrame1,
    nyanFrame2,
    nyanFrame3,
    nyanFrame4,
    nyanFrame5,
    nyanFrame6,
    nyanFrame7,
    nyanFrame8,
    nyanFrame9,
    nyanFrame10,
    nyanFrame11,
  ]

  const trailSources = [trailFrame0, trailFrame1, trailFrame2, trailFrame3]

  const [nyanFrames, trailFrames, pipeGreen, pipeRed, messageImage, gameOverImage, baseImage] =
    await Promise.all([
      loadImages(nyanSources),
      loadImages(trailSources),
      loadImages([pipeGreenSrc]),
      loadImages([pipeRedSrc]),
      loadImage(messageSrc),
      loadImage(gameOverSrc),
      loadImage(baseSrc),
    ])

  const bgVideo = document.createElement('video')
  bgVideo.src = bgVideoSrc
  bgVideo.muted = true
  bgVideo.loop = true
  bgVideo.playsInline = true
  await bgVideo.play().catch(() => {})


  const sounds = new SoundManager({
    wing: wingSrc,
    point: pointSrc,
    hit: hitSrc,
    swoosh: swooshSrc,
  })

  const bird = new Bird(nyanFrames, {
    y: GAME_HEIGHT * 0.35,
    scale: 1.05,
    trailFrames,
    trailScale: 1.05,
    trailOffsetX: -18,
  })

  const pipes = new PipeSystem(pipeGreen[0], {
    scale: 0.96,
    scoreOffset: PIPE_SCORE_OFFSET,
    altSprite: pipeRed[0],
    altEvery: 10,
  })
  const background = new Background(bgVideo)
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
      onStart: () => {
        state.startRun()
      },
      onRestart: () => {
        sounds.play('swoosh')
        state.resetToStart()
      },
      onFlap: () => sounds.play('wing'),
    })
  )
  game.setCollisionHandler(() => {
    if (state.mode !== STATE_PLAYING) return

    const gained = pipes.scoreIfPassed(bird)
    if (gained > 0) {
      state.score += gained
      sounds.play('point')
    }

    if (pipes.collidesWith(bird)) {
      sounds.play('hit')
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
