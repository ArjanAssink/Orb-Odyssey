import * as THREE from 'three'
import type { EventBus } from '../core/EventBus'

const COLLECT_RADIUS = 1.1
const BOB_SPEED = 2
const BOB_HEIGHT = 0.18
const SPIN_SPEED = 1.8

export interface CollectibleDef {
  position: [number, number, number]
}

export class Collectible {
  readonly mesh: THREE.Mesh
  private collected = false
  private age = 0

  constructor(
    private readonly def: CollectibleDef,
    scene: THREE.Scene,
    private readonly bus: EventBus,
  ) {
    this.mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 1),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xff6f00,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.2,
      }),
    )
    this.mesh.position.set(...def.position)
    this.mesh.castShadow = true
    scene.add(this.mesh)
  }

  update(dt: number, ballPosition: THREE.Vector3): void {
    if (this.collected) return

    this.age += dt
    this.mesh.rotation.y += SPIN_SPEED * dt
    this.mesh.position.y = this.def.position[1] + Math.sin(this.age * BOB_SPEED) * BOB_HEIGHT

    if (this.mesh.position.distanceTo(ballPosition) < COLLECT_RADIUS) {
      this.collected = true
      this.mesh.visible = false
      this.bus.emit('collectible:picked', { position: this.mesh.position.clone() })
    }
  }

  get isCollected(): boolean {
    return this.collected
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh)
  }
}
