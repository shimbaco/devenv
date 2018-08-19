"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function register(context, languageClient) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("reason.codeAction.fixUnusedVariable", async (editor, _, [{ range }, name]) => {
        await editor.edit(editBuilder => {
            const editRange = languageClient.protocol2CodeConverter.asRange(range);
            editBuilder.replace(editRange, `_${name}`);
        });
    }));
}
exports.register = register;
//# sourceMappingURL=fixUnusedVariable.js.map