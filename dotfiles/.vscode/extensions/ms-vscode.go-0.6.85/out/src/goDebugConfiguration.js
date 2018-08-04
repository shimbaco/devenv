'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
class GoDebugConfigurationProvider {
    provideDebugConfigurations(folder, token) {
        return [
            {
                'name': 'Launch',
                'type': 'go',
                'request': 'launch',
                'mode': 'debug',
                'remotePath': '',
                'port': 2345,
                'host': '127.0.0.1',
                'program': '${fileDirname}',
                'env': {},
                'args': [],
                'showLog': true
            }
        ];
    }
    resolveDebugConfiguration(folder, debugConfiguration, token) {
        if (!debugConfiguration || !debugConfiguration.request) { // if 'request' is missing interpret this as a missing launch.json
            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || activeEditor.document.languageId !== 'go') {
                return;
            }
            debugConfiguration = {
                'name': 'Launch',
                'type': 'go',
                'request': 'launch',
                'mode': 'debug',
                'program': activeEditor.document.fileName
            };
        }
        const gopath = util_1.getCurrentGoPath(folder ? folder.uri : null);
        if (!debugConfiguration['env']) {
            debugConfiguration['env'] = { 'GOPATH': gopath };
        }
        else if (!debugConfiguration['env']['GOPATH']) {
            debugConfiguration['env']['GOPATH'] = gopath;
        }
        const dlvConfig = vscode.workspace.getConfiguration('go', folder ? folder.uri : null).get('delveConfig');
        if (!debugConfiguration.hasOwnProperty('useApiV1') && dlvConfig.hasOwnProperty('useApiV1')) {
            debugConfiguration['useApiV1'] = dlvConfig['useApiV1'];
        }
        if (!debugConfiguration.hasOwnProperty('dlvLoadConfig') && dlvConfig.hasOwnProperty('dlvLoadConfig')) {
            debugConfiguration['dlvLoadConfig'] = dlvConfig['dlvLoadConfig'];
        }
        return debugConfiguration;
    }
}
exports.GoDebugConfigurationProvider = GoDebugConfigurationProvider;
//# sourceMappingURL=goDebugConfiguration.js.map