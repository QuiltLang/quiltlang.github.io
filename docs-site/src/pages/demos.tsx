import React from 'react';
import Gallery, { type GalleryItem } from '../components/Gallery';

const GH = 'https://github.com/QuiltLang';

const demos: GalleryItem[] = [
  {
    title: 'NanoBots',
    href: '/nanobots/',
    image: '/img/demos/nanobots.webp',
    description: (
      <>
        Program a swarm of gas-metered state machines in the editor and watch
        them run on the GPU, right in your browser. Quilt generates the WGSL
        kernels and HTML at build time.
      </>
    ),
    tags: ['gpu', 'wgsl', 'rust'],
    links: [{ label: 'Source', href: `${GH}/nanobots` }],
  },
  {
    title: 'Phib',
    href: '/phib/',
    image: '/img/demos/phib.webp',
    description: (
      <>
        A language for cellular automata, where every rule is a picture of
        cells before and after. Play its frog puzzles, redraw the rules, and
        race three engines. The JavaScript and WGSL compilers are written in
        Quilt.
      </>
    ),
    tags: ['gpu', 'wgsl', 'javascript'],
    links: [{ label: 'Source', href: `${GH}/phib` }],
  },
  {
    title: 'Browser Playground',
    href: '/playground/',
    image: '/img/demos/playground.webp',
    description: (
      <>
        A three-stage live dashboard: TypeScript that generates TypeScript that
        generates HTML. Edit the schema or the <code>.quilt</code> source and
        Quilt&rsquo;s expander, compiled to WebAssembly, re-runs every stage in
        the browser.
      </>
    ),
    tags: ['typescript', 'wasm', 'staging'],
    links: [
      {
        label: 'Source',
        href: `${GH}/quiltlang.github.io/blob/main/docs-site/static/playground/dashboard.html.ts.ts.quilt`,
      },
    ],
  },
  {
    title: 'HTML from TypeScript',
    href: '/ts-to-html/',
    image: '/img/demos/ts.webp',
    description: (
      <>
        A page whose cards are built at runtime by a TypeScript program using
        quoted <code>html↖…↗</code> fragments. Lifted values are entity-escaped
        automatically.
      </>
    ),
    tags: ['typescript', 'html'],
    links: [
      {
        label: 'Source',
        href: `${GH}/quiltlang.github.io/blob/main/docs-site/static/ts-to-html/cards.html.ts.quilt`,
      },
    ],
  },
  {
    title: 'Polyglot Notebook',
    href: `${GH}/quilt/blob/main/examples/notebook/tour.html.quilt`,
    external: true,
    image: '/img/demos/notebook.webp',
    description: (
      <>
        An HTML page that is also the program: Python, SQL, shell and Node
        cells are quotes spliced into the page, each run on a persistent
        machine, with their output written back in by <code>quilt notebook</code>.
      </>
    ),
    tags: ['html', 'python', 'sql', 'shell'],
  },
  {
    title: 'metaarch',
    href: `${GH}/metaarch`,
    external: true,
    image: '/img/demos/metaarch.webp',
    description: (
      <>
        A distributed-system compiler built on Quilt. Describe services,
        databases and events in one <code>.arch</code> file and it generates
        Rust and Python services, SQL schemas, clients, tests, docs and a Nix
        deployment.
      </>
    ),
    tags: ['rust', 'python', 'sql', 'nix'],
  },
  {
    title: '.quilt Examples',
    href: `${GH}/quilt/tree/main/examples`,
    external: true,
    image: '/img/demos/examples.webp',
    description: (
      <>
        30+ annotated <code>.quilt</code> programs in the quilt repo, from
        hello-world to staged code generators, across Rust, Python, TypeScript,
        Lean, Nix, SQL and shell. Each sits next to its expanded output.
      </>
    ),
    tags: ['examples', 'polyglot'],
  },
];

export default function Demos(): React.ReactElement {
  return (
    <Gallery
      title="Demos"
      description="Live demos and example projects built with Quilt."
      subtitle="Live, in-browser demos and projects built with Quilt."
      items={demos}
    />
  );
}
