/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const vscode = require("vscode");
const configuration_1 = require("./configuration");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const os_1 = require("os");
function activate(context) {
    if (!shell.which("elixir")) {
        vscode.window.showErrorMessage("'elixir' command not found in path. Ensure Elixir is installed and available in path");
        return null;
    }
    const command = os_1.platform() == "win32" ? "language_server.bat" : "language_server.sh";
    const serverOpts = {
        command: context.asAbsolutePath("./elixir-ls-release/" + command)
    };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions = {
        run: serverOpts,
        debug: serverOpts
    };
    // Options to control the language client
    let clientOptions = {
        // Register the server for Elixir documents
        documentSelector: ["elixir"],
        // Don't focus the Output pane on errors because request handler errors are no big deal
        revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
        synchronize: {
            // Synchronize the setting section 'elixirLS' to the server
            configurationSection: "elixirLS",
            // Notify the server about file changes to Elixir files contained in the workspace
            fileEvents: [
                vscode_1.workspace.createFileSystemWatcher("**/*.{ex,exs,erl,yrl,xrl,eex}")
            ]
        }
    };
    // Create the language client and start the client.
    let disposable = new vscode_languageclient_1.LanguageClient("ElixirLS", "ElixirLS", serverOptions, clientOptions).start();
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
    context.subscriptions.push(vscode.languages.setLanguageConfiguration("elixir", configuration_1.configuration));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map