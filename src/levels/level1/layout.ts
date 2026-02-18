import type { LevelLayout } from '../Level'

/**
 * Level 1 — "The Circuit"
 *
 * Top-down shape (Y is up):
 *
 *  [Start]──────[Bridge 1]──────[Corner]
 *                                  │
 *                               [Ramp down]
 *                                  │
 *                              [Goal pad]
 */
export const level1Layout: LevelLayout = {
  name: 'The Circuit',
  startPosition: [0, 1.5, 0],
  goalPosition: [16, 0.5, -14],
  collectiblesRequired: 5,

  platforms: [
    // Start pad
    { position: [0, 0, 0], size: [6, 0.5, 6], color: 0x7e57c2 },

    // Bridge 1 — goes right
    { position: [9, 0, 0], size: [12, 0.5, 3.5], color: 0x5c6bc0 },

    // Corner pad
    { position: [16, 0, -1.5], size: [5, 0.5, 6], color: 0x7e57c2 },

    // Narrow bridge — goes forward/south with slight downward tilt
    { position: [16, -1, -8], size: [3, 0.5, 10], rotation: [0.08, 0, 0], color: 0x5c6bc0 },

    // Goal pad
    { position: [16, -2, -15], size: [7, 0.5, 7], color: 0x7e57c2 },
  ],

  collectibles: [
    { position: [4, 1.5, 0] },
    { position: [9, 1.5, 0] },
    { position: [14, 1.5, 0] },
    { position: [16, 0.5, -5] },
    { position: [16, -0.5, -11] },
  ],
}
