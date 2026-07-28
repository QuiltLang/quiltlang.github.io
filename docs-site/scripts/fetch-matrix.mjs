// Copy the generated language support matrix out of the quilt repo into
// src/data/, where the landing page imports it.
//
// The matrix is produced by `bin/gen-matrix` in QuiltLang/quilt from the
// capability specs in `conformance/spec/*.toml`, and every claim in it is
// verified against the implementation by that repo's CI (`bin/check-matrix`).
// Copying rather than vendoring keeps a single source of truth: the table on
// this site cannot drift from what quilt actually tests, because it is not
// maintained here at all. See QuiltLang/quilt#144.
//
// The quilt checkout defaults to the sibling directory the deploy workflow
// already creates for the wiki docs (docusaurus.config.ts reads
// ../../quilt/docs/wiki). Override with QUILT_REPO, matching the QUILT env var
// the workflow already uses to point at a pinned expander.
//
//   node scripts/fetch-matrix.mjs
//   QUILT_REPO=/path/to/quilt node scripts/fetch-matrix.mjs

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");

const quiltRepo = process.env.QUILT_REPO
  ? resolve(process.env.QUILT_REPO)
  : resolve(siteRoot, "..", "..", "quilt");

const src = join(quiltRepo, "conformance", "support-matrix.json");
const destDir = join(siteRoot, "src", "data");
const dest = join(destDir, "support-matrix.json");

if (!existsSync(src)) {
  console.error(`
fetch-matrix: no support matrix at
  ${src}

The landing page's language table is generated from it, so the build cannot
continue without it. Either:

  * check out QuiltLang/quilt as a sibling of this repo (what the deploy
    workflow does), or
  * point QUILT_REPO at an existing checkout:
      QUILT_REPO=/path/to/quilt npm run build

If the checkout exists but the file does not, the matrix predates
QuiltLang/quilt#144 — run 'bin/gen-matrix' in that repo.
`);
  process.exit(1);
}

// Parse before copying so a malformed matrix fails here, with a clear message,
// rather than as an opaque error inside the bundler.
const matrix = JSON.parse(readFileSync(src, "utf8"));
if (!Array.isArray(matrix.rows) || matrix.rows.length === 0) {
  console.error(`fetch-matrix: ${src} has no rows`);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);

const cells = matrix.rows.reduce((n, r) => n + r.cells.length, 0);
const verified = matrix.rows.reduce(
  (n, r) => n + r.cells.filter((c) => c.verified_by).length,
  0,
);
console.log(
  `fetch-matrix: ${matrix.rows.length} languages, ${cells} cells ` +
    `(${verified} probe-verified) → src/data/support-matrix.json`,
);
