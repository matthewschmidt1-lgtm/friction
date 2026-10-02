# Friction: expert review by Dr. Daniel Hersh (decision scientist)

All replay output below was produced with `qa/diagnose.sh` and with a lab harness I added in this folder (`lab.html`, `lab.sh`, `build.py`, `build2.py`, answer files `decision-scientist-answers.json` and `decision-scientist-extra.json`). Re-run any experiment from the Friction folder with `sh qa/experts/lab.sh "exp=opener"` (also `accq`, `static`, `single`, `select`, `random&n=300`, `sat&n=300`, `calib&n=1000&beta=1`).

## 1. Summary verdict

Friction is a coherent, well-written hypothesis generator, and the structure (competing hypotheses, a falsifiable blind spot, a counterfactual, one experiment) is the right shape. It is not a calibrated diagnostic, and its confidence labels are currently the weakest part: they track how correlated the hypotheses are in a hand-built network, not how strong or consistent the evidence is. The most consistent, problem-confirming respondent gets "Emerging pattern", while an ambiguous organization can get "High confidence" from changing the opener alone, and uniformly random answers produce "High confidence" about 7% of the time. It is also easy to fool by design, because the behavioural questions most able to expose a self-flattering respondent are gated behind the self-report answers that would have to be unflattering to unlock them. Used as a structured conversation starter it is useful; used as a "diagnosis" with these labels it over-claims.

Mean usefulness across my five organizations: 3.0 / 5.

## 2. The five test organizations (answered from visible text only)

Answers are in `decision-scientist-answers.json` (D1 to D5). Replay output is quoted in short form.

### D1. Honest founder-CEO, 90-person services firm
- Situation: the CEO reverses managers' decisions, managers check first, nothing moves without him. He answers honestly ("Too many decisions come to me", "People don't feel authorized to decide", authority "Rarely", reversal "It gets reversed").
- True constraint: centralized authority.
- Received: `THE READ: Decisions get stuck [Emerging pattern]`, "Important decisions don't have a clear owner... It is the absence of decision rights." Five hypotheses listed at "High confidence" in "Other explanations weighed" while the headline says Emerging. The page also says "We changed our mind: earlier it pointed to Decision authority is more centralized..." and offers "Still trying to understand: is it Decision rights are unclear or Decision authority is more centralized".
- Judgment: wrong mechanism, right neighbourhood. In this firm the owner is perfectly clear (it is the CEO), so "no clear owner" is the opposite of the truth. `readFrom` prefers the most upstream state within 0.12 of the top marginal, and both were at 0.99 to 1.00, so the hand-ordered `NETWORK_ORDER` chose the read, not the evidence. The experiment (write down decision rights for three decisions) is adjacent and probably harmless; the "ONE QUESTION" ("Which decisions are we still making at the top because we don't trust the organization...") is exactly right, but it came from the wrong playbook (decision_rights) by accident of wording. The page also states "Operating profile suggests: margin may be below the range for a business like yours" although no financial data was given.
- Usefulness: 3.

### D2. Single cause, 60-person SaaS: too many priorities
- Answers: opener "Too many priorities", "No idea" what to stop, agreements "Rarely" delivered, execution_why "competing priorities + capacity".
- Received: `Too many priorities, and no clear sense of what to stop [Emerging pattern]`, experiment "Stop the bottom fifth", question "What are we willing to stop doing...", counterfactual "Don't add a prioritisation framework".
- Judgment: correct read, correct experiment, excellent counterfactual. The label is too timid for a textbook case (all evidence agrees), and the cause is the saturation artefact in finding M1 below, not honest uncertainty. Note "Agreed priorities don't reliably happen" was rated High confidence at the same time: the model cannot separate the cause (focus) from its consequence (execution), and the user sees both at the same strength.
- Usefulness: 4.

