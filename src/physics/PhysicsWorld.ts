import { World, Body, Sphere, Box, Vec3, SAPBroadphase, ContactMaterial, Material } from 'cannon-es'

export class PhysicsWorld {
  readonly world: World

  private ballMaterial = new Material('ball')
  private groundMaterial = new Material('ground')

  constructor() {
    this.world = new World({ gravity: new Vec3(0, -20, 0) })
    this.world.broadphase = new SAPBroadphase(this.world)

    const contact = new ContactMaterial(this.ballMaterial, this.groundMaterial, {
      friction: 0.4,
      restitution: 0.1,
    })
    this.world.addContactMaterial(contact)
  }

  step(dt: number): void {
    this.world.step(1 / 60, dt, 3)
  }

  createBallBody(radius: number): Body {
    const body = new Body({
      mass: 1,
      shape: new Sphere(radius),
      material: this.ballMaterial,
      linearDamping: 0.1,
      angularDamping: 0.25,
    })
    this.world.addBody(body)
    return body
  }

  createBoxBody(halfExtents: Vec3, mass = 0): Body {
    const body = new Body({
      mass,
      shape: new Box(halfExtents),
      material: this.groundMaterial,
    })
    this.world.addBody(body)
    return body
  }

  removeBody(body: Body): void {
    this.world.removeBody(body)
  }
}
