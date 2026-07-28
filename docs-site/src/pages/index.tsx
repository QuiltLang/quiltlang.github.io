import React from 'react';
import Head from '@docusaurus/Head';
import { TbRobot, TbStack2, TbBraces, TbWorld, TbSandbox, TbServer2, TbKeyboard, TbBrandVscode, TbTopologyStar3 } from 'react-icons/tb';
import SupportMatrix from '../components/SupportMatrix';
import './landing.css';

const squaresCode = `<code><span class="cm">#!/usr/bin/env quilt</span>
<span class="kw">use</span> quilt::prelude::*;

<span class="kw">fn</span> <span class="fn">main</span>() -&gt; <span class="ty">Result</span>&lt;()&gt; {
    <span class="cm">// Runs at generation time, in Rust.</span>
    <span class="kw">let</span> squares: <span class="ty">Vec</span>&lt;<span class="ty">u64</span>&gt; =
        (<span class="nu">1</span>..=<span class="nu">5</span>).<span class="fn">map</span>(|n| n * n).<span class="fn">collect</span>();

    <span class="kw">let</span> program = <span class="la">python</span><span class="qo">↖</span>
        <span class="kw">def</span> <span class="fn">main</span>():
            squares = <span class="uo">↙</span>squares.<span class="li">↑</span><span class="uc">↘</span>
            <span class="fn">print</span>(squares)

        <span class="fn">main</span>()
    <span class="qc">↗</span>;

    <span class="mc">println!</span>(<span class="st">"{}"</span>, program.<span class="fn">coparse</span>());
    <span class="ty">Ok</span>(())
}</code>`;

const squaresOutput = `<code><span class="kw">def</span> <span class="fn">main</span>():
    squares = [<span class="nu">1</span>, <span class="nu">4</span>, <span class="nu">9</span>, <span class="nu">16</span>, <span class="nu">25</span>]
    <span class="fn">print</span>(squares)

<span class="fn">main</span>()</code>`;


