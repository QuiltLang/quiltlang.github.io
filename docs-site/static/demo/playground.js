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

// Import the expanded TypeScript as a module and call its render(). The blob
// module's bare `quilt` import resolves through the page import map to the
// already-initialised runtime, so it shares the same wasm instance.
async function run(tsSource) {
  const url = URL.createObjectURL(new Blob([tsSource], { type: "text/javascript" }));
  try {
    const mod = await import(url);
    if (typeof mod.render !== "function") {
      throw new Error("expanded program does not export render()");
    }
    return mod.render();
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Wrap a rendered HTML fragment in a minimal document so the preview iframe
// styles the cards like the ahead-of-time demo.
function previewDoc(fragment) {
  return `<!DOCTYPE html><meta charset="utf-8"><style>
    body { font-family: system-ui, sans-serif; margin: 1rem; color: #222; background: #fff; }
    .cards { display: grid; gap: 1rem; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 1rem 1.25rem; }
    .card h2 { font-size: 1.05rem; margin: 0 0 .4rem; }
    .card p { margin: 0; color: #444; }
  </style>${fragment}`;
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

  setStatus("ok", "Ready");
  expandAndRun(); // show output immediately
}

main().catch((e) => setStatus("err", "✗ " + (e.message || e)));
