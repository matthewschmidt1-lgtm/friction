// Friction — app shell: state, screens, storage. No dependencies.
import { QUESTIONS, STAGES, LENSES, LENS_DEPTH, EDGES, DECISIONS, DECISION_DEPTH, QUESTION_WHY, LEARNING_OPTIONS, LEARNING_RESPONSES } from './content.js';
import { analyze, isComplete } from './engine.js';

const STORAGE = 'friction.v1';
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  screen: 'arrival', q: 0, answers: {}, other: {}, decision: null, result: null,
  learn: { outcome: null, note: '' },
  history: load(),
};

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; }
}
function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify(state.history)); } catch {}
}

const TOTAL_STEPS = QUESTIONS.length + 2; // questions + decision + result
function progressFor() {
  if (state.screen === 'question') return state.q / TOTAL_STEPS;
  if (state.screen === 'decision') return QUESTIONS.length / TOTAL_STEPS;
  if (state.screen === 'result') return 1;
  return 0;
}
function stageFor() {
  if (state.screen === 'question') return STAGES[QUESTIONS[state.q].stage];
  if (state.screen === 'decision') return STAGES[3];
  if (state.screen === 'result') return STAGES[4];
  if (state.screen === 'learning') return { code: '07', name: 'Learning' };
  return null;
}

/* ---------- rendering ---------- */
let rendering = false, pending = false;
// Navigation is ignored while a transition is in flight, so a double tap can't skip a step.
function go(screen, extra = {}) {
  if (rendering) return;
  Object.assign(state, extra, { screen });
  render();
}

// A render requested mid-transition is queued and replayed once the current one lands.
async function render() {
  if (rendering) { pending = true; return; }
  rendering = true;
  try {
    const cur = app.firstElementChild;
    if (cur && !reduced) { cur.classList.add('leaving'); await wait(190); }
    app.innerHTML = SCREENS[state.screen]();
    app.querySelector('.stagger') || app.firstElementChild?.classList.add('stagger');
    bind();
    updateChrome();
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    const h = app.querySelector('h1');
    if (h) $('#announce').textContent = h.textContent;
  } finally {
    rendering = false;
    if (pending) { pending = false; render(); }
  }
}

