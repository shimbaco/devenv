"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const utils = require("./utils");
var rebarOutputChannel;
/*
Rebar Compile
see : https://github.com/hoovercj/vscode-extension-tutorial

*/
class RebarRunner {
    activate(subscriptions) {
        this.compileCommand = vscode.commands.registerCommand('extension.rebarBuild', () => { this.runRebarCompile(); });
        this.getDepsCommand = vscode.commands.registerCommand('extension.rebarGetDeps', () => { this.runRebarCommand(['get-deps']); });
        this.updateDepsCommand = vscode.commands.registerCommand('extension.rebarUpdateDeps', () => { this.runRebarCommand(['update-deps']); });
        this.eunitCommand = vscode.commands.registerCommand('extension.rebareunit', () => { this.runRebarCommand(['eunit']); });
        this.eunitCommand = vscode.commands.registerCommand('extension.dialyzer', () => { this.runDialyzer(); });
        vscode.workspace.onDidCloseTextDocument(this.onCloseDocument.bind(this), null, subscriptions);
        vscode.workspace.onDidOpenTextDocument(this.onOpenDocument.bind(this), null, subscriptions);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection("erlang");
        subscriptions.push(this);
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.compileCommand.dispose();
        this.getDepsCommand.dispose();
        this.updateDepsCommand.dispose();
        this.eunitCommand.dispose();
        this.dialyzerCommand.dispose();
    }
    runRebarCompile() {
        try {
            var cfg = vscode.workspace.getConfiguration('erlang');
            var cfgRebarPath = cfg.get("rebarBuildArgs", ["compile"]);
            this.runScript(vscode.workspace.rootPath, cfgRebarPath).then(data => {
                this.diagnosticCollection.clear();
                this.parseCompilationResults(data);
            });
        }
        catch (e) {
            vscode.window.showErrorMessage('Couldn\'t execute rebar.\n' + e);
        }
    }
    parseForDiag(data, diagnostics, regex, severity) {
        //parse data while regex return matches
        do {
            var m = regex.exec(data);
            if (m) {
                var fileName = m[1];
                var peace = data.substring(m.index, regex.lastIndex);
                data = data.replace(peace, "");
                let message = m[m.length - 1];
                let range = new vscode.Range(Number(m[2]) - 1, 0, Number(m[2]) - 1, peace.length - 1);
                let diagnostic = new vscode.Diagnostic(range, message, severity);
                regex.lastIndex = 0;
                if (!diagnostics[fileName]) {
                    diagnostics[fileName] = [];
                }
                diagnostics[fileName].push(diagnostic);
            }
        } while (m != null);
        return data;
    }
    parseCompilationResults(data) {
        //how to test regexp : https://regex101.com/#javascript
        var diagnostics = {};
        //parsing warning at first
        var warnings = new RegExp("^(.*):(\\d+):(.*)Warning:(.*)$", "gmi");
        data = this.parseForDiag(data, diagnostics, warnings, vscode.DiagnosticSeverity.Warning);
        //then parse errors (because regex to detect errors include warnings too)
        var errors = new RegExp("^(.*):(\\d+):(.*)$", "gmi");
        data = this.parseForDiag(data, diagnostics, errors, vscode.DiagnosticSeverity.Error);
        var keys = utils.keysFromDictionary(diagnostics);
        keys.forEach(element => {
            var fileUri = vscode.Uri.file(path.join(vscode.workspace.rootPath, element));
            var diags = diagnostics[element];
            this.diagnosticCollection.set(fileUri, diags);
        });
    }
    runRebarCommand(command) {
        try {
            this.runScript(vscode.workspace.rootPath, command).then(data => {
            }, reject => { });
        }
        catch (e) {
            vscode.window.showErrorMessage('Couldn\'t execute rebar.\n' + e);
        }
    }
    runDialyzer() {
        try {
            this.runScript(vscode.workspace.rootPath, ["dialyzer"]).then(data => {
                this.diagnosticCollection.clear();
                var lines = data.split("\n");
                var currentFile = null;
                var lineAndMessage = new RegExp("^ +([0-9]+): *(.+)$");
                var diagnostics = {};
                for (var i = 0; i < lines.length; ++i) {
                    if (lines[i]) {
                        var match = lineAndMessage.exec(lines[i]);
                        if (match && currentFile) {
                            if (!diagnostics[currentFile])
                                diagnostics[currentFile] = [];
                            var range = new vscode.Range(Number(match[1]) - 1, 0, Number(match[1]) - 1, 255);
                            diagnostics[currentFile].push(new vscode.Diagnostic(range, match[2], vscode.DiagnosticSeverity.Information));
                        }
                        else {
                            var filepath = path.join(vscode.workspace.rootPath, lines[i]);
                            if (fs.existsSync(filepath))
                                currentFile = filepath;
                        }
                    }
                    else
                        currentFile = null;
                }
                utils.keysFromDictionary(diagnostics).forEach(filepath => {
                    var fileUri = vscode.Uri.file(filepath);
                    var diags = diagnostics[filepath];
                    this.diagnosticCollection.set(fileUri, diags);
                });
                if (utils.keysFromDictionary(diagnostics).length > 0)
                    vscode.commands.executeCommand("workbench.action.problems.focus");
            }, reject => { });
        }
        catch (e) {
            vscode.window.showErrorMessage('Couldn\'t execute rebar.\n' + e);
        }
    }
    getRebarFullPath(workspaceRootPath) {
        var cfg = vscode.workspace.getConfiguration('erlang');
        var cfgRebarPath = cfg.get("rebarPath", "");
        if (cfgRebarPath == "") {
            cfgRebarPath = workspaceRootPath;
        }
        var rebarSearchPaths = [cfgRebarPath];
        if (cfgRebarPath !== workspaceRootPath) {
            rebarSearchPaths.push(workspaceRootPath);
        }
        if (process.platform == 'win32') { // on Windows the extension root directory is searched too
            rebarSearchPaths.push(path.join(__dirname, '..', '..'));
        }
        return this.findBestFile(rebarSearchPaths, ['rebar3', 'rebar'], 'rebar3');
    }
    findBestFile(dirs, fileNames, defaultResult) {
        var result = defaultResult;
        for (var i = 0; i < dirs.length; i++) {
            for (var j = 0; j < fileNames.length; j++) {
                var fullPath = path.normalize(path.join(dirs[i], fileNames[j]));
                if (fs.existsSync(fullPath)) {
                    return fullPath;
                }
            }
        }
        return result;
    }
    runScript(dirName, commands) {
        return new Promise((a, r) => {
            var rebarFileName = this.getRebarFullPath(dirName);
            let args = commands;
            var outputChannel = RebarRunner.RebarOutput;
            var output = "";
            outputChannel.show();
            if (process.platform == 'win32') {
                args = [rebarFileName].concat(args);
                rebarFileName = 'escript.exe';
            }
            let rebar = child_process.spawn(rebarFileName, args, { cwd: dirName, stdio: 'pipe' });
            rebar.on('error', error => {
                outputChannel.appendLine(error.message);
                if (process.platform == 'win32') {
                    outputChannel.appendLine("ensure 'escript.exe' is in your path. And after changed your path, you must close vscode (all instances).");
                }
            });
            outputChannel.appendLine('starting rebar ' + commands + ' ...');
            rebar.stdout.on('data', buffer => {
                var bufferAsString = buffer.toString();
                output += bufferAsString;
                outputChannel.append(bufferAsString);
            });
            rebar.stderr.on('data', buffer => {
                outputChannel.append(buffer.toString());
            });
            rebar.on('close', (exitCode) => {
                outputChannel.appendLine('rebar exit code:' + exitCode);
                a(output);
            });
        });
    }
    onCloseDocument(doc) {
        //RebarRunner.RebarOutput.appendLine("doc close : " + doc.uri.toString());
        if (this.diagnosticCollection) {
            this.diagnosticCollection.delete(doc.uri);
        }
    }
    onOpenDocument(doc) {
        //RebarRunner.RebarOutput.appendLine("doc open : " + doc.uri.toString());
    }
    static get RebarOutput() {
        if (!rebarOutputChannel) {
            rebarOutputChannel = vscode.window.createOutputChannel('rebar');
        }
        return rebarOutputChannel;
    }
}
RebarRunner.commandId = 'extension.rebarBuild';
exports.RebarRunner = RebarRunner;
//# sourceMappingURL=RebarRunner.js.map