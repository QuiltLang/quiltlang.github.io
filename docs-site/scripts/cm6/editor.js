// CodeMirror 6 bundle for the Quilt browser playground.
//
// Mirrors the nanobots demo's editor API (createEditorState / createEditorView /
// createReadonlyView) so the playground gets the same oneDark editor, but with a
// TypeScript-flavoured StreamLanguage that also highlights the Quilt arrow glyphs
// (↖↗ quote, ↙↘ unquote, ↑ lift, ↓ reduce, ← emit). The same highlighter serves
// the editable `.html.ts.quilt` source and the read-only expanded TypeScript.

import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { LanguageSupport, StreamLanguage } from '@codemirror/language';
import { toggleLineComment } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

// ── TypeScript / Quilt language definition ────────────────────────────────────

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'as', 'const', 'let', 'var', 'function',
  'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
  'continue', 'new', 'class', 'extends', 'interface', 'type', 'enum', 'implements',
  'public', 'private', 'protected', 'readonly', 'static', 'async', 'await', 'yield',
  'typeof', 'instanceof', 'in', 'of', 'void', 'delete', 'this', 'super', 'try',
  'catch', 'finally', 'throw', 'true', 'false', 'null', 'undefined',
]);

const TYPES = new Set([
  'string', 'number', 'boolean', 'any', 'unknown', 'never', 'object', 'symbol',
  'bigint', 'Array', 'Promise', 'Record', 'Map', 'Set', 'Readonly', 'Partial',
]);

const GLYPHS = '↖↗↙↘↑↓←';

function consumeString(stream, quote) {
  let escaped = false, ch;
  while ((ch = stream.next()) != null) {
    if (ch === quote && !escaped) break;
    escaped = !escaped && ch === '\\';
  }
  return 'string';
}

const quiltStreamLanguage = StreamLanguage.define({
  name: 'quilt',
  languageData: { commentTokens: { line: '//' } },
  startState: () => ({ inBlock: false }),

  token(stream, state) {
    if (state.inBlock) {
      if (stream.match('*/')) state.inBlock = false;
      else stream.next();
      return 'comment';
    }
    if (stream.eatSpace()) return null;

    // Quilt arrow glyphs get their own token colour.
    if (GLYPHS.includes(stream.peek())) { stream.next(); return 'meta'; }

    if (stream.match('//')) { stream.skipToEnd(); return 'comment'; }
    if (stream.match('/*')) { state.inBlock = true; return 'comment'; }

    const c = stream.peek();
    if (c === '"' || c === "'" || c === '`') { stream.next(); return consumeString(stream, c); }

    if (stream.match(/^0x[\da-fA-F]+/) || stream.match(/^\d+(\.\d*)?([eE][+-]?\d+)?/)) return 'number';

    if (stream.match(/^[A-Za-z_$][\w$]*/)) {
      const w = stream.current();
      if (KEYWORDS.has(w)) return 'keyword';
      if (TYPES.has(w) || /^[A-Z]/.test(w)) return 'typeName';
      return 'variableName';
    }

    if (stream.match(/^[{}()\[\];:,.<>?]/) || stream.match(/^[-+*/%&|^~!=]+/)) return 'operator';

    stream.next();
    return null;
  },
});

const quiltLanguage = new LanguageSupport(quiltStreamLanguage);
const commentKeymap = keymap.of([{ key: 'Mod-/', run: toggleLineComment }]);

// ── Public API (mirrors the nanobots cm6 bundle) ──────────────────────────────

export function createEditorState(doc, options = {}) {
  const extensions = [basicSetup, quiltLanguage, commentKeymap];
  if (options.oneDark) extensions.push(oneDark);
  return EditorState.create({ doc, extensions });
}

export function createEditorView(state, parent) {
  return new EditorView({ state, parent });
}

export function createReadonlyView(doc, parent) {
  const state = EditorState.create({
    doc,
    extensions: [
      basicSetup,
      quiltLanguage,
      EditorView.editable.of(false),
      EditorState.readOnly.of(true),
      oneDark,
    ],
  });
  return new EditorView({ state, parent });
}
