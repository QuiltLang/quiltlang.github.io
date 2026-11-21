import React from 'react';
import Gallery, { type GalleryItem } from '../components/Gallery';

const GH = 'https://github.com/QuiltLang';

const tools: GalleryItem[] = [
  {
    title: 'quilt-lsp',
    href: `${GH}/quilt/tree/main/quilt-lsp`,
    external: true,
    image: '/img/tools/lsp.webp',
    description: (
      <>
        A multiplexing language server. It parses a <code>.quilt</code> file&rsquo;s
        structure, projects each embedded language into its own virtual document,
        and proxies to the real downstream server (<code>rust-analyzer</code> for
        Rust, <code>pyright</code> for Python), remapping positions both ways. Hover,
        go-to-definition, completion and diagnostics come from the tools you
        already trust.
      </>
    ),
    tags: ['lsp', 'editors'],
    links: [{ label: 'crates.io', href: 'https://crates.io/crates/quilt-lsp' }],
  },
  {
    title: 'VS Code extension',
    href: 'https://open-vsx.org/extension/quiltlang/quiltlang',
    external: true,
    image: '/img/tools/vscode.webp',
    description: (
      <>
        Bundles the language server and the <code>.quilt</code> grammar for syntax
        highlighting, plus chord shortcuts for every glyph, so the whole
        experience works out of the box.
      </>
    ),
    tags: ['vscode', 'editors'],
    links: [
      {
        label: 'Marketplace',
        href: 'https://marketplace.visualstudio.com/items?itemName=quiltlang.quiltlang',
      },
      { label: 'Source', href: `${GH}/quilt/tree/main/tools/quilt` },
    ],
  },
  {
    title: 'Glyph keyboard shortcuts',
    href: `${GH}/quilt/tree/main/tools`,
    external: true,
    image: '/img/tools/keys.webp',
    description: (
      <>
        Quilt&rsquo;s operators are Unicode glyphs, but you never have to hunt for
        them. The VS Code extension binds a chord to every operator, and a drop-in
        macOS <code>DefaultKeyBinding.dict</code> maps Command-plus-arrow chords to
        the glyphs system-wide.
      </>
    ),
    tags: ['keyboard', 'macos'],
  },
  {
    title: 'quilt repl',
    href: `${GH}/quilt/blob/main/docs/design/machines.md`,
    external: true,
    image: '/img/tools/repl.webp',
    description: (
      <>
        Every language with a <em>machine</em> gets a REPL for free: each line is
        Quilt source, expanded by the ground language&rsquo;s meta-language and fed
        to its stateful machine, so definitions persist across lines. The same
        machines back <code>↓</code> (reduce): a persistent shell for{' '}
        <code>bash</code>/<code>zsh</code>, and interpreters for Python and
        TypeScript.
      </>
    ),
    tags: ['repl', 'machines'],
    links: [{ label: 'CLI docs', href: '/docs/cli' }],
  },
  {
    title: 'quilt CLI',
    href: '/docs/cli',
    image: '/img/tools/cli.webp',
    description: (
      <>
        Expand a <code>.quilt</code> file to plain source, run it as a script,
        validate a whole tree with <code>quilt check</code>, or run a polyglot
        notebook. Prebuilt binaries ship with every release.
      </>
    ),
    tags: ['cli'],
    links: [
      { label: 'Releases', href: `${GH}/quilt/releases` },
      { label: 'crates.io', href: 'https://crates.io/crates/quiltlang' },
    ],
  },
];

export default function Tools(): React.ReactElement {
  return (
    <Gallery
      title="Tools"
      description="Editor support, language server, REPL and CLI for Quilt."
      subtitle={<>Real IDE features and tooling for polyglot <code>.quilt</code> files.</>}
      items={tools}
    />
  );
}
