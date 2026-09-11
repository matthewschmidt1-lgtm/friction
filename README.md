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
js/content.js     questions, follow-ups, inversion, zones and the nine mechanism playbooks
js/engine.js      pure scoring: mechanism severities, lens scores, zone, constraint, confidence
js/app.js         adaptive question queue, screens, storage, the Friction Map (SVG)
```

No build step, no framework, no backend. Answers and past diagnoses are stored
in the browser's `localStorage` under `friction.v2` and never leave the device.

## Editing the diagnosis

Everything a person reads lives in `js/content.js`.

- **Nine mechanisms**, three per lens: direction, focus, economics (Business);
  decisions, execution, leverage (System); authority, talent, trust (People).
  Each core question scores one mechanism 0 (fine) to 3 (severe). Answers can
  also carry `side` bumps to other mechanisms, `e` bumps to a zone edge, and a
  `force` sentence that appears under "What's reinforcing it".
- **Follow-ups** carry a `when` gate and a `priority`; at most three are asked.
- **Zones** are the four friction zones and their summaries.
- **Playbooks** hold everything the diagnosis says about a constraint:
  diagnosis, chain, forces, consequences, leverage, blind spot, what not to do,
  guiding policy, move, question and metric.

The engine (`js/engine.js`) takes lens score = mean of its mechanisms, zone
edge = 0.5 × (A + B) + 0.5 × min(A, B) + direct edge signals, and calls the
zone Coherence when all three lenses are elevated and close together. The
constraint is the most severe mechanism inside the zone's lenses.

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
