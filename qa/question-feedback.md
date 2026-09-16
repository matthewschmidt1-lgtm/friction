# Friction QA — question feedback

Notes from role-playing nine personas through `js/content.js`. Grouped by question id.

## decisions (CORE)
- "Leaders disagree" and "People don't feel authorized to decide" overlap heavily for founder/managing-partner-bottleneck situations (P1, P5): the founder disagreeing with a manager's call *is* the manager not feeling authorized. Real users will genuinely struggle to pick one.
- No option captures "a single senior person is the de facto approver for everything above a threshold" (P1's founder-signs-everything pattern) — closest is "nobody clearly owns it," which is actually the opposite (the owner is very clear, just unavailable/overloaded).
- "We don't have enough information" is ambiguous between "the data genuinely doesn't exist" (P7's economics-blind case) and "the data exists but is filtered/politically withheld" (P5's fear culture). These would benefit from different diagnoses but read the same to a user.

## execution_why (CORE)
- Forced to answer even when `execution` = 0 (P8, healthy control) — the `when` gate means a real healthy user never sees this question, so asking QA to force an answer produces artificial signal that wouldn't exist in the live app. Worth confirming the parent tool discards these for P8-like profiles.
- No option for "the bottleneck is one person's calendar/capacity" (founder, managing partner) distinct from generic "lack of capacity" — a real user with a bottlenecked-executive problem has to reach for a plural-sounding option that doesn't match their singular situation.

## talent (CORE)
- Hard to answer honestly for heroics-driven orgs (P3, P6): the "best people" ARE producing the most value in the moment (the hospital literally would fail without the three coordinators), but the question implies value = growth/strategic work. A nurse manager or regional director has to infer that the intended meaning is "highest-leverage" rather than "most load-bearing right now" — that distinction isn't in the question text.

## trust (CORE)
- Five options for a construct most people think of as a 3-point scale (safe / depends / unsafe) — "Usually safe" vs "Depends on the situation" vs "Usually difficult" blur together for someone recalling a mixed climate; a real respondent will anchor on whichever example is most recent, not the true average.

## people_limits, business_uncertainty (FOLLOWUPS)
- These only fire above a threshold, but the option lists don't include a generic "a little of everything / no single dominant limiter" choice. Personas with genuinely diffuse, low-grade friction (P9) have to force-pick one driver even when the honest answer is "none of these dominate, they're all mildly true" — this is the same critique as decisions/authority for P9 but sharper here since there's no "somewhat all of these" option.
- `people_limits` options are all people-side causes (clarity, authority, capability, information, fear, incentives, leadership behavior) with no system/process option — for P3 (hospital), the honest limiter is that the scheduling/supply system doesn't carry information to the people who need it, which is a hybrid of "lack of information" and "poor process," but "poor process" isn't offered here (it only appears under execution_why).

## economics (CORE) / business_uncertainty
- The "financial value" framing assumes a for-profit lens. P7 (nonprofit) has to mentally substitute "funding, outcomes, cost" for "financial value" — it works, but a nonprofit user might read "financial value" and answer defensively ("we're not driven by money") rather than translating it correctly.

## decisions_where (FOLLOWUPS)
- The six categories (Customer, People, Money, Operations, Product, Strategy) don't map cleanly onto operational/clinical settings (P3): "which decisions get stuck" for a hospital department is really about patient flow, staffing, and supply — closest is "Operations," but that swallows a lot of distinct sub-cases a real nurse manager would want to separate.

## General
- Several CORE questions (direction, decisions, authority, execution, focus) are single-choice with no "it varies a lot / depends" option. That's fine for personas with a clear pattern, but P9 (everything mildly off) is defined entirely by "mostly," "probably," "somewhat," "sometimes," "depends" — the app's ordinal options (roughly: always/usually/sometimes/rarely) happen to line up well enough, but a genuinely inconsistent org (different answer depending on which decision/day/leader) has no way to signal that inconsistency itself, only to pick the "sometimes" bucket that best approximates an average.
