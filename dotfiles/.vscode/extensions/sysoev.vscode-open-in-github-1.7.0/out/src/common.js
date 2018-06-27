"use strict";
const vscode_1 = require("vscode");
const exec = require('child_process').exec;
const path = require('path');
const opn = require('opn');
const R = require('ramda');
exports.BRANCH_URL_SEP = ' — ';
/**
 * Makes initial preparations for all commands.
 *
 * @return {Promise}
 */
function baseCommand(commandName, formatters) {
    const activeTextEditor = vscode_1.window.activeTextEditor;
    if (!activeTextEditor) {
        vscode_1.window.showErrorMessage('No opened files.');
        return;
    }
    const filePath = vscode_1.window.activeTextEditor.document.fileName;
    const fileUri = vscode_1.window.activeTextEditor.document.uri;
    const lineStart = vscode_1.window.activeTextEditor.selection.start.line + 1;
    const lineEnd = vscode_1.window.activeTextEditor.selection.end.line + 1;
    const selectedLines = { start: lineStart, end: lineEnd };
    const defaultBranch = vscode_1.workspace.getConfiguration('openInGitHub', fileUri).get('defaultBranch') || 'master';
    const defaultRemote = vscode_1.workspace.getConfiguration('openInGitHub', fileUri).get('defaultRemote') || 'origin';
    const projectPath = path.dirname(filePath);
    return getRepoRoot(exec, projectPath)
        .then(repoRootPath => {
        const relativeFilePath = path.relative(repoRootPath, filePath);
        return getBranches(exec, projectPath, defaultBranch)
            .then(branches => {
            const getRemotesPromise = getRemotes(exec, projectPath, defaultRemote, defaultBranch, branches).then(formatRemotes);
            return Promise.all([getRemotesPromise, branches]);
        })
            .then(result => prepareQuickPickItems(formatters, commandName, relativeFilePath, selectedLines, result))
            .then(showQuickPickWindow)
            .catch(err => vscode_1.window.showErrorMessage(err));
    });
}
exports.baseCommand = baseCommand;
/**
 * Returns repo root path.
 *
 * @param {Function} exec
 * @param {String} workspacePath
 *
 * @return {Promise<String>}
 */
function getRepoRoot(exec, workspacePath) {
    return new Promise((resolve, reject) => {
        exec('git rev-parse --show-toplevel', { cwd: workspacePath }, (error, stdout, stderr) => {
            if (stderr || error)
                return reject(stderr || error);
            resolve(stdout.trim());
        });
    });
}
exports.getRepoRoot = getRepoRoot;
/**
 * Returns raw list of remotes.
 *
 * @param {Function} exec
 * @param {String} projectPath
 * @param {String} defaultRemote
 * @param {String} defaultBranch
 * @param {String[]} branches
 *
 * @return {Promise<String[]>}
 */
function getRemotes(exec, projectPath, defaultRemote, defaultBranch, branches) {
    /**
     * If there is only default branch that was pushed to remote then return only default remote.
     */
    if (branches.length === 1 && branches[0] === defaultBranch) {
        return getRemoteByName(exec, projectPath, defaultRemote);
    }
    return getAllRemotes(exec, projectPath);
}
exports.getRemotes = getRemotes;
/**
 * Returns raw list of all remotes.
 *
 * @todo: Should work on windows too...
 *
 * @param {Function} exec
 * @param {String} projectPath
 *
 * @return {Promise<String[]>}
 */
function getAllRemotes(exec, projectPath) {
    const process = R.compose(R.uniq, R.map(R.head), R.map(R.split(' ')), R.reject(R.isEmpty), R.map(R.last), R.map(R.split(/\t/)), R.split('\n'));
    return new Promise((resolve, reject) => {
        exec('git remote -v', { cwd: projectPath }, (error, stdout, stderr) => {
            if (stderr || error)
                return reject(stderr || error);
            resolve(process(stdout));
        });
    });
}
exports.getAllRemotes = getAllRemotes;
/**
 * Returns raw remote by given name e.g. – origin
 *
 * @param {Function} exec
 * @param {String} projectPath
 * @param {String} remoteName
 *
 * @return {Promise<String[]>}
 */
function getRemoteByName(exec, projectPath, remoteName) {
    return new Promise((resolve, reject) => {
        exec(`git config --get remote.${remoteName}.url`, { cwd: projectPath }, (error, stdout, stderr) => {
            if (stderr || error)
                return reject(stderr || error);
            resolve([stdout]);
        });
    });
}
exports.getRemoteByName = getRemoteByName;
/**
 * Returns formatted list of remotes.
 *
 * @param {String[]} remotes
 *
 * @return {String[]}
 */
