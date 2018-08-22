"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const position_1 = require("./position");
function to_vscode_Position(pos) {
    return new vscode.Position(pos.line, pos.character);
}
exports.to_vscode_Position = to_vscode_Position;
function to_vscode_Range(range) {
    return new vscode.Range(to_vscode_Position(range.start), to_vscode_Position(range.end));
}
exports.to_vscode_Range = to_vscode_Range;
function to_vscode_Location(location) {
    return new vscode.Location(location.uri, to_vscode_Range(location.range));
}
exports.to_vscode_Location = to_vscode_Location;
function from_vscode_Position(pos) {
    return new position_1.Position(pos.line, pos.character);
}
exports.from_vscode_Position = from_vscode_Position;

//# sourceMappingURL=vscode-adapter.js.map
