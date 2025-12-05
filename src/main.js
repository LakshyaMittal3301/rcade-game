import './style.css'
import birdUpSrc from './assets/birds/yellowbird-upflap.png'
import birdMidSrc from './assets/birds/yellowbird-midflap.png'
import birdDownSrc from './assets/birds/yellowbird-downflap.png'
import { PLAYER_1 } from '@rcade/plugin-input-classic'
import { Game } from './game/game.js'
import { Bird } from './game/bird.js'
import { loadImages } from './utils/assets.js'
import { GAME_HEIGHT } from './constants.js'

async function init() {
  const app = document.querySelector('#app')
  const canvas = document.createElement('canvas')
  app.innerHTML = ''
  app.appendChild(canvas)

  const frames = await loadImages([birdUpSrc, birdMidSrc, birdDownSrc])

  const bird = new Bird(frames, {
    y: GAME_HEIGHT * 0.35,
  })

  const game = new Game(canvas)
  game.addEntity(bird)
  game.setInputHandler(() => {
    const aPressed = PLAYER_1.A
    if (aPressed && !game._prevAPressed) {
      bird.flap()
    }
    game._prevAPressed = aPressed
  })
  game.start()
}

init().catch((err) => {
  console.error('Failed to load assets', err)
})
