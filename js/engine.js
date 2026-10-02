// Friction v5.1 — engine.
// Belief: exact Bayesian inference over a causal network of fifteen binary states (32,768 configurations).
// Evidence: each answer option carries log likelihood ratios. Answers about the same thing are correlated, so evidence is
//   summed per hypothesis, then tempered and capped (EVIDENCE), instead of multiplied as if independent.
// Self-report: reassuring answers about impressions count for less than reassuring answers about events; admissions about
//   your own part count for more (SELF_REPORT).
// Actor: value of information, with seven questions that are always asked (candour, the last raised problem, the overrule
//   question, your own part, loss, the last open disagreement, the last missed number) before the engine may stop.
// Read: chosen by direct evidence, honouring what the person said about their own part; two close causes are shown together.
// Confidence: from evidence strength, margin, independent sources, at least one event-based answer, coverage, consistency.
// Decision: the intervention with the highest expected value. Learn: experiment results are untempered evidence.
import { HYPOTHESES, HYP_ORDER, OPENER, QUESTIONS, INVERSION, ALL_QUESTIONS, ACTOR, ZONES, PLAYBOOKS, EXPERIMENTS, EXPERIMENT_SPECS, ECON_READS, PROFILE_ROWS, PROFILE_PRIMARY, confidenceLabel,
         NETWORK, NETWORK_ORDER, INTERVENTIONS, QUESTION_COST, VOI, MODEL_VERSION, BLIND_SPOTS, EVIDENCE, SELF_REPORT } from './content.js';

export const byId = Object.fromEntries(ALL_QUESTIONS.map(q => [q.id, q]));
const N = HYP_ORDER.length;
const IDX = Object.fromEntries(HYP_ORDER.map((h, i) => [h, i]));
const STATES = 1 << N;
const H = h => HYPOTHESES[h].name;

/* ---------- the network prior over all configurations (computed once) ---------- */
const PRIOR = new Float64Array(STATES);
(function buildPrior() {
  for (let s = 0; s < STATES; s++) {
    let p = 1;
    for (const h of NETWORK_ORDER) {
      const node = NETWORK[h]; const on = (s >> IDX[h]) & 1;
      let pTrue;
      if (!Object.keys(node.parents).length) pTrue = node.prior;
      else { let keep = 1 - node.leak; for (const par in node.parents) if ((s >> IDX[par]) & 1) keep *= 1 - node.parents[par]; pTrue = 1 - keep; }
      p *= on ? pTrue : 1 - pTrue;
    }
    PRIOR[s] = p;
  }
})();

/* ---------- evidence ---------- */
// Some explanations have many more questions that can raise them than others. To keep the pool from tilting the read,
// positive evidence per hypothesis is scaled toward the median of the total positive weight available to it.
const AVAILABLE = Object.fromEntries(HYP_ORDER.map(h => [h, QUESTIONS.reduce((t, q) => t + Math.max(0, ...q.options.map(o => o.sig[h] || 0)), 0)]));
const MEDIAN = (() => { const v = Object.values(AVAILABLE).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; })();
export const BALANCE = Object.fromEntries(HYP_ORDER.map(h => [h, Math.max(.65, Math.min(1.35, MEDIAN / (AVAILABLE[h] || MEDIAN)))]));
const temper = x => x >= 0 ? Math.min(EVIDENCE.capPos, EVIDENCE.temper * x) : Math.max(EVIDENCE.capNeg, EVIDENCE.temper * x);
// Effective log-weight per hypothesis: answers are summed, tempered and capped; raw evidence (experiments, blind-spot tests) is added as is.
const selfReport = (w, event, own) => w < 0 ? (event ? w : w * SELF_REPORT.reassuringImpression) : w * (own ? SELF_REPORT.admission : 1) * (event ? SELF_REPORT.event : 1);
function weights(evidence, extra = null, extraCtx = {}) {
  const ans = new Float64Array(N), raw = new Float64Array(N);
  const add = (t, h, w, bal) => { if (IDX[h] === undefined) return; t[IDX[h]] += bal && w > 0 ? w * BALANCE[h] : w; };
  for (const e of evidence) { const t = e.raw ? raw : ans; for (const h in e.w) add(t, h, e.raw ? e.w[h] : selfReport(e.w[h], e.event, e.own), !e.raw); }
  if (extra) for (const h in extra) add(ans, h, selfReport(extra[h], extraCtx.event, extraCtx.own), true);
  const W = new Float64Array(N);
  for (let i = 0; i < N; i++) W[i] = temper(ans[i]) + raw[i];
  return W;
}
function inferFromW(W) {
  const m = Array.from(W, w => Math.exp(w));
  const post = new Float64Array(STATES); let Z = 0;
  const margAcc = new Float64Array(N);
  let best = 0, bestV = -1;
  for (let s = 0; s < STATES; s++) {
    let p = PRIOR[s];
    for (let i = 0; i < N; i++) if ((s >> i) & 1) p *= m[i];
    post[s] = p; Z += p;
    if (p > bestV) { bestV = p; best = s; }
  }
  for (let s = 0; s < STATES; s++) { const p = post[s]; if (!p) continue; for (let i = 0; i < N; i++) if ((s >> i) & 1) margAcc[i] += p; }
  const marg = {}; for (let i = 0; i < N; i++) marg[HYP_ORDER[i]] = margAcc[i] / Z;
  const mpe = NETWORK_ORDER.filter(h => (best >> IDX[h]) & 1);
  return { marg, mpe, Z, post, W };
}
const posterior = (evidence) => inferFromW(weights(evidence));

