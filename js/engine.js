// Friction — scoring engine. Pure functions, no DOM.
import { QUESTIONS, DECISIONS, BLIND_SPOTS, NEXT_QUESTIONS, NEXT_MOVES, EDGES } from './content.js';

const byId = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

export function selectedOptions(answers) {
  const out = [];
  for (const q of QUESTIONS) {
    const sel = answers[q.id];
    if (!sel) continue;
    for (const i of sel) if (q.options[i]) out.push({ q, opt: q.options[i] });
  }
  return out;
}

export function analyze(answers, decisionKey) {
  const lens = { B: 0, S: 0, P: 0 };
  const edge = { BS: 0, SP: 0, PB: 0 };
  const tags = {};
  for (const { q, opt } of selectedOptions(answers)) {
    if (q.lensPick) continue; // the hypothesis carries no weight
    for (const k in opt.l) lens[k] += opt.l[k];
    for (const k in opt.e) edge[k] += opt.e[k];
    for (const t of opt.tags) tags[t] = (tags[t] || 0) + 1;
  }
  // an edge is the direct signals plus the pull of its two lenses
  const edgeScore = {};
  for (const k in EDGES) {
    const { a, b } = EDGES[k];
    // direct conflict evidence, plus the pull of both lenses, weighted toward the weaker one:
    // friction between two lenses needs both to be carrying signal
    edgeScore[k] = edge[k] + 0.2 * (lens[a] + lens[b]) + 0.4 * Math.min(lens[a], lens[b]);
  }
  const edgesRanked = Object.keys(edgeScore).sort((x, y) => edgeScore[y] - edgeScore[x] || x.localeCompare(y));
  const primary = edgesRanked[0], secondary = edgesRanked[1];

  const maxLens = Math.max(1, ...Object.values(lens));
  const lensNorm = { B: lens.B / maxLens, S: lens.S / maxLens, P: lens.P / maxLens };
  const totalEdge = Object.values(edgeScore).reduce((a, b) => a + b, 0) || 1;
  const edgeNorm = Object.fromEntries(Object.keys(edgeScore).map(k => [k, edgeScore[k] / totalEdge]));

  // decision statements ranked by tag fit
  const decisionScore = {};
  for (const k in DECISIONS) decisionScore[k] = DECISIONS[k].tags.reduce((s, t) => s + (tags[t] || 0), 0);
  const decisionsRanked = Object.keys(DECISIONS).sort((x, y) => decisionScore[y] - decisionScore[x]);
  const decision = decisionKey || decisionsRanked[0];

  const hyp = (answers.hypothesis || []).map(i => byId.hypothesis.options[i].lens);
  const bsIdx = (answers.blindspot || [])[0];
  const bs = bsIdx != null ? byId.blindspot.options[bsIdx].tags.find(t => t.startsWith('bs-')) : null;

  const ctx = { lens, edge: edgeScore, tags, primary, secondary, decision, bs, hyp, has: t => !!tags[t] };
  const blind = BLIND_SPOTS.find(r => r.when(ctx));
  const question = NEXT_QUESTIONS[decision][primary];
  const move = NEXT_MOVES[decision][primary];

  return { lens, lensNorm, edgeScore, edgeNorm, edgesRanked, primary, secondary, tags, decisionsRanked, decisionScore, decision, bs, hyp, blind, question, move,
    hypothesisNote: hypothesisNote(hyp, primary), evidence: { [primary]: evidenceFor(answers, primary), [secondary]: evidenceFor(answers, secondary) } };
}

// The user's own answers that pulled toward an edge, strongest first.
export function evidenceFor(answers, edgeKey, limit = 4) {
  const { a, b } = EDGES[edgeKey];
  const rows = [];
  for (const { q, opt } of selectedOptions(answers)) {
    if (q.lensPick) continue;
    const score = (opt.e[edgeKey] || 0) + 0.25 * ((opt.l[a] || 0) + (opt.l[b] || 0));
    if (score >= 0.3) rows.push({ t: opt.t, q: q.evidenceLabel || q.title, lens: q.lens || null, score });
  }
  return rows.sort((x, y) => y.score - x.score).slice(0, limit);
}

export function hypothesisNote(hyp, primary) {
  if (!hyp || !hyp.length) return null;
  const { a, b } = EDGES[primary];
  const names = { B: 'Business', S: 'System', P: 'People' };
  const looked = hyp.map(k => names[k]);
  const hitA = hyp.includes(a), hitB = hyp.includes(b);
  const list = looked.length === 1 ? looked[0] : looked.slice(0, -1).join(', ') + ' and ' + looked.at(-1);
  if (hitA && hitB) return { kind: 'agree', t: `You looked at ${list}. The pattern agrees. The question now is why it hasn't moved.` };
  if (hitA || hitB) {
    const missing = names[hitA ? b : a];
    return { kind: 'partial', t: `You looked at ${list}. The pattern agrees, and adds ${missing}. The friction is in the connection between them.` };
  }
  return { kind: 'miss', t: `You looked first at ${list}. Your answers concentrated between ${names[a]} and ${names[b]}. That gap is often where the blind spot lives.` };
}

export function isComplete(q, answers) {
  const sel = answers[q.id];
  return Array.isArray(sel) && sel.length > 0;
}
