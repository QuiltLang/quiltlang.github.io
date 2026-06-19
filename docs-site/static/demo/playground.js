// In-browser staged demo: a self-specializing live dashboard — TypeScript that
// writes TypeScript that writes HTML, the same three-stage idea as
// examples/staged_pow.py.quilt, all client-side:
//
//   source ──(wasi-shim + quilt-expand.wasm)──▶ Stage 1: makeRenderer (TS)
//   makeRenderer(schema) ──(↓ reduce: re-expand + eval)──▶ Stage 2: render (TS)
//   render(values) ──(called every second)──────────────▶ Stage 3: HTML
//
// `quilt-expand.wasm` is the Quilt parser+expander (wasm32-wasip1); the runtime
// is `quilt-wasm` (wasm32-unknown-unknown). The `↓` operator (reduce) runs a
// generated stage; the runtime has no reduce of its own (it must re-expand, and
// the expander is a separate WASI module), so quilt-rt.js adds it in JS —
// coparse → expand → eval — and we register the page's expander into it.
//
// The UI mirrors the nanobots browser demo: a split-pane oneDark CodeMirror 6
// editor on the right (with the generated render() toggled in as a read-only
// view) and the live dashboard on the left, driven by a bottom bar with status.

import initRuntime, { setExpander, reduceTrace, clearReduceTrace } from "quilt";
import { WASI } from "./wasi-shim.js";

const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();
const dec = new TextDecoder();

const CHAIN = ["ts", "html"]; // .html.ts: ground TypeScript, quotes default to HTML

let expanderModule;       // compiled WebAssembly.Module for the expander
let editorView;           // editable `.html.ts.quilt` source (cm6)
let stage2View = null;    // read-only generated render() (cm6), created lazily
let stage2Visible = false; // is the generated-render view showing?
let autoRun = true;        // re-expand & restage on edit?
let lastStage2 = "// press Run to stage";

let demo;   // imported Stage-1 module (makeRenderer, schema, opts)
let schema; // active layout (Reconfigure mutates this)
let render; // current Stage-3 render(values) → HTML term
let sim = {}; // simulated live readings, per metric key
let timer = null; // once-a-second tick
let ticks = 0;

function setStatus(cls, msg) {
  const el = $("compile-status");
  el.className = cls;
  el.textContent = msg;
  el.title = msg;
}

// Run the expander wasm once: stdin = source, argv = chain, returns stdout.
function expand(source) {
  const wasi = new WASI({ args: ["quilt-expand", ...CHAIN], stdin: enc.encode(source) });
  const instance = new WebAssembly.Instance(expanderModule, { wasi_snapshot_preview1: wasi.wasiImport });
  const code = wasi.start(instance);
  if (code !== 0) throw new Error(dec.decode(wasi.stderrBytes) || `expander exited ${code}`);
  return dec.decode(wasi.stdoutBytes);
}

