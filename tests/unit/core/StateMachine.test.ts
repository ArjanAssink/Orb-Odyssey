import { describe, it, expect, vi } from 'vitest'
import { StateMachine } from '../../../src/core/StateMachine'

describe('StateMachine', () => {
  it('starts in menu state', () => {
    expect(new StateMachine().state).toBe('menu')
  })

  it('transitions from menu to playing', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    expect(sm.state).toBe('playing')
  })

  it('transitions playing ↔ paused', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    sm.transition('paused')
    expect(sm.state).toBe('paused')
    sm.transition('playing')
    expect(sm.state).toBe('playing')
  })

  it('throws on invalid transition', () => {
    const sm = new StateMachine()
    expect(() => sm.transition('paused')).toThrow()
    expect(() => sm.transition('level-complete')).toThrow()
  })

  it('notifies onChange listeners on every transition', () => {
    const sm = new StateMachine()
    const states: string[] = []
    sm.onChange((s) => states.push(s))
    sm.transition('playing')
    sm.transition('paused')
    expect(states).toEqual(['playing', 'paused'])
  })

  it('onChange returns a cleanup function that unregisters the listener', () => {
    const sm = new StateMachine()
    const handler = vi.fn()
    const cleanup = sm.onChange(handler)
    cleanup()
    sm.transition('playing')
    expect(handler).not.toHaveBeenCalled()
  })

  it('can restart from level-complete back to playing', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    sm.transition('level-complete')
    sm.transition('playing')
    expect(sm.state).toBe('playing')
  })
})