### D3. Genuine tie: information versus capability (distribution firm)
- Answers split evenly: "not enough information", "data or analysis", "arrives after the decision" versus "lack of confidence in the person", "needs rework", "lack of capability".
- Received: `The people being asked to decide haven't yet been given the capability to decide well [Emerging pattern]`, with "Still trying to understand: is it capability or information? The question that would tell us: When the analysis finally arrives, what usually happens?" Probabilities 0.98 vs 0.93.
- Judgment: the tool did flag the competition, kept the label at Emerging, and the follow-up (`analysis`) does separate the two by 2.0 logLR. That is good behaviour. Three problems: (i) the order effect: changing only the opener flips the read to information, to LOW, or to "High confidence" (experiment E1); (ii) section 02 says "Your people appear to have the capability and intent to perform, but the system around them..." directly under a headline saying people lack the capability, because `ZONE_BY_CONSTRAINT.SP` has no `capability` (or `information`) entry and falls back to a generic summary that contradicts the read; (iii) the experiment commits to capability coaching though the evidence is a tie, rather than the cheaper test that discriminates.
- Usefulness: 3.

### D4. Respondent biased by self-image: CEO who is the bottleneck but answers flatteringly
- Answers as such a CEO would: opener "Effort is high but results aren't", decisions "Decisions don't really get stuck", authority "Usually", trust "Very safe", delegation never probed.
- Received: `Your best people aren't on the highest-value problems [Emerging pattern]`, supported by two items ("Medium": best people on urgent work; "Low": effort not converting). "Expected vs observed" printed `Dependence on specific people=Low*`, the opposite of the truth.
- Judgment: wrong, and the page gives no hint that the answers were all self-assessments by the person who may be the cause. Worse, the questions that would have exposed this (`comeback`, `overrule`, `given`, `trust_last`) were never asked, because each is gated on a hypothesis that flattering earlier answers had already suppressed (see B1). Variant D4c (same CEO, but he does give the honest opener "Too many decisions come to me" and flatters everywhere else) received: `Low friction: Nothing in your answers rose to the level of a constraint worth acting on. That is unusual, and worth protecting.` The single most informative answer he gave was outvoted by nine flattering ones, and the page told him his organization is unusually healthy. That is a false negative with reassurance attached.
- Usefulness: 1.

### D5. Healthy control (150-person firm)
- Answers fine everywhere; had to pick an opener anyway ("We agree on things that then don't happen", the least bad).
- Received: `Low friction`, 10 questions, no experiment. Correct.
- Judgment: correct. But the opener has no "nothing in particular" option, so even a healthy respondent must register a problem, and one candid mild answer is enough to leave the low-friction state: D5b (same firm, only `execution` answered "Sometimes") received `Agreed priorities don't reliably happen [Strong pattern]`. D7, a normal firm answering "Sometimes/Depends/Mostly", received `Strong pattern` with "Too many priorities" and "Agreed priorities" both at High confidence in the list of alternatives. The tool has no concept of an ordinary amount of friction.
- Usefulness: 4 for the strict control, 2 for the realistic normal firm. I score the control as 4.

Mean usefulness = (3 + 4 + 3 + 1 + 4) / 5 = 3.0.

### Additional organization: two true causes (D8, direction plus trust)
Honest leader of a firm where executives disagree and nobody says so. Received: `Leadership isn't aligned on what matters most [High confidence]`, 11 questions, and the trust items were never asked (the stop rule fired because direction had saturated). Trust did not appear among the five alternatives. "High confidence" was awarded to a read whose second cause was never measured. The "Reinforcing (from your answers)" line "Decisions drift upward whenever things feel risky" came from the inversion item, a hypothetical (see Q-inversion below).

## 3. Controlled experiments

### E1. Opener sensitivity (hold all other answers constant, vary only the opener) — `exp=opener`
Method: for each of the five organizations, answers fixed, opener set to each of its 8 options. The path of later questions can change (that is part of the effect).
Result:
- D3 (ambiguous): opener 0 gives capability Emerging; opener 1 gives information High confidence; opener 2 gives LOW (top p 0.29); opener 3 information Strong; opener 6 and 7 information High confidence. One answer moves the output from "no friction" to "High confidence" with everything else unchanged.
- D4 (biased): opener 0 talent, 1 focus, 2 leverage, 3 direction, 4 focus, 5 talent (High confidence), 6 talent (Early signal), 7 talent. The read follows the opener.
- D1 (clear): `decision_rights` for 7 of 8 openers, `trust` for the 8th. Stable, but stably wrong (see D1).
- D2: `focus` for all 8. Stable.
- D5: LOW for all 8. Stable.
Implication: when the evidence is unambiguous the opener does not matter; when it is mixed, which is the case where a user most needs guidance, the opener decides the outcome. The opener carries logLRs up to 1.6 with no negative options, it determines which questions are asked next (VOI is computed from the state it sets), and it is a single forced choice of the "most like your week" kind, i.e. an availability and anchoring prompt. Treat it as a hypothesis prior with a strongly shrunk weight and ask it again at the end as a consistency check.

