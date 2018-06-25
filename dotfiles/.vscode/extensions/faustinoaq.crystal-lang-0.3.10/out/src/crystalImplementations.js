"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const crystalUtils_1 = require("./crystalUtils");
/**
 * Show implementations using VSCode provider
 */
class CrystalImplementationsProvider {
    /**
     * Execute crystal tool context for current file:position
     */
    crystalImplementations(document, position) {
        return crystalUtils_1.spawnTools(document, position, "impl", "implementations");
    }
    /**
     * Search for definitions in a Crystal project
     */
    provideDefinition(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            let crystalOutput = yield this.crystalImplementations(document, position);
            let locations = [];
            if (crystalOutput.toString().startsWith(`{"status":"`)) {
                try {
                    let crystalMessageObject = JSON.parse(crystalOutput.toString());
                    if (crystalMessageObject.status == "ok") {
                        for (let element of crystalMessageObject.implementations) {
                            let file = crystalUtils_1.tryWindowsPath(element.filename);
                            let position = new vscode.Position(element.line - 1, element.column - 1);
                            let location = new vscode.Location(vscode.Uri.file(file), position);
                            locations.push(location);
                        }
                    }
                    else if (crystalMessageObject.status == "blocked") {
                        console.info("INFO: crystal is taking a moment to check implementation");
                    }
                }
                catch (err) {
                    console.error("ERROR: JSON.parse failed to parse crystal implementations output");
                    throw err;
                }
            }
            return locations;
        });
    }
}
exports.CrystalImplementationsProvider = CrystalImplementationsProvider;
//# sourceMappingURL=crystalImplementations.js.map