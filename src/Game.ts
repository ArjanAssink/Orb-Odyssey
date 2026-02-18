import * as THREE from 'three'
import { GameLoop } from './core/GameLoop'
import { InputManager } from './core/InputManager'
import { StateMachine } from './core/StateMachine'
import { EventBus } from './core/EventBus'
import { PhysicsWorld } from './physics/PhysicsWorld'
import { SceneManager } from './renderer/SceneManager'
import { Level } from './levels/Level'
import { level1Layout } from './levels/level1/layout'
import { HUD } from './ui/HUD'
import { Menu } from './ui/Menu'
import { AudioManager } from './audio/AudioManager'

// Tune these until the flick feel is right.
// Screen velocity is in px/s; impulse is in cannon-es force units.
const FLICK_SCALE = 0.005
const FLICK_MAX_IMPULSE = 12

export class Game {
  private readonly loop: GameLoop
  private readonly input: InputManager
  private readonly stateMachine: StateMachine
  private readonly bus: EventBus
  private readonly scene: SceneManager
  private readonly hud: HUD
  private readonly audio: AudioManager
  private readonly menu: Menu

  private physics: PhysicsWorld
  private level: Level | null = null

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.bus = new EventBus()
    this.input = new InputManager()
    this.stateMachine = new StateMachine()
    this.scene = new SceneManager(canvas)
    this.physics = new PhysicsWorld()
    this.hud = new HUD(uiRoot)
    this.audio = new AudioManager()

    this.menu = new Menu(uiRoot, () => this.startLevel())

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.scene.render(),
    )

    this.bus.on('collectible:picked', () => {
      if (!this.level) return
      this.audio.playCollect()
      this.hud.setScore(this.level.collectedCount, this.level.requiredCount)
    })

    this.bus.on('level:complete', () => {
      this.stateMachine.transition('level-complete')
      this.audio.playLevelComplete()
      this.hud.showMessage('You did it! 🎉', 'Tap to play again')
    })

    this.bus.on('ball:fell', () => {
      this.level?.respawn()
    })

    uiRoot.addEventListener('click', () => {
      if (this.stateMachine.state === 'level-complete') {
        this.hud.hideMessage()
        this.stateMachine.transition('playing')
        this.startLevel()
      }
    })

    this.loop.start()
  }

  private startLevel(): void {
    this.audio.init()
    this.level?.dispose()
    this.bus.clear()

    this.bus.on('collectible:picked', () => {
      if (!this.level) return
      this.audio.playCollect()
      this.hud.setScore(this.level.collectedCount, this.level.requiredCount)
    })
    this.bus.on('level:complete', () => {
      this.stateMachine.transition('level-complete')
      this.audio.playLevelComplete()
      this.hud.showMessage('You did it! 🎉', 'Tap to play again')
    })
    this.bus.on('ball:fell', () => {
      this.level?.respawn()
    })

    this.physics = new PhysicsWorld()
    this.level = new Level(level1Layout, this.physics, this.scene.scene, this.bus)
    this.hud.setScore(0, level1Layout.collectiblesRequired)

    if (this.stateMachine.state === 'menu') {
      this.stateMachine.transition('playing')
    }
  }

  private update(dt: number): void {
    if (this.stateMachine.state !== 'playing' || !this.level) return

    // Desktop: continuous force from keyboard
    this.level.ball.applyInput(this.input.state)

    // Touch: one-shot impulse projected from screen space into world space
    const flick = this.input.consumeFlick()
    if (flick) {
      // Get camera's world-space right and forward vectors (projected onto XZ)
      const camForward = new THREE.Vector3()
      this.scene.camera.getWorldDirection(camForward)
      camForward.y = 0
      const fwdLen = camForward.length()
      if (fwdLen > 0.001) {
        camForward.divideScalar(fwdLen)
        const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0))

        // Screen right (+VX) → camera right; screen up (−VY) → camera forward
        const ix = (camRight.x * flick.screenVX - camForward.x * flick.screenVY) * FLICK_SCALE
        const iz = (camRight.z * flick.screenVX - camForward.z * flick.screenVY) * FLICK_SCALE

        // Clamp magnitude
        const mag = Math.sqrt(ix * ix + iz * iz)
        const clamp = mag > FLICK_MAX_IMPULSE ? FLICK_MAX_IMPULSE / mag : 1
        this.level.ball.applyImpulse(ix * clamp, iz * clamp)
      }
    }

    this.level.update(dt)

    const vel = this.level.ball.body.velocity
    this.scene.followBall(this.level.ball.position, vel.x, vel.z, dt)
  }

  destroy(): void {
    this.loop.stop()
    this.input.destroy()
    this.level?.dispose()
  }
}
