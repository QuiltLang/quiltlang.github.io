// Render social-sharing cards (Open Graph / LinkedIn / X images): one for the
// site as a whole (static/img/social-card.png, the default og:image for every
// page) and one for every release page in the quilt repo.
//
// Each release has its own page, quilt/docs/wiki/releases/vX.Y.Z.md, so each
// has its own URL and its own og:image. The page's front matter names the
// image and supplies what goes on it:
//
//   ---
//   title: Quilt v0.6.0
//   sidebar_label: v0.6.0
//   description: One sentence; also used as the link preview text.
//   image: /img/releases/v0.6.0.png        # must be exactly this path
//   card:
//     date: 2026-11-21
//     headline: Lean, SQL & Nix · machines · live notebooks
//     highlights: [Lean 4, SQL, Nix, Notebooks, Hand-written parser]
//   ---
//
// This script reads those pages and writes static/img/releases/<version>.png
// (1200×630, the size LinkedIn, X and Slack all crop to). It runs on npm
// prestart/prebuild, like fetch-matrix.mjs, so the images are build output and
// not committed: adding a release page is all it takes to get a card.
//
// Quilt's glyph arrows (↖↗↙↘↑↓←) are not in the subset fonts, so text runs
// containing them are split and the arrows drawn as SVG in their glyph colours.
//
//   node scripts/release-cards.mjs
//   QUILT_REPO=/path/to/quilt node scripts/release-cards.mjs

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const quiltRepo = process.env.QUILT_REPO
  ? resolve(process.env.QUILT_REPO)
  : resolve(siteRoot, "..", "..", "quilt");
const releasesDir = join(quiltRepo, "docs", "wiki", "releases");
const outDir = join(siteRoot, "static", "img", "releases");

const W = 1200;
const H = 630;

// Site palette (static/runtime/theme.css).
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#30363d",
  text: "#c9d1d9",
  heading: "#f0f6fc",
  muted: "#8b949e",
  orange: "#f97316",
};
// Glyph → [rotation in degrees from "up", colour].
const GLYPHS = {
  "↖": [-45, "#f97316"], // quote
  "↗": [45, "#f97316"],
  "↙": [-135, "#60a5fa"], // unquote
  "↘": [135, "#60a5fa"],
  "↑": [0, "#facc15"], // lift
  "↓": [180, "#c084fc"], // reduce
  "←": [-90, "#34d399"], // emit
};
const GLYPH_RE = /([↖↗↙↘↑↓←])/u;

const font = (pkg, file) =>
  readFileSync(join(siteRoot, "node_modules", "@fontsource", pkg, "files", file));
const fonts = [
  { name: "Inter", weight: 500, data: font("inter", "inter-latin-500-normal.woff") },
  { name: "Inter", weight: 700, data: font("inter", "inter-latin-700-normal.woff") },
  { name: "Mono", weight: 700, data: font("jetbrains-mono", "jetbrains-mono-latin-700-normal.woff") },
];

const logo =
  "data:image/svg+xml;base64," +
  Buffer.from(readFileSync(join(siteRoot, "static", "img", "quilt.svg"))).toString("base64");

// Minimal element constructor, so the layout reads like JSX without a compiler.
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat() },
});

function arrow(glyph, size) {
  const [deg, color] = GLYPHS[glyph];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">` +
    `<g transform="rotate(${deg} 12 12)" fill="none" stroke="${color}" stroke-width="2.6" ` +
    `stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4M5 11l7-7 7 7"/></g></svg>`;
  return {
    type: "img",
    props: {
      src: "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64"),
      width: size,
      height: size,
      style: { margin: `0 ${size * 0.05}px` },
    },
  };
}

// A run of text in which glyph arrows become drawn arrows.
function rich(text, size) {
  return String(text)
    .split(GLYPH_RE)
    .filter((s) => s !== "")
    // Each text run is its own box with whiteSpace: pre, or flex layout would
    // trim the space between a word and the arrow that follows it.
    .map((s) => (GLYPHS[s] ? arrow(s, size * 0.9) : h("div", { whiteSpace: "pre" }, s)));
}

