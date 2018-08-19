"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ref(f) {
    return `#${f.name}`;
}
exports.ref = ref;
function include(f) {
    return { include: ref(f) };
}
exports.include = include;
exports.alt = (...rest) => rest.join("|");
exports.capture = (arg) => `(${arg})`;
exports.complement = (...rest) => `[^${rest.join("")}]`;
exports.group = (arg) => `(?:${arg})`;
exports.lookBehind = (arg) => `(?<=${arg})`;
exports.negativeLookBehind = (arg) => `(?<!${arg})`;
function lastWords(...rest) {
    const result = [];
    for (const token of rest)
        result.push(`[^[:word:]]${token}`, `^${token}`);
    return exports.group(exports.seq(exports.lookBehind(exports.group(exports.alt(...result))), exports.negativeLookAhead(exports.set(exports.Class.word))));
}
exports.lastWords = lastWords;
exports.many = (arg) => `${arg}*`;
exports.manyOne = (arg) => `${arg}+`;
exports.opt = (arg) => `${arg}?`;
exports.words = (arg) => `\\b${arg}\\b`;
exports.lookAhead = (arg) => `(?=${arg})`;
exports.negativeLookAhead = (arg) => `(?!${arg})`;
exports.seq = (...rest) => rest.join("");
exports.set = (...rest) => `[${rest.join("")}]`;
exports.Class = {
    alnum: "[:alnum:]",
    alpha: "[:alpha:]",
    ascii: "[:ascii:]",
    blank: "[:blank:]",
    cntrl: "[:cntrl:]",
    digit: "[:digit:]",
    graph: "[:graph:]",
    lower: "[:lower:]",
    print: "[:print:]",
    punct: "[:punct:]",
    space: "[:space:]",
    upper: "[:upper:]",
    word: "[:word:]",
    xdigit: "[:xdigit:]",
};
exports.Token = {
    AND: "and",
    APOSTROPHE: "'",
    AS: "as",
    ASR: "asr",
    ASSERT: "assert",
    ASTERISK: "\\*",
    BEGIN: "begin",
    CLASS: "class",
    COLON: ":",
    COMMA: ",",
    COMMERCIAL_AT: "@",
    CONSTRAINT: "constraint",
    DO: "do",
    DONE: "done",
    DOWNTO: "downto",
    ELSE: "else",
    END: "end",
    EQUALS_SIGN: "=",
    EXCEPTION: "exception",
    EXTERNAL: "external",
    FALSE: "false",
    FOR: "for",
    FULL_STOP: "\\.",
    FUN: "fun",
    FUNCTION: "function",
    FUNCTOR: "functor",
    GREATER_THAN_SIGN: ">",
    HYPHEN_MINUS: "-",
    IF: "if",
    IN: "in",
    INCLUDE: "include",
    INHERIT: "inherit",
    INITIALIZER: "initializer",
    LAND: "land",
    LAZY: "lazy",
    LEFT_CURLY_BRACKET: "\\{",
    LEFT_PARENTHESIS: "\\(",
    LEFT_SQUARE_BRACKET: "\\[",
    LESS_THAN_SIGN: "<",
    LET: "let",
    LOR: "lor",
    LOW_LINE: "_",
    LSL: "lsl",
    LSR: "lsr",
    LXOR: "lxor",
    MATCH: "match",
    METHOD: "method",
    MOD: "mod",
    MODULE: "module",
    MUTABLE: "mutable",
    NEW: "new",
    NONREC: "nonrec",
    NUMBER_SIGN: "#",
    OBJECT: "object",
    OF: "of",
    OPEN: "open",
    OR: "or",
    PERCENT_SIGN: "%",
    PLUS_SIGN: "\\+",
    PRIVATE: "private",
    QUESTION_MARK: "\\?",
    QUOTATION_MARK: '"',
    REC: "rec",
    REVERSE_SOLIDUS: "\\\\",
    RIGHT_CURLY_BRACKET: "\\}",
    RIGHT_PARENTHESIS: "\\)",
    RIGHT_SQUARE_BRACKET: "\\]",
    SEMICOLON: ";",
    SIG: "sig",
    SOLIDUS: "/",
    STRUCT: "struct",
    THEN: "then",
    TILDE: "~",
    TO: "to",
    TRUE: "true",
    TRY: "try",
    TYPE: "type",
    VAL: "val",
    VERTICAL_LINE: "\\|",
    VIRTUAL: "virtual",
    WHEN: "when",
    WHILE: "while",
    WITH: "with",
};
class Scope {
    static ITEM_AND() {
        return `${this.STYLE_OPERATOR()} ${this.STYLE_UNDERLINE()}`;
    }
    static ITEM_CLASS() {
        return `entity.name.class constant.numeric ${this.STYLE_UNDERLINE()}`;
    }
    static ITEM_EXTERNAL() {
        return `entity.name.class constant.numeric ${this.STYLE_UNDERLINE()}`;
    }
    static ITEM_INCLUDE() {
        return this.STYLE_OPERATOR();
    }
    static ITEM_LET() {
        return `${this.STYLE_CONTROL()} ${this.STYLE_UNDERLINE()}`;
    }
    static ITEM_METHOD() {
        return `${this.STYLE_BINDER()} ${this.STYLE_UNDERLINE()}`;
    }
    static ITEM_MODULE() {
        return `markup.inserted constant.language support.constant.property-value entity.name.filename ${this.STYLE_UNDERLINE()}`;
    }
    static ITEM_OPEN() {
        return this.STYLE_OPERATOR();
    }
    static ITEM_TYPE() {
        return `${this.STYLE_KEYWORD()} ${this.STYLE_UNDERLINE()}`;
    }
    static ITEM_VAL() {
        return `support.type ${this.STYLE_UNDERLINE()}`;
    }
    static KEYWORD_AS() {
        return this.STYLE_OPERATOR();
    }
    static KEYWORD_REC() {
        return this.STYLE_OPERATOR();
    }
    static KEYWORD_WHEN() {
        return this.STYLE_OPERATOR();
    }
    static LITERAL_OBJECT() {
        return `${this.STYLE_DELIMITER()} ${this.STYLE_ITALICS()}`;
    }
    static LITERAL_SIGNATURE() {
        return `${this.STYLE_DELIMITER()} ${this.STYLE_ITALICS()}`;
    }
    static LITERAL_STRUCTURE() {
        return `${this.STYLE_DELIMITER()} ${this.STYLE_ITALICS()}`;
    }
    static META_COMMENT() {
        return "comment constant.regexp meta.separator.markdown";
    }
    static MODULE_FUNCTOR() {
        return "variable.other.class.js variable.interpolation keyword.operator keyword.control message.error";
    }
    static MODULE_SIG() {
        return this.STYLE_DELIMITER();
    }
    static MODULE_STRUCT() {
        return this.STYLE_DELIMITER();
    }
    static NAME_FIELD() {
        return `markup.inserted constant.language support.constant.property-value entity.name.filename`;
    }
    static NAME_FUNCTION() {
        return `entity.name.function ${this.STYLE_BOLD()} ${this.STYLE_ITALICS()}`;
    }
    static NAME_METHOD() {
        return "entity.name.function";
    }
    static NAME_MODULE() {
        return "entity.name.class constant.numeric";
    }
    static PUNCTUATION_QUOTE() {
        return `markup.punctuation.quote.beginning ${this.STYLE_BOLD()} ${this.STYLE_ITALICS()}`;
    }
    static SIGNATURE_WITH() {
        return `${this.STYLE_OPERATOR()} ${this.STYLE_UNDERLINE()}`;
    }
    static NAME_TYPE() {
        return `entity.name.function ${this.STYLE_BOLD()} ${this.STYLE_ITALICS()}`;
    }
    static OPERATOR_TYPE() {
        return `${this.STYLE_OPERATOR()} ${this.STYLE_BOLD()}`;
    }
    static PUNCTUATION_APOSTROPHE() {
        return `${this.VARIABLE_PATTERN()} ${this.STYLE_BOLD()} ${this.STYLE_ITALICS()}`;
    }
    static PUNCTUATION_COLON() {
        return `${this.STYLE_OPERATOR()} ${this.STYLE_BOLD()}`;
    }
    static PUNCTUATION_COMMA() {
        return `string.regexp ${this.STYLE_BOLD()}`;
    }
    static PUNCTUATION_DOT() {
        return `${this.STYLE_KEYWORD()} ${this.STYLE_BOLD()}`;
    }
    static PUNCTUATION_EQUALS() {
        return `support.type ${this.STYLE_BOLD()}`;
    }
    static PUNCTUATION_PERCENT_SIGN() {
        return `${this.STYLE_OPERATOR()} ${this.STYLE_BOLD()}`;
    }
    static STYLE_BINDER() {
        return "storage.type";
    }
    static STYLE_BOLD() {
        return "strong";
    }
    static STYLE_CONTROL() {
        return "keyword.control";
    }
    static STYLE_DELIMITER() {
        return "punctuation.definition.tag";
    }
    static STYLE_ITALICS() {
        return "emphasis";
    }
    static STYLE_KEYWORD() {
        return "keyword";
    }
    static STYLE_OPERATOR() {
        return "variable.other.class.js message.error variable.interpolation string.regexp";
    }
    static STYLE_PUNCTUATION() {
        return "string.regexp";
    }
    static STYLE_UNDERLINE() {
        return "markup.underline";
    }
    static TERM_BUILTIN() {
        return this.STYLE_OPERATOR();
    }
    static TERM_CHARACTER() {
        return "markup.punctuation.quote.beginning";
    }
    static TERM_CONSTRUCTOR() {
        return `constant.language constant.numeric entity.other.attribute-name.id.css ${this.STYLE_BOLD()}`;
    }
    static TERM_FUN() {
        return this.STYLE_BINDER();
    }
    static TERM_FUNCTION() {
        return this.STYLE_BINDER();
    }
    static TERM_IF() {
        return this.STYLE_CONTROL();
    }
    static TERM_IN() {
        return `${this.STYLE_BINDER()} ${this.STYLE_UNDERLINE()}`;
    }
    static TERM_LET() {
        return `${this.STYLE_BINDER()} ${this.STYLE_UNDERLINE()}`;
    }
    static TERM_MODULE() {
        return "markup.inserted constant.language support.constant.property-value entity.name.filename";
    }
    static TERM_NUMBER() {
        return "constant.numeric";
    }
    static TERM_STRING() {
        return "string beginning.punctuation.definition.quote.markdown";
    }
    static TYPE_CONSTRUCTOR() {
        return `entity.name.function ${this.STYLE_BOLD()}`;
    }
    static VARIABLE_PATTERN() {
        return `string.other.link variable.language variable.parameter ${this.STYLE_ITALICS()}`;
    }
    static VARIABLE_TYPE() {
        return `${this.STYLE_CONTROL()} ${this.STYLE_ITALICS()}`;
    }
    static VERTICAL_LINE() {
        return `support.type ${this.STYLE_BOLD()}`;
    }
}
exports.Scope = Scope;
//# sourceMappingURL=basis.js.map