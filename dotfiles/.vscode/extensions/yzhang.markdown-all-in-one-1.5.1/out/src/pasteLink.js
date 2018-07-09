'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('markdown.extension.paste', paste));
}
exports.activate = activate;
function paste(editor, edit) {
}
//# sourceMappingURL=pasteLink.js.map