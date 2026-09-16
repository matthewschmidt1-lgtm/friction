# Diagnosis accuracy harness

- `personas.md` — nine organizations with a lived situation, written for an agent (or a person) to answer in character.
- `ground-truth.json` — the zone and constraint each persona *should* get. Never shown to the answerer.
- `answers.json` — the persona answers, with a rationale per answer, a cost guess, and what each persona hoped the diagnosis would say.
- `diagnoses.json` — what the engine produced before the fixes of 2026-09-16. `diagnoses-v2.json` — after.
- `evaluation.json` — the answerer's in-character verdict on each diagnosis: zone, constraint, blind spot, what-not-to-do, move, forces, confidence, score, issues.
- `question-feedback.md` — questions that were ambiguous or missing an option.

To re-run after changing `js/content.js` or `js/engine.js`: serve the folder, load a page that imports the engine, and replay `answers.json` the way the app does (core questions, gate `execution_why`, `pickFollowups`, inversion, cost). The scoring table in the 2026-09-16 report was produced that way.
