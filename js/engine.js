// Friction v3 — engine. Deterministic actor-critic over hypotheses. Pure functions plus a session object.
import { HYPOTHESES, HYP_ORDER, OPENER, QUESTIONS, INVERSION, ALL_QUESTIONS, ACTOR, ZONES, PLAYBOOKS, EXPERIMENTS, ECON_READS, PROFILE_ROWS, confidenceLabel } from './content.js';

const PRIOR = -1.386; // p = 0.20
const LOGIT_MIN = -4, LOGIT_MAX = 3.2; // p stays inside [0.02, 0.96]: the read can be strong, never certain
const sigmoid = x => 1 / (1 + Math.exp(-x));
const clampL = x => Math.max(LOGIT_MIN, Math.min(LOGIT_MAX, x));
export const byId = Object.fromEntries(ALL_QUESTIONS.map(q => [q.id, q]));

/* ---------- session ---------- */
export function newSession() {
  return { asked: [], answers: {}, logit: Object.fromEntries(HYP_ORDER.map(h => [h, PRIOR])), raw: Object.fromEntries(HYP_ORDER.map(h => [h, 0])), history: [] };
}
export function confidences(s) { return Object.fromEntries(HYP_ORDER.map(h => [h, sigmoid(s.logit[h])])); }
// rank by confidence; when two are pinned at the cap, the one with more total evidence leads
export function ranked(s) { const p = confidences(s); const raw = s.raw || {}; return HYP_ORDER.slice().sort((a, b) => (p[b] - p[a]) || ((raw[b] || 0) - (raw[a] || 0))); }

/* ---------- critic: turn an answer into signals and update every hypothesis ---------- */
export function applyAnswer(s, qid, indices) {
  const q = byId[qid]; if (!q) return;
  if (!s.asked.includes(qid)) s.asked.push(qid);
  s.answers[qid] = indices.slice();
  recompute(s);
}
export function undoLast(s) {
  const qid = s.asked.pop(); if (!qid) return;
  delete s.answers[qid]; s.history.pop(); recompute(s);
}
export function recompute(s) {
  s.logit = Object.fromEntries(HYP_ORDER.map(h => [h, PRIOR]));
  s.raw = Object.fromEntries(HYP_ORDER.map(h => [h, 0]));
  s.history = [];
  for (const qid of s.asked) {
    const q = byId[qid];
    for (const i of s.answers[qid] || []) {
      const opt = q.options[i]; if (!opt) continue;
      for (const h in opt.sig) { s.logit[h] = clampL(s.logit[h] + opt.sig[h]); s.raw[h] += opt.sig[h]; }
    }
    s.history.push(ranked(s)[0]);
  }
}
export function signals(s) {
  const out = [];
  for (const qid of s.asked) { const q = byId[qid]; for (const i of s.answers[qid] || []) { const opt = q.options[i]; if (opt) out.push({ qid, q, opt }); } }
  return out;
}

