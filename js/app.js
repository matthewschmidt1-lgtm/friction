// Friction v3 — app shell. The user sees a conversation; the engine sees hypotheses.
import { LENSES, ZONES, ZONE_BY_CONSTRAINT, HYPOTHESES, COST, STAGES, CONSEQUENCE_WHY, LEVERAGE_WHY, LOW_FRICTION, OUTCOME_OPTIONS, INVERSION, CHAIN_STAGES, STAGE_ROLE, BLIND_RESULT_OPTIONS, COUNTERFACTUALS } from './content.js';
import { newSession, applyAnswer, undoLast, nextQuestion, progress, diagnose, applyOutcome, confidences, byId } from './engine.js';

const STORAGE = 'friction.v3';
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => Math.round(n).toLocaleString();

const state = {
  screen: 'arrival', session: newSession(), current: null, sel: [],
  cost: { managers: '', hours: '', rate: '', revenue: 'Prefer not to say', profit: 'Prefer not to say' },
  result: null, learn: { results: {}, note: '', outcome: null, blind: null }, history: load(),
};
function load() { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; } }
function persist() { try { localStorage.setItem(STORAGE, JSON.stringify(state.history)); } catch {} }

/* ---------- chrome ---------- */
function stageFor() {
  if (state.screen === 'question') { const q = state.current; if (!q) return null; if (q.opener) return STAGES[0]; if (q.terminal) return STAGES[4]; return { B: STAGES[1], S: STAGES[2], P: STAGES[3] }[q.lens] || STAGES[0]; }
  if (state.screen === 'cost') return STAGES[5];
  if (state.screen === 'result') return { code: '●', name: 'Diagnosis' };
  if (state.screen === 'learning') return { code: '07', name: 'Learning' };
  return null;
}
function progressFor() {
  if (state.screen === 'question') return progress(state.session);
  if (state.screen === 'cost') return .93;
  if (state.screen === 'result') return 1;
  return 0;
}
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
    document.body.dataset.q = state.screen === 'question' ? state.current.id : state.screen;
    bind(); updateChrome();
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
const hypName = h => HYPOTHESES[h].name;

