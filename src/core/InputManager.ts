export interface InputState {
  /** Horizontal axis: -1 (left) to 1 (right) — keyboard only */
  x: number
  /** Forward axis: -1 (forward) to 1 (back) — keyboard only */
  y: number
}

export interface FlickEvent {
  /** Screen-space velocity in px/s at moment of release */
  screenVX: number
  screenVY: number
}

export class InputManager {
  private keys = new Set<string>()
  private pendingFlick: FlickEvent | null = null

  // Rolling buffer of touch positions over the last 80 ms — used to
  // compute velocity at the moment of lift-off rather than total displacement.
  private touchBuffer: Array<{ x: number; y: number; t: number }> = []

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('touchstart', this.onTouchStart, { passive: false })
    window.addEventListener('touchmove', this.onTouchMove, { passive: false })
    window.addEventListener('touchend', this.onTouchEnd)
    window.addEventListener('touchcancel', this.onTouchEnd)
  }

  /** Continuous force direction from keyboard (desktop). */
  get state(): InputState {
    let x = 0
    let y = 0
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) x -= 1
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) x += 1
    if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) y -= 1
    if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) y += 1
    return { x, y }
  }

  /**
   * Returns the latest flick event and clears it.
   * Call once per frame; non-null only on the frame after a touch lift-off.
   */
  consumeFlick(): FlickEvent | null {
    const f = this.pendingFlick
    this.pendingFlick = null
    return f
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('touchmove', this.onTouchMove)
    window.removeEventListener('touchend', this.onTouchEnd)
    window.removeEventListener('touchcancel', this.onTouchEnd)
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code)
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code)
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault()
    const t = e.touches[0]
    const now = performance.now()
    this.touchBuffer = [{ x: t.clientX, y: t.clientY, t: now }]
  }

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault()
    const t = e.touches[0]
    const now = performance.now()
    this.touchBuffer.push({ x: t.clientX, y: t.clientY, t: now })
    // Keep only the last 80 ms so velocity reflects the recent swipe speed
    const cutoff = now - 80
    this.touchBuffer = this.touchBuffer.filter((p) => p.t >= cutoff)
  }

  private onTouchEnd = (): void => {
    if (this.touchBuffer.length < 2) {
      this.touchBuffer = []
      return
    }
    const first = this.touchBuffer[0]
    const last = this.touchBuffer[this.touchBuffer.length - 1]
    const dt = (last.t - first.t) / 1000
    if (dt < 0.01) {
      this.touchBuffer = []
      return
    }
    this.pendingFlick = {
      screenVX: (last.x - first.x) / dt,
      screenVY: (last.y - first.y) / dt,
    }
    this.touchBuffer = []
  }
}
