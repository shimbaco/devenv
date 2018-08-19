"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basis = require("./basis");
const { Class, capture, include, lookAhead, manyOne, opt, seq, set } = basis;
const Scope = {
    comment: {
        line: {
            semicolon: "comment.line.semicolon.dune",
        },
    },
    punctuation: {
        definition: {},
        whitespace: {
            comment: {
                leading: "punctuation.whitespace.comment.leading.dune",
            },
        },
    },
};
const Token = {
    ACTION: "action",
    ALIAS_REC: "alias_rec",
    ALIAS: "alias",
    ALLOW_OVERLAPPING_DEPENDENCIES: "allow_overlapping_dependencies",
    APOSTROPHE: "'",
    ARCH_SIXTYFOUR: "ARCH_SIXTYFOUR",
    ASTERISK: "\\*",
    BASH: "bash",
    BEST: "best",
    BIN: "bin",
    BYTE: "byte",
    C_FLAGS: "c_flags",
    C_LIBRARY_FLAGS: "c_library_flags",
    C_NAMES: "c_names",
    CAT: "cat",
    CHDIR: "chdir",
    CIRCUMFLEX_ACCENT: "^",
    COLON: ":",
    COMMA: ",",
    COMMERCIAL_AT: "@",
    COPY_FILES: "copy_files",
    COPY: "copy",
    CXX_FLAGS: "cxx_flags",
    CXX_NAMES: "cxx_names",
    DEPS: "deps",
    DIFF: "diff",
    DOC: "doc",
    ECHO: "echo",
    EQUALS_SIGN: "=",
    ETC: "etc",
    EXE: "exe",
    EXECUTABLE: "executable",
    EXT_ASM: "ext_asm",
    EXT_DLL: "ext_dll",
    EXT_EXE: "ext_exe",
    EXT_LIB: "ext_lib",
    EXT_OBJ: "ext_obj",
    FALLBACK: "fallback",
    FILES_RECURSIVELY_IN: "files_recursively_in",
    FLAGS: "flags",
    FULL_STOP: "\\.",
    GLOB_FILES: "glob_files",
    GREATER_THAN_SIGN: ">",
    HYPHEN_MINUS: "-",
    IGNORE: "ignore",
    INCLUDE: "include",
    INSTALL_C_HEADERS: "install_c_headers",
    INSTALL: "install",
    JAVASCRIPT_FILES: "javascript_files",
    JBUILD_VERSION: "jbuild_version",
    JS_OF_OCAML: "js_of_ocaml",
    KIND: "kind",
    LEFT_CURLY_BRACKET: "\\{",
    LEFT_PARENTHESIS: "\\(",
    LEFT_SQUARE_BRACKET: "\\[",
    LESS_THAN_SIGN: "<",
    LIB_AVAILABLE: "lib-available",
    LIB: "lib",
    LIBEXEC: "libexec",
    LIBRARIES: "libraries",
    LIBRARY_FLAGS: "library_flags",
    LIBRARY: "library",
    LINK_FLAGS: "link_flags",
    LOCKS: "locks",
    LOW_LINE: "_",
    MAN: "man",
    MENHIR: "menhir",
    MERGE_INTO: "merge_into",
    MISC: "misc",
    MODE: "mode",
    MODES: "modes",
    MODULES_WITHOUT_IMPLEMENTATION: "modules_without_implementation",
    MODULES: "modules",
    NAME: "name",
    NATIVE: "native",
    NO_DYNLINK: "no_dynlink",
    NORMAL: "normal",
    NULL: "null",
    NUMBER_SIGN: "#",
    OBJECT: "object",
    OCAML_BIN: "ocaml_bin",
    OCAML_CONFIG: "ocaml-config",
    OCAML_VERSION: "ocaml_version",
    OCAML_WHERE: "ocaml_where",
    OCAML: "OCAML",
    OCAMLC_FLAGS: "ocamlc_flags",
    OCAMLC: "OCAMLC",
    OCAMLLEX: "ocamllex",
    OCAMLOPT_FLAGS: "ocamlopt_flags",
    OCAMLOPT: "OCAMLOPT",
    OCAMLYACC: "ocamlyacc",
    OPTIONAL: "optional",
    PACKAGE: "package",
    PATH_NO_DEP: "path-no-dep",
    PATH: "path",
    PERCENT_SIGN: "%",
    PLUS_SIGN: "\\+",
    PPS: "pps",
    PPX_DERIVER: "ppx_deriver",
    PPX_REWRITER: "ppx_rewriter",
    PPX_RUNTIME_LIBRARIES: "ppx_runtime_libraries",
    PREPROCESS: "preprocess",
    PREPROCESSOR_DEPS: "preprocessor_deps",
    PROGN: "progn",
    PROMOTE_UNTIL_CLEAN: "promote-until-clean",
    PROMOTE: "promote",
    PUBLIC_NAME: "public_name",
    QUESTION_MARK: "\\?",
    QUOTATION_MARK: '"',
    READ_LINES: "read-lines",
    READ_STRINGS: "read-strings",
    READ: "read",
    REVERSE_SOLIDUS: "\\\\",
    RIGHT_CURLY_BRACKET: "\\}",
    RIGHT_PARENTHESIS: "\\)",
    RIGHT_SQUARE_BRACKET: "\\]",
    RIGHTWARDS_ARROW: "->",
    ROOT: "ROOT",
    RULE: "rule",
    RUN: "run",
    SBIN: "sbin",
    SELECT: "select",
    SELF_BUILD_STUBS_ARCHIVE: "self_build_stubs_archive",
    SEMICOLON: ";",
    SETENV: "setenv",
    SHARE_ROOT: "share_root",
    SHARE: "share",
    SHARED_OBJECT: "shared_object",
    SOLIDUS: "/",
    STANDARD: "standard",
    STUBLIBS: "stublibs",
    SYNOPSIS: "synopsis",
    SYSTEM: "system",
    TARGETS: "targets",
    TILDE: "~",
    TO: "to",
    TOPLEVEL: "toplevel",
    UNIVERSE: "universe",
    VERSION: "version",
    VERTICAL_LINE: "\\|",
    VIRTUAL_DEPS: "virtual_deps",
    WITH: "with",
    WRAPPED: "wrapped",
    WRITE_FILE: "write-file",
};
class Dune {
    constructor() {
        return this;
    }
    commentBlock() {
        return {
            begin: Token.SEMICOLON,
            end: Token.CIRCUMFLEX_ACCENT,
        };
    }
    commentLine() {
        return {
            begin: seq(opt(capture(seq(Token.CIRCUMFLEX_ACCENT, manyOne(set(Class.space))))), capture(Token.SEMICOLON)),
            beginCaptures: {
                1: { name: Scope.punctuation.whitespace.comment.leading },
                2: { name: Scope.comment.line.semicolon },
            },
            end: lookAhead(Token.CIRCUMFLEX_ACCENT),
            contentName: Scope.comment.line.semicolon,
        };
    }
    commentSExpression() {
        return {
            begin: "",
            end: "",
        };
    }
    sExpression() {
        return {
            begin: "",
            end: "",
        };
    }
    stanza() {
        return {
            patterns: [
                include(this.stanzaAlias),
                include(this.stanzaCopyFiles),
                include(this.stanzaExecutable),
                include(this.stanzaExecutables),
                include(this.stanzaInclude),
                include(this.stanzaInstall),
                include(this.stanzaJbuildVersion),
                include(this.stanzaLibrary),
                include(this.stanzaMenhir),
                include(this.stanzaOCamlLex),
                include(this.stanzaOCamlYacc),
                include(this.stanzaRule),
            ],
        };
    }
    stanzaAlias() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaCopyFiles() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaExecutable() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaExecutables() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaInclude() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaInstall() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaJbuildVersion() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaLibrary() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaMenhir() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaOCamlLex() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaOCamlYacc() {
        return {
            begin: "",
            end: "",
        };
    }
    stanzaRule() {
        return {
            begin: "",
            end: "",
        };
    }
    render() {
        return {
            name: `Dune`,
            scopeName: `source.ocaml.dune`,
            fileTypes: [`dune`, `jbuild`],
            patterns: [],
            repository: {
                commentBlock: this.commentBlock(),
                commentLine: this.commentLine(),
                commentSExpression: this.commentSExpression(),
                sExpression: this.sExpression(),
                stanza: this.stanza(),
                stanzaAlias: this.stanzaAlias(),
                stanzaCopyFiles: this.stanzaCopyFiles(),
                stanzaExecutable: this.stanzaExecutable(),
                stanzaExecutables: this.stanzaExecutables(),
                stanzaInclude: this.stanzaInclude(),
                stanzaInstall: this.stanzaInstall(),
                stanzaJbuildVersion: this.stanzaJbuildVersion(),
                stanzaLibrary: this.stanzaLibrary(),
                stanzaMenhir: this.stanzaMenhir(),
                stanzaOCamllex: this.stanzaOCamlLex(),
                stanzaOCamlYacc: this.stanzaOCamlYacc(),
                stanzaRule: this.stanzaRule(),
            },
        };
    }
}
exports.Dune = Dune;
exports.default = new Dune().render();
//# sourceMappingURL=dune.js.map