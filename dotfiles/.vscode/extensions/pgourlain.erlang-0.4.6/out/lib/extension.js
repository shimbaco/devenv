"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const Adapter = require("./vscodeAdapter");
const Rebar = require("./RebarRunner");
const Eunit = require("./eunitRunner");
const ErlangConfigurationProvider_1 = require("./ErlangConfigurationProvider");
const erlangConnection = require("./erlangConnection");
const Utils = require("./utils");
const LspClient = require("./lsp/lspclientextension");
var myoutputChannel;
var myConsole;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    erlangConnection.setExtensionPath(context.extensionPath);
    myoutputChannel = Adapter.ErlangOutput();
    myConsole = Utils.pgoConsole();
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "erlang" is now active!');
    myConsole.appendLine("erlang extension is active");
    //configuration of erlang language -> documentation : https://code.visualstudio.com/Docs/extensionAPI/vscode-api#LanguageConfiguration
    var disposables = [];
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    //disposables.push(vscode.commands.registerCommand('extension.rebarBuild', () => { runRebarCommand(['compile']);}));
    var rebar = new Rebar.RebarRunner();
    rebar.activate(context.subscriptions);
    var eunit = new Eunit.EunitRunner();
    eunit.activate(context);
    disposables.push(vscode_1.debug.registerDebugConfigurationProvider("erlang", new ErlangConfigurationProvider_1.ErlangDebugConfigurationProvider()));
    disposables.forEach((disposable => context.subscriptions.push(disposable)));
    LspClient.activate(context);
    vscode_1.languages.setLanguageConfiguration("erlang", {
        onEnterRules: [
            {
                beforeText: /^.*(->|\s+(after|catch|if|of|receive))\s*$/,
                action: { indentAction: vscode_1.IndentAction.Indent }
            },
            {
                beforeText: /^\s*end$/,
                action: { indentAction: vscode_1.IndentAction.Outdent }
            },
            {
                beforeText: /^.*[^;,[({<]\s*$/,
                action: { indentAction: vscode_1.IndentAction.Outdent }
            },
            {
                beforeText: /^.*->.+;\s*$/,
                action: { indentAction: vscode_1.IndentAction.None }
            },
            {
                beforeText: /^.*(\.|;)\s*$/,
                action: { indentAction: vscode_1.IndentAction.Outdent }
            },
            {
                beforeText: /^%%% .*$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: "%%% " }
            },
            {
                beforeText: /^%%%.*$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: "%%%" }
            }
        ]
    });
}
exports.activate = activate;
function deactivate() {
    return LspClient.deactivate();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map