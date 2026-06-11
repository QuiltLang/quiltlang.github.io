# Quilt Docs Site

Docusaurus source for the [Quilt documentation](https://quiltlang.github.io/docs/).

## Local development

Both repos must be siblings under the same parent directory:

```
QuiltLang/
├── quilt/                   # https://github.com/QuiltLang/quilt
└── quiltlang.github.io/     # this repo
```

```sh
# From the repo root:
npm run docs:start    # dev server with hot reload
npm run docs:build    # build to ../docs/ (root docs/ dir)
npm run docs:serve    # serve the built docs locally
```

The docs source is read directly from `../../quilt/docs/wiki/` — no copying needed.
