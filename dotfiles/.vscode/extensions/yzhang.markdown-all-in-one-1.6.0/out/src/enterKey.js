'use strict';
const vscode_1 = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.onEnterKey', onEnterKey));
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.onTabKey', onTabKey));
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.onBackspaceKey', onBackspaceKey));
}
exports.activate = activate;
function onEnterKey() {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let textBeforeCursor = editor.document.lineAt(cursorPos.line).text.substr(0, cursorPos.character);
    let matches;
    if ((matches = /(\s*[-\+\*] ).+/.exec(textBeforeCursor)) !== null) {
        editor.edit(editBuilder => {
            editBuilder.insert(cursorPos, `\n${matches[1]}`);
        });
    }
    else if ((matches = /(\s*)([0-8])([\.\)] )(.+)/.exec(textBeforeCursor)) !== null) {
        let config = vscode_1.workspace.getConfiguration('markdown.extension.orderedList').get('marker');
        let marker = '1';
        if (config == 'ordered') {
            marker = String(Number(matches[2]) + 1);
        }
        editor.edit(editBuilder => {
            editBuilder.insert(cursorPos, `\n${matches[1] + marker + matches[3]}`);
        });
    }
    else {
        editor.edit(editBuilder => {
            editBuilder.insert(cursorPos, '\n');
        });
    }
}
function onTabKey() {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let textBeforeCursor = editor.document.lineAt(cursorPos.line).text.substr(0, cursorPos.character);
    if (/^\s*[-\+\*] $/.test(textBeforeCursor) || /^\s*[0-8][\.\)] $/.test(textBeforeCursor)) {
        vscode_1.commands.executeCommand('editor.action.indentLines');
    }
    else {
        vscode_1.commands.executeCommand('tab');
    }
}
function onBackspaceKey() {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let textBeforeCursor = editor.document.lineAt(cursorPos.line).text.substr(0, cursorPos.character);
    if (/^\s+[-\+\*] $/.test(textBeforeCursor) || /^\s+[0-9][\.\)] $/.test(textBeforeCursor)) {
        vscode_1.commands.executeCommand('editor.action.outdentLines');
    }
    else if (/^[-\+\*] $/.test(textBeforeCursor) || /^[0-9][\.\)] $/.test(textBeforeCursor)) {
        editor.edit(editBuilder => {
            editBuilder.delete(new vscode_1.Range(cursorPos.with({ character: 0 }), cursorPos));
        });
    }
    else {
        vscode_1.commands.executeCommand('deleteLeft');
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=enterKey.js.map