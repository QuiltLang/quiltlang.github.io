// In-browser staged demo: a self-specializing live dashboard — TypeScript that
// writes TypeScript that writes HTML, all client-side:
//
//   source ──(wasi-shim + quilt-expand.wasm)──▶ Stage 1: makeRenderer (TS)
//   makeRenderer(schema) ──(↓ reduce: re-expand + eval)──▶ Stage 2: start() (TS)
//   start(setHtml, read) ──(its own baked setInterval)───▶ Stage 3: HTML, looping
//
// `quilt-expand.wasm` is the Quilt parser+expander (wasm32-wasip1); the runtime
// is `quilt-wasm` (wasm32-unknown-unknown). The `↓` operator (reduce) runs a
// generated stage; the runtime has no reduce of its own (it must re-expand, and
// the expander is a separate WASI module), so quilt-rt.js adds it in JS —
// coparse → expand → eval — and we register the page's expander into it.
//
// Stage 1 runs once and generates a start() whose own loop (interval baked in)
// paints the HTML; this page supplies the HTML sink and the readings feed.
// Split-pane UI: a oneDark CodeMirror 6 editor on the right (with the generated
// start() loop toggled in as a read-only view) and the live dashboard on the
// left, driven by a bottom bar with status.

import initRuntime, { setExpander, reduceTrace, clearReduceTrace } from "quilt";
import { WASI } from "./wasi-shim.js";

const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();
const dec = new TextDecoder();

const CHAIN = ["ts", "html"]; // .html.ts: ground TypeScript, quotes default to HTML

// The initial schema + opts shown in the config panel. It is JSONC — JSON plus
// // and /* */ comments and trailing commas (see stripJsonc) — so metrics can be
// commented out and toggled on.
const DEFAULT_CONFIG = `{
  "schema": [
    { "key": "cpu",  "label": "CPU",      "unit": "%",     "max": 100 },
    { "key": "mem",  "label": "Memory",   "unit": "%",     "max": 100 },
    { "key": "net",  "label": "Network",  "unit": " MB/s", "max": 50 },
    { "key": "disk", "label": "Disk I/O", "unit": " MB/s", "max": 40 },
    { "key": "gpu",  "label": "GPU",      "unit": "%",     "max": 100 },
    // Uncomment a metric to regenerate the dashboard with it:
    // { "key": "temp", "label": "Temp", "unit": "°C", "max": 90 },
    // { "key": "load", "label": "Load", "unit": "",   "max": 8 },
  ],
  "opts": { "width": 32, "intervalMs": 1000, "title": "host-01 · live" },
}`;

let expanderModule;       // compiled WebAssembly.Module for the expander
let editorView;           // editable `.html.ts.quilt` source (cm6)
let configView;           // editable schema + opts JSON (cm6)
let stage2View = null;    // read-only generated start() loop (cm6), created lazily
let stage2Visible = false; // is the generated start()-loop view showing?
let autoRun = true;        // re-expand & restage on edit?
let lastStage2 = "// press Run to stage";

let demo;   // imported Stage-1 module (just makeRenderer now)
let fullSchema = []; // the schema parsed from the config panel
let schema = []; // active layout (Reconfigure may use a subset of fullSchema)
let opts = {}; // the opts parsed from the config panel
let stopLoop = null; // interval id returned by the generated loop (to stop it)
let sim = {}; // simulated live readings, per metric key
let frames = 0;

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

// Push the latest generated start() loop into the read-only view, but only build or
// refresh it while it is visible.
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

// The generated loop calls read() each frame for fresh readings, and setHtml()
// with the HTML it built. The loop and its interval are codegened now, not here.
function read() {
  stepSim();
  return sim;
}
function setHtml(html) {
  $("preview").srcdoc = previewDoc(html);
  frames++;
  setStatus("ok", `live · frame #${frames} · the loop is codegened`);
}

// Tolerate // and /* */ comments and trailing commas (JSONC), returning plain
// JSON for JSON.parse. String-aware, so it never touches // or commas that sit
// inside string values.
function stripJsonc(s) {
  let out = "", inStr = false, esc = false, i = 0;
  const n = s.length;
  while (i < n) {
    const c = s[i];
    if (inStr) {
      out += c;
      if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false;
      i++;
    } else if (c === '"') { inStr = true; out += c; i++; }
    else if (c === "/" && s[i + 1] === "/") { i += 2; while (i < n && s[i] !== "\n") i++; }
    else if (c === "/" && s[i + 1] === "*") { i += 2; while (i < n && !(s[i] === "*" && s[i + 1] === "/")) i++; i += 2; }
    else if (c === ",") {
      // Drop the comma if the next token (past whitespace/comments) closes a
      // list or object — i.e. it is a trailing comma.
      let j = i + 1;
      for (;;) {
        while (j < n && /\s/.test(s[j])) j++;
        if (s[j] === "/" && s[j + 1] === "/") { j += 2; while (j < n && s[j] !== "\n") j++; }
        else if (s[j] === "/" && s[j + 1] === "*") { j += 2; while (j < n && !(s[j] === "*" && s[j + 1] === "/")) j++; j += 2; }
        else break;
      }
      if (s[j] === "}" || s[j] === "]") i++; else { out += c; i++; }
    } else { out += c; i++; }
  }
  return out;
}

