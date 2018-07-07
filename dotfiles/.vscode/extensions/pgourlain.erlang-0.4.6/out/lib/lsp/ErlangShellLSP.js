"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GenericShell_1 = require("../GenericShell");
class ErlangShellLSP extends GenericShell_1.ErlGenericShell {
    constructor(whichOutput) {
        super(whichOutput);
    }
    Start(erlPath, startDir, listen_port, bridgePath, args) {
        //var debugStartArgs = ["-pa", `"${bridgePath}"`, "-pa", "ebin", "-s", "int",
        var debugStartArgs = ["-noshell", "-pa", "src", "-pa", "ebin", "-s", "int",
            "-vscode_port", listen_port.toString(),
            "-s", "vscode_lsp_entry", "start", listen_port.toString()];
        var processArgs = debugStartArgs.concat([args]);
        var result = this.LaunchProcess("erl", startDir, processArgs);
        return result;
    }
}
exports.ErlangShellLSP = ErlangShellLSP;
//# sourceMappingURL=ErlangShellLSP.js.map