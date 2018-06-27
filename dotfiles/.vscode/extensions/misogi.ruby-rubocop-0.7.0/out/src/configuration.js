"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vs = require("vscode");
const fs = require("fs");
const cp = require("child_process");
const path = require("path");
exports.onDidChangeConfiguration = (rubocop) => {
    return () => rubocop.config = exports.getConfig();
};
/**
 * Read the workspace configuration for 'ruby.rubocop' and return a RubocopConfig.
 * @return {RubocopConfig} config object
 */
exports.getConfig = () => {
    const win32 = process.platform === 'win32';
    const cmd = win32 ? 'rubocop.bat' : 'rubocop';
    const conf = vs.workspace.getConfiguration('ruby.rubocop');
    let useBundler;
    let path = conf.get('executePath', '');
    let command;
    // if executePath is present in workspace config, use it.
    if (path.length !== 0) {
        command = path + cmd;
    }
    else if (detectBundledRubocop()) {
        useBundler = true;
        command = `bundle exec ${cmd}`;
    }
    else {
        path = autodetectExecutePath(cmd);
        if (0 === path.length) {
            vs.window.showWarningMessage('execute path is empty! please check ruby.rubocop.executePath');
        }
        command = path + cmd;
    }
    return {
        useBundler,
        command,
        configFilePath: conf.get('configFilePath', ''),
        onSave: conf.get('onSave', true),
    };
};
const detectBundledRubocop = () => {
    try {
        cp.execSync('bundle show rubocop', { cwd: vs.workspace.rootPath });
        return true;
    }
    catch (e) {
        return false;
    }
};
const autodetectExecutePath = (cmd) => {
    const key = 'PATH';
    let paths = process.env[key];
    if (!paths) {
        return '';
    }
    let pathparts = paths.split(path.delimiter);
    for (let i = 0; i < pathparts.length; i++) {
        let binpath = path.join(pathparts[i], cmd);
        if (fs.existsSync(binpath)) {
            return pathparts[i] + path.sep;
        }
    }
    return '';
};
//# sourceMappingURL=configuration.js.map