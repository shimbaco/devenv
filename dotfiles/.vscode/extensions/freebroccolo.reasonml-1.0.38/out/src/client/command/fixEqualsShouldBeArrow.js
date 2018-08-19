"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function register(context, languageClient) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("reason.codeAction.fixEqualsShouldBeArrow", async (editor, _, [{ range: { end: position } }]) => {
        await editor.edit(editBuilder => {
            const editPosition = languageClient.protocol2CodeConverter.asPosition(position);
            editBuilder.insert(editPosition, ">");
        });
    }));
}
exports.register = register;
//# sourceMappingURL=fixEqualsShouldBeArrow.js.map