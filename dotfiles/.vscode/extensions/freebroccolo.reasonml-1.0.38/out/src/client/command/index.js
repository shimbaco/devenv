"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const doShowAvailableLibraries = require("./doShowAvailableLibraries");
const doShowMerlinFiles = require("./doShowMerlinFiles");
const doShowProjectEnv = require("./doShowProjectEnv");
const doSplitCases = require("./doSplitCases");
const fixEqualsShouldBeArrow = require("./fixEqualsShouldBeArrow");
const fixMissingSemicolon = require("./fixMissingSemicolon");
const fixUnusedVariable = require("./fixUnusedVariable");
function registerAll(context, languageClient) {
    doShowMerlinFiles.register(context, languageClient);
    doShowProjectEnv.register(context, languageClient);
    doShowAvailableLibraries.register(context, languageClient);
    doSplitCases.register(context, languageClient);
    fixEqualsShouldBeArrow.register(context, languageClient);
    fixMissingSemicolon.register(context, languageClient);
    fixUnusedVariable.register(context, languageClient);
}
exports.registerAll = registerAll;
//# sourceMappingURL=index.js.map