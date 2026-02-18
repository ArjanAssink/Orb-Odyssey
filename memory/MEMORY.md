# Orb Odyssey — Key Patterns

## Stack
Vite + TypeScript, Three.js (rendering), Cannon-es (physics), vite-plugin-pwa, Vitest, Playwright.
Node.js not installed — user needs to run `brew install node` first.

## Critical config
- `base: '/Orb-Odyssey/'` in vite.config.ts — required for GitHub Pages subdirectory
- Deploy via `peaceiris/actions-gh-pages@v4` writing to `gh-pages` branch

## Physics ↔ renderer rule
Never move a Three.js mesh directly. Move its Cannon-es body; call `body.sync()` after each physics step to copy position/quaternion.

## EventBus pattern
Game.ts calls `bus.clear()` before re-registering listeners when restarting a level (to avoid duplicate handlers).

## Level layout
Levels are plain `LevelLayout` objects in `src/levels/levelN/layout.ts`. Add a new level by creating a layout and importing it in Game.ts.
