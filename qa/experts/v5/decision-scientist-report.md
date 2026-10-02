# Friction v5: re-test on real-world cases (Dr. Daniel Hersh, decision scientist)

Cases and answers: `qa/experts/v5/decision-scientist-cases.json` (C1, C1b, C2 to C6). Beliefs were written before any question was seen. I answered as each person plausibly would, including blind spots, using only what a user sees (take.sh, diagnose.sh). Answers are my reconstruction from the public record (Vuori and Huy on Nokia, the 737 MAX investigations, Eichenwald on Microsoft, Kodak's history) and are a judgment call; a real executive could answer differently. One correction made in good faith: for C2 I first typed the opener "Too many priorities", realised Boeing leadership would not describe their week that way before I saw any later question, and replaced it with "Nothing major is in the way".

I also ran one sensitivity variant (C1b with the loss question answered "talked about it openly"); it is described in section 3 and then removed from the case file.

## 1. Summary table

| Case | Answerer | Expert belief (short) | Friction read (label) | Verdict | Useful |
|---|---|---|---|---|---|
| C1 Nokia 2009 | CEO | Fear and filtered bad news upward (trust/candour), plus no single software direction | "No clear constraint" (no label, 11 questions) | Miss on content; honest abstention | 2 |
| C1b Nokia 2009 | Middle manager | Same | "It isn't safe to raise problems or disagree" (Emerging pattern); close behind: disagreement avoided | Match on the main cause, partial overall (direction missed; experiment led by an unrelated loss banner) | 3 |
| C2 Boeing 737 MAX ~2016 | Program leadership | Schedule/cost incentives overrode engineering voice; delegated certification; unclear authority between engineering and program | "No clear constraint" | Miss; false negative | 1 |
| C3 Microsoft ~2011 | Ballmer | Stack ranking and divisional rivalry (incentives, cross-unit coordination) | "No clear constraint" | Miss; false negative | 1 |
| C4 Kodak ~2005 | CEO | Economics (digital profit pool far below film) plus hedging direction | "Decisions get stuck" (Emerging pattern, "Based on 1 of your answers") | Miss; plausible-sounding wrong read | 1 |
| C5 composite | Owner-CEO | Pricing/margin problem described as a people problem | "Performance depends on people working around the system" (Emerging pattern) | Miss; echoed owner's people framing | 2 |
| C6 control | COO, healthy firm | Nothing material; minor meeting/doc hygiene | "No clear constraint" | Match | 3 |

Mean usefulness 1.9 / 5 on these cases (v4 review: 3.0 / 5 on different, easier synthetic cases, so not comparable). Reads matched the expert in 1 of 6 cases that had a real documented constraint. The control was handled correctly. In 3 of the 4 "no clear constraint" outputs I believe a real constraint existed.

## 2. The cases

### C1. Nokia mobile phones, 2009, answered by the CEO (Kallasvuo)
- Situation: market leader in volume, losing the smartphone race to iPhone and Android; Symbian fragmented across S60, Maemo, MeeGo.
- Key answers (11 questions): opener "Too many priorities, nothing gets finished"; focus "Probably"; execution "Usually"; economics "Very clearly"; last problem raised "It was acted on"; own part "I'm too stretched to see it closely"; overruled call "We talk it through afterwards"; ten seconds after bad news "Listened, then explained why I saw it differently"; loss "Yes, and we've talked about it openly"; leverage "Some"; inversion "Add more priorities" and "Keep solving the symptom".
- answererBelief: Nokia is strong; the issue is speed in software and services; execute faster.
- expertBelief: fear-filtered upward information (middle managers shaded the truth because they feared top managers' reactions and fragmentation of the software platform) with no single software direction.
- Friction: "01 THE READ: No clear constraint. Your answers didn't point to a constraint. That doesn't rule one out. It means nothing you described rose above a weak signal, and this is a reading of your own answers. The most useful next step is to ask two or three people who report to you the same questions and see whether their answers match yours."
- Close-behind/notices: none. No experiment.
- Judgment: miss on content, but the best possible failure. The one behavioural item the CEO could not easily game ("explained why I saw it differently") scored as only a weak signal. The abstention plus "ask two or three people who report to you" is exactly the instrument that would have revealed the Nokia pattern (Vuori and Huy used reports' accounts). Calibration: appropriate, since a flattering self-report cannot reveal the truth, and v5 does not claim health. Not echoing the answerer, because it declined to have a read at all. But it says "nothing you described rose above a weak signal", which asserts more than the instrument knows: it asked no question on platform strategy, rewards or what happened to the last bearer of bad news in the middle layers. The experiment (ask your reports to run it) would discriminate perfectly between "no problem" and the hidden-fear rival, but it is a WATCH line for a quarter later, not a 30-day experiment. Usefulness 2.

### C1b. Same Nokia, same year, a middle manager in smartphone software
- Key answers (15 questions): opener "People don't say what they think"; last problem raised "It didn't get raised, so nothing happened"; ten seconds "Listened, then explained why I saw it differently"; blame "Who did this?"; gossip "Often"; limits "Fear of mistakes"; own part "I avoid the hard conversation"; overruled call "We talk it through afterwards"; loss "Yes, and we haven't really talked about it"; leaders disagree openly "I can't remember one"; decision waits for "Agreement between leaders"; stuck decisions "Leaders disagree"; authority "Rarely"; comes back up "High consequence of getting it wrong"; inversion "Avoid the difficult conversation" and "Keep things comfortable...".
- answererBelief: leadership sets unrealistic targets, will not listen, too many platforms.
- expertBelief: as C1. The manager also takes part in the silence.
- Friction: "01 THE READ: It isn't safe to raise problems or disagree [Emerging pattern]". "Close behind: Disagreement is avoided rather than worked through". Confidence explanation: "Based on 3 of your answers, including at least one about something that actually happened." Banner: "Before anything structural. This may not be mainly a structure problem. Name the loss together first". Experiment: "Why this experiment: the read is 'It isn't safe to raise problems or disagree', but the highest-value move is to act on 'The organization is carrying a loss it hasn't processed'." Blind spot test: "Ask three people, privately, what they would say in the leadership meeting if there were no cost. Note what they haven't said." ONE QUESTION: "What is the problem everyone knows about that hasn't been said in a leadership meeting?"
- Judgment: match on the principal cause, with the right close-behind rival. Surfaced something the answerer did not say: the page treats the manager's own "I avoid the hard conversation" as part of the loop, which is what the research found. Missed: the direction/platform fragmentation (it was never asked, and "Leaders disagree" and "Agreement between leaders" were not enough to promote it). The headline experiment is the weak point. The loss banner and the "act on the unprocessed loss" experiment come from one answer (loss "haven't talked about it") that I gave as a plausible 2009 layoff answer; it takes the first slot over the read's own experiment, and for Nokia it is a distraction. The blind-spot test is good and behavioural; it is the better experiment and would discriminate "fear" from "disagreement avoided" only weakly (both produce unsaid things). Label: Emerging, with "Based on 3 of your answers" is about right: three items, one behavioural; but the page also lists "It isn't safe..." and two siblings as "High confidence" in the alternatives, above the Emerging headline (see section 6). Usefulness 3.

### C2. Boeing 737 MAX, about 2016, senior program leadership
- Key answers (11 questions): opener "Nothing major is in the way"; leverage "Some"; execution "Usually"; focus "Definitely"; last problem raised "It was acted on"; overruled call "It stands"; loss "No"; own part "I don't think I'm part of it"; ten seconds "Listened, then explained why I saw it differently"; economics "Very clearly"; inversion "Do nothing".
- answererBelief: match Airbus on schedule and cost; engineering sound; certification on track.
- expertBelief: schedule and cost incentives dominated engineering voice; ODA delegation and MCAS hidden to protect a "no new simulator training" promise; engineers could not push back. Primary incentives/economics leading to a candour failure; secondary unclear authority between engineering and program.
- Friction: "01 THE READ: No clear constraint" (same text as C1).
- Judgment: miss. Not echoing, but the outcome is a false negative with no warning that nothing was asked about the things that mattered: no item on what is rewarded, on what happens when a schedule and a safety concern collide, or on external oversight. Calibration: the page says "nothing you described rose above a weak signal", which is true only of what was asked. The "ask two or three people who report to you" advice would work here too; but there is no experiment. Usefulness 1.

### C3. Microsoft, about 2011, Ballmer
- Key answers (15 questions): opener "Effort is high but results aren't"; focus "Probably"; execution "Sometimes"; leverage "Some"; last problem raised "It was acted on"; own part "I step in and decide, so it doesn't land on others"; overruled call "We talk it through afterwards"; ten seconds "Listened, then explained..."; loss "Yes, openly"; economics "Very clearly"; stuck decisions "Leaders disagree"; direction "Mostly similar"; authority "Usually"; talent "Usually"; inversion "Do nothing" and "Keep solving the symptom".
- answererBelief: we are profitable and strong; going all-in on cloud; execute faster.
- expertBelief: stack ranking and divisional rivalry made cooperation individually irrational; the constraint is incentives and cross-unit coordination.
- Friction: "No clear constraint".
- Judgment: miss. Three honest problem-signalling answers (opener, "Sometimes", "Leaders disagree") and the "I step in and decide" self-confession did not accumulate to even an Early signal. Whether that is good conservatism or insensitivity cannot be told from outside, but the leader named the problem class ("Leaders disagree") and the tool did not ask the follow-up that matters here: what each unit is measured and paid on. Usefulness 1.

### C4. Kodak, about 2005, CEO (Perez)
- Key answers (15 questions): opener "Effort is high but results aren't"; focus "Definitely"; leverage "A lot"; execution "Sometimes"; own part "I don't think I'm part of it"; last problem raised "It was acted on"; overruled "It gets reversed"; ten seconds "Listened, then explained why I saw it differently"; loss "Yes, openly"; talent "Sometimes"; repeat "Sometimes"; execution_why "Dependencies between teams" + "Too many competing priorities"; stuck decisions "Too many people have to approve it"; comes back up "High consequence of getting it wrong"; inversion "Keep solving the symptom" and "Do nothing".
- answererBelief: digital is the future; move faster and cut costs.
- expertBelief: economics (film margins, no digital profit pool to replace them) plus a long hedge between film and digital.
- Friction: "01 THE READ: Decisions get stuck [Emerging pattern]. Important decisions don't have a clear owner, so they wait... It is the absence of decision rights." "Based on 1 of your answers." Close behind: "Performance depends on people working around the system". Supports: [High] "Too many people have to approve it". Experiment: write who recommends, decides, is consulted for the three most stalled decisions. "What not to do: Don't fix this by adding another approval layer. Your answers suggest the problem is not insufficient control. It is unclear decision ownership." ONE QUESTION: "Which decisions are we still making at the top because we don't trust the organization to make them...".
- Judgment: miss, and a confident-sounding one. Two internal problems: (a) the evidence cited is "Too many people have to approve it", i.e. an excess of control, yet the headline says nobody owns decisions and the "what not to do" says insufficient control is not the problem, the opposite of the answer given; (b) "Emerging pattern" on "1 of your answers" is a headline built from one item. The alternatives list shows "Performance depends on people working around the system (Strong pattern)" above the Emerging headline. The experiment would not discriminate from economics or direction rivals, because neither is on the page. "Reinforcing (from your answers): Doing nothing" is a hypothetical I picked, now presented as my statement. Also "Operating profile suggests: The scarce resource is leadership capacity" with no financial data. Echo: partly (took the "approval" language and my "Doing nothing" and turned them into a story), surfaced nothing new. Usefulness 1.

### C5. Composite: pricing problem presented as a people problem (45-person B2B equipment services firm, owner-CEO)
- Key answers (14 questions): opener "Effort is high but results aren't"; focus "Probably"; execution "Sometimes"; leverage "A lot"; own part "I look for who dropped the ball"; last problem raised "It was acted on"; overruled "We talk it through afterwards"; ten seconds "Listened, then explained..."; loss "No"; talent "Sometimes"; repeat "It depends on the person"; execution_why "Follow-through" + "Lack of capability"; business uncertainty "Where profit comes from"; inversion "Keep measuring activity instead of outcomes" and "Keep solving the symptom".
- answererBelief: account managers lack ownership and drive.
- expertBelief: price list and discount discretion; unprofitable top customers; gross margin slipped from 38 to 27 percent.
- Friction: "01 THE READ: Performance depends on people working around the system [Emerging pattern]", "Based on 2 of your answers", "We changed our mind: earlier it pointed to Agreed priorities don't reliably happen." Supports: "It depends on the person"; "A lot". Alternatives: "Priorities aren't tied to what creates value (Emerging pattern)" last in the list. Costing: "Operating profile suggests: Results are likely being delayed rather than lost. (Emerging)". Experiment: ask the three most relied-upon people what they do by hand.
- Judgment: miss. It echoed the owner's people framing ("capable people carry it personally") even though the owner said his biggest uncertainty was "Where profit comes from" at question 13, and the economics item ("How clearly can you connect your priorities to what creates value") was never even asked. The correct answer, price and discount discipline, sat one hop away in the alternatives list at a lower label. I did not fill the cost screen's revenue/profit ranges because take.sh does not show their option text; that optional screen is the only place the app could have asked about margin, so a real owner who skips it gets no economics read. The experiment would not discriminate between "heroics" and "pricing" at all: both rivals predict that relied-upon people can list manual workarounds. "Results are likely being delayed rather than lost" is a financial statement with no financial data. Usefulness 2 (a harmless process experiment on the right firm, with the wrong cause).

### C6. Control: well-run 120-person firm, minor meeting and onboarding-doc nuisance
- Key answers (12 questions): opener "Nothing major is in the way"; leverage "Some"; execution "Usually"; focus "Definitely"; trust_last "It was acted on"; overruled "We talk it through afterwards"; loss "Yes, openly" (an ordinary departure); own part "I'm too stretched to see it closely"; ten seconds "Thanked them and asked more"; talent "Usually"; economics "Very clearly"; inversion "Do nothing".
- Friction: "No clear constraint" (same text). Judgment: match. It did not invent a problem, even though I gave two mildly "problem" answers (execution "Usually", own part "too stretched") and had to pick an inversion item. Weakness: the minor issue I actually have was never asked about, so "nothing rose above a weak signal" cannot be known. It does fit "a well-run organization with an ordinary issue". Usefulness 3.

## 3. C1 versus C1b: how much does the answerer change the read?

Same company, same year, same pressure. CEO: "No clear constraint", no experiment. Middle manager: "It isn't safe to raise problems or disagree [Emerging pattern]", a 90-day experiment, a banner about unprocessed loss. Nothing on either page is derived from any fact about Nokia, only from the respondent's account of it. In this instrument the facts can reach the page only through the answerer's perception, so the variance attributable to the answerer is, to a first approximation, the whole of the difference between the two outputs. The CEO's account differs from the manager's on the very items that matter: last problem raised (acted on versus not raised), own part, loss (openly versus not discussed).

Two further observations:
1. Sensitivity within one answerer: when I re-ran the manager with only the loss answer changed to "talked about it openly", the read changed to "Disagreement is avoided rather than worked through [Emerging pattern]" (with trust close behind), the loss banner and loss-led experiment disappeared, and the experiment became "count how many times someone changes their mind". One answer swapped both the headline and the experiment, within the same person. (That variant was removed from the case file; the output is quoted in my notes above.)
2. The direction of the bias is predictable. Powerful respondents (C1, C2, C3, C4, C5) all produced a read that either abstains or reflects the leader's own framing, because the tool's strongest disconfirming evidence ("It was acted on", "Very clearly", "I don't think I'm part of it") comes from the person least able to observe the effect. The people lower in the hierarchy produce the stronger signal. The page now says so ("ask two or three people who report to you"), which is the correct remedy, but it is relegated to a WATCH line and has no workflow.

Rough decomposition: the answerer's role and self-image explain most of the variance between C1 and C1b; company facts explain essentially none of it that I could measure here. Also note that I authored both answer sets, so this is a statement about the instrument's sensitivity, not a measurement of real executives.

## 4. What changed since my first review

Fixed:
- Opener: now includes "Nothing major is in the way" and "I'm tired, and I can't tell if it's the business or me" (Q-opener). Fixed in part; it is still a first-person, single-select with 10 options.
- Behavioural probes ungated: every case, including a flattering CEO, was asked "What happened the last time someone raised a serious problem" and "When a manager makes a call you would have made differently". The old gating problem (B1/Q-gating) is gone.
- Trust item replaced by an event-based prompt ("the next ten seconds"). Fixed for the form, though it remains a self-report.
- The false reassurance "That is unusual, and worth protecting" is gone, replaced by "That doesn't rule one out... ask two or three people who report to you".
- Confidence explanation now states how many answers support the read, whether one is behavioural, and "This is a structured reading of your own answers, not a measurement" (calibration claims). Substantial improvement in honesty.
- Unmeasured profile rows now show "Not asked" ("Priority load=Not asked; Rework and workarounds=Not asked").
- A self question ("what is your own part in it") and a loss question were added. Both are useful; the loss question is the strongest steering input I saw (section 3).

Partly fixed:
- Confidence labels: the explanation is better, but the alternatives list still shows items at "High confidence" or "Strong pattern" above the Emerging headline (C1b: three at "High confidence"; C4: leverage at "Strong pattern"; C5: three at "Strong pattern"). The headline label and the list contradict each other.
- Single-respondent bias: acknowledged and a remedy suggested, but no mechanism (no share link, no multi-rater mode).
- Abstention: the tool now declines to read in 4 of 7 cases; I could not test its false-positive rate from here (v4 had a 7 percent High confidence rate on random input; I cannot verify the tempering the builders may have added from a user's view).

Not fixed:
- Unsupported financial statements ("Operating profile suggests...") appear in C1b, C4 and C5 without any revenue or profit data.
- Hypothetical inversion picks are still displayed as "Reinforcing (from your answers): Doing nothing" while the prompt still says "Be honest about which ones are already happening".
- Headline text not consistent with the chosen option: C4 "Too many people have to approve it" yields "Important decisions don't have a clear owner" and "the problem is not insufficient control".
- Single-answer reads: C4 headline "Based on 1 of your answers" still receives Emerging.
- Breadth gaps (incentives, market, pricing and margin, schedule/cost pressure, external oversight): no item. All of C2, C3, C4, C5 fail on this.
- Economics is still a confidence question ("How clearly can you connect..."), which leaders answer "Very clearly" (C1, C2, C3, C4, C6).
- Ordinal scales still 4 points with no midpoint and no "not sure" on most items.
- Direction item still asks the leader to predict what the leadership team would say.
- Confessional options ("I want to be the one who decides", "I get nervous when it's out of my hands") remain.
- Experiments still do not name their rival or say what result would favour the rival (C4, C5).

## 5. Remaining measurement biases visible in the questions
1. Power-biased informant: the strongest signals come from items only the leader can answer flatteringly (acted on, thanked them, own part). The tool is least sensitive in exactly the cases where the most powerful person is the cause.
2. Impression management and social desirability on "Your own part": option 6 "I don't think I'm part of it" is the lowest-cost answer, and the other options are self-flattering confessions ("I'm too stretched", "I step in and decide, so it doesn't land on others").
3. Self-confidence items posing as state measures: focus ("would you know what to stop?") and economics ("How clearly can you connect...").
4. Forced choice with no neutral midpoint, and all openers except one a "problem".
5. Hypothetical converted to fact: the inversion question.
6. Question order and framing: the loss question appears mid-interview as "Before we go further", and one answer can supersede the structural read with a banner.
7. Scope ambiguity of the referent: "your leaders", "a manager", "you" mean different things to a CEO and a middle manager. The C1b manager had no obvious way to answer "When a manager makes a call you would have made differently".
8. Survivorship in the question pool: the questions all assume the organization has an internal-friction problem; no question allows "the problem is outside, in the market, price or product".
9. Anchoring on the opener: the first answer fixes the path (C2/C3/C5 all went to leverage, execution, focus after different openers; the C1b opener "People don't say what they think" sent the whole interview toward trust and blame).

## 6. Calibration remarks
- "No clear constraint" is the right output for an uninformative self-report but the wording "nothing you described rose above a weak signal" over-reports coverage. It should list what was and was not asked.
- A headline Emerging pattern "Based on 1 of your answers" (C4) is too strong; one item should not name a cause.
- Alternatives listed at a higher label than the read (C1b, C4, C5) undermine trust in the label. Either show the read at the label of the highest alternative or explain why the read is not the highest.

## 7. Top five recommendations, ranked by impact
1. Add the missing lens: incentives, economics and external pressure. Behavioural items such as "When engineering and schedule last disagreed, which one won?", "What is each unit's bonus paid on?", "When did you last change a price, stop a product, or fire a customer, and what happened?", plus a pricing/margin/unit-economics follow-up that is always asked when the opener or the uncertainty item points at profit or results. Would have changed C2, C3, C4 and C5.
2. Treat the respondent's position as an input and make multi-rater first-class. Ask role first (owner or CEO, executive, manager, individual), weight self-report accordingly, and when the respondent is the most senior person offer an in-app 3-question link for two or three reports, with the page showing the gap. C1 versus C1b shows this is the largest source of variance.
3. Make the page consistent and sourced: headline text must follow the selected option (C4), no alternative may outrank the read, no "Operating profile suggests..." without financial inputs, and no "from your answers" for the hypothetical inversion picks.
4. Make "No clear constraint" informative: list what was measured, what was not (e.g. incentives, pricing, external pressure), and the single most useful behavioural check; include the abstention rate in any audit. Never accept a single item as an Emerging pattern.
5. Make experiments discriminating and de-risk the loss override: name the rival and the observation that would favour it ("if the pricing review shows margin falling on discounted accounts, this is economics, not heroics"), and require the loss banner to be tied to a follow-up ("is this loss part of what you described?") before it outranks a structural read.

## v5.1 re-run

All seven cases re-run through the full v5.1 interview with the same persona logic. Opener indices were shifted by the coordinator; I kept every opener except C4 (Kodak), where I switched to the new "Cash or margin is tighter than it should be" because for Perez in 2005 it fits clearly better than "Effort is high but results aren't". I kept every "Your own part" (single answer each) and "loss" answer unchanged; the loss wording ("hasn't fully moved past", no twelve-month limit) did not change anyone's answer. Variant C5b (same owner, new margin opener) was added to the case file as a sensitivity test.

New questions the app asked and my in-character answers:

| Case | missed number | conflict | other new items |
|---|---|---|---|
| C1 Kallasvuo | "We looked at why together and changed something" | "This quarter" | direction "Mostly similar" (now asked) |
| C1b middle manager | "They were put on a plan, or moved out" | (as before) "I can't remember one" | none new |
| C2 Boeing | "They were put on a plan, or moved out" | "I can't remember one" | none; the deadline-vs-concern item was NOT asked |
| C3 Ballmer | "They were put on a plan, or moved out" | "This quarter" | none |
| C4 Kodak | "They were put on a plan, or moved out" | "This quarter" | margin_last: "A clear rule, applied the same way every time" (a flattering answer; Kodak's problem was not discounting) |
| C5 owner | "I let them know I was disappointed" | "I can't remember one" | rulebreak "A quiet word, and the result still counts"; collide "It hasn't come up"; blame_first "Who did this?"; gossip "Sometimes"; limits "Lack of capability" |
| C6 control | "We looked at why together and changed something" | "This quarter" | none |

### Per case

**C1 Nokia CEO.** Read: unchanged, "No clear constraint — Your answers didn't point to a constraint." (15 questions now, was 11.) Verdict: miss on content, honest abstention, as in v5. The new items did not help because the CEO's answers on "missed number" and "conflict" are exactly the benign ones he would give. Usefulness 2. Same as v5.

**C1b Nokia middle manager.** Read: "It isn't safe to raise problems or disagree [Emerging pattern]", close behind: disagreement avoided; the loss banner and loss-led experiment are still there. Match on the main cause, partial overall (direction still not surfaced; loss banner still outranks the read's own experiment). Better wording: the alternatives now read "(about as likely)" and "(much less likely)" instead of three items at "High confidence" above an Emerging headline, which removes the label contradiction I flagged in v5; and "Reinforcing (you named this as a way to make it worse)" replaces "from your answers". The "Expected vs observed" row changed from Dependence=Moderate to Low, which I cannot judge. The new "missed" answer ("put on a plan, or moved out") did not add a visible incentive finding because trust dominated. Usefulness 3. Slightly better than v5 on honesty of presentation, same on substance.

**C2 Boeing leadership.** New page: "No single constraint stood out — But some of your answers usually mean something, and they are worth a second look before you conclude nothing is wrong." Answers listed: "They were put on a plan, or moved out" (usually points to: targets and incentives reward the wrong behaviour); "I can't remember one" (usually points to: disagreement is avoided rather than worked through); "I don't think I'm part of it". Closes with: "Leaders tend to describe their organizations more favourably than the people who work in them do. That isn't a flaw in you; it is where you sit." Verdict: partial. Listing "targets and incentives reward the wrong behaviour" is the first time the tool pointed at my expert cause for this case, and the avoidance-of-disagreement pointer is also close to the engineers-could-not-push-back story. It is correctly not a labelled read. Weaknesses: no experiment; the app never asked the deadline-versus-concern question ("The last time a deadline or target collided with a quality, safety or customer concern, which gave way?") for this case, although that is the question that discriminates the 737 MAX story. It only fired for C5 (and C5b), so its routing seems to depend on earlier answers (the opener "Nothing major" skipped it). That is a hole: a leader who says nothing is wrong is never asked it. Usefulness 3. Better than v5 (1) because the page now tells the user which answers deserve scrutiny rather than a blank "no constraint".

**C3 Ballmer.** Same new page; answers listed: "They were put on a plan, or moved out" (targets and incentives reward the wrong behaviour); "I step in and decide, so it doesn't land on others" (decision authority is more centralized than the business requires); "Leaders disagree" (leadership isn't aligned on what matters most). Verdict: partial to good: incentives and unresolved leader disagreement are both my expert belief, and the page raised them without overclaiming. It still gives no experiment and no ranking of the three. Usefulness 3. Better than v5 (1).

**C4 Kodak (opener switched to the cash/margin option).** Same page; answers listed: "put on a plan, or moved out" (incentives), "It gets reversed" (centralized), "Too many people have to approve it" (decision rights unclear), "A lot" (workarounds), "I don't think I'm part of it". Verdict: miss on the core (economics, the shrinking digital profit pool) and partial on the side (incentive and direction flags); economics is not listed at all, because the one margin question ("Who set the price or the discount?") measures discount governance and Kodak's issue was not that. A real Perez would not have an item that reveals "film margins are 60 percent and digital margins are 10". The pointing at five different problems with no ranking is closer to a to-do list than a diagnosis, but it does not claim a wrong cause, which was the v5 failure ("Decisions get stuck [Emerging pattern]" built on 1 answer). Usefulness 2. Better than v5 (1) because a confident wrong read has been replaced by a hedged list.

**C5 composite owner (opener "Effort is high but results aren't" kept).** Read: "Problems are met with blame rather than ownership [Strong pattern]", "In your words: 'I let them know I was disappointed' 'I look for who dropped the ball'", based on 2 answers, one behavioural. Experiment: "Say 'this was mine' yourself, first". Alternatives: incentives and others "(much less likely)"; economics is not in the top five. Verdict: miss, and arguably worse than v5: v5 echoed the owner's "heroics" framing but at Emerging; v5.1 produces a confident behavioural lecture to the owner. Part of this is my own doing: the new items (missed number, blame_first, rulebreak) are the first to give this owner a place to show a blame style, which a real owner of this type would plausibly also have, so the finding is not invented, but it is not the main problem. The price question was never asked because the opener did not route there. Usefulness 1 (down from 2).

**C5b same owner with the margin opener.** Asked "Who set the price or the discount?" → "Whoever was selling, case by case". Read: still "Problems are met with blame rather than ownership [Strong pattern]". The margin opener plus the one answer I would call diagnostic for this case (case-by-case discounting by sales) did not produce an economics read or even rank it among the top five. Verdict: miss. So the new pricing item exists, but it is under-weighted or the other answers swamp it; the owner's other answers (blame style) were all honest, so this is not a respondent problem. Usefulness 1. This is the most important remaining failure in v5.1.

**C6 control.** "No clear constraint" again, 15 questions (was 12). Match. Usefulness 3. The new items did not push a healthy firm into a false finding, which is the test I cared about; but 15 questions to say nothing is a heavier burden than v5.

### C1 versus C1b, again
CEO: "No clear constraint", no experiment. Middle manager: "It isn't safe to raise problems or disagree", Emerging, with a banner. Same company, same year; the difference is still entirely the answerer. What changed: the new "missed number" item is the first item with an answer-the-way-your-role-wants shape, and it separated them differently from before ("We looked at why together" for the CEO, "put on a plan, or moved out" for the manager), though the manager's incentives pointer was not surfaced because trust outranked it. The new page for leaders that do hit flagged answers (C2, C3, C4) is the right design, since it says what to look at while admitting the limits; but Nokia's CEO got the blank page because none of his scripted answers was flagged, so the tool still cannot distinguish a healthy company from a flattering leader without the reports' answers.

### Better or worse than v5?
| Case | v5 read | v5.1 read | Verdict v5 → v5.1 | Usefulness v5 → v5.1 |
|---|---|---|---|---|
| C1 | No clear constraint | No clear constraint | miss → miss (honest) | 2 → 2 |
| C1b | Isn't safe to raise problems [Emerging] | same, cleaner alternatives wording | match/partial → match/partial | 3 → 3 |
| C2 | No clear constraint | No single constraint stood out; flags incentives, avoided disagreement | miss → partial | 1 → 3 |
| C3 | No clear constraint | No single constraint stood out; flags incentives, centralized, leaders disagree | miss → partial | 1 → 3 |
| C4 | Decisions get stuck [Emerging], 1 answer | No single constraint stood out; five flags, no economics | miss → miss (hedged) | 1 → 2 |
| C5 | Depends on people working around system [Emerging] | Problems met with blame [Strong pattern] | miss → miss (worse) | 2 → 1 |
| C5b | n/a | blame [Strong pattern] despite margin opener and case-by-case discounting | n/a → miss | 1 |
| C6 | No clear constraint | No clear constraint | match → match | 3 → 3 |

Mean usefulness 2.1 (v5: 1.9). Net: better at the no-read end, where the app now tells the leader which answers deserve a second look; worse at the confident end, where C5 now gets a "Strong pattern" about the wrong thing.

### What is now fixed
- Alternatives no longer outrank the read; they are phrased "(about as likely)" or "(much less likely)".
- "Reinforcing (you named this as a way to make it worse)" correctly attributes the hypothetical inversion picks.
- A read built on one answer (C4 v5) no longer happens; the no-single-constraint page lists the flagged answers and what they usually point to.
- Incentives are now a measured construct (missed number, rulebreak, collide) and appear as a pointer in C2, C3, C4.
- The leader-bias caveat ("That isn't a flaw in you; it is where you sit") and "ask two or three people who report to you" are on the page.
- The control stayed clean.

### What is not fixed
- Economics and pricing are still not read correctly even when the owner chooses the margin opener and says discounts are set case by case (C5b). Kodak-style economics (the profit pool) has no item.
- The headline experiments and rival discrimination: the no-single-constraint page has no experiment; the loss override in C1b still outranks the read's own experiment.
- The deadline-versus-concern item can be skipped by a leader whose opener is "Nothing major" (C2), which is the exact case where it matters most.
- The "no single constraint" page lists several answers without ranking or telling the leader which to test first.
- A flattering leader with no flagged answers (C1) still gets the blank page.
- Interview length crept up (15 questions for C1, C2, C3, C4, C5, C6).
- Still no multi-rater mechanism, only the advice.

### Top three remaining recommendations
1. Make the economics read real: give the pricing and discount item (and a "profit by customer/product" item) heavy weight, ask it for every respondent whose opener, uncertainty or results answers mention money, and let a single "case by case, whoever was selling" answer lift economics to a labelled read (C5b). Add a profit-pool item ("does the new line earn what the old one did?") for transitions like Kodak.
2. Route the discriminating behavioural items to everyone: ask "which gave way, the deadline or the concern?" and the incentive items regardless of opener, and rank the answers on the "worth a second look" page with one cheap experiment for the top item.
3. Build the multi-rater step into the product: after a leader's run, offer a three-question link for two or three reports and show the gap. This is the only way C1's blank page could become C1b's finding.
