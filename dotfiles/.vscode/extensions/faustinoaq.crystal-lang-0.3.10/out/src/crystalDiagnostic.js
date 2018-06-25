"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const crystalUtils_1 = require("./crystalUtils");
/**
 * Execute crystal build to check problems.
 */
function getDiagnostic(document) {
    const config = vscode.workspace.getConfiguration("crystal-lang");
    if (config["problems"] == "syntax") {
        return crystalUtils_1.spawnCompiler(document, false);
    }
    else if (crystalUtils_1.Concurrent.counter < crystalUtils_1.Concurrent.limit() && config["problems"] == "build" && crystalUtils_1.isNotLib(document.fileName)) {
        return crystalUtils_1.spawnCompiler(document, true);
    }
    else if (crystalUtils_1.Concurrent.counter >= crystalUtils_1.Concurrent.limit()) {
        console.info("INFO: crystal is taking a moment to build");
    }
}
exports.getDiagnostic = getDiagnostic;
//# sourceMappingURL=crystalDiagnostic.js.map