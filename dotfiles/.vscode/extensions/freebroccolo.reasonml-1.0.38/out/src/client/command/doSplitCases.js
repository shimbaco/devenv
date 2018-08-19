"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ocaml_language_server_1 = require("ocaml-language-server");
const vscode = require("vscode");
const LSP = require("vscode-languageserver-protocol");
async function execute(editor, destruct) {
    const [{ end, start }, content] = destruct;
    return editor.edit(editBuilder => {
        const range = new vscode.Range(new vscode.Position(start.line - 1, start.col), new vscode.Position(end.line - 1, end.col));
        const cases = format(editor, content);
        editBuilder.replace(range, cases);
    });
}
function format(editor, content) {
    const line = editor.document.lineAt(editor.selection.start);
    const match = line.text.match(/^\s*/);
    const indentation = match && match.length > 0 ? match[0] : "";
    let result = content;
    result = format.deleteWhitespace(result);
    result = format.deleteParentheses(result);
    result = format.indentExpression(indentation, result);
    result = format.indentPatterns(result);
    result = format.insertPlaceholders(result);
    return result;
}
exports.format = format;
(function (format) {
    function deleteParentheses(content) {
        return content.replace(/^\(|\n\)$/g, "");
    }
    format.deleteParentheses = deleteParentheses;
    function deleteWhitespace(content) {
        return content.replace(/\n$/, "");
    }
    format.deleteWhitespace = deleteWhitespace;
    function indentExpression(indentation, content) {
        return !/^\bswitch\b/g.test(content)
            ? content
            : content.replace(/\|/g, `${indentation}|`).replace(/}$/g, `${indentation}}`);
    }
    format.indentExpression = indentExpression;
    function indentPatterns(content) {
        return content.replace(/{(?!\s)/g, "{ ").replace(/([^\s])}/g, "$1 }");
    }
    format.indentPatterns = indentPatterns;
    function insertPlaceholders(content) {
        return content.replace(/\(\?\?\)/g, `failwith "<case>"`);
    }
    format.insertPlaceholders = insertPlaceholders;
})(format = exports.format || (exports.format = {}));
function register(context, languageClient) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("reason.caseSplit", async (editor) => {
        const textDocument = { uri: editor.document.uri.toString() };
        const rangeCode = editor.document.getWordRangeAtPosition(editor.selection.start);
        if (null == rangeCode)
            return;
        const range = LSP.Range.create(rangeCode.start, rangeCode.end);
        const params = { range, textDocument };
        try {
            const response = await languageClient.sendRequest(ocaml_language_server_1.remote.server.giveCaseAnalysis, params);
            if (null != response)
                await execute(editor, response);
        }
        catch (err) {
            const pattern = /Destruct not allowed on non-immediate type/;
            if (pattern.test(err)) {
                vscode.window.showWarningMessage("More type info needed for case split; try adding an annotation somewhere, e.g., (pattern: type).");
            }
        }
    }));
}
exports.register = register;
//# sourceMappingURL=doSplitCases.js.map