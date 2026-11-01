// HUD reaction test: shows a normal HUD frame, swaps to a warning frame after a
// random delay, times how long the tester takes to press Space, then asks what
// they noticed. The last screen shows the results to copy into Google Sheets.
(() => {
  'use strict';

  const CFG = window.HUD_TEST;
  const VERSIONS = [
    { id: 'before', label: 'Current HUD' },
    { id: 'after', label: 'Redesign' },
  ];

  const $ = id => document.getElementById(id);
  function show(name) {
    document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== name; });
  }

  // ---------- setup ----------

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function preload(srcs) {
    return Promise.all(srcs.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(null);
      img.onerror = () => resolve(src);
      img.src = src;
    }))).then(r => r.filter(Boolean));
  }

  let run = null; // the test in progress

  async function begin(practice) {
    const problems = CFG.problems;
    const picked = document.querySelector('input[name="order"]:checked');
    if (!practice && !picked) { $('setup-msg').textContent = 'Pick version A or B first.'; return; }
    const order = picked ? picked.value : 'A';

    const srcs = problems.flatMap(p => VERSIONS.flatMap(v => [p[v.id].normal, p[v.id].mid, p[v.id].warning, p[v.id].faded].filter(Boolean)))
      .concat(window.SpikeTest.images(), window.Survey.images());
    $('setup-msg').textContent = 'Loading frames…';
    const missing = await preload(srcs);
    if (missing.length) {
      $('setup-msg').textContent = `These frame files couldn't be loaded: ${missing.join(', ')}. Check the file names in config.js and spike-config.js.`;
      return;
    }
    $('setup-msg').textContent = '';

    // Fixed order from config.js. Version B is version A with every trial flipped.
    const byId = Object.fromEntries(problems.map(p => [p.id, p]));
    const flip = v => (v === 'before' ? 'after' : 'before');
    let queue = CFG.orderA.map(([id, v]) => ({ problem: byId[id], version: order === 'B' ? flip(v) : v }));
    if (practice) queue = shuffle(queue.slice()).slice(0, 2);

    run = {
      practice,
      order,
      queue,
      total: queue.length,
      done: 0,
      session: { order, trials: [] },
      falseStarts: 0,
      current: null,
      timer: null,
      onset: 0,
      phase: 'idle',
    };
    nextScreen();
  }

  $('setup-form').addEventListener('submit', e => { e.preventDefault(); begin(false); });

  // ---------- trial flow ----------
  function nextScreen() {
    if (!run) return; // Esc ended part 1 during a "Too early" / "Missed" message
    if (!run.queue.length) return finish();
    run.phase = 'ready';
    $('next-count').textContent = `${run.practice ? 'Practice · ' : ''}Trial ${run.done + 1} of ${run.total}`;
    show('next');
  }

  // ---------- center aim task ----------
  // Keeps the tester's eyes on the crosshair, like a fight would: a small target
  // pops up next to the crosshair now and then, and they click the mouse to shoot it.
  // Every target is shot the same way, so there is no colour to judge and nothing to get wrong.
  const AIM = Object.assign({ enabled: true, showMs: 1200, minGapMs: 1500, maxGapMs: 3000, radiusPx: 70 }, CFG.centerTask);

  function startTargets() {
    const c = run.current;
    c.targets = 0; c.targetHits = 0;
    if (!AIM.enabled) return;
    const next = run.nextTarget = () => {
      run.targetTimer = setTimeout(() => {
        const angle = Math.random() * Math.PI * 2, r = AIM.radiusPx * (0.5 + Math.random() * 0.5);
        const el = $('target');
        el.style.transform = `translate(${Math.round(Math.cos(angle) * r)}px, ${Math.round(Math.sin(angle) * r)}px)`;
        el.classList.remove('hit');
        el.hidden = false;
        c.targets++;
        run.target = { hit: false };
        run.targetHide = setTimeout(() => { el.hidden = true; run.target = null; next(); }, AIM.showMs);
      }, AIM.minGapMs + Math.random() * (AIM.maxGapMs - AIM.minGapMs));
    };
    next();
  }

  function stopTargets() {
    clearTimeout(run.midTimer); clearTimeout(run.fadeTimer);
    clearTimeout(run.targetTimer); clearTimeout(run.targetHide);
    $('target').hidden = true;
    run.target = null;
  }

  function shoot() {
    const t = run.target;
    if (!t || t.hit) return; // clicking with no target up does nothing
    t.hit = true;
    run.current.targetHits++;
    $('target').classList.add('hit');
    clearTimeout(run.targetHide);
    run.targetHide = setTimeout(() => { $('target').hidden = true; run.target = null; run.nextTarget(); }, 150);
  }

  function startTrial() {
    const t = run.queue.shift();
    run.current = { ...t, falseStartsBefore: run.falseStarts };
    const frames = t.problem[t.version];
    $('frame-normal').src = frames.normal;
    $('frame-warning').src = frames.warning;
    $('frame-warning').hidden = true;
    if (frames.mid) $('frame-mid').src = frames.mid; else $('frame-mid').removeAttribute('src');
    $('frame-mid').hidden = true;
    if (frames.faded) $('frame-faded').src = frames.faded; else $('frame-faded').removeAttribute('src');
    $('frame-faded').classList.remove('shown');
    $('flash').hidden = true;
    $('trial-count').textContent = `${run.done + 1} / ${run.total}`;
    show('trial');

    const delay = Math.round(CFG.minDelayMs + Math.random() * (CFG.maxDelayMs - CFG.minDelayMs));
    run.current.delayMs = delay;
    run.phase = 'waiting';
    startTargets();
    // With a "mid" frame (Low HP: 100 -> 40 -> 14) the clock starts when the mid frame
    // appears, and the warning frame follows midMs later if the tester hasn't pressed yet.
    const first = frames.mid ? 'frame-mid' : 'frame-warning';
    run.timer = setTimeout(() => {
      $(first).hidden = false;
      // Time from the frame the change is first painted in
      requestAnimationFrame(() => {
        run.onset = performance.now();
        run.phase = 'warning';
        // No time limit unless timeoutMs is set in config.js
        if (CFG.timeoutMs) run.timer = setTimeout(missed, CFG.timeoutMs);
        // Redesign glows fade after fadeMs, like in the Figma prototype; the faded frame cross-fades in
        if (frames.faded) run.fadeTimer = setTimeout(() => { if (run.phase === 'warning') $('frame-faded').classList.add('shown'); }, t.problem.fadeMs || 2000);
        if (frames.mid) run.midTimer = setTimeout(() => { if (run.phase === 'warning') $('frame-warning').hidden = false; }, t.problem.midMs || 2000);
      });
    }, delay);
  }

  function falseStart() {
    clearTimeout(run.timer);
    stopTargets();
    run.falseStarts++;
    run.queue.unshift({ problem: run.current.problem, version: run.current.version }); // same trial again, so the order stays fixed
    run.phase = 'flash';
    $('flash').textContent = 'Too early! Let\'s try that one again.';
    $('flash').hidden = false;
    setTimeout(nextScreen, 1200);
  }

  function responded(eventTime) {
    clearTimeout(run.timer); clearTimeout(run.midTimer);
    stopTargets();
    run.current.reactionMs = Math.round(eventTime - run.onset);
    run.current.missed = false;
    askQuestion();
  }

  function missed() {
    clearTimeout(run.midTimer);
    stopTargets();
    run.current.reactionMs = null;
    run.current.missed = true;
    run.phase = 'flash';
    $('flash').textContent = 'Missed';
    $('flash').hidden = false;
    setTimeout(askQuestion, 900);
  }

  function askQuestion() {
    if (!run) return;
    run.phase = 'question';
    $('q-result').textContent = run.current.missed ? 'No key press recorded' : 'Got it';
    $('answers').innerHTML = CFG.answers.map((a, i) =>
      `<button type="button" data-answer="${i}"><kbd>${i + 1}</kbd>${a}</button>`).join('');
    show('question');
  }

  function answer(i) {
    const a = CFG.answers[i];
    if (a === undefined) return;
    const c = run.current;
    run.falseStarts = 0;
    run.session.trials.push({
      position: run.done + 1,
      problem: c.problem.id,
      problemName: c.problem.name,
      version: c.version,
      delayMs: c.delayMs,
      reactionMs: c.reactionMs,
      missed: c.missed,
      answer: a,
      correct: a === c.problem.answer,
      falseStartsBefore: c.falseStartsBefore,
      targets: c.targets,
      targetHits: c.targetHits,
    });
    run.done++;
    nextScreen();
  }

  $('answers').addEventListener('click', e => {
    const b = e.target.closest('button[data-answer]');
    if (b && run?.phase === 'question') answer(Number(b.dataset.answer));
  });

  // Part 1 done: go on to the spike test (part 2, same version A/B), then the
  // questionnaire (part 3, skipped in practice), then the results.
  function finish() {
    run.phase = 'done';
    const { practice, order, session: s } = run;
    run = null;
    window.SpikeTest.start({ order, practice }, spikeRows => {
      if (practice) {
        show('setup');
        $('setup-msg').textContent = 'Practice finished. Start the real test when the tester is ready.';
        return;
      }
      s.spike = spikeRows;
      window.Survey.start(answers => {
        s.survey = answers;
        showFinal(s);
      }, 'Part 3 · ');
    });
  }

  // ---------- end of test: time and accuracy only ----------
  let finalSession = null;
  function finalRows(s) {
    return s.trials.map((t, i) => [i + 1, t.problemName, t.version === 'before' ? 'Current' : 'Redesign',
      t.missed ? '' : t.reactionMs, t.correct ? 1 : 0]);
  }
  function showFinal(s) {
    finalSession = s;
    const rows = finalRows(s);
    const avg = v => { const r = rows.filter(x => x[2] === v && x[3] !== ''); return r.length ? Math.round(r.reduce((a, x) => a + x[3], 0) / r.length) : '–'; };
    const acc = v => { const r = rows.filter(x => x[2] === v); return r.length ? Math.round(100 * r.filter(x => x[4]).length / r.length) + '%' : '–'; };
    $('final-title').textContent = `${CFG.designName ? CFG.designName + ' · ' : ''}Version ${s.order}`;
    $('final-table').innerHTML = '<thead><tr><th>Trial</th><th>Problem</th><th>Version</th><th>Time (ms)</th><th>Correct</th></tr></thead><tbody>' +
      rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3] === '' ? 'Missed' : r[3]}</td><td>${r[4] ? 'Yes' : 'No'}</td></tr>`).join('') +
      `</tbody><tfoot><tr><td colspan="3">Current: average time / accuracy</td><td>${avg('Current')}</td><td>${acc('Current')}</td></tr>` +
      `<tr><td colspan="3">Redesign: average time / accuracy</td><td>${avg('Redesign')}</td><td>${acc('Redesign')}</td></tr></tfoot>`;
    $('sp-final-table').innerHTML = window.SpikeTest.tableHtml(s.spike || []);
    $('sv-final-table').innerHTML = window.Survey.tableHtml(s.survey);
    $('final-msg').textContent = '';
    show('final');
  }
  $('copy-final').addEventListener('click', async () => {
    // Matches the results sheet: rows HP, Ammo, Map, Ability; columns
    // efficiency (time ms) original/redesign, effectiveness (correct 1/0) original/redesign.
    const rows = finalRows(finalSession);
    const cell = (name, v, col) => { const r = rows.find(x => x[1] === name && x[2] === v); return r ? r[col] : ''; };
    const text = ['Low HP', 'Ammo', 'Map / Spot Enemy', 'Ability'].map(n =>
      [cell(n, 'Current', 3), cell(n, 'Redesign', 3), cell(n, 'Current', 4), cell(n, 'Redesign', 4)].join('\t')).join('\n');
    try { await navigator.clipboard.writeText(text); $('final-msg').textContent = 'Copied. In the sheet, click the HP row\'s ORIGINAL cell under EFFICIENCY and paste. It fills HP, Ammo, Map and Ability.'; }
    catch { $('final-msg').textContent = 'Copying was blocked. Select the table and copy it by hand.'; }
  });
  $('copy-survey').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(window.Survey.copyText(finalSession.survey)); $('final-msg').textContent = 'Copied: play frequency, the preferred design for HP, Ammo, Ability, Map and Spike, then the comment. Paste it into the tester\'s row.'; }
    catch { $('final-msg').textContent = 'Copying was blocked. Select the table and copy it by hand.'; }
  });
  $('copy-spike').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(window.SpikeTest.copyText(finalSession.spike || [])); $('final-msg').textContent = 'Copied. In the sheet, click the SPIKE row\'s ORIGINAL cell under EFFICIENCY and paste.'; }
    catch { $('final-msg').textContent = 'Copying was blocked. Select the table and copy it by hand.'; }
  });
  $('final-new').addEventListener('click', () => {
    document.querySelectorAll('input[name="order"]').forEach(r => { r.checked = false; });
    $('setup-msg').textContent = '';
    show('setup');
  });

  document.addEventListener('keydown', e => {
    if (!run) return;
    if (e.key === 'Escape' && run.phase !== 'done') { // stop part 1 early, keep what's done, go on to the spike test
      e.stopImmediatePropagation();
      clearTimeout(run.timer);
      stopTargets();
      run.queue = [];
      return finish();
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (e.repeat) return;
      if (run.phase === 'ready') startTrial();
      else if (run.phase === 'waiting') falseStart();
      else if (run.phase === 'warning') responded(e.timeStamp);
      return;
    }
    if (run.phase === 'question' && /^[1-9]$/.test(e.key)) answer(Number(e.key) - 1);
  });

  $('trial').addEventListener('mousedown', e => {
    e.preventDefault(); // no text cursor, selection or focus when clicking the screen
    if (document.activeElement) document.activeElement.blur();
    if (e.button === 0 && run && (run.phase === 'waiting' || run.phase === 'warning')) shoot();
  });

  show('setup');
})();
