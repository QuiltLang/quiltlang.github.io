// In-browser meta-meta demo (issue #47): expand `.html.ts.quilt` source live,
// then run the expansion — all client-side.
//
//   source --(WASI shim + quilt-expand.wasm)--> TypeScript --(import + runtime)--> HTML
//
// `quilt-expand.wasm` is the Quilt parser+expander (wasm32-wasip1); the runtime
// is the same `quilt-wasm` (wasm32-unknown-unknown) used by the ahead-of-time
// demo. Both are WebAssembly; only the expander needs WASI (it links the C
// grammars), so it runs through the small hand-rolled shim in wasi-shim.js.
//
// The UI mirrors the nanobots browser demo: a split-pane oneDark CodeMirror 6
// editor on the right (with the expanded TypeScript toggled in as a read-only
// view, like nanobots' GPU-shader toggle) and the rendered HTML on the left,
// driven by a bottom compile bar with ok/err/busy status.

import initRuntime from "quilt";
import { WASI } from "./wasi-shim.js";

const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();
const dec = new TextDecoder();

const CHAIN = ["ts", "html"]; // .html.ts: ground TypeScript, quotes default to HTML

let expanderModule;       // compiled WebAssembly.Module for the expander
let editorView;           // editable `.html.ts.quilt` source (cm6)
let expandedView = null;  // read-only expanded TypeScript (cm6), created lazily
let tsVisible = false;     // is the expanded-TS view showing?
let autoRun = true;        // re-expand & run on edit?
let lastExpanded = "// press Run to expand";

function setStatus(cls, msg) {
  const el = $("compile-status");
  el.className = cls;
  el.textContent = msg;
  el.title = msg; // full text on hover, since the bar truncates
}

// Run the expander wasm once: stdin = source, argv = chain, returns stdout.
function expand(source) {
  const wasi = new WASI({ args: ["quilt-expand", ...CHAIN], stdin: enc.encode(source) });
  const instance = new WebAssembly.Instance(expanderModule, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });
  const code = wasi.start(instance);
  if (code !== 0) {
    throw new Error(dec.decode(wasi.stderrBytes) || `expander exited ${code}`);
  }
  return dec.decode(wasi.stdoutBytes);
}

// Import the expanded TypeScript as a module, call its render() to get a Quilt
// term, then coparse() it here (the harness) into an HTML string. The blob
// module's bare `quilt` import resolves through the page import map to the
// already-initialised runtime, so it shares the same wasm instance.
async function run(tsSource) {
  const url = URL.createObjectURL(new Blob([tsSource], { type: "text/javascript" }));
  try {
    const mod = await import(url);
    if (typeof mod.render !== "function") {
      throw new Error("expanded program does not export render()");
    }
    return mod.render().coparse();
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Wrap a rendered HTML fragment in a minimal document that links the shared
// site theme by a relative href, so the preview is styled like the rest of the
// site without inlining any CSS here.
function previewDoc(fragment) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">` +
    `<link rel="stylesheet" href="./theme.css"></head><body>${fragment}</body></html>`;
}

// Push the latest expansion into the read-only view, but only build/refresh it
// while it is visible (mirrors how nanobots manages its GPU-shader view).
function refreshExpanded() {
  if (!tsVisible) return;
  if (!expandedView) {
    expandedView = window.cm6.createReadonlyView(lastExpanded, $("expanded-editor"));
  } else {
    expandedView.dispatch({
      changes: { from: 0, to: expandedView.state.doc.length, insert: lastExpanded },
    });
  }
}

async function expandAndRun() {
  $("btn-run").disabled = true;
  try {
    setStatus("busy", "Expanding…");
    lastExpanded = expand(editorView.state.doc.toString());
    refreshExpanded();
    setStatus("busy", "Running…");
    const html = await run(lastExpanded);
    $("preview").srcdoc = previewDoc(html);
    setStatus("ok", "Compiled OK");
  } catch (e) {
    setStatus("err", "✗ " + (e.message || e));
  } finally {
    $("btn-run").disabled = false;
  }
}

// ── TS toggle: swap the editable source for the read-only expansion ───────────
function setupTsToggle() {
  const btn = $("btn-ts");
  btn.onclick = () => {
    tsVisible = !tsVisible;
    btn.classList.toggle("active", tsVisible);
    if (tsVisible) {
      $("cm-editor").style.display = "none";
      $("expanded-editor").style.display = "flex";
      refreshExpanded();
    } else {
      $("cm-editor").style.display = "";
      $("expanded-editor").style.display = "none";
    }
  };
}

// ── Auto-run: re-expand & run a short while after the source settles ───────────
function setupAuto() {
  const btn = $("btn-auto");
  btn.onclick = () => {
    autoRun = !autoRun;
    btn.classList.toggle("active", autoRun);
  };

  let lastSource = editorView.state.doc.toString();
  let timer = null;
  setInterval(() => {
    const cur = editorView.state.doc.toString();
    if (cur === lastSource) return;
    lastSource = cur;
    if (!autoRun) return;
    clearTimeout(timer);
    setStatus("busy", "Editing…");
    timer = setTimeout(expandAndRun, 600);
  }, 200);
}

// ── Arrow-glyph buttons + keyboard chords ─────────────────────────────────────
// The arrow glyphs can't be typed, so the buttons insert them (wrapping the
// selection for the bracket pairs), and the keyboard uses the same chord scheme
// as the VS Code extension (tools/quilt): leader ⌘/Ctrl+1 then a direction
// (arrows or vim h/j/k/l) for a single glyph; leader ⌘/Ctrl+2 then two
// directions for the diagonal that combines them.
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
let chord = null, chordTimer = null; // null | "1" | "2" | "2:<dir>"
function resetChord() { chord = null; clearTimeout(chordTimer); }
function armChord(c) { chord = c; clearTimeout(chordTimer); chordTimer = setTimeout(resetChord, 1500); }

function setupGlyphs() {
  $("glyphs").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    if (btn.dataset.wrap) { const [o, c] = [...btn.dataset.wrap]; insertGlyph(o, c); }
    else if (btn.dataset.ins) insertGlyph(btn.dataset.ins);
  });

  // Capture phase on the editor so an active chord pre-empts CodeMirror's own
  // arrow-key handling; stopPropagation keeps the chord keys out of the editor.
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

  // Load the default source, the runtime, and the expander in parallel.
  const [src, , expanderBytes] = await Promise.all([
    fetch("./cards.html.ts.quilt").then((r) => r.text()),
    initRuntime(),
    fetch("./quilt-expand.wasm").then((r) => r.arrayBuffer()),
  ]);
  expanderModule = await WebAssembly.compile(expanderBytes);

  editorView = window.cm6.createEditorView(
    window.cm6.createEditorState(src, { oneDark: true }),
    $("cm-editor"),
  );

  $("btn-run").onclick = expandAndRun;
  setupTsToggle();
  setupAuto();
  setupResize();
  setupGlyphs();

  setStatus("ok", "Ready");
  expandAndRun(); // show output immediately
}

main().catch((e) => setStatus("err", "✗ " + (e.message || e)));
