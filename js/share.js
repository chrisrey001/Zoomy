// share.js — build a Wordle-style share card and copy / share it.

import { todayKey } from "./storage.js";

// Emoji per round based on how well it went.
//   🟢 great  (correct, little zoom-out)  🟡 ok (correct, zoomed out)
//   🟠 partial (related answer)           ⚪ missed
function roundEmoji(r) {
  if (!r.correct) return "⚪";
  if (r.tier === "related" || r.tier === "close") return "🟠";
  // scale 8..1; treat 6+ as "great"
  return (r.scale >= 6) ? "🟢" : "🟡";
}

export function buildShareText(daily) {
  const results = daily.results || [];
  const total = results.reduce((s, r) => s + r.points, 0);
  const correct = results.filter((r) => r.correct).length;
  const strip = results.map(roundEmoji).join("");
  const dateStr = daily.date || todayKey();
  return (
    `Zoomy ${dateStr} 🔍\n` +
    `${correct}/${results.length} guessed · ${total.toLocaleString()} pts\n` +
    `${strip}\n` +
    `Play: ${location.origin || "https://zoomy.netlify.app"}`
  );
}

// Share via Web Share API when available, else copy to clipboard.
// Returns "shared" | "copied" | "failed".
export async function shareResult(daily) {
  const text = buildShareText(daily);
  try {
    if (navigator.share) {
      await navigator.share({ title: "Zoomy", text });
      return "shared";
    }
  } catch {
    // user cancelled or share failed — fall through to clipboard
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    // last-ditch fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
