/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const erlangLspConnection_1 = require("./erlangLspConnection");
const ErlangShellLSP_1 = require("./ErlangShellLSP");
const erlangConnection_1 = require("../erlangConnection");
const http = require("http");
const os = require("os");
const path = require("path");
const fs = require("fs");
class ChannelWrapper {
    show() {
    }
    appendLine(value) {
        debugLog(value);
    }
}
class DocumentValidatedEvent extends events_1.EventEmitter {
    Fire() {
        this.emit("documentValidated");
    }
}
// Create a connection for the server. The connection uses Node's IPC as a transport
let connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
// erlang shell to start LSP http server
let erlangLsp = new ErlangShellLSP_1.ErlangShellLSP(new ChannelWrapper());
//local http server to send/receive command to erlang LSP
let erlangLspConnection = new erlangLspConnection_1.ErlangLspConnection(new ChannelWrapper());
// Create a simple text document manager. The text document manager
// supports full document sync only
let documents = new vscode_languageserver_1.TextDocuments();
let lspServerConfigured = false;
let documentValidtedEvent = new DocumentValidatedEvent();
let module2helpPage = new Map();
//trace for debugging 
let traceEnabled = false;
connection.onInitialize((params) => __awaiter(this, void 0, void 0, function* () {
    //connection.console.log("onInitialize.");
    yield erlangLspConnection.Start(traceEnabled).then(port => {
        return erlangLsp.Start("", erlangConnection_1.erlangBridgePath + "/..", port, "src", "");
    }, (reason) => {
        connection.console.log(`LspConnection Start failed : ${reason}`);
    });
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            documentFormattingProvider: true,
            definitionProvider: true,
            hoverProvider: true,
            codeLensProvider: { resolveProvider: true },
            referencesProvider: true,
            completionProvider: { triggerCharacters: [":", "#", "."] }
            // executeCommandProvider: {
            //  commands : ["erlang.showReferences"]
            // },
            // completionProvider : {
            //  resolveProvider: true,
            //  triggerCharacters: [ ':' ]
            // }
        }
    };
}));
connection.onInitialized(() => __awaiter(this, void 0, void 0, function* () {
    debugLog("onInitialized");
    var globalConfig = yield connection.workspace.getConfiguration("erlang");
    if (globalConfig) {
        let erlangConfig = globalConfig;
        if (erlangConfig && erlangConfig.verbose) {
            traceEnabled = true;
        }
    }
    connection.onDidChangeWatchedFiles(event => {
        debugLog('onDidChangeWatchedFiles ' + JSON.stringify(event));
    });
    var whenConnected = function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (erlangLspConnection.isConnected) {
                setConfigInLSP(function () {
                    lspServerConfigured = true;
                });
            }
            else {
                setTimeout(function () {
                    whenConnected();
                }, 100);
            }
        });
    };
    whenConnected();
}));
function setConfigInLSP(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        var entries = new Map();
        entries.set("root", findRoot(yield connection.workspace.getWorkspaceFolders()));
        var globalConfig = yield connection.workspace.getConfiguration("erlang");
        if (globalConfig && globalConfig.includePaths.length > 0)
            entries.set("include_paths", globalConfig.includePaths.join("|"));
        erlangLspConnection.setConfig(entries, callback);
    });
}
function uriToFile(uri) {
    if (process.platform == 'win32')
        uri = uri.replace(/file:\/\/\/([A-Za-z])%3A\//, 'file://$1:/');
    if (uri.startsWith("file://"))
        return uri.substr(7);
    else
        return uri;
}
function findRoot(folders) {
    var root = "";
    folders.forEach(folder => {
        var folderPath = uriToFile(folder.uri);
        if (!root || fs.existsSync(path.join(folderPath, "rebar.config")))
            root = folderPath;
    });
    return root;
}
connection.onExecuteCommand((cmdParams) => {
    debugLog(`onExecuteCommand : ${JSON.stringify(cmdParams)}`);
    //connection.sendRequest(CommandReques)
    return null;
});
connection.onShutdown(() => {
    debugLog("connection.onShutDown");
    erlangLspConnection.Quit();
});
connection.onExit(() => {
    debugLog("connection.onExit");
    erlangLspConnection.Quit();
});
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { erlangPath: "", rebarBuildArgs: [], rebarPath: "", includePaths: [], linting: true, codeLensEnabled: false, verbose: false };
let globalSettings = defaultSettings;
connection.onDidChangeConfiguration((change) => __awaiter(this, void 0, void 0, function* () {
    debugLog("connection.onDidChangeConfiguration");
    setConfigInLSP(function () {
        // Revalidate all open text documents
        documents.all().forEach(document => {
            let diagnostics = [];
            connection.sendDiagnostics({ uri: document.uri, diagnostics });
            validateDocument(document);
        });
    });
}));
function waitForServerConfigured(fun) {
    var whenReady = function () {
        if (lspServerConfigured)
            fun();
        else {
            setTimeout(function () {
                whenReady();
            }, 100);
        }
    };
    whenReady();
}
function isAutoSaveEnabled() {
    return __awaiter(this, void 0, void 0, function* () {
        var filesConfig = yield connection.workspace.getConfiguration("files");
        return filesConfig.autoSave === 'afterDelay';
    });
}
documents.onDidOpen((event) => __awaiter(this, void 0, void 0, function* () {
    debugLog("onDidOpen: " + event.document.uri);
    if (yield isAutoSaveEnabled()) {
        waitForServerConfigured(function () {
            validateDocument(event.document);
        });
    }
}));
documents.onDidSave((event) => __awaiter(this, void 0, void 0, function* () {
    debugLog("onDidSave: " + event.document.uri);
    if (yield isAutoSaveEnabled()) {
        waitForServerConfigured(function () {
            validateDocument(event.document);
        });
    }
}));
documents.onDidClose(event => {
    debugLog("onDidSave: " + event.document.uri);
    let diagnostics = [];
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics });
    erlangLspConnection.onDocumentClosed(event.document.uri);
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((event) => __awaiter(this, void 0, void 0, function* () {
    if (!(yield isAutoSaveEnabled())) {
        waitForServerConfigured(function () {
            validateDocument(event.document, event.document.version === 1);
        });
    }
}));
function saveContentsToTmpFile(document) {
    var randomName = Math.floor(Math.random() * 10000000).toString();
    var tmpFileName = path.join(os.tmpdir(), randomName);
    fs.writeFileSync(tmpFileName, document.getText());
    return tmpFileName;
}
function validateDocument(document, saved = true) {
    return __awaiter(this, void 0, void 0, function* () {
        var erlangConfig = yield connection.workspace.getConfiguration("erlang");
        var linting = erlangConfig && erlangConfig.linting;
        if (document.uri.endsWith(".erl")) {
            if (saved) {
                erlangLspConnection.parseSourceFile(document.uri, "", () => {
                    if (linting)
                        erlangLspConnection.validateParsedSourceFile(document.uri, parsingResult => onValidatedDocument(parsingResult, document));
                });
            }
            else {
                var tmpFileName = saveContentsToTmpFile(document);
                erlangLspConnection.parseSourceFile(document.uri, tmpFileName, () => {
                    fs.unlinkSync(tmpFileName);
                    if (linting)
                        erlangLspConnection.validateParsedSourceFile(document.uri, parsingResult => onValidatedDocument(parsingResult, document));
                });
            }
        }
        else if (linting && (document.uri.endsWith(".src") || document.uri.endsWith(".config"))) {
            if (saved) {
                erlangLspConnection.validateConfigFile(document.uri, "", parsingResult => onValidatedDocument(parsingResult, document));
            }
            else {
                var tmpFileName = saveContentsToTmpFile(document);
                erlangLspConnection.validateConfigFile(document.uri, tmpFileName, parsingResult => {
                    fs.unlinkSync(tmpFileName);
                    onValidatedDocument(parsingResult, document);
                });
            }
        }
        // fire that document is validated
        documentValidtedEvent.Fire();
    });
}
connection.onDocumentFormatting((params) => __awaiter(this, void 0, void 0, function* () {
    erlangLspConnection.FormatDocument(params.textDocument.uri);
    return [];
}));
connection.onDefinition((textDocumentPosition) => __awaiter(this, void 0, void 0, function* () {
    let fileName = textDocumentPosition.textDocument.uri;
    let res = yield erlangLspConnection.getDefinitionLocation(fileName, textDocumentPosition.position.line, textDocumentPosition.position.character);
    if (res) {
        return vscode_languageserver_1.Location.create(res.uri, vscode_languageserver_1.Range.create(res.line, res.character, res.line, res.character));
    }
    return null;
}));
function markdown(str) {
    str = str.trim();
    var reg = /(((< *\/[^>]+>)|(< *([a-zA-Z0-9]+)[^>]*>))|([^<]+))/g;
    var out = '';
    var result;
    var tags = [];
    var off = [];
    while ((result = reg.exec(str)) !== null) {
        if (result[4]) {
            var tagName = result[5];
            var tag = '';
            var endTag = '';
            if (tagName === 'br') {
                if (off.length === 0)
                    out += '  \n';
                continue;
            }
            else if (tagName === 'p' || result[4].indexOf('name="') >= 0) {
                tag = '';
                endTag = '  \n';
            }
            else if (result[4].indexOf('REFTYPES') >= 0 || result[4].indexOf('func-types-title') >= 0) {
                off.push(true);
                tag = '';
                endTag = 'ON';
            }
            else if (result[4].indexOf('<dt') >= 0) {
                tag = '  \n**';
                endTag = '**  \n';
            }
            else if (result[4].indexOf('bold_code') >= 0 && off.length === 0)
                tag = endTag = ' **';
            else if (result[4].indexOf('h3') >= 0) {
                tag = '\n#### ';
                endTag = '\n';
            }
            out += tag;
            tags.push(endTag);
        }
        else if (result[3]) {
            var top = tags.pop();
            if (top === 'ON')
                off.pop();
            else
                out += top;
        }
        else if (result[6] && off.length === 0)
            out += result[6];
    }
    return {
        value: out,
        kind: vscode_languageserver_1.MarkupKind.Markdown
    };
}
function getModuleHelpPage(moduleName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (module2helpPage.has(moduleName)) {
            return module2helpPage.get(moduleName);
        }
        else {
            return new Promise(resolve => {
                http.get('http://erlang.org/doc/man/' + moduleName + '.html', (response) => {
                    let contents = '';
                    response.on('data', (chunk) => {
                        contents += chunk;
                    });
                    response.on('end', () => {
                        module2helpPage.set(moduleName, contents.split('\n'));
                        resolve(module2helpPage.get(moduleName));
                    });
                }).on("error", (error) => {
                    module2helpPage.set(moduleName, []);
                    resolve([]);
                });
            });
        }
    });
}
;
function extractHelpForFunction(functionName, htmlLines) {
    var helpText = '';
    var found = false;
    for (var i = 0; i < htmlLines.length; ++i) {
        var trimmed = htmlLines[i].trim();
        if (!found) {
            if (trimmed.indexOf('name="' + functionName) >= 0) {
                found = true;
                helpText = trimmed;
            }
        }
        else {
            if (!trimmed || trimmed.indexOf('name="') !== trimmed.indexOf('name="' + functionName))
                break;
            else
                helpText += '\n' + trimmed;
        }
    }
    return helpText;
}
connection.onHover((textDocumentPosition) => __awaiter(this, void 0, void 0, function* () {
    var uri = textDocumentPosition.textDocument.uri;
    let res = yield erlangLspConnection.getHoverInfo(uri, textDocumentPosition.position.line, textDocumentPosition.position.character);
    if (res) {
        debugLog(JSON.stringify(res));
        if (res.text) {
            return { contents: res.text };
        }
        else {
            var htmlLines = yield getModuleHelpPage(res.moduleName);
            return { contents: markdown(extractHelpForFunction(res.functionName, htmlLines)) };
        }
    }
    return null;
}));
connection.onReferences((reference) => __awaiter(this, void 0, void 0, function* () {
    var uri = reference.textDocument.uri;
    let res = yield erlangLspConnection.getReferencesInfo(uri, reference.position.line, reference.position.character);
    if (res) {
        var Result = new Array();
        res.forEach(ref => {
            Result.push(vscode_languageserver_1.Location.create(ref.uri, vscode_languageserver_1.Range.create(ref.line, ref.character, ref.line, ref.character)));
        });
        return Result;
    }
    return null;
}));
connection.onCodeLens((codeLens) => __awaiter(this, void 0, void 0, function* () {
    //wait doucment validation before get codelenses
    //in order to get on last version of parsed document
    return yield new Promise(a => {
        let fn = () => {
            documentValidtedEvent.removeListener("documentValidated", fn);
            a(getCodeLenses(codeLens));
        };
        documentValidtedEvent.addListener("documentValidated", fn);
    });
}));
function getCodeLenses(codeLens) {
    return __awaiter(this, void 0, void 0, function* () {
        var erlangConfig = yield connection.workspace.getConfiguration("erlang");
        if (erlangConfig) {
            if (!erlangConfig.codeLensEnabled) {
                return [];
            }
        }
        var uri = codeLens.textDocument.uri;
        let res = yield erlangLspConnection.getCodeLensInfo(uri);
        if (res) {
            var Result = new Array();
            res.codelens.forEach(ref => {
                if (ref.data.exported) {
                    let exportedCodeLens = vscode_languageserver_1.CodeLens.create(vscode_languageserver_1.Range.create(ref.line, ref.character, ref.line, ref.character + ref.data.func_name.length), ref.data);
                    exportedCodeLens.command = vscode_languageserver_1.Command.create("exported", "");
                    Result.push(exportedCodeLens);
                }
                if (!ref.data.exported || ref.data.count > 0) {
                    let codeLens = vscode_languageserver_1.CodeLens.create(vscode_languageserver_1.Range.create(ref.line, ref.character, ref.line, ref.character + ref.data.func_name.length), ref.data);
                    //codeLens.command = null; //set to null to invoke OnCodeLensResolve
                    codeLens.command = ref.data.count == 0 ? vscode_languageserver_1.Command.create("unused", "") :
                        vscode_languageserver_1.Command.create(`${ref.data.count} private references`, "editor.action.findReferences", vscode_uri_1.default.parse(res.uri), { lineNumber: ref.line + 1, column: ref.character + 1 });
                    Result.push(codeLens);
                }
            });
            return Result;
        }
        return null;
    });
}
connection.onCodeLensResolve((codeLens) => __awaiter(this, void 0, void 0, function* () {
    // let command = Command.create(`${codeLens.data.count} private references`, "erlang.showReferences", 
    //                       codeLens.data.uri, codeLens.range.start, []);
    codeLens.command = vscode_languageserver_1.Command.create("onCodeLensResolve", "");
    return codeLens;
}));
connection.onCompletion((textDocumentPosition) => __awaiter(this, void 0, void 0, function* () {
    let document = documents.get(textDocumentPosition.textDocument.uri);
    if (document == null) {
        debugLog(`unable to get document '${textDocumentPosition.textDocument.uri}'`);
        return [];
    }
    let text = document.getText({
        start: vscode_languageserver_1.Position.create(textDocumentPosition.position.line, 0),
        end: textDocumentPosition.position
    });
    var moduleFunctionMatch = text.match(/[^a-zA-Z0-0_@]([a-z][a-zA-Z0-0_@]*):([a-z][a-zA-Z0-0_@]*)?$/);
    if (moduleFunctionMatch) {
        var prefix = moduleFunctionMatch[2] ? moduleFunctionMatch[2] : '';
        debugLog('onCompletion, module=' + moduleFunctionMatch[1] + ' function=' + prefix);
        return yield completeModuleFunction(moduleFunctionMatch[1], prefix);
    }
    var recordMatch = text.match(/#([a-z][a-zA-Z0-0_@]*)?$/);
    if (recordMatch) {
        var prefix = recordMatch[1] ? recordMatch[1] : '';
        debugLog('onCompletion, record=' + prefix);
        return yield completeRecord(document.uri, prefix);
    }
    var fieldMatch = text.match(/#([a-z][a-zA-Z0-0_@]*)\.([a-z][a-zA-Z0-0_@]*)?$/);
    if (fieldMatch) {
        var prefix = fieldMatch[2] ? fieldMatch[2] : '';
        debugLog('onCompletion, record=' + fieldMatch[1] + ' field=' + prefix);
        return yield completeField(document.uri, fieldMatch[1], prefix);
    }
    var variableMatch = text.match(/[^a-zA-Z0-0_@]([A-Z][a-zA-Z0-0_@]*)$/);
    if (variableMatch) {
        var prefix = variableMatch[1] ? variableMatch[1] : '';
        debugLog('onCompletion, variable=' + prefix);
        return yield completeVariable(document.uri, textDocumentPosition.position.line, prefix);
    }
    return [];
}));
function completeModuleFunction(moduleName, prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        let items = yield erlangLspConnection.completeModuleFunction(moduleName, prefix);
        let completionItems = items.map(item => {
            return {
                label: item,
                kind: vscode_languageserver_1.CompletionItemKind.Function
            };
        });
        if (completionItems.length > 0) {
            let helpPage = yield getModuleHelpPage(moduleName);
            if (helpPage.length > 0) {
                completionItems = completionItems.map(function (item) {
                    item.documentation = markdown(extractHelpForFunction(item.label, helpPage));
                    return item;
                });
            }
        }
        return completionItems;
    });
}
function completeRecord(uri, prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        let items = yield erlangLspConnection.completeRecord(uri, prefix);
        return items.map(item => {
            return {
                label: item,
                kind: vscode_languageserver_1.CompletionItemKind.Struct
            };
        });
    });
}
function completeField(uri, record, prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        let items = yield erlangLspConnection.completeField(uri, record, prefix);
        return items.map(item => {
            return {
                label: item,
                kind: vscode_languageserver_1.CompletionItemKind.Field
            };
        });
    });
}
function completeVariable(uri, line, prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        let items = yield erlangLspConnection.completeVariable(uri, line, prefix);
        return items.map(item => {
            return {
                label: item,
                kind: vscode_languageserver_1.CompletionItemKind.Variable
            };
        });
    });
}
function debugLog(msg) {
    if (true /*traceEnabled*/) {
        connection.console.log(msg);
    }
}
function onValidatedDocument(parsingResult, textDocument) {
    debugLog("onValidatedDocument: " + textDocument.uri);
    if (parsingResult.parse_result) {
        let diagnostics = [];
        if (parsingResult.errors_warnings) {
            for (var i = 0; i < parsingResult.errors_warnings.length; i++) {
                let error = parsingResult.errors_warnings[i];
                var severity = vscode_languageserver_1.DiagnosticSeverity.Error;
                switch (error.type) {
                    case "warning":
                        severity = vscode_languageserver_1.DiagnosticSeverity.Warning;
                        break;
                    case "info":
                        severity = vscode_languageserver_1.DiagnosticSeverity.Information;
                        break;
                    default:
                        severity = vscode_languageserver_1.DiagnosticSeverity.Error;
                        break;
                }
                diagnostics.push({
                    severity: severity,
                    range: vscode_languageserver_1.Range.create(error.info.line - 1, error.info.character - 1, error.info.line - 1, 255),
                    message: error.info.message,
                    source: 'erl'
                });
            }
        }
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }
}
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=lspserver.js.map