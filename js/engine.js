// Friction v2 — engine. Pure functions, no DOM.
import { CORE, FOLLOWUPS, INVERSION, LENSES, MECH_LENS, ZONES, PLAYBOOKS } from './content.js';

const MECHS = Object.keys(MECH_LENS);
const ALL = [...CORE, ...FOLLOWUPS, INVERSION];
export const byId = Object.fromEntries(ALL.map(q => [q.id, q]));
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// answers: { [questionId]: [optionIndex, ...] }
export function selected(answers) {
  const out = [];
  for (const q of ALL) for (const i of answers[q.id] || []) if (q.options[i]) out.push({ q, opt: q.options[i] });
  return out;
}

// Core severities only (used to decide follow-ups). Same shape as full mechanisms.
export function mechanisms(answers, { includeSide = true } = {}) {
  const m = Object.fromEntries(MECHS.map(k => [k, 0]));
  for (const { q, opt } of selected(answers)) {
    if (q.mech && MECHS.includes(q.mech) && q.type === 'single') m[q.mech] = Math.max(m[q.mech], opt.s || 0);
    if (includeSide && opt.side) for (const k in opt.side) m[k] += opt.side[k];
  }
  for (const k of MECHS) m[k] = clamp(m[k], 0, 3);
  return m;
}

// Which follow-ups to ask, given the core answers. At most three, strongest signal first.
export function pickFollowups(answers) {
  const m = mechanisms(answers);
  return FOLLOWUPS.filter(f => f.when(m)).sort((x, y) => y.priority(m) - x.priority(m)).slice(0, 3);
}

export function analyze(answers, cost) {
  const m = mechanisms(answers);
  const lens = {};
  for (const k in LENSES) lens[k] = LENSES[k].mechs.reduce((s, x) => s + m[x], 0) / 3;

  const direct = { BS: 0, SP: 0, PB: 0 };
  for (const { opt } of selected(answers)) if (opt.e) for (const k in opt.e) direct[k] += opt.e[k];
  const edge = {};
  for (const k of ['BS', 'SP', 'PB']) {
    const { a, b } = ZONES[k];
    edge[k] = 0.5 * (lens[a] + lens[b]) + 0.5 * Math.min(lens[a], lens[b]) + 0.35 * direct[k];
  }
  const ranked = Object.keys(edge).sort((x, y) => edge[y] - edge[x] || x.localeCompare(y));
  const vals = Object.values(lens);
  const coherence = Math.min(...vals) >= 1.4 && (Math.max(...vals) - Math.min(...vals)) <= 0.7 && (edge[ranked[0]] - edge[ranked[1]]) < 0.35;
  const zone = coherence ? 'BSP' : ranked[0];
  const secondary = coherence ? ranked[0] : ranked[1];

  // the constraint: the most severe mechanism inside the zone's lenses
  const zoneLenses = coherence ? ['B', 'S', 'P'] : [ZONES[zone].a, ZONES[zone].b];
  const candidates = zoneLenses.flatMap(k => LENSES[k].mechs);
  const constraint = candidates.sort((x, y) => m[y] - m[x] || candidates.indexOf(x) - candidates.indexOf(y))[0];
  const play = PLAYBOOKS[constraint];

  // reinforcing forces: from answers first (follow-ups, inversion, decision detail), then the playbook pool
  const answered = selected(answers).filter(x => x.opt.force).map(x => ({ t: x.opt.force, src: x.q.id }));
  const seen = new Set(); const forces = [];
  for (const f of [...answered.filter(x => x.src === 'inversion'), ...answered.filter(x => x.src !== 'inversion')]) {
    if (!seen.has(f.t)) { seen.add(f.t); forces.push(f); }
  }
  for (const t of play.forces) if (forces.length < 4 && !seen.has(t)) { seen.add(t); forces.push({ t, src: 'pattern' }); }
  const forcesOut = forces.slice(0, 4);

  // confidence
  const margin = coherence ? 0 : edge[ranked[0]] - edge[ranked[1]];
  const followupsAnswered = FOLLOWUPS.filter(f => (answers[f.id] || []).length).length;
  const spread = Math.max(...vals) - Math.min(...vals);
  let confidence = 'emerging';
  if (!coherence && margin >= 0.55 && followupsAnswered >= 1 && spread >= 0.6) confidence = 'high';
  else if (coherence ? true : margin >= 0.25) confidence = 'moderate';
  const maxSev = Math.max(...Object.values(m));
  if (maxSev < 1.5) confidence = 'emerging';

  // illustrative cost
  let estimate = null;
  if (cost && cost.managers > 0 && cost.hours > 0) {
    const hoursYear = cost.managers * cost.hours * 48;
    estimate = { managers: cost.managers, hours: cost.hours, hoursYear, rate: cost.rate || null, dollars: cost.rate ? hoursYear * cost.rate : null };
  }

  const maxLens = Math.max(1, ...vals);
  const lensNorm = Object.fromEntries(Object.keys(lens).map(k => [k, lens[k] / maxLens]));

  return { m, lens, lensNorm, edge, ranked, zone, secondary, coherence, constraint, play, forces: forcesOut, confidence, margin, estimate, maxSev, followupsAnswered };
}

export function isComplete(q, answers) {
  const sel = answers[q.id];
  return Array.isArray(sel) && sel.length > 0;
}
