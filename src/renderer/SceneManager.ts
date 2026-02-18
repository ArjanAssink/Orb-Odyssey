import * as THREE from 'three'

const CAMERA_DIST = 10
const CAMERA_HEIGHT = 6
const CAMERA_LOOK_AHEAD = 2
// Minimum flat speed (units/s) before camera starts rotating to follow direction
const DIR_UPDATE_THRESHOLD = 1.0

export class SceneManager {
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer

  // Unit vector (XZ plane) pointing FROM the ball TO the camera.
  // Starts behind a ball moving in +X (so camera is at -X side of ball).
  private cameraDir = new THREE.Vector3(0, 0, 1)

  constructor(canvas: HTMLCanvasElement) {
    this.scene.background = new THREE.Color(0x1a1a2e)
    this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.018)

    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 500)
    this.camera.position.set(0, CAMERA_HEIGHT, CAMERA_DIST)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.setupLights()
    this.setupResize(canvas)
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * Third-person camera that stays behind the ball's direction of travel.
   * @param ballPos  Current ball world position
   * @param velX     Ball velocity X
   * @param velZ     Ball velocity Z
   * @param dt       Frame delta in seconds
   */
  followBall(ballPos: THREE.Vector3, velX: number, velZ: number, dt: number): void {
    const flatSpeed = Math.sqrt(velX * velX + velZ * velZ)

    if (flatSpeed > DIR_UPDATE_THRESHOLD) {
      // "Behind" direction is opposite to velocity
      const targetDir = new THREE.Vector3(-velX / flatSpeed, 0, -velZ / flatSpeed)
      // Lerp the camera direction vector (no angle-wrap issues)
      this.cameraDir.lerp(targetDir, Math.min(1, dt * 2.5)).normalize()
    }

    const desired = new THREE.Vector3(
      ballPos.x + this.cameraDir.x * CAMERA_DIST,
      ballPos.y + CAMERA_HEIGHT,
      ballPos.z + this.cameraDir.z * CAMERA_DIST,
    )

    this.camera.position.lerp(desired, Math.min(1, dt * 5))

    // Look slightly ahead of the ball in its direction of travel
    const forward = new THREE.Vector3(-this.cameraDir.x, 0, -this.cameraDir.z)
    const lookAt = ballPos.clone().addScaledVector(forward, CAMERA_LOOK_AHEAD)
    this.camera.lookAt(lookAt)
  }

  private setupLights(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const sun = new THREE.DirectionalLight(0xfff0dd, 1.4)
    sun.position.set(15, 30, 10)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const sc = sun.shadow.camera as THREE.OrthographicCamera
    sc.left = sc.bottom = -40
    sc.right = sc.top = 40
    sc.near = 0.5
    sc.far = 120
    this.scene.add(sun)

    const fill = new THREE.DirectionalLight(0x6688cc, 0.3)
    fill.position.set(-10, -10, -5)
    this.scene.add(fill)
  }

  private setupResize(canvas: HTMLCanvasElement): void {
    const observer = new ResizeObserver(() => {
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    })
    observer.observe(canvas)
  }
}
