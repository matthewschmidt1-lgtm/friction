# Friction — Design Brief

*Find what's getting in the way.*

A guided diagnosis, not an assessment. The user should never feel scored.
They should feel understood, then see something they couldn't quite see before.

---

## 1. Creative direction

### The concept: Low Tide

Friction is what you see when the tide goes out. The water leaves and the
rocks, the ropes, the things caught between them are suddenly visible. Nothing
new appeared. It was there the whole time, under the surface everyone had
learned to look at.

Every visual decision serves that idea:

- **The ground is sand and foam**, not white. Warm, sun-bleached, quiet.
- **The water is blue-green and moves slowly.** A tide that never hurries.
- **The sun is orange** and it only appears where attention should go: the
  friction point, the primary CTA, the one thing to do next.
- **The reveal is a low tide.** The Friction Map draws itself in as if water is
  pulling back from a triangle drawn in wet sand.

### Art direction

| Element | Direction |
|---|---|
| Ground | `#F7F3EA` foam, with two tide pools of aqua and one warm sun glow drifting behind the page on 40–70 second loops. Never a flat white. |
| Materials | Paper and water. Cards are foam-white with a hairline sand border and a soft, low shadow, like something set on wet sand. No glass, no gradients on cards, no neon. |
| Lighting | Late-afternoon summer. Warm highlight from the top-right (the sun glow), cool fill from the bottom-left (the tide pool). |
| Depth | Three planes: the drifting tide (back), the paper (middle), the sun accents (front). Motion speed decreases toward the back. |
| Atmosphere | Calm, unhurried, honest. The tone of someone who has seen this problem before and is not going to rush you. |

### Palette

| Token | Hex | Role |
|---|---|---|
| foam | `#F7F3EA` | page ground |
| sand | `#E9DCC4` | hairlines, quiet surfaces |
| sand-deep | `#B8996A` | muted labels, rules |
| shallow | `#BFE3E6` | aqua tide pool |
| tide | `#2C8C9E` | **System** lens, links, progress |
| deep | `#123F5A` | primary ink, deep water |
| sun | `#F08A3E` | **Business** lens, friction point, primary CTA |
| kelp | `#3E8A6A` | **People** lens, success |

Lens colours are deliberate: Business is the sun (value, energy), System is
the tide (mechanism, leverage, repetition), People is kelp (living, growing,
anchored). The friction point is always the sun, because it is the one thing
that wants your attention.

### Typography

- **Fraunces** (display, optical size 9–144, italic for the human line). Shared
  with the Matthew Schmidt site so the tool feels like a member of the family.
- **Manrope** (interface and body). Rounder and warmer than Archivo; this is a
  conversation, not a résumé.
- **IBM Plex Mono** (stage codes: `01 — SIGNAL`). The quiet instrument-panel
  voice that says "this is a method, not a mood."

Scale is fluid (`clamp`), display copy sits at 2.2–4.4rem, body at 1.05rem
with 1.65 line height. Measure never exceeds ~62 characters.

### Motion language

Slow water, quick hands.

- **Background tide**: continuous, 40–70s, translate + scale only (GPU cheap),
  disabled under `prefers-reduced-motion`.
- **Screen transitions**: exiting content sinks 8px and fades in 220ms; the
  next rises 12px and fades in over 420ms with a 60ms stagger per block.
- **Choices**: 120ms press, a ripple of the lens colour fills from the left edge
  on select. Selected state is a sun-coloured ring, never a filled block, so
  text contrast holds.
- **The Friction Map**: edges draw in with `stroke-dashoffset` over 1.2s; the
  lens pools bloom to their size; the friction point arrives last with two
  slow rings, like a drop landing.
- **Progress**: a tide line across the top with six marks. It fills like water,
  not like a loading bar.

### Emotional arc

Recognition → Curiosity → Honesty → Clarity → Resolve → Return.

