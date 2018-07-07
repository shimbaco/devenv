"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
///
/// get keys from a dictionary
///
function keysFromDictionary(dico) {
    var keySet = [];
    for (var prop in dico) {
        if (dico.hasOwnProperty(prop)) {
            keySet.push(prop);
        }
    }
    return keySet;
}
exports.keysFromDictionary = keysFromDictionary;
var myConsole;
function pgoConsole() {
    if (!myConsole) {
        myConsole = vscode.window.createOutputChannel('pgoconsole');
    }
    return myConsole;
}
exports.pgoConsole = pgoConsole;
//# sourceMappingURL=utils.js.map