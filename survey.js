// Part 3 questionnaire: runs after the spike test (app.js starts it).
// Follows the Data Gathering lecture: a background question first, neutral labels
// (Design 1 / Design 2, sides picked at random so testers can't tell which is the
// redesign), a "No preference" option, and an open "why" question at the end.
// It asks what the reaction test can't measure: which design testers would rather
// play with, so either answer is plausible.
window.Survey = (() => {
  const $ = id => document.getElementById(id);
  const show = name => document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== name; });

  const EXPERIENCE = ['Never played', 'A few times a month or less', 'About once a week', 'Most days'];
  const LABELS = { current: 'Current', redesign: 'Redesign', none: 'No preference' };

  // One pair per problem: the full-screen warning frame from each version.
  const PAIRS = [
    { id: 'lowhp', name: 'Low health', current: 'frames/lowhp-before-warning.jpg', redesign: 'frames/lowhp-after-warning.jpg' },
    { id: 'ammo', name: 'Low ammo', current: 'frames/ammo-before-last.jpg', redesign: 'frames/ammo-after-last.jpg' },
    { id: 'ability', name: 'Ability ready', current: 'frames/ability-before-warning.jpg', redesign: 'frames/ability-after-warning.jpg' },
    { id: 'map', name: 'Enemy spotted', current: 'frames/map-before-warning.jpg', redesign: 'frames/map-after-warning.jpg' },
    { id: 'spike', name: 'Spike timer', current: 'frames/spike-before-warning.jpg', redesign: 'frames/spike-after-warning.jpg' },
  ];

  // The questionnaire screens, added to index.html (part 3).
  document.body.insertAdjacentHTML('beforeend', `
  <section id="sv-intro" class="screen panel-screen" hidden>
    <div class="panel">
      <p id="sv-intro-count" class="eyebrow">Part 3 · Question 1 of ${PAIRS.length + 2}</p>
      <h1>A few quick questions</h1>
      <p class="lead">There are no right or wrong answers. Pick what is true for you.</p>
      <h2>How often do you play Valorant?</h2>
      <div id="sv-experience" class="answers"></div>
    </div>
  </section>
  <section id="sv-pair" class="screen panel-screen" hidden>
    <div class="panel wide sv-wide">
      <p id="sv-pair-count" class="eyebrow"></p>
      <div id="sv-pair-images" class="sv-pair"></div>
      <p class="muted">Click a picture to see it full screen.</p>
      <h2>Which design would you rather have during a real match?</h2>
      <div id="sv-pair-answers" class="answers sv-row">
        <button type="button" data-i="0"><kbd>1</kbd>Design 1</button>
        <button type="button" data-i="1"><kbd>2</kbd>Design 2</button>
        <button type="button" data-i="2"><kbd>3</kbd>No preference</button>
      </div>
    </div>
  </section>
  <div id="sv-zoom" class="sv-zoom" hidden><img id="sv-zoom-img" alt=""><span id="sv-zoom-label"></span></div>
  <section id="sv-why" class="screen panel-screen" hidden>
    <div class="panel">
      <p class="eyebrow">Last question</p>
      <h2>Why did you pick those designs?</h2>
      <textarea id="sv-why-text" rows="5" placeholder="Type your answer (optional)"></textarea>
      <div class="actions"><button id="sv-finish" class="primary">Finish</button></div>
    </div>
  </section>`);

  let run = null;

  const images = () => PAIRS.flatMap(p => [p.current, p.redesign]);

  // prefix goes in front of the question count, e.g. 'Part 3 · ' inside the main test.
  function start(done, prefix = '') {
    run = {
      done, prefix, step: -1, phase: 'experience', startedAt: performance.now(),
      answers: { experience: '', prefs: [], why: '' },
      sides: PAIRS.map(() => (Math.random() < 0.5 ? ['current', 'redesign'] : ['redesign', 'current'])),
    };
    $('sv-experience').innerHTML = EXPERIENCE.map((e, i) =>
      `<button type="button" data-i="${i}"><kbd>${i + 1}</kbd>${e}</button>`).join('');
    $('sv-intro-count').textContent = `${prefix}Question 1 of ${PAIRS.length + 2}`;
    images().forEach(src => { new Image().src = src; }); // load the pictures before they're needed
    show('sv-intro');
  }

  function nextPair() {
    run.step++;
    if (run.step >= PAIRS.length) { run.phase = 'why'; show('sv-why'); $('sv-why-text').focus(); return; }
    const p = PAIRS[run.step], sides = run.sides[run.step];
    run.phase = 'pair';
    $('sv-pair-count').textContent = `${run.prefix}Question ${run.step + 2} of ${PAIRS.length + 2} · ${p.name}`;
    $('sv-pair-images').innerHTML = sides.map((v, i) =>
      `<figure><img class="sv-img" src="${p[v]}" alt="Design ${i + 1}" draggable="false"><figcaption>Design ${i + 1}</figcaption></figure>`).join('');
    show('sv-pair');
  }

  function pickExperience(i) {
    if (run?.phase !== 'experience' || !EXPERIENCE[i]) return;
    run.answers.experience = EXPERIENCE[i];
    nextPair();
  }

  function pickPref(i) {
    if (run?.phase !== 'pair' || i < 0 || i > 2) return;
    const p = PAIRS[run.step], sides = run.sides[run.step];
    run.answers.prefs.push({ problem: p.id, name: p.name, design1: sides[0], choice: i === 2 ? 'none' : sides[i] });
    nextPair();
  }

  function finish() {
    if (run?.phase !== 'why') return;
    run.answers.why = $('sv-why-text').value.trim();
    $('sv-why-text').value = '';
    const r = run;
    run = null;
    r.done(r.answers);
  }

  $('sv-experience').addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b) pickExperience(Number(b.dataset.i));
  });
  $('sv-pair-answers').addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b) pickPref(Number(b.dataset.i));
  });
  $('sv-finish').addEventListener('click', finish);

  // Click a picture to see it full screen; click again (or press Esc) to close.
  $('sv-pair-images').addEventListener('click', e => {
    const img = e.target.closest('img');
    if (img) { $('sv-zoom-img').src = img.src; $('sv-zoom-label').textContent = img.alt; $('sv-zoom').hidden = false; }
  });
  $('sv-zoom').addEventListener('click', () => { $('sv-zoom').hidden = true; });

  document.addEventListener('keydown', e => {
    // Ignore the key press that ended the spike test, which reaches this listener too
    if (!run || e.timeStamp <= run.startedAt) return;
    if (!$('sv-zoom').hidden) { if (e.key === 'Escape') $('sv-zoom').hidden = true; return; }
    if (run.phase === 'why') { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) finish(); return; }
    if (!/^[1-9]$/.test(e.key)) return;
    const i = Number(e.key) - 1;
    if (run.phase === 'experience') pickExperience(i);
    else if (run.phase === 'pair') pickPref(i);
  });

  function tableHtml(a) {
    if (!a) return '';
    return '<thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>' +
      `<tr><td>How often do you play Valorant?</td><td>${esc(a.experience)}</td></tr>` +
      a.prefs.map(p => `<tr><td>${p.name} · would rather have</td><td>${LABELS[p.choice]}</td></tr>`).join('') +
      `<tr><td>Why?</td><td class="wrap">${esc(a.why) || '–'}</td></tr></tbody>`;
  }

  // One tab-separated row: experience, then the preferred design for each problem, then the comment.
  function copyText(a) {
    if (!a) return '';
    return [a.experience, ...PAIRS.map(p => LABELS[(a.prefs.find(x => x.problem === p.id) || {}).choice] || ''),
      a.why.replace(/\s+/g, ' ')].join('\t');
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  return { start, images, tableHtml, copyText };
})();
