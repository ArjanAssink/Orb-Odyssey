export type GameState = 'menu' | 'playing' | 'paused' | 'level-complete' | 'game-over'

type Transition = { from: GameState | GameState[]; to: GameState }

const TRANSITIONS: Transition[] = [
  { from: 'menu', to: 'playing' },
  { from: 'playing', to: 'paused' },
  { from: 'paused', to: 'playing' },
  { from: 'playing', to: 'level-complete' },
  { from: 'playing', to: 'game-over' },
  { from: ['level-complete', 'game-over'], to: 'menu' },
  { from: ['level-complete', 'game-over'], to: 'playing' },
]

export class StateMachine {
  private current: GameState = 'menu'
  private listeners: Array<(state: GameState) => void> = []

  get state(): GameState {
    return this.current
  }

  transition(to: GameState): void {
    const valid = TRANSITIONS.some((t) => {
      const froms = Array.isArray(t.from) ? t.from : [t.from]
      return t.to === to && froms.includes(this.current)
    })
    if (!valid) throw new Error(`Invalid transition: ${this.current} → ${to}`)
    this.current = to
    this.listeners.forEach((l) => l(to))
  }

  onChange(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }
}
