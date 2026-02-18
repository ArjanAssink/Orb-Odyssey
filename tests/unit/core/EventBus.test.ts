import { describe, it, expect, vi } from 'vitest'
import { EventBus } from '../../../src/core/EventBus'

describe('EventBus', () => {
  it('calls registered listener on emit', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on('test', handler)
    bus.emit('test', { value: 42 })
    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })

  it('does not call removed listener', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on('test', handler)
    bus.off('test', handler)
    bus.emit('test', {})
    expect(handler).not.toHaveBeenCalled()
  })

  it('supports multiple listeners for the same event', () => {
    const bus = new EventBus()
    const h1 = vi.fn()
    const h2 = vi.fn()
    bus.on('test', h1)
    bus.on('test', h2)
    bus.emit('test', 'payload')
    expect(h1).toHaveBeenCalledOnce()
    expect(h2).toHaveBeenCalledOnce()
  })

  it('does not throw when emitting with no listeners', () => {
    const bus = new EventBus()
    expect(() => bus.emit('no-listeners', {})).not.toThrow()
  })

  it('clears all listeners', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on('test', handler)
    bus.clear()
    bus.emit('test', {})
    expect(handler).not.toHaveBeenCalled()
  })
})