function updateChrome() {
  const st = stageFor();
  $('#stageCode').textContent = st ? `${st.code} — ${st.name}` : '';
  const pct = Math.round(progressFor() * 100);
  $('#progressFill').style.width = pct + '%';
  $('#progress').setAttribute('aria-valuenow', pct);
  const bar = $('#actionbar');
  if (bar) bar.remove();
  const primary = app.querySelector('.nav .btn-primary');
  if (primary) {
    const clone = document.createElement('div');
    clone.className = 'actionbar on'; clone.id = 'actionbar';
    const b = primary.cloneNode(true); b.removeAttribute('id');
    clone.appendChild(b); document.body.appendChild(clone);
    b.addEventListener('click', () => primary.click());
    b.disabled = primary.disabled;
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
        <h2 class="display md">Last time, your primary friction was <em>${esc(EDGES[last.primary].name)}</em>.</h2>
        <p class="lede" style="margin-top:.7rem;font-size:1rem">Your next move was: <strong>${esc(last.move.t)}</strong></p>
        <div class="cta-row" style="margin-top:1.2rem">
          <button class="btn btn-deep" data-go="learning">What happened? <span class="arr">→</span></button>
          <button class="btn-link" data-go="begin">Start a new diagnosis</button>
        </div>
      </section>` : '';
    return `<section class="screen hero stagger">
      ${returnCard}
      <p class="eyebrow">Find what's getting in the way</p>
      <h1 class="display xl">Something isn't working.<br><em>Let's find out why.</em></h1>
      <svg class="wave" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 Q 37 4 75 20 T 150 20 T 225 20 T 300 20 T 375 20 T 450 20 T 525 20 T 600 20"/></svg>
      <div class="lines">
        <p>Maybe you don't know why.</p>
        <p>Maybe you have a pretty good idea.</p>
        <p>Maybe everyone has a different explanation.</p>
        <p>Let's find out what's actually getting in the way.</p>
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
      <p class="lede" style="margin-top:1rem">Nine questions, about three minutes. No score. No name, title or email. Everything stays in this browser.</p>
      <div class="stages">
        ${STAGES.map((s, i) => `<div class="stage-row"><code>${s.code}</code><div><b>${s.name}</b><span>${[
          'What\'s happening?', 'What might we be assuming?', 'Business · System · People', 'What matters most?', 'Where is it breaking?', 'What will you change?'][i]}</span></div></div>`).join('')}
        <div class="stage-row"><code>07</code><div><b>Learning</b><span>Come back after you've acted. What changed becomes the next signal.</span></div></div>
      </div>
      <p class="quiet">Built on a simple idea: understand the problem deeply, find the signal through the noise, then build something better.</p>
      <div class="nav"><button class="btn btn-ghost" data-go="arrival">← Back</button><button class="btn btn-primary" data-go="begin">Begin <span class="arr">→</span></button></div>
    </section>`;
  },

  question() {
    const q = QUESTIONS[state.q];
    const sel = state.answers[q.id] || [];
    const multi = q.type === 'multi';
    const intro = q.intro ? `<div class="intro"><p class="kicker">${esc(q.intro.kicker)}</p><p class="line">${esc(q.intro.line)}</p></div>` : '';
    const otherIdx = q.options.findIndex(o => o.other);
    const showOther = otherIdx > -1 && sel.includes(otherIdx);
    return `<section class="screen stagger">
      ${intro}
      <p class="eyebrow ${q.lens ? 'lens-' + q.lens : ''}">${esc(q.eyebrow)}</p>
      <h1 class="display lg q-title">${esc(q.title)}</h1>
      ${q.help ? `<p class="help">${esc(q.help)}</p>` : ''}
      <div class="choices" role="group" aria-label="${esc(q.title)}">
        ${q.options.map((o, i) => `<button class="choice ${multi ? 'multi' : ''} ${o.lens ? 'lens-' + o.lens : ''} ${q.lens ? 'lens-' + q.lens : ''}" data-opt="${i}" aria-pressed="${sel.includes(i)}">
          <span class="ind"></span>
          <span class="txt">${o.lens ? `<span class="lens-tag">${LENSES[o.lens].verb}</span>` : ''}<span class="t">${esc(o.t)}</span>${o.sub ? `<span class="sub">${esc(o.sub)}</span>` : ''}</span>
        </button>`).join('')}
      </div>
      ${showOther ? `<div class="other-wrap"><label class="sr-only" for="other">Tell us in a few words</label><input id="other" type="text" maxlength="120" placeholder="In a few words, optional" value="${esc(state.other[q.id] || '')}" autocomplete="off"></div>` : ''}
      <div class="nav">
        <button class="btn btn-ghost" data-back>← Back</button>
        <span class="count">${state.q + 1} / ${QUESTIONS.length}${q.max ? ` · <span class="cap">${capText(q, sel)}</span>` : ''}</span>
        <button class="btn btn-primary" data-next ${isComplete(q, state.answers) ? '' : 'disabled'}>Continue <span class="arr">→</span></button>
      </div>
    </section>`;
  },

  decision() {
    const a = analyze(state.answers, null);
    return `<section class="screen stagger">
      <div class="intro"><p class="kicker">You've told us what you're seeing. Now the part we can't do without you.</p><p class="line">The pattern points somewhere. Only you can say whether it's right.</p></div>
      <p class="eyebrow">What's the real problem?</p>
      <h1 class="display lg q-title">Which feels closest?</h1>
      <div class="statements" role="group" aria-label="Which feels closest?">
        ${a.decisionsRanked.map(k => `<button class="statement" data-decision="${k}" aria-pressed="${state.decision === k}">${esc(DECISIONS[k].t)}</button>`).join('')}
      </div>
      <div class="nav">
        <button class="btn btn-ghost" data-back>← Back</button>
        <button class="btn btn-primary" data-reveal ${state.decision ? '' : 'disabled'}>Show me the map <span class="arr">→</span></button>
      </div>
    </section>`;
  },

  result() {
    const r = state.result;
    const P = EDGES[r.primary], S = EDGES[r.secondary];
    const names = { B: 'Business', S: 'System', P: 'People' };
    const goalQ = QUESTIONS[0]; const gi = (state.answers.goal || [])[0];
    const goal = gi != null ? (goalQ.options[gi].other && state.other.goal ? state.other.goal : goalQ.options[gi].t) : null;
    const symptomQ = QUESTIONS[1]; const symptoms = (state.answers.symptoms || []).map(i => symptomQ.options[i].t);
    const book = (b, label = 'From the reading') => b ? `<div class="book"><span class="book-k">${label}</span><span class="book-t">${esc(b.title)}${b.author ? ` <span class="book-a">· ${esc(b.author)}</span>` : ''}</span><p>${esc(b.idea)}</p></div>` : '';
    const evidence = (key) => {
      const rows = r.evidence[key] || [];
      if (!rows.length) return '';
      return `<div class="evidence"><span class="k">What pointed here</span><ul>${rows.map(x => `<li><i class="dot ${x.lens ? 'lens-' + x.lens : ''}"></i><span><q>${esc(x.t)}</q><small>${esc(x.q)}</small></span></li>`).join('')}</ul></div>`;
    };
    const lensRead = (k) => {
      const L = LENS_DEPTH[k];
      return `<details class="more lens-${k}"><summary><span class="lens-dot"></span><b>${names[k]}</b><span class="sum-line">${esc(LENSES[k].line)}</span><i class="caret"></i></summary><div class="more-body"><p>${esc(L.what)}</p><p><strong>When it's weak.</strong> ${esc(L.weak)}</p>${book(L.book)}${book(L.book2, 'And')}</div></details>`;
    };
    return `<section class="screen result">
      <div class="stagger">
        <p class="eyebrow">05 — Friction</p>
        <h1 class="display lg">Your Friction Map</h1>
        <p class="lede" style="margin-top:.6rem">${goal ? `You came here to improve <strong>${esc(goal.toLowerCase())}</strong>. ` : ''}${symptoms.length ? `You described ${symptoms.length === 1 ? 'one symptom' : symptoms.length + ' symptoms'}, and your answers concentrated where two lenses meet.` : 'Here\'s where your answers concentrated.'}</p>
      </div>
      <div class="card map-wrap stagger">
        ${frictionMap(r)}
        <div class="bars">
          ${['B', 'S', 'P'].map(k => `<div class="bar"><b>${names[k]}<small>${LENSES[k].verb}</small></b><div class="track"><div class="fill" style="--c:var(--lens-${k})" data-w="${Math.round(20 + 80 * r.lensNorm[k])}"></div></div></div>`).join('')}
        </div>
        <details class="more how-read"><summary><b>How to read this</b><span class="sum-line">The three lenses, and why the friction is drawn between them</span><i class="caret"></i></summary>
          <div class="more-body">
            <p>Each corner is a lens: a question the organization has to be able to answer. The pools show how strongly your answers pulled toward each one. The friction point sits on the edge where the pull was strongest, because the interesting problems rarely live inside one lens. They live in the gap between two, where one lens is asking for something the other isn't built to give.</p>
            <div class="lens-reads">${lensRead('B')}${lensRead('S')}${lensRead('P')}</div>
          </div>
        </details>
      </div>

      <div class="card friction-block stagger">
        <div class="friction-item primary">
          <span class="k">Primary friction</span><span class="n">${esc(P.name)}</span>
          <p class="lead">${esc(P.primary)}</p>
          ${evidence(r.primary)}
          <p><strong>What this usually looks like.</strong> ${esc(P.looksLike)}</p>
          <details class="more"><summary><b>Go deeper</b><span class="sum-line">The mechanism, and the reading behind it</span><i class="caret"></i></summary>
            <div class="more-body"><p>${esc(P.mechanism)}</p>${book(P.book)}${book(P.book2, 'And')}</div>
          </details>
        </div>
        <div class="friction-item">
          <span class="k">Secondary friction</span><span class="n">${esc(S.name)}</span>
          <p class="lead">${esc(S.secondary)}</p>
          ${evidence(r.secondary)}
          <details class="more"><summary><b>Go deeper</b><span class="sum-line">What this usually looks like</span><i class="caret"></i></summary>
            <div class="more-body"><p>${esc(S.looksLike)}</p><p>${esc(S.mechanism)}</p>${book(S.book)}</div>
          </details>
        </div>
        ${r.hypothesisNote ? `<div class="hyp ${r.hypothesisNote.kind}">${esc(r.hypothesisNote.t)}</div>` : ''}
        <div class="decision-echo"><span class="k">The real problem, in your words</span><p class="n-sm">“${esc(DECISIONS[r.decision].t)}”</p><p>${esc(DECISION_DEPTH[r.decision])}</p></div>
      </div>

      <div class="blind stagger">
        <p class="eyebrow">Your likely blind spot</p>
        <h2 class="display md">${esc(r.blind.t)}</h2>
        <p>${esc(r.blind.why)}</p>
        <details class="more on-dark"><summary><b>Go deeper</b><span class="sum-line">Why this is hard to see, and what to do about it</span><i class="caret"></i></summary>
          <div class="more-body"><p>${esc(r.blind.deeper)}</p>${book(r.blind.book)}</div>
        </details>
      </div>

      <div class="stagger">
        <p class="eyebrow">06 — Action</p>
        <h2 class="display lg">One question. One move.</h2>
        <p class="lede" style="margin-top:.6rem">Not a list of recommendations. One question worth sitting with, and one change small enough to make this month.</p>
      </div>
      <div class="card action-grid stagger">
        <div><p class="eyebrow">The question to investigate</p><p class="q-inv">${esc(r.question)}</p>
          <details class="more"><summary><b>Why this question</b><i class="caret"></i></summary><div class="more-body"><p>${esc(QUESTION_WHY[r.decision])}</p></div></details>
        </div>
        <div class="rule" style="margin:.4rem 0"></div>
        <div class="move"><p class="eyebrow">Your next move</p><p class="t">${esc(r.move.t)}</p><p class="d">${esc(r.move.d)}</p>
          <details class="more"><summary><b>How to do it</b><span class="sum-line">Three steps, and what to watch for</span><i class="caret"></i></summary>
            <div class="more-body"><ol class="steps">${r.move.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol><p class="watch"><strong>You'll know it worked when</strong> ${esc(r.move.watch)}</p>${book(r.move.book)}</div>
          </details>
        </div>
      </div>

      <div class="card stagger">
        <p class="eyebrow">Don't stop at the diagnosis</p>
        <div class="loop"><b>Signal</b><i>→</i>Understanding<i>→</i>Decision<i>→</i>Action<i>→</i><b>Learning</b></div>
        <p class="lede" style="font-size:1rem">Come back after you've acted. What changed, what surprised you and what you learned becomes the next signal. This page will remember where you left off.</p>
        <div class="rule"></div>
        <div class="result-actions">
          <button class="btn btn-deep" data-copy>Copy summary</button>
          <button class="btn btn-ghost" data-expand>Expand everything</button>
          <button class="btn btn-ghost" data-go="begin">Start again</button>
          <span class="saved" id="savedNote">✓ Saved on this device</span>
        </div>
        <p class="quiet" style="margin-top:1.2rem">The thinking behind this: <a href="https://matthew-schmidt-production.up.railway.app/" rel="noopener">The Three Lenses, the Blind Spot and the Learning Loop</a>. The reading it draws on: <em>High Output Management</em>, <em>How Google Works</em>, <em>Trillion Dollar Coach</em>, <em>What the CEO Wants You to Know</em>, <em>The 15 Commitments of Conscious Leadership</em> and <em>Poor Charlie's Almanack</em>.</p>
      </div>
    </section>`;
  },

  learning() {
    const last = state.history.at(-1);
    const o = state.learn.outcome;
    return `<section class="screen stagger">
      <p class="eyebrow">07 — Learning</p>
      <h1 class="display lg">Close the loop.</h1>
      <div class="card recap" style="margin-top:1.4rem">
        <div class="row"><span class="k">Last time · ${esc(fmtDate(last.at))}</span><span class="v">Primary friction: ${esc(EDGES[last.primary].name)}</span></div>
        <div class="row"><span class="k">You identified</span><span class="v">“${esc(DECISIONS[last.decision].t)}”</span></div>
        <div class="row"><span class="k">Your next move</span><span class="v">${esc(last.move.t)}</span></div>
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
        <button class="btn btn-primary" data-close-loop ${o ? '' : 'disabled'}>Run it again <span class="arr">→</span></button>
      </div>
    </section>`;
  },
};

