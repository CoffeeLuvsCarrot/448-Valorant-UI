// Test settings. Edit this file to change the test; no other file needs to change.
//
// frames/ holds 1080p PNGs exported from Figma (page "7 · Combined HUD", section
// "Reaction test frames"). To change a frame, edit it there, re-export it with the same name.
// "normal" is what the tester sees first; "warning" is the frame that appears
// after a random delay. The tester presses Space when they notice the change.

window.HUD_TEST = {
  // Which redesign these frames show
  designName: 'Final version',
  // The warning appears after a random wait between these two times (milliseconds)
  minDelayMs: 2000,
  maxDelayMs: 6000,

  // Fixed trial order. Version A runs this list as written; version B runs the same
  // list with every trial flipped (current <-> redesign). 'before' = current HUD,
  // 'after' = redesign.
  orderA: [
    ['map', 'before'],
    ['ability', 'after'],
    ['lowhp', 'before'],
    ['ammo', 'after'],
    ['ability', 'before'],
    ['map', 'after'],
    ['ammo', 'before'],
    ['lowhp', 'after'],
  ],

  // Time limit to press Space after the warning (milliseconds). 0 = no time limit,
  // the warning stays until the tester presses Space.
  timeoutMs: 0,

  // Center aim task: a small target pops up next to the crosshair now and then,
  // and the tester clicks the mouse to shoot it. It keeps their eyes in the center,
  // like a real fight. Set enabled: false to turn it off.
  centerTask: {
    enabled: true,
    showMs: 1200,     // how long each target stays up
    minGapMs: 1500,   // wait between targets (random between min and max)
    maxGapMs: 3000,
    radiusPx: 70,     // how far from the crosshair targets can appear
  },

  // Choices for "What did you notice?". Keys 1-5 pick them.
  answers: [
    'Low HP',
    'Low ammo',
    'Ability ready',
    'Enemy spotted',
    'Nothing / not sure',
  ],

  problems: [
    {
      id: 'lowhp',
      name: 'Low HP',
      answer: 'Low HP',
      // HP drops 100 -> 40 -> 14. The clock starts at 40; 14 follows midMs later if not pressed yet.
      midMs: 2000,
      before: { normal: 'frames/lowhp-before-normal.jpg', mid: 'frames/lowhp-before-mid.jpg', warning: 'frames/lowhp-before-warning.jpg' },
      after:  { normal: 'frames/lowhp-after-normal.jpg',  mid: 'frames/lowhp-after-mid.jpg',  warning: 'frames/lowhp-after-warning.jpg' },
    },
    {
      id: 'ammo',
      name: 'Ammo',
      answer: 'Low ammo',
      // Ammo drops 25 -> 9 -> 1. The clock starts at 9; 1 follows midMs later if not pressed yet.
      midMs: 2000,
      before: { normal: 'frames/ammo-before-normal.jpg', mid: 'frames/ammo-before-warning.jpg', warning: 'frames/ammo-before-last.jpg' },
      after:  { normal: 'frames/ammo-after-normal.jpg',  mid: 'frames/ammo-after-warning.jpg',  warning: 'frames/ammo-after-last.jpg' },
    },
    {
      id: 'ability',
      name: 'Ability',
      answer: 'Ability ready',
      before: { normal: 'frames/ability-before-normal.jpg', warning: 'frames/ability-before-warning.jpg' },
      after:  { normal: 'frames/ability-after-normal.jpg',  warning: 'frames/ability-after-warning.jpg' },
    },
    {
      id: 'map',
      name: 'Map / Spot Enemy',
      answer: 'Enemy spotted',
      before: { normal: 'frames/map-before-normal.jpg', warning: 'frames/map-before-warning.jpg' },
      after:  { normal: 'frames/map-after-normal.jpg',  warning: 'frames/map-after-warning.jpg' },
    },
  ],
};
