"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("./GenericShell");
const adapt = require("./vscodeAdapter");
class ErlangShell extends shell.ErlGenericShell {
    constructor() {
        super(adapt.ErlangOutputAdapter()); //ErlangShell.ErlangOutput);
    }
    Start(startDir, args) {
        return this.RunProcess("erl", startDir, args);
    }
}
exports.ErlangShell = ErlangShell;
class ErlangCompilerShell extends shell.ErlGenericShell {
    constructor() {
        super(adapt.ErlangOutputAdapter()); //ErlangShell.ErlangOutput);
    }
    Start(startDir, args) {
        return this.RunProcess("erlc", startDir, args);
    }
}
exports.ErlangCompilerShell = ErlangCompilerShell;
//# sourceMappingURL=ErlangShell.js.map