/* ---------- session ---------- */
export function newSession() {
  const s = { asked: [], answers: {}, evidence: [], history: [], model: MODEL_VERSION };
  recompute(s); return s;
}
export function confidences(s) { return s.belief.marg; }
export function ranked(s) { const p = s.belief.marg; return HYP_ORDER.slice().sort((a, b) => p[b] - p[a]); }
export function applyAnswer(s, qid, indices) {
  const q = byId[qid]; if (!q) return;
  if (!s.asked.includes(qid)) s.asked.push(qid);
  s.answers[qid] = indices.slice();
  recompute(s);
}
export function undoLast(s) { const qid = s.asked.pop(); if (!qid) return; delete s.answers[qid]; s.history.pop(); recompute(s); }
export function recompute(s) {
  s.evidence = []; s.history = [];
  for (const qid of s.asked) {
    const q = byId[qid];
    for (const i of s.answers[qid] || []) { const opt = q.options[i]; if (opt) s.evidence.push({ w: opt.sig, src: qid, obs: opt.obs || opt.t, said: opt.t, own: opt.own || null, event: !!q.event }); }
    s.belief = posterior(s.evidence); s.history.push(ranked(s)[0]);
  }
  if (!s.asked.length) s.belief = posterior([]);
}
export function signals(s) {
  const out = [];
  for (const qid of s.asked) { const q = byId[qid]; for (const i of s.answers[qid] || []) { const opt = q.options[i]; if (opt) out.push({ qid, q, opt }); } }
  return out;
}
const chosen = (s, qid) => (s.answers[qid] || []).map(i => byId[qid].options[i]).filter(Boolean);

/* ---------- decision model ---------- */
export function expectedValues(marg) {
  return Object.entries(INTERVENTIONS).map(([key, iv]) => {
    let ev = 0;
    for (const h in iv.relief) ev += (marg[h] || 0) * iv.relief[h] * HYPOTHESES[h].importance;
    return { key, ev: ev - iv.cost, effort: iv.effort, spec: EXPERIMENT_SPECS[key] };
  }).sort((a, b) => b.ev - a.ev);
}
const bestEV = marg => expectedValues(marg)[0];

