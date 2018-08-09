"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = {
    indentationRules: {
        increaseIndentPattern: new RegExp('(after|else|catch|rescue|fn|^.*(do|<\\-|\\->|\\{|\\[|\\=))\\s*$'),
        decreaseIndentPattern: new RegExp('^\\s*((\\}|\\])\\s*$|(after|else|catch|rescue|end)\\b)')
    }
};
//# sourceMappingURL=configuration.js.map