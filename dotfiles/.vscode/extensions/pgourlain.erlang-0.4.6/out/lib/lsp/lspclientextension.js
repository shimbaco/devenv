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
const path = require("path");
const fs = require("fs");
const os = require("os");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const ErlangShellLSP_1 = require("./ErlangShellLSP");
const erlangConnection_1 = require("../erlangConnection");
const Net = require("net");
const lspcodelens = require("./lspcodelens");
const ErlangShellDebugger_1 = require("../ErlangShellDebugger");
let clients = new Map();
let lspOutputChannel;
var Configuration;
(function (Configuration) {
    let configurationListener;
    let fileSystemWatcher;
    // Convert VS Code specific settings to a format acceptable by the server. Since
    // both client and server do use JSON the conversion is trivial. 
    function computeConfiguration(params, _token, _next) {
        //lspOutputChannel.appendLine("computeConfiguration :"+ JSON.stringify(params));
        if (!params.items) {
            return null;
        }
        let result = [];
        for (let item of params.items) {
            if (item.section) {
                if (item.section === "<computed>") {
                    result.push({
                        autosave: vscode_1.workspace.getConfiguration("files").get("autoSave", "afterDelay") === "afterDelay",
                        tmpdir: os.tmpdir()
                    });
                }
                else {
                    result.push(vscode_1.workspace.getConfiguration(item.section));
                }
            }
            else {
                result.push(null);
            }
        }
        return result;
    }
    Configuration.computeConfiguration = computeConfiguration;
    function initialize() {
        //force to read configuration
        lspcodelens.configurationChanged();
        // VS Code currently doesn't sent fine grained configuration changes. So we 
        // listen to any change. However this will change in the near future.
        configurationListener = vscode_1.workspace.onDidChangeConfiguration(() => {
            lspcodelens.configurationChanged();
            exports.client.sendNotification(vscode_languageclient_1.DidChangeConfigurationNotification.type, { settings: null });
        });
        fileSystemWatcher = vscode_1.workspace.createFileSystemWatcher('**/*.erl');
        fileSystemWatcher.onDidCreate(uri => {
            exports.client.sendNotification(vscode_languageclient_1.DidChangeWatchedFilesNotification.type, { changes: [{ uri: uri.fsPath, type: vscode_languageclient_1.FileChangeType.Created }] });
        });
        fileSystemWatcher.onDidDelete(uri => {
            exports.client.sendNotification(vscode_languageclient_1.DidChangeWatchedFilesNotification.type, { changes: [{ uri: uri.fsPath, type: vscode_languageclient_1.FileChangeType.Deleted }] });
        });
    }
    Configuration.initialize = initialize;
    function dispose() {
        if (configurationListener) {
            configurationListener.dispose();
        }
    }
    Configuration.dispose = dispose;
})(Configuration || (Configuration = {}));
let _sortedWorkspaceFolders;
function sortedWorkspaceFolders() {
    if (_sortedWorkspaceFolders === void 0) {
        _sortedWorkspaceFolders = vscode_1.workspace.workspaceFolders.map(folder => {
            let result = folder.uri.toString();
            if (result.charAt(result.length - 1) !== '/') {
                result = result + '/';
            }
            return result;
        }).sort((a, b) => {
            return a.length - b.length;
        });
    }
    return _sortedWorkspaceFolders;
}
vscode_1.workspace.onDidChangeWorkspaceFolders(() => _sortedWorkspaceFolders = undefined);
function getOuterMostWorkspaceFolder(folder) {
    let sorted = sortedWorkspaceFolders();
    for (let element of sorted) {
        let uri = folder.uri.toString();
        if (uri.charAt(uri.length - 1) !== '/') {
            uri = uri + '/';
        }
        if (uri.startsWith(element)) {
            return vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.parse(element));
        }
    }
    return folder;
}
var MAX_TRIES = 10;
var WAIT_BETWEEN_TRIES_MS = 250;
/**
 * Tries to connect to a given socket location.
 * Time between retires grows in relation to attempts (attempt * RETRY_TIMER).
 *
 *  waitForSocket({ port: 2828, maxTries: 10 }, function(err, socket) {
 *  });
 *
 * Note- there is a third argument used to recursion that should
 * never be used publicly.
 *
 * Options:
 *  - (Number) port: to connect to.
 *  - (String) host: to connect to.
 *  - (Number) tries: number of times to attempt the connect.
 *
 * @param {Object} options for connection.
 * @param {Function} callback [err, socket].
 */