/* ---------- actor: value of information ---------- */
// For each option: the belief after it, and how compatible it is with the current belief (its predictive weight).
function answerOutcomes(s, q) {
  const base = s.belief; const W0 = base.W;
  const outs = q.options.map(opt => {
    const W1 = weights(s.evidence, opt.sig, { event: q.event, own: opt.own });
    const touched = []; for (let i = 0; i < N; i++) { const d = W1[i] - W0[i]; if (Math.abs(d) > 1e-9) touched.push([i, Math.exp(d)]); }
    const acc = new Float64Array(N); let lik = 0;
    for (let st = 0; st < STATES; st++) {
      let f = base.post[st]; if (!f) continue;
      for (let k = 0; k < touched.length; k++) { const [i, m] = touched[k]; if ((st >> i) & 1) f *= m; }
      lik += f;
      for (let i = 0; i < N; i++) if ((st >> i) & 1) acc[i] += f;
    }
    const marg = {}; for (let i = 0; i < N; i++) marg[HYP_ORDER[i]] = acc[i] / lik;
    return { opt, lik: lik / base.Z, marg };
  });
  const Z = outs.reduce((a, o) => a + o.lik, 0) || 1;
  return outs.map(o => ({ ...o, p: o.lik / Z }));
}
const entropy = p => { let h = 0; for (const k in p) { const x = p[k]; if (x > 0 && x < 1) h -= x * Math.log(x) + (1 - x) * Math.log(1 - x); } return h; };
export function valueOfInformation(s, q) {
  const now = bestEV(s.belief.marg);
  const outs = answerOutcomes(s, q);
  let ev = 0, gain = 0;
  const H0 = entropy(s.belief.marg);
  for (const o of outs) { ev += o.p * bestEV(o.marg).ev; gain += o.p * (H0 - entropy(o.marg)); }
  const voi = ev - now.ev;
  const cost = QUESTION_COST.base + (q.multi ? QUESTION_COST.multi : 0);
  return { voi, gain, cost, score: voi + VOI.infoGainWeight * gain - cost, wouldChange: outs.some(o => bestEV(o.marg).key !== now.key) };
}
function lensCounts(s) { const c = { B: 0, S: 0, P: 0 }; for (const id of s.asked) { const l = byId[id].lens; if (l) c[l]++; } return c; }
const isOpen = (s, q, p) => !s.asked.includes(q.id) && (q.required || !q.gate || q.gate(p));
export function nextQuestion(s) {
  if (!s.asked.includes('opener')) return OPENER;
  if (s.asked.includes('inversion')) return null;
  const p = s.belief.marg; const r = ranked(s); const n = s.asked.length - 1;
  const reqLeft = QUESTIONS.filter(q => q.required && !s.asked.includes(q.id));
  if (n >= ACTOR.maxQuestions && !reqLeft.length) return INVERSION;
  // a tired leader is asked about loss first
  if (chosen(s, 'opener').some(o => o.tired) && reqLeft.some(q => q.id === 'loss')) return byId.loss;
  // once money has been named as a worry, ask the behavioural price question rather than leave it to chance
  const moneyNamed = s.evidence.some(e => (e.w.economics || 0) >= .9);
  if (moneyNamed && !s.asked.includes('margin_last') && n < ACTOR.maxQuestions - reqLeft.length) return byId.margin_last;
  const candidates = QUESTIONS.filter(q => isOpen(s, q, p));
  if (!candidates.length) return INVERSION;
  const scored = candidates.map(q => ({ q, ...valueOfInformation(s, q) }));
  const counts = lensCounts(s);
  for (const x of scored) if (x.q.lens && counts[x.q.lens] < 2 && n >= 2) x.score *= 1.5;
  scored.sort((a, b) => b.score - a.score);
  // required questions must all be asked by the time the minimum is reached
  if (reqLeft.length && (reqLeft.length >= ACTOR.minQuestions - n - 1 || n >= ACTOR.maxQuestions)) return scored.find(x => x.q.required).q;
  const covered = Object.values(counts).every(c => c >= 2);
  const quiet = p[r[0]] < .3;
  const clear = p[r[0]] >= ACTOR.stopConfidence && (p[r[0]] - p[r[1]]) >= ACTOR.stopMargin;
  const anyChange = scored.some(x => x.wouldChange && x.voi >= VOI.minToAsk);
  if (n >= ACTOR.minQuestions && !reqLeft.length && covered && (quiet || clear || !anyChange)) return INVERSION;
  return scored[0].q;
}
export function voiTable(s) { const p = s.belief.marg; return QUESTIONS.filter(q => isOpen(s, q, p)).map(q => ({ id: q.id, ...valueOfInformation(s, q) })).sort((a, b) => b.score - a.score); }
export function progress(s) { return Math.min(1, s.asked.length / (ACTOR.maxQuestions + 2)); }

