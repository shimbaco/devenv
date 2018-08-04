'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils = require("./utils");
const languageConfiguration_1 = require("./languageConfiguration");
const completion_1 = require("./providers/completion");
const formatter_1 = require("./providers/formatter");
const highlight_1 = require("./providers/highlight");
const intellisense_1 = require("./providers/intellisense");
const linters_1 = require("./providers/linters");
const rake_1 = require("./task/rake");
const DOCUMENT_SELECTOR = [
    { language: 'ruby', scheme: 'file' },
    { language: 'ruby', scheme: 'untitled' }
];
function activate(context) {
    const subs = context.subscriptions;
    // register language config
    vscode_1.languages.setLanguageConfiguration('ruby', languageConfiguration_1.default);
    // Register providers
    highlight_1.registerHighlightProvider(context, DOCUMENT_SELECTOR);
    completion_1.registerCompletionProvider(context, DOCUMENT_SELECTOR);
    formatter_1.registerFormatter(context, DOCUMENT_SELECTOR);
    if (vscode_1.workspace.rootPath) {
        linters_1.registerLinters(context);
        intellisense_1.registerIntellisenseProvider(context);
        rake_1.registerTaskProvider(context);
    }
    utils.loadEnv();
}
exports.activate = activate;
//# sourceMappingURL=ruby.js.map