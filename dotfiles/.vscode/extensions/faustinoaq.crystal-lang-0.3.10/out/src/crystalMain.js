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
const fs = require("fs");
const vscode = require("vscode");
const client = require("vscode-languageclient");
const crystalUtils_1 = require("./crystalUtils");
const crystalHover_1 = require("./crystalHover");
const crystalDiagnostic_1 = require("./crystalDiagnostic");
const crystalFormatting_1 = require("./crystalFormatting");
const crystalSymbols_1 = require("./crystalSymbols");
const crystalCompletion_1 = require("./crystalCompletion");
const crystalImplementations_1 = require("./crystalImplementations");
// Language configuration for identation and patterns. Based on vscode-ruby
const crystalConfiguration = {
    indentationRules: {
        increaseIndentPattern: /^\s*((begin|(private\s+abstract|private|abstract)\s+(class|struct)|class|struct|(private|protected)\s+def|def|fun|macro|else|elsif|ensure|for|if|module|rescue|unless|until|when|while|case)|([^#]*\sdo\b)|([^#]*=\s*(case|if|unless)))\b([^#\{;]|("|'|\/).*\4)*(#.*)?$/,
        decreaseIndentPattern: /^\s*([}\]]([,)]?\s*(#|$)|\.[a-zA-Z_]\w*\b)|(end|rescue|ensure|else|elsif|when)\b)/
    },
    wordPattern: /(-?\d+(?:\.\d+))|(:?[A-Za-z][^-`~@#%^&()=+[{}|;:'",<>/.*\]\s\\!?]*[!?]?)/
};
// VSCode identificator for Crystal
const CRYSTAL_MODE = { language: "crystal", scheme: "file" };
/**
 * Ensure to analyze only Crystal documents
 */
function diagnosticDocument(document) {
    if (document.languageId == "crystal") {
        crystalDiagnostic_1.getDiagnostic(document);
    }
}
/**
 * Init function for this extension
 */
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Call features not implemented on server yet.
        context.subscriptions.push(vscode.languages.setLanguageConfiguration("crystal", crystalConfiguration));
        // Extension configuration
        const config = vscode.workspace.getConfiguration("crystal-lang");
        // Detect server and set configuration
        let scry = config["server"];
        if (fs.existsSync(scry)) {
            let serverOptions = { command: scry, args: [] };
            let clientOptions = {
                documentSelector: ["crystal"],
                synchronize: {
                    configurationSection: "crystal-lang",
                    fileEvents: vscode.workspace.createFileSystemWatcher("**/*.cr")
                }
            };
            let disposable = new client.LanguageClient("Crystal Language", serverOptions, clientOptions).start();
            context.subscriptions.push(disposable);
        }
        else {
            // If server is disabled use Node.js implementation instead.
            context.subscriptions.push(crystalUtils_1.diagnosticCollection, vscode.languages.registerDocumentFormattingEditProvider("crystal", new crystalFormatting_1.CrystalFormattingProvider()), vscode.workspace.onDidOpenTextDocument(diagnosticDocument), vscode.workspace.onDidSaveTextDocument(diagnosticDocument), vscode.languages.registerHoverProvider(CRYSTAL_MODE, new crystalHover_1.CrystalHoverProvider()), vscode.languages.registerDocumentSymbolProvider("crystal", new crystalSymbols_1.CrystalDocumentSymbolProvider()), vscode.languages.registerCompletionItemProvider(CRYSTAL_MODE, new crystalCompletion_1.CrystalCompletionItemProvider()));
            if (config["implementations"]) {
                context.subscriptions.push(vscode.languages.registerDefinitionProvider(CRYSTAL_MODE, new crystalImplementations_1.CrystalImplementationsProvider()));
            }
        }
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=crystalMain.js.map