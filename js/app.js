// Friction v2 — app shell: state, screens, storage. No dependencies.
import { CORE, INVERSION, COST, STAGES, LENSES, ZONES, CONSEQUENCE_WHY, LEVERAGE_WHY, CONFIDENCE, LEARNING_OPTIONS, LEARNING_RESPONSES } from './content.js';
import { analyze, pickFollowups, isComplete, mechanisms } from './engine.js';

const STORAGE = 'friction.v2';
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => Math.round(n).toLocaleString();

const state = {
  screen: 'arrival', q: 0, answers: {}, cost: { managers: '', hours: '', rate: '' }, result: null,
  learn: { outcome: null, note: '' }, history: load(),
};
function load() { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; } }
function persist() { try { localStorage.setItem(STORAGE, JSON.stringify(state.history)); } catch {} }

/* ---------- the question queue (adaptive) ---------- */
function coreAnswersForGate() {
  const a = {};
  for (const q of CORE) if (q.type === 'single' && q.mech && (state.answers[q.id] || []).length) a[q.mech] = q.options[state.answers[q.id][0]].s;
  return a;
}
function queue() {
  const gate = coreAnswersForGate();
  const core = CORE.filter(q => !q.when || q.when(gate));
  const coreDone = core.every(q => isComplete(q, state.answers));
  const follow = coreDone ? pickFollowups(state.answers) : [];
  return [...core, ...follow, INVERSION];
}
const TOTAL = () => queue().length + 2; // + cost + result

function progressFor() {
  if (state.screen === 'question') return state.q / TOTAL();
  if (state.screen === 'cost') return (TOTAL() - 1) / TOTAL();
  if (state.screen === 'result') return 1;
  return 0;
}
function stageFor() {
  if (state.screen === 'question') return STAGES[queue()[state.q].stage];
  if (state.screen === 'cost') return STAGES[5];
  if (state.screen === 'result') return { code: '●', name: 'Diagnosis' };
  if (state.screen === 'learning') return { code: '07', name: 'Learning' };
  return null;
}

