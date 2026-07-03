// imageService.js — fetch a real photo of a known word from free, no-key APIs.
// Primary: Wikipedia REST summary (gives image + blurb). Fallback: Openverse.
// The answer is always known because WE chose the word before fetching.

import { pickItem } from "./wordBank.js";

const WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const OPENVERSE = "https://api.openverse.org/v1/images/";

// Load an image URL and resolve only if it actually decodes (filters dead links).
function verifyImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    // 8s cap so a slow host can't hang a round
    setTimeout(() => resolve(false), 8000);
    img.src = url;
  });
}

async function fromWikipedia(item) {
  const res = await fetch(WIKI_SUMMARY + encodeURIComponent(item.wikiTitle), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("wiki " + res.status);
  const data = await res.json();
  const imageUrl =
    (data.originalimage && data.originalimage.source) ||
    (data.thumbnail && data.thumbnail.source) ||
    null;
  if (!imageUrl) throw new Error("wiki no image");
  const blurb = (data.extract || "").trim();
  // meaningful words from the blurb become bonus "related" tokens for grading
  const extraTokens = blurb
    ? blurb.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length >= 4).slice(0, 40)
    : [];
  return { imageUrl, blurb, extraTokens, source: "Wikipedia" };
}

async function fromOpenverse(item) {
  const q = encodeURIComponent(item.word);
  const res = await fetch(`${OPENVERSE}?q=${q}&mature=false&page_size=12`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("openverse " + res.status);
  const data = await res.json();
  const results = (data.results || []).filter((r) => r.url);
  if (!results.length) throw new Error("openverse empty");
  const pick = results[Math.floor(Math.random() * results.length)];
  const extraTokens = (pick.tags || []).map((t) => (t.name || "").toLowerCase()).filter(Boolean);
  const blurb = pick.title ? `Also known as: “${pick.title}”.` : "";
  return { imageUrl: pick.url, blurb, extraTokens, source: "Openverse" };
}

// Try to build one playable round from a specific item. Returns null on failure.
async function tryItem(item) {
  const providers = Math.random() < 0.5
    ? [fromWikipedia, fromOpenverse]
    : [fromOpenverse, fromWikipedia];
  for (const provider of providers) {
    try {
      const out = await provider(item);
      if (await verifyImage(out.imageUrl)) {
        return {
          word: item.word,
          category: item.category,
          synonyms: item.synonyms || [],
          hypernyms: item.hypernyms || [],
          imageUrl: out.imageUrl,
          blurb: out.blurb,
          // include the word's own hypernyms as tokens too
          extraTokens: [...new Set([...(out.extraTokens || []), ...(item.hypernyms || [])])],
          source: out.source,
          // fresh random focal point so the same word looks different each play
          focal: { x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6 },
        };
      }
    } catch (e) {
      /* try next provider */
    }
  }
  return null;
}

/**
 * Build a playable round. Tries several words until one yields a valid image.
 * @param {string} category
 * @param {Set<string>} used   words already used this session (avoid repeats)
 * @returns {Promise<Round>}    throws only if every attempt fails
 */
export async function getRound(category, used = new Set()) {
  const tried = new Set(used);
  for (let attempt = 0; attempt < 8; attempt++) {
    const item = pickItem(category, tried);
    tried.add(item.word);
    const round = await tryItem(item);
    if (round) return round;
  }
  throw new Error("Could not load an image right now. Check your connection and try again.");
}

// Fire-and-forget preload of the next round so transitions feel instant.
export async function preloadRound(category, used = new Set()) {
  try {
    return await getRound(category, used);
  } catch {
    return null;
  }
}
