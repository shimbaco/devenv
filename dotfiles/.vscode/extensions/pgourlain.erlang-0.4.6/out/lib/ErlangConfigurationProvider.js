"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class ErlangDebugConfigurationProvider {
    resolveDebugConfiguration(folder, debugConfiguration, token) {
        debugConfiguration.verbose = vscode_1.workspace.getConfiguration("erlang").get("verbose", false);
        debugConfiguration.erlangPath = vscode_1.workspace.getConfiguration("erlang").get("erlangPath", null);
        return debugConfiguration;
    }
}
exports.ErlangDebugConfigurationProvider = ErlangDebugConfigurationProvider;
;
//# sourceMappingURL=ErlangConfigurationProvider.js.map