/* ---------- the read: by direct evidence, honouring what the person said about their own part ---------- */
function directEvidence(evidence) {
  const d = Object.fromEntries(HYP_ORDER.map(h => [h, 0]));
  for (const e of evidence) if (!e.raw && e.src !== 'opener' && e.src !== 'inversion') for (const h in e.w) if (e.w[h] > 0) d[h] += e.w[h];
  return d;
}
export function readFrom(p, evidence) {
  const byP = HYP_ORDER.slice().sort((a, b) => p[b] - p[a]);
  const pmax = p[byP[0]];
  const direct = directEvidence(evidence);
  const own = new Set(evidence.filter(e => e.own).map(e => e.own));
  const pool = HYP_ORDER.filter(h => (p[h] >= pmax - .12 && p[h] >= .4) || (own.has(h) && p[h] >= .55));
  if (!pool.length) return { order: byP, direct, own, paired: null };
  const score = h => direct[h] + (own.has(h) ? 1 : 0);
  pool.sort((a, b) => {
    const d = score(b) - score(a);
    if (Math.abs(d) > .3) return d;
    return NETWORK_ORDER.indexOf(a) - NETWORK_ORDER.indexOf(b); // close call: the more upstream cause first
  });
  const top = pool[0];
  const order = [top, ...byP.filter(h => h !== top)];
  const second = pool[1];
  const paired = second && p[second] >= p[top] - .12 && p[second] >= .5 && score(second) >= .6 * score(top) ? second : null;
  return { order, direct, own, paired };
}

