"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flatMap = require("lodash.flatmap");
const path = require("path");
const vscode = require("vscode");
const client = require("vscode-languageclient");
const command = require("./command");
const request = require("./request");
class ClientWindow {
    constructor() {
        this.merlin = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        this.merlin.text = "$(hubot) [loading]";
        this.merlin.command = "reason.showMerlinFiles";
        this.merlin.show();
        return this;
    }
    dispose() {
        this.merlin.dispose();
    }
}
class ErrorHandler {
    closed() {
        return client.CloseAction.DoNotRestart;
    }
    error() {
        return client.ErrorAction.Shutdown;
    }
}
async function launch(context) {
    const reasonConfig = vscode.workspace.getConfiguration("reason");
    const module = context.asAbsolutePath(path.join("node_modules", "ocaml-language-server", "bin", "server"));
    const options = { execArgv: ["--nolazy", "--inspect=6009"] };
    const transport = client.TransportKind.ipc;
    const run = { module, transport };
    const debug = {
        module,
        options,
        transport,
    };
    const serverOptions = { run, debug };
    const languages = reasonConfig.get("server.languages", ["ocaml", "reason"]);
    const documentSelector = flatMap(languages, (language) => [
        { language, scheme: "file" },
        { language, scheme: "untitled" },
    ]);
    const clientOptions = {
        diagnosticCollectionName: "ocaml-language-server",
        documentSelector,
        errorHandler: new ErrorHandler(),
        initializationOptions: reasonConfig,
        outputChannelName: "OCaml Language Server",
        stdioEncoding: "utf8",
        synchronize: {
            configurationSection: "reason",
            fileEvents: [
                vscode.workspace.createFileSystemWatcher("**/.merlin"),
                vscode.workspace.createFileSystemWatcher("**/*.ml"),
                vscode.workspace.createFileSystemWatcher("**/*.re"),
                vscode.workspace.createFileSystemWatcher("**/command-exec"),
                vscode.workspace.createFileSystemWatcher("**/command-exec.bat"),
                vscode.workspace.createFileSystemWatcher("**/_build"),
                vscode.workspace.createFileSystemWatcher("**/_build/*"),
            ],
        },
    };
    const languageClient = new client.LanguageClient("Reason", serverOptions, clientOptions);
    const window = new ClientWindow();
    const session = languageClient.start();
    context.subscriptions.push(window);
    context.subscriptions.push(session);
    await languageClient.onReady();
    command.registerAll(context, languageClient);
    request.registerAll(context, languageClient);
    window.merlin.text = "$(hubot) [merlin]";
    window.merlin.tooltip = "merlin server online";
}
exports.launch = launch;
//# sourceMappingURL=index.js.map