function waitForSocket(options, callback, _tries) {
    if (!options.port)
        throw new Error('.port is a required option');
    var maxTries = options.tries || MAX_TRIES;
    var host = options.host || 'localhost';
    var port = options.port;
    _tries = _tries || 0;
    if (_tries >= maxTries)
        return callback(new Error('cannot open socket'));
    function handleError() {
        // retry connection
        setTimeout(waitForSocket, 
        // wait at least WAIT_BETWEEN_TRIES_MS or a multiplier
        // of the attempts.
        (WAIT_BETWEEN_TRIES_MS * _tries) || WAIT_BETWEEN_TRIES_MS, options, callback, ++_tries);
    }
    var socket = Net.connect(port, host, function (one, two) {
        socket.removeListener('error', handleError);
        callback(null, socket);
    });
    socket.once('error', handleError);
}
function compile_erlang_connection() {
    return new Promise((a, r) => {
        //TODO: #if DEBUG
        var compiler = new ErlangShellDebugger_1.ErlangShellForDebugging(lspOutputChannel);
        compiler.erlangPath = vscode_1.workspace.getConfiguration("erlang").get("erlangPath", null);
        var erlFiles = ["vscode_lsp_entry.erl"];
        //create dir if not exists
        let ebinDir = path.normalize(path.join(erlangConnection_1.erlangBridgePath, "..", "ebin"));
        if (!fs.existsSync(ebinDir)) {
            fs.mkdirSync(ebinDir);
        }
        let args = ["-o", "../ebin"].concat(erlFiles);
        return compiler.Compile(erlangConnection_1.erlangBridgePath, args).then(res => {
            //this.debug("Compilation of erlang bridge...ok");
            a(res);
        }, exitCode => {
            console.log("Compilation of erlang bridge...ko");
            r(exitCode);
        });
    });
}
function getPort(callback) {
    var server = Net.createServer(function (sock) {
        sock.end('OK\n');
    });
    server.listen(0, function () {
        var port = server.address().port;
        server.close(function () {
            callback(port);
        });
    });
}
function activate(context) {
    if (vscode_1.workspace.getConfiguration("erlang").get("verbose", false))
        lspOutputChannel = vscode_1.window.createOutputChannel('Erlang Language Server');
    let middleware = {
        workspace: {
            configuration: Configuration.computeConfiguration
        },
        provideCodeLenses: (document, token) => {
            return Promise.resolve(lspcodelens.onProvideCodeLenses(document, token)).then(x => x);
        },
        resolveCodeLens: (codeLens) => {
            return Promise.resolve(lspcodelens.onResolveCodeLenses(codeLens)).then(x => x);
        },
        didSave: (data, next) => {
            next(data); //call LSP
            lspcodelens.onDocumentDidSave();
        }
    };
    // Options to control the language client
    let clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'erlang' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contain in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.clientrc'),
        },
        middleware: middleware,
        diagnosticCollectionName: 'Erlang Language Server',
        outputChannel: lspOutputChannel
    };
    let clientName = vscode_1.workspace.getConfiguration("erlang").get("verbose", false) ? 'Erlang Language Server' : '';
    exports.client = new vscode_languageclient_1.LanguageClient(clientName, () => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield compile_erlang_connection();
            let erlangLsp = new ErlangShellLSP_1.ErlangShellLSP(lspOutputChannel);
            erlangLsp.erlangPath = vscode_1.workspace.getConfiguration("erlang").get("erlangPath", null);
            getPort(function (port) {
                return __awaiter(this, void 0, void 0, function* () {
                    erlangLsp.Start("", erlangConnection_1.erlangBridgePath + "/..", port, "src", "");
                    let socket = yield waitForSocket({ port: port }, function (error, socket) {
                        resolve({ reader: socket, writer: socket });
                    }, undefined);
                });
            });
        }));
    }), clientOptions, true);
    Configuration.initialize();
    // Start the client. This will also launch the server
    exports.client.start();
}
exports.activate = activate;
function debugLog(msg) {
    if (lspOutputChannel) {
        lspOutputChannel.appendLine(msg);
    }
}
exports.debugLog = debugLog;
function deactivate() {
    if (!exports.client) {
        return undefined;
    }
    Configuration.dispose();
    return exports.client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=lspclientextension.js.map