/* ---------- diagnosis ---------- */
const DOWN = { high: 'strong', strong: 'emerging', emerging: 'early', early: 'early' };
export function diagnose(s, cost, ranges = {}) {
  const p = s.belief.marg;
  const sel = readFrom(p, s.evidence);
  const r = sel.order;
  const top = r[0], second = r[1], third = r[2];
  const low = p[top] < .42;
  const lensOf = h => HYPOTHESES[h].lens;
  const elevated = r.filter(h => p[h] >= .5);
  const coherence = !low && p[top] < .9 && elevated.length >= 4 && new Set(elevated.map(lensOf)).size === 3 && (p[top] - p[elevated[3]]) < .3;

  const load = { B: 0, S: 0, P: 0 };
  for (const h of HYP_ORDER) load[lensOf(h)] += p[h] * HYPOTHESES[h].importance;
  const maxLoad = Math.max(...Object.values(load)) || 1;
  const lensNorm = Object.fromEntries(Object.keys(load).map(k => [k, load[k] / maxLoad]));
  const otherLensHyp = r.find(h => lensOf(h) !== lensOf(top));
  const pair = new Set([lensOf(top), lensOf(otherLensHyp)]);
  const zone = coherence ? 'BSP' : Object.keys(ZONES).find(k => k !== 'BSP' && pair.has(ZONES[k].a) && pair.has(ZONES[k].b));
  const loads = Object.entries(load).sort((a, b) => b[1] - a[1]);
  const dominant = !coherence && loads[0][1] - loads[1][1] >= 1.0 ? loads[0][0] : null;

  // evidence, quoted in the person's own words
  const strength = w => Math.abs(w) >= 1.2 ? 'High' : Math.abs(w) >= .6 ? 'Medium' : 'Low';
  const supports = [], contradicts = [], supportsSecond = [];
  for (const { q, opt } of signals(s)) {
    if (q.id === 'inversion') continue;
    const item = w => ({ said: opt.t, q: q.short || q.eyebrow, obs: opt.obs || opt.t, strength: strength(w), w, event: !!q.event, qid: q.id });
    const w = opt.sig[top] || 0;
    if (w >= .3) supports.push(item(w)); else if (w <= -.3) contradicts.push(item(w));
    const w2 = opt.sig[second] || 0; if (w2 >= .6) supportsSecond.push(item(w2));
  }
  supports.sort((a, b) => (b.w - a.w) || (b.event - a.event)); contradicts.sort((a, b) => a.w - b.w); supportsSecond.sort((a, b) => b.w - a.w);

  const play = PLAYBOOKS[top];
  const profile = PROFILE_ROWS.map(row => {
    const asked = (row.from || []).some(id => s.asked.includes(id));
    let observed = asked ? row.observe(p) : 'Not asked';
    // never report a healthy reading that the person's own answers contradict
    const flagged = asked && signals(s).some(({ q, opt }) => (row.from || []).includes(q.id) && (row.hyps || []).some(h => (opt.sig[h] || 0) >= .6));
    if (flagged && row.good.includes(observed) && row.floor) observed = row.floor;
    return { k: row.k, expected: row.expected, good: row.good, observed, asked, primary: asked && (PROFILE_PRIMARY[top] || []).includes(row.k) };
  });
  const evs = expectedValues(p);

  // consistency between what the person said at the start, about themselves, and what the evidence shows
  const opener = chosen(s, 'opener')[0];
  const notes = []; let downgrade = 0;
  if (opener && opener.nothing && !low) { notes.push('You started by saying nothing major was in the way. Your later answers point to something. That gap is worth noticing.'); downgrade++; }
  const denial = chosen(s, 'self').some(o => o.denial);
  if (denial && !low && ['centralized', 'trust', 'conflict_avoidance', 'blame', 'capability'].includes(top)) { notes.push('You said you don\'t think you\'re part of this. The read is about how leaders respond, so it is worth asking someone who reports to you whether they see it the same way.'); downgrade++; }
  if (opener && !opener.nothing && !opener.tired && !low) {
    const named = Object.entries(opener.sig).sort((a, b) => b[1] - a[1])[0];
    if (named && named[1] >= .8 && p[named[0]] < .3) notes.push(`You started with what looked like ${H(named[0]).toLowerCase()}. Your later answers didn't bear that out.`);
  }
  const ownSaid = s.evidence.filter(e => e.own === top).map(e => e.said);
  const grief = chosen(s, 'loss').some(o => o.grief) && p.loss >= .2;
  const tired = !!(opener && opener.tired);
  // answers that usually point to a problem, in the person's own words, whatever the overall belief says
  const concerns = [];
  for (const { q, opt } of signals(s)) {
    if (q.id === 'opener') continue;
    if (q.id === 'inversion') { if (opt.admits) concerns.push({ said: opt.t, q: 'You named this as a way to make it worse', hyp: null }); continue; }
    const [h, w] = Object.entries(opt.sig).sort((a, b) => b[1] - a[1])[0] || [];
    if (h && w >= (opt.own ? .7 : .9)) concerns.push({ said: opt.t, q: q.short || q.eyebrow, hyp: h, means: H(h), w: w * (q.event ? 1.2 : 1) + (opt.own ? .3 : 0) });
  }
  concerns.sort((a, b) => (b.w || 0) - (a.w || 0));
  if (denial) concerns.push({ said: chosen(s, 'self').find(o => o.denial).t, q: 'Your own part', hyp: null });

  const mixed = low && concerns.filter(c => c.hyp || c.q === 'You named this as a way to make it worse').length >= 2;
  if (low) return { p, ranked: r, top, second, third, low, mixed, concerns: mixed ? concerns : [], tired, coherence: false, zone, dominant: null, lensNorm, load, supports: [], contradicts: [], open: null, changedMind: null, forces: [], play, decision: top, decisionPlay: play, experiment: EXPERIMENTS[top], spec: EXPERIMENT_SPECS[top], evs, mpe: [], estimate: null, econ: null, profile, notes, grief, paired: null, ownSaid: [], blind: { statement: '', status: 'n/a' },
    label: mixed ? { key: 'mixed', label: 'No single constraint', d: 'No single explanation rose above the rest, but some of your answers usually point to a problem.' } : { key: 'none', label: 'No clear constraint', d: 'Nothing you described rose above a weak signal. That doesn\'t rule one out.' }, margin: p[top] - p[second], asked: s.asked.slice(), modelVersion: MODEL_VERSION };

  // decision: acting off the read has to earn it
  const evsAdj = evs.map(x => ({ ...x, ev: x.key === top ? x.ev : x.ev * .88 })).sort((a, b) => b.ev - a.ev);
  const decision = grief ? 'loss' : evsAdj[0].key;
  const experiment = EXPERIMENTS[decision];
  const spec = EXPERIMENT_SPECS[decision];
  const decisionPlay = PLAYBOOKS[decision];

  // the open question: only when the model's own value of information says an answer could change the recommendation
  let open = null;
  if (p[second] >= p[top] - .2 || p[top] < .8) {
    const scored = QUESTIONS.filter(q => isOpen(s, q, p)).map(q => ({ q, ...valueOfInformation(s, q) })).filter(x => x.wouldChange && x.voi >= VOI.minToAsk).sort((a, b) => b.voi - a.voi);
    if (scored.length) open = { between: [top, second], question: scored[0].q.title, frame: p[top] >= .75 && p[second] >= .75 ? 'upstream' : 'either', secondEvidence: supportsSecond.slice(0, 2) };
  }
  const mid = s.history[Math.floor(s.history.length / 2)];
  const changedMind = s.history.length >= 6 && mid && mid !== top && p[mid] >= .35 && mid !== sel.paired ? { from: mid, to: top } : null;

  const seen = new Set(); const forces = [];
  for (const { q, opt } of signals(s)) if (q.id === 'inversion' && opt.force && !seen.has(opt.force)) { seen.add(opt.force); forces.push({ t: opt.force, src: 'inversion' }); }
  for (const t of play.forces) if (forces.length < 4 && !seen.has(t)) { seen.add(t); forces.push({ t, src: 'pattern' }); }

  let estimate = null;
  if (cost && cost.managers > 0 && cost.hours > 0) { const hoursYear = cost.managers * cost.hours * 48; estimate = { managers: cost.managers, hours: cost.hours, hoursYear, rate: cost.rate || null, dollars: cost.rate ? hoursYear * cost.rate : null }; }
  // an economic statement needs at least one financial input; without it, the page says nothing about money
  const gaveFinancials = ['revenue', 'profit'].some(k => ranges[k] && ranges[k] !== 'Prefer not to say') || !!estimate;
  const econEntry = gaveFinancials ? ECON_READS.find(e => e.when(p, ranges)) : null;
  const econ = econEntry && econEntry.t ? econEntry : null;

  // confidence: earned by evidence, not by how saturated the network is
  const margin0 = p[top] - p[second];
  const srcQs = new Set(supports.filter(x => x.w >= .8).map(x => x.qid));
  const sources = srcQs.size;
  const eventSupport = supports.some(x => x.w >= .8 && x.event);
  const against = contradicts.filter(x => x.w <= -.6).length;
  const measured = h => s.asked.some(id => id !== 'opener' && id !== 'inversion' && byId[id].options.some(o => Math.abs(o.sig[h] || 0) >= .8));
  const unmeasured = HYP_ORDER.filter(h => h !== top && p[h] >= .4 && !measured(h));
  let key = p[top] >= .85 && margin0 >= .2 && sources >= 3 && eventSupport && !against && !unmeasured.length && !sel.paired ? 'high'
    : p[top] >= .65 && margin0 >= .1 && sources >= 2 && supports.some(x => x.w >= 1.2) && against <= 1 ? 'strong'
    : p[top] >= .45 && sources >= 2 ? 'emerging' : 'early';
  if (coherence && (key === 'high' || key === 'strong')) key = 'emerging';
  for (let i = 0; i < downgrade; i++) key = DOWN[key];
  const base = confidenceLabel({ high: .8, strong: .65, emerging: .45, early: 0 }[key]);
  const parts = [`Based on ${sources} of your answers${eventSupport ? ', including at least one about something that actually happened' : ''}.`];
  if (sel.paired) parts.push(`${H(sel.paired)} is close behind, and may be the same problem seen from another side.`);
  if (against) parts.push(`${against === 1 ? 'One of your answers cuts' : against + ' of your answers cut'} against it.`);
  if (unmeasured.length) parts.push(`${H(unmeasured[0])} could also explain this, and we didn't ask about it directly.`);
  if (downgrade) parts.push('Some of your answers pull in different directions, so we\'ve held back.');
  parts.push('This is a structured reading of your own answers, not a measurement.');
  const label = { key, label: base.label, d: parts.join(' ') };

  const blind = { statement: play.blind, ...(BLIND_SPOTS[top] || {}), status: 'untested' };
  const critic = {
    primary: { hyp: top, name: H(top), confidence: label.label, sources, eventSupport },
    supporting: supports.slice(0, 5).map(x => `"${x.said}" (${x.q})`),
    competing: { hyp: second, name: H(second), confidence: confidenceLabel(p[second]).label, evidence: supportsSecond.slice(0, 3).map(x => `"${x.said}"`) },
    paired: sel.paired, unmeasured,
    disconfirming: contradicts.slice(0, 3).map(x => `"${x.said}" (${x.q})`),
    consistency: notes,
    configuration: s.belief.mpe,
    decision: { key: decision, action: (spec || {}).action, ev: evsAdj[0].ev, alternatives: evsAdj.slice(1, 3).map(x => ({ key: x.key, ev: x.ev })) },
    nextTest: open ? { kind: 'question', t: open.question } : { kind: 'experiment', t: `${experiment.days}-day ${((spec || {}).action || 'experiment')}`.toLowerCase() },
    blindSpot: { hyp: top, statement: play.blind, test: blind.test, prediction: { ifTrue: blind.ifTrue, ifFalse: blind.ifFalse }, status: 'untested' },
  };
  return { p, ranked: r, top, second, third, low, mixed: false, concerns, tired, coherence, zone, dominant, lensNorm, load, supports, contradicts, open, changedMind, forces, play, decision, decisionPlay, experiment, spec, evs: evsAdj, mpe: s.belief.mpe, estimate, econ: grief ? null : econ, profile, label, critic, blind, notes, grief, paired: sel.paired, ownSaid, margin: margin0, asked: s.asked.slice(), modelVersion: MODEL_VERSION };
}

