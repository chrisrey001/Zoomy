// matcher.js — fully client-side fuzzy grading of a player's guess.
// Returns { accuracy, tier } where accuracy is 0..1 and tier is a label.

// Normalize a string: lowercase, strip punctuation, collapse spaces, naive singularize.
export function normalize(str) {
  let s = (str || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

// Very light singularization for matching ("cats" -> "cat", "berries" -> "berry").
function singular(word) {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes") || word.endsWith("ches") || word.endsWith("shes"))
    return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function canon(str) {
  return normalize(str).split(" ").map(singular).join(" ");
}

// Sørensen–Dice coefficient on character bigrams (0..1). Good typo tolerance.
export function diceCoefficient(a, b) {
  a = a.replace(/\s+/g, "");
  b = b.replace(/\s+/g, "");
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = new Map();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.substr(i, 2);
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.substr(i, 2);
    const count = bigrams.get(bg) || 0;
    if (count > 0) {
      bigrams.set(bg, count - 1);
      intersection++;
    }
  }
  return (2 * intersection) / (a.length - 1 + b.length - 1);
}

// Levenshtein edit distance (used for reliable single-letter typo detection,
// since Dice is harsh on short words).
export function levenshtein(a, b) {
  a = a.replace(/\s+/g, "");
  b = b.replace(/\s+/g, "");
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Best Dice score of guess against a list of targets.
function bestDice(guessCanon, targets) {
  let best = 0;
  for (const t of targets) {
    best = Math.max(best, diceCoefficient(guessCanon, canon(t)));
  }
  return best;
}

// Is the guess a plausible typo of any exact target? Uses a small edit-distance
// budget (1 edit for words up to 6 chars, 2 for longer) and only for words of
// length >= 4 so genuinely different short words (car/cat) don't collide.
function isTypo(guessCanon, targets) {
  for (const t of targets) {
    const tc = canon(t);
    const maxLen = Math.max(guessCanon.length, tc.length);
    if (maxLen < 4) continue;
    const budget = maxLen <= 6 ? 1 : 2;
    if (levenshtein(guessCanon, tc) <= budget) return true;
  }
  return false;
}

// Does the guess share a whole meaningful token with any target token?
function tokenOverlap(guessCanon, targets) {
  const gTokens = new Set(guessCanon.split(" ").filter((w) => w.length >= 3));
  for (const t of targets) {
    for (const tok of canon(t).split(" ")) {
      if (tok.length >= 3 && gTokens.has(tok)) return true;
    }
  }
  return false;
}

/**
 * Grade a guess.
 * @param {string} guess         raw player input
 * @param {object} item          { word, synonyms[], hypernyms[] }
 * @param {string[]} extraTokens tags / keywords from the image API (partial credit)
 * @returns {{accuracy:number, tier:string}}
 *   tier: "exact" | "typo" | "related" | "close" | "none"
 */
export function gradeGuess(guess, item, extraTokens = []) {
  const g = canon(guess);
  if (!g) return { accuracy: 0, tier: "none" };

  const exactTargets = [item.word, ...(item.synonyms || [])];
  const relatedTargets = [...(item.hypernyms || []), ...extraTokens];

  // 1. Exact / synonym match (also treats one containing the other as exact,
  //    e.g. "pine cone" vs "cone", "soup can" vs "can").
  for (const t of exactTargets) {
    const tc = canon(t);
    if (g === tc) return { accuracy: 1.0, tier: "exact" };
  }
  for (const t of exactTargets) {
    const tc = canon(t);
    if (tc && (g.includes(tc) || tc.includes(g)) && Math.min(g.length, tc.length) >= 3) {
      return { accuracy: 1.0, tier: "exact" };
    }
  }

  // 2. Typo credit: small edit distance, or strong Dice (catches transpositions
  //    and typos in longer words).
  const strong = bestDice(g, exactTargets);
  if (isTypo(g, exactTargets) || strong >= 0.8) return { accuracy: 0.7, tier: "typo" };

  // 3. Related term (hypernym / API tag) -> partial credit.
  const relExact = relatedTargets.some((t) => canon(t) === g);
  if (relExact || tokenOverlap(g, relatedTargets)) {
    return { accuracy: 0.4, tier: "related" };
  }
  if (bestDice(g, relatedTargets) >= 0.85) {
    return { accuracy: 0.4, tier: "related" };
  }

  // 4. Weak fuzzy on exact targets -> small credit.
  if (strong >= 0.55) return { accuracy: 0.25, tier: "close" };

  return { accuracy: 0, tier: "none" };
}
