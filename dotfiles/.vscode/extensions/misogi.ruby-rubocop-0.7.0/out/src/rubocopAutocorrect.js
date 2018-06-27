"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rubocop_1 = require("./rubocop");
class RubocopAutocorrect extends rubocop_1.default {
    get isOnSave() {
        return false;
    }
    commandArguments(fileName) {
        return super.commandArguments(fileName).concat(['--auto-correct']);
    }
}
exports.RubocopAutocorrect = RubocopAutocorrect;
//# sourceMappingURL=rubocopAutocorrect.js.map