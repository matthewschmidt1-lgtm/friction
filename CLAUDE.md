# Friction — a diagnostic, not a questionnaire

**Find what's getting in the way.** A person answers about ten questions; Friction forms
hypotheses about what is creating friction in their organization, asks the question most
likely to tell them apart, gives one experiment to run, and updates the read when they come
back with the result. Static site, no build, no backend. Deployed on Railway from GitHub
`matthewschmidt1-lgtm/friction`; every push to `main` redeploys
https://friction-production.up.railway.app. `package.json` exists only for Railway's `serve`.

## Principles (Matthew's, and they win over everything below)

- No score, no verdict, no percentage shown to the user. Hypotheses with a confidence label
  (Early signal · Emerging pattern · Strong pattern · High confidence), never a number.
- Say what supports the read, what cuts against it, what is still unknown, and which question
  would settle it. Say so when the read changed during the conversation.
- One experiment, three things to watch. The point is to find where the read is wrong, not to
  prove it right.
- Make the important thing obvious; hide complexity until it's needed; leave things out. The
  diagnosis page is five sections; everything else is behind an expander.
- One typeface (Manrope), light theme, blues, tans, oranges, greens. No Fraunces anywhere.
  Sentence-length text is never in a display face.
- No AI filler. Specific beats clever. Don't name the books to sell the read; name them under
  "Further reading".

## Files

```
index.html        shell, meta, fonts (Manrope + IBM Plex Mono only)
css/friction.css  "Low Tide" design system; later passes appended at the bottom, read the cascade
js/content.js     ALL copy and ALL model parameters — the only file that changes for content work
js/engine.js      belief, actor, decision, diagnosis, outcome learning; pure functions
js/app.js         screens, transitions, localStorage (`friction.v3`), the Friction Map SVG
qa/               persona harness: personas, hidden ground truth, answers, diagnoses, evaluations
DESIGN.md         creative direction and experience architecture
README.md         how the engine thinks, how to edit content, deploy steps
```

## How the engine thinks (v4)

Signal → Hypothesis → Question → Evidence → Decision → Act → Learn.

- **Belief.** Eleven binary states in a causal Bayesian network (`NETWORK` in content.js) with
  noisy-OR conditionals. 2,048 configurations enumerated exactly in `engine.js`; no library.
  Every answer option carries `sig` (log likelihood ratios per state) and `obs` (the
  observation in plain words). The read prefers the most upstream well-evidenced state
  (`readFrom`), so a cause is not reported as its symptom.
- **Actor.** `nextQuestion` scores unasked questions by value of information: simulate each
  answer, weight by predictive probability, re-infer, re-run the decision, measure the gain in
  expected value minus `QUESTION_COST`. Samples every lens twice, asks the separator when the
  top two are close, stops when nothing could change the recommendation (bounds in `ACTOR`).
- **Decision.** `expectedValues` over `INTERVENTIONS` relief vectors minus cost; the experiment
  is the highest-EV intervention, which may differ from the read (the page says why).
- **Critic.** `diagnose` returns supports/contradicts, the runner-up with its evidence, the open
  question, changed-mind, the most probable configuration, the decision with alternatives, and
  a `critic` object exported with "Copy the read".
- **Blind spot.** A falsifiable secondary hypothesis (`BLIND_SPOTS`): test, what you'd see if
  true/false, and the step it adds to the experiment if it holds. Its result is evidence.
- **Learn.** `applyOutcome` turns per-metric results and the blind-spot result into evidence,
  re-infers, and reports strengthened / weakened / partly weakened, predicted vs observed.

Everything a person reads is in `content.js`: `PLAYBOOKS[h]` (constraint, diagnosis, chain,
forces, blind spot, notDo, policy, move, question, metric, two readings), `EXPERIMENTS`,
`EXPERIMENT_SPECS`, `COUNTERFACTUALS`, `CHAIN_STAGES`, `ZONES`, `ZONE_BY_CONSTRAINT`,
`ECON_READS`, `PROFILE_ROWS`. Adding a hypothesis means adding it to `HYPOTHESES`, `NETWORK`,
`INTERVENTIONS`, `PLAYBOOKS`, `EXPERIMENTS`, `EXPERIMENT_SPECS`, `BLIND_SPOTS`,
`COUNTERFACTUALS`, `CHAIN_STAGES`, `PROFILE_PRIMARY`, and giving it signal weights on options.

## Workflow for every change

1. Preview: `python3 -m http.server 8951` from this folder (no node/npx on this Mac). The
   `.claude/launch.json` route fails with a macOS PermissionError; run the server from Bash
   and open the URL. Kill it when done (`pkill -f "http.server 8951"`).
2. ES modules need a server; opening `index.html` directly will not work.
3. After any engine or content change, replay the personas and fuzz before committing. The
   pattern: a page in this folder that imports `./js/engine.js`, loops
   `newSession` → `nextQuestion` → `applyAnswer` with `qa/answers-v3.json`, then `diagnose`;
   run it with headless Chrome `--dump-dom` and compare against `qa/ground-truth.json`
   (alias `centralized`→`authority`, `decision_rights`→`decisions`). Expect 8–9/9 on
   constraint; a healthy control (P8) must come out "Low friction". Fuzz a few hundred
   random runs for zero errors. Delete the harness page before committing.
4. Visual QA: headless Chrome screenshot of a wrapper page that drives the app in a 390px
   iframe; `document.body.dataset.q` exposes the current question id so a script can answer.
   The Browser pane is often hidden, which pauses rendering; prefer headless screenshots.
5. Commit with a message that explains why; push. Matthew checks the live site himself.

## Gotchas

- `css/friction.css` is a stack of passes; a later rule with equal specificity wins. The blind
  spot card is dark navy: any new `.display`-class rule must not remove `color:#fff` there.
- `localStorage` key `friction.v3` holds history entries with `evidence`, `decision`,
  `blindTest`, `watch`; the learning screen reads them. Change the shape with care.
- The result page has a `low` branch (no constraint, no experiment) and a normal branch;
  both need every field the template reads.
- Confidence is capped by the margin to the runner-up; a dead heat can never read as High.
- The QA answers in `qa/answers-v3.json` were written by a Sonnet agent in character against
  the visible question text only; `trust_last` and `analysis` were re-answered by the agent.

## Roadmap Matthew has set (from *Algorithms for Decision Making*)

Done: value of information, Bayesian network, decision network. Next, in order, and all of
them wait on real completed experiments: model uncertainty and Bayesian parameter learning,
POMDP framing, structure learning, receding-horizon (re-plan mid-experiment). Keep the
session data model (evidence with sources, belief, decision, outcome, `MODEL_VERSION`) in
the shape those will need.
