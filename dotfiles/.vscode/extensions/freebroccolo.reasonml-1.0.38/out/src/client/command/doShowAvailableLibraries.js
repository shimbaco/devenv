"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ocaml_language_server_1 = require("ocaml-language-server");
const vscode = require("vscode");
function register(context, languageClient) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("reason.showAvailableLibraries", async (editor) => {
        const docURI = {
            uri: editor.document.uri.toString(),
        };
        const libraryLines = languageClient.sendRequest(ocaml_language_server_1.remote.server.giveAvailableLibraries, docURI);
        await vscode.window.showQuickPick(libraryLines);
        return;
    }));
}
exports.register = register;
//# sourceMappingURL=doShowAvailableLibraries.js.map