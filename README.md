# quiltlang.github.io

Source for the [QuiltLang](https://quiltlang.github.io) website, built with [Docusaurus](https://docusaurus.io).

The docs pages are pulled directly from the wiki in the [`quilt`](https://github.com/QuiltLang/quilt) repo. Both repos must be checked out **side by side** under the same parent directory.

## Local setup

```sh
# Check out both repos as siblings
mkdir QuiltLang && cd QuiltLang
git clone https://github.com/QuiltLang/quiltlang.github.io
git clone https://github.com/QuiltLang/quilt

# Install dependencies (first run) and start the dev server
quiltlang.github.io/bin/main
```

The site is served at `http://localhost:3000`. `bin/main` also stages a sibling
`nanobots/build/` (from `nanobots/bin/build`), if present, at `/nanobots/`; extra
arguments go to `docusaurus start` (e.g. `bin/main --port 4000`).

## Layout

- `docs-site/src/pages/` — the landing page plus the `/demos` and `/tools` galleries
  (cards live in `demos.tsx` / `tools.tsx`, previews in `static/img/{demos,tools}/`).
- `docs-site/static/playground/`, `static/ts-to-html/` — static browser demos, served
  as-is; `static/nanobots/` is built and staged by `deploy.yml`.
- `docs-site/static/runtime/` — the shared wasm runtime, expander and editor bundle.
- `docs-site/static/demo/` — redirect stubs for the old `/demo/…` URLs.

## Build

```sh
cd quiltlang.github.io/docs-site
npm run build   # output written to docs-site/build/
npm run serve   # preview the production build locally
```

## How it works

`docs-site/docusaurus.config.ts` sets the docs `path` to `../../quilt/docs/wiki`, which resolves to the wiki directory in the sibling `quilt` checkout. The CI workflow (`deploy.yml`) mirrors this by checking out both repos side by side before building.