/* ---------- the map ---------- */
function frictionMap(r) {
  const V = { B: [200, 48], S: [352, 300], P: [48, 300] };
  const lbl = { B: [200, 24, 'middle'], S: [352, 336, 'middle'], P: [48, 336, 'middle'] };
  const edges = ['BS', 'SP', 'PB'].map(k => {
    const { a, b } = EDGES[k];
    const cls = k === r.primary ? 'primary' : k === r.secondary ? 'secondary' : '';
    const w = 1.5 + 9 * r.edgeNorm[k];
    return `<line class="edge ${cls}" x1="${V[a][0]}" y1="${V[a][1]}" x2="${V[b][0]}" y2="${V[b][1]}" stroke-width="${w.toFixed(1)}"/>`;
  }).join('');
  const pools = ['B', 'S', 'P'].map(k => {
    const rad = 10 + 30 * r.lensNorm[k];
    return `<g class="pool-c"><circle cx="${V[k][0]}" cy="${V[k][1]}" r="${rad.toFixed(1)}" fill="var(--lens-${k})" opacity=".22"/><circle cx="${V[k][0]}" cy="${V[k][1]}" r="6" fill="var(--lens-${k})"/></g>`;
  }).join('');
  const { a, b } = EDGES[r.primary];
  const wa = r.lensNorm[a] + .01, wb = r.lensNorm[b] + .01;
  let t = wb / (wa + wb); t = .3 + .4 * t; // keep it on the edge, biased toward the heavier lens
  const fx = V[a][0] + (V[b][0] - V[a][0]) * t, fy = V[a][1] + (V[b][1] - V[a][1]) * t;
  const labelAbove = fy > 200;
  return `<svg class="map" viewBox="0 0 400 360" role="img" aria-label="Friction map: primary friction ${EDGES[r.primary].name}, secondary ${EDGES[r.secondary].name}">
    ${edges}${pools}
    ${['B', 'S', 'P'].map(k => `<text class="vertex" x="${lbl[k][0]}" y="${lbl[k][1]}" text-anchor="${lbl[k][2]}">${LENSES[k].name.toUpperCase()}</text>`).join('')}
    <g class="fp"><circle class="ring" cx="${fx}" cy="${fy}" r="14"/><circle class="ring r2" cx="${fx}" cy="${fy}" r="14"/><circle cx="${fx}" cy="${fy}" r="9" fill="var(--sun)" stroke="#fff" stroke-width="3"/></g>
    <text class="fp-label" x="${fx}" y="${labelAbove ? fy - 24 : fy + 34}" text-anchor="middle">FRICTION</text>
  </svg>`;
}

