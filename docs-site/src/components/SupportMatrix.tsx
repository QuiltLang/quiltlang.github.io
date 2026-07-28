// The language support table, rendered from QuiltLang/quilt's generated
// conformance matrix.
//
// Nothing about which languages support what is maintained in this file. Every
// cell comes from `conformance/support-matrix.json`, which quilt's conformance
// battery regenerates from `conformance/spec/*.toml` and re-verifies against the
// implementations on every CI run (`bin/check-matrix`). A claim that stops being
// true turns that build red rather than quietly living on here — which is the
// whole point of QuiltLang/quilt#144.
//
// The JSON is copied in at build time by scripts/fetch-matrix.mjs.
import React from 'react';
import {
  SiRust, SiPython, SiTypescript, SiHtml5, SiWebgpu, SiZsh, SiGnubash, SiNixos,
} from 'react-icons/si';
// TbMathFunction stands in for Lean: react-icons ships no Lean logo (its only
// "Lean" entry is Leanpub, an unrelated product). TbFileText stands in for
// plain text.
import { TbMathFunction, TbFileText } from 'react-icons/tb';
import matrix from '../data/support-matrix.json';

const REPO = 'https://github.com/QuiltLang/quilt';

type Status = 'supported' | 'partial' | 'unsupported' | 'planned';

interface Cell {
  axis: string;
  status: Status;
  note?: string;
  issue?: number;
  verified_by?: string;
  detail?: string[];
}

interface Row {
  name: string;
  display: string;
  aliases: string[];
  feature: string;
  blurb: string;
  meta_kind: string;
  lang_src: string;
  meta_src?: string;
  cells: Cell[];
}

const rows = (matrix as { rows: Row[] }).rows;

const ICONS: Record<string, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }> = {
  rust: { icon: SiRust, color: '#CE422B' },
  python: { icon: SiPython, color: '#FFD43B' },
  typescript: { icon: SiTypescript, color: '#3178C6' },
  html: { icon: SiHtml5, color: '#E34F26' },
  wgsl: { icon: SiWebgpu, color: '#B48AE0' },
  zsh: { icon: SiZsh, color: '#89E051' },
  bash: { icon: SiGnubash, color: '#4EAA25' },
  nix: { icon: SiNixos, color: '#5277C3' },
  lean: { icon: TbMathFunction, color: '#8B7CF6' },
  text: { icon: TbFileText, color: '#9AA4B2' },
};

const STATUS_GLYPH: Record<Status, string> = {
  supported: '✅',
  partial: '🟡',
  unsupported: '⬜',
  planned: '🔵',
};

const STATUS_MEANING: Record<Status, string> = {
  supported: 'Works, and a probe in the conformance suite proves it',
  partial: 'Works within a stated limit — hover the cell for the specifics',
  unsupported: 'Deliberately unsupported; the probe asserts a clean error',
  planned: 'Intended and tracked by an issue; not yet implemented',
};

// The axes worth showing on the landing page. The full 17-axis matrix lives on
// the wiki page; this is the summary a visitor actually wants, chosen so every
// column is one a probe verifies rather than one we only assert in prose.
const COLUMNS: { axis: string; title: string; help: string }[] = [
  { axis: 'quotable', title: 'Object', help: 'Can be quoted and spliced into: `lang↖…↗` parses and round-trips' },
  { axis: 'host', title: 'Meta', help: 'Has a MetaLanguage, so it can drive generation as a ground language' },
  { axis: 'lift-into', title: 'Lift in', help: 'Host values lift into this language’s literal syntax via ↑' },
  { axis: 'emit', title: 'Emit ←', help: 'Terms can be appended into a variadic container' },
  { axis: 'runtime-binding', title: 'Runtime', help: 'A published package implements the QTerm builder API' },
];

function cellOf(row: Row, axis: string): Cell | undefined {
  return row.cells.find((c) => c.axis === axis);
}

/** Tooltip text: the note, the tracking issue, and whether a probe backs it. */
function cellTitle(cell: Cell): string {
  const parts = [STATUS_MEANING[cell.status]];
  if (cell.note) parts.push(cell.note);
  if (cell.issue) parts.push(`Tracked by issue #${cell.issue}`);
  parts.push(
    cell.verified_by
      ? `Verified by the conformance probe "${cell.verified_by}"`
      : 'Declared in the spec; no probe verifies this axis yet',
  );
  return parts.join('\n\n');
}

function StatusCell({ cell }: { cell?: Cell }) {
  if (!cell) return <td className="lang-cell">&mdash;</td>;
  const href = cell.issue ? `${REPO}/issues/${cell.issue}` : undefined;
  const body = (
    <span className={`lang-status lang-status-${cell.status}`}>
      {STATUS_GLYPH[cell.status]}
      {!cell.verified_by && <sup className="lang-unverified">*</sup>}
    </span>
  );
  return (
    <td className="lang-cell" title={cellTitle(cell)}>
      {href ? (
        <a href={href} target="_blank" rel="noopener">{body}</a>
      ) : body}
    </td>
  );
}

export default function SupportMatrix(): React.ReactElement {
  return (
    <>
      <div className="lang-table-wrap">
        <table className="lang-table">
          <thead>
            <tr>
              <th>Language</th>
              {COLUMNS.map((c) => (
                <th key={c.axis} title={c.help}>{c.title}</th>
              ))}
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = ICONS[row.name];
              const Icon = meta?.icon;
              return (
                <tr key={row.name}>
                  <td className="lang-name">
                    {Icon && <Icon className="lang-icon" style={{ color: meta.color }} />}
                    <a href={`${REPO}/blob/main/${row.lang_src}`} target="_blank" rel="noopener">
                      {row.display}
                    </a>
                  </td>
                  {COLUMNS.map((c) => (
                    <StatusCell key={c.axis} cell={cellOf(row, c.axis)} />
                  ))}
                  <td className="lang-desc">{row.blurb}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lang-key">
        {(Object.keys(STATUS_GLYPH) as Status[]).map((s) => (
          <span key={s} className="lang-key-item" title={STATUS_MEANING[s]}>
            <span className="lang-key-glyph">{STATUS_GLYPH[s]}</span> {s}
          </span>
        ))}
        <span className="lang-key-item" title="Recorded in the capability spec, but no conformance probe checks it yet">
          <span className="lang-key-glyph">*</span> not yet probe-verified
        </span>
      </div>
    </>
  );
}