The user should arrive tense ("something isn't working"), relax into being
heard (the symptoms are in their words), be gently unsettled (the blind spot
question), feel the framework earn its place (the lenses), participate in the
diagnosis ("which feels closest?"), and leave with one map, one blind spot, one
question and one move. Then be invited back.

---

## 2. Experience architecture

### Principles

1. Start with the problem, not the assessment.
2. Ask nothing about the person. No name, title, company, email.
3. Form hypotheses silently. Never reveal a diagnosis until the user has
   participated in it.
4. One output of each kind: one map, one blind spot, one question, one move.
5. The tool remembers, so the diagnosis becomes a loop.

### Stages (v2)

```
00 Arrival      Something isn't working. Let's find out why.
01 Business     Do you know what matters? (direction, focus, economics)
02 System       Can the organization execute? (decisions, execution, leverage)
03 People       Can people act on it? (authority, talent, trust)
04 Follow-ups   Up to three, only where the signal is strong.
05 Inversion    If you wanted this to get worse, what would you do?
06 Diagnosis    Optional cost inputs, then the Friction Diagnosis.
07 Learning     (on return) Did the friction decrease? What did you learn?
```

The diagnosis follows diagnosis → guiding policy → coherent action: primary
friction zone with confidence, the constraint and its causal chain, reinforcing
forces (the user's own answers first), the business cost and an illustrative
estimate, lost leverage, a possible blind spot, what not to do, one move, one
question, one metric, and the learning loop. The reading behind the playbooks is
never named to the user.

### Section by section

**00 Arrival.** Wordmark, tide, `Something isn't working.` / *Let's find out
why.* Three lines of reassurance in the user's own situation. One CTA: `Begin`.
A second, quieter link: `How this works` (six stages, about four minutes,
nothing leaves your device). If a prior diagnosis exists the page opens with
the return card instead. Conversion goal: begin.

**01 Signal.** Two questions. Goal (single choice, with an optional free-text
line under "Something else"). Symptoms (multiple choice). Each symptom carries
silent weights toward a lens and an edge. Conversion goal: the user hears their
own situation described accurately.

**02 Blind Spot.** A single question, framed by one line from the philosophy.
The answer is stored as a lens on the user's *explanation*, not the problem.
Conversion goal: a small, private moment of "hm."

**03 Lenses.** The framework is introduced only now, in three cards. The user
picks where they *think* the friction lives (their hypothesis, kept for the
reveal). Then five questions, grouped under the three lenses with a coloured
header. Conversion goal: the framework feels earned, not imposed.

**04 Decision.** Four synthesised statements, ordered by fit to the answers but
not labelled. `Which feels closest?` Conversion goal: the user co-authors the
diagnosis.

**05 Friction.** The result is a six-step journey: your signal (their own words,
large), your friction (the edge, the map with that edge emphasised, everything
else behind expanders), your blind spot, the question, one move framed as an
experiment with a success signal, and learn. Headline → evidence → explanation
→ depth. One book per part, a second only under "Further reading". Conversion
goal: "that's interesting."

**06 Action.** One question to investigate. One next move. The learning loop
`Signal → Understanding → Decision → Action → Learning`, with the invitation to
come back. Save, copy a summary, start again, and the link to the thinking
behind it. Conversion goal: the user leaves with a move, and knows to return.

**07 Learning.** On return: what the last map said, what they chose, and the
move. `What happened?` (four options) then `What did you learn?` The answer is
stored and becomes the next Signal. Conversion goal: the second run.

### Responsiveness, accessibility, performance

- Mobile first. One column to 720px, a wider stage for the map above it.
- Sticky top bar with tide progress. Sticky continue bar on mobile, safe-area
  aware. Every target ≥ 44px.
- Semantic buttons with `aria-pressed`, groups labelled by their question,
  focus rings in sun colour, a live region announcing each stage, skip link,
  full keyboard path, reduced-motion path.
- Contrast: deep ink on foam ≥ 12:1; lens colours only ever decorate or sit on
  white.
- No framework, no build step. Three files and two font families. Fonts load
  with `display=swap` and preconnect. Nothing is fetched after load.
