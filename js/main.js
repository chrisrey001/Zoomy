// main.js — screen controller / game state machine that wires everything together.

import { CATEGORY_NAMES, SURPRISE } from "./wordBank.js";
import { getRound, preloadRound } from "./imageService.js";
import { gradeGuess } from "./matcher.js";
import { scoreFor, potentialPoints, MAX_SCALE, MIN_SCALE } from "./scoring.js";
import { ZoomView } from "./zoom.js";
import { buildShareText, shareResult } from "./share.js";
import * as store from "./storage.js";

// ---- element helpers -------------------------------------------------------
const $ = (id) => document.getElementById(id);
const screens = {
  home: $("screen-home"),
  round: $("screen-round"),
  result: $("screen-result"),
  done: $("screen-done"),
};
function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

// ---- game state ------------------------------------------------------------
const state = {
  category: SURPRISE,
  round: null, // current Round object
  next: null, // preloaded next Round
  used: new Set(), // words used this session
  solved: false, // has the current round been scored
};

let zoom;

// ---- home screen -----------------------------------------------------------
function initCategorySelect() {
  const sel = $("category");
  sel.innerHTML = "";
  [SURPRISE, ...CATEGORY_NAMES].forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
  const saved = store.getSettings().category;
  state.category = saved && (saved === SURPRISE || CATEGORY_NAMES.includes(saved)) ? saved : SURPRISE;
  sel.value = state.category;
  sel.addEventListener("change", () => {
    state.category = sel.value;
    store.setSetting("category", state.category);
    state.next = null; // invalidate preloaded round from old category
  });
}

function refreshHome() {
  const stats = store.getStats();
  $("home-left").textContent = store.roundsLeft();
  $("home-today").textContent = store.dailyScore().toLocaleString();
  $("home-best").textContent = stats.bestDay.toLocaleString();
  $("home-streak").textContent = stats.streak;

  const left = store.roundsLeft();
  const playBtn = $("play-btn");
  const note = $("home-note");
  if (left <= 0) {
    playBtn.textContent = "See today's results";
    note.textContent = "You've used all 5 puzzles today. Come back tomorrow!";
  } else {
    playBtn.textContent = store.roundsPlayed() > 0 ? "Continue" : "Play";
    note.textContent = `${left} puzzle${left === 1 ? "" : "s"} left today`;
  }
}

// ---- round flow ------------------------------------------------------------
async function startRound() {
  if (!store.canPlay()) {
    showDone();
    return;
  }
  show("round");
  state.solved = false;
  $("guess-input").value = "";
  $("guess-input").disabled = true;
  $("viewport-loading").style.display = "flex";
  $("viewport-loading").textContent = "Loading a fresh puzzle…";
  hideToast();

  const n = store.roundsPlayed() + 1;
  $("round-counter").textContent = `Round ${n} / ${store.DAILY_LIMIT}`;

  let round;
  try {
    if (state.next) {
      round = state.next;
      state.next = null;
    } else {
      round = await getRound(state.category, state.used);
    }
  } catch (err) {
    $("viewport-loading").textContent = err.message || "Couldn't load an image. Tap to retry.";
    $("viewport-loading").onclick = () => startRound();
    return;
  }

  state.round = round;
  state.used.add(round.word);
  store.logEvent("round_start", { word: round.word, category: round.category, source: round.source });
  // Debug hook (only when the page is opened with ?debug) — used for automated
  // testing; intentionally NOT exposed during normal play to avoid spoilers.
  if (location.search.includes("debug")) window.__answer = round.word;

  $("round-category").textContent = round.category;
  $("viewport-loading").style.display = "none";
  zoom.load(round.imageUrl, round.focal);
  $("guess-input").disabled = false;
  $("guess-input").focus();

  // preload the following puzzle in the background
  preloadRound(state.category, state.used).then((r) => {
    if (r) state.next = r;
  });
}

function onZoomChange(scale) {
  $("potential").textContent = potentialPoints(scale).toLocaleString();
  const frac = (scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE);
  $("zoom-fill").style.width = `${Math.round(frac * 100)}%`;
  $("zoom-out-btn").disabled = zoom.atMinZoom;
  $("zoom-in-btn").disabled = zoom.atMaxZoom;
  let txt;
  if (zoom.atMaxZoom) txt = "Max zoom · full points";
  else if (zoom.atMinZoom) txt = "Fully zoomed out · fewest points";
  else txt = `Zoom ${scale}× · ${potentialPoints(scale)} pts on the line`;
  $("zoom-level-text").textContent = txt;
}

function submitGuess(e) {
  e.preventDefault();
  if (state.solved || !state.round) return;
  const raw = $("guess-input").value.trim();
  if (!raw) return;

  const { accuracy, tier } = gradeGuess(raw, state.round, state.round.extraTokens);
  store.logEvent("guess", { word: state.round.word, guess: raw, tier, scale: zoom.scale });

  if (accuracy >= 0.7) {
    finishRound(true, tier, accuracy);
  } else if (accuracy > 0) {
    // partial/related — accept but flag it as a related hit
    finishRound(true, tier, accuracy);
  } else {
    flashToast(`Not quite — try again or zoom out.`, "miss");
    $("guess-input").select();
  }
}