/* ---------- screens ---------- */
const SCREENS = {
  arrival() {
    const last = state.history.at(-1);
    const returnCard = last && !last.closed ? `
      <section class="card" style="margin-bottom:2rem">
        <p class="eyebrow">Welcome back</p>
        <h2 class="display md">Last time, the read was: <em>${esc(last.constraint)}</em>.</h2>
        <p class="lede" style="margin-top:.7rem;font-size:1rem">You were going to test: <strong>${esc(last.experimentTitle)}</strong>, watching ${last.watch.length} things over ${last.days} days.</p>
        <div class="cta-row" style="margin-top:1.2rem">
          <button class="btn btn-deep" data-go="learning">What happened? <span class="arr">→</span></button>
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
        <p>Three lenses. About ten questions, chosen as you answer. One hypothesis worth testing.</p>
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
      <h1 class="display lg how-title">A diagnosis that forms hypotheses, not a questionnaire that produces a score.</h1>
      <p class="lede" style="margin-top:1rem">Friction starts from what you're seeing, forms several possible explanations, and asks the question most likely to tell them apart. It stops when one explanation is clearly ahead, usually after nine to twelve questions and about four minutes. No score, no name, no email. Everything stays in this browser.</p>
      <div class="mission">
        <p class="mission-label">The goal</p>
        <p class="mission-t">Friction creates a mechanism for directing attention and problem-solving capacity toward the highest-value problems and opportunities.</p>
      </div>
      <div class="lens-reads" style="margin:1.4rem 0">
        ${['B', 'S', 'P'].map(k => `<div class="lens-row lens-${k}"><span class="lens-dot"></span><b>${LENSES[k].name}</b><span>${esc(LENSES[k].line)}</span></div>`).join('')}
      </div>
      <p class="lede" style="font-size:1rem">The result is a current read: what appears to be getting in the way, why we believe it, what we're still uncertain about, and one thing to test. Then you come back and tell us what happened, and the read updates. Friction is willing to change its mind.</p>
      <div class="nav"><button class="btn btn-ghost" data-go="arrival">← Back</button><button class="btn btn-primary" data-go="begin">Begin <span class="arr">→</span></button></div>
    </section>`;
  },

  question() {
    const q = state.current; const sel = state.sel;
    const multi = !!q.multi;
    const intro = q.intro ? `<div class="intro"><p class="kicker">${esc(q.intro.kicker)}</p><p class="line">${esc(q.intro.line)}</p></div>` : '';
    const n = state.session.asked.length + 1;
    return `<section class="screen stagger">
      ${intro}
      <p class="eyebrow ${q.lens ? 'lens-' + q.lens : ''}">${esc(q.eyebrow)}</p>
      <h1 class="display md q-title">${esc(q.title)}</h1>
      ${q.help ? `<p class="help">${esc(q.help)}</p>` : ''}
      <div class="choices" role="group" aria-label="${esc(q.title)}">
        ${q.options.map((o, i) => `<button class="choice ${multi ? 'multi' : ''} ${q.lens ? 'lens-' + q.lens : ''}" data-opt="${i}" aria-pressed="${sel.includes(i)}"><span class="ind"></span><span class="txt"><span class="t">${esc(o.t)}</span></span></button>`).join('')}
      </div>
      <div class="nav">
        <button class="btn btn-ghost" data-back>← Back</button>
        <span class="count">Question ${n}${q.max ? ` · <span class="cap">${capText(q, sel)}</span>` : ''}</span>
        <button class="btn btn-primary" data-next ${sel.length ? '' : 'disabled'}>Continue <span class="arr">→</span></button>
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
        ${COST.ranges.map(r => `<label class="field"><span>${esc(r.label)}</span><select data-cost="${r.key}">${r.options.map(o => `<option ${state.cost[r.key] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`).join('')}
      </div>
      <p class="quiet">Ranges only. The diagnosis works without them; with them, the economic read gets sharper.</p>
      <div class="nav">
        <button class="btn btn-ghost" data-back>← Back</button>
        <button class="btn btn-ghost" data-reveal data-skip>Skip</button>
        <button class="btn btn-primary" data-reveal>See the read <span class="arr">→</span></button>
      </div>
    </section>`;
  },

  result() {
    const r = state.result; const play = r.play; const Z = ZONES[r.zone]; const exp = r.experiment; const dplay = r.decisionPlay || play;
    const exp_ = (title, sub, body, cls = '') => `<details class="more ${cls}"><summary><b>${title}</b>${sub ? `<span class="sum-line">${sub}</span>` : ''}<i class="caret"></i></summary><div class="more-body">${body}</div></details>`;
    const step = (n, name, tag) => `<div class="step-head"><span class="step-n">${n}</span><span class="step-name">${name}</span>${tag ? `<span class="step-tag">${tag}</span>` : ''}</div>`;
    const est = r.estimate;
    const lensRow = k => `<div class="bar"><b>${LENSES[k].name}<small>${esc(LENSES[k].line)}</small></b><div class="track"><div class="fill" style="--c:var(--lens-${k})" data-w="${Math.round(15 + 85 * r.lensNorm[k])}"></div></div></div>`;
    const reading = `<div class="reading">${play.reading.map(b => `<div class="book"><span class="book-t">${esc(b.title)} <span class="book-a">· ${esc(b.author)}</span></span><p>${esc(b.idea)}</p></div>`).join('')}</div>`;

    if (r.low) {
      const inv = (state.session.answers.inversion || []).map(i => INVERSION.options[i]);
      return `<section class="screen result journey">
      <div class="jstep stagger">${step('01', 'Our current read', 'Nothing to fix yet')}
        <h1 class="display lg edge-name">${esc(LOW_FRICTION.name)}</h1><p class="lead">${esc(LOW_FRICTION.summary)}</p>${frictionMap(r)}<p class="quiet">${esc(LOW_FRICTION.detail)}</p></div>
      <div class="jstep stagger">${step('02', 'Your guards', 'What would make it worse')}
        <ul class="cons">${inv.map(o => `<li><b>${esc(o.t)}</b><span>${esc(o.force || '')}</span></li>`).join('')}</ul></div>
      <div class="jstep stagger">${step('03', 'Watch', 'The only metric that matters here')}
        <div class="metric"><p class="metric-t">Whether this picture holds</p><p>${esc(LOW_FRICTION.watch)}</p></div></div>
      <div class="jstep stagger">${step('04', 'Learn', 'Close the loop')}
        <div class="card"><div class="loop"><b>Signal</b><i>→</i>Hypothesis<i>→</i>Question<i>→</i>Evidence<i>→</i>Act<i>→</i><b>Learn</b></div>
        <div class="result-actions"><button class="btn btn-deep" data-copy>Copy the read</button><button class="btn btn-ghost" data-go="begin">Run it again</button><span class="saved">✓ Saved on this device</span></div></div></div>
    </section>`;
    }

    const zoneSummary = (ZONE_BY_CONSTRAINT[r.zone] || {})[r.top] || Z.summary;
    const sig = x => `<li><span class="sig-s sig-${x.strength.toLowerCase()}">${x.strength}</span><span>${esc(x.obs)}</span></li>`;
    const openBlock = r.open && r.open.question ? `<div class="open">
        <p class="eyebrow">What we're still trying to understand</p>
        <p class="open-t">Is it <strong>${esc(hypName(r.top).toLowerCase())}</strong>, or <strong>${esc(hypName(r.second).toLowerCase())}</strong>?</p>
        <p class="open-q"><span class="k">The question that would tell us</span>${esc(r.open.question)}</p>
      </div>` : '';
    const why = `
      <ol class="chain staged" aria-label="Causal chain">${play.chain.map((c, i) => `<li><span class="stage"><b>${esc((CHAIN_STAGES[r.top] || [])[i] || '')}</b><i>${esc(STAGE_ROLE[i] || '')}</i></span><span>${esc(c)}</span></li>`).join('')}</ol>
      <div class="forces"><p class="eyebrow">What's reinforcing it</p><ul>${r.forces.map(f => `<li class="${f.src === 'pattern' ? 'from-pattern' : 'from-you'}"><small>${f.src === 'pattern' ? 'Our inference' : 'From your answers'}</small><span>${esc(f.t)}</span></li>`).join('')}</ul></div>
      ${r.contradicts.length ? `<p class="eyebrow" style="margin-top:1rem">What cuts against it</p><ul class="sig against">${r.contradicts.slice(0, 3).map(sig).join('')}</ul>` : ''}
      ${r.open && r.open.secondEvidence && r.open.secondEvidence.length ? `<p class="eyebrow" style="margin-top:1rem">What points to ${esc(hypName(r.second).toLowerCase())}</p><ul class="sig">${r.open.secondEvidence.map(sig).join('')}</ul>` : ''}
      <p class="eyebrow" style="margin-top:1rem">Other explanations we weighed</p>
      <ol class="hyps">${r.ranked.slice(0, 5).map(h => `<li><span class="hyp-bar"><i style="width:${Math.round(r.p[h] * 100)}%"></i></span><span class="hyp-n">${esc(hypName(h))}</span><span class="hyp-l">${esc(confidenceLabelText(r.p[h]))}</span></li>`).join('')}</ol>
      ${r.mpe && r.mpe.length ? `<p class="eyebrow" style="margin-top:1rem">The picture that best explains your answers</p><ol class="config">${r.mpe.map(h => `<li class="${h === r.top ? 'lead' : ''}">${esc(hypName(h))}</li>`).join('')}</ol>` : ''}
      <p class="quiet">Confidence is shown as a label rather than a number on purpose. About ten answers can rank explanations; they can't measure them.</p>`;
    const costBody = `
      ${est ? `<div class="visible-cost"><p class="k">Capacity cost</p><p class="est-big est-sun">≈ ${est.dollars ? `$${fmt(est.dollars)}` : fmt(est.hoursYear) + ' hours'} a year</p><p class="quiet">${fmt(est.managers)} managers × ${fmt(est.hours)} hours a week × 48 weeks${est.dollars ? `, at $${fmt(est.rate)} per loaded hour` : ''}. Illustrative, based on your inputs. Leadership capacity consumed, not revenue lost.</p></div>` : ''}
      <div class="downstream"><p class="k">Potential downstream effects</p><ol class="arrows">${play.consequences.map(c => `<li><b>${esc(c)}</b><span>${esc(CONSEQUENCE_WHY[c] || '')}</span></li>`).join('')}</ol></div>
      ${r.econ ? `<div class="econ"><p class="eyebrow">What your operating profile suggests <span class="econ-conf">· ${esc(r.econ.conf)} confidence</span></p><p class="econ-t">${esc(r.econ.t)}</p><p>${esc(r.econ.d)}</p></div>` : ''}
      <div class="leverage" style="margin-top:1.2rem"><p class="eyebrow">What that capacity could be doing instead</p><ul>${play.leverage.map(l => `<li><b>${esc(l)}</b><span>${esc(LEVERAGE_WHY[l])}</span></li>`).join('')}</ul></div>
      <p class="eyebrow" style="margin-top:1.2rem">Expected vs observed</p>
      <div class="tablewrap"><table class="profile"><thead><tr><th>Trait</th><th>Expected</th><th>Observed</th></tr></thead><tbody>${r.profile.map(row => `<tr class="${row.primary ? 'primary' : ''}"><td>${esc(row.k)}<small>${row.primary ? 'Primary signal' : 'Not a primary signal'}</small></td><td>${esc(row.expected)}</td><td class="obs ${row.good && row.good.includes(row.observed) ? 'obs-ok' : 'obs-off'}">${esc(row.observed)}${row.good && row.good.includes(row.observed) ? '' : ' <span class="flag" title="outside the expected range">◆</span>'}</td></tr>`).join('')}</tbody></table></div>
      <p class="quiet">Expected is what a business of your shape usually looks like, not a benchmark. Observed comes from your answers.</p>`;
    const dontBody = `
      ${COUNTERFACTUALS[r.top] ? `<p class="cf"><span class="k">Counterfactual</span>If this read is right, ${esc(COUNTERFACTUALS[r.top].should)} should ${esc(COUNTERFACTUALS[r.top].worse)}.</p>` : ''}
      <p class="dont-t">${esc(play.notDo.t)}</p>
      <p><span class="k">Because</span> ${COUNTERFACTUALS[r.top] ? esc(COUNTERFACTUALS[r.top].because.charAt(0).toUpperCase() + COUNTERFACTUALS[r.top].because.slice(1)) + '. ' : ''}${esc(play.notDo.d)}</p>`;

    return `<section class="screen result journey lean">

      <div class="jstep stagger">
        ${step('01', 'The read', 'What appears to be getting in the way')}
        <div class="friction-head">
          <h1 class="display lg edge-name">${esc(play.constraint)}</h1>
          <details class="conf-pill conf-${r.label.key}"><summary>${esc(r.label.label)}<i class="caret"></i></summary><div class="conf-body">${esc(r.label.d)}</div></details>
        </div>
        <p class="lead">${esc(play.diagnosis)}</p>
        ${r.changedMind ? `<p class="changed"><span class="k">We changed our mind</span>Earlier in the conversation the pattern pointed to <strong>${esc(hypName(r.changedMind.from).toLowerCase())}</strong>. Your later answers moved it.</p>` : ''}
        <div class="evidence"><p class="eyebrow">What supports this</p><ul class="sig">${r.supports.slice(0, 3).map(sig).join('') || '<li><span>Only the opening signal so far.</span></li>'}</ul></div>
        ${openBlock}
      </div>

      <div class="jstep stagger">
        ${step('02', 'The gap', Z.label)}
        ${frictionMap(r)}
        <h2 class="display md">${esc(Z.name)}</h2>
        <p class="lead">${esc(zoneSummary)}</p>
        ${r.coherence ? `<p class="quiet">No single explanation is clearly ahead. The strongest is <strong>${esc(hypName(r.top).toLowerCase())}</strong>, but it is mild. The pattern is the finding.</p>` : ''}
        <div class="expanders">
          ${exp_('Why we think this', 'The chain, what reinforces it, what cuts against it', why)}
          ${exp_('How to read the map', 'Three lenses, and the gaps between them', `<p>Each corner is a lens. The pools show how much of the current evidence sits in each one. The friction point sits on the gap between the lens of the current read and the lens of the strongest competing explanation.</p><div class="bars">${lensRow('B')}${lensRow('S')}${lensRow('P')}</div>`)}
          ${exp_('What it\'s costing', est ? `≈ ${est.dollars ? '$' + fmt(est.dollars) : fmt(est.hoursYear) + ' hours'} a year in leadership capacity, and what it may lead to` : 'The business consequence, and what the capacity could do instead', costBody)}
        </div>
      </div>

      <div class="jstep stagger">
        ${step('03', 'What to test', 'One experiment, ' + exp.days + ' days')}
        ${r.decision !== r.top ? `<p class="decision-note"><span class="k">Why this experiment</span>The read is <strong>${esc(hypName(r.top).toLowerCase())}</strong>, but the highest-value move given the uncertainty is to act on <strong>${esc(hypName(r.decision).toLowerCase())}</strong>: it relieves that and part of what sits downstream of it.</p>` : ''}
        <div class="blind compact">
          <p class="eyebrow">First, test the blind spot · untested</p>
          <h2 class="display md">${esc(play.blind)}</h2>
          <p><strong>${esc(r.blind.test || '')}</strong></p>
          ${exp_('What you\'d see, and why it matters', '', `<div class="blind-meta"><div><span class="k">If it's true</span><span>${esc(r.blind.ifTrue || '')}</span></div><div><span class="k">If it's false</span><span>${esc(r.blind.ifFalse || '')}</span></div><div><span class="k">If it holds</span><span>Add this step to the experiment: <strong>${esc(r.blind.step || '')}</strong> And watch: <strong>${esc(r.blind.watch || '')}</strong>. If it doesn't hold, the read weakens and the lighter experiment is enough.</span></div></div>`, 'on-dark')}
        </div>
        <div class="card move experiment">
          <p class="k">Hypothesis</p><p class="t">${esc(exp.hypothesis)}</p>
          ${r.spec ? `<p class="spec-line"><b>${esc(r.spec.action)}</b> · ${esc(r.spec.target)} · ${exp.days} days</p>` : ''}
          <p class="k">Steps</p><ol class="steps">${exp.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
          <p class="k">Watch</p><ul class="watchlist">${exp.watch.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
          <p class="watch"><strong>Run it. Come back and tell us what happened.</strong> The point is not to prove the read right. It is to find out where it is wrong.</p>
          ${exp_('What not to do', play.notDo.t, dontBody)}
          ${r.evs ? exp_('Interventions we weighed', 'Expected value given the uncertainty, minus effort', `<ol class="hyps">${r.evs.slice(0, 5).map(x => `<li><span class="hyp-bar"><i style="width:${Math.round(100 * Math.max(0, x.ev) / Math.max(.001, r.evs[0].ev))}%"></i></span><span class="hyp-n">${esc((x.spec || {}).action || hypName(x.key))}</span><span class="hyp-l">${esc(x.effort)}</span></li>`).join('')}</ol>`) : ''}
          ${exp_('Further reading', 'You are not the first to run into this', reading, 'further')}
        </div>
      </div>

      <div class="jstep stagger">
        ${step('04', 'One question', 'For your next leadership meeting')}
        <p class="q-inv">${esc(play.question)}</p>
      </div>

      <div class="jstep stagger">
        ${step('05', 'Learn', 'Close the loop')}
        <div class="card">
          <div class="loop"><b>Signal</b><i>→</i>Hypothesis<i>→</i>Question<i>→</i>Evidence<i>→</i>Act<i>→</i><b>Learn</b></div>
          <p class="lede" style="font-size:1rem">The goal isn't a better score. It's to find out whether the gap has narrowed. This page will remember the read and the experiment, and update both when you come back.</p>
          <div class="rule"></div>
          <div class="result-actions"><button class="btn btn-deep" data-copy>Copy the read</button><button class="btn btn-ghost" data-go="begin">Run it again</button><span class="saved">✓ Saved on this device</span></div>
          <p class="quiet" style="margin-top:1.2rem">Don't work harder on the symptom. Find the constraint. The thinking behind this: <a href="https://matthew-schmidt-production.up.railway.app/#lenses" rel="noopener">The Three Lenses, the Blind Spot and the Learning Loop</a>.</p>
        </div>
      </div>
    </section>`;
  },

  learning() {
    const last = state.history.at(-1); const res = state.learn.results; const done = last.watch.every(w => res[w]);
    const outcome = state.learn.outcome;
    return `<section class="screen stagger">
      <p class="eyebrow">07 — Learning</p>
      <h1 class="display lg">What happened?</h1>
      <div class="card recap" style="margin-top:1.4rem">
        <div class="row"><span class="k">The read · ${esc(fmtDate(last.at))}</span><span class="v">${esc(last.constraint)}</span></div>
        <div class="row"><span class="k">The experiment</span><span class="v">${esc(last.experimentTitle)}</span></div>
      </div>
      ${last.blindTest ? `<p class="eyebrow" style="margin-top:2rem">The blind-spot test</p>
      <div class="outcome-row"><span class="w">${esc(last.blindTest)}</span><div class="seg" role="group" aria-label="Blind-spot test result">${BLIND_RESULT_OPTIONS.map(o => `<button class="seg-b" data-blind="${o.key}" aria-pressed="${state.learn.blind === o.key}">${o.t}</button>`).join('')}</div></div>` : ''}
      <p class="eyebrow" style="margin-top:2rem">For each thing you watched</p>
      <div class="outcomes">
        ${last.watch.map(w => `<div class="outcome-row"><span class="w">${esc(w)}</span><div class="seg" role="group" aria-label="${esc(w)}">${OUTCOME_OPTIONS.map(o => `<button class="seg-b" data-outcome="${esc(w)}" data-val="${o.key}" aria-pressed="${res[w] === o.key}">${o.t}</button>`).join('')}</div></div>`).join('')}
      </div>
      ${outcome ? `<div class="response"><p class="k">What we learned</p>${outcome.blindText ? `<p>${esc(outcome.blindText)}</p>` : ''}<p class="verdict-line"><strong>${outcome.verdict === 'strengthened' ? 'The experiment strengthened the read.' : outcome.verdict === 'weakened' ? 'The experiment weakened the read.' : 'The experiment weakened part of the read.'}</strong> Predicted: all ${outcome.predicted} improve. Observed: ${outcome.observed} of ${outcome.predicted}.</p><p>${esc(outcome.text)}</p>${outcome.changed ? `<p style="margin-top:.6rem"><strong>The read has changed.</strong> The strongest explanation is now <strong>${esc(hypName(outcome.newTop).toLowerCase())}</strong>. Run Friction again and it will start from there.</p>` : `<p style="margin-top:.6rem">The read stands: <strong>${esc(hypName(last.hyp).toLowerCase())}</strong>, now ${esc(confidenceLabelText(outcome.p[last.hyp]).toLowerCase())}.</p>`}</div>
      <p class="eyebrow" style="margin-top:1.6rem">What surprised you?</p>
      <label class="sr-only" for="learnNote">What surprised you?</label>
      <textarea id="learnNote" placeholder="One line is enough. It becomes the next signal.">${esc(state.learn.note)}</textarea>` : ''}
      <div class="nav">
        <button class="btn btn-ghost" data-go="arrival">← Back</button>
        ${outcome ? `<button class="btn btn-primary" data-close-loop>Run Friction again <span class="arr">→</span></button>` : `<button class="btn btn-primary" data-interpret ${done ? '' : 'disabled'}>Update the read <span class="arr">→</span></button>`}
      </div>
    </section>`;
  },
};
function confidenceLabelText(p) { return p >= .8 ? 'High confidence' : p >= .65 ? 'Strong pattern' : p >= .45 ? 'Emerging pattern' : 'Early signal'; }

/* ---------- the map ---------- */
function frictionMap(r) {
  const V = { B: [200, 44], S: [352, 290], P: [48, 290] };
  const lbl = { B: [200, 22], S: [352, 324], P: [48, 324] };
  const on = r.low ? [] : r.coherence ? ['BS', 'SP', 'PB'] : [r.zone];
  const edges = ['BS', 'SP', 'PB'].map(k => {
    const { a, b } = ZONES[k]; const primary = on.includes(k);
    return `<line class="edge ${primary ? 'primary' : ''}" x1="${V[a][0]}" y1="${V[a][1]}" x2="${V[b][0]}" y2="${V[b][1]}" stroke-width="${primary ? (r.coherence ? 5 : 7) : 1.5}"/>`;
  }).join('');
  const lit = r.low ? [] : r.coherence ? ['B', 'S', 'P'] : [ZONES[r.zone].a, ZONES[r.zone].b];
  const pools = ['B', 'S', 'P'].map(k => { const o = lit.includes(k); const rad = 8 + 22 * r.lensNorm[k];
    return `<g class="pool-c"><circle cx="${V[k][0]}" cy="${V[k][1]}" r="${rad.toFixed(1)}" fill="var(--lens-${k})" opacity="${o ? .22 : .1}"/><circle cx="${V[k][0]}" cy="${V[k][1]}" r="6" fill="var(--lens-${k})" opacity="${o ? 1 : .45}"/></g>`; }).join('');
  let fx = 200, fy = 208;
  if (!r.low && !r.coherence) { const { a, b } = ZONES[r.zone]; const wa = r.lensNorm[a] + .01, wb = r.lensNorm[b] + .01; let tt = wb / (wa + wb); tt = .3 + .4 * tt; fx = V[a][0] + (V[b][0] - V[a][0]) * tt; fy = V[a][1] + (V[b][1] - V[a][1]) * tt; }
  const labelAbove = fy > 200;
  return `<svg class="map" viewBox="0 0 400 340" role="img" aria-label="Friction map">
    ${edges}${pools}
    ${['B', 'S', 'P'].map(k => `<text class="vertex ${lit.includes(k) ? 'on' : ''}" x="${lbl[k][0]}" y="${lbl[k][1]}" text-anchor="middle">${LENSES[k].name.toUpperCase()}</text>`).join('')}
    ${r.low ? '' : `<g class="fp"><circle class="ring" cx="${fx}" cy="${fy}" r="14"/><circle class="ring r2" cx="${fx}" cy="${fy}" r="14"/><circle cx="${fx}" cy="${fy}" r="9" fill="var(--sun)" stroke="#fff" stroke-width="3"/></g><text class="fp-label" x="${fx}" y="${labelAbove ? fy - 24 : fy + 34}" text-anchor="middle">FRICTION</text>`}
  </svg>`;
}

/* ---------- behaviour ---------- */
function bind() {
  app.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { const to = b.dataset.go; if (to === 'begin') return begin(); go(to); }));
  app.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => choose(+b.dataset.opt)));
  app.querySelector('[data-back]')?.addEventListener('click', back);
  app.querySelector('[data-next]')?.addEventListener('click', next);
  app.querySelectorAll('[data-cost]').forEach(i => i.addEventListener('input', e => { state.cost[e.target.dataset.cost] = e.target.value; }));
  app.querySelectorAll('select[data-cost]').forEach(i => i.addEventListener('change', e => { state.cost[e.target.dataset.cost] = e.target.value; }));
  app.querySelectorAll('[data-reveal]').forEach(b => b.addEventListener('click', () => reveal(b.hasAttribute('data-skip'))));
  app.querySelector('[data-copy]')?.addEventListener('click', copySummary);
  app.querySelectorAll('[data-outcome]').forEach(b => b.addEventListener('click', () => { state.learn.results[b.dataset.outcome] = b.dataset.val; render(); }));
  app.querySelectorAll('[data-blind]').forEach(b => b.addEventListener('click', () => { state.learn.blind = b.dataset.blind; render(); }));
  app.querySelector('[data-interpret]')?.addEventListener('click', interpret);
  app.querySelector('#learnNote')?.addEventListener('input', e => { state.learn.note = e.target.value; });
  app.querySelector('[data-close-loop]')?.addEventListener('click', closeLoop);
  requestAnimationFrame(() => app.querySelectorAll('.bar .fill').forEach(f => { f.style.width = f.dataset.w + '%'; }));
}
function enable(sel, on) { const b = app.querySelector(sel); if (b) b.disabled = !on; const bar = $('#actionbar .btn'); if (bar) bar.disabled = !on; }
function capText(q, sel) { return q.max ? `${sel.length} of ${q.max} chosen` : ''; }
function nudge(i) { const b = app.querySelector(`[data-opt="${i}"]`); if (!b) return; b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); const cap = app.querySelector('.cap'); if (cap) cap.textContent = 'Deselect one to choose another'; }

function begin() {
  state.session = newSession(); state.result = null; state.sel = [];
  state.cost = { managers: '', hours: '', rate: '', revenue: 'Prefer not to say', profit: 'Prefer not to say' };
  state.current = nextQuestion(state.session);
  go('question');
}
function choose(i) {
  const q = state.current; const cur = state.sel;
  let nextSel;
  if (q.multi) { if (cur.includes(i)) nextSel = cur.filter(x => x !== i); else if (q.max && cur.length >= q.max) { nudge(i); return; } else nextSel = [...cur, i]; }
  else nextSel = [i];
  state.sel = nextSel;
  app.querySelectorAll('[data-opt]').forEach(b => b.setAttribute('aria-pressed', nextSel.includes(+b.dataset.opt)));
  enable('[data-next]', nextSel.length > 0);
  const cap = app.querySelector('.cap'); if (cap) cap.textContent = capText(q, nextSel);
  if (!q.multi && !reduced) setTimeout(next, 260);
}
function next() {
  if (!state.sel.length || rendering) return;
  applyAnswer(state.session, state.current.id, state.sel);
  const q = nextQuestion(state.session);
  if (!q) return go('cost', { current: null, sel: [] });
  go('question', { current: q, sel: [] });
}
function back() {
  if (state.screen === 'cost') { const last = state.session.asked.at(-1); const sel = state.session.answers[last] || []; undoLast(state.session); return go('question', { current: byId[last], sel: sel.slice() }); }
  if (!state.session.asked.length) return go('arrival');
  const last = state.session.asked.at(-1); const sel = state.session.answers[last] || [];
  undoLast(state.session); go('question', { current: byId[last], sel: sel.slice() });
}
function reveal(skip) {
  const cost = skip ? null : { managers: +state.cost.managers || 0, hours: +state.cost.hours || 0, rate: +state.cost.rate || 0 };
  const ranges = skip ? {} : { revenue: state.cost.revenue, profit: state.cost.profit };
  const r = diagnose(state.session, cost, ranges);
  state.result = r;
  state.history.push({ at: Date.now(), hyp: r.top, second: r.second, decision: r.decision, evidence: state.session.evidence.slice(), model: r.modelVersion, zone: r.zone, low: !!r.low,
    blindTest: r.low ? null : r.blind.test, blindStep: r.low ? null : r.blind.step, blindWatch: r.low ? null : r.blind.watch, constraint: r.low ? 'Low friction' : r.play.constraint, experimentTitle: r.low ? 'Hold the picture' : (r.decisionPlay || r.play).move.t, watch: r.low ? ['Whether this picture holds'] : r.experiment.watch, days: r.low ? 90 : r.experiment.days, closed: false });
  if (state.history.length > 12) state.history = state.history.slice(-12);
  persist(); go('result');
}
function interpret() {
  const last = state.history.at(-1);
  state.learn.outcome = applyOutcome(last, state.learn.results, state.learn.blind);
  render();
}
function closeLoop() {
  const last = state.history.at(-1);
  last.closed = true; last.results = state.learn.results; last.blindResult = state.learn.blind; last.learned = state.learn.note.trim(); last.closedAt = Date.now();
  if (state.learn.outcome) { last.newTop = state.learn.outcome.newTop; last.evidenceAfter = state.learn.outcome.evidence; last.pAfter = state.learn.outcome.p; }
  persist(); state.learn = { results: {}, note: '', outcome: null, blind: null }; begin();
}
function summaryText() {
  const r = state.result;
  if (r.low) return ['FRICTION — CURRENT READ', '', LOW_FRICTION.name, LOW_FRICTION.summary, '', LOW_FRICTION.detail, '', location.origin + location.pathname].join('\n');
  const p = r.play, e = r.experiment, est = r.estimate;
  return [
    'FRICTION — CURRENT READ', '',
    `${p.constraint} (${r.label.label})`, p.diagnosis, '',
    'CRITIC STATE', `Primary: ${r.critic.primary.name} — ${r.critic.primary.confidence}`, ...r.critic.supporting.map(x => `  + ${x}`), `Competing: ${r.critic.competing.name} — ${r.critic.competing.confidence}`, ...r.critic.competing.evidence.map(x => `  ~ ${x}`), ...r.critic.disconfirming.map(x => `  - ${x}`), `Next test: ${r.critic.nextTest.t}`, '',
    'What supports this:', ...r.supports.slice(0, 5).map(x => `  · ${x.obs} (${x.strength})`),
    r.contradicts.length ? 'What cuts against it:\n' + r.contradicts.slice(0, 3).map(x => `  · ${x.obs}`).join('\n') : '',
    r.open ? `Still to understand: is it ${hypName(r.top).toLowerCase()}, or ${hypName(r.second).toLowerCase()}?${r.open.question ? ' Ask: ' + r.open.question : ''}` : '', '',
    `WHERE IT SITS: ${ZONES[r.zone].name} — ${ZONES[r.zone].label}`, '',
    'WHAT IT\'S COSTING: ' + p.consequences.join(', '), est ? `Illustrative estimate: ${fmt(est.hoursYear)} hours a year${est.dollars ? ` (≈ $${fmt(est.dollars)})` : ''}.` : '', r.econ ? `${r.econ.t} (${r.econ.conf} confidence)` : '', '',
    `POSSIBLE BLIND SPOT (untested): ${p.blind}`, `Test: ${r.blind.test}`, `If true: ${r.blind.ifTrue}`, `If false: ${r.blind.ifFalse}`, `If it holds, add to the experiment: ${r.blind.step} Watch: ${r.blind.watch}`, '', `WHAT NOT TO DO: ${p.notDo.t} ${p.notDo.d}`, '',
    `EXPERIMENT (${e.days} days): ${e.hypothesis}`, ...e.steps.map((s, i) => `  ${i + 1}. ${s}`), 'Watch: ' + e.watch.join('; '), '',
    `ONE QUESTION: ${p.question}`, '', 'Signal → Hypothesis → Question → Evidence → Act → Learn', location.origin + location.pathname,
  ].filter(x => x !== null).join('\n');
}
async function copySummary() {
  const b = app.querySelector('[data-copy]');
  try { await navigator.clipboard.writeText(summaryText()); b.textContent = 'Copied'; } catch { b.textContent = 'Select and copy'; window.prompt('Your read', summaryText()); }
  setTimeout(() => { b.textContent = 'Copy the read'; }, 1800);
}
function fmtDate(ts) { try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return ''; } }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.screen === 'how') go('arrival'); });
render();
