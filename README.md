# HUD reaction test

Measures how fast and how accurately players react to HUD warnings, comparing the current Valorant HUD with our redesign.

- **Part 1, HUD warnings:** how fast the tester notices Low HP, Low ammo, Ability ready and Enemy spotted, and whether they name it right.
- **Part 2, spike:** how fast and how accurately the tester decides whether there is still time to defuse the spike.

Both parts run in one page, one after the other.

## Figma
Design file and demo: https://www.figma.com/design/ibswUleEnLIpKyHOHzaCC1/Valorant-HUD-Redesign?node-id=3-7&t=4q6VZOjZmuOJPoyu-1

The test images are in the `frames/` folder.

## Run it
**Testing link:** https://coffeeluvscarrot.github.io/448-Valorant-UI/ (open in Chrome or Edge)

**On your computer:** download the files and double-click `index.html`. It needs no install or internet.

Run the test in full screen: press **F11** on Windows, or **Ctrl+Cmd+F** on Mac.

## How a session works
1. Pick **Version A** or **Version B** (alternate: 1st tester A, 2nd B, 3rd A, …). Tick the box if the tester plays FPS games regularly.
2. Read the **To tester** box out loud and run the **Practice round** (2 HUD trials and 2 spike trials, not saved).
3. Press **Start test**. Part 1 starts, then part 2 follows automatically.
4. The last screen shows the results for both parts.

Press **Esc** to stop early. In part 1 it skips ahead to the spike part; in part 2 it ends the test. Finished trials are kept.

## Part 1: HUD warnings
Each trial shows a normal HUD, and a warning appears after a random wait of 2 to 6 seconds.
- The tester presses **Space** as soon as they notice it, then picks what they saw (keys **1–5** or click).
- While waiting, small orange targets pop up next to the crosshair and the tester **clicks the mouse** to shoot them, like Aim Lab. This keeps their eyes in the center like a real fight. A missed target is fine. Turn it off in `config.js` (`centerTask.enabled: false`).
- A Space press before the warning is a false start, and that same trial starts again, so the order never changes.
- There is **no time limit**: the warning stays until the tester presses Space. (Set `timeoutMs` in `config.js` to add one.)

Two problems drop in steps, like in a real fight:

| Problem | What the tester sees | Clock starts at |
|---|---|---|
| Low HP | 100 → 40 → 14 | 40 |
| Ammo | 25 → 9 → 1 | 9 |

The last step comes 2 seconds after the middle one if the tester hasn't pressed yet. Pressing at either step counts, and time is measured from the middle frame. Change the gap with `midMs` in `config.js`.

## Part 2: spike
When part 1 finishes, a spike rules page appears. Read it to the tester, then they press **Space** to start.
- Each trial shows a spike screenshot. A defuse takes 7 seconds.
- The tester decides as fast as possible: **F = I can still defuse**, **J = too late, save**.
- There is **no time limit**: the screenshot stays until the tester answers. (Set `timeoutMs` in `spike-config.js` to add one.)

| Spike | Time left | Right answer |
|---|---|---|
| 1 | 10s | Defuse |
| 2 | 8s | Defuse |
| 3 | 6s | Too late |
| 4 | 5s | Too late |
| 5 | 4s | Too late |

Each spike is shown once with the current HUD and once with the redesign (10 trials).

## Trial order
Version B is version A with every trial flipped (current ↔ redesign). Test an even number of people, half on A and half on B.

**Part 1 (set in `config.js`, `orderA`)**

| Trial | Version A | Version B |
|---|---|---|
| 1 | Map · Current | Map · Redesign |
| 2 | Ability · Redesign | Ability · Current |
| 3 | Low HP · Current | Low HP · Redesign |
| 4 | Ammo · Redesign | Ammo · Current |
| 5 | Ability · Current | Ability · Redesign |
| 6 | Map · Redesign | Map · Current |
| 7 | Ammo · Current | Ammo · Redesign |
| 8 | Low HP · Redesign | Low HP · Current |

**Part 2 (built automatically from `spike-config.js`)**

| Trial | Version A | Version B |
|---|---|---|
| 1 | 10s · Current | 10s · Redesign |
| 2 | 6s · Redesign | 6s · Current |
| 3 | 8s · Current | 8s · Redesign |
| 4 | 5s · Redesign | 5s · Current |
| 5 | 6s · Current | 6s · Redesign |
| 6 | 4s · Redesign | 4s · Current |
| 7 | 5s · Current | 5s · Redesign |
| 8 | 10s · Redesign | 10s · Current |
| 9 | 4s · Current | 4s · Redesign |
| 10 | 8s · Redesign | 8s · Current |

## End of test
The last screen has a table for each part: every trial's time (ms) and whether the answer was right, plus average time and accuracy for current vs redesign.

Pasting into the results sheet (EFFICIENCY = time in ms, ORIGINAL then REDESIGN; EFFECTIVENESS = correct, ORIGINAL then REDESIGN):
- **Copy HUD rows for Google Sheets:** click the **HP** row's first ORIGINAL cell and paste. It fills HP, AMMO, MAP and ABILITY (1 = correct, 0 = wrong).
- **Copy spike row for Google Sheets:** click the **SPIKE** row's first ORIGINAL cell and paste. Time is the average; effectiveness is the share correct (1 = all right).

## Saved results
- **View saved results** on the first page shows part 1 results: average time to notice and % correct per problem, current vs redesign.
- **All saved testers** combines everyone tested on this computer and browser. Results are saved in this browser only.
- **Download CSV** exports part 1 trials. Spike results are kept with each tester's session but are not in the CSV, so use **Copy spike row** on the last screen for them.

## Files
| File | What it does |
|---|---|
| `index.html` | The test page (open this one) |
| `config.js` | Part 1 settings: trial order, delay range, time limit, answer choices, frame files |
| `spike-config.js` | Part 2 settings: spike screenshots, time left, right answers, time limit |
| `app.js`, `spike.js`, `style.css` | The test code |
| `frames/` | The test images (1920×1080) |
| `spike.html` | Old link, now just opens `index.html` |

Frame names follow `problem-version-step`: `before` = current HUD, `after` = redesign; `normal` = nothing happening, `mid` = middle step (Low HP 40, ammo 9), `warning` / `last` = the warning frame (Low HP 14, ammo 1). Spike screenshots are in `frames/` and `frames/spike/`. The normal and warning images of a problem are the same scene, so the only thing that changes is the HUD.

To change a frame, replace the file in `frames/` with a 1920×1080 image of the same name.