function finishRound(correct, tier, accuracy) {
  state.solved = true;
  const scale = zoom.scale;
  const points = correct ? scoreFor(scale, accuracy) : 0;
  const result = {
    word: state.round.word,
    category: state.round.category,
    correct,
    tier,
    accuracy,
    points,
    scale,
  };
  store.recordRound(result);
  showResult(result);
}

function revealGiveUp() {
  if (state.solved || !state.round) return;
  store.logEvent("reveal", { word: state.round.word, scale: zoom.scale });
  finishRound(false, "none", 0);
}

// ---- result screen ---------------------------------------------------------
function showResult(result) {
  const round = state.round;
  zoom.revealFull();
  $("result-image").style.backgroundImage = `url("${round.imageUrl.replace(/"/g, "%22")}")`;

  const banner = $("result-banner");
  if (result.correct && result.tier === "exact") {
    banner.textContent = "Spot on! 🎯"; banner.className = "result-banner good";
  } else if (result.correct && result.tier === "typo") {
    banner.textContent = "Close enough! ✅"; banner.className = "result-banner good";
  } else if (result.correct) {
    banner.textContent = "In the ballpark! 👍"; banner.className = "result-banner partial";
  } else {
    banner.textContent = "The answer was…"; banner.className = "result-banner miss";
  }

  $("result-answer").textContent = round.word;
  $("result-blurb").textContent = round.blurb || "";
  animateNumber($("result-points-num"), result.points);

  let detail;
  if (!result.correct) detail = `No points this time. Source: ${round.source}.`;
  else if (result.tier === "related") detail = `Related answer at ${result.scale}× zoom → ${Math.round(result.accuracy * 100)}% credit.`;
  else detail = `Guessed at ${result.scale}× zoom. Source: ${round.source}.`;
  $("result-detail").textContent = detail;

  $("next-btn").textContent = store.canPlay() ? "Next puzzle" : "See results";
  show("result");
}

// ---- day complete ----------------------------------------------------------
function showDone() {
  const daily = store.getDaily();
  const stats = store.getStats();
  const correct = store.dailyCorrect();
  $("done-score").textContent = store.dailyScore().toLocaleString();
  $("done-correct").textContent = `${correct}/${daily.results.length}`;
  $("done-best").textContent = stats.bestDay.toLocaleString();
  $("done-streak").textContent = stats.streak;
  $("done-strip").textContent = daily.results
    .map((r) => (!r.correct ? "⚪" : (r.tier === "related" || r.tier === "close") ? "🟠" : r.scale >= 6 ? "🟢" : "🟡"))
    .join(" ");
  $("done-sub").textContent = correct === daily.results.length
    ? "Perfect run — you guessed them all!"
    : "Nice work today.";
  show("done");
}

// ---- misc UI ---------------------------------------------------------------
let toastTimer;
function flashToast(msg, kind = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 2000);
}
function hideToast() {
  $("toast").className = "toast";
}

function animateNumber(el, target) {
  const start = performance.now();
  const dur = 600;
  function frame(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---- wire up ---------------------------------------------------------------
function init() {
  zoom = new ZoomView($("viewport"), onZoomChange);
  initCategorySelect();
  refreshHome();

  $("play-btn").addEventListener("click", () => {
    if (store.canPlay()) startRound();
    else showDone();
  });
  $("quit-btn").addEventListener("click", () => { refreshHome(); show("home"); });
  $("zoom-out-btn").addEventListener("click", () => zoom.zoomOut());
  $("zoom-in-btn").addEventListener("click", () => zoom.zoomIn());
  $("guess-form").addEventListener("submit", submitGuess);
  $("reveal-btn").addEventListener("click", revealGiveUp);
  $("next-btn").addEventListener("click", () => {
    if (store.canPlay()) startRound();
    else showDone();
  });
  $("done-home-btn").addEventListener("click", () => { refreshHome(); show("home"); });
  $("share-btn").addEventListener("click", async () => {
    const res = await shareResult(store.getDaily());
    if (res === "copied") flashToast("Score copied to clipboard!", "good");
    else if (res === "shared") flashToast("Shared!", "good");
    else flashToast("Couldn't share — copy manually.", "miss");
  });

  // keyboard: zoom with arrow keys during a round
  document.addEventListener("keydown", (e) => {
    if (!screens.round.classList.contains("active")) return;
    if (document.activeElement === $("guess-input")) return;
    if (e.key === "-" || e.key === "ArrowDown") zoom.zoomOut();
    if (e.key === "+" || e.key === "=" || e.key === "ArrowUp") zoom.zoomIn();
  });
}

document.addEventListener("DOMContentLoaded", init);

// expose a tiny harness for console/manual testing
window.Zoomy = { store, gradeGuess, scoreFor, buildShareText };
