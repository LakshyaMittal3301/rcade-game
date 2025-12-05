import { GAME_HEIGHT } from '../constants.js'

export const STATE_START = 'start'
export const STATE_PLAYING = 'playing'
export const STATE_GAME_OVER = 'game_over'

export class GameState {
  constructor({ bird, pipes, base }) {
    this.bird = bird
    this.pipes = pipes
    this.base = base

    this.mode = STATE_START
    this.score = 0
    this.best = 0
  }

  resetToStart() {
    this.mode = STATE_START
    this.score = 0
    this.pipes.reset()
    this.pipes.active = false
    this.base.setActive(false)
    this.bird.reset(GAME_HEIGHT * 0.35)
    this.bird.setPhysicsEnabled(false)
  }

  startRun() {
    this.score = 0
    this.mode = STATE_PLAYING
    this.pipes.reset()
    this.pipes.active = true
    this.base.setActive(true)
    this.bird.reset(GAME_HEIGHT * 0.35)
    this.bird.setPhysicsEnabled(true)
    this.bird.flap()
  }

  gameOver() {
    this.mode = STATE_GAME_OVER
    this.pipes.active = false
    this.base.setActive(false)
    this.bird.freeze()
    this.best = Math.max(this.best, this.score)
  }
}
