/* @ts-self-types="./quilt_wasm.d.ts" */

/**
 * A child placeholder (the `HOLE` constant in the Python runtime).
 * @returns {WasmCmdOrHole}
 */
export function HOLE() {
    const ret = wasm.HOLE();
    return WasmCmdOrHole.__wrap(ret);
}

/**
 * The `NewLine` command (the `NL` constant in the Python runtime).
 * @returns {WasmStrCmd}
 */
export function NL() {
    const ret = wasm.NL();
    return WasmStrCmd.__wrap(ret);
}

/**
 * The `Pop` command (the `POP` constant in the Python runtime).
 * @returns {WasmStrCmd}
 */
export function POP() {
    const ret = wasm.POP();
    return WasmStrCmd.__wrap(ret);
}

/**
 * A fluent term builder, mirroring the Rust `QTermBuilder` (consuming form:
 * each method takes `self` and returns the next builder, so chaining works
 * from JS exactly as `tb("x").w("a").c(child).b()`).
 */
export class WasmBuilder {
    static __wrap(ptr) {
        const obj = Object.create(WasmBuilder.prototype);
        obj.__wbg_ptr = ptr;
        WasmBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbuilder_free(ptr, 0);
    }
    /**
     * Build the term. Consumes the builder.
     * @returns {WasmQTerm}
     */
    b() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmbuilder_b(ptr);
        return WasmQTerm.__wrap(ret);
    }
    /**
     * Splice a child term.
     * @param {WasmQTerm} child
     * @returns {WasmBuilder}
     */
    c(child) {
        const ptr = this.__destroy_into_raw();
        _assertClass(child, WasmQTerm);
        const ret = wasm.wasmbuilder_c(ptr, child.__wbg_ptr);
        return WasmBuilder.__wrap(ret);
    }
    /**
     * Emit a child term (for an `Arc<QTerm>` this is the same as [`c`]).
     * @param {WasmQTerm} child
     * @returns {WasmBuilder}
     */
    e(child) {
        const ptr = this.__destroy_into_raw();
        _assertClass(child, WasmQTerm);
        const ret = wasm.wasmbuilder_e(ptr, child.__wbg_ptr);
        return WasmBuilder.__wrap(ret);
    }
    /**
     * Emit a newline (respecting the current prefix).
     * @returns {WasmBuilder}
     */
    n() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmbuilder_n(ptr);
        return WasmBuilder.__wrap(ret);
    }
    /**
     * Push an indentation prefix.
     * @param {string} s
     * @returns {WasmBuilder}
     */
    p(s) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmbuilder_p(ptr, ptr0, len0);
        return WasmBuilder.__wrap(ret);
    }
    /**
     * Write literal source text.
     * @param {string} s
     * @returns {WasmBuilder}
     */
    w(s) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmbuilder_w(ptr, ptr0, len0);
        return WasmBuilder.__wrap(ret);
    }
    /**
     * Pop an indentation prefix.
     * @returns {WasmBuilder}
     */
    x() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmbuilder_x(ptr);
        return WasmBuilder.__wrap(ret);
    }
}
if (Symbol.dispose) WasmBuilder.prototype[Symbol.dispose] = WasmBuilder.prototype.free;

/**
 * A `StrCmd` or a child placeholder (`HOLE`), used in `quote`/`unquote` cmds.
 */
export class WasmCmdOrHole {
    static __wrap(ptr) {
        const obj = Object.create(WasmCmdOrHole.prototype);
        obj.__wbg_ptr = ptr;
        WasmCmdOrHoleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmCmdOrHole)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmCmdOrHoleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmcmdorhole_free(ptr, 0);
    }
}
if (Symbol.dispose) WasmCmdOrHole.prototype[Symbol.dispose] = WasmCmdOrHole.prototype.free;

/**
 * A quilt term (`Arc<QTerm>`).
 */
