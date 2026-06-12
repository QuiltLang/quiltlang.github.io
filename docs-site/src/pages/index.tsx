import React from 'react';
import Head from '@docusaurus/Head';
import { SiRust, SiPython, SiHtml5, SiWebgpu, SiZsh, SiGnubash } from 'react-icons/si';
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
        <title>Quilt &mdash; Multi-stage, multi-language metaprogramming</title>
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

        {/* ── Code Showcase ── */}
        <section className="showcase">
          <p className="showcase-intro">
            A Rust program that generates Python.{' '}
            <strong>The squares are computed at generation time in Rust</strong>; the emitted Python contains only the results.
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

        {/* ── Languages ── */}
        <section className="langs">
          <h2 className="section-title">Supported Languages</h2>
          <p className="section-sub">
            Languages with Meta support can drive generation; Object languages can be quoted and spliced into.
          </p>

          <div className="lang-table-wrap">
            <table className="lang-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Meta</th>
                  <th>Object</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="lang-name"><SiRust className="lang-icon" style={{color:'#CE422B'}} />Rust</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-desc">Primary host. Full <code>MetaLanguage</code> support. Generated from <code>mk_meta.rs.quilt</code> by bootstrap.</td>
                </tr>
                <tr>
                  <td className="lang-name"><SiPython className="lang-icon" style={{color:'#FFD43B'}} />Python</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-desc">Second host language. PyO3 runtime module provides the same <code>QTerm</code> API in Python.</td>
                </tr>
                <tr>
                  <td className="lang-name"><SiHtml5 className="lang-icon" style={{color:'#E34F26'}} />HTML</td>
                  <td className="lang-no">&mdash;</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-desc">Quote and splice HTML document fragments for code-generated web reports and templates.</td>
                </tr>
                <tr>
                  <td className="lang-name"><SiWebgpu className="lang-icon" style={{color:'#B48AE0'}} />WGSL</td>
                  <td className="lang-no">&mdash;</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-desc">Generate GPU shader code at build time. Lift Rust values directly into WGSL literal syntax.</td>
                </tr>
                <tr>
                  <td className="lang-name"><SiZsh className="lang-icon" style={{color:'#89E051'}} />Zsh</td>
                  <td className="lang-no">&mdash;</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-desc">Generate shell scripts with correct quoting. Rust strings lift into properly escaped zsh words.</td>
                </tr>
                <tr>
                  <td className="lang-name"><SiGnubash className="lang-icon" style={{color:'#4EAA25'}} />Bash</td>
                  <td className="lang-no">&mdash;</td>
                  <td className="lang-yes">✓</td>
                  <td className="lang-desc">Same as Zsh &mdash; a separate target with Bash-specific quoting semantics.</td>
                </tr>
                <tr className="lang-more">
                  <td colSpan={4} className="lang-more-cell">More languages coming soon&hellip;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Tenets ── */}
        <section className="tenets">
          <h2 className="section-title">Design Tenets</h2>
          <p className="section-sub">The principles behind every design decision in Quilt.</p>

          <div className="tenets-grid">
            <div className="tenet-card">
              <div className="tenet-n">Tenet 01</div>
              <div className="tenet-title">Code should be generic over representation.</div>
              <p className="tenet-desc">
                Every language already has a textual syntax, so a metaprogramming system
                that operates only on terms adds surface area instead of reusing what exists.
                There is no single right representation &mdash; strings, token trees, or terms;
                arcs, hash-consing, or plain references; mutable or immutable; untyped or typed.
                Metaprograms shouldn&rsquo;t be married to any one of these choices.
              </p>
            </div>
            <div className="tenet-card">
              <div className="tenet-n">Tenet 02</div>
              <div className="tenet-title">A language shouldn&rsquo;t need a second language for metaprogramming.</div>
              <p className="tenet-desc">
                &ldquo;Meta&rdquo; is as universal a concept as arithmetic or functions,
                yet most languages bolt on an ad-hoc macro layer that sacrifices the host
                language&rsquo;s tooling and guarantees.
                Bad metaprogramming is everywhere; it deserves to be fixed once,
                with meta-meta-programming.
              </p>
            </div>
            <div className="tenet-card">
              <div className="tenet-n">Tenet 03</div>
              <div className="tenet-title">Support all languages.</div>
              <p className="tenet-desc">
                When one system spans many languages, the right tool for the job is always
                available. Quilt supports Rust and Python as host languages today; adding a
                new target language requires only a tree-sitter grammar and a thin{' '}
                <code style={{fontSize:'.8rem'}}>Language</code> impl.
              </p>
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
        <p>Quilt &mdash; multi-stage, multi-language metaprogramming</p>
      </footer>
    </div>
  );
}
