"use strict";
const common_1 = require("./common");
function blameCommand() {
    common_1.baseCommand('blame', { github: formatGitHubBlameUrl, bitbucket: formatBitbucketBlameUrl });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = blameCommand;
function formatGitHubBlameUrl(remote, branch, filePath, lines) {
    return `${remote}/blame/${branch}/${filePath}${common_1.formatGitHubLinePointer(lines)}`;
}
exports.formatGitHubBlameUrl = formatGitHubBlameUrl;
function formatBitbucketBlameUrl(remote, branch, filePath, lines) {
    return `${remote}/annotate/${branch}/${filePath}${common_1.formatBitbucketLinePointer(filePath, lines)}`;
}
exports.formatBitbucketBlameUrl = formatBitbucketBlameUrl;
//# sourceMappingURL=blame.js.map