function card({ version, date, headline, highlights }) {
  const stripe = h(
    "div",
    { width: "100%", height: 10 },
    ["#f97316", "#60a5fa", "#facc15", "#c084fc", "#34d399"].map((c) =>
      h("div", { flex: 1, height: "100%", background: c }),
    ),
  );

  const top = h(
    "div",
    { alignItems: "center", justifyContent: "space-between", width: "100%" },
    h(
      "div",
      { alignItems: "center", gap: 18 },
      { type: "img", props: { src: logo, width: 52, height: 52 } },
      h("div", { fontSize: 40, fontWeight: 700, color: C.heading, letterSpacing: -0.5 }, "Quilt"),
    ),
    h(
      "div",
      {
        fontSize: 24,
        fontWeight: 500,
        color: C.orange,
        border: `2px solid ${C.orange}`,
        borderRadius: 999,
        padding: "6px 22px",
      },
      "Release notes",
    ),
  );

  const middle = h(
    "div",
    { flexDirection: "column", gap: 18 },
    h(
      "div",
      { fontFamily: "Mono", fontSize: 132, fontWeight: 700, color: C.heading, lineHeight: 1, letterSpacing: -4 },
      version,
    ),
    headline
      ? h(
          "div",
          { fontSize: 40, fontWeight: 700, color: C.text, lineHeight: 1.25, alignItems: "center", flexWrap: "wrap" },
          rich(headline, 40),
        )
      : [],
  );

  const chips = h(
    "div",
    { flexWrap: "wrap", gap: 12 },
    (highlights ?? []).slice(0, 8).map((t) =>
      h(
        "div",
        {
          alignItems: "center",
          fontSize: 24,
          fontWeight: 500,
          color: C.text,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "8px 16px",
        },
        rich(t, 24),
      ),
    ),
  );

  const bottom = h(
    "div",
    { alignItems: "flex-end", justifyContent: "space-between", width: "100%", gap: 32 },
    h("div", { flexDirection: "column", gap: 22, flex: 1 }, chips,
      h("div", { fontSize: 24, fontWeight: 500, color: C.muted },
        ["quiltlang.github.io", date ? `  ·  ${date}` : ""].join(""))),
    h("div", { alignItems: "center" }, ["↖", "↙", "↑", "↓", "←"].map((g) => arrow(g, 44))),
  );

  return h(
    "div",
    { width: W, height: H, flexDirection: "column", background: C.bg, fontFamily: "Inter" },
    stripe,
    h(
      "div",
      { flex: 1, flexDirection: "column", justifyContent: "space-between", padding: "44px 64px 48px" },
      top,
      middle,
      bottom,
    ),
  );
}

// The site-wide card (themeConfig.image, and the landing page's own og:image):
// what Quilt is, the five glyphs, and a one-line taste of the syntax.
function siteCard() {
  const stripe = h(
    "div",
    { width: "100%", height: 10 },
    ["#f97316", "#60a5fa", "#facc15", "#c084fc", "#34d399"].map((c) =>
      h("div", { flex: 1, height: "100%", background: c }),
    ),
  );

  const top = h(
    "div",
    { alignItems: "center", justifyContent: "space-between", width: "100%" },
    h(
      "div",
      { alignItems: "center", gap: 18 },
      { type: "img", props: { src: logo, width: 52, height: 52 } },
      h("div", { fontSize: 40, fontWeight: 700, color: C.heading, letterSpacing: -0.5 }, "Quilt"),
    ),
    h("div", { fontSize: 24, fontWeight: 500, color: C.muted }, "quiltlang.github.io"),
  );

  const middle = h(
    "div",
    { flexDirection: "column", gap: 22 },
    h(
      "div",
      { flexDirection: "column", fontSize: 76, fontWeight: 700, color: C.heading, lineHeight: 1.08, letterSpacing: -2 },
      h("div", {}, "Metaprogramming"),
      h("div", { whiteSpace: "pre" }, h("div", { whiteSpace: "pre" }, "across "),
        h("div", { color: C.orange }, "every language.")),
    ),
    h(
      "div",
      { fontSize: 30, fontWeight: 500, color: C.text, lineHeight: 1.35, maxWidth: 960 },
      "Metaprograms in any language generate and manipulate code in any other, using five arrow glyphs.",
    ),
  );

  const ops = [
    ["↖", "quote"],
    ["↙", "unquote"],
    ["↑", "lift"],
    ["↓", "reduce"],
    ["←", "emit"],
  ];
  const chips = h(
    "div",
    { flexWrap: "wrap", gap: 12 },
    ops.map(([g, name]) =>
      h(
        "div",
        {
          alignItems: "center",
          gap: 8,
          fontSize: 24,
          fontWeight: 500,
          color: C.text,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "8px 16px 8px 10px",
        },
        arrow(g, 26),
        h("div", {}, name),
      ),
    ),
  );

  return h(
    "div",
    { width: W, height: H, flexDirection: "column", background: C.bg, fontFamily: "Inter" },
    stripe,
    h(
      "div",
      { flex: 1, flexDirection: "column", justifyContent: "space-between", padding: "44px 64px 48px" },
      top,
      middle,
      chips,
    ),
  );
}

async function render(node, out) {
  const svg = await satori(node, { width: W, height: H, fonts });
  writeFileSync(out, new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng());
}

await render(siteCard(), join(siteRoot, "static", "img", "social-card.png"));
console.log("release-cards: site card → static/img/social-card.png");

if (!existsSync(releasesDir)) {
  console.log(`release-cards: no ${releasesDir} — no release cards to render`);
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
const pages = readdirSync(releasesDir).filter((f) => /^v\d+\.\d+\.\d+.*\.mdx?$/.test(f));
let failed = false;
for (const file of pages) {
  const version = basename(file).replace(/\.mdx?$/, "");
  const { data: fm } = matter(readFileSync(join(releasesDir, file), "utf8"));
  const want = `/img/releases/${version}.png`;
  if (fm.image !== want) {
    console.error(`release-cards: ${file} must set 'image: ${want}' in its front matter (has ${JSON.stringify(fm.image)})`);
    failed = true;
    continue;
  }
  const c = fm.card ?? {};
  const date = c.date instanceof Date ? c.date.toISOString().slice(0, 10) : c.date;
  await render(
    card({ version, date, headline: c.headline ?? fm.description, highlights: c.highlights }),
    join(outDir, `${version}.png`),
  );
  console.log(`release-cards: ${file} → static/img/releases/${version}.png`);
}
if (failed) process.exit(1);