/* ---------- actor: what should we ask next? ---------- */
function discrimination(q, h) {
  const w = q.options.map(o => o.sig[h] || 0);
  return (Math.max(...w) - Math.min(...w)) / 3.6;
}
export function questionValue(s, q, p) {
  const askedLenses = new Set(s.asked.map(id => byId[id].lens).filter(Boolean));
  let v = 0;
  for (const h of HYP_ORDER) {
    const d = discrimination(q, h); if (!d) continue;
    const u = 4 * p[h] * (1 - p[h]);
    const imp = HYPOTHESES[h].importance * (0.5 + p[h]);
    v += u * imp * d;
  }
  v *= q.act;
  if (q.lens && !askedLenses.has(q.lens) && s.asked.length >= 2) v *= 1.4; // cover every lens early
  // once a leader emerges, prefer the question that separates it from the runner-up
  const r = ranked(s);
  if (p[r[0]] >= .55) { const d = q.options.map(o => (o.sig[r[0]] || 0) - (o.sig[r[1]] || 0)); v += 1.2 * q.act * (Math.max(...d) - Math.min(...d)) / 3.6; }
  return v;
}
export function nextQuestion(s) {
  if (!s.asked.includes('opener')) return OPENER;
  if (s.asked.includes('inversion')) return null;
  const p = confidences(s);
  const n = s.asked.length - 1; // core questions asked so far
  const r = ranked(s);
  const clear = p[r[0]] >= ACTOR.stopConfidence && (p[r[0]] - p[r[1]]) >= ACTOR.stopMargin;
  const quiet = p[r[0]] < .3; // nothing is rising: stop asking, say so
  if (n >= ACTOR.maxQuestions || (n >= ACTOR.minQuestions && (clear || quiet))) return INVERSION;
  const candidates = QUESTIONS.filter(q => !s.asked.includes(q.id) && (!q.gate || q.gate(p)));
  if (!candidates.length) return INVERSION;
  // nothing left that could separate the top two: stop asking
  if (n >= ACTOR.minQuestions && p[r[0]] >= .8) {
    const sep = q => { const d = q.options.map(o => (o.sig[r[0]] || 0) - (o.sig[r[1]] || 0)); return Math.max(...d) - Math.min(...d); };
    if (Math.max(...candidates.map(sep)) < 1.0) return INVERSION;
  }
  return candidates.map(q => [questionValue(s, q, p), q]).sort((a, b) => b[0] - a[0])[0][1];
}
export function progress(s) { return Math.min(1, s.asked.length / (ACTOR.maxQuestions + 2)); }

/* ---------- diagnosis ---------- */
export function diagnose(s, cost, ranges = {}) {
  const p = confidences(s);
  const r = ranked(s);
  const top = r[0], second = r[1], third = r[2];
  const low = p[top] < .42;
  const lensOf = h => HYPOTHESES[h].lens;
  // coherence: several explanations moderately supported across all three lenses and no standout
  const elevated = r.filter(h => p[h] >= .6);
  const elevatedLenses = new Set(elevated.map(lensOf));
  const coherence = !low && elevated.length >= 4 && elevatedLenses.size >= 2 && (p[top] - p[elevated[3]]) < .25;

  // lens loads and zone
  const load = { B: 0, S: 0, P: 0 };
  for (const h of HYP_ORDER) load[lensOf(h)] += p[h] * HYPOTHESES[h].importance;
  const maxLoad = Math.max(...Object.values(load)) || 1;
  const lensNorm = Object.fromEntries(Object.keys(load).map(k => [k, load[k] / maxLoad]));
  const otherLensHyp = r.find(h => lensOf(h) !== lensOf(top));
  const pair = new Set([lensOf(top), lensOf(otherLensHyp)]);
  const zone = coherence ? 'BSP' : Object.keys(ZONES).find(k => k !== 'BSP' && pair.has(ZONES[k].a) && pair.has(ZONES[k].b));
  const loads = Object.entries(load).sort((a, b) => b[1] - a[1]);
  const dominant = !coherence && loads[0][1] - loads[1][1] >= 1.0 ? loads[0][0] : null;

  // evidence for and against the current read
  const strength = w => Math.abs(w) >= 1.2 ? 'High' : Math.abs(w) >= .6 ? 'Medium' : 'Low';
  const supports = [], contradicts = [];
  for (const { q, opt } of signals(s)) {
    const w = opt.sig[top] || 0;
    if (w >= .3) supports.push({ obs: opt.obs || opt.t, strength: strength(w), w, from: q.title });
    else if (w <= -.3) contradicts.push({ obs: opt.obs || opt.t, strength: strength(w), w, from: q.title });
  }
  supports.sort((a, b) => b.w - a.w); contradicts.sort((a, b) => a.w - b.w);

  // what we still need to know: the unasked question that best separates the top two
  let open = null;
  const competing = p[second] >= p[top] - .2 || p[top] < .8;
  if (competing) {
    const cands = QUESTIONS.filter(q => !s.asked.includes(q.id));
    const sep = q => { const d = q.options.map(o => (o.sig[top] || 0) - (o.sig[second] || 0)); return Math.max(...d) - Math.min(...d); };
    const best = cands.map(q => [sep(q), q]).sort((a, b) => b[0] - a[0])[0];
    open = { between: [top, second], question: best && best[0] > 1.0 ? best[1].title : null };
  }

  // did the read change during the conversation?
  const mid = s.history[Math.floor(s.history.length / 2)];
  const changedMind = !low && s.history.length >= 6 && mid && mid !== top && p[mid] >= .35 ? { from: mid, to: top } : null;

  // reinforcing forces: inversion answers first, then the playbook pattern, three at most from the pattern
  const play = PLAYBOOKS[top];
  const seen = new Set(); const forces = [];
  for (const { q, opt } of signals(s)) if (opt.force && !seen.has(opt.force)) { seen.add(opt.force); forces.push({ t: opt.force, src: 'you' }); }
  for (const t of play.forces) if (forces.length < 3 && !seen.has(t)) { seen.add(t); forces.push({ t, src: 'pattern' }); }

  let estimate = null;
  if (cost && cost.managers > 0 && cost.hours > 0) {
    const hoursYear = cost.managers * cost.hours * 48;
    estimate = { managers: cost.managers, hours: cost.hours, hoursYear, rate: cost.rate || null, dollars: cost.rate ? hoursYear * cost.rate : null };
  }
  const econ = low ? null : (ECON_READS.find(e => e.when(p, ranges)) || null);
  const profile = PROFILE_ROWS.map(row => ({ k: row.k, expected: row.expected, observed: row.observe(p) }));
  // the label answers "how sure should you be about THIS read", so a close runner-up caps it
  const margin0 = p[top] - p[second];
  let label = confidenceLabel(p[top]);
  const capAt = key => { const order = ['early', 'emerging', 'strong', 'high']; if (order.indexOf(label.key) > order.indexOf(key)) label = confidenceLabel({ early: 0, emerging: .45, strong: .65, high: .8 }[key]); };
  if (coherence) capAt('emerging'); else if (margin0 < .06) capAt('emerging'); else if (margin0 < .18) capAt('strong');
  const experiment = EXPERIMENTS[top];

  return { p, ranked: r, top, second, third, low, coherence, zone, dominant, lensNorm, load, supports, contradicts, open, changedMind, forces: forces.slice(0, 4), play, experiment, estimate, econ, profile, label, margin: p[top] - p[second], asked: s.asked.slice() };
}

