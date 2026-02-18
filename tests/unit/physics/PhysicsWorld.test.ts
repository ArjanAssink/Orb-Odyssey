import { describe, it, expect } from 'vitest'
import { Vec3 } from 'cannon-es'
import { PhysicsWorld } from '../../../src/physics/PhysicsWorld'

describe('PhysicsWorld', () => {
  it('creates a dynamic ball body with mass 1', () => {
    const world = new PhysicsWorld()
    const body = world.createBallBody(0.5)
    expect(body.mass).toBe(1)
    expect(body.shapes).toHaveLength(1)
  })

  it('creates a static box body with mass 0', () => {
    const world = new PhysicsWorld()
    const body = world.createBoxBody(new Vec3(1, 0.25, 1), 0)
    expect(body.mass).toBe(0)
  })

  it('steps the simulation without throwing', () => {
    const world = new PhysicsWorld()
    world.createBallBody(0.5)
    expect(() => world.step(1 / 60)).not.toThrow()
  })

  it('ball falls under gravity over time', () => {
    const world = new PhysicsWorld()
    const ball = world.createBallBody(0.5)
    ball.position.set(0, 10, 0)

    for (let i = 0; i < 60; i++) world.step(1 / 60)

    expect(ball.position.y).toBeLessThan(10)
  })

  it('ball rests on a static platform', () => {
    const world = new PhysicsWorld()
    const platform = world.createBoxBody(new Vec3(5, 0.25, 5), 0)
    platform.position.set(0, 0, 0)

    const ball = world.createBallBody(0.5)
    ball.position.set(0, 3, 0)

    // Simulate 3 seconds
    for (let i = 0; i < 180; i++) world.step(1 / 60)

    // Ball should have come to rest near y=0.5 (platform top + radius)
    expect(ball.position.y).toBeGreaterThan(0.2)
    expect(ball.position.y).toBeLessThan(1.2)
  })

  it('removeBody removes the body from the world', () => {
    const world = new PhysicsWorld()
    const ball = world.createBallBody(0.5)
    const countBefore = world.world.bodies.length
    world.removeBody(ball)
    expect(world.world.bodies.length).toBe(countBefore - 1)
  })
})