/* ---------- behaviour ---------- */
function bind() {
  app.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    const to = b.dataset.go;
    if (to === 'begin') return begin();
    go(to);
  }));
  app.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => choose(+b.dataset.opt)));
  app.querySelector('[data-back]')?.addEventListener('click', back);
  app.querySelector('[data-next]')?.addEventListener('click', next);
  app.querySelector('#other')?.addEventListener('input', e => { state.other[QUESTIONS[state.q].id] = e.target.value; });
  app.querySelectorAll('[data-decision]').forEach(b => b.addEventListener('click', () => {
    state.decision = b.dataset.decision;
    app.querySelectorAll('[data-decision]').forEach(x => x.setAttribute('aria-pressed', x === b));
    enable('[data-reveal]', true);
  }));
  app.querySelector('[data-reveal]')?.addEventListener('click', reveal);
  app.querySelector('[data-copy]')?.addEventListener('click', copySummary);
  app.querySelector('[data-expand]')?.addEventListener('click', e => {
    const all = [...app.querySelectorAll('details.more')]; const open = all.some(d => !d.open);
    all.forEach(d => { d.open = open; }); e.target.textContent = open ? 'Collapse everything' : 'Expand everything';
  });
  app.querySelectorAll('[data-outcome]').forEach(b => b.addEventListener('click', () => {
    state.learn.outcome = b.dataset.outcome; render();
  }));
  app.querySelector('#learnNote')?.addEventListener('input', e => { state.learn.note = e.target.value; });
  app.querySelector('[data-close-loop]')?.addEventListener('click', closeLoop);
  requestAnimationFrame(() => app.querySelectorAll('.bar .fill').forEach(f => { f.style.width = f.dataset.w + '%'; }));
}

