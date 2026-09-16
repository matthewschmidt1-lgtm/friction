# Friction

*Find what's getting in the way.*

A guided diagnosis, not an assessment. Nine questions about observable
behaviour, a few adaptive follow-ups where the answers point, one inversion
question, and an optional cost estimate. About three minutes. No score.

The output is a **Friction Diagnosis**: the friction zone (Business ↔ System,
System ↔ People, People ↔ Business, or Coherence), the constraint behind it, a
causal chain, the forces reinforcing it, what it is costing, the lost leverage,
a possible blind spot, what not to do, one move, one leadership question and
one metric to watch. Come back after acting and the tool closes the learning
loop.

See [DESIGN.md](DESIGN.md) for the creative direction and experience architecture.

## Structure

```
index.html        shell, meta, fonts
css/friction.css  the Low Tide design system
js/content.js     hypotheses, the question pool with signal metadata, playbooks, experiments, economic reads
js/engine.js      the actor-critic: signals → confidence, next-best-question, diagnosis, outcome learning
js/app.js         screens, transitions, storage, the Friction Map (SVG)
qa/               persona harness: answers, ground truth, diagnoses, evaluations
```

No build step, no framework, no backend. Answers and past diagnoses are stored
in the browser's `localStorage` under `friction.v3` and never leave the device.

## How the engine thinks

Signal → Hypothesis → Question → Evidence → Decision → Act → Learn.

- **Hypotheses.** Eleven explanations across the three lenses (for example: decision
  authority too centralized, information not reaching deciders, people not yet
  taught the decision, too many priorities). Each starts at 20% and moves as
  evidence arrives. Confidence is capped so the read can be strong but never certain.
- **Signals.** Every answer option in `js/content.js` carries `sig` (log-odds weights
  for or against hypotheses) and `obs` (the observation in plain words, shown under
  "what supports this").
- **Actor.** After each answer the engine scores every unasked question by how well
  it separates live hypotheses, weighted by uncertainty, importance and
  actionability. It covers all three lenses at least twice, asks the separating
  question when the top two are close, stops when one explanation is clearly ahead,
  and stops sooner when nothing is rising.
- **Critic.** Maintains an explicit state: primary hypothesis with a confidence label,
  supporting evidence, competing hypothesis with its own evidence, disconfirming
  evidence, and the next test (a question if one would still separate them, else
  the experiment). It says so when the leading explanation changed during the
  conversation. The state is exported with "Copy the read".
- **Chain.** Every playbook's causal chain is staged: origin, transmission,
  amplification, consequence, each tagged with the lens it runs through.
- **Evidence versus inference.** Reinforcing forces are labelled "from your answers"
  or "our inference"; they are never mixed.
- **Counterfactual.** What-not-to-do is framed as a prediction: if the read is right,
  the sensible-looking fix should make it worse, and why.
- **Blind spot.** A secondary hypothesis with an evidence level and the cheapest test.
- **Experiment and learning.** Each hypothesis has one experiment as the Actor sees
  it: action, target, duration, expected effect, three things to watch. On return the
  user reports each as improved, unchanged or worse. The engine compares predicted
  with observed and says whether the experiment strengthened, weakened, or partly
  weakened the read. It is looking for where the read was wrong, not for proof it
  was right. Hypotheses update and the read changes if the evidence says so.
- **Economic shadow.** Optional revenue and profitability ranges. Rules produce a
  "your operating profile suggests" read and a qualitative expected-vs-observed
  table with primary signals marked. No invented benchmarks; numeric ranges are a
  later phase with real data.

## Editing the diagnosis

Everything a person reads lives in `js/content.js`:

- `HYPOTHESES` names the eleven explanations and their lens.
- `OPENER`, `QUESTIONS`, `INVERSION` are the pool. A question's `gate` says which
  hypotheses must be live for it to be asked; `act` is its actionability.
- `PLAYBOOKS[h]` holds the read for each hypothesis: constraint, diagnosis, chain,
  forces, consequences, leverage, blind spot, what-not-to-do, guiding policy, move,
  leadership question, metric, two readings.
- `CHAIN_STAGES`, `BLIND_TESTS`, `COUNTERFACTUALS`, `EXPERIMENT_SPECS`,
  `PROFILE_PRIMARY` are the critic-facing structure keyed the same way.
- `EXPERIMENTS[h]` has the steps, the three things to watch, the duration, and an
  `outcome` rule that interprets per-metric results into hypothesis updates.
- `ZONES` and `ZONE_BY_CONSTRAINT` are the friction zones and their summaries.
- `ECON_READS` and `PROFILE_ROWS` are the economic shadow.

The QA harness in `qa/` replays persona answers through the real engine; see
`qa/README.md`.

## Run locally

```bash
python3 -m http.server 8951
```

Then open http://127.0.0.1:8951/. (ES modules need a server; opening the file
directly won't work.)

## Deploy on Railway

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo** → select this repo.
3. Railway detects Node and runs `npm start`, which serves the folder via `serve`.
4. **Settings → Networking → Generate Domain** for a public URL.
5. Update the `canonical` and `og:` URLs in `index.html` to the generated domain.

Every push to `main` redeploys.

## Regenerate the link-preview image

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1200,630 --screenshot=og-image.png http://127.0.0.1:8951/og-image-source.html
```
