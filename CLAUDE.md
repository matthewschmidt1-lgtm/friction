# Friction — a diagnostic, not a questionnaire

**Find what's getting in the way.** A person answers ten to fifteen questions; Friction forms
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

## How the engine thinks (v5.1)

Signal → Hypothesis → Question → Evidence → Decision → Act → Learn.

- **Belief.** Fifteen binary states in a causal Bayesian network (`NETWORK` in content.js)
  with noisy-OR conditionals. 32,768 configurations enumerated exactly in `engine.js`; no
  library. Every answer option carries `sig` (log likelihood ratios per state) and `obs`
  (the observation in plain words); options may carry `own` ("it's me"), `denial`,
  `grief`, `nothing`, `tired`, `force`. Positive evidence per state is scaled by `BALANCE`
  (available weight vs the median), then tempered and capped by `EVIDENCE`; experiment
  outcomes and blind-spot tests use raw evidence. `SELF_REPORT`: reassuring answers to
  impression questions count ×.6 (leaders over-report health); reassuring answers to `event`
  questions count in full; admissions (`own`) count ×1.25.
- **Read.** `readFrom` picks from states within .12 of the top by direct evidence, plus a
  bonus for the person's own words; near-ties go upstream; close seconds are `paired`.
- **Confidence label.** High needs p≥.85, margin ≥.2, three distinct questions with strong
  evidence including a behavioural (`event`) one, nothing against, every lens asked, and
  no pairing. `notes` (consistency checks) and coherence lower it. Random answering gives
  High in about 1 run in 300; keep it that way.
- **Required questions.** `trust`, `trust_last`, `overrule`, `self`, `loss`, `conflict`, `missed`
  are always asked (`required: true`); the "tired" opener goes to `loss` first. A grief-flagged loss answer
  sets `grief`: the page leads with it and the decision becomes `loss`. The tired opener sets
  `tired`: a "Before the business" banner.
- **Null reads.** "No clear constraint" only when the answers are actually reassuring. If two or
  more answers usually point to a problem (`concerns`: an answer whose top weight is ≥ .9, an
  admission ≥ .7, an inversion pick flagged `admits`), the page is "No single constraint stood
  out" (`LOW_MIXED`) and quotes them. Reads from one answer are Early signal, never Emerging.
- **Page honesty.** Rival explanations are described relative to the read, never with a label
  that could outrank it. Profile rows can't read healthy when an answer behind them says
  otherwise (`hyps`/`floor`). Economic statements need a financial input.
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
   (alias `centralized`→`authority`, `decision_rights`→`decisions`). Expect 9/9 on zone
   and 8–9/9 on constraint; a healthy control (P8) must come out "No clear constraint".
   Also run 300 random-answer sessions: zero errors, High at most a few. Fuzz a few hundred
   random runs for zero errors. Delete the harness page before committing.
4. Visual QA: headless Chrome screenshot of a wrapper page that drives the app in a 390px
   iframe; `document.body.dataset.q` exposes the current question id so a script can answer.
   The Browser pane is often hidden, which pauses rendering; prefer headless screenshots.
5. Commit with a message that explains why; push. Matthew checks the live site himself.

## Real-world testing (2026-10)

`qa/take.sh FILE CASE` shows the next question for a case, the way a person meets it;
`qa/diagnose.sh FILE CASE` shows the page. Three Sonnet testers (organizational psychologist,
decision scientist, intuitive) took it as real leaders (Nokia, Uber, Wells Fargo, Boeing,
Microsoft, Kodak, Theranos, Twitter, Zappos, Pixar) and practice composites, writing what the
answerer believes and what is actually wrong before seeing a question. Cases and reports are in
`qa/experts/v5/`. The biggest lesson: the answerer matters more than the facts (Nokia's CEO and
a Nokia middle manager get different reads). When adding opener options, append them or migrate
saved answer indices.

## Gotchas

- `css/friction.css` is a stack of passes; a later rule with equal specificity wins. The blind
  spot card is dark navy: any new `.display`-class rule must not remove `color:#fff` there.
- `localStorage` key `friction.v3` holds history entries with `evidence`, `decision`,
  `blindTest`, `watch`; the learning screen reads them. Change the shape with care.
- The result page has a `low` branch (no constraint, no experiment) and a normal branch;
  both need every field the template reads.
- Confidence is capped by the margin to the runner-up; a dead heat can never read as High.
- The QA answers in `qa/answers-v3.json` were written by a Sonnet agent in character against
  the visible question text only; answers to the v5 questions (`self`, `loss`, `conflict`,
  `blame_first`, `gossip`, rewritten `trust`) are stand-ins I wrote, not agent answers. The
  expert answer files in `qa/experts/` lack v5 answers; harnesses default to the first
  option, which biases results. Re-answer before trusting them.
- Self-report caps accuracy: on the scientist's synthetic single-cause test the read is
  right about a quarter of the time whatever the selection rule. The label is honest
  about that; don't tune the label to look more certain.

## Roadmap Matthew has set (from *Algorithms for Decision Making*)

Done: value of information, Bayesian network, decision network. Next, in order, and all of
them wait on real completed experiments: model uncertainty and Bayesian parameter learning,
POMDP framing, structure learning, receding-horizon (re-plan mid-experiment). Keep the
session data model (evidence with sources, belief, decision, outcome, `MODEL_VERSION`) in
the shape those will need.