function enable(sel, on) {
  const b = app.querySelector(sel); if (b) b.disabled = !on;
  const bar = $('#actionbar .btn'); if (bar) bar.disabled = !on;
}

function begin() {
  state.answers = {}; state.other = {}; state.decision = null; state.result = null;
  go('question', { q: 0 });
}

function choose(i) {
  const q = QUESTIONS[state.q];
  const cur = state.answers[q.id] || [];
  let nextSel;
  if (q.type === 'multi') {
    if (cur.includes(i)) nextSel = cur.filter(x => x !== i);
    else if (q.max && cur.length >= q.max) { nudge(i); return; }
    else nextSel = [...cur, i];
  }
  else nextSel = [i];
  state.answers[q.id] = nextSel;
  const hasOther = q.options.some(o => o.other);
  if (hasOther) { render(); return; } // re-render to show/hide the free-text line
  app.querySelectorAll('[data-opt]').forEach(b => b.setAttribute('aria-pressed', nextSel.includes(+b.dataset.opt)));
  enable('[data-next]', nextSel.length > 0);
  const cap = app.querySelector('.cap'); if (cap) cap.textContent = capText(q, nextSel);
  if (q.type === 'single' && !reduced) setTimeout(next, 260);
}
function capText(q, sel) { return q.max ? `${sel.length} of ${q.max} chosen` : ''; }
function nudge(i) {
  const b = app.querySelector(`[data-opt="${i}"]`); if (!b) return;
  b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge');
  const cap = app.querySelector('.cap'); if (cap) cap.textContent = `Deselect one to choose another`;
}

