# HUD reaction test

Compares the current Valorant HUD with our redesign: how fast and how accurately players react to HUD warnings.

- **Part 1, HUD warnings:** the tester notices Low HP, Low ammo, Ability ready or Enemy spotted, and names it.
- **Part 2, spike:** the tester decides if there is still time to defuse the spike.
- **Part 3, questions:** for each warning, the tester says which design they would rather play with, and why.

All three parts run on one page, one after the other.

## Links
- **Testing link:** https://coffeeluvscarrot.github.io/448-Valorant-UI/ (open in Chrome or Edge)
- **Figma:** https://www.figma.com/design/ibswUleEnLIpKyHOHzaCC1/Valorant-HUD-Redesign?node-id=3-7&t=4q6VZOjZmuOJPoyu-1
  - Click the **Expand UI** icon at the top left to see every page. Click **Present** at the top right to play the prototype.

You can also download the files and double-click `index.html`. It needs no install or internet.

## Running a session
**Interviewer sets up**
1. Open the testing link in full screen (**F11** on Windows, **Ctrl+Cmd+F** on Mac).
2. Pick **Version A** or **Version B**: 1st tester A, 2nd B, 3rd A, and so on.
3. Hand the computer to the tester.

**Tester takes the test**

4. The tester reads the **To tester** rules on their own and presses **Start test**. Interviewers don't explain anything, so every tester gets the same instructions.
5. When part 1 ends, the spike rules page appears. The tester reads it and presses **Space** to start part 2.
6. After part 2, the tester answers the questions (part 3).
7. The results screen appears. The tester hands the computer back to the interviewer.

**Interviewer records the results**

8. Paste the results into the Google Sheet with the three copy buttons (see **Results** below).

Press **Esc** to stop early. In part 1 it skips to the spike part; in part 2 it skips to the questions.

## Part 1: HUD warnings (8 trials)
- A warning appears on the HUD after a random 2–6 seconds.
- The tester presses **Space** as soon as they notice it, then picks what they saw (keys **1–5**).
- While waiting, the tester clicks the mouse to shoot small targets near the crosshair, to keep their eyes in the center.
- Pressing Space before the warning is a false start, and the same trial starts again.

## Part 2: spike (10 trials)
- Each trial shows a spike screenshot. A defuse takes 7 seconds.
- The tester presses **Space** as soon as they've decided, then presses **1** if they can still defuse or **2** if it's too late. The time is measured to the Space press.
- Each spike is shown once with the current HUD and once with the redesign.

| Spike | Time left | Right answer |
|---|---|---|
| 1 | 10s | Defuse |
| 2 | 8s | Defuse |
| 3 | 6s | Too late |
| 4 | 5s | Too late |
| 5 | 4s | Too late |

There is no time limit in either part.

## Part 3: questions
Written to follow the Data Gathering lecture: a background question first, neutral wording, and an open question last. It asks what the reaction test can't measure (which design testers would rather play with), so either answer is plausible.
1. How often do you play Valorant? (keys **1–4**)
2. For Low health, Low ammo, Ability ready, Enemy spotted and Spike timer, the tester sees two full-screen screenshots labeled **Design 1** and **Design 2** (click one to see it full screen). Which side shows the redesign is random each time, so testers can't tell which one we made. "Which design would you rather have during a real match?" Design 1 / Design 2 / No preference (keys **1–3**)
3. Why did you pick those designs? (typed, optional)

Practice runs skip part 3.

## Trial order
Version B is version A with every trial flipped (current ↔ redesign). Test an even number of people, half on A and half on B.

**Part 1**

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

**Part 2**

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

## Results
The last screen shows each trial's time (ms) and whether the answer was right, plus the average time and accuracy for current vs redesign.

To fill the results sheet (EFFICIENCY = time in ms, EFFECTIVENESS = correct; ORIGINAL then REDESIGN):
- **Copy HUD rows for Google Sheets:** click the **HP** row's first ORIGINAL cell and paste. It fills HP, AMMO, MAP and ABILITY.
- **Copy spike row for Google Sheets:** click the **SPIKE** row's first ORIGINAL cell and paste.
- **Copy answers for Google Sheets:** one row with the play frequency, the preferred design (Current / Redesign / No preference) for HP, Ammo, Ability, Map and Spike, then the comment.

## Files
| File | What it does |
|---|---|
| `index.html` | The test page |
| `config.js` | Part 1 settings and images |
| `spike-config.js` | Part 2 settings and images |
| `app.js`, `spike.js`, `survey.js`, `style.css` | The test code |
| `frames/` | The test images (1920×1080) |
