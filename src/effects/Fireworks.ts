import * as THREE from 'three'

const GRAVITY = -12
const BURST_COLORS = [
  0xff4444, // red
  0xff9900, // orange
  0xffee00, // yellow
  0x44ff44, // green
  0x00ccff, // cyan
  0xee44ff, // magenta
  0xffffff, // white
]

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number    // 0..1, starts at 1 decreases to 0
  maxLife: number // seconds
  color: THREE.Color
  size: number
}

interface Burst {
  origin: THREE.Vector3
  particles: Particle[]
  points: THREE.Points
  geometry: THREE.BufferGeometry
  elapsed: number
}

/** Dramatic multi-burst fireworks rendered as Three.js Points. */
export class Fireworks {
  private readonly scene: THREE.Scene
  private readonly bursts: Burst[] = []
  /** Pending burst launch times relative to when show() was called. */
  private pendingLaunches: { delay: number; origin: THREE.Vector3 }[] = []
  private showTimer = -1

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /** Kick off the full fireworks show centred around `origin`. */
  show(origin: THREE.Vector3): void {
    this.showTimer = 0
    this.pendingLaunches = []

    // Schedule 9 bursts in a dramatic staggered pattern
    const offsets: [number, number, number, number][] = [
      // [delay, dx, dy, dz]
      [0.0,   0,  3,  0],
      [0.25, -3,  5,  0],
      [0.25,  3,  5,  0],
      [0.55,  0,  7, -2],
      [0.55,  0,  7,  2],
      [0.85, -4,  9,  0],
      [0.85,  4,  9,  0],
      [1.1,   0, 11,  0],
      [1.4,   0, 13,  0],
    ]
    for (const [delay, dx, dy, dz] of offsets) {
      this.pendingLaunches.push({
        delay,
        origin: new THREE.Vector3(origin.x + dx, origin.y + dy, origin.z + dz),
      })
    }
  }

  update(dt: number): void {
    // Fire pending bursts
    if (this.showTimer >= 0) {
      this.showTimer += dt
      for (let i = this.pendingLaunches.length - 1; i >= 0; i--) {
        const launch = this.pendingLaunches[i]!
        if (this.showTimer >= launch.delay) {
          this.spawnBurst(launch.origin)
          this.pendingLaunches.splice(i, 1)
        }
      }
      if (this.pendingLaunches.length === 0) {
        this.showTimer = -1
      }
    }

    // Animate existing bursts
    for (let bi = this.bursts.length - 1; bi >= 0; bi--) {
      const burst = this.bursts[bi]!
      burst.elapsed += dt
      let alive = false

      const positions = burst.geometry.attributes['position']!.array as Float32Array
      const colors = burst.geometry.attributes['color']!.array as Float32Array
      const sizes = burst.geometry.attributes['size']!.array as Float32Array

      for (let pi = 0; pi < burst.particles.length; pi++) {
        const p = burst.particles[pi]!
        p.life -= dt / p.maxLife
        if (p.life <= 0) {
          positions[pi * 3]     = 1e9
          positions[pi * 3 + 1] = 1e9
          positions[pi * 3 + 2] = 1e9
          continue
        }
        alive = true

        p.velocity.y += GRAVITY * dt
        p.position.addScaledVector(p.velocity, dt)

        positions[pi * 3]     = p.position.x
        positions[pi * 3 + 1] = p.position.y
        positions[pi * 3 + 2] = p.position.z

        const alpha = p.life * p.life // fade out quadratically
        colors[pi * 3]     = p.color.r * alpha
        colors[pi * 3 + 1] = p.color.g * alpha
        colors[pi * 3 + 2] = p.color.b * alpha

        sizes[pi] = p.size * alpha
      }

      burst.geometry.attributes['position']!.needsUpdate = true
      burst.geometry.attributes['color']!.needsUpdate = true
      burst.geometry.attributes['size']!.needsUpdate = true

      if (!alive) {
        this.scene.remove(burst.points)
        burst.geometry.dispose()
        ;(burst.points.material as THREE.Material).dispose()
        this.bursts.splice(bi, 1)
      }
    }
  }

  get isActive(): boolean {
    return this.showTimer >= 0 || this.bursts.length > 0
  }

  dispose(): void {
    for (const burst of this.bursts) {
      this.scene.remove(burst.points)
      burst.geometry.dispose()
      ;(burst.points.material as THREE.Material).dispose()
    }
    this.bursts.length = 0
    this.pendingLaunches.length = 0
    this.showTimer = -1
  }

  private spawnBurst(origin: THREE.Vector3): void {
    const COUNT = 120
    const color = new THREE.Color(BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)])
    // Second colour for a two-tone burst
    const color2 = new THREE.Color(BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)])

    const particles: Particle[] = []
    const posArr = new Float32Array(COUNT * 3)
    const colArr = new Float32Array(COUNT * 3)
    const sizeArr = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const speed = 4 + Math.random() * 8
      const c = i < COUNT / 2 ? color : color2
      const maxLife = 1.2 + Math.random() * 0.8

      const p: Particle = {
        position: origin.clone(),
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed * 0.6 + 2,
          Math.cos(phi) * speed,
        ),
        life: 1,
        maxLife,
        color: c.clone(),
        size: 0.15 + Math.random() * 0.25,
      }
      particles.push(p)

      posArr[i * 3]     = p.position.x
      posArr[i * 3 + 1] = p.position.y
      posArr[i * 3 + 2] = p.position.z
      colArr[i * 3]     = c.r
      colArr[i * 3 + 1] = c.g
      colArr[i * 3 + 2] = c.b
      sizeArr[i] = p.size
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    geometry.setAttribute('color',    new THREE.BufferAttribute(colArr, 3))
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizeArr, 1))

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    this.scene.add(points)

    this.bursts.push({ origin, particles, points, geometry, elapsed: 0 })
  }
}