/* ---------- learn: the experiment result is the reward signal ---------- */
export function applyOutcome(entry, results) {
  const exp = EXPERIMENTS[entry.hyp];
  let out = exp && exp.outcome ? exp.outcome(results) : null;
  if (!out) {
    const vals = Object.values(results);
    const ups = vals.filter(v => v === 'up').length, downs = vals.filter(v => v === 'down').length;
    if (ups >= 2) out = { text: 'The friction decreased on most of what you watched. The hypothesis held. Run Friction again to find what is now the constraint.', delta: { [entry.hyp]: 1.0 } };
    else if (ups === 0 && downs >= 1) out = { text: 'It got worse. Either the move was aimed at a symptom, or something is reinforcing the friction harder than expected. The runner-up explanation rises.', delta: { [entry.hyp]: -.9, [entry.second]: .7 } };
    else if (ups === 0) out = { text: 'No change. Either the move was too small to register, or the constraint is somewhere else. The runner-up explanation rises.', delta: { [entry.hyp]: -.5, [entry.second]: .5 } };
    else out = { text: 'A partial result. Something moved and something didn\'t, which usually means the hypothesis is right about the mechanism and wrong about where it starts.', delta: { [entry.hyp]: .2, [entry.second]: .3 } };
  }
  const logit = { ...entry.logit };
  for (const h in out.delta) logit[h] = clampL((logit[h] ?? PRIOR) + out.delta[h]);
  const p = Object.fromEntries(HYP_ORDER.map(h => [h, sigmoid(logit[h])]));
  const newTop = HYP_ORDER.slice().sort((a, b) => p[b] - p[a])[0];
  return { text: out.text, logit, p, newTop, changed: newTop !== entry.hyp };
}