// Parse the config panel (JSONC: { schema, opts }) into values.
function parseConfig() {
  const { schema: s, opts: o } = JSON.parse(stripJsonc(configView.state.doc.toString()));
  if (!Array.isArray(s) || !s.length) throw new Error("`schema` must be a non-empty array");
  if (!o || typeof o !== "object") throw new Error("`opts` must be an object");
  return { schema: s, opts: o };
}

// Read the config panel and (re)stage. Called on load, on config edits, and
// after the source is re-expanded.
function loadConfig() {
  if (!demo) return;
  let parsed;
  try {
    parsed = parseConfig();
    $("config-editor").classList.remove("err");
  } catch (e) {
    $("config-editor").classList.add("err");
    setStatus("err", "✗ config JSON: " + (e.message || e));
    return;
  }
  fullSchema = parsed.schema;
  opts = parsed.opts;
  schema = fullSchema;
  sim = {};
  restage();
}

// Stage 1 → Stage 2: the expensive step, run once. makeRenderer() unrolls the
// schema and reduces (↓) to a start() that owns its own update loop. Stop any
// previous loop, stage the new one, and let it drive the preview.
function restage() {
  if (stopLoop != null) { clearInterval(stopLoop); stopLoop = null; }
  clearReduceTrace();
  const t0 = performance.now();
  const start = demo.makeRenderer(schema, opts);
  const ms = performance.now() - t0;
  lastStage2 = reduceTrace.length ? reduceTrace[reduceTrace.length - 1].generated : "// (no reduce ran)";
  refreshStage2();
  frames = 0;
  stopLoop = start(setHtml, read); // the GENERATED loop now drives updates
  setStatus("ok", `staged ${schema.length} gauges in ${ms.toFixed(1)} ms · loop @ ${opts.intervalMs} ms baked in`);
}

// Reconfigure = a user interaction that restages with a shuffled subset of the
// metrics from the config panel.
function reconfigure() {
  if (!demo || !fullSchema.length) return;
  const shuffled = [...fullSchema].sort(() => Math.random() - 0.5);
  const n = 2 + Math.floor(Math.random() * Math.max(1, fullSchema.length - 1));
  schema = shuffled.slice(0, n);
  sim = {};
  restage();
}

async function expandAndRun() {
  $("btn-run").disabled = true;
  if (stopLoop != null) { clearInterval(stopLoop); stopLoop = null; }
  try {
    setStatus("busy", "Expanding Stage 1…");
    const ts = expand(editorView.state.doc.toString());
    setStatus("busy", "Staging…");
    demo = await importModule(ts);
    if (typeof demo.makeRenderer !== "function") throw new Error("source must export makeRenderer()");
    loadConfig(); // read the config panel and stage
  } catch (e) {
    setStatus("err", "✗ " + (e.message || e));
  } finally {
    $("btn-run").disabled = false;
  }
}

// ── Toggle: swap the editable source for the generated start() loop ───────────────
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

// ── Config panel: regenerate the TypeScript a short while after edits settle ──
function setupConfig() {
  let last = configView.state.doc.toString();
  let cfgTimer = null;
  setInterval(() => {
    const cur = configView.state.doc.toString();
    if (cur === last) return;
    last = cur;
    clearTimeout(cfgTimer);
    setStatus("busy", "Editing config…");
    cfgTimer = setTimeout(loadConfig, 500);
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

// ── Resize handle ─────────────────────────────────────────────────────────────
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
    // While dragging, let pointer events pass through the preview iframe —
    // otherwise moving left over it swallows mousemove and the drag stops
    // (the "can only drag right" bug).
    $("preview").style.pointerEvents = "none";
  });
  handle.addEventListener("touchstart", (e) => {
    dragging = true;
    const t = e.touches[0];
    if (portrait()) { startPos = t.clientY; startSize = prevPane.offsetHeight; }
    else            { startPos = t.clientX; startSize = edPane.offsetWidth; }
    handle.classList.add("dragging");
    $("preview").style.pointerEvents = "none";
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
  const onUp = () => { dragging = false; handle.classList.remove("dragging"); document.body.style.userSelect = ""; $("preview").style.pointerEvents = ""; };
  document.addEventListener("mouseup",  onUp);
  document.addEventListener("touchend", onUp);
}

async function main() {
  setStatus("busy", "Loading WebAssembly…");

  const [src, , expanderBytes] = await Promise.all([
    fetch("./dashboard.html.ts.ts.quilt").then((r) => r.text()),
    initRuntime(),
    fetch("./quilt-expand.wasm").then((r) => r.arrayBuffer()),
  ]);
  expanderModule = await WebAssembly.compile(expanderBytes);
  setExpander(expand); // so `term.reduce()` (↓) can re-expand generated stages

  editorView = window.cm6.createEditorView(
    window.cm6.createEditorState(src, { oneDark: true }),
    $("cm-editor"),
  );
  configView = window.cm6.createEditorView(
    window.cm6.createEditorState(DEFAULT_CONFIG, { oneDark: true }),
    $("config-editor"),
  );

  $("btn-run").onclick = expandAndRun;
  $("btn-reconfig").onclick = reconfigure;
  setupStage2Toggle();
  setupAuto();
  setupConfig();
  setupResize();
  setupGlyphs();

  setStatus("ok", "Ready");
  expandAndRun(); // stage + start ticking immediately
}

main().catch((e) => setStatus("err", "✗ " + (e.message || e)));
