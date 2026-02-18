# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Orb Odyssey — a 3D ball-rolling PWA game for kids. Roll a ball along circuits, collect orbs, reach the goal. Built with Three.js + Cannon-es, deployed to GitHub Pages.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173/Orb-Odyssey/
npm run build        # type-check + Vite build → dist/
npm run lint         # TypeScript type-check only (no emit)
npm test             # Vitest unit tests (run once)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright e2e tests (requires dev server or build)
```

Run a single unit test file:
```bash
npx vitest run tests/unit/core/EventBus.test.ts
```

## Architecture

**Tech stack:** Vite + TypeScript, Three.js (rendering), Cannon-es (physics), vite-plugin-pwa (PWA/service worker), Vitest (unit tests), Playwright (e2e).

**`base: '/Orb-Odyssey/'`** is set in `vite.config.ts` — required for GitHub Pages subdirectory hosting. All asset paths must be relative or use Vite's `import.meta.url`.

### Core data flow (each frame)

```
GameLoop.tick(dt)
  └─ Game.update(dt)
       ├─ InputManager.state  →  Ball.applyInput()   [apply forces]
       ├─ Level.update(dt)
       │    ├─ PhysicsWorld.step(dt)                 [simulate]
       │    ├─ Ball.sync()                           [copy body → mesh]
       │    ├─ Collectible.update() × N              [distance check]
       │    └─ emit events via EventBus
       └─ SceneManager.followTarget()                [camera lerp]
  └─ SceneManager.render()                           [Three.js draw]
```

### Key classes

| Class | File | Responsibility |
|---|---|---|
| `Game` | `src/Game.ts` | Top-level coordinator; owns all systems and wires EventBus |
| `GameLoop` | `src/core/GameLoop.ts` | `requestAnimationFrame` loop with capped delta time |
| `StateMachine` | `src/core/StateMachine.ts` | `menu → playing ↔ paused → level-complete/game-over` |
| `EventBus` | `src/core/EventBus.ts` | Decoupled pub/sub between systems |
| `InputManager` | `src/core/InputManager.ts` | Keyboard + DeviceMotion → unified `{x, y}` vector |
| `PhysicsWorld` | `src/physics/PhysicsWorld.ts` | Cannon-es world wrapper; factory methods for bodies |
| `SceneManager` | `src/renderer/SceneManager.ts` | Three.js scene, camera (with follow), lights, resize |
| `Ball` | `src/entities/Ball.ts` | Player: physics body + mesh + `sync()` + `applyInput()` |
| `Platform` | `src/entities/Platform.ts` | Static box body + mesh, created from `PlatformDef` |
| `Collectible` | `src/entities/Collectible.ts` | Bobbing orb; distance-based pickup → emits `collectible:picked` |
| `Level` | `src/levels/Level.ts` | Instantiates entities from a `LevelLayout`; owns `update()` + `dispose()` |
| `HUD` / `Menu` | `src/ui/` | DOM overlays (pointer-events: none on HUD, all on Menu) |

### Adding a level

Create `src/levels/levelN/layout.ts` exporting a `LevelLayout` object (platforms, collectibles, start/goal positions). Import it in `Game.ts` and swap `level1Layout`.

### Physics ↔ renderer separation

Physics bodies (`CANNON.Body`) and Three.js meshes are kept separate. `Ball.sync()` / platform setup copies body position/quaternion to mesh after each physics step. Never move a mesh directly — move its body.

### EventBus events

| Event | Emitter | Payload |
|---|---|---|
| `collectible:picked` | `Collectible` | `{ position: Vector3 }` |
| `level:complete` | `Level` | `{ collected: number }` |
| `ball:fell` | `Level` | `{}` |

### CI/CD

- **ci.yml** — runs on every push/PR: lint → unit tests → build → e2e tests
- **deploy.yml** — runs on `main` push: build → deploy `dist/` to `gh-pages` branch via `peaceiris/actions-gh-pages`
