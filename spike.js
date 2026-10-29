// Spike decision test: show a spike screenshot, the tester presses F (defuse) or J (too late).
// Runs right after the HUD reaction test (app.js starts it) with its own rules page.
// Measures decision time and accuracy for the current HUD vs the redesign.
window.SpikeTest = (() => {
  const CFG = window.SPIKE_TEST;
  const $ = id => document.getElementById(id);
  const show = name => document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== name; });
  const flip = v => (v === 'current' ? 'redesign' : 'current');
  const ANSWERS = { defuse: 'Defuse', late: 'Too late' };

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Version A order: from config, or alternate current/redesign through the list.
  function buildOrderA() {
    if (CFG.orderA && CFG.orderA.length) return CFG.orderA;
    const s = CFG.situations, n = s.length, order = [];
    if (n === 2) return [[s[0].id, 'current'], [s[1].id, 'redesign'], [s[0].id, 'redesign'], [s[1].id, 'current']];
    const shift = n >= 3 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      order.push([s[k].id, 'current']);
      order.push([s[(k + shift) % n].id, 'redesign']);
    }
    return order;
  }

  const images = () => CFG.situations.flatMap(s => [s.current, s.redesign]);

  let run = null;

  // Shows the spike rules page, runs every spike trial, then calls done(rows).
  // Version B runs version A's order with every trial flipped (current <-> redesign).
  function start({ order, practice }, done) {
    const byId = Object.fromEntries(CFG.situations.map(s => [s.id, s]));
    let queue = buildOrderA().map(([id, v]) => ({ s: byId[id], version: order === 'B' ? flip(v) : v }));
    if (practice) queue = shuffle(queue.slice()).slice(0, 2);
    run = { practice, order, queue, total: queue.length, trials: [], phase: 'ready', done };
    $('sp-intro-count').textContent = `${practice ? 'Practice · ' : ''}Part 2 of 2 · ${queue.length} trials`;
    show('sp-intro');
  }

  function nextScreen() {
    if (!run.queue.length) return finish();
    run.phase = 'ready';
    $('sp-next-count').textContent = `${run.practice ? 'Practice · ' : ''}Spike trial ${run.trials.length + 1} of ${run.total}`;
    show('sp-next');
  }

  function startTrial() {
    run.current = run.queue.shift();
    $('sp-frame').hidden = true;
    $('sp-frame').src = run.current.s[run.current.version];
    $('sp-trial-count').textContent = `${run.trials.length + 1} / ${run.total}`;
    $('sp-flash').hidden = true;
    show('sp-trial');
    run.phase = 'fixation';
    run.timer = setTimeout(() => {
      $('sp-frame').hidden = false;
      requestAnimationFrame(() => {
        run.onset = performance.now();
        run.phase = 'deciding';
        // No time limit unless timeoutMs is set in spike-config.js
        if (CFG.timeoutMs) run.timer = setTimeout(() => record(null, null), CFG.timeoutMs);
      });
    }, CFG.fixationMs);
  }

  function record(choice, t) {
    clearTimeout(run.timer);
    const c = run.current;
    run.trials.push({
      timeLeft: c.s.timeLeft, version: c.version, answer: c.s.answer, choice,
      ms: choice ? Math.round(t - run.onset) : null, correct: choice === c.s.answer,
    });
    run.phase = 'flash';
    $('sp-flash').textContent = choice ? 'Got it' : 'Too slow';
    $('sp-flash').hidden = false;
    setTimeout(nextScreen, 600);
  }

  function finish() {
    clearTimeout(run.timer);
    const r = run;
    run = null;
    r.done(r.trials.map((t, i) => [i + 1, `${t.timeLeft}s left`, t.version === 'current' ? 'Current' : 'Redesign',
      ANSWERS[t.answer], t.choice ? ANSWERS[t.choice] : 'No answer', t.ms ?? '', t.correct ? 1 : 0]));
  }

  const avg = (rows, v) => { const r = rows.filter(x => x[2] === v && x[5] !== ''); return r.length ? Math.round(r.reduce((a, x) => a + x[5], 0) / r.length) : ''; };
  const acc = (rows, v) => { const r = rows.filter(x => x[2] === v); return r.length ? r.filter(x => x[6]).length / r.length : ''; };

  function tableHtml(rows) {
    if (!rows.length) return '';
    const pct = v => v === '' ? '–' : Math.round(v * 100) + '%';
    return '<thead><tr><th>Trial</th><th>Spike</th><th>Version</th><th>Right answer</th><th>Tester said</th><th>Time (ms)</th><th>Correct</th></tr></thead><tbody>' +
      rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5] === '' ? '–' : r[5]}</td><td>${r[6] ? 'Yes' : 'No'}</td></tr>`).join('') +
      `</tbody><tfoot><tr><td colspan="5">Current: average time / accuracy</td><td>${avg(rows, 'Current') || '–'}</td><td>${pct(acc(rows, 'Current'))}</td></tr>` +
      `<tr><td colspan="5">Redesign: average time / accuracy</td><td>${avg(rows, 'Redesign') || '–'}</td><td>${pct(acc(rows, 'Redesign'))}</td></tr></tfoot>`;
  }

  // One row for the SPIKE line of the results sheet: average time original/redesign,
  // accuracy (share correct, 0–1) original/redesign.
  function copyText(rows) {
    const a = v => { const x = acc(rows, v); return x === '' ? '' : +x.toFixed(2); };
    return [avg(rows, 'Current'), avg(rows, 'Redesign'), a('Current'), a('Redesign')].join('\t');
  }

  // No text cursor, selection or focus when clicking the screenshot
  $('sp-trial').addEventListener('mousedown', e => { e.preventDefault(); if (document.activeElement) document.activeElement.blur(); });

  document.addEventListener('keydown', e => {
    if (!run) return;
    if (e.key === 'Escape') { run.queue = []; return finish(); }
    if (run.phase === 'ready' && (e.code === 'Space' || e.key === 'Enter')) { e.preventDefault(); if (!e.repeat) startTrial(); return; }
    if (run.phase === 'deciding' && (e.code === 'KeyF' || e.code === 'KeyJ')) record(e.code === 'KeyF' ? 'defuse' : 'late', performance.now());
  });

  return { start, images, tableHtml, copyText };
})();
