const MAX_DT = 0.05 // cap at 50 ms to avoid spiral-of-death on tab switch

export class GameLoop {
  private running = false
  private lastTime = 0
  private rafId = 0

  constructor(
    private readonly update: (dt: number) => void,
    private readonly render: () => void,
  ) {}

  start(): void {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }

  private tick = (time: number): void => {
    if (!this.running) return
    const dt = Math.min((time - this.lastTime) / 1000, MAX_DT)
    this.lastTime = time
    this.update(dt)
    this.render()
    this.rafId = requestAnimationFrame(this.tick)
  }
}
