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

- **Belief: a Bayesian network.** The eleven hypotheses are binary states in a small
  causal network (leadership alignment → priority load → decision rights → escalation,
  and so on) with noisy-OR conditional probabilities. Eleven nodes make 2,048 joint
  configurations, so inference is exact by enumeration: no approximation, no library.
  Every answer option is a likelihood factor; its signal weights are log likelihood
  ratios. The engine reports marginals per state and the most probable configuration.
- **The read prefers the cause.** Among states near the top of the belief that the
  person gave direct evidence for, the most upstream one in the causal order is the
  read, so evidence for a cause doesn't get reported as its symptom.
- **Actor: value of information.** For each unasked question the engine simulates every
  answer, weights each by its predictive probability under the belief, re-runs
  inference and the decision, and measures how much the expected value of the best
  decision improves, minus the question's cost. A small information-gain term breaks
  ties when no decision is yet at stake. Every lens is sampled early; the engine stops
  when no remaining question could change what it would recommend.
- **Decision network.** Each intervention has a relief vector over states (defining
  decision rights also relieves escalation and execution) and a cost. Expected value is
  taken over the belief. The experiment is the highest-EV intervention, which can
  differ from the read; when it does, the page says why. Acting off the read carries a
  small penalty so it has to earn it.
- **Critic.** Maintains an explicit state: primary hypothesis with a confidence label,
  supporting evidence, competing hypothesis with its own evidence, disconfirming
  evidence, the most probable configuration, the decision with its alternatives, and
  the next test. It says so when the leading explanation changed during the
  conversation. Exported with "Copy the read".
- **Chain.** Every playbook's causal chain is staged: origin, transmission,
  amplification, consequence, each tagged with the lens it runs through.
- **Evidence versus inference.** Reinforcing forces are labelled "from your answers"
  or "our inference"; they are never mixed.
- **Counterfactual.** What-not-to-do is framed as a prediction: if the read is right,
  the sensible-looking fix should make it worse, and why.
- **Blind spot.** A real secondary hypothesis: it states what its cheapest test would show if it
  is true and if it is false, so it can lose. The result is evidence in the belief (held or didn't
  hold), and if it holds the experiment gains a step and a thing to watch. It is untested until
  the person reports the result on their return.
- **Experiment and learning.** Each intervention has an experiment as the Actor sees
  it: action, target, duration, expected effect, three things to watch. On return the
  user reports each as improved, unchanged or worse. The outcome becomes evidence in
  the same currency as answers and is re-inferred through the network; the engine
  compares predicted with observed and says whether the experiment strengthened,
  weakened or partly weakened the read. It is looking for where the read was wrong.
- **Economic shadow.** Optional revenue and profitability ranges. Rules produce a
  "your operating profile suggests" read and a qualitative expected-vs-observed table
  with primary signals marked. No invented benchmarks.

### Designed for what comes later

The session stores the evidence list (each item a likelihood factor with its source),
the belief, the decision table and the outcome, all under a model version. That is
the shape a partially observable decision process wants: hidden state, observations,
belief, action, reward. Parameter learning (are these weights right?), structure
learning (is this network right?) and receding-horizon experiments (re-plan at week
two) can be added without changing what the user sees. The model itself lives in
`NETWORK`, `INTERVENTIONS`, `QUESTION_COST` and `VOI` in `js/content.js`.

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
- `NETWORK` is the causal model (priors, parents, noisy-OR strengths); `INTERVENTIONS` the decision model (relief vectors, cost); `QUESTION_COST` and `VOI` the actor's economics.
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