// Import expanded Stage-1 TypeScript as a module. Its bare `quilt` import
// resolves through the page import map to quilt-rt.js (runtime + reduce).
async function importModule(tsSource) {
  const url = URL.createObjectURL(new Blob([tsSource], { type: "text/javascript" }));
  try {
    return await import(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function previewDoc(fragment) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">` +
    `<link rel="stylesheet" href="./theme.css"></head><body class="preview">${fragment}</body></html>`;
}

// Push the latest generated render() into the read-only view, but only while it
// is visible (mirrors how nanobots manages its GPU-shader view).
function refreshStage2() {
  if (!stage2Visible) return;
  if (!stage2View) {
    stage2View = window.cm6.createReadonlyView(lastStage2, $("expanded-editor"));
  } else {
    stage2View.dispatch({ changes: { from: 0, to: stage2View.state.doc.length, insert: lastStage2 } });
  }
}

// A gentle random walk so the bars move like real telemetry.
function stepSim() {
  for (const m of schema) {
    const v = sim[m.key] ?? m.max * 0.4;
    const next = v + (Math.random() - 0.5) * m.max * 0.35;
    sim[m.key] = Math.max(0, Math.min(m.max, Math.round(next * 10) / 10));
  }
}

// Stage 3, once a second: just call render() with fresh readings. No expansion.
function tick() {
  stepSim();
  const t0 = performance.now();
  const html = render(sim).coparse();
  const ms = performance.now() - t0;
  $("preview").srcdoc = previewDoc(html);
  ticks++;
  setStatus("ok", `live · tick #${ticks} · render() ${ms.toFixed(2)} ms (no expansion)`);
}

// Stage 1 → Stage 2: the expensive step. makeRenderer() unrolls the schema and
// reduces (↓) it to a render function — a pass through the wasm expander.
function restage() {
  clearReduceTrace();
  const t0 = performance.now();
  render = demo.makeRenderer(schema, demo.opts);
  const ms = performance.now() - t0;
  lastStage2 = reduceTrace.length ? reduceTrace[reduceTrace.length - 1].generated : "// (no reduce ran)";
  refreshStage2();
  tick();
  setStatus("ok", `restaged ${schema.length} gauges in ${ms.toFixed(1)} ms · ${reduceTrace.length} expansion(s)`);
}

// Reconfigure = a user interaction that triggers the expensive outer loop:
// shuffle and drop/add metrics, then rerun Stage 1.
function reconfigure() {
  if (!demo) return;
  const all = demo.schema;
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  const n = 2 + Math.floor(Math.random() * (all.length - 1));
  schema = shuffled.slice(0, n);
  sim = {};
  restage();
  if (!timer) timer = setInterval(tick, 1000);
}

async function expandAndRun() {
  $("btn-run").disabled = true;
  if (timer) { clearInterval(timer); timer = null; }
  try {
    setStatus("busy", "Expanding Stage 1…");
    const ts = expand(editorView.state.doc.toString());
    setStatus("busy", "Staging…");
    demo = await importModule(ts);
    if (typeof demo.makeRenderer !== "function") throw new Error("source must export makeRenderer()");
    schema = [...demo.schema];
    sim = {};
    ticks = 0;
    restage();
    timer = setInterval(tick, 1000);
  } catch (e) {
    setStatus("err", "✗ " + (e.message || e));
  } finally {
    $("btn-run").disabled = false;
  }
}

// ── Toggle: swap the editable source for the generated render() ───────────────
function setupStage2Toggle() {
  const btn = $("btn-ts");
  btn.onclick = () => {
    stage2Visible = !stage2Visible;
    btn.classList.toggle("active", stage2Visible);
    if (stage2Visible) {
      $("cm-editor").style.display = "none";
      $("expanded-editor").style.display = "flex";
      refreshStage2();
    } else {
      $("cm-editor").style.display = "";
      $("expanded-editor").style.display = "none";
    }
  };
}

// ── Auto-run: re-expand & restage a short while after the source settles ──────
function setupAuto() {
  const btn = $("btn-auto");
  btn.onclick = () => {
    autoRun = !autoRun;
    btn.classList.toggle("active", autoRun);
  };

  let lastSource = editorView.state.doc.toString();
  let editTimer = null;
  setInterval(() => {
    const cur = editorView.state.doc.toString();
    if (cur === lastSource) return;
    lastSource = cur;
    if (!autoRun) return;
    clearTimeout(editTimer);
    setStatus("busy", "Editing…");
    editTimer = setTimeout(expandAndRun, 600);
  }, 200);
}

// ── Arrow-glyph buttons + keyboard chords (same scheme as the VS Code ext) ────
function insertGlyph(open, close = "") {
  const sel = editorView.state.selection.main;
  const selected = editorView.state.sliceDoc(sel.from, sel.to);
  const anchor = close ? sel.from + open.length : sel.from + open.length + selected.length;
  const head = close ? anchor + selected.length : anchor;
  editorView.dispatch({
    changes: { from: sel.from, to: sel.to, insert: open + selected + close },
    selection: { anchor, head },
  });
  editorView.focus();
}

const DIR = { ArrowLeft: "L", KeyH: "L", ArrowRight: "R", KeyL: "R", ArrowUp: "U", KeyK: "U", ArrowDown: "D", KeyJ: "D" };
const SINGLE = { L: "←", R: "→", U: "↑", D: "↓", Comma: "⟨", Period: "⟩", KeyT: "⟨T⟩", KeyN: "⟨N⟩" };
const DIAG = {
  UL: "↖", LU: "↖", UR: "↗", RU: "↗", DL: "↙", LD: "↙", DR: "↘", RD: "↘",
  LR: "↔", RL: "↔", UD: "↕", DU: "↕", UU: "↑", DD: "↓", LL: "←", RR: "→",
};
let chord = null, chordTimer = null;
function resetChord() { chord = null; clearTimeout(chordTimer); }
function armChord(c) { chord = c; clearTimeout(chordTimer); chordTimer = setTimeout(resetChord, 1500); }

function setupGlyphs() {
  $("glyphs").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    if (btn.dataset.wrap) { const [o, c] = [...btn.dataset.wrap]; insertGlyph(o, c); }
    else if (btn.dataset.ins) insertGlyph(btn.dataset.ins);
  });

  editorView.dom.addEventListener("keydown", (ev) => {
    const eat = () => { ev.preventDefault(); ev.stopPropagation(); };
    if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") { eat(); resetChord(); expandAndRun(); return; }
    if ((ev.metaKey || ev.ctrlKey) && ev.code === "Digit1") { eat(); armChord("1"); return; }
    if ((ev.metaKey || ev.ctrlKey) && ev.code === "Digit2") { eat(); armChord("2"); return; }
    if (chord === "1") {
      const g = SINGLE[DIR[ev.code] || ev.code];
      if (g) { eat(); insertGlyph(g); }
      resetChord();
      return;
    }
    if (chord === "2") {
      const d = DIR[ev.code];
      if (d) { eat(); armChord("2:" + d); } else resetChord();
      return;
    }
    if (chord?.startsWith("2:")) {
      const d2 = DIR[ev.code];
      if (d2 && DIAG[chord.slice(2) + d2]) { eat(); insertGlyph(DIAG[chord.slice(2) + d2]); }
      resetChord();
    }
  }, true);
}