/* ---------- rendering ---------- */
let rendering = false, pending = false;
function go(screen, extra = {}) { if (rendering) return; Object.assign(state, extra, { screen }); render(); }
async function render() {
  if (rendering) { pending = true; return; }
  rendering = true;
  try {
    const cur = app.firstElementChild;
    if (cur && !reduced) { cur.classList.add('leaving'); await wait(190); }
    app.innerHTML = SCREENS[state.screen]();
    app.querySelector('.stagger') || app.firstElementChild?.classList.add('stagger');
    bind(); updateChrome();
    document.body.dataset.q = state.screen === 'question' ? queue()[state.q].id : state.screen;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    const h = app.querySelector('h1'); if (h) $('#announce').textContent = h.textContent;
  } finally { rendering = false; if (pending) { pending = false; render(); } }
}
function updateChrome() {
  const st = stageFor();
  $('#stageCode').textContent = st ? `${st.code} — ${st.name}` : '';
  const pct = Math.round(progressFor() * 100);
  $('#progressFill').style.width = pct + '%'; $('#progress').setAttribute('aria-valuenow', pct);
  $('#actionbar')?.remove();
  const primary = app.querySelector('.nav .btn-primary');
  if (primary) {
    const bar = document.createElement('div'); bar.className = 'actionbar on'; bar.id = 'actionbar';
    const b = primary.cloneNode(true); b.removeAttribute('id'); bar.appendChild(b); document.body.appendChild(bar);
    b.addEventListener('click', () => primary.click()); b.disabled = primary.disabled;
  }
}
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- screens ---------- */
const SCREENS = {
  arrival() {
    const last = state.history.at(-1);
    const returnCard = last && !last.closed ? `
      <section class="card" style="margin-bottom:2rem">
        <p class="eyebrow">Welcome back</p>
        <h2 class="display md">Last time, your primary friction was <em>${esc(ZONES[last.zone].name)}</em>.</h2>
        <p class="lede" style="margin-top:.7rem;font-size:1rem">The constraint: <strong>${esc(last.constraint)}</strong>. Your move was: <strong>${esc(last.move)}</strong></p>
        <div class="cta-row" style="margin-top:1.2rem">
          <button class="btn btn-deep" data-go="learning">Did the friction decrease? <span class="arr">→</span></button>
          <button class="btn-link" data-go="begin">Run a new diagnosis</button>
        </div>
      </section>` : '';
    return `<section class="screen hero stagger">
      ${returnCard}
      <p class="eyebrow">Find what's getting in the way</p>
      <h1 class="display xl">Something isn't working.<br><em>Let's find out why.</em></h1>
      <svg class="wave" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 Q 37 4 75 20 T 150 20 T 225 20 T 300 20 T 375 20 T 450 20 T 525 20 T 600 20"/></svg>
      <div class="lines">
        <p>Most organizations don't have a shortage of effort.</p>
        <p>They have friction between what the business needs, how the system operates, and what people are able to do.</p>
        <p>Three lenses. Nine questions. One useful diagnosis.</p>
      </div>
      <div class="cta-row">
        <button class="btn btn-primary" data-go="begin">Begin <span class="arr">→</span></button>
        <button class="btn-link" data-go="how">How this works</button>
      </div>
    </section>`;
  },

  how() {
    return `<section class="screen stagger">
      <p class="eyebrow">How this works</p>
      <h1 class="display lg">A guided diagnosis, not an assessment.</h1>
      <p class="lede" style="margin-top:1rem">Nine questions about observable behaviour, a few follow-ups where your answers point, and one inversion question. About three minutes. No score, no name, no email. Everything stays in this browser.</p>
      <div class="lens-reads" style="margin:1.4rem 0">
        ${['B', 'S', 'P'].map(k => `<div class="lens-row lens-${k}"><span class="lens-dot"></span><b>${LENSES[k].name}</b><span>${esc(LENSES[k].line)}</span></div>`).join('')}
      </div>
      <p class="lede" style="font-size:1rem">The problem usually isn't entirely inside one lens. It's the gap between them. That gap is where the diagnosis focuses: where the friction is, why it's happening, and what to do next.</p>
      <div class="nav"><button class="btn btn-ghost" data-go="arrival">← Back</button><button class="btn btn-primary" data-go="begin">Begin <span class="arr">→</span></button></div>
    </section>`;
  },

  question() {
    const list = queue(); const q = list[state.q];
    const sel = state.answers[q.id] || [];
    const multi = q.type === 'multi';
    const intro = q.intro ? `<div class="intro"><p class="kicker">${esc(q.intro.kicker)}</p><p class="line">${esc(q.intro.line)}</p></div>` : '';
    return `<section class="screen stagger">
      ${intro}
      <p class="eyebrow ${q.lens ? 'lens-' + q.lens : ''}">${esc(q.eyebrow)}</p>
      <h1 class="display md q-title">${esc(q.title)}</h1>
      ${q.help ? `<p class="help">${esc(q.help)}</p>` : ''}
      <div class="choices" role="group" aria-label="${esc(q.title)}">
        ${q.options.map((o, i) => `<button class="choice ${multi ? 'multi' : ''} ${q.lens ? 'lens-' + q.lens : ''}" data-opt="${i}" aria-pressed="${sel.includes(i)}">
          <span class="ind"></span><span class="txt"><span class="t">${esc(o.t)}</span>${o.sub ? `<span class="sub">${esc(o.sub)}</span>` : ''}</span></button>`).join('')}
      </div>
      <div class="nav">
        <button class="btn btn-ghost" data-back>← Back</button>
        <span class="count">${state.q + 1} / ${list.length}${q.max ? ` · <span class="cap">${capText(q, sel)}</span>` : ''}</span>
        <button class="btn btn-primary" data-next ${isComplete(q, state.answers) ? '' : 'disabled'}>Continue <span class="arr">→</span></button>
      </div>
    </section>`;
  },

  cost() {
    return `<section class="screen stagger">
      <p class="eyebrow">${esc(COST.eyebrow)}</p>
      <h1 class="display md q-title">${esc(COST.title)}</h1>
      <p class="help">${esc(COST.help)}</p>
      <div class="fields">
        ${COST.fields.map(f => `<label class="field"><span>${esc(f.label)}</span><input type="number" inputmode="decimal" min="${f.min}" max="${f.max}" step="any" data-cost="${f.key}" placeholder="${esc(f.placeholder)}" value="${esc(state.cost[f.key])}"></label>`).join('')}
      </div>
      <div class="nav">
        <button class="btn btn-ghost" data-back>← Back</button>
        <button class="btn btn-ghost" data-reveal data-skip>Skip</button>
        <button class="btn btn-primary" data-reveal>See your diagnosis <span class="arr">→</span></button>
      </div>
    </section>`;
  },

  result() {
    const r = state.result; const Z = ZONES[r.zone]; const play = r.play;
    const conf = CONFIDENCE[r.confidence];
    const exp = (title, sub, body, cls = '') => `<details class="more ${cls}"><summary><b>${title}</b>${sub ? `<span class="sum-line">${sub}</span>` : ''}<i class="caret"></i></summary><div class="more-body">${body}</div></details>`;
    const step = (n, name, tag) => `<div class="step-head"><span class="step-n">${n}</span><span class="step-name">${name}</span>${tag ? `<span class="step-tag">${tag}</span>` : ''}</div>`;
    const est = r.estimate;
    const lensRow = k => `<div class="bar"><b>${LENSES[k].name}<small>${esc(LENSES[k].line)}</small></b><div class="track"><div class="fill" style="--c:var(--lens-${k})" data-w="${Math.round(15 + 85 * r.lensNorm[k])}"></div></div></div>`;
    return `<section class="screen result journey">

      <div class="jstep stagger">
        ${step('01', 'Your primary friction', Z.label)}
        <h1 class="display lg edge-name">${esc(Z.name)}</h1>
        <p class="lead">${esc(Z.summary)}</p>
        ${frictionMap(r)}
        <div class="conf conf-${r.confidence}"><span class="conf-k">Diagnosis confidence</span><span class="conf-v">${conf.label}</span><span class="conf-d">${esc(conf.d)}</span></div>
        <div class="expanders">
          ${exp('What this zone means', esc(Z.label), `<p>${esc(Z.detail)}</p>${r.coherence ? '' : `<p class="quiet">Close behind it: <strong>${esc(ZONES[r.secondary].name)}</strong>. ${esc(ZONES[r.secondary].summary)}</p>`}`)}
          ${exp('How to read this map', 'Three lenses, and the gaps between them', `<p>Each corner is a lens: a question the organization has to be able to answer. The pools show how much friction your answers placed in each one. The friction point sits on the gap where the two sides pull against each other hardest, because the problem is rarely inside one lens. It's between them.</p><div class="bars">${lensRow('B')}${lensRow('S')}${lensRow('P')}</div><p class="quiet">This is a hypothesis built from your answers, not a measurement of your organization. The strongest way to test it is to take the question at the end to the people closest to the work.</p>`)}
        </div>
      </div>

      <div class="jstep stagger">
        ${step('02', 'The constraint', 'Why it\'s happening')}
        <h2 class="display md">${esc(play.constraint)}</h2>
        <p class="lead">${esc(play.diagnosis)}</p>
        <ol class="chain" aria-label="Causal chain">${play.chain.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
        <div class="forces">
          <p class="eyebrow">What's reinforcing it</p>
          <ul>${r.forces.map(f => `<li class="${f.src === 'pattern' ? '' : 'from-you'}"><span>${esc(f.t)}</span>${f.src !== 'pattern' ? `<small>from your answers</small>` : ''}</li>`).join('')}</ul>
        </div>
      </div>

      <div class="jstep stagger">
        ${step('03', 'What it\'s costing', 'The business consequence')}
        <ul class="cons">${play.consequences.map(c => `<li><b>${esc(c)}</b><span>${esc(CONSEQUENCE_WHY[c] || '')}</span></li>`).join('')}</ul>
        ${est ? `<div class="estimate">
            <p class="eyebrow">Illustrative estimate</p>
            <p class="est-line">${fmt(est.managers)} managers × ${fmt(est.hours)} hours a week × 48 weeks</p>
            <p class="est-big">${fmt(est.hoursYear)} hours a year</p>
            ${est.dollars ? `<p class="est-big est-sun">≈ $${fmt(est.dollars)} a year</p><p class="quiet">at $${fmt(est.rate)} per loaded hour</p>` : ''}
            <p class="quiet">Illustrative estimate based on your inputs, not a financial audit. The point isn't precision. It's that the cost of friction is real and mostly uncounted.</p>
          </div>` : `<p class="quiet" style="margin-top:.8rem">You skipped the estimate. Even a rough one makes this tangible: managers × hours a week × 48.</p>`}
        <div class="leverage">
          <p class="eyebrow">What that capacity could be doing instead</p>
          <p>You're not only losing time. You're losing what the time could have gone to:</p>
          <ul>${play.leverage.map(l => `<li><b>${esc(l)}</b><span>${esc(LEVERAGE_WHY[l])}</span></li>`).join('')}</ul>
        </div>
      </div>

      <div class="jstep stagger">
        ${step('04', 'Possible blind spot', 'What everyone may have learned to accept')}
        <div class="blind">
          <p class="eyebrow">A hypothesis worth testing</p>
          <h2 class="display md">${esc(play.blind)}</h2>
          <p>Sometimes the hardest thing to see is what everyone has learned to accept. If this sounds familiar, the friction has probably been normalised long enough that it no longer registers as a problem.</p>
        </div>
      </div>

      <div class="jstep stagger">
        ${step('05', 'What not to do', 'The fix that would make it worse')}
        <div class="dont">
          <p class="dont-t">${esc(play.notDo.t)}</p>
          <p>${esc(play.notDo.d)}</p>
        </div>
      </div>

      <div class="jstep stagger">
        ${step('06', 'One move', 'The smallest meaningful intervention')}
        <p class="eyebrow">Guiding principle</p>
        <p class="policy">${esc(play.policy)}</p>
        <div class="card move">
          <p class="t">${esc(play.move.t)}</p>
          <ol class="steps">${play.move.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        </div>
      </div>

      <div class="jstep stagger">
        ${step('07', 'One question', 'Take it into the business')}
        <p class="q-inv">${esc(play.question)}</p>
      </div>

      <div class="jstep stagger">
        ${step('08', 'One metric to watch', 'Did the friction decrease?')}
        <div class="metric"><p class="metric-t">${esc(play.metric.t)}</p><p>${esc(play.metric.d)}</p></div>
      </div>

      <div class="jstep stagger">
        ${step('09', 'Learn', 'Close the loop')}
        <div class="card">
          <div class="loop"><b>Signal</b><i>→</i>Understand<i>→</i>Decide<i>→</i>Act<i>→</i><b>Learn</b></div>
          <p class="lede" style="font-size:1rem">Treat the move as an experiment. Run it, watch the metric, and come back. The goal isn't a better score. It's to find out whether the gap has narrowed. This page will remember where you left off.</p>
          <div class="rule"></div>
          <div class="result-actions">
            <button class="btn btn-deep" data-copy>Copy diagnosis</button>
            <button class="btn btn-ghost" data-go="begin">Run it again</button>
            <span class="saved">✓ Saved on this device</span>
          </div>
          <p class="quiet" style="margin-top:1.2rem">Don't work harder on the symptom. Find the constraint. The thinking behind this: <a href="https://matthew-schmidt-production.up.railway.app/#lenses" rel="noopener">The Three Lenses, the Blind Spot and the Learning Loop</a>.</p>
        </div>
      </div>
    </section>`;
  },

  learning() {
    const last = state.history.at(-1); const o = state.learn.outcome;
    return `<section class="screen stagger">
      <p class="eyebrow">07 — Learning</p>
      <h1 class="display lg">Did the friction decrease?</h1>
      <div class="card recap" style="margin-top:1.4rem">
        <div class="row"><span class="k">Last time · ${esc(fmtDate(last.at))}</span><span class="v">${esc(ZONES[last.zone].name)} · ${esc(ZONES[last.zone].label)}</span></div>
        <div class="row"><span class="k">The constraint</span><span class="v">${esc(last.constraint)}</span></div>
        <div class="row"><span class="k">Your move</span><span class="v">${esc(last.move)}</span></div>
        <div class="row"><span class="k">The metric</span><span class="v">${esc(last.metric)}</span></div>
      </div>
      <p class="eyebrow" style="margin-top:2rem">What happened?</p>
      <div class="choices" role="group" aria-label="What happened?">
        ${LEARNING_OPTIONS.map(x => `<button class="choice" data-outcome="${x.key}" aria-pressed="${o === x.key}"><span class="ind"></span><span class="txt"><span class="t">${esc(x.t)}</span></span></button>`).join('')}
      </div>
      ${o ? `<div class="response">${esc(LEARNING_RESPONSES[o])}</div>
      <p class="eyebrow" style="margin-top:1.8rem">What did you learn?</p>
      <label class="sr-only" for="learnNote">What did you learn?</label>
      <textarea id="learnNote" placeholder="What changed? What surprised you?">${esc(state.learn.note)}</textarea>
      <p class="help">That's your next signal.</p>` : ''}
      <div class="nav">
        <button class="btn btn-ghost" data-go="arrival">← Back</button>
        <button class="btn btn-primary" data-close-loop ${o ? '' : 'disabled'}>Run Friction again <span class="arr">→</span></button>
      </div>
    </section>`;
  },
};

/* ---------- the map ---------- */
function frictionMap(r) {
  const V = { B: [200, 44], S: [352, 290], P: [48, 290] };
  const lbl = { B: [200, 22], S: [352, 324], P: [48, 324] };
  const on = r.coherence ? ['BS', 'SP', 'PB'] : [r.zone];
  const edges = ['BS', 'SP', 'PB'].map(k => {
    const { a, b } = ZONES[k];
    const primary = on.includes(k);
    return `<line class="edge ${primary ? 'primary' : k === r.secondary ? 'secondary' : ''}" x1="${V[a][0]}" y1="${V[a][1]}" x2="${V[b][0]}" y2="${V[b][1]}" stroke-width="${primary ? (r.coherence ? 5 : 7) : 1.5}"/>`;
  }).join('');
  const lit = r.coherence ? ['B', 'S', 'P'] : [ZONES[r.zone].a, ZONES[r.zone].b];
  const pools = ['B', 'S', 'P'].map(k => {
    const o = lit.includes(k); const rad = 8 + 22 * r.lensNorm[k];
    return `<g class="pool-c"><circle cx="${V[k][0]}" cy="${V[k][1]}" r="${rad.toFixed(1)}" fill="var(--lens-${k})" opacity="${o ? .22 : .1}"/><circle cx="${V[k][0]}" cy="${V[k][1]}" r="6" fill="var(--lens-${k})" opacity="${o ? 1 : .45}"/></g>`;
  }).join('');
  let fx, fy;
  if (r.coherence) { fx = 200; fy = 208; }
  else { const { a, b } = ZONES[r.zone]; const wa = r.lensNorm[a] + .01, wb = r.lensNorm[b] + .01; let tt = wb / (wa + wb); tt = .3 + .4 * tt; fx = V[a][0] + (V[b][0] - V[a][0]) * tt; fy = V[a][1] + (V[b][1] - V[a][1]) * tt; }
  const labelAbove = fy > 200;
  return `<svg class="map" viewBox="0 0 400 340" role="img" aria-label="Friction map: ${ZONES[r.zone].name}">
    ${edges}${pools}
    ${['B', 'S', 'P'].map(k => `<text class="vertex ${lit.includes(k) ? 'on' : ''}" x="${lbl[k][0]}" y="${lbl[k][1]}" text-anchor="middle">${LENSES[k].name.toUpperCase()}</text>`).join('')}
    <g class="fp"><circle class="ring" cx="${fx}" cy="${fy}" r="14"/><circle class="ring r2" cx="${fx}" cy="${fy}" r="14"/><circle cx="${fx}" cy="${fy}" r="9" fill="var(--sun)" stroke="#fff" stroke-width="3"/></g>
    <text class="fp-label" x="${fx}" y="${labelAbove ? fy - 24 : fy + 34}" text-anchor="middle">FRICTION</text>
  </svg>`;
}

/* ---------- behaviour ---------- */
function bind() {
  app.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { const to = b.dataset.go; if (to === 'begin') return begin(); go(to); }));
  app.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => choose(+b.dataset.opt)));
  app.querySelector('[data-back]')?.addEventListener('click', back);
  app.querySelector('[data-next]')?.addEventListener('click', next);
  app.querySelectorAll('[data-cost]').forEach(i => i.addEventListener('input', e => { state.cost[e.target.dataset.cost] = e.target.value; }));
  app.querySelectorAll('[data-reveal]').forEach(b => b.addEventListener('click', () => reveal(b.hasAttribute('data-skip'))));
  app.querySelector('[data-copy]')?.addEventListener('click', copySummary);
  app.querySelectorAll('[data-outcome]').forEach(b => b.addEventListener('click', () => { state.learn.outcome = b.dataset.outcome; render(); }));
  app.querySelector('#learnNote')?.addEventListener('input', e => { state.learn.note = e.target.value; });
  app.querySelector('[data-close-loop]')?.addEventListener('click', closeLoop);
  requestAnimationFrame(() => app.querySelectorAll('.bar .fill').forEach(f => { f.style.width = f.dataset.w + '%'; }));
}
function enable(sel, on) { const b = app.querySelector(sel); if (b) b.disabled = !on; const bar = $('#actionbar .btn'); if (bar) bar.disabled = !on; }
function capText(q, sel) { return q.max ? `${sel.length} of ${q.max} chosen` : ''; }
function nudge(i) {
  const b = app.querySelector(`[data-opt="${i}"]`); if (!b) return;
  b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge');
  const cap = app.querySelector('.cap'); if (cap) cap.textContent = 'Deselect one to choose another';
}

function begin() {
  state.answers = {}; state.cost = { managers: '', hours: '', rate: '' }; state.result = null;
  go('question', { q: 0 });
}
function choose(i) {
  const q = queue()[state.q]; const cur = state.answers[q.id] || [];
  let nextSel;
  if (q.type === 'multi') {
    if (cur.includes(i)) nextSel = cur.filter(x => x !== i);
    else if (q.max && cur.length >= q.max) { nudge(i); return; }
    else nextSel = [...cur, i];
  } else nextSel = [i];
  state.answers[q.id] = nextSel;
  app.querySelectorAll('[data-opt]').forEach(b => b.setAttribute('aria-pressed', nextSel.includes(+b.dataset.opt)));
  enable('[data-next]', nextSel.length > 0);
  const cap = app.querySelector('.cap'); if (cap) cap.textContent = capText(q, nextSel);
  if (q.type === 'single' && !reduced) setTimeout(next, 260);
}
function next() {
  const list = queue(); const q = list[state.q];
  if (!isComplete(q, state.answers)) return;
  // clear answers to questions that are no longer in the path (e.g. execution_why after changing execution)
  const after = queue();
  if (state.q < after.length - 1) go('question', { q: state.q + 1 });
  else go('cost');
}
function back() {
  if (state.screen === 'cost') return go('question', { q: queue().length - 1 });
  if (state.q === 0) return go('arrival');
  go('question', { q: state.q - 1 });
}
function reveal(skip) {
  const cost = skip ? null : { managers: +state.cost.managers || 0, hours: +state.cost.hours || 0, rate: +state.cost.rate || 0 };
  // drop answers to questions not on the final path
  const ids = new Set(queue().map(q => q.id));
  for (const k of Object.keys(state.answers)) if (!ids.has(k)) delete state.answers[k];
  const r = analyze(state.answers, cost);
  state.result = r;
  state.history.push({ at: Date.now(), zone: r.zone, constraint: r.play.constraint, move: r.play.move.t, question: r.play.question, metric: r.play.metric.t, confidence: r.confidence, lens: r.lensNorm, closed: false });
  if (state.history.length > 12) state.history = state.history.slice(-12);
  persist();
  go('result');
}
function closeLoop() {
  const last = state.history.at(-1);
  last.closed = true; last.outcome = state.learn.outcome; last.learned = state.learn.note.trim(); last.closedAt = Date.now();
  persist(); state.learn = { outcome: null, note: '' }; begin();
}
function summaryText() {
  const r = state.result; const Z = ZONES[r.zone]; const p = r.play; const e = r.estimate;
  return [
    'FRICTION DIAGNOSIS', '',
    `PRIMARY FRICTION: ${Z.name} — ${Z.label}`, Z.summary, `Confidence: ${CONFIDENCE[r.confidence].label}`, '',
    `THE CONSTRAINT: ${p.constraint}`, p.diagnosis, '', 'Causal chain: ' + p.chain.join(' → '), '',
    'What\'s reinforcing it:', ...r.forces.map(f => `  · ${f.t}`), '',
    'What it\'s costing: ' + p.consequences.join(', '),
    e ? `Illustrative estimate: ${fmt(e.hoursYear)} hours a year${e.dollars ? ` (≈ $${fmt(e.dollars)})` : ''} — based on your inputs, not an audit.` : '', '',
    `POSSIBLE BLIND SPOT: ${p.blind}`, '',
    `WHAT NOT TO DO: ${p.notDo.t} ${p.notDo.d}`, '',
    `GUIDING PRINCIPLE: ${p.policy}`, `ONE MOVE: ${p.move.t}`, ...p.move.steps.map((s, i) => `  ${i + 1}. ${s}`), '',
    `ONE QUESTION: ${p.question}`, '', `ONE METRIC: ${p.metric.t}. ${p.metric.d}`, '',
    'Signal → Understand → Decide → Act → Learn', location.origin + location.pathname,
  ].filter(x => x !== null).join('\n');
}
async function copySummary() {
  const b = app.querySelector('[data-copy]');
  try { await navigator.clipboard.writeText(summaryText()); b.textContent = 'Copied'; }
  catch { b.textContent = 'Select and copy'; window.prompt('Your diagnosis', summaryText()); }
  setTimeout(() => { b.textContent = 'Copy diagnosis'; }, 1800);
}
function fmtDate(ts) { try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return ''; } }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.screen === 'how') go('arrival'); });
render();
