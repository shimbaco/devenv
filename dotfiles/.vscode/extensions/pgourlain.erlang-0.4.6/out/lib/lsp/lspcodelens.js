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
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const lspclientextension_1 = require("./lspclientextension");
const vscode_uri_1 = require("vscode-uri");
const events_1 = require("events");
class DocumentValidatedEvent extends events_1.EventEmitter {
    Fire() {
        this.emit("documentValidated");
    }
}
let codeLensEnabled = false;
let autosave = vscode_1.workspace.getConfiguration("files").get("autoSave") == "afterDelay";
let documentValidatedEvent = new DocumentValidatedEvent();
function configurationChanged() {
    codeLensEnabled = vscode_1.workspace.getConfiguration("erlang").get("codeLensEnabled");
    autosave = vscode_1.workspace.getConfiguration("files").get("autoSave") == "afterDelay";
}
exports.configurationChanged = configurationChanged;
function onProvideCodeLenses(document, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!codeLensEnabled) {
            return Promise.resolve([]);
        }
        if (autosave && document.isDirty) {
            //codeLens event is fire after didChange and before DidSave
            //So, when autoSave is on, Erlang document is validated on didSaved		
            return yield new Promise(a => {
                let fn = () => {
                    documentValidatedEvent.removeListener("documentValidated", fn);
                    a(internalProvideCodeLenses(document, token));
                };
                documentValidatedEvent.addListener("documentValidated", fn);
            });
        }
        return yield internalProvideCodeLenses(document, token);
    });
}
exports.onProvideCodeLenses = onProvideCodeLenses;
function internalProvideCodeLenses(document, token) {
    return __awaiter(this, void 0, void 0, function* () {
        //Send request for codeLens
        return yield lspclientextension_1.client.sendRequest(vscode_languageclient_1.CodeLensRequest.type, {
            textDocument: { uri: document.uri.toString() }
        }, token).then((codelenses) => __awaiter(this, void 0, void 0, function* () { return yield codeLensToVSCodeLens(codelenses); }));
    });
}
function onResolveCodeLenses(codeLens) {
    lspclientextension_1.debugLog("onResolveCodeLenses");
    return codeLens;
}
exports.onResolveCodeLenses = onResolveCodeLenses;
function onDocumentDidSave() {
    documentValidatedEvent.Fire();
}
exports.onDocumentDidSave = onDocumentDidSave;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function codeLensToVSCodeLens(codelenses) {
    return __awaiter(this, void 0, void 0, function* () {
        //debugLog(`convert codelens : ${JSON.stringify(codelenses)}`);
        return Promise.resolve(codelenses.map(V => asCodeLens(V)));
    });
}
function asCommand(item) {
    let result = {
        title: item.title,
        command: item.command
    };
    if (item.arguments) {
        result.arguments = item.arguments.map(function (arg) {
            if (arg.indexOf && arg.indexOf("file:") === 0)
                return vscode_uri_1.default.parse(arg);
            else
                return arg;
        });
    }
    return result;
}
function asCodeLens(item) {
    let result = new vscode_1.CodeLens(asRange(item.range));
    if (item.command) {
        result.command = asCommand(item.command);
    }
    return result;
}
function asRange(item) {
    return new vscode_1.Range(asPosition(item.start), asPosition(item.end));
}
function asPosition(item) {
    return new vscode_1.Position(item.line, item.character);
}
//# sourceMappingURL=lspcodelens.js.map