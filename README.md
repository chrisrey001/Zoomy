# Zooomy

Guess the heavily zoomed-in photo. Zoom out for a clearer view — but the more
you zoom out, the fewer points you earn. Guess correctly with as little zoom-out
as possible to top your score. **5 puzzles a day.**

**▶ Play it live: https://zooomy.netlify.app/**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/chrisrey001/Zoomy)

One-click deploy: the button above imports this repo into Netlify (publish dir
`.`, no build — already set in `netlify.toml`). Nothing else to configure.

## How it plays

1. You see a tiny, zoomed-in crop of a real photo (e.g. a tin can).
2. Type your guess. **Close answers still score** — guess "plant" for a fern and
   you still earn partial credit; typos are forgiven too.
3. Stuck? **Zoom out** for a clearer view, but your potential points drop.
4. A correct guess at full zoom is worth up to **1000 points**.

## How it works (the clever bit)

To auto-score a guess, the game has to *know* what each image is. Random image
feeds don't come with reliable labels, so Zooomy flips it around:

- A curated **word bank** (`js/wordBank.js`) groups concrete items by category,
  each with synonyms (full credit) and broader terms (partial credit).
- Each round picks a random word, then fetches a **real photo of that word** from
  free, no-key APIs — **Wikipedia REST** (primary, also supplies the reveal
  blurb) with **Openverse** as a fallback (`js/imageService.js`).
- Because *we* chose the word, the answer is always known — so scoring,
  fuzzy matching (`js/matcher.js`) and the reveal all just work.

No API keys, no backend, no login. Scores, the daily limit, lifetime stats and an
event log all live in your browser's `localStorage` (`js/storage.js`).

## Project layout

```
index.html            markup + all four screens
css/styles.css        theme & layout (mobile-first)
js/main.js            screen/state controller wiring it together
js/wordBank.js        categories → items (word, wikiTitle, synonyms, hypernyms)
js/imageService.js    fetch photo + answer w/ Wikipedia→Openverse fallback + preload
js/matcher.js         normalize + Sørensen–Dice fuzzy grading of guesses
js/scoring.js         zoom level + accuracy → points
js/zoom.js            zoom viewport controller
js/storage.js         daily limit, stats, event log, settings (localStorage)
js/share.js           Wordle-style share card (Web Share API / clipboard)
netlify.toml          static publish config (no build)
```

## Run locally

It's a static site with ES modules, so serve it over HTTP (opening `index.html`
via `file://` won't load modules):

```bash
python3 -m http.server 8000
# or: npx serve .
```

Then open http://localhost:8000. The image APIs are called from your browser, so
you need internet access to load puzzles.

### Quick console checks

Open the browser console on the running game:

```js
Zooomy.gradeGuess("plant", { word: "fern", synonyms: [], hypernyms: ["plant","leaf"] }).accuracy // 0.4
Zooomy.gradeGuess("ferm",  { word: "fern", synonyms: [], hypernyms: [] }).tier                   // "typo"
Zooomy.scoreFor(8, 1)  // 1000  (max zoom, perfect guess)
Zooomy.scoreFor(1, 1)  // 100   (fully zoomed out)
```

## Deploy to Netlify

This repo is deploy-ready with **no build step**.

- **Git-connected:** New site → pick this repo → build command *empty*, publish
  directory `.` (already set in `netlify.toml`) → Deploy.
- **CLI:** `npm i -g netlify-cli && netlify deploy --prod` (publish dir `.`).
- **Drag & drop:** zip the folder and drop it on the Netlify dashboard.

Then paste your live URL at the top of this README.
