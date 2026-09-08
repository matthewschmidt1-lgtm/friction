# Friction

*Find what's getting in the way.*

A guided diagnosis, not an assessment. Eleven questions, about four minutes,
no score. The output is a Friction Map showing where the constraint lives
between **Business**, **System** and **People**, one likely blind spot, one
question worth investigating and one next move. Come back after acting and the
tool closes the learning loop.

See [DESIGN.md](DESIGN.md) for the creative direction and experience architecture.

## Structure

```
index.html        shell, meta, fonts
css/friction.css  the Low Tide design system
js/content.js     every question, weight, blind spot, question and move
js/engine.js      pure scoring: lens totals, edge scores, decision ranking
js/app.js         screens, transitions, storage, the Friction Map (SVG)
```

No build step, no framework, no backend. Answers and past diagnoses are stored
in the browser's `localStorage` under `friction.v1` and never leave the device.

## Editing the diagnosis

Everything a person reads lives in `js/content.js`. Each option carries silent
weights:

- `l` — pull toward a lens (`B`, `S`, `P`)
- `e` — pull toward an edge (`BS`, `SP`, `PB`)
- `tags` — signals used to rank the "real problem" statements and pick the blind spot

Blind spots are an ordered rule list; the first rule whose `when` matches wins.
The question and the next move are a matrix of decision × primary edge.

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
