import './style.css'
import { Game } from './Game'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const uiRoot = document.getElementById('ui-root') as HTMLElement

const game = new Game(canvas, uiRoot)

// Expose for debugging in development
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).game = game
}
