// Friction v4 — engine.
// Belief: exact Bayesian inference over a causal network of eleven binary states (2,048 joint configurations).
// Evidence: every answer option is a likelihood factor (its signal weights are log likelihood ratios).
// Actor: value of information — which question could change what we recommend, net of its cost.
// Decision: the intervention with the highest expected value under the belief.
// Learn: experiment outcomes are evidence too, so the belief and the decision move together.
import { HYPOTHESES, HYP_ORDER, OPENER, QUESTIONS, INVERSION, ALL_QUESTIONS, ACTOR, ZONES, PLAYBOOKS, EXPERIMENTS, EXPERIMENT_SPECS, ECON_READS, PROFILE_ROWS, PROFILE_PRIMARY, confidenceLabel,
         NETWORK, NETWORK_ORDER, INTERVENTIONS, QUESTION_COST, VOI, MODEL_VERSION, BLIND_SPOTS } from './content.js';

export const byId = Object.fromEntries(ALL_QUESTIONS.map(q => [q.id, q]));
const N = HYP_ORDER.length;
const IDX = Object.fromEntries(HYP_ORDER.map((h, i) => [h, i]));
const STATES = 1 << N;

/* ---------- the network prior over all 2,048 configurations (computed once) ---------- */
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

/* ---------- inference ---------- */
// evidence: array of { w: {hyp: logLR}, src, obs } — each contributes factor Π_h exp(w_h · [h on])
function posterior(evidence) {
  const post = new Float64Array(STATES); let Z = 0;
  const mult = evidence.map(e => HYP_ORDER.map(h => e.w[h] ? Math.exp(e.w[h]) : 1));
  for (let s = 0; s < STATES; s++) {
    let p = PRIOR[s];
    for (let k = 0; k < mult.length; k++) { const m = mult[k]; for (let i = 0; i < N; i++) if ((s >> i) & 1) p *= m[i]; }
    post[s] = p; Z += p;
  }
  const marg = {}; let best = 0;
  for (let i = 0; i < N; i++) { let m = 0; for (let s = 0; s < STATES; s++) if ((s >> i) & 1) m += post[s]; marg[HYP_ORDER[i]] = m / Z; }
  for (let s = 1; s < STATES; s++) if (post[s] > post[best]) best = s;
  const mpe = NETWORK_ORDER.filter(h => (best >> IDX[h]) & 1);
  return { marg, mpe, Z, post };
}

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
    for (const i of s.answers[qid] || []) { const opt = q.options[i]; if (opt) s.evidence.push({ w: opt.sig, src: qid, obs: opt.obs || opt.t }); }
    s.belief = posterior(s.evidence); s.history.push(ranked(s)[0]);
  }
  if (!s.asked.length) s.belief = posterior([]);
}
export function signals(s) {
  const out = [];
  for (const qid of s.asked) { const q = byId[qid]; for (const i of s.answers[qid] || []) { const opt = q.options[i]; if (opt) out.push({ qid, q, opt }); } }
  return out;
}

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
function answerOutcomes(s, q) {
  const base = s.belief;
  const outs = q.options.map(opt => {
    const m = HYP_ORDER.map(h => opt.sig[h] ? Math.exp(opt.sig[h]) : 1);
    let lik = 0;
    for (let st = 0; st < STATES; st++) { let f = base.post[st]; for (let i = 0; i < N; i++) if ((st >> i) & 1) f *= m[i]; lik += f; }
    return { opt, lik: lik / base.Z };
  });
  const Z = outs.reduce((a, o) => a + o.lik, 0) || 1;
  return outs.map(o => ({ ...o, p: o.lik / Z, marg: posterior([...s.evidence, { w: o.opt.sig }]).marg }));
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
export function bestSeparator(s, p, a, b) {
  const cands = QUESTIONS.filter(q => !s.asked.includes(q.id) && (!q.gate || q.gate(p)));
  const sep = q => { const d = q.options.map(o => (o.sig[a] || 0) - (o.sig[b] || 0)); return Math.max(...d) - Math.min(...d); };
  let best = null, bestSep = 0;
  for (const q of cands) { const v = sep(q); if (v > bestSep) { bestSep = v; best = q; } }
  return { question: best, sep: bestSep };
}
export function nextQuestion(s) {
  if (!s.asked.includes('opener')) return OPENER;
  if (s.asked.includes('inversion')) return null;
  const p = s.belief.marg; const r = ranked(s); const n = s.asked.length - 1;
  if (n >= ACTOR.maxQuestions) return INVERSION;
  const quiet = p[r[0]] < .3;
  const covered = Object.values(lensCounts(s)).every(c => c >= 2);
  if (n >= ACTOR.minQuestions && quiet) return INVERSION;
  const candidates = QUESTIONS.filter(q => !s.asked.includes(q.id) && (!q.gate || q.gate(p)));
  if (!candidates.length) return INVERSION;
  const scored = candidates.map(q => ({ q, ...valueOfInformation(s, q) }));
  const counts = lensCounts(s);
  for (const x of scored) if (x.q.lens && counts[x.q.lens] < 2 && n >= 2) x.score *= 1.5;
  scored.sort((a, b) => b.score - a.score);
  const anyChange = scored.some(x => x.wouldChange && x.voi >= VOI.minToAsk);
  if (n >= ACTOR.minQuestions && covered && !anyChange) return INVERSION;
  return scored[0].q;
}
export function voiTable(s) { const p = s.belief.marg; return QUESTIONS.filter(q => !s.asked.includes(q.id) && (!q.gate || q.gate(p))).map(q => ({ id: q.id, ...valueOfInformation(s, q) })).sort((a, b) => b.score - a.score); }
export function progress(s) { return Math.min(1, s.asked.length / (ACTOR.maxQuestions + 2)); }

/* ---------- the read: prefer the cause over its effects ---------- */
// Among states within reach of the top marginal that carry enough direct evidence, take the most
// upstream one in the causal order. Used by the diagnosis and by the learning step alike.
export function readFrom(p, evidence) {
  const r0 = HYP_ORDER.slice().sort((a, b) => p[b] - p[a]);
  const direct = {}; for (const e of evidence) if (e.src !== 'outcome' && e.src !== 'blind') for (const h in e.w) if (e.w[h] > 0) direct[h] = (direct[h] || 0) + e.w[h];
  const reach = r0.filter(h => p[h] >= p[r0[0]] - .12 && (direct[h] || 0) >= 2.5);
  const upstream = NETWORK_ORDER.find(h => reach.includes(h));
  const top = upstream || r0[0];
  return [top, ...r0.filter(h => h !== top)];
}

/* ---------- diagnosis ---------- */
export function diagnose(s, cost, ranges = {}) {
  const p = s.belief.marg;
  const r = readFrom(p, s.evidence);
  const top = r[0];
  const second = r[1], third = r[2];
  const low = p[top] < .42;
  const lensOf = h => HYPOTHESES[h].lens;
  const elevated = r.filter(h => p[h] >= .5);
  const elevatedLenses = new Set(elevated.map(lensOf));
  const coherence = !low && p[top] < .9 && elevated.length >= 4 && elevatedLenses.size === 3 && (p[top] - p[elevated[3]]) < .3;

  const load = { B: 0, S: 0, P: 0 };
  for (const h of HYP_ORDER) load[lensOf(h)] += p[h] * HYPOTHESES[h].importance;
  const maxLoad = Math.max(...Object.values(load)) || 1;
  const lensNorm = Object.fromEntries(Object.keys(load).map(k => [k, load[k] / maxLoad]));
  const otherLensHyp = r.find(h => lensOf(h) !== lensOf(top));
  const pair = new Set([lensOf(top), lensOf(otherLensHyp)]);
  const zone = coherence ? 'BSP' : Object.keys(ZONES).find(k => k !== 'BSP' && pair.has(ZONES[k].a) && pair.has(ZONES[k].b));
  const loads = Object.entries(load).sort((a, b) => b[1] - a[1]);
  const dominant = !coherence && loads[0][1] - loads[1][1] >= 1.0 ? loads[0][0] : null;

  const strength = w => Math.abs(w) >= 1.2 ? 'High' : Math.abs(w) >= .6 ? 'Medium' : 'Low';
  const supports = [], contradicts = [], supportsSecond = [];
  for (const { q, opt } of signals(s)) {
    const w = opt.sig[top] || 0;
    if (w >= .3) supports.push({ obs: opt.obs || opt.t, strength: strength(w), w, from: q.title });
    else if (w <= -.3) contradicts.push({ obs: opt.obs || opt.t, strength: strength(w), w, from: q.title });
    const w2 = opt.sig[second] || 0; if (w2 >= .6) supportsSecond.push({ obs: opt.obs || opt.t, strength: strength(w2), w: w2 });
  }
  supports.sort((a, b) => b.w - a.w); contradicts.sort((a, b) => a.w - b.w); supportsSecond.sort((a, b) => b.w - a.w);

  const evs = expectedValues(p).map(x => ({ ...x, ev: x.key === top ? x.ev : x.ev * .88 })).sort((a, b) => b.ev - a.ev);
  const decision = low ? top : evs[0].key;
  const experiment = EXPERIMENTS[decision];
  const spec = EXPERIMENT_SPECS[decision];

  let open = null;
  const competing = !low && (p[second] >= p[top] - .2 || p[top] < .8);
  if (competing) {
    const cands = QUESTIONS.filter(q => !s.asked.includes(q.id) && (!q.gate || q.gate(p)));
    const scored = cands.map(q => ({ q, ...valueOfInformation(s, q) })).filter(x => x.wouldChange && x.voi >= VOI.minToAsk).sort((a, b) => b.voi - a.voi);
    const sep = bestSeparator(s, p, top, second);
    const pick = scored[0] ? scored[0].q : (sep.question && sep.sep >= 1.0 ? sep.question : null);
    open = { between: [top, second], question: pick ? pick.title : null, secondEvidence: supportsSecond.slice(0, 2) };
  }
  const mid = s.history[Math.floor(s.history.length / 2)];
  const changedMind = !low && s.history.length >= 6 && mid && mid !== top && p[mid] >= .35 ? { from: mid, to: top } : null;

  const play = PLAYBOOKS[top];
  const decisionPlay = PLAYBOOKS[decision];
  const seen = new Set(); const forces = [];
  const profile = PROFILE_ROWS.map(row => ({ k: row.k, expected: row.expected, good: row.good, observed: row.observe(p), primary: (PROFILE_PRIMARY[top] || []).includes(row.k) }));
  if (low) return { p, ranked: r, top, second, third, low, coherence: false, zone, dominant: null, lensNorm, load, supports: [], contradicts: [], open: null, changedMind: null, forces: [], play, decision: top, decisionPlay: play, experiment: EXPERIMENTS[top], spec: EXPERIMENT_SPECS[top], evs, mpe: [], estimate: null, econ: null, profile, blind: { statement: '', status: 'n/a' }, label: { key: 'none', label: 'No significant friction', d: 'Nothing you said rose above a weak signal. The strongest was ' + HYPOTHESES[top].name.toLowerCase() + ', and it is not worth acting on.' }, margin: p[top] - p[second], asked: s.asked.slice(), modelVersion: MODEL_VERSION };
  for (const { opt } of signals(s)) if (opt.force && !seen.has(opt.force)) { seen.add(opt.force); forces.push({ t: opt.force, src: 'you' }); }
  for (const t of play.forces) if (forces.length < 3 && !seen.has(t)) { seen.add(t); forces.push({ t, src: 'pattern' }); }

  let estimate = null;
  if (cost && cost.managers > 0 && cost.hours > 0) { const hoursYear = cost.managers * cost.hours * 48; estimate = { managers: cost.managers, hours: cost.hours, hoursYear, rate: cost.rate || null, dollars: cost.rate ? hoursYear * cost.rate : null }; }
  const econ = ECON_READS.find(e => e.when(p, ranges)) || null;

  const margin0 = p[top] - p[second];
  let label = confidenceLabel(p[top]);
  const capAt = key => { const order = ['early', 'emerging', 'strong', 'high']; if (order.indexOf(label.key) > order.indexOf(key)) label = confidenceLabel({ early: 0, emerging: .45, strong: .65, high: .8 }[key]); };
  if (coherence) capAt('emerging'); else if (margin0 < .06) capAt('emerging'); else if (margin0 < .18) capAt('strong');

  const critic = {
    primary: { hyp: top, name: HYPOTHESES[top].name, confidence: label.label },
    supporting: supports.slice(0, 5).map(x => x.obs),
    competing: { hyp: second, name: HYPOTHESES[second].name, confidence: confidenceLabel(p[second]).label, evidence: supportsSecond.slice(0, 3).map(x => x.obs) },
    disconfirming: contradicts.slice(0, 3).map(x => x.obs),
    configuration: s.belief.mpe,
    decision: { key: decision, action: (spec || {}).action, ev: evs[0].ev, alternatives: evs.slice(1, 3).map(x => ({ key: x.key, ev: x.ev })) },
    nextTest: open && open.question ? { kind: 'question', t: open.question } : { kind: 'experiment', t: `${experiment.days}-day ${((spec || {}).action || 'experiment')}`.toLowerCase() },
  };
  const blind = { statement: play.blind, ...(BLIND_SPOTS[top] || {}), status: 'untested' };
  critic.blindSpot = { hyp: top, statement: play.blind, test: blind.test, prediction: { ifTrue: blind.ifTrue, ifFalse: blind.ifFalse }, status: 'untested' };
  return { p, ranked: r, top, second, third, low, coherence, zone, dominant, lensNorm, load, supports, contradicts, open, changedMind, forces: forces.slice(0, 4), play, decision, decisionPlay, experiment, spec, evs, mpe: s.belief.mpe, estimate, econ, profile, label, critic, blind, margin: margin0, asked: s.asked.slice(), modelVersion: MODEL_VERSION };
}

/* ---------- learn: the blind-spot test and the experiment result are both evidence ---------- */
export function blindEvidence(entry, result) {
  const spec = BLIND_SPOTS[entry.hyp]; if (!spec || !result || result === 'skipped') return null;
  const w = result === 'held' ? spec.held : spec.notHeld;
  return { w, src: 'blind', obs: result === 'held' ? 'Blind-spot test held' : 'Blind-spot test did not hold' };
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
  const evidence = [...(entry.evidence || []), ...(be ? [be] : []), { w: out.delta, src: 'outcome', obs: 'Experiment result' }];
  const belief = posterior(evidence);
  const p = belief.marg;
  const newTop = readFrom(p, evidence)[0];
  const newDecision = expectedValues(p).map(x => ({ ...x, ev: x.key === newTop ? x.ev : x.ev * .88 })).sort((a, b) => b.ev - a.ev)[0].key;
  const blindText = blindResult === 'held' ? 'The blind-spot test held, which supports the read and means the experiment needed its extra step.' : blindResult === 'notHeld' ? 'The blind-spot test did not hold. That weakens the read on its own, independent of the experiment.' : null;
  return { text: out.text, blindText, evidence, p, newTop, newDecision, changed: newTop !== entry.hyp, decisionChanged: newDecision !== key, verdict: out.verdict, predicted, observed: ups, weakened: out.weakened || null };
}
