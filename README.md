# quiltlang.github.io

Source for the [QuiltLang](https://quiltlang.github.io) website, built with [Docusaurus](https://docusaurus.io).

The docs pages are pulled directly from the wiki in the [`quilt`](https://github.com/QuiltLang/quilt) repo. Both repos must be checked out **side by side** under the same parent directory.

## Local setup

```sh
# Check out both repos as siblings
mkdir QuiltLang && cd QuiltLang
git clone https://github.com/QuiltLang/quiltlang.github.io
git clone https://github.com/QuiltLang/quilt

# Install dependencies and start the dev server
cd quiltlang.github.io/docs-site
npm install
npm start
```

The site is served at `http://localhost:3000`.

## Build

```sh
cd quiltlang.github.io/docs-site
npm run build   # output written to docs-site/build/
npm run serve   # preview the production build locally
```

## How it works

`docs-site/docusaurus.config.ts` sets the docs `path` to `../../quilt/docs/wiki`, which resolves to the wiki directory in the sibling `quilt` checkout. The CI workflow (`deploy.yml`) mirrors this by checking out both repos side by side before building.
