"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
var erlangOutputChannel;
function ErlangOutput() {
    if (!erlangOutputChannel) {
        erlangOutputChannel = vscode.window.createOutputChannel('erlang');
    }
    return erlangOutputChannel;
}
exports.ErlangOutput = ErlangOutput;
function ErlangOutputAdapter() {
    return new ErlangWrapperOutput(ErlangOutput());
}
exports.ErlangOutputAdapter = ErlangOutputAdapter;
class ErlangWrapperOutput {
    constructor(channel) {
        this.channel = channel;
    }
    show() {
        this.channel.show();
    }
    appendLine(value) {
        this.channel.appendLine(value);
    }
}
//# sourceMappingURL=vscodeAdapter.js.map