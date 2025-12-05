import { GAME_HEIGHT, GAME_WIDTH } from '../constants.js'
import { STATE_GAME_OVER, STATE_PLAYING, STATE_START } from '../state/gameState.js'

export function renderOverlay(ctx, { state, messageImage, gameOverImage }) {
  if (state.mode === STATE_START) {
    drawStart(ctx, messageImage)
    return
  }

  if (state.mode === STATE_PLAYING) {
    drawScore(ctx, state.score)
    return
  }

  if (state.mode === STATE_GAME_OVER) {
    drawGameOver(ctx, { gameOverImage, score: state.score, best: state.best })
  }
}

function drawStart(ctx, messageImage) {
  const msgScale = 0.9
  const w = messageImage.width * msgScale
  const h = messageImage.height * msgScale
  const x = (GAME_WIDTH - w) / 2
  const y = (GAME_HEIGHT - h) / 2 + 6
  ctx.drawImage(messageImage, x, y, w, h)

  drawTextOutlined(ctx, 'Press A to start', GAME_WIDTH / 2, GAME_HEIGHT - 36, {
    fill: '#f6f7fb',
  })
}

function drawScore(ctx, score) {
  drawTextOutlined(ctx, `Score: ${score}`, GAME_WIDTH / 2, 24, {
    font: 'bold 18px sans-serif',
    fill: '#f6f7fb',
  })
}

function drawGameOver(ctx, { gameOverImage, score, best }) {
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

export function drawTextOutlined(ctx, text, x, y, options = {}) {
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
