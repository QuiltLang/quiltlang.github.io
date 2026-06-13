#!/usr/bin/env node
// Bundle editor.js → ../../static/demo/codemirror.min.js (IIFE, global `cm6`).
// Run `npm install` in this directory first, then `node build.mjs`.
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [resolve(here, 'editor.js')],
  bundle: true,
  format: 'iife',
  globalName: 'cm6',
  minify: true,
  outfile: resolve(here, '..', '..', 'static', 'demo', 'codemirror.min.js'),
});

console.log('→ static/demo/codemirror.min.js');