### E2. Acquiescence and response-style — `exp=accq`
Method: answer every question by a rule. "Problem-confirming" = option with the largest summed `sig`; "fine" = smallest; "middle" = middle index; plus positional rules. Result:

| Rule | Read | Label |
|---|---|---|
| Most problem-confirming everywhere | decision_rights (p 0.98, centralized 1.00) | Emerging pattern |
| Most "everything is fine" everywhere | LOW (top p 0.14) | Low friction |
| All middle (floor(n/2)) | focus (p 0.99, execution 0.96) | Emerging |
| All middle (ceil(n/2)-1) | direction (0.83) | Emerging |
| Always first option | decision_rights (p 0.86, margin 0.45) | **High confidence** |
| Always last option | economics (0.98) | Emerging |
| Always second option | information (0.84; decision_rights 0.95) | Emerging |

Implications: (i) the labels are inverted relative to evidence strength: the maximally problem-confirming respondent gets Emerging, because 4 or more states saturate at ~1.0 and the margin cap or coherence cap fires; a respondent clicking the first option for every question gets High confidence. (ii) Middle answers are read as problems: on the ordinal items, "Sometimes", "Somewhat", "Not really", "Depends" and "Quite different" all carry +0.8 to +1.1, while the "positive" side carries only -0.4 for "Usually/Mostly/Probably". Real organizations answer in the middle, so a normal firm lands in a problem state (D7 above). (iii) An all-first-option response is almost certainly a satisficing respondent and the tool has no check for it (no reversed items, no consistency check).

### E3. Single-answer leverage — `exp=single`
A. Posterior from one answer alone (prior-only otherwise): `execution = "Rarely"` gives execution at p 0.75; `leverage "Almost everything depends"` 0.74; `authority "Rarely"` centralized 0.71; the opener "Too many decisions come to me" centralized 0.70. One answer can reach the "Strong pattern" threshold (0.65).
B. Changing exactly one answer in a finished interview and counting how many such changes flip the top read:
- D2 (clear, consistent): 3 flips. Robust.
- D3 (tie): 15 flips. Includes `decisions` -> "Decisions don't really get stuck" giving LOW, and `comeback` -> "Not enough information" giving information at High confidence.
- D4 (biased/mixed): 30 flips. The read is basically unstable; `talent` -> "Usually" flips the result to LOW.
- D5 (healthy): 7 flips, including `execution` "Sometimes" giving execution at High confidence (the replay shows Strong pattern in the full run) and `focus` "Not really" giving Emerging focus.
Implication: no single answer decides a consistent interview, which is good, but in mixed or healthy interviews one answer routinely decides the output, and none of the output tells the user so. The page should say "this read depends on N answers; changing any of these would change it".

### E4. Calibration sanity — `exp=random`, `exp=sat`, `exp=calib`
- Uniformly random answers (N=300): Emerging 235, Strong 41, **High confidence 20 (7%)**, LOW 4. A random respondent is told "High confidence" about one time in fifteen and is told something is wrong 99% of the time. Top reads for random answers: direction 74, focus 42, trust 40, economics 37, decision_rights 36, centralized 26, leverage 23, execution 8, information 7, capability 2, talent 1. Random input overproduces direction by a factor of 3 compared with a uniform spread.
- Saturation (N=300 random, `exp=sat`): in 41% of runs three or more states sit at p >= 0.90 simultaneously (mean 2.28 states). In 52% of runs the displayed read (`readFrom`) is not the highest-marginal state. Labels: "Emerging" runs have mean 2.65 states at p>=0.9, "High" runs have 0.60. So the label is lowest exactly when the evidence is heaviest.
- Synthetic respondents generated from the engine's own likelihoods (so the model is correctly specified by construction; `exp=calib&n=1000&beta=1`): Emerging pattern (n=855): the top read is a true cause 33% of the time and equals the single true cause 26% of the time (of 562 single-cause cases). Strong pattern (n=108): 57%. High confidence (n=33): 67% / 60% of 25 single-cause cases. At noisier respondents (beta 0.5, N=300) High confidence was right only 15% (n=13).
Implication: even in a perfect-world simulation, "High confidence" is correct about two times in three, and it degrades quickly with noise. The labels are monotone in a weak way (Emerging < Strong < High), which is something, but "High confidence" is not 80%+. The cause is mainly that the likelihood factors are multiplied as if each answer were independent evidence, when several items measure the same thing (see M1).
- Thin evidence: not reachable through the UI (minimum 8 questions), but a thin interview of one answer already yields p 0.75, i.e. Strong, so the label depends on the stop rule rather than the evidence.

