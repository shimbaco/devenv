"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basis = require("./basis");
const { Class, Scope, Token, alt, capture, complement, group, include, lastWords, lookAhead, lookBehind, many, manyOne, negativeLookAhead, negativeLookBehind, opt, ref, seq, set, words, } = basis;
class OCaml {
    constructor() {
        return this;
    }
    boundary() {
        return `\\b`;
    }
    declEnd() {
        return lookAhead(alt(seq(Token.SEMICOLON, Token.SEMICOLON), Token.RIGHT_CURLY_BRACKET, Token.RIGHT_PARENTHESIS, Token.RIGHT_SQUARE_BRACKET, words(group(alt(...this.declEndTokens())))));
    }
    declEndItem() {
        return this.declEndItemWith(seq(Token.SEMICOLON, Token.SEMICOLON));
    }
    declEndItemWith(...rest) {
        return alt(...rest, lookAhead(alt(Token.RIGHT_CURLY_BRACKET, Token.RIGHT_PARENTHESIS, Token.RIGHT_SQUARE_BRACKET, words(group(alt(...this.declEndTokens()))))));
    }
    declEndSans(...elems) {
        return lookAhead(alt(Token.RIGHT_CURLY_BRACKET, Token.RIGHT_PARENTHESIS, Token.RIGHT_SQUARE_BRACKET, words(group(alt(...this.declEndTokens().filter(x => !elems.includes(x)))))));
    }
    declEndTokens() {
        return [Token.END, ...this.declStartTokens()];
    }
    declStartTokens() {
        return [
            Token.AND,
            Token.CLASS,
            Token.EXCEPTION,
            Token.EXTERNAL,
            Token.IN,
            Token.INCLUDE,
            Token.INHERIT,
            Token.INITIALIZER,
            Token.LET,
            Token.METHOD,
            Token.MODULE,
            Token.OPEN,
            Token.TYPE,
            Token.VAL,
        ];
    }
    attribute() {
        return {
            begin: seq(capture(Token.LEFT_SQUARE_BRACKET), many(set(Class.space)), capture(this.ops(`${Token.COMMERCIAL_AT}{1,3}`))),
            end: Token.RIGHT_SQUARE_BRACKET,
            beginCaptures: {
                1: { name: Scope.TERM_CONSTRUCTOR() },
                2: { name: Scope.STYLE_OPERATOR() },
            },
            endCaptures: {
                0: { name: Scope.TERM_CONSTRUCTOR() },
            },
            patterns: [include(this.attributePayload)],
        };
    }
    attributeIdentifier() {
        return {
            match: seq(capture(this.ops(Token.PERCENT_SIGN)), capture(this.identLower())),
            captures: {
                1: { name: Scope.PUNCTUATION_PERCENT_SIGN() },
                2: { name: Scope.STYLE_DELIMITER() },
            },
        };
    }
    attributePayload() {
        return {
            patterns: [
                {
                    begin: this.lastOps(Token.PERCENT_SIGN),
                    end: alt(capture(this.ops(set(Token.COLON, Token.QUESTION_MARK))), lookBehind(set(Class.space))),
                    endCaptures: {
                        1: { name: Scope.STYLE_OPERATOR() },
                    },
                    patterns: [include(this.pathModuleExtended), include(this.pathRecord)],
                },
                {
                    begin: this.lastOps(Token.COLON),
                    end: lookAhead(Token.RIGHT_SQUARE_BRACKET),
                    patterns: [include(this.signature), include(this.type)],
                },
                {
                    begin: this.lastOps(Token.QUESTION_MARK),
                    end: lookAhead(Token.RIGHT_SQUARE_BRACKET),
                    patterns: [
                        {
                            begin: this.lastOps(Token.QUESTION_MARK),
                            end: alt(lookAhead(Token.RIGHT_SQUARE_BRACKET), words(Token.WHEN)),
                            endCaptures: {
                                1: { name: Scope.STYLE_OPERATOR },
                            },
                            patterns: [include(this.pattern)],
                        },
                        {
                            begin: lastWords(Token.WHEN),
                            end: lookAhead(Token.RIGHT_SQUARE_BRACKET),
                            patterns: [include(this.term)],
                        },
                    ],
                },
                include(this.term),
            ],
        };
    }
    escapes(...rest) {
        return {
            match: seq(Token.REVERSE_SOLIDUS, group(alt(set(Token.REVERSE_SOLIDUS, Token.QUOTATION_MARK, ...rest, ...["n", "t", "b", "r"]), seq(set(Class.digit), set(Class.digit), set(Class.digit)), seq("x", set(Class.xdigit), set(Class.xdigit)), seq("o", set("0-3"), set("0-7"), set("0-7"))))),
        };
    }
    expEnd() {
        return lookAhead(alt(Token.COMMA, Token.RIGHT_CURLY_BRACKET, Token.RIGHT_PARENTHESIS, Token.RIGHT_SQUARE_BRACKET, words(group(alt(...this.declEndTokens())))));
    }
    functor(ruleBody) {
        return [
            {
                begin: words(Token.FUNCTOR),
                end: this.declEnd(),
                beginCaptures: {
                    0: { name: Scope.STYLE_KEYWORD() },
                },
                patterns: [
                    {
                        begin: lastWords(Token.FUNCTOR),
                        end: alt(capture(seq(Token.LEFT_PARENTHESIS, Token.RIGHT_PARENTHESIS)), capture(seq(Token.LEFT_PARENTHESIS, negativeLookAhead(Token.RIGHT_PARENTHESIS)))),
                        endCaptures: {
                            1: { name: Scope.TERM_CONSTRUCTOR() },
                            2: { name: Scope.STYLE_DELIMITER() },
                        },
                    },
                    {
                        begin: lookBehind(Token.LEFT_PARENTHESIS),
                        end: alt(capture(Token.COLON), capture(Token.RIGHT_PARENTHESIS)),
                        endCaptures: {
                            1: { name: Scope.PUNCTUATION_COLON() },
                            2: { name: Scope.STYLE_DELIMITER() },
                        },
                        patterns: [include(this.variableModule)],
                    },
                    {
                        begin: this.lastOps(Token.COLON),
                        end: Token.RIGHT_PARENTHESIS,
                        endCaptures: {
                            0: { name: Scope.STYLE_DELIMITER() },
                        },
                        patterns: [include(this.signature)],
                    },
                    {
                        begin: lookBehind(Token.RIGHT_PARENTHESIS),
                        end: alt(capture(Token.LEFT_PARENTHESIS), capture(this.ops(seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN)))),
                        endCaptures: {
                            1: { name: Scope.STYLE_DELIMITER() },
                            2: { name: Scope.PUNCTUATION_EQUALS() },
                        },
                    },
                    {
                        begin: this.lastOps(seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN)),
                        end: this.declEnd(),
                        patterns: [include(ruleBody)],
                    },
                ],
            },
            {
                match: this.ops(seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN)),
                name: Scope.PUNCTUATION_EQUALS(),
            },
        ];
    }
    ident() {
        return seq(set(Class.alpha, `_`), many(set(Class.word, `'`)));
    }
    identLower() {
        return group(seq(negativeLookAhead(seq(words(group(alt(...Object.keys(Token)
            .filter(key => key !== "LOW_LINE")
            .map(key => Token[key])))), group(alt(complement(Token.APOSTROPHE), `$`)))), seq(this.boundary(), lookAhead(set(Class.lower, `_`)), this.ident())));
    }
    identLowerPath() {
        return group(seq(negativeLookAhead(seq(words(group(alt(...Object.keys(Token)
            .filter(key => key !== "LOW_LINE" && key !== "NEW" && key !== "MODULE")
            .map(key => Token[key])))), group(alt(complement(Token.APOSTROPHE), `$`)))), seq(this.boundary(), lookAhead(set(Class.lower, `_`)), this.ident())));
    }
    identUpper() {
        return group(seq(seq(this.boundary(), lookAhead(set(Class.upper)), this.ident())));
    }
    parens(ruleLHS, ruleRHS) {
        return {
            begin: seq(Token.LEFT_PARENTHESIS, negativeLookAhead(Token.RIGHT_PARENTHESIS)),
            end: Token.RIGHT_PARENTHESIS,
            captures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                { include: `#comment` },
                {
                    begin: this.ops(Token.COLON),
                    end: lookAhead(Token.RIGHT_PARENTHESIS),
                    beginCaptures: {
                        0: { name: Scope.PUNCTUATION_COLON() },
                    },
                    patterns: [{ include: ruleRHS }],
                },
                { include: ruleLHS },
            ],
        };
    }
    bindClassWith(...rest) {
        return {
            patterns: [
                {
                    begin: lastWords(Token.AND, Token.CLASS, Token.TYPE),
                    end: alt(this.ops(alt(capture(Token.COLON), capture(Token.EQUALS_SIGN))), this.declEnd()),
                    endCaptures: {
                        1: { name: Scope.PUNCTUATION_COLON() },
                        2: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [
                        {
                            begin: lastWords(Token.AND, Token.CLASS, Token.TYPE),
                            end: alt(lookAhead(alt(seq(this.identLower(), many(set(Class.space)), Token.COMMA), complement(Class.space, Class.lower, Token.PERCENT_SIGN))), this.identLower(), lookAhead(words(Token.TYPE))),
                            endCaptures: {
                                0: { name: Scope.NAME_FUNCTION() },
                            },
                            patterns: [include(this.attributeIdentifier)],
                        },
                        {
                            begin: Token.LEFT_SQUARE_BRACKET,
                            end: Token.RIGHT_SQUARE_BRACKET,
                            captures: {
                                0: { name: Scope.STYLE_DELIMITER() },
                            },
                            patterns: [include(this.type)],
                        },
                        include(this.bindTermArgs),
                    ],
                },
                {
                    begin: this.lastOps(Token.COLON),
                    end: alt(this.ops(Token.EQUALS_SIGN), this.declEndSans(Token.TYPE)),
                    endCaptures: {
                        0: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [include(this.literalClassType)],
                },
                {
                    begin: this.lastOps(Token.EQUALS_SIGN),
                    end: alt(words(Token.AND), this.declEnd()),
                    endCaptures: {
                        0: { name: Scope.ITEM_AND() },
                    },
                    patterns: [...rest],
                },
            ],
        };
    }
    bindClassTerm() {
        return this.bindClassWith(include(this.term));
    }
    bindClassType() {
        return this.bindClassWith(include(this.literalClassType));
    }
    bindConstructor() {
        return {
            patterns: [
                {
                    begin: alt(lastWords(Token.EXCEPTION), this.lastOps(seq(Token.PLUS_SIGN, Token.EQUALS_SIGN), Token.EQUALS_SIGN, Token.VERTICAL_LINE)),
                    end: alt(capture(Token.COLON), capture(words(Token.OF)), capture(this.ops(Token.VERTICAL_LINE)), this.declEnd()),
                    endCaptures: {
                        1: { name: Scope.PUNCTUATION_COLON() },
                        2: { name: Scope.STYLE_DELIMITER() },
                        3: { name: Scope.VERTICAL_LINE() },
                    },
                    patterns: [
                        include(this.attributeIdentifier),
                        {
                            match: seq(Token.FULL_STOP, Token.FULL_STOP),
                            name: Scope.STYLE_OPERATOR(),
                        },
                        {
                            match: seq(words(this.identUpper()), negativeLookAhead(seq(many(set(Class.space)), group(alt(Token.FULL_STOP, seq(Token.LEFT_PARENTHESIS, complement(Token.ASTERISK))))))),
                            name: Scope.TERM_CONSTRUCTOR(),
                        },
                        include(this.type),
                    ],
                },
                {
                    begin: alt(this.lastOps(Token.COLON), lastWords(Token.OF)),
                    end: alt(this.ops(Token.VERTICAL_LINE), this.declEnd()),
                    endCaptures: {
                        0: { name: Scope.VERTICAL_LINE() },
                    },
                    patterns: [include(this.type)],
                },
            ],
        };
    }
    bindSignature() {
        return {
            patterns: [
                include(this.comment),
                {
                    begin: lastWords(Token.TYPE),
                    end: this.ops(Token.EQUALS_SIGN),
                    endCaptures: {
                        0: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [include(this.comment), include(this.pathModuleExtended)],
                },
                {
                    begin: this.lastOps(Token.EQUALS_SIGN),
                    end: alt(words(Token.AND), this.declEnd()),
                    endCaptures: {
                        0: { name: Scope.ITEM_AND() },
                    },
                    patterns: [include(this.signature)],
                },
            ],
        };
    }
    bindStructure() {
        return {
            patterns: [
                include(this.comment),
                {
                    begin: alt(lastWords(Token.AND), lookAhead(set(Class.upper))),
                    end: alt(this.ops(alt(capture(seq(Token.COLON, negativeLookAhead(Token.EQUALS_SIGN))), capture(seq(opt(Token.COLON), Token.EQUALS_SIGN)))), this.declEndSans(Token.MODULE)),
                    endCaptures: {
                        1: { name: Scope.PUNCTUATION_COLON() },
                        2: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [
                        include(this.comment),
                        {
                            match: words(Token.MODULE),
                            name: Scope.TERM_MODULE(),
                        },
                        {
                            match: this.identUpper(),
                            name: Scope.NAME_FUNCTION(),
                        },
                        this.parens(ref(this.variableModule), ref(this.signature)),
                        include(this.literalUnit),
                    ],
                },
                {
                    begin: this.lastOps(Token.COLON),
                    end: alt(words(capture(Token.AND)), capture(this.ops(Token.EQUALS_SIGN)), this.declEnd()),
                    endCaptures: {
                        1: { name: Scope.ITEM_AND() },
                        2: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [include(this.signature)],
                },
                {
                    begin: this.lastOps(seq(Token.COLON, Token.EQUALS_SIGN), Token.EQUALS_SIGN),
                    end: alt(words(group(alt(capture(Token.AND), capture(Token.WITH)))), this.declEnd()),
                    endCaptures: {
                        1: { name: Scope.ITEM_AND() },
                        2: { name: Scope.SIGNATURE_WITH() },
                    },
                    patterns: [include(this.structure)],
                },
            ],
        };
    }
    bindTerm() {
        return this.bindTermWith(Token.EQUALS_SIGN);
    }
    bindTermWith(...startBody) {
        return {
            patterns: [
                {
                    begin: alt(this.lastOps("!"), lastWords(Token.AND, Token.EXTERNAL, Token.LET, Token.METHOD, Token.VAL)),
                    end: alt(capture(words(Token.MODULE)), capture(words(Token.OPEN)), this.ops(alt(capture(Token.COLON), capture(this.ops(alt(...startBody))))), this.declEnd()),
                    endCaptures: {
                        1: { name: Scope.TERM_MODULE() },
                        2: { name: Scope.ITEM_OPEN() },
                        3: { name: Scope.PUNCTUATION_COLON() },
                        4: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [
                        {
                            begin: alt(this.lastOps("!"), lastWords(Token.AND, Token.EXTERNAL, Token.LET, Token.METHOD, Token.VAL)),
                            end: alt(lookAhead(words(group(alt(Token.MODULE, Token.OPEN)))), lookAhead(alt(seq(this.identLower(), many(set(Class.space)), Token.COMMA), complement(Class.space, Class.lower, Token.PERCENT_SIGN))), capture(words(Token.REC)), capture(this.identLower())),
                            endCaptures: {
                                1: { name: Scope.KEYWORD_REC() },
                                2: { name: Scope.NAME_FUNCTION() },
                            },
                            patterns: [include(this.attributeIdentifier), include(this.comment)],
                        },
                        {
                            begin: lastWords(Token.REC),
                            end: alt(capture(this.identLower()), lookAhead(complement(Class.space, Class.alpha))),
                            endCaptures: {
                                0: { name: Scope.NAME_FUNCTION() },
                            },
                            patterns: [include(this.bindTermArgs)],
                        },
                        include(this.bindTermArgs),
                    ],
                },
                {
                    begin: lastWords(Token.MODULE),
                    end: this.declEnd(),
                    patterns: [include(this.declModule)],
                },
                {
                    begin: lastWords(Token.OPEN),
                    end: this.declEndItemWith(lookAhead(words(Token.IN))),
                    patterns: [include(this.pathModuleSimple)],
                },
                {
                    begin: this.lastOps(Token.COLON),
                    end: alt(this.ops(alt(...startBody)), this.declEnd()),
                    endCaptures: {
                        0: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [
                        {
                            begin: this.lastOps(Token.COLON),
                            end: alt(words(Token.TYPE), lookAhead(complement(Class.space))),
                            endCaptures: {
                                0: { name: Scope.STYLE_CONTROL() },
                            },
                        },
                        {
                            begin: lastWords(Token.TYPE),
                            end: this.ops(Token.FULL_STOP),
                            endCaptures: {
                                0: { name: Scope.STYLE_OPERATOR() },
                            },
                            patterns: [include(this.pattern)],
                        },
                        include(this.type),
                    ],
                },
                {
                    begin: this.lastOps(...startBody),
                    end: alt(words(Token.AND), this.declEnd()),
                    endCaptures: {
                        0: { name: Scope.ITEM_AND() },
                    },
                    patterns: [include(this.term)],
                },
            ],
        };
    }
    bindTermArgs() {
        return {
            patterns: [
                {
                    begin: alt(Token.TILDE, Token.QUESTION_MARK),
                    end: alt(Token.COLON, lookAhead(complement(Class.space))),
                    applyEndPatternLast: true,
                    beginCaptures: {
                        0: { name: Scope.STYLE_OPERATOR() },
                    },
                    endCaptures: {
                        0: { name: Scope.STYLE_KEYWORD() },
                    },
                    patterns: [
                        {
                            begin: this.lastOps(Token.TILDE, Token.QUESTION_MARK),
                            end: alt(this.identLower(), lookBehind(Token.RIGHT_PARENTHESIS)),
                            endCaptures: {
                                0: { name: Scope.NAME_FIELD() },
                            },
                            patterns: [
                                include(this.comment),
                                {
                                    begin: seq(Token.LEFT_PARENTHESIS, negativeLookAhead(Token.ASTERISK)),
                                    end: Token.RIGHT_PARENTHESIS,
                                    captures: {
                                        0: { name: Scope.STYLE_DELIMITER() },
                                    },
                                    patterns: [
                                        {
                                            begin: lookBehind(Token.LEFT_PARENTHESIS),
                                            end: alt(Token.COLON, Token.EQUALS_SIGN),
                                            endCaptures: {
                                                0: { name: Scope.STYLE_KEYWORD() },
                                            },
                                            patterns: [
                                                {
                                                    match: this.identLower(),
                                                    name: Scope.NAME_FIELD(),
                                                },
                                            ],
                                        },
                                        {
                                            begin: lookBehind(Token.COLON),
                                            end: alt(Token.EQUALS_SIGN, lookAhead(Token.RIGHT_PARENTHESIS)),
                                            endCaptures: {
                                                0: { name: Scope.STYLE_KEYWORD() },
                                            },
                                            patterns: [include(this.type)],
                                        },
                                        {
                                            begin: this.lastOps(Token.EQUALS_SIGN),
                                            end: lookAhead(Token.RIGHT_PARENTHESIS),
                                            patterns: [include(this.term)],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                include(this.pattern),
            ],
        };
    }
    bindType() {
        return {
            patterns: [
                {
                    begin: lastWords(Token.AND, Token.TYPE),
                    end: alt(this.ops(alt(seq(Token.PLUS_SIGN, Token.EQUALS_SIGN), Token.EQUALS_SIGN)), this.declEnd()),
                    endCaptures: {
                        0: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [
                        include(this.attributeIdentifier),
                        include(this.pathType),
                        {
                            match: this.identLower(),
                            name: Scope.TYPE_CONSTRUCTOR(),
                        },
                        include(this.type),
                    ],
                },
                {
                    begin: this.lastOps(seq(Token.PLUS_SIGN, Token.EQUALS_SIGN), Token.EQUALS_SIGN),
                    end: alt(words(Token.AND), this.declEnd()),
                    endCaptures: {
                        0: { name: Scope.ITEM_AND() },
                    },
                    patterns: [include(this.bindConstructor)],
                },
            ],
        };
    }
    comment() {
        return {
            patterns: [
                include(this.attribute),
                include(this.extension),
                include(this.commentBlock),
                include(this.commentDoc),
            ],
        };
    }
    commentBlock() {
        return this.commentBlockWith(Token.LEFT_PARENTHESIS, Token.RIGHT_PARENTHESIS);
    }
    commentBlockWith(begin, end) {
        return {
            begin: seq(begin, Token.ASTERISK, negativeLookAhead(seq(Token.ASTERISK, complement(end)))),
            end: seq(Token.ASTERISK, end),
            name: Scope.META_COMMENT(),
            contentName: Scope.STYLE_ITALICS(),
            patterns: [include(this.commentBlock), include(this.commentDoc)],
        };
    }
    commentDoc() {
        return this.commentDocWith(Token.LEFT_PARENTHESIS, Token.RIGHT_PARENTHESIS);
    }
    commentDocWith(begin, end) {
        return {
            begin: seq(begin, Token.ASTERISK, Token.ASTERISK),
            end: seq(Token.ASTERISK, end),
            name: Scope.META_COMMENT(),
            contentName: Scope.STYLE_ITALICS,
            patterns: [{ match: Token.ASTERISK }, include(this.comment)],
        };
    }
    decl() {
        return {
            patterns: [
                include(this.declClass),
                include(this.declException),
                include(this.declInclude),
                include(this.declModule),
                include(this.declOpen),
                include(this.declTerm),
                include(this.declType),
            ],
        };
    }
    declClass() {
        return {
            begin: words(Token.CLASS),
            end: this.declEndItem(),
            beginCaptures: {
                0: { name: Scope.ITEM_CLASS() },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                include(this.comment),
                include(this.pragma),
                {
                    begin: lastWords(Token.CLASS),
                    end: alt(words(Token.TYPE), this.declEndSans(Token.TYPE)),
                    beginCaptures: {
                        0: { name: Scope.ITEM_CLASS() },
                    },
                    endCaptures: {
                        0: { name: Scope.STYLE_KEYWORD() },
                    },
                    patterns: [include(this.bindClassTerm)],
                },
                {
                    begin: lastWords(Token.TYPE),
                    end: this.declEnd(),
                    patterns: [include(this.bindClassType)],
                },
            ],
        };
    }
    declException() {
        return {
            begin: words(Token.EXCEPTION),
            end: this.declEndItem(),
            beginCaptures: {
                0: { name: `keyword ${Scope.STYLE_UNDERLINE()}` },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                include(this.attributeIdentifier),
                include(this.comment),
                include(this.pragma),
                include(this.bindConstructor),
            ],
        };
    }
    declInclude() {
        return {
            begin: words(Token.INCLUDE),
            end: this.declEndItem(),
            beginCaptures: {
                0: { name: Scope.ITEM_INCLUDE() },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                include(this.attributeIdentifier),
                include(this.comment),
                include(this.pragma),
                include(this.signature),
            ],
        };
    }
    declInherit(...rest) {
        return {
            begin: words(Token.INHERIT),
            end: this.declEndItem(),
            beginCaptures: {
                0: { name: Scope.STYLE_OPERATOR() },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                {
                    begin: words(Token.AS),
                    end: this.declEndItem(),
                    beginCaptures: {
                        0: { name: Scope.STYLE_OPERATOR() },
                    },
                    patterns: [include(this.variablePattern)],
                },
                ...rest,
            ],
        };
    }
    declModule() {
        return {
            begin: alt(lastWords(Token.MODULE), words(Token.MODULE)),
            end: this.declEndItem(),
            beginCaptures: {
                0: { name: Scope.ITEM_MODULE() },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                include(this.comment),
                include(this.pragma),
                {
                    begin: lastWords(Token.MODULE),
                    end: alt(capture(words(Token.TYPE)), lookAhead(set(Class.upper))),
                    endCaptures: {
                        0: { name: Scope.STYLE_KEYWORD() },
                    },
                    patterns: [
                        include(this.attributeIdentifier),
                        include(this.comment),
                        {
                            match: words(Token.REC),
                            name: Scope.KEYWORD_REC(),
                        },
                    ],
                },
                {
                    begin: lastWords(Token.TYPE),
                    end: this.declEnd(),
                    patterns: [include(this.bindSignature)],
                },
                {
                    begin: lookAhead(set(Class.upper)),
                    end: this.declEnd(),
                    patterns: [include(this.bindStructure)],
                },
            ],
        };
    }
    declOpen() {
        return {
            begin: words(Token.OPEN),
            end: this.declEndItem(),
            beginCaptures: {
                0: { name: Scope.ITEM_OPEN() },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                include(this.attributeIdentifier),
                include(this.comment),
                include(this.pragma),
                include(this.pathModuleExtended),
            ],
        };
    }
    declTerm() {
        return {
            begin: seq(words(group(alt(capture(alt(Token.EXTERNAL, Token.VAL)), capture(Token.METHOD), capture(Token.LET)))), capture(opt("!"))),
            end: this.declEndItem(),
            beginCaptures: {
                1: { name: Scope.ITEM_VAL() },
                2: { name: Scope.ITEM_METHOD() },
                3: { name: Scope.ITEM_LET() },
                4: { name: Scope.STYLE_OPERATOR() },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [include(this.comment), include(this.pragma), include(this.bindTerm)],
        };
    }
    declType() {
        return {
            begin: alt(lastWords(Token.TYPE), words(Token.TYPE)),
            end: this.declEndItem(),
            beginCaptures: {
                0: { name: `keyword ${Scope.STYLE_UNDERLINE()}` },
            },
            endCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [include(this.comment), include(this.pragma), include(this.bindType)],
        };
    }
    extension() {
        return {
            begin: seq(capture(Token.LEFT_SQUARE_BRACKET), capture(this.ops(`${Token.PERCENT_SIGN}{1,3}`))),
            end: Token.RIGHT_SQUARE_BRACKET,
            beginCaptures: {
                1: { name: Scope.TERM_CONSTRUCTOR() },
                2: { name: Scope.STYLE_OPERATOR() },
            },
            endCaptures: {
                0: { name: Scope.TERM_CONSTRUCTOR() },
            },
            patterns: [include(this.attributePayload)],
        };
    }
    lastOps(...rest) {
        const result = [];
        for (const token of rest) {
            result.push(`[^${seq(...this.operatorTokens())}]${token}`, `^${token}`);
        }
        return group(seq(lookBehind(group(alt(...result))), negativeLookAhead(set(...this.operatorTokens()))));
    }
    literal() {
        return {
            patterns: [
                include(this.termConstructor),
                include(this.literalArray),
                include(this.literalBoolean),
                include(this.literalCharacter),
                include(this.literalList),
                include(this.literalNumber),
                include(this.literalObjectTerm),
                include(this.literalString),
                include(this.literalRecord),
                include(this.literalUnit),
            ],
        };
    }
    literalArray() {
        return {
            begin: seq(Token.LEFT_SQUARE_BRACKET, Token.VERTICAL_LINE),
            end: seq(Token.VERTICAL_LINE, Token.RIGHT_SQUARE_BRACKET),
            captures: {
                0: { name: Scope.TERM_CONSTRUCTOR() },
            },
            patterns: [include(this.term)],
        };
    }
    literalBoolean() {
        return {
            match: words(alt(Token.FALSE, Token.TRUE)),
            name: Scope.TERM_CONSTRUCTOR(),
        };
    }
    literalCharacter() {
        return {
            begin: seq(negativeLookBehind(set(Class.word)), Token.APOSTROPHE),
            end: Token.APOSTROPHE,
            name: Scope.TERM_CHARACTER(),
            patterns: [include(this.literalCharacterEscape)],
        };
    }
    literalCharacterEscape() {
        return this.escapes(Token.APOSTROPHE);
    }
    literalClassType() {
        return this.literalObjectWith(this.declInherit(include(this.type)));
    }
    literalList() {
        return {
            patterns: [
                {
                    begin: Token.LEFT_SQUARE_BRACKET,
                    end: Token.RIGHT_SQUARE_BRACKET,
                    captures: {
                        0: { name: Scope.TERM_CONSTRUCTOR() },
                    },
                    patterns: [include(this.term)],
                },
            ],
        };
    }
    literalNumber() {
        return {
            match: seq(negativeLookBehind(set(Class.alpha)), seq(set(Class.digit), many(set(Class.digit))), opt(capture(seq(Token.FULL_STOP, set(Class.digit), many(set(Class.digit)))))),
            name: Scope.TERM_NUMBER(),
        };
    }
    literalRecord() {
        return this.recordWith(include(this.term));
    }
    literalString() {
        return {
            patterns: [
                {
                    begin: Token.QUOTATION_MARK,
                    end: Token.QUOTATION_MARK,
                    name: Scope.TERM_STRING(),
                    patterns: [include(this.literalStringEscape)],
                },
                {
                    begin: seq(capture(Token.LEFT_CURLY_BRACKET), capture(opt(many(set(Token.LOW_LINE, Class.lower)))), capture(Token.VERTICAL_LINE)),
                    end: seq(capture(Token.VERTICAL_LINE), capture("\\2"), capture(Token.RIGHT_CURLY_BRACKET)),
                    name: Scope.TERM_STRING(),
                    patterns: [include(this.literalStringEscape)],
                },
            ],
        };
    }
    literalStringEscape() {
        return this.escapes();
    }
    literalUnit() {
        return {
            match: seq(Token.LEFT_PARENTHESIS, Token.RIGHT_PARENTHESIS),
            name: Scope.TERM_CONSTRUCTOR(),
        };
    }
    literalObjectWith(...rest) {
        return {
            patterns: [
                include(this.comment),
                {
                    begin: words(Token.OBJECT),
                    end: words(Token.END),
                    captures: {
                        0: { name: Scope.LITERAL_OBJECT() },
                    },
                    patterns: [...rest, include(this.pattern), include(this.declTerm)],
                },
                {
                    begin: Token.LEFT_SQUARE_BRACKET,
                    end: Token.RIGHT_SQUARE_BRACKET,
                },
            ],
        };
    }
    literalObjectTerm() {
        return this.literalObjectWith(this.declInherit(include(this.term)));
    }
    operator() {
        return basis.manyOne(set(...this.operatorTokens()));
    }
    operatorTokens() {
        return ["#", "\\-", ":", "!", "?", ".", "@", "*", "/", "&", "%", "^", "+", "<", "=", ">", "|", "~", "$"];
    }
    ops(arg) {
        return seq(negativeLookBehind(set(...this.operatorTokens())), arg, negativeLookAhead(set(...this.operatorTokens())));
    }
    pathModuleExtended() {
        return {
            patterns: [
                include(this.pathModulePrefixExtended),
                {
                    match: this.identUpper(),
                    name: Scope.NAME_MODULE(),
                },
            ],
        };
    }
    pathModuleSimple() {
        return {
            patterns: [
                include(this.pathModulePrefixSimple),
                {
                    match: this.identUpper(),
                    name: Scope.NAME_MODULE(),
                },
            ],
        };
    }
    pathModulePrefix(continueWith, ...rest) {
        return {
            begin: seq(this.identUpper(), lookAhead(seq(many(set(Class.space)), alt(Token.FULL_STOP, ...continueWith)))),
            end: negativeLookAhead(alt(set(Class.space, Token.FULL_STOP), ...continueWith)),
            beginCaptures: {
                0: { name: Scope.NAME_MODULE() },
            },
            patterns: [
                include(this.comment),
                ...rest,
                {
                    begin: this.ops(Token.FULL_STOP),
                    end: alt(capture(seq(this.identUpper(), lookAhead(seq(many(set(Class.space)), alt(Token.FULL_STOP, "$"))))), capture(seq(this.identUpper(), lookAhead(seq(many(set(Class.space)), group(alt(...continueWith)))))), capture(seq(this.identUpper(), lookAhead(seq(many(set(Class.space)), Token.RIGHT_PARENTHESIS)))), negativeLookAhead(alt(set(Class.space, Token.FULL_STOP, Class.upper), ...continueWith))),
                    beginCaptures: {
                        0: { name: Scope.PUNCTUATION_DOT() },
                    },
                    endCaptures: {
                        1: { name: Scope.NAME_MODULE() },
                        2: { name: Scope.TYPE_CONSTRUCTOR() },
                        3: { name: Scope.VARIABLE_PATTERN() },
                    },
                },
            ],
        };
    }
    pathModulePrefixSimple() {
        return {
            begin: seq(this.identUpper(), lookAhead(seq(many(set(Class.space)), Token.FULL_STOP))),
            end: negativeLookAhead(set(Class.space, Token.FULL_STOP)),
            beginCaptures: {
                0: { name: Scope.NAME_MODULE() },
            },
            patterns: [
                include(this.comment),
                {
                    begin: this.ops(Token.FULL_STOP),
                    end: alt(capture(seq(this.identUpper(), lookAhead(seq(many(set(Class.space)), Token.FULL_STOP)))), capture(seq(this.identUpper(), lookAhead(seq(many(set(Class.space)))))), negativeLookAhead(set(Class.space, Token.FULL_STOP, Class.upper))),
                    beginCaptures: {
                        0: { name: Scope.PUNCTUATION_DOT() },
                    },
                    endCaptures: {
                        1: { name: Scope.NAME_MODULE() },
                        2: { name: Scope.TERM_CONSTRUCTOR() },
                    },
                },
            ],
        };
    }
    pathModulePrefixExtended() {
        return this.pathModulePrefix(["$", Token.LEFT_PARENTHESIS], this.pathModulePrefixExtendedParens());
    }
    pathModulePrefixExtendedParens() {
        return {
            begin: Token.LEFT_PARENTHESIS,
            end: Token.RIGHT_PARENTHESIS,
            captures: {
                0: { name: Scope.STYLE_CONTROL() },
            },
            patterns: [
                {
                    match: capture(seq(this.identUpper(), lookAhead(seq(many(set(Class.space)), Token.RIGHT_PARENTHESIS)))),
                    name: Scope.VARIABLE_PATTERN(),
                },
                include(this.structure),
            ],
        };
    }
    pathRecord() {
        return {
            patterns: [
                {
                    begin: this.identLower(),
                    end: seq(lookAhead(complement(Class.space, Token.FULL_STOP)), negativeLookAhead(seq(Token.LEFT_PARENTHESIS, Token.ASTERISK))),
                    patterns: [
                        include(this.comment),
                        {
                            begin: alt(this.lastOps(Token.FULL_STOP), this.ops(Token.FULL_STOP)),
                            end: alt(capture(this.ops(Token.FULL_STOP)), capture(this.identLowerPath()), lookBehind(Token.RIGHT_PARENTHESIS), lookBehind(Token.RIGHT_SQUARE_BRACKET)),
                            beginCaptures: {
                                0: { name: Scope.PUNCTUATION_DOT() },
                            },
                            endCaptures: {
                                1: { name: Scope.PUNCTUATION_DOT() },
                                2: { name: Scope.NAME_FIELD() },
                            },
                            patterns: [
                                include(this.comment),
                                include(this.pathModulePrefixSimple),
                                {
                                    begin: seq(Token.LEFT_PARENTHESIS, negativeLookAhead(Token.ASTERISK)),
                                    end: Token.RIGHT_PARENTHESIS,
                                    captures: {
                                        0: { name: Scope.STYLE_OPERATOR() },
                                    },
                                    patterns: [include(this.term)],
                                },
                                {
                                    begin: Token.LEFT_SQUARE_BRACKET,
                                    end: Token.RIGHT_SQUARE_BRACKET,
                                    captures: {
                                        0: { name: Scope.STYLE_OPERATOR() },
                                    },
                                    patterns: [include(this.pattern)],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }
    pathType() {
        return {
            patterns: [
                include(this.pathModulePrefix),
                {
                    match: this.identLower(),
                    name: Scope.NAME_TYPE(),
                },
            ],
        };
    }
    pattern() {
        return {
            patterns: [
                include(this.comment),
                include(this.patternArray),
                include(this.patternLazy),
                include(this.patternList),
                include(this.patternMisc),
                include(this.patternModule),
                include(this.patternRecord),
                include(this.literal),
                include(this.patternParens),
                include(this.patternType),
                include(this.variablePattern),
                include(this.termOperator),
            ],
        };
    }
    patternArray() {
        return {
            begin: seq(Token.LEFT_SQUARE_BRACKET, Token.VERTICAL_LINE),
            end: seq(Token.VERTICAL_LINE, Token.RIGHT_SQUARE_BRACKET),
            captures: {
                0: { name: Scope.TERM_CONSTRUCTOR() },
            },
            patterns: [include(this.pattern)],
        };
    }
    patternLazy() {
        return {
            match: Token.LAZY,
            name: Scope.STYLE_OPERATOR(),
        };
    }
    patternList() {
        return {
            begin: Token.LEFT_SQUARE_BRACKET,
            end: Token.RIGHT_SQUARE_BRACKET,
            captures: {
                0: { name: Scope.TERM_CONSTRUCTOR() },
            },
            patterns: [include(this.pattern)],
        };
    }
    patternMisc() {
        return {
            match: alt(capture(this.ops(Token.COMMA)), capture(this.operator()), words(capture(Token.AS))),
            captures: {
                1: { name: Scope.PUNCTUATION_COMMA() },
                2: { name: Scope.STYLE_OPERATOR() },
                3: { name: Scope.KEYWORD_AS() },
            },
        };
    }
    patternModule() {
        return {
            begin: words(Token.MODULE),
            end: lookAhead(Token.RIGHT_PARENTHESIS),
            beginCaptures: {
                0: { name: Scope.TERM_MODULE() },
            },
            patterns: [include(this.declModule)],
        };
    }
    patternParens() {
        return this.parens(ref(this.pattern), ref(this.type));
    }
    patternRecord() {
        return this.recordWith(include(this.pattern));
    }
    patternType() {
        return {
            begin: words(Token.TYPE),
            end: lookAhead(Token.RIGHT_PARENTHESIS),
            beginCaptures: {
                0: { name: Scope.STYLE_KEYWORD() },
            },
            patterns: [include(this.declType)],
        };
    }
    pragma() {
        return {
            begin: this.ops(Token.NUMBER_SIGN),
            end: this.declEnd(),
            beginCaptures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [include(this.comment), include(this.literalNumber), include(this.literalString)],
        };
    }
    recordWith(...definiens) {
        return {
            begin: Token.LEFT_CURLY_BRACKET,
            end: Token.RIGHT_CURLY_BRACKET,
            captures: {
                0: { name: `${Scope.TERM_CONSTRUCTOR()} ${Scope.STYLE_BOLD()}` },
            },
            patterns: [
                {
                    begin: lookBehind(alt(Token.LEFT_CURLY_BRACKET, Token.SEMICOLON)),
                    end: alt(capture(Token.COLON), capture(Token.EQUALS_SIGN), capture(Token.SEMICOLON), capture(Token.WITH), lookAhead(Token.RIGHT_CURLY_BRACKET)),
                    endCaptures: {
                        1: { name: Scope.PUNCTUATION_COLON() },
                        2: { name: Scope.PUNCTUATION_EQUALS() },
                        3: { name: Scope.STYLE_OPERATOR() },
                        4: { name: Scope.STYLE_OPERATOR() },
                    },
                    patterns: [
                        include(this.comment),
                        include(this.pathModulePrefixSimple),
                        {
                            match: this.identLower(),
                            name: `${Scope.NAME_FIELD()} ${Scope.STYLE_ITALICS()}`,
                        },
                    ],
                },
                {
                    begin: lastWords(Token.WITH),
                    end: alt(capture(Token.COLON), capture(Token.EQUALS_SIGN), capture(Token.SEMICOLON), lookAhead(Token.RIGHT_CURLY_BRACKET)),
                    endCaptures: {
                        1: { name: Scope.PUNCTUATION_COLON() },
                        2: { name: Scope.PUNCTUATION_EQUALS() },
                        3: { name: Scope.STYLE_OPERATOR() },
                    },
                    patterns: [
                        {
                            match: this.identLower(),
                            name: `${Scope.NAME_FIELD()} ${Scope.STYLE_ITALICS()}`,
                        },
                    ],
                },
                {
                    begin: this.lastOps(Token.COLON),
                    end: alt(capture(Token.SEMICOLON), capture(Token.EQUALS_SIGN), lookAhead(Token.RIGHT_CURLY_BRACKET)),
                    endCaptures: {
                        1: { name: Scope.STYLE_OPERATOR() },
                        2: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [include(this.type)],
                },
                {
                    begin: this.lastOps(Token.EQUALS_SIGN),
                    end: alt(Token.SEMICOLON, lookAhead(Token.RIGHT_CURLY_BRACKET)),
                    endCaptures: {
                        0: { name: Scope.STYLE_OPERATOR() },
                    },
                    patterns: definiens,
                },
            ],
        };
    }
    signature() {
        return {
            patterns: [
                include(this.comment),
                include(this.signatureLiteral),
                include(this.signatureFunctor),
                include(this.pathModuleExtended),
                include(this.signatureParens),
                include(this.signatureRecovered),
                include(this.signatureConstraints),
            ],
        };
    }
    signatureConstraints() {
        return {
            begin: words(Token.WITH),
            end: alt(lookAhead(Token.RIGHT_PARENTHESIS), this.declEnd()),
            beginCaptures: {
                0: { name: Scope.SIGNATURE_WITH() },
            },
            patterns: [
                {
                    begin: lastWords(Token.WITH),
                    end: words(group(alt(capture(Token.MODULE), capture(Token.TYPE)))),
                    endCaptures: {
                        1: { name: Scope.TERM_MODULE() },
                        2: { name: Scope.STYLE_KEYWORD() },
                    },
                },
                include(this.declModule),
                include(this.declType),
            ],
        };
    }
    signatureFunctor() {
        return {
            patterns: [...this.functor(this.signature)],
        };
    }
    signatureLiteral() {
        return this.signatureLiteralWith(words(Token.SIG), words(Token.END));
    }
    signatureLiteralWith(begin, end) {
        return {
            begin,
            end,
            captures: {
                0: { name: Scope.LITERAL_SIGNATURE() },
            },
            patterns: [include(this.comment), include(this.pragma), include(this.decl)],
        };
    }
    signatureParens() {
        return this.parens(ref(this.signature), ref(this.signature));
    }
    signatureRecovered() {
        return {
            patterns: [
                {
                    begin: alt(Token.LEFT_PARENTHESIS, this.lastOps(Token.COLON, seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN)), lastWords(Token.INCLUDE, Token.OPEN)),
                    end: alt(words(Token.MODULE), negativeLookAhead(alt("$", set(Class.space), words(Token.MODULE)))),
                    endCaptures: {
                        0: { name: Scope.TERM_MODULE() },
                    },
                },
                {
                    begin: lastWords(Token.MODULE),
                    end: this.declEnd(),
                    patterns: [
                        {
                            begin: lastWords(Token.MODULE),
                            end: words(Token.TYPE),
                            endCaptures: {
                                0: { name: Scope.STYLE_KEYWORD() },
                            },
                        },
                        {
                            begin: lastWords(Token.TYPE),
                            end: words(Token.OF),
                            endCaptures: {
                                0: { name: Scope.STYLE_DELIMITER() },
                            },
                        },
                        {
                            begin: lastWords(Token.OF),
                            end: this.declEnd(),
                            patterns: [include(this.signature)],
                        },
                    ],
                },
            ],
        };
    }
    structure() {
        return {
            patterns: [
                include(this.comment),
                include(this.structureLiteral),
                include(this.structureFunctor),
                include(this.pathModuleExtended),
                include(this.structureParens),
            ],
        };
    }
    structureFunctor() {
        return {
            patterns: [...this.functor(this.structure)],
        };
    }
    structureLiteral() {
        return this.structureLiteralWith(words(Token.STRUCT), words(Token.END));
    }
    structureLiteralWith(begin, end) {
        return {
            begin,
            end,
            captures: {
                0: { name: Scope.LITERAL_STRUCTURE() },
            },
            patterns: [include(this.comment), include(this.pragma), include(this.decl)],
        };
    }
    structureParens() {
        return {
            begin: Token.LEFT_PARENTHESIS,
            end: Token.RIGHT_PARENTHESIS,
            captures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [include(this.structureUnpack), include(this.structure)],
        };
    }
    structureUnpack() {
        return {
            begin: words(Token.VAL),
            end: lookAhead(Token.RIGHT_PARENTHESIS),
            beginCaptures: {
                0: { name: Scope.STYLE_OPERATOR() },
            },
        };
    }
    term() {
        return {
            patterns: [include(this.termLet), include(this.termAtomic)],
        };
    }
    termAtomic() {
        return {
            patterns: [
                include(this.comment),
                include(this.termConditional),
                include(this.termConstructor),
                include(this.termDelim),
                include(this.termFor),
                include(this.termFunction),
                include(this.literal),
                include(this.termMatch),
                include(this.termMatchRule),
                include(this.termPun),
                include(this.termOperator),
                include(this.termTry),
                include(this.termWhile),
                include(this.pathRecord),
            ],
        };
    }
    termConditional() {
        return {
            match: words(group(alt(Token.IF, Token.THEN, Token.ELSE))),
            name: Scope.TERM_IF(),
        };
    }
    termConstructor() {
        return {
            patterns: [
                include(this.pathModulePrefixSimple),
                {
                    match: this.identUpper(),
                    name: Scope.TERM_CONSTRUCTOR(),
                },
            ],
        };
    }
    termDelim() {
        return {
            patterns: [
                {
                    begin: seq(Token.LEFT_PARENTHESIS, negativeLookAhead(Token.RIGHT_PARENTHESIS)),
                    end: Token.RIGHT_PARENTHESIS,
                    captures: {
                        0: { name: Scope.STYLE_DELIMITER() },
                    },
                    patterns: [include(this.term)],
                },
                {
                    begin: words(Token.BEGIN),
                    end: words(Token.END),
                    captures: {
                        0: { name: Scope.STYLE_DELIMITER() },
                    },
                    patterns: [include(this.attributeIdentifier), include(this.term)],
                },
            ],
        };
    }
    termFor() {
        return {
            patterns: [
                {
                    begin: words(Token.FOR),
                    end: words(Token.DONE),
                    beginCaptures: {
                        0: { name: Scope.STYLE_CONTROL() },
                    },
                    endCaptures: {
                        0: { name: Scope.STYLE_CONTROL() },
                    },
                    patterns: [
                        {
                            begin: lastWords(Token.FOR),
                            end: this.ops(Token.EQUALS_SIGN),
                            endCaptures: {
                                0: { name: Scope.PUNCTUATION_EQUALS() },
                            },
                            patterns: [include(this.pattern)],
                        },
                        {
                            begin: this.lastOps(Token.EQUALS_SIGN),
                            end: words(group(alt(Token.DOWNTO, Token.TO))),
                            endCaptures: {
                                0: { name: Scope.STYLE_CONTROL() },
                            },
                            patterns: [include(this.term)],
                        },
                        {
                            begin: lastWords(Token.TO),
                            end: words(Token.DO),
                            endCaptures: {
                                0: { name: Scope.STYLE_CONTROL() },
                            },
                            patterns: [include(this.term)],
                        },
                        {
                            begin: lastWords(Token.DO),
                            end: lookAhead(words(Token.DONE)),
                            patterns: [include(this.term)],
                        },
                    ],
                },
            ],
        };
    }
    termFunction() {
        return {
            match: words(group(alt(capture(Token.FUN), capture(Token.FUNCTION)))),
            captures: {
                1: { name: Scope.TERM_FUN() },
                2: { name: Scope.TERM_FUNCTION() },
            },
        };
    }
    termLet() {
        return {
            patterns: [
                {
                    begin: alt(seq(group(alt(this.lastOps(Token.EQUALS_SIGN, seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN)), lookBehind(alt(Token.SEMICOLON, Token.LEFT_PARENTHESIS)))), lookAhead(alt(set(Class.space), words(Token.LET)))), lastWords(Token.BEGIN, Token.DO, Token.ELSE, Token.IN, Token.STRUCT, Token.THEN, Token.TRY), seq(this.lastOps(seq(Token.COMMERCIAL_AT, Token.COMMERCIAL_AT)), manyOne(set(Class.space)))),
                    end: alt(words(group(alt(capture(Token.AND), capture(Token.LET)))), seq(lookAhead(complement(Class.space)), negativeLookAhead(seq(Token.LEFT_PARENTHESIS, Token.ASTERISK)))),
                    endCaptures: {
                        1: { name: Scope.ITEM_AND() },
                        2: { name: Scope.TERM_LET() },
                    },
                    patterns: [include(this.comment)],
                },
                {
                    begin: alt(lastWords(Token.AND, Token.LET), capture(Token.LET)),
                    end: alt(words(group(alt(capture(Token.AND), capture(Token.IN)))), this.declEndSans(Token.AND, Token.IN)),
                    beginCaptures: {
                        1: { name: Scope.TERM_LET() },
                    },
                    endCaptures: {
                        1: { name: Scope.ITEM_AND() },
                        2: { name: Scope.TERM_LET() },
                    },
                    patterns: [include(this.bindTerm)],
                },
            ],
        };
    }
    termMatch() {
        return {
            begin: words(Token.MATCH),
            end: words(Token.WITH),
            captures: {
                0: { name: Scope.STYLE_CONTROL() },
            },
            patterns: [include(this.term)],
        };
    }
    termMatchRule() {
        return {
            patterns: [
                {
                    begin: lastWords(Token.FUN, Token.FUNCTION, Token.WITH),
                    end: this.ops(alt(capture(Token.VERTICAL_LINE), capture(seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN)))),
                    endCaptures: {
                        1: { name: Scope.VERTICAL_LINE() },
                        2: { name: Scope.VERTICAL_LINE() },
                    },
                    patterns: [include(this.comment), include(this.attributeIdentifier), include(this.pattern)],
                },
                {
                    begin: alt(group(seq(lookBehind(group(alt(seq(complement(Token.LEFT_SQUARE_BRACKET, ...this.operatorTokens()), Token.VERTICAL_LINE), seq(`^`, Token.VERTICAL_LINE)))), negativeLookAhead(set(...this.operatorTokens())))), this.ops(Token.VERTICAL_LINE)),
                    end: this.ops(alt(capture(Token.VERTICAL_LINE), capture(seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN)))),
                    beginCaptures: {
                        0: { name: Scope.VERTICAL_LINE() },
                    },
                    endCaptures: {
                        1: { name: Scope.VERTICAL_LINE() },
                        2: { name: Scope.VERTICAL_LINE() },
                    },
                    patterns: [
                        include(this.pattern),
                        {
                            begin: words(Token.WHEN),
                            end: lookAhead(this.ops(seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN))),
                            beginCaptures: {
                                0: { name: Scope.KEYWORD_WHEN() },
                            },
                            patterns: [include(this.term)],
                        },
                    ],
                },
            ],
        };
    }
    termOperator() {
        return {
            patterns: [
                {
                    begin: this.ops(Token.NUMBER_SIGN),
                    end: this.identLower(),
                    beginCaptures: {
                        0: { name: Scope.STYLE_KEYWORD() },
                    },
                    endCaptures: {
                        0: { name: Scope.NAME_METHOD() },
                    },
                },
                {
                    match: seq(Token.LESS_THAN_SIGN, Token.HYPHEN_MINUS),
                    captures: {
                        0: { name: `${Scope.STYLE_CONTROL()} ${Scope.STYLE_BOLD()}` },
                    },
                },
                {
                    match: alt(capture(alt(Token.COMMA, this.operator())), capture(Token.SEMICOLON)),
                    captures: {
                        1: { name: Scope.STYLE_OPERATOR() },
                        2: { name: Scope.STYLE_OPERATOR() },
                    },
                },
                {
                    match: words(group(alt(Token.AND, Token.ASSERT, Token.ASR, Token.LAND, Token.LAZY, Token.LSR, Token.LXOR, Token.MOD, Token.NEW, Token.OR))),
                    name: Scope.TERM_BUILTIN(),
                },
            ],
        };
    }
    termPun() {
        return {
            begin: this.ops(alt(Token.QUESTION_MARK, Token.TILDE)),
            end: alt(Token.COLON, lookAhead(complement(Class.space, Token.COLON))),
            applyEndPatternLast: true,
            beginCaptures: {
                0: { name: Scope.STYLE_OPERATOR() },
            },
            endCaptures: {
                0: { name: Scope.STYLE_KEYWORD() },
            },
            patterns: [
                {
                    begin: this.lastOps(Token.QUESTION_MARK, Token.TILDE),
                    end: this.identLower(),
                    endCaptures: {
                        0: { name: Scope.NAME_FIELD() },
                    },
                },
            ],
        };
    }
    termTry() {
        return {
            begin: words(Token.TRY),
            end: words(Token.WITH),
            captures: {
                0: { name: Scope.STYLE_CONTROL() },
            },
            patterns: [include(this.term)],
        };
    }
    termWhile() {
        return {
            patterns: [
                {
                    begin: words(Token.WHILE),
                    end: words(Token.DONE),
                    beginCaptures: {
                        0: { name: Scope.STYLE_CONTROL() },
                    },
                    endCaptures: {
                        0: { name: Scope.STYLE_CONTROL() },
                    },
                    patterns: [
                        {
                            begin: lastWords(Token.WHILE),
                            end: words(Token.DO),
                            endCaptures: {
                                0: { name: Scope.STYLE_CONTROL() },
                            },
                            patterns: [include(this.term)],
                        },
                        {
                            begin: lastWords(Token.DO),
                            end: lookAhead(words(Token.DONE)),
                            patterns: [include(this.term)],
                        },
                    ],
                },
            ],
        };
    }
    type() {
        return {
            patterns: [
                include(this.comment),
                {
                    match: words(Token.NONREC),
                    name: Scope.KEYWORD_REC(),
                },
                include(this.pathModulePrefixExtended),
                include(this.typeLabel),
                include(this.typeObject),
                include(this.typeOperator),
                include(this.typeParens),
                include(this.typePolymorphicVariant),
                include(this.typeRecord),
                include(this.typeConstructor),
            ],
        };
    }
    typeConstructor() {
        return {
            patterns: [
                {
                    begin: alt(capture(Token.LOW_LINE), capture(this.identLower()), seq(capture(Token.APOSTROPHE), capture(this.identLower())), lookBehind(alt(seq(complement(Token.ASTERISK), Token.RIGHT_PARENTHESIS), Token.RIGHT_SQUARE_BRACKET))),
                    end: alt(lookAhead(alt(seq(Token.LEFT_PARENTHESIS, negativeLookAhead(Token.ASTERISK)), Token.ASTERISK, Token.COLON, Token.COMMA, Token.EQUALS_SIGN, Token.FULL_STOP, Token.GREATER_THAN_SIGN, Token.HYPHEN_MINUS, Token.LEFT_CURLY_BRACKET, Token.LEFT_SQUARE_BRACKET, Token.PLUS_SIGN, Token.RIGHT_CURLY_BRACKET, Token.RIGHT_PARENTHESIS, Token.RIGHT_SQUARE_BRACKET, Token.SEMICOLON, Token.VERTICAL_LINE)), seq(capture(this.identLower()), many(seq(Class.space)), negativeLookAhead(alt(seq(Token.LEFT_PARENTHESIS, Token.ASTERISK), set(Class.word)))), this.declEnd()),
                    beginCaptures: {
                        1: { name: Scope.META_COMMENT() },
                        3: { name: Scope.PUNCTUATION_APOSTROPHE() },
                        4: { name: Scope.VARIABLE_TYPE() },
                    },
                    endCaptures: {
                        1: { name: Scope.TYPE_CONSTRUCTOR() },
                    },
                    patterns: [include(this.comment), include(this.pathModulePrefixExtended)],
                },
            ],
        };
    }
    typeLabel() {
        return {
            patterns: [
                {
                    begin: seq(capture(opt(Token.QUESTION_MARK)), capture(this.identLower()), many(set(Class.space)), capture(this.ops(Token.COLON))),
                    end: lookAhead(this.ops(seq(Token.HYPHEN_MINUS, Token.GREATER_THAN_SIGN))),
                    captures: {
                        1: {
                            name: `keyword ${Scope.STYLE_BOLD()} ${Scope.STYLE_ITALICS()}`,
                        },
                        2: { name: `${Scope.NAME_FIELD()} ${Scope.STYLE_ITALICS()}` },
                        3: { name: Scope.STYLE_KEYWORD() },
                    },
                    patterns: [include(this.type)],
                },
            ],
        };
    }
    typeModule() {
        return {
            begin: words(Token.MODULE),
            end: lookAhead(Token.RIGHT_PARENTHESIS),
            beginCaptures: {
                0: { name: Scope.TERM_MODULE() },
            },
            patterns: [include(this.pathModuleExtended), include(this.signatureConstraints)],
        };
    }
    typeObject() {
        return {
            begin: Token.LESS_THAN_SIGN,
            end: Token.GREATER_THAN_SIGN,
            captures: {
                0: { name: `${Scope.TERM_CONSTRUCTOR()} ${Scope.STYLE_BOLD()}` },
            },
            patterns: [
                {
                    begin: lookBehind(alt(Token.LESS_THAN_SIGN, Token.SEMICOLON)),
                    end: alt(capture(Token.COLON), lookAhead(Token.GREATER_THAN_SIGN)),
                    endCaptures: {
                        1: { name: Scope.PUNCTUATION_COLON() },
                        3: { name: Scope.STYLE_OPERATOR() },
                        4: { name: Scope.STYLE_OPERATOR() },
                    },
                    patterns: [
                        include(this.comment),
                        include(this.pathModulePrefixSimple),
                        {
                            match: this.identLower(),
                            name: `${Scope.NAME_FIELD()} ${Scope.STYLE_ITALICS()}`,
                        },
                    ],
                },
                {
                    begin: this.lastOps(Token.COLON),
                    end: alt(capture(Token.SEMICOLON), lookAhead(Token.GREATER_THAN_SIGN)),
                    endCaptures: {
                        1: { name: Scope.STYLE_OPERATOR() },
                        2: { name: Scope.PUNCTUATION_EQUALS() },
                    },
                    patterns: [include(this.type)],
                },
            ],
        };
    }
    typeOperator() {
        return {
            patterns: [
                {
                    match: alt(Token.COMMA, Token.SEMICOLON, this.operator()),
                    name: Scope.OPERATOR_TYPE(),
                },
            ],
        };
    }
    typeParens() {
        return {
            begin: Token.LEFT_PARENTHESIS,
            end: Token.RIGHT_PARENTHESIS,
            captures: {
                0: { name: Scope.STYLE_DELIMITER() },
            },
            patterns: [
                {
                    match: Token.COMMA,
                    name: Scope.STYLE_OPERATOR(),
                },
                include(this.typeModule),
                include(this.type),
            ],
        };
    }
    typePolymorphicVariant() {
        return {
            begin: Token.LEFT_SQUARE_BRACKET,
            end: Token.RIGHT_SQUARE_BRACKET,
            patterns: [],
        };
    }
    typeRecord() {
        return this.recordWith(include(this.type));
    }
    variableModule() {
        return {
            match: this.identUpper(),
            captures: {
                0: { name: Scope.VARIABLE_PATTERN() },
            },
        };
    }
    variablePattern() {
        return {
            match: alt(capture(words(Token.LOW_LINE)), capture(this.identLower())),
            captures: {
                1: { name: Scope.META_COMMENT() },
                2: { name: Scope.VARIABLE_PATTERN() },
            },
        };
    }
    render() {
        return {
            name: `OCaml`,
            scopeName: `source.ocaml`,
            fileTypes: [`.ml`, `.mli`],
            patterns: [include(this.comment), include(this.pragma), include(this.decl)],
            repository: {
                attribute: this.attribute(),
                attributeIdentifier: this.attributeIdentifier(),
                attributePayload: this.attributePayload(),
                bindClassTerm: this.bindClassTerm(),
                bindClassType: this.bindClassType(),
                bindConstructor: this.bindConstructor(),
                bindSignature: this.bindSignature(),
                bindStructure: this.bindStructure(),
                bindTerm: this.bindTerm(),
                bindTermArgs: this.bindTermArgs(),
                bindType: this.bindType(),
                comment: this.comment(),
                commentBlock: this.commentBlock(),
                commentDoc: this.commentDoc(),
                decl: this.decl(),
                declClass: this.declClass(),
                declException: this.declException(),
                declInclude: this.declInclude(),
                declModule: this.declModule(),
                declOpen: this.declOpen(),
                declTerm: this.declTerm(),
                declType: this.declType(),
                extension: this.extension(),
                literal: this.literal(),
                literalArray: this.literalArray(),
                literalBoolean: this.literalBoolean(),
                literalCharacter: this.literalCharacter(),
                literalCharacterEscape: this.literalCharacterEscape(),
                literalClassType: this.literalClassType(),
                literalList: this.literalList(),
                literalNumber: this.literalNumber(),
                literalObjectTerm: this.literalObjectTerm(),
                literalRecord: this.literalRecord(),
                literalString: this.literalString(),
                literalStringEscape: this.literalStringEscape(),
                literalUnit: this.literalUnit(),
                pathModuleExtended: this.pathModuleExtended(),
                pathModulePrefixExtended: this.pathModulePrefixExtended(),
                pathModulePrefixExtendedParens: this.pathModulePrefixExtendedParens(),
                pathModulePrefixSimple: this.pathModulePrefixSimple(),
                pathModuleSimple: this.pathModuleSimple(),
                pathRecord: this.pathRecord(),
                pattern: this.pattern(),
                patternArray: this.patternArray(),
                patternLazy: this.patternLazy(),
                patternList: this.patternList(),
                patternMisc: this.patternMisc(),
                patternModule: this.patternModule(),
                patternParens: this.patternParens(),
                patternRecord: this.patternRecord(),
                patternType: this.patternType(),
                pragma: this.pragma(),
                signature: this.signature(),
                signatureConstraints: this.signatureConstraints(),
                signatureFunctor: this.signatureFunctor(),
                signatureLiteral: this.signatureLiteral(),
                signatureParens: this.signatureParens(),
                signatureRecovered: this.signatureRecovered(),
                structure: this.structure(),
                structureFunctor: this.structureFunctor(),
                structureLiteral: this.structureLiteral(),
                structureParens: this.structureParens(),
                structureUnpack: this.structureUnpack(),
                term: this.term(),
                termAtomic: this.termAtomic(),
                termConditional: this.termConditional(),
                termConstructor: this.termConstructor(),
                termDelim: this.termDelim(),
                termFor: this.termFor(),
                termFunction: this.termFunction(),
                termLet: this.termLet(),
                termMatch: this.termMatch(),
                termMatchRule: this.termMatchRule(),
                termOperator: this.termOperator(),
                termPun: this.termPun(),
                termTry: this.termTry(),
                termWhile: this.termWhile(),
                type: this.type(),
                typeConstructor: this.typeConstructor(),
                typeLabel: this.typeLabel(),
                typeModule: this.typeModule(),
                typeObject: this.typeObject(),
                typeOperator: this.typeOperator(),
                typeParens: this.typeParens(),
                typePolymorphicVariant: this.typePolymorphicVariant(),
                typeRecord: this.typeRecord(),
                variableModule: this.variableModule(),
                variablePattern: this.variablePattern(),
            },
        };
    }
}
exports.OCaml = OCaml;
exports.default = new OCaml().render();
//# sourceMappingURL=ocaml.js.map