export default function Home(): React.ReactElement {
  return (
    <div id="landing">
      <Head>
        <title>Quilt &mdash; Polyglot metaprogramming language</title>
        <meta name="description" content="Quilt lets metaprograms in any language generate and manipulate code in any other language using standardized arrow glyphs." />
      </Head>

      <header>
        <nav>
          <a href="/" className="nav-logo">
            <img src="/img/quilt.svg" alt="" />
            <span>Quilt</span>
          </a>
          <div className="nav-links">
            <a href="/docs/">Docs</a>
            <a href="https://github.com/QuiltLang/quilt" target="_blank" rel="noopener">GitHub</a>
          </div>
        </nav>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="hero">
          <h1>Metaprogramming<br />across <span className="accent">every language.</span></h1>
          <p className="hero-sub">
            Quilt lets metaprograms in any language generate and manipulate
            code in any other language using standardized arrow glyphs.
          </p>
          <div className="hero-ctas">
            <a href="/docs/" className="btn btn-primary">Read the Docs</a>
            <a href="https://github.com/QuiltLang/quilt" className="btn btn-secondary" target="_blank" rel="noopener">View on GitHub</a>
          </div>
        </section>

        {/* ── How It Works ── */}
        <div className="how">
          <div className="how-inner">
            <h2 className="section-title">Five Operators. Any Language.</h2>
            <p className="section-sub">
              The entire system is built on five Unicode glyphs that compose cleanly across language boundaries.
            </p>

            <div className="ops-grid">
              <div className="op-card">
                <div className="op-glyphs"><span className="qo">↖</span><span className="qc">↗</span></div>
                <div className="op-label">Quote</div>
                <div className="op-syntax"><span className="la">lang</span><span className="qo">↖</span> &hellip; <span className="qc">↗</span></div>
                <p className="op-desc">
                  Captures a foreign-language code fragment as a first-class{' '}
                  <code style={{fontSize:'.75rem',color:'var(--syn-type)'}}>QTerm</code> value.
                  The language annotation (<span className="la" style={{fontFamily:'monospace',fontSize:'.8rem'}}>python</span>,{' '}
                  <span className="la" style={{fontFamily:'monospace',fontSize:'.8rem'}}>html</span>,{' '}
                  <span className="la" style={{fontFamily:'monospace',fontSize:'.8rem'}}>wgsl</span>&hellip;)
                  is optional; omitting it defaults to the host language.
                </p>
              </div>

              <div className="op-card">
                <div className="op-glyphs"><span className="uo">↙</span><span className="uc">↘</span></div>
                <div className="op-label">Unquote</div>
                <div className="op-syntax"><span className="uo">↙</span> expr <span className="uc">↘</span></div>
                <p className="op-desc">
                  Splices a computed term back into a quote. The content is ground-language
                  code evaluated at generation time, producing a{' '}
                  <code style={{fontSize:'.75rem',color:'var(--syn-type)'}}>QTerm</code>{' '}
                  to substitute at the hole position.
                </p>
              </div>

              <div className="op-card">
                <div className="op-glyphs"><span className="li">↑</span></div>
                <div className="op-label">Lift</div>
                <div className="op-syntax">value.<span className="li">↑</span> &nbsp;/&nbsp; <span className="li">↑</span>(value)</div>
                <p className="op-desc">
                  Converts a runtime value into a{' '}
                  <code style={{fontSize:'.75rem',color:'var(--syn-type)'}}>QTerm</code>.
                  Integers become integer literals, strings become string literals,{' '}
                  <code style={{fontSize:'.75rem',color:'var(--syn-type)'}}>Vec</code> becomes a Python list literal, and so on &mdash;
                  the target language shapes the output.
                </p>
              </div>

              <div className="op-card">
                <div className="op-glyphs"><span className="rd">↓</span></div>
                <div className="op-label">Reduce</div>
                <div className="op-syntax">expr.<span className="rd">↓</span> &nbsp;/&nbsp; <span className="rd">↓</span>(expr)</div>
                <p className="op-desc">
                  Evaluates a <code style={{fontSize:'.75rem',color:'var(--syn-type)'}}>QTerm</code>{' '}
                  at generation time by compiling and running it (via{' '}
                  <code style={{fontSize:'.75rem'}}>rust-script</code> for Rust), then deserializing the result.
                  Enables staged computation where one program generates and immediately evaluates another.
                </p>
              </div>

              <div className="op-card">
                <div className="op-glyphs"><span className="em">←</span></div>
                <div className="op-label">Emit</div>
                <div className="op-syntax">term.<span className="em">←</span> &nbsp;/&nbsp; <span className="em">←</span>(term)</div>
                <p className="op-desc">
                  Appends a term into the surrounding variadic block, such as a Rust{' '}
                  <code style={{fontSize:'.75rem',color:'var(--syn-kw)'}}>{'{ }'}</code>{' '}
                  or Python function body. Enables loops that build programs one statement at a time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Example ── */}
        <section className="showcase">
          <div className="showcase-inner">
            <h2 className="section-title">Example</h2>
            <p className="section-sub">
              A Rust program that generates Python.{' '}
              The squares are computed at generation time in Rust; the emitted Python contains only the results.
            </p>

            <div className="code-split">
              <div className="code-panel">
                <div className="code-panel-header">
                  <span className="lang-dot dot-quilt"></span>
                  squares.py.rs.quilt
                </div>
                <pre dangerouslySetInnerHTML={{__html: squaresCode}} />
              </div>

              <div className="split-arrow">&#8594;</div>

              <div className="code-panel">
                <div className="code-panel-header">
                  <span className="lang-dot dot-python"></span>
                  squares.py &nbsp;<span style={{color:'var(--syn-cmt)'}}>(generated)</span>
                </div>
                <pre dangerouslySetInnerHTML={{__html: squaresOutput}} />
              </div>
            </div>
          </div>
        </section>

        {/* ── See It in Action ── */}
        <div className="examples-band">
          <div className="examples-inner">
            <h2 className="section-title">See It in Action</h2>
            <p className="section-sub">Real projects built with Quilt.</p>

            <div className="examples-grid">
              <a className="example-card" href="/demo/playground.html">
                <TbSandbox className="example-card-icon" />
                <div className="example-card-title">Browser Playground</div>
                <p className="example-card-desc">
                  Edit a <code>.html.ts.quilt</code> source and watch Quilt&rsquo;s
                  parser and expander &mdash; compiled to WebAssembly &mdash; turn it
                  into TypeScript and render the result, entirely in the browser.
                </p>
                <span className="example-card-link">Open the playground &rarr;</span>
              </a>
              <div className="example-card">
                <TbRobot className="example-card-icon" />
                <div className="example-card-title">Nanobots</div>
                <p className="example-card-desc">
                  A gas-metered state-machine toolchain that uses Quilt to generate
                  GPU-friendly WGSL and HTML at build time.
                </p>
                <div className="example-card-links">
                  <a href="/demo/nanobots/" className="example-card-link">Live Demo &rarr;</a>
                  <a href="https://github.com/QuiltLang/nanobots/blob/main/nanobots-codegen/src/wgsl.wgsl.rs.quilt" target="_blank" rel="noopener" className="example-card-link example-card-link-muted">Source &rarr;</a>
                </div>
              </div>
              <a className="example-card" href="https://github.com/QuiltLang/metaarch" target="_blank" rel="noopener">
                <TbTopologyStar3 className="example-card-icon" />
                <div className="example-card-title">metaarch</div>
                <p className="example-card-desc">
                  A distributed-system compiler built on Quilt. Describe an entire
                  system &mdash; services, databases, events &mdash; in one{' '}
                  <code>.arch</code> file, and it generates the whole thing: Rust and
                  Python services, SQL schemas, clients, tests, docs, and a Nix
                  deployment.
                </p>
                <span className="example-card-link">Source &rarr;</span>
              </a>
            </div>

            <p className="examples-more">
              Looking for more? Browse the annotated{' '}
              <a href="https://github.com/QuiltLang/quilt/tree/main/examples" target="_blank" rel="noopener"><code>.quilt</code> examples</a>{' '}
              in the quilt repo &rarr;
            </p>
          </div>
        </div>

        {/* ── Languages ── */}
        <section className="langs">
          <div className="langs-inner">
          <h2 className="section-title">Supported Languages</h2>
          <p className="section-sub">
            Languages with Meta support can drive generation; Object languages can be quoted and spliced into.
            This table is <em>generated</em> from Quilt&rsquo;s conformance matrix &mdash; every cell is
            re-verified against the implementation on each CI run, so it cannot claim support that
            isn&rsquo;t tested. Hover a cell for the details.{' '}
            <a href="/docs/support-matrix">See the full matrix &rarr;</a>
          </p>

          <SupportMatrix />
          </div>
        </section>

        {/* ── Tooling ── */}
        <div className="tooling-band">
          <div className="tooling-inner">
            <h2 className="section-title">Tooling</h2>
            <p className="section-sub">Real IDE features for polyglot <code>.quilt</code> files.</p>

            <div className="examples-grid">
              <div className="example-card">
                <TbServer2 className="example-card-icon" />
                <div className="example-card-title">quilt-lsp &mdash; the language server</div>
                <p className="example-card-desc">
                  A multiplexing server: it parses a <code>.quilt</code> file&rsquo;s structure,
                  projects each embedded language into its own virtual document, and proxies to the
                  real downstream server &mdash; <code>rust-analyzer</code> for Rust,{' '}
                  <code>pyright</code> for Python &mdash; remapping positions both ways. You get
                  hover, go-to-definition, completion, and diagnostics from the tools you already
                  trust, right inside the quilt.
                </p>
                <div className="example-card-links">
                  <a href="https://github.com/QuiltLang/quilt/tree/main/quilt-lsp" target="_blank" rel="noopener" className="example-card-link">Source &rarr;</a>
                </div>
              </div>

              <div className="example-card">
                <TbKeyboard className="example-card-icon" />
                <div className="example-card-title">Glyph keyboard shortcuts</div>
                <p className="example-card-desc">
                  Quilt&rsquo;s operators are Unicode glyphs &mdash; but you never have to hunt for them.
                  The VS Code extension binds a chord shortcut to every operator, and a drop-in macOS{' '}
                  <code>DefaultKeyBinding.dict</code> maps Command-plus-arrow chords to the glyphs
                  system-wide, so <span className="qo">↖</span> <span className="qc">↗</span>{' '}
                  <span className="uo">↙</span> <span className="uc">↘</span> <span className="li">↑</span>{' '}
                  <span className="rd">↓</span> <span className="em">←</span> are as quick to type as any bracket.
                </p>
                <div className="example-card-links">
                  <a href="https://github.com/QuiltLang/quilt/tree/main/tools" target="_blank" rel="noopener" className="example-card-link">Source &rarr;</a>
                </div>
              </div>

              <div className="example-card">
                <TbBrandVscode className="example-card-icon" />
                <div className="example-card-title">VS Code extension</div>
                <p className="example-card-desc">
                  An extension bundling the language server and the <code>.quilt</code>{' '}
                  grammar for syntax highlighting &mdash; so the whole experience works out of the box.
                  Install it straight from the VS Code Marketplace.
                </p>
                <div className="example-card-links">
                  <a href="https://marketplace.visualstudio.com/items?itemName=quiltlang.quiltlang" target="_blank" rel="noopener" className="example-card-link">Install from Marketplace &rarr;</a>
                  <a href="https://github.com/QuiltLang/quilt/tree/main/tools/quilt" target="_blank" rel="noopener" className="example-card-link">Source &rarr;</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tenets ── */}
        <section className="tenets">
          <div className="tenets-inner">
          <h2 className="section-title">Design Tenets</h2>
          <p className="section-sub">The principles behind every design decision in Quilt.</p>

          <div className="tenets-grid">
            <div className="tenet-card">
              <TbWorld className="tenet-icon" />
              <div className="tenet-n">Tenet 01</div>
              <div className="tenet-title">Meta-programming is everywhere.</div>
              <p className="tenet-desc">
                Macro systems, web development frameworks, build scripts &mdash; many tasks in
                software development and maintenance can be considered meta-programming.
                These tasks are often awkward and error-prone because they stray from the
                tools and guarantees of normal languages. We embrace meta-programming as a
                necessary evil and build tools to address these pain points.
              </p>
            </div>
            <div className="tenet-card">
              <TbStack2 className="tenet-icon" />
              <div className="tenet-n">Tenet 02</div>
              <div className="tenet-title">Meta-programming should be representation-agnostic.</div>
              <p className="tenet-desc">
                We don&rsquo;t write programs by constructing syntax trees, so we shouldn&rsquo;t
                have to do so when writing meta-programs. Languages already expose textual syntax
                as their primary interface, so we avoid expanding their surface areas with
                tree-like representations &mdash; letting each meta-language implementation freely
                choose the data structures used to represent code behind the scenes.
              </p>
            </div>
            <div className="tenet-card">
              <TbBraces className="tenet-icon" />
              <div className="tenet-n">Tenet 03</div>
              <div className="tenet-title">Meta-programming should be language-agnostic.</div>
              <p className="tenet-desc">
                Languages shouldn&rsquo;t force a single meta-language upon users, making them
                learn a whole new language for such purposes. Users should be able to choose
                whichever meta-language best fits the job at hand, as we do when choosing a
                normal language or framework. Standardizing the syntax for stitching languages
                together can make it easier to switch between languages.
              </p>
            </div>
          </div>
          </div>
        </section>

      </main>

      <footer>
        <div className="footer-links">
          <a href="/docs/">Documentation</a>
          <a href="https://github.com/QuiltLang/quilt" target="_blank" rel="noopener">GitHub</a>
          <a href="https://github.com/QuiltLang/quilt/tree/main/examples" target="_blank" rel="noopener">Examples</a>
          <a href="https://github.com/QuiltLang/quilt/issues" target="_blank" rel="noopener">Issues</a>
        </div>
        <p>Quilt &mdash; polyglot metaprogramming language</p>
      </footer>
    </div>
  );
}
