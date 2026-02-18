import * as THREE from 'three'
import type { Body } from 'cannon-es'
import { Vec3 } from 'cannon-es'
import type { PhysicsWorld } from '../physics/PhysicsWorld'
import type { InputState } from '../core/InputManager'

const RADIUS = 0.4
const FORCE = 28
const FALL_THRESHOLD = -15

export class Ball {
  readonly body: Body
  readonly mesh: THREE.Mesh

  constructor(physicsWorld: PhysicsWorld, scene: THREE.Scene) {
    this.body = physicsWorld.createBallBody(RADIUS)

    const geometry = new THREE.SphereGeometry(RADIUS, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x1565c0,
      emissiveIntensity: 0.15,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    scene.add(this.mesh)
  }

  setPosition(x: number, y: number, z: number): void {
    this.body.position.set(x, y, z)
    this.body.velocity.setZero()
    this.body.angularVelocity.setZero()
    this.body.force.setZero()
    this.sync()
  }

  applyInput(input: InputState): void {
    this.body.applyForce(new Vec3(input.x * FORCE, 0, input.y * FORCE))
  }

  /** Apply a one-shot world-space impulse (from a touch flick). */
  applyImpulse(worldX: number, worldZ: number): void {
    this.body.applyImpulse(new Vec3(worldX, 0, worldZ))
  }

  /** Copy physics body transform to the Three.js mesh. Call after each physics step. */
  sync(): void {
    const p = this.body.position
    this.mesh.position.set(p.x, p.y, p.z)
    const q = this.body.quaternion
    this.mesh.quaternion.set(q.x, q.y, q.z, q.w)
  }

  get position(): THREE.Vector3 {
    return this.mesh.position
  }

  get isFalling(): boolean {
    return this.body.position.y < FALL_THRESHOLD
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh)
  }
}
