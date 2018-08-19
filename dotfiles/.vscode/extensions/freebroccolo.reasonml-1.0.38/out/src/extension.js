"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const client = require("./client");
const reasonConfiguration = {
    indentationRules: {
        decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
        increaseIndentPattern: /^.*\{[^}"']*$/,
    },
    onEnterRules: [
        {
            beforeText: /^.*\b(switch|try)\b[^\{]*{\s*$/,
            action: {
                indentAction: vscode.IndentAction.IndentOutdent,
                appendText: "| ",
            },
        },
        {
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            afterText: /^\s*\*\/$/,
            action: {
                indentAction: vscode.IndentAction.IndentOutdent,
                appendText: " * ",
            },
        },
        {
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            action: {
                indentAction: vscode.IndentAction.None,
                appendText: " * ",
            },
        },
        {
            beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
            action: {
                indentAction: vscode.IndentAction.None,
                appendText: "* ",
            },
        },
        {
            beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
            action: {
                indentAction: vscode.IndentAction.None,
                removeText: 1,
            },
        },
        {
            beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
            action: {
                indentAction: vscode.IndentAction.None,
                removeText: 1,
            },
        },
        {
            beforeText: /^.*\bfun\b\s*$/,
            action: {
                indentAction: vscode.IndentAction.None,
                appendText: "| ",
            },
        },
        {
            beforeText: /^\s*\btype\b.*=(.*[^;\\{<]\s*)?$/,
            afterText: /^\s*$/,
            action: {
                indentAction: vscode.IndentAction.None,
                appendText: "  | ",
            },
        },
        {
            beforeText: /^(\t|[ ]{2})*[\|]([^!$%&*+-/<=>?@^~;}])*(?:$|=>.*[^\s\{]\s*$)/m,
            action: {
                indentAction: vscode.IndentAction.None,
                appendText: "| ",
            },
        },
        {
            beforeText: /^(\t|(\ \ ))*\|(.*[;])$/,
            action: {
                indentAction: vscode.IndentAction.Outdent,
            },
        },
        {
            beforeText: /^(\t|(\ \ ))*;\s*$/,
            action: {
                indentAction: vscode.IndentAction.Outdent,
            },
        },
    ],
    wordPattern: /\\[^\s]+|[^\\\s\d(){}\[\]#.][^\\\s(){}\[\]#.]*/,
};
async function activate(context) {
    context.subscriptions.push(vscode.languages.setLanguageConfiguration("reason", reasonConfiguration));
    await client.launch(context);
}
exports.activate = activate;
function deactivate() {
    return;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map