"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
const net = require("net");
const vscode_1 = require("vscode");
const vscode = require("vscode");
function makeLanguageClient(socketProvider) {
    let convertDocumentation = function (text) {
        var regexp = /\(solargraph\:(.*?)\)/g;
        var match;
        var adjusted = text;
        while (match = regexp.exec(text)) {
            var commandUri = "(command:solargraph._openDocumentUrl?" + encodeURI(JSON.stringify("solargraph:" + match[1])) + ")";
            adjusted = adjusted.replace(match[0], commandUri);
        }
        var md = new vscode_1.MarkdownString(adjusted);
        md.isTrusted = true;
        return md;
    };
    let middleware = {
        provideHover: (document, position, token, next) => {
            return new Promise((resolve) => {
                var promise = next(document, position, token);
                // HACK: It's a promise, but TypeScript doesn't recognize it
                promise['then']((hover) => {
                    var contents = [];
                    hover.contents.forEach((orig) => {
                        contents.push(convertDocumentation(orig.value));
                    });
                    resolve(new vscode_1.Hover(contents));
                });
            });
        },
        resolveCompletionItem: (item, token, next) => {
            return new Promise((resolve) => {
                var promise = next(item, token);
                // HACK: It's a promise, but TypeScript doesn't recognize it
                promise['then']((item) => {
                    if (item.documentation) {
                        item.documentation = convertDocumentation(item.documentation.toString());
                    }
                    resolve(item);
                });
            });
        }
    };
    // Options to control the language client
    let clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'ruby' }],
        synchronize: {
            // Synchronize the setting section 'solargraph' to the server
            configurationSection: 'solargraph',
            // Notify the server about file changes to any file in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*')
        },
        middleware: middleware,
        initializationOptions: {
            enablePages: true,
            viewsPath: vscode.extensions.getExtension('castwide.solargraph').extensionPath + '/views'
        }
    };
    let serverOptions = () => {
        return new Promise((resolve) => {
            let socket = net.createConnection(socketProvider.port);
            resolve({
                reader: socket,
                writer: socket
            });
        });
    };
    let client = new vscode_languageclient_1.LanguageClient('Ruby Language Server', serverOptions, clientOptions);
    let prepareStatus = vscode.window.setStatusBarMessage('Starting the Solargraph language server...');
    client.onReady().then(() => {
        prepareStatus.dispose();
        vscode.window.setStatusBarMessage('Solargraph is ready.', 3000);
        // if (vscode.workspace.getConfiguration('solargraph').checkGemVersion) {
        // 	client.sendNotification('$/solargraph/checkGemVersion');
        // }
    }).catch(() => {
        prepareStatus.dispose();
        vscode.window.setStatusBarMessage('Solargraph failed to initialize.', 3000);
    });
    return client;
}
exports.makeLanguageClient = makeLanguageClient;
//# sourceMappingURL=language-client.js.map