import { PLAYER_1, SYSTEM } from '@rcade/plugin-input-classic'
import { STATE_GAME_OVER, STATE_PLAYING, STATE_START } from '../state/gameState.js'

export function createInputHandler({ state, bird, onStart, onRestart, onFlap }) {
  let prevA = false
  let prevStart = false

  return function handleInput() {
    const aPressed = PLAYER_1.A
    const startPressed = SYSTEM.ONE_PLAYER

    if (state.mode === STATE_START && aPressed && !prevA) {
      onStart()
    }

    if (state.mode === STATE_GAME_OVER && startPressed && !prevStart) {
      onRestart()
    }

    if (state.mode === STATE_PLAYING && aPressed && !prevA) {
      bird.flap()
      if (onFlap) onFlap()
    }

    prevA = aPressed
    prevStart = startPressed
  }
}
