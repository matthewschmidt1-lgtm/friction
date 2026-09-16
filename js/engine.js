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
  // implied evidence can lift a mechanism, but never more than 1.5 levels above what the person said directly
  const direct = {};
  for (const { q, opt } of selected(answers)) if (q.mech && MECHS.includes(q.mech) && q.type === 'single') direct[q.mech] = Math.max(direct[q.mech] ?? 0, opt.s || 0);
  for (const k of MECHS) { if (includeSide && direct[k] !== undefined) m[k] = Math.min(m[k], direct[k] + 1.5); m[k] = clamp(m[k], 0, 3); }
  return m;
}

// Severity from the core question alone, before side bumps. Used to break ties honestly:
// what the person said directly outranks what other answers implied.
export function coreSeverity(answers) {
  const c = Object.fromEntries(MECHS.map(k => [k, 0]));
  for (const { q, opt } of selected(answers)) {
    if (q.mech && MECHS.includes(q.mech) && q.type === 'single') c[q.mech] = Math.max(c[q.mech], opt.s || 0);
  }
  return c;
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
  // coherence: every lens carrying friction, none standing out, and no single mechanism severe enough to be the constraint on its own
  const coreSev = coreSeverity(answers);
  const standout = Math.max(...Object.values(coreSev)) >= 2.5; // judged on direct answers, not implied bumps
  const coherence = !standout && Math.min(...vals) >= 1.4 && (Math.max(...vals) - Math.min(...vals)) <= 0.7 && (edge[ranked[0]] - edge[ranked[1]]) < 0.35;
  const zone = coherence ? 'BSP' : ranked[0];
  const secondary = coherence ? ranked[0] : ranked[1];

  // the constraint: the most severe mechanism inside the zone's lenses
  const zoneLenses = coherence ? ['B', 'S', 'P'] : [ZONES[zone].a, ZONES[zone].b];
  const candidates = zoneLenses.flatMap(k => LENSES[k].mechs);
  const core = coreSev;
  const order = [...candidates];
  const constraint = candidates.sort((x, y) => m[y] - m[x] || core[y] - core[x] || order.indexOf(x) - order.indexOf(y))[0];
  const play = PLAYBOOKS[constraint];

  // low friction: nothing rose to a level worth calling a constraint
  const maxSevEarly = Math.max(...Object.values(m));
  const low = maxSevEarly < 1.25 && Math.max(...vals) < 1;
  // dominant lens: one lens far ahead of both others, so the zone is less certain than the constraint
  const sortedLens = Object.entries(lens).sort((a, b) => b[1] - a[1]);
  const dominant = !coherence && sortedLens[0][1] - sortedLens[1][1] >= 1.0 ? sortedLens[0][0] : null;

  // reinforcing forces: from answers first (follow-ups, inversion, decision detail), then the playbook pool
  const answered = selected(answers).filter(x => x.opt.force).map(x => ({ t: x.opt.force, src: x.q.id }));
  const seen = new Set(); const forces = [];
  for (const f of [...answered.filter(x => x.src === 'inversion'), ...answered.filter(x => x.src !== 'inversion')]) {
    if (!seen.has(f.t)) { seen.add(f.t); forces.push(f); }
  }
  // fill from the pattern only up to three in total; pattern forces are labelled as such, never passed off as evidence
  for (const t of play.forces) if (forces.length < 3 && !seen.has(t)) { seen.add(t); forces.push({ t, src: 'pattern' }); }
  const forcesOut = forces.slice(0, 4);

  // confidence
  const margin = coherence ? 0 : edge[ranked[0]] - edge[ranked[1]];
  const followupsAnswered = FOLLOWUPS.filter(f => (answers[f.id] || []).length).length;
  const spread = Math.max(...vals) - Math.min(...vals);
  let confidence = 'emerging';
  if (!coherence && margin >= 0.55 && followupsAnswered >= 1 && spread >= 0.6) confidence = 'high';
  else if (coherence ? true : margin >= 0.25) confidence = 'moderate';
  // a dominant lens with a clear top mechanism is a confident constraint even when the zone is a near tie
  const maxSev = Math.max(...Object.values(m));
  if ((dominant || standout) && maxSev >= 2.5 && confidence === 'emerging') confidence = 'moderate';
  if (maxSev < 1.5) confidence = 'emerging';

  // illustrative cost
  let estimate = null;
  if (cost && cost.managers > 0 && cost.hours > 0) {
    const hoursYear = cost.managers * cost.hours * 48;
    estimate = { managers: cost.managers, hours: cost.hours, hoursYear, rate: cost.rate || null, dollars: cost.rate ? hoursYear * cost.rate : null };
  }

  const maxLens = Math.max(1, ...vals);
  const lensNorm = Object.fromEntries(Object.keys(lens).map(k => [k, lens[k] / maxLens]));

  return { m, lens, lensNorm, edge, ranked, zone, secondary, coherence, constraint, play, forces: forcesOut, confidence, margin, estimate, maxSev, followupsAnswered, low, dominant, core };
}

export function isComplete(q, answers) {
  const sel = answers[q.id];
  return Array.isArray(sel) && sel.length > 0;
}
