# Diagnosis accuracy harness

- `personas.md` — nine organizations with a lived situation, written for an agent (or a person) to answer in character.
- `ground-truth.json` — the zone and constraint each persona *should* get. Never shown to the answerer.
- `answers.json` — the persona answers, with a rationale per answer, a cost guess, and what each persona hoped the diagnosis would say.
- `diagnoses.json` — what the engine produced before the fixes of 2026-09-16. `diagnoses-v2.json` — after.
- `evaluation.json` — the answerer's in-character verdict on each diagnosis: zone, constraint, blind spot, what-not-to-do, move, forces, confidence, score, issues.
- `question-feedback.md` — questions that were ambiguous or missing an option.

To re-run after changing `js/content.js` or `js/engine.js`: serve the folder, load a page that imports the engine, and replay `answers.json` the way the app does (core questions, gate `execution_why`, `pickFollowups`, inversion, cost). The scoring table in the 2026-09-16 report was produced that way.

## Round two (v3, adaptive engine, 2026-09-16)

- `answers-v3.json` — the same nine personas answered against the v3 pool (opener, nineteen questions, inversion). The engine picks about ten.
- `diagnoses-v3.json` — what the adaptive engine produced: questions asked in order, the trace of the leading explanation after each answer, the current read, evidence for and against, the open question, the experiment, the operating-profile read.
- `evaluation-v3.json` — the in-character verdicts on the v3 output, with a better/same/worse comparison to round one.

Replay: `scratchpad/run-v3.html` pattern (import engine, `newSession`, loop `nextQuestion` → `applyAnswer` with the persona's answer for that id, then `diagnose`).

## Round three (v4, Bayesian network + VOI + decision network)

- `diagnoses-v4.json` — the same answers replayed through the network engine: read, decision, most probable configuration, top interventions by expected value.