// ── Resize handle (adapted from the nanobots demo) ────────────────────────────
function setupResize() {
  const handle = $("resize-handle");
  const edPane = $("editor-pane");
  const prevPane = $("preview-pane");
  let dragging = false, startPos = 0, startSize = 0;
  const portrait = () => window.innerHeight > window.innerWidth;

  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    if (portrait()) { startPos = e.clientY; startSize = prevPane.offsetHeight; }
    else            { startPos = e.clientX; startSize = edPane.offsetWidth; }
    handle.classList.add("dragging");
    document.body.style.userSelect = "none";
  });
  handle.addEventListener("touchstart", (e) => {
    dragging = true;
    const t = e.touches[0];
    if (portrait()) { startPos = t.clientY; startSize = prevPane.offsetHeight; }
    else            { startPos = t.clientX; startSize = edPane.offsetWidth; }
    handle.classList.add("dragging");
  }, { passive: true });

  function onMove(x, y) {
    if (!dragging) return;
    if (portrait()) prevPane.style.height = Math.max(80, startSize + (y - startPos)) + "px";
    else            edPane.style.width    = Math.max(220, startSize - (x - startPos)) + "px";
  }
  window.addEventListener("resize", () => {
    if (portrait()) edPane.style.width = ""; else prevPane.style.height = "";
  });
  document.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  document.addEventListener("touchmove",  (e) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); }, { passive: true });
  const onUp = () => { dragging = false; handle.classList.remove("dragging"); document.body.style.userSelect = ""; };
  document.addEventListener("mouseup",  onUp);
  document.addEventListener("touchend", onUp);
}

async function main() {
  setStatus("busy", "Loading WebAssembly…");

  const [src, , expanderBytes] = await Promise.all([
    fetch("./dashboard.html.ts.quilt").then((r) => r.text()),
    initRuntime(),
    fetch("./quilt-expand.wasm").then((r) => r.arrayBuffer()),
  ]);
  expanderModule = await WebAssembly.compile(expanderBytes);
  setExpander(expand); // so `term.reduce()` (↓) can re-expand generated stages

  editorView = window.cm6.createEditorView(
    window.cm6.createEditorState(src, { oneDark: true }),
    $("cm-editor"),
  );

  $("btn-run").onclick = expandAndRun;
  $("btn-reconfig").onclick = reconfigure;
  setupStage2Toggle();
  setupAuto();
  setupResize();
  setupGlyphs();

  setStatus("ok", "Ready");
  expandAndRun(); // stage + start ticking immediately
}

main().catch((e) => setStatus("err", "✗ " + (e.message || e)));
