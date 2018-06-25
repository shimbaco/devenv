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
const child_process_1 = require("child_process");
const crystalUtils_1 = require("./crystalUtils");
/**
 * Formatting provider using VSCode module
 */
class CrystalFormattingProvider {
    /**
     * Execute crystal tool format and get response.
     */
    execFormat(document) {
        return new Promise(function (resolve, reject) {
            let response = "";
            const config = vscode.workspace.getConfiguration("crystal-lang");
            let child = child_process_1.spawn(`${config["compiler"]}`, ["tool", "format", "--no-color", "-f", "json", "-"]);
            child.stdin.write(document.getText());
            child.stdin.end();
            crystalUtils_1.childOnStd(child, "data", (data) => {
                response += data;
            });
            crystalUtils_1.childOnStd(child, "end", () => {
                return resolve(response);
            });
            crystalUtils_1.childOnError(child);
        });
    }
    /**
     * Return formatted documment to VSCode
     */
    provideDocumentFormattingEdits(document) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.execFormat(document);
            let textEditData = [];
            if ((crystalUtils_1.searchProblems(response.toString(), document.uri).length == 0) &&
                response.toString().length > 0) {
                let lastLineId = document.lineCount - 1;
                let range = new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
                textEditData = [vscode.TextEdit.replace(range, response.toString())];
            }
            return textEditData;
        });
    }
}
exports.CrystalFormattingProvider = CrystalFormattingProvider;
//# sourceMappingURL=crystalFormatting.js.map