function next() {
  const q = QUESTIONS[state.q];
  if (!isComplete(q, state.answers)) return;
  if (state.q < QUESTIONS.length - 1) go('question', { q: state.q + 1});
  else go('decision');
}
function back() {
  if (state.screen === 'decision') return go('question', { q: QUESTIONS.length - 1 });
  if (state.q === 0) return go('arrival');
  go('question', { q: state.q - 1 });
}

function reveal() {
  if (!state.decision) return;
  const r = analyze(state.answers, state.decision);
  state.result = r;
  const gi = (state.answers.goal || [])[0];
  state.history.push({
    at: Date.now(), primary: r.primary, secondary: r.secondary, decision: r.decision,
    blind: r.blind.t, question: r.question, move: r.move, lens: r.lensNorm,
    goal: gi != null ? QUESTIONS[0].options[gi].t : null, closed: false,
  });
  if (state.history.length > 12) state.history = state.history.slice(-12);
  persist();
  go('result');
}

function closeLoop() {
  const last = state.history.at(-1);
  last.closed = true; last.outcome = state.learn.outcome; last.learned = state.learn.note.trim(); last.closedAt = Date.now();
  persist();
  state.learn = { outcome: null, note: '' };
  begin();
}

function summaryText() {
  const r = state.result; const P = EDGES[r.primary], S = EDGES[r.secondary];
  const ev = k => (r.evidence[k] || []).map(x => `  · ${x.t}`).join('\n');
  return [
    'FRICTION — Your Friction Map', '',
    `PRIMARY FRICTION: ${P.name}`, P.primary, 'What pointed here:', ev(r.primary), '',
    `SECONDARY FRICTION: ${S.name}`, S.secondary, ev(r.secondary) ? 'What pointed here:\n' + ev(r.secondary) : '', '',
    `THE REAL PROBLEM (your words): ${DECISIONS[r.decision].t}`, '',
    `LIKELY BLIND SPOT: ${r.blind.t}`, r.blind.why, '', r.blind.deeper, '',
    `THE QUESTION TO INVESTIGATE: ${r.question}`, '',
    `NEXT MOVE: ${r.move.t}`, r.move.d, ...r.move.how.map((h, i) => `  ${i + 1}. ${h}`), `You'll know it worked when ${r.move.watch}`, '',
    'Signal → Understanding → Decision → Action → Learning',
    location.origin + location.pathname,
  ].join('\n');
}
async function copySummary() {
  const b = app.querySelector('[data-copy]');
  try { await navigator.clipboard.writeText(summaryText()); b.textContent = 'Copied'; }
  catch { b.textContent = 'Select and copy'; window.prompt('Your summary', summaryText()); }
  setTimeout(() => { b.textContent = 'Copy summary'; }, 1800);
}

function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return ''; }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.screen === 'how') go('arrival');
});

render();