### E5. Question selection — `exp=select`, `exp=sat`
Method: for each persona, list the remaining candidate questions with top-versus-second separation (max minus min of `sig[top] - sig[second]` across options), VOI, and the one the page offers as "the question that would tell us".
- D3: chosen `analysis`, separation 2.0, VOI 0.000: informative about the pair (information versus capability), though its answers map unevenly ("It settles the question" scores information +0.8, which is almost uninformative about capability). Fair.
- D1: chosen `comeback`, separation 3.8, VOI 0.001. Informative in principle, but the two states are not alternatives: decision_rights 0.99 and centralized 1.00 are both near-certain, and the question was posed as "is it A or B".
- D2, D4: competing, but no question available (open question blank).
- Across 296 random interviews: an open question was shown in 220; of those, 145 (66%) had both top and second at p >= 0.9, meaning the "is it A or B" framing was posed when the model itself believed both; 153 (70%) were chosen only by the separation fallback because no remaining question passed the VOI threshold (`VOI.minToAsk`). In the other 61 competing cases no question was offered.
Implication: when a question appears it often is informative on the pair's likelihood ratios, but the claim "the question that would tell us" is not backed by the model's own value-of-information in most cases. The states are co-occurring conditions (a causal chain), not mutually exclusive explanations, so "A or B?" is frequently a category error. Reframe as "which is upstream?" and compute separation only for pairs with p(A) and p(B) clearly different or with an exclusivity structure.

## 4. Question and model bias findings

Severity: H high, M medium, L low.

### Model-level (M)