function formatRemotes(remotes) {
    const process = R.compose(R.uniq, R.map(R.replace(/\/$/, '')), R.reject(R.isEmpty), R.map(R.replace(/\n/, '')), R.map(R.trim), R.map(rem => rem.replace(/\/\/(.+)@github/, '//github')), R.map(rem => rem.match(/github\.com/)
        ? rem.replace(/\.git(\b|$)/, '')
        : rem), R.map(rem => {
        if (rem.match(/^https?:/)) {
            return rem.replace(/\.git(\b|$)/, '');
        }
        else if (rem.match(/@/)) {
            return 'https://' +
                rem
                    .replace(/^.+@/, '')
                    .replace(/\.git(\b|$)/, '')
                    .replace(/:/g, '/');
        }
        else if (rem.match(/^ftps?:/)) {
            return rem.replace(/^ftp/, 'http');
        }
        else if (rem.match(/^ssh:/)) {
            return rem.replace(/^ssh/, 'https');
        }
        else if (rem.match(/^git:/)) {
            return rem.replace(/^git/, 'https');
        }
    }));
    return process(remotes);
}
exports.formatRemotes = formatRemotes;
/**
 * Returns current branch.
 *
 * @todo: Should work on windows too...
 *
 * @param {Function} exec
 * @param {String} filePath
 * @param {String} defaultBranch
 *
 * @return {Promise<String>}
 */
function getBranches(exec, projectPath, defaultBranch) {
    return new Promise((resolve, reject) => {
        exec('git branch --no-color -a', { cwd: projectPath }, (error, stdout, stderr) => {
            if (stderr || error)
                return reject(stderr || error);
            const getCurrentBranch = R.compose(R.trim, R.replace('*', ''), R.find(line => line.startsWith('*')), R.split('\n'));
            const processBranches = R.compose(R.filter(br => stdout.match(new RegExp(`remotes\/.*\/${br}`))), R.uniq);
            const currentBranch = getCurrentBranch(stdout);
            const branches = processBranches([currentBranch, defaultBranch]);
            resolve(branches);
        });
    });
}
exports.getBranches = getBranches;
function formatQuickPickItems(formatters, commandName, relativeFilePath, lines, remotes, branch) {
    return remotes
        .map(remote => (isBitbucket(remote)
        ? { remote, url: formatters.bitbucket(remote, branch, relativeFilePath, lines) }
        : { remote, url: formatters.github(remote, branch, relativeFilePath, lines) }))
        .map(remote => ({
        label: relativeFilePath,
        detail: `${branch} | ${remote.remote}`,
        description: `[${commandName}]`,
        url: remote.url
    }));
}
exports.formatQuickPickItems = formatQuickPickItems;
/**
 * Builds quick pick items list.
 *
 * @param {String} relativeFilePath
 * @param {SelectedLines} lines
 *
 * @return {String[]}
 */
function prepareQuickPickItems(formatters, commandName, relativeFilePath, lines, [remotes, branches]) {
    if (!branches.length) {
        return [];
    }
    if (branches.length === 1) {
        return formatQuickPickItems(formatters, commandName, relativeFilePath, lines, remotes, branches[0]);
    }
    const processBranches = R.compose(R.flatten, (result) => R.zip(result[0], result[1]), R.map(branch => formatQuickPickItems(formatters, commandName, relativeFilePath, lines, remotes, branch)));
    return processBranches(branches);
}
exports.prepareQuickPickItems = prepareQuickPickItems;
/**
 * Returns true if remote is butbicket.
 */
function isBitbucket(remote) {
    return !!remote.match('bitbucket.org');
}
exports.isBitbucket = isBitbucket;
function formatBitbucketLinePointer(filePath, lines) {
    if (!lines || !lines.start) {
        return '';
    }
    const fileBasename = `#${path.basename(filePath)}`;
    let linePointer = `${fileBasename}-${lines.start}`;
    if (lines.end && lines.end != lines.start)
        linePointer += `:${lines.end}`;
    return linePointer;
}
exports.formatBitbucketLinePointer = formatBitbucketLinePointer;
function formatGitHubLinePointer(lines) {
    if (!lines || !lines.start) {
        return '';
    }
    let linePointer = `#L${lines.start}`;
    if (lines.end && lines.end != lines.start)
        linePointer += `:L${lines.end}`;
    return linePointer;
}
exports.formatGitHubLinePointer = formatGitHubLinePointer;
/**
 * Shows quick pick window.
 *
 * @param {String[]} quickPickList
 */
function showQuickPickWindow(quickPickList) {
    if (quickPickList.length === 1) {
        openQuickPickItem(quickPickList[0]);
        return;
    }
    vscode_1.window
        .showQuickPick(quickPickList)
        .then(selected => openQuickPickItem(selected));
}
exports.showQuickPickWindow = showQuickPickWindow;
/**
 * Opens given quick pick item in browser.
 *
 * @todo: Should work on windows too...
 *
 * @param {String} item
 */
function openQuickPickItem(item) {
    if (!item)
        return;
    opn(item.url);
}
exports.openQuickPickItem = openQuickPickItem;
//# sourceMappingURL=common.js.map