export class WasmQTerm {
    static __wrap(ptr) {
        const obj = Object.create(WasmQTerm.prototype);
        obj.__wbg_ptr = ptr;
        WasmQTermFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmQTermFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmqterm_free(ptr, 0);
    }
    /**
     * Serialize the term back to source code.
     * @returns {string}
     */
    coparse() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmqterm_coparse(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmqterm_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmQTerm.prototype[Symbol.dispose] = WasmQTerm.prototype.free;

/**
 * A single string command (`write`/`NL`/`push`/`POP`).
 */
export class WasmStrCmd {
    static __wrap(ptr) {
        const obj = Object.create(WasmStrCmd.prototype);
        obj.__wbg_ptr = ptr;
        WasmStrCmdFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmStrCmdFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmstrcmd_free(ptr, 0);
    }
}
if (Symbol.dispose) WasmStrCmd.prototype[Symbol.dispose] = WasmStrCmd.prototype.free;

/**
 * Wrap a `StrCmd` as a `CmdOrHole`.
 * @param {WasmStrCmd} c
 * @returns {WasmCmdOrHole}
 */
export function cmd(c) {
    _assertClass(c, WasmStrCmd);
    const ret = wasm.cmd(c.__wbg_ptr);
    return WasmCmdOrHole.__wrap(ret);
}

/**
 * A leaf node: a tag whose only content is `code`.
 * @param {string} tag
 * @param {string} code
 * @returns {WasmQTerm}
 */
export function leaf(tag, code) {
    const ptr0 = passStringToWasm0(tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.leaf(ptr0, len0, ptr1, len1);
    return WasmQTerm.__wrap(ret);
}

/**
 * An identifier term (the `⟨N⟩` operator).
 * @param {string} s
 * @returns {WasmQTerm}
 */
export function name(s) {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.name(ptr0, len0);
    return WasmQTerm.__wrap(ret);
}

/**
 * A `Push` command.
 * @param {string} s
 * @returns {WasmStrCmd}
 */
export function push(s) {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.push(ptr0, len0);
    return WasmStrCmd.__wrap(ret);
}

/**
 * Lift a JS value to a term that reconstructs it (the homogeneous `↑`
 * operator, TypeScript into TypeScript). Supports `number`, `string`, and
 * `boolean`. Numbers with no fractional part lift to integer literals;
 * everything is coparse-only, so the tags are advisory.
 *
 * Unlike the Python runtime's `qlift`, this does *not* pass an already-built
 * `QTerm` through unchanged: recovering an exported wasm-bindgen type from a
 * polymorphic `JsValue` needs target-specific glue. The demos never lift a
 * term (terms splice via `↙…↘`), so this is sufficient; a JS shim can add
 * pass-through later if needed.
 * @param {any} value
 * @returns {WasmQTerm}
 */
export function qlift(value) {
    const ret = wasm.qlift(value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmQTerm.__wrap(ret[0]);
}

/**
 * Lift a JS value to an HTML term (the `↑` operator with an `html` splice
 * target). Strings become entity-escaped `text` leaves — inert as text content
 * or as a double-quoted attribute value — and terms pass through unchanged, so
 * already-built fragments can be lifted too. Mirrors `qlift_html` in the
 * Python runtime, minus the `QTerm` pass-through (see [`qlift`]).
 * @param {any} value
 * @returns {WasmQTerm}
 */
export function qlift_html(value) {
    const ret = wasm.qlift_html(value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmQTerm.__wrap(ret[0]);
}

/**
 * A quoted fragment.
 * @param {string} tag
 * @param {number} index
 * @param {string} lang
 * @param {WasmQTerm} term
 * @param {WasmCmdOrHole[]} cmds
 * @returns {WasmQTerm}
 */
export function quote(tag, index, lang, term, cmds) {
    const ptr0 = passStringToWasm0(tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(lang, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(term, WasmQTerm);
    const ptr2 = passArrayJsValueToWasm0(cmds, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.quote(ptr0, len0, index, ptr1, len1, term.__wbg_ptr, ptr2, len2);
    return WasmQTerm.__wrap(ret);
}

/**
 * A symbol: a leaf whose tag and code are the same.
 * @param {string} s
 * @returns {WasmQTerm}
 */
export function sym(s) {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sym(ptr0, len0);
    return WasmQTerm.__wrap(ret);
}

/**
 * Start building a tuple node with the given tag.
 * @param {string} tag
 * @returns {WasmBuilder}
 */
export function tb(tag) {
    const ptr0 = passStringToWasm0(tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.tb(ptr0, len0);
    return WasmBuilder.__wrap(ret);
}

/**
 * An unquoted splice.
 * @param {string} tag
 * @param {number} index
 * @param {string} lang
 * @param {WasmQTerm} term
 * @param {WasmCmdOrHole[]} cmds
 * @returns {WasmQTerm}
 */
export function unquote(tag, index, lang, term, cmds) {
    const ptr0 = passStringToWasm0(tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(lang, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(term, WasmQTerm);
    const ptr2 = passArrayJsValueToWasm0(cmds, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.unquote(ptr0, len0, index, ptr1, len1, term.__wbg_ptr, ptr2, len2);
    return WasmQTerm.__wrap(ret);
}

/**
 * A `Write` command.
 * @param {string} s
 * @returns {WasmStrCmd}
 */
export function write(s) {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.write(ptr0, len0);
    return WasmStrCmd.__wrap(ret);
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_fdd633d4bb5dd76a: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg___wbindgen_boolean_get_edaed31a367ce1bd: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_number_get_1cc01dd708740256: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_71bb4348194e31f0: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_ea4887a5f8f9a9db: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_wasmcmdorhole_unwrap: function(arg0) {
            const ret = WasmCmdOrHole.__unwrap(arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./quilt_wasm_bg.js": import0,
    };
}

const WasmBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmbuilder_free(ptr, 1));
const WasmCmdOrHoleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmcmdorhole_free(ptr, 1));
const WasmQTermFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmqterm_free(ptr, 1));
const WasmStrCmdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmstrcmd_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('quilt_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
