"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ocaml_language_server_1 = require("ocaml-language-server");
const vscode = require("vscode");
const SHOW_ALL_STR = "Show Entire Environment";
function register(context, languageClient) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("reason.showProjectEnv", async (editor) => {
        const docURI = {
            uri: editor.document.uri.toString(),
        };
        const projectEnv = await languageClient.sendRequest(ocaml_language_server_1.remote.server.giveProjectEnv, docURI);
        const projectEnvWithAll = [SHOW_ALL_STR].concat(projectEnv);
        const selected = await vscode.window.showQuickPick(projectEnvWithAll);
        if (null == selected)
            return;
        const content = selected === SHOW_ALL_STR ? projectEnv.join("\n") : selected;
        const textDocument = await vscode.workspace.openTextDocument({
            content,
            language: "shellscript",
        });
        await vscode.window.showTextDocument(textDocument);
    }));
}
exports.register = register;
//# sourceMappingURL=doShowProjectEnv.js.map