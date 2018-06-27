"use strict";
const vscode = require("vscode");
const file_1 = require("./file");
const blame_1 = require("./blame");
const history_1 = require("./history");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('openInGithub.openInGitHubFile', file_1.default), vscode.commands.registerCommand('openInGithub.openInGitHubBlame', blame_1.default), vscode.commands.registerCommand('openInGithub.openInGitHubHistory', history_1.default));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map