/* ---------- learn: the blind-spot test and the experiment result are both evidence, untempered ---------- */
export function blindEvidence(entry, result) {
  const spec = BLIND_SPOTS[entry.hyp]; if (!spec || !result || result === 'skipped') return null;
  const w = result === 'held' ? spec.held : spec.notHeld;
  return { w, raw: true, src: 'blind', obs: result === 'held' ? 'Blind-spot test held' : 'Blind-spot test did not hold' };
}
export function applyOutcome(entry, results, blindResult) {
  const key = entry.decision || entry.hyp;
  const exp = EXPERIMENTS[key];
  const watch = exp ? exp.watch : Object.keys(results);
  const predicted = watch.length;
  const ups = watch.filter(w => results[w] === 'up').length, downs = watch.filter(w => results[w] === 'down').length;
  let out = exp && exp.outcome ? exp.outcome(results) : null;
  if (!out) {
    if (ups === predicted) out = { text: 'Everything you watched improved. The read held. Run Friction again to find what is now the constraint.', delta: { [key]: 1.0 }, verdict: 'strengthened' };
    else if (ups === 0 && downs >= 1) out = { text: 'It got worse. The experiment weakened the read: either the move was aimed at a symptom, or something is reinforcing the friction harder than expected. The runner-up explanation rises.', delta: { [key]: -.9, [entry.second]: .7 }, verdict: 'weakened' };
    else if (ups === 0) out = { text: 'No change. The experiment weakened the read: either the move was too small to register, or the constraint is somewhere else. The runner-up explanation rises.', delta: { [key]: -.5, [entry.second]: .5 }, verdict: 'weakened' };
    else out = { text: `${ups} of ${predicted} improved. The experiment weakened part of the read: the mechanism looks right, but something the read didn't account for is holding the rest. The runner-up explanation rises.`, delta: { [key]: .2, [entry.second]: .4 }, verdict: 'partly weakened' };
  }
  out.verdict = out.verdict || (out.weakened ? 'partly weakened' : (ups === predicted ? 'strengthened' : 'partly weakened'));
  const be = blindEvidence(entry, blindResult);
  const evidence = [...(entry.evidence || []), ...(be ? [be] : []), { w: out.delta, raw: true, src: 'outcome', obs: 'Experiment result' }];
  const p = posterior(evidence).marg;
  const newTop = readFrom(p, evidence).order[0];
  const newDecision = expectedValues(p).map(x => ({ ...x, ev: x.key === newTop ? x.ev : x.ev * .88 })).sort((a, b) => b.ev - a.ev)[0].key;
  const blindText = blindResult === 'held' ? 'The blind-spot test held, which supports the read and means the experiment needed its extra step.' : blindResult === 'notHeld' ? 'The blind-spot test did not hold. That weakens the read on its own, independent of the experiment.' : null;
  return { text: out.text, blindText, evidence, p, newTop, newDecision, changed: newTop !== entry.hyp, decisionChanged: newDecision !== key, verdict: out.verdict, predicted, observed: ups, weakened: out.weakened || null };
}
