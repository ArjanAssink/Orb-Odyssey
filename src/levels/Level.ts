import * as THREE from 'three'
import type { PhysicsWorld } from '../physics/PhysicsWorld'
import type { EventBus } from '../core/EventBus'
import { Ball } from '../entities/Ball'
import { Platform, type PlatformDef } from '../entities/Platform'
import { Collectible, type CollectibleDef } from '../entities/Collectible'

export interface LevelLayout {
  name: string
  startPosition: [number, number, number]
  goalPosition: [number, number, number]
  platforms: PlatformDef[]
  collectibles: CollectibleDef[]
  /** How many orbs must be collected before the goal activates. */
  collectiblesRequired: number
}

export class Level {
  readonly ball: Ball
  private platforms: Platform[]
  private collectibles: Collectible[]
  private goalMesh: THREE.Mesh
  private collected = 0
  private done = false
  private fallCooldown = 0

  constructor(
    private readonly layout: LevelLayout,
    private readonly physics: PhysicsWorld,
    private readonly scene: THREE.Scene,
    private readonly bus: EventBus,
  ) {
    this.ball = new Ball(physics, scene)
    this.ball.setPosition(...layout.startPosition)

    this.platforms = layout.platforms.map((def) => new Platform(def, physics, scene))
    this.collectibles = layout.collectibles.map((def) => new Collectible(def, scene, bus))

    // Goal marker — glows green once enough orbs are collected
    this.goalMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00c853, emissiveIntensity: 0.6 }),
    )
    this.goalMesh.position.set(...layout.goalPosition)
    this.goalMesh.receiveShadow = true
    scene.add(this.goalMesh)

    bus.on('collectible:picked', this.onCollect)
  }

  /** Called each frame by Game after ball input has been applied. */
  update(dt: number): void {
    if (this.done) return

    this.physics.step(dt)
    this.ball.sync()
    this.fallCooldown = Math.max(0, this.fallCooldown - dt)

    const ballPos = this.ball.position
    this.collectibles.forEach((c) => c.update(dt, ballPos))

    // Pulse the goal disc
    this.goalMesh.rotation.y += dt * 0.8

    if (this.ball.isFalling && this.fallCooldown === 0) {
      this.fallCooldown = 1.5
      this.bus.emit('ball:fell', {})
      return
    }

    if (this.collected >= this.layout.collectiblesRequired && this.isGoalReached()) {
      this.done = true
      this.bus.emit('level:complete', { collected: this.collected })
    }
  }

  respawn(): void {
    this.ball.setPosition(...this.layout.startPosition)
  }

  get collectedCount(): number {
    return this.collected
  }

  get requiredCount(): number {
    return this.layout.collectiblesRequired
  }

  dispose(): void {
    this.bus.off('collectible:picked', this.onCollect)
    this.ball.dispose(this.scene)
    this.platforms.forEach((p) => p.dispose(this.scene))
    this.collectibles.forEach((c) => c.dispose(this.scene))
    this.scene.remove(this.goalMesh)
  }

  private onCollect = (): void => {
    this.collected++
  }

  private isGoalReached(): boolean {
    const gp = this.layout.goalPosition
    const bp = this.ball.position
    // Check horizontal distance only — ball must be near the disc centre, not just touching its rim
    const dx = bp.x - gp[0]
    const dz = bp.z - gp[2]
    const xzDist = Math.sqrt(dx * dx + dz * dz)
    // Also require the ball to have slowed down (settled onto the platform, not flying through)
    const speed = this.ball.body.velocity.length()
    return xzDist < 1.0 && speed < 8
  }
}
