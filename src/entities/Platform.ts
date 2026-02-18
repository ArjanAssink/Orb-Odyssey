import * as THREE from 'three'
import { Vec3 } from 'cannon-es'
import type { Body } from 'cannon-es'
import type { PhysicsWorld } from '../physics/PhysicsWorld'

export interface PlatformDef {
  position: [number, number, number]
  size: [number, number, number]
  /** Euler rotation in radians [x, y, z]. Optional. */
  rotation?: [number, number, number]
  color?: number
}

export class Platform {
  readonly body: Body
  readonly mesh: THREE.Mesh

  constructor(def: PlatformDef, physicsWorld: PhysicsWorld, scene: THREE.Scene) {
    const [w, h, d] = def.size
    this.body = physicsWorld.createBoxBody(new Vec3(w / 2, h / 2, d / 2), 0)
    this.body.position.set(...def.position)
    if (def.rotation) this.body.quaternion.setFromEuler(...def.rotation)

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: def.color ?? 0x7e57c2, roughness: 0.6, metalness: 0.1 }),
    )
    this.mesh.position.set(...def.position)
    if (def.rotation) this.mesh.rotation.set(...def.rotation)
    this.mesh.receiveShadow = true
    this.mesh.castShadow = false
    scene.add(this.mesh)
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh)
  }
}
