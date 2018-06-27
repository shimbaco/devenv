"use strict";
const common_1 = require("./common");
function historyCommand() {
    common_1.baseCommand('history', { github: formatGitHubHistoryUrl, bitbucket: formatBitbucketHistoryUrl });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = historyCommand;
function formatGitHubHistoryUrl(remote, branch, filePath, lines) {
    return `${remote}/commits/${branch}/${filePath}`;
}
exports.formatGitHubHistoryUrl = formatGitHubHistoryUrl;
function formatBitbucketHistoryUrl(remote, branch, filePath, lines) {
    return `${remote}/history-node/${branch}/${filePath}`;
}
exports.formatBitbucketHistoryUrl = formatBitbucketHistoryUrl;
//# sourceMappingURL=history.js.map