- **M1 (H). Naive-Bayes accumulation of correlated items inflates and saturates probabilities.** Every option's `sig` is multiplied as an independent likelihood ratio, but the pool asks about each construct 6 to 10 times (centralized: `decisions`, `comeback`, `overrule`, `given`, `waiting`, `authority`, `people_limits`, opener, inversion; direction: 12 items). Total available positive logLR per hypothesis: centralized 11.9 across 10 items, direction 11.6 across 12, information 9.7 across 9, trust 9.3 across 10, decision_rights 8.4 across 9, economics 7.8 across 9, focus 7.6 across 9, leverage 7.2 across 8, capability 7.0 across 6, execution 5.4 across 7, talent 5.0 across 7. Four moderate answers (e^4 against a prior odds of 0.25) already give p > 0.9, and downstream states inherit through the noisy-OR chain, so everything saturates together. Fix: temper the evidence: multiply each hypothesis's summed positive logLR by a factor of 0.5 and cap the sum from any one hypothesis at about +4.0 (parameters `TEMPER = 0.5`, `CAP = 4.0` in `posterior`), or equivalently divide by sqrt(k) of the number of items answered per construct.
- **M2 (H). The confidence label is a function of saturation and of the margin cap, not of evidence quality.** `capAt('emerging')` fires when 4+ states >= 0.5 across three lenses ("coherence") or margin < 0.06; both are more likely when evidence is stronger (E2). Fix: derive the label from (a) tempered p(top), (b) margin, (c) number of independent sources (different question types) supporting top, (d) coverage: the share of hypotheses (and of the top-two causes) that have at least one disconfirming-capable item answered, and (e) a contradiction penalty. Show "High confidence" only if p>=0.8 after tempering, margin>=0.25, at least 3 independent items, and no unmeasured credible alternative.
- **M3 (H). `readFrom` lets a hand-ordered list decide the read.** It takes the most upstream (by `NETWORK_ORDER`) state within 0.12 of the top marginal that has >= 2.5 direct evidence. With saturated marginals nearly everything is "within reach", so `direction > economics > capability > trust > focus > information > decision_rights > centralized > ...` decides, as in D1 (decision_rights displayed although centralized was what the respondent said). Fix: choose by direct-evidence weight first (summed positive logLR from items that are about that construct), use causal order only as a tiebreak when within 0.03, and show both when within 0.12 with the line "these may be one problem seen twice".
- **M4 (H). Absence of data is displayed as a finding.** In `PROFILE_ROWS` an unasked construct yields "Candour=High", "Rework and workarounds=Low", "Dependence on specific people=Low" (D1 and D4 show this: candour reported High although trust was never asked in D1; D4 "Dependence on specific people=Low*"). Fix: return "Not measured" when the item for that row was not asked, and drop the starring for unmeasured rows.
- **M5 (H). `ECON_READS` states financial conclusions without the data.** Several entries claim things like "Your operating profile suggests margin may be below the range for a business like yours" with `conf: Emerging` when the respondent supplied no revenue or profit (D1 output). Fix: require the `ranges` field for any margin statement; otherwise omit. Replace the fall-through with nothing.
- **M6 (M). Hand-set structure favours downstream symptoms in the prior.** Prior marginals with no evidence: execution 0.295, centralized 0.272, talent 0.265, leverage 0.256, focus 0.239 versus capability 0.150, direction/economics/trust 0.200. The root states have lower prior marginals than the children because noisy-OR with leak 0.12 to 0.14 adds mass. This plus the upstream preference in `readFrom` makes effects look likely a priori and roots look likely only after evidence. Fix: set priors so that all eleven marginals start at about 0.20 (lower leaks to 0.05 to 0.08 and re-solve root priors), then re-run the replay suite.
- **M7 (M). Option weights treat the scale midpoint as a problem.** Across the ordinal items (`direction`, `focus`, `economics`, `execution`, `leverage`, `authority`, `talent`, `trust`) the best option is -1.5 to -1.7, the second best -0.2 to -0.5, and the midpoint +0.8 to +1.1. Normal organizations answer at the midpoint. Fix: make the midpoint weight about +0.3 and the "bad" end +1.2 to +1.5; set "Sometimes/Somewhat/Depends/Probably" to 0.0 to +0.3 (e.g. `execution` "Sometimes" 1.1 -> 0.3; `trust` "Depends on the situation" 0.8 -> 0.3; `focus` "Not really" 1.1 -> 0.6).
- **M8 (M). The stop rule can end the interview without measuring a credible cause.** D8: High confidence on direction after 10 questions, trust never asked. `covered` only counts lens-level question counts (>= 2 each), not whether the second cause was measured. Fix: before the inversion question, require at least one disconfirmation-capable item for every hypothesis with prior-plus-opener probability above 0.25, and at least one behavioural (event-based) item for the top two.
- **M9 (M). `INTERVENTIONS` relief and importance are asymmetric levers that hand-pick the experiment.** `expectedValues` multiplies by `importance` (direction, decision_rights, centralized, trust = 1.0; information, capability = 0.8) and the chosen experiment is the top EV with a 0.88 handicap on non-top hypotheses. That is a defensible heuristic but it is a value judgement, not evidence. D5/D3 showed that experiment choice for a tie follows importance (the tie is broken by a weight nobody sees). Fix: keep, but print "chosen over X because it is cheaper/faster to test", and add the rule "when the top two are within 0.1, run the cheapest discriminating experiment, not the coaching programme".

### Question-level (Q)

- **Q-opener (H). All 8 options are problems; no "nothing in particular"; first-person and CEO-specific ("come to me"); mixes symptoms (recurring problems, best people on fires) with causes (leaders don't agree).** It carries logLRs up to 1.6 and steers the path (E1). Fix: add "Nothing stands out right now" (all sig 0), change option 0 to "Decisions pile up at the top", and shrink the opener logLRs by 40% (1.4 -> 0.8, 1.6 -> 1.0). Ask "Which of these would a good colleague say is the one that most gets in the way?" as a second view at the end.
- **Q-gating of behavioural probes (H).** `overrule`, `comeback`, `given` are gated on centralized/capability/decision_rights >= 0.45; `trust_last` on trust >= 0.45. They are the only event-based items; they never fire for a flattering respondent (D4c asks 10 questions, no behavioural probe). Fix: always ask `overrule` and `trust_last` (ungate; the options already have fine-end answers) unless the opener plus first three answers have already asked an equivalent. Add a rule: if the top read is supported by less than two behavioural items, ask one.
- **Q-trust (H). Asks the leader how safe it is for others to speak.** The person with the most power is the worst-placed observer; "Very safe" earns -1.7, the strongest disconfirmation in the pool, from the least reliable source. Replace with a behavioural item: "When did a direct report last tell you something you did not want to hear?" Options: "This week" (-1.0), "This month" (-0.5), "Cannot remember a specific time" (+1.0), "It has not happened" (+1.4). Cap the disconfirming weight of the self-report version at -0.8.
- **Q-comeback, option 4 "We simply prefer to decide centrally" (H).** Confessional wording with weight +1.8 for centralized; almost no one will choose it. And "High consequence of getting it wrong" (+1.2 centralized) cannot distinguish justified from unjustified centralization, which is the hypothesis wording ("more centralized than the business requires"). Fix: replace the options with "Decisions I am not willing to be wrong about" (+0.6), "Managers' calls have needed fixing" (capability +0.8, centralized +0.3), "I stay close to things I know best" (centralized +1.2, no confession verb).
- **Q-direction (M). The leader predicts what the team would say.** False-consensus effect: leaders overestimate agreement. Fix: wording "Think of the last time your leaders were asked to rank priorities. How many of the top three would match?" and offer the alternative of actually sending two direct reports the same three-line question (a multi-rater mode).
- **Q-focus, Q-economics (M). Hypothetical self-confidence items ("would you know what to stop?", "how clearly can you connect...").** They measure confidence rather than state and invite overconfidence. Replace with an event-based version: "Name something your organization stopped in the last year. How easily could you?" ("Named it at once / With effort / Could not").
- **Q-business_uncertainty (M). Presupposes uncertainty ("Where is the biggest uncertainty?"), every option positive, overlapping options ("Where to invest" / "Which customers matter most" / "Where profit comes from").** Fix: add "There isn't a big one" (focus -0.8, economics -0.8, direction -0.5) and merge the three economics options into two.
- **Q-decisions (M). Single select over a multi-cause situation; "Too many people need to agree" loads decision_rights and centralized (two constructs); presupposes stuck decisions.** Fix: allow two answers and make option 1 "Too many people have to approve it" with only decision_rights +1.2.
- **Q-waiting (M). "Data or analysis" is the socially easiest answer for a leader (it deflects from people or authority) and gives information +1.6, its biggest weight.** The information hypothesis collects more positive evidence than it deserves from a flattering option. Fix: reduce to +1.0, and ask `analysis` whenever `information` is raised so the claim is tested ("When the data arrives, is the decision made within a week?").
- **Q-analysis (M). Mixed constructs: "It settles the question" (economics -0.9) and "It gets requested again" (economics +1.1) read repeated analysis as an economics problem; it is more typically indecision (direction) or fear (trust).** Fix: move the repeated-request weight to direction +0.7 / trust +0.4, economics +0.4.
- **Q-leverage (M). Double-barrelled: "working around the system" and "personally making it happen" are different constructs, and heroics are valued by many founders.** Split: "How often does something important get done only because one person went outside the process?" (Weekly / Monthly / Rarely).
- **Q-repeat (M). Mixed response scales: "Usually / Sometimes / Rarely" (frequency) together with "It depends on the person / We tend to reinvent it" (attribution).** Split into a frequency item and a cause follow-up.
- **Q-talent (M). Double-barrelled and leading: highest-value versus most urgent presented as a dichotomy; "I'm not sure" scored +0.6 (treats ignorance as evidence of a problem).** Fix: "Where did your five strongest people spend most of last week?" with options by category, "I'm not sure" at +0.2.
- **Q-execution (M). Anchoring and base rate: "Usually" -0.4 and "Sometimes" +1.1 on an item where most firms say "Sometimes".** See M7.
- **Q-execution_why (M). Overlapping options (competing priorities / lack of capacity both load focus), construct mismatch ("Lack of capability" loads `capability`, which is defined as capability to decide well; here it means capability to deliver), vague "Follow-through", no "other".** Fix: add `capability_delivery` weight at half (0.6), merge capacity and priorities, add "Something else / not sure" (0).
- **Q-people_limits (M). All 7 options are problems, mixed constructs (lack of clarity maps to direction; fear to trust), gated.** Add "Nothing in particular" and map "Lack of clarity" to direction 0.7 / focus 0.3.
- **Q-given (L). "They make it, but slowly" loads information +1.2; slowness is not an information signal.** Reduce to +0.5 and add capability +0.2.
- **Q-inversion (H). A hypothetical is converted into a fact.** The title asks what you would do to make the problem worse; the help says "Be honest about which ones are already happening". The answer then appears in the output as "Reinforcing (from your answers): Decisions drift upward whenever things feel risky" (D1, D8). Respondents also pick whatever fits their story (consistency bias, confirmation of their earlier answers). Fix: separate the two questions ("Which of these is already happening?" versus the hypothetical) or drop the weights to near zero and drop the "from your answers" attribution.
- **Q-scales (M). Unequal option counts and non-exhaustive sets.** Option counts: 4, 5, 6, 7, 8 across items; `direction/focus/economics/execution/leverage/authority` are 4-point forced choice with no midpoint and no "not sure", while `trust` and `talent` have 5 with a midpoint. Categorical items (`decisions`, `comeback`, `waiting`, `execution_why`, `people_limits`, `business_uncertainty`) have no "other". Standardise ordinal items to 5 points with a neutral midpoint weighted near zero.

### Construct overlap and discriminant validity
Option-level correlation of loadings between hypotheses is low overall (highest: decision_rights with centralized r=0.41; leverage with talent 0.27; focus with execution 0.25), so the item pool does separate most pairs. The practical overlap is in the network, not the items: `centralized` is a child of decision_rights, capability and trust; `execution` a child of focus, decision_rights and information; so their marginals are mechanically correlated and a respondent who endorses any parent drags the children (this is why five states sit at "High confidence" in D1). The weakest-measured states are `execution` (5.4 total positive weight, 7 items, one strongly disconfirming item), `talent` (5.0, 7 items, one disconfirming item), `focus`/`economics`/`direction` (one disconfirming item each) and `capability` (one disconfirming item, `given`, and a root prior of 0.15 that is the lowest): capability is hard to ever read as the cause. The strongest, most over-represented are `centralized` (6 disconfirming items; it can be suppressed or promoted five different ways) and `direction` (12 items).

### Systematic favouritism in `sig` and `NETWORK`
Random answers lean to direction (25% of reads versus 9% uniform), then focus/trust/economics/decision_rights; execution, information, capability and talent rarely win (2 to 8 of 300). Direction and centralized have the most items and the largest total positive weight; capability and talent the fewest. Some of this is the `readFrom` upstream preference (M3). For fairness, equalise total available positive weight per hypothesis (a target of about 8 each) and re-test with `exp=random`.

## 5. Breadth gaps

The pool covers three lenses well for the type of problem "a capable founder-led firm has coordination and delegation friction". It does not cover:
- Market and growth problems that are not internal friction: demand, pricing, positioning, sales pipeline. A CEO whose problem is "revenue is flat" will be mapped to an internal friction anyway (the only exit is the opener "Effort is high but results aren't").
- Cash, margin and financial stress as constraints; capacity and resourcing as a physical limit (hiring, tooling).
- Role clarity and structure at the individual level (span of control, reporting lines), meeting load and cadence, incentives and compensation (only one weak option each).
- Culture and conflict beyond trust (e.g. interpersonal conflict in the leadership team, a toxic individual).
- A founder or CEO's own behaviour as a cause, other than through the centralized hypothesis. There is no hypothesis for "the leader is the constraint" asked in a way a leader can answer honestly.
- Organizations whose problem is the opposite of centralization (too little coordination in a decentralised firm, duplicated work, the absence of standards). The pool only has the "too much central control" direction.
- Scale and stage: the same answers mean different things for 15 people and 500 people.
- Organizations that are not companies (a nonprofit, a school, a clinic) are handled only by generic wording.
- Single-respondent design: no multi-rater input, no data from direct reports.

## 6. Calibration and claims

What the tool may honestly say:
- "Based on your answers, these are the hypotheses most consistent with what you described, ranked by how much of your evidence supports each."
- "Here is an experiment that would test the leading hypothesis, and here is what would count against it." The blind-spot test and the counterfactual are real strengths.
- "Your answers are your perception; the people who work for you may say something different." (Currently absent.)

What it must not say:
- Probability or confidence in a causal diagnosis, including "High confidence" and "Strong pattern", until the parameters are fitted to outcome data. The `sig` weights, network strengths, importance and relief values are hand-set, so the posterior is coherent but not calibrated (the synthetic result: "High confidence" correct two times in three even when the model is exactly right, and 15% at higher noise).
- "Nothing in your answers rose to the level of a constraint worth acting on. That is unusual, and worth protecting." (a negative claim from a handful of self-reports; D4c shows it is false for a real bottleneck). Say "Your answers did not point to a constraint. That does not rule one out; ask three people who report to you the same questions."
- Financial inferences without financial data (M5), "Expected vs observed" rows from unasked items (M4), and "from your answers" for hypothetical picks (Q-inversion).
- "We changed our mind" and "Strong pattern" language for evidence that is two or three clicks.
- Any use as an assessment of a person (the tool is not validated for that).
Suggested relabelling: replace the four confidence labels with an evidence-strength description: "Weak signal (2 items)", "Consistent signal (4 items, 2 types)", "Consistent signal and a behavioural example". Add a short plain-language caveat on every page: "This is a structured reading of your own answers, not a measurement."
What a validation plan would require: a few dozen organizations with an independent outcome (direct-report survey, time log of escalations, an independent consultant's read), fit `sig` by logistic regression with item-level correlation (a factor model), and report calibration curves per label.

## 7. What it does well

- Competing-hypothesis structure and the explicit "what's still unsure", "blind spot" and "what not to do" are the right idea; the counterfactuals ("Scoring forty initiatives produces a ranked list of forty initiatives") are specific and falsifiable.
- The blind-spot tests are behavioural and cheap ("Pick the last three stalled decisions and ask who owned each. Count the shrugs."): they supply the independent evidence the questionnaire itself lacks.
- Experiment outcomes treated as evidence (`applyOutcome`, `blindEvidence`) is a sound design and the unusual part.
- The healthy control behaves correctly when the whole interview is clean (D5, 10 questions, LOW).
- Strong single-cause cases come out right with the right experiment (D2).
- Plain, concrete, non-jargon copy; labels not numbers; adaptive stopping at 8 to 14 questions.
- The replay tool and the single content file make all of the above reproducible.

## 8. Top five changes, in priority order

1. **Rebuild the confidence label (M1, M2, M7).** Temper and cap the evidence sum (`TEMPER 0.5`, per-hypothesis cap about +4), centre the scales (midpoints near 0), and derive the label from tempered p, margin, number of independent item types, behavioural support and coverage. Verify with `exp=accq` (always-first should not give High), `exp=random` (High near 0 to 1%), `exp=calib` (High correct at least 80%).
2. **Ungate and add behavioural, third-party-checkable items (Q-gating, Q-trust, Q-comeback).** Always ask `overrule` and `trust_last` (or the replacement "when did a report last tell you something you did not want to hear"), require one behavioural item for the top two hypotheses, and add a contradiction check (the opener against later answers) that downgrades the label and replaces the "worth protecting" text with an honest "not detected from self-report". Offer a link to send two direct reports the same three questions.
3. **Fix the read selection and the "A or B" framing (M3, E5).** Choose the read by direct evidence, not by `NETWORK_ORDER`; show both causes when their marginals are within 0.12; only offer an "open question" that passes the VOI test; reframe as "which is upstream".
4. **Remove unsupported claims and false findings (M4, M5, Q-inversion, zone fallback).** No margin statement without profit data; "Not measured" instead of Candour=High; stop attributing the hypothetical inversion pick to "your answers"; add `capability` and `information` entries to `ZONE_BY_CONSTRAINT.SP` so the headline and the section 02 text agree (D3 currently contradicts itself).
5. **Rebalance the item pool (opener, scales, breadth).** Add "Nothing stands out" to the opener and shrink its weights; standardise ordinal items to 5 points; split double-barrelled items (leverage, talent, repeat); equalise total available weight per hypothesis (about 8 each, with at least two strongly disconfirming items for execution, talent, capability, focus, economics, direction); and add items for market/growth, cash/capacity and decentralised-firm problems so the tool can say "this isn't an internal friction problem".
