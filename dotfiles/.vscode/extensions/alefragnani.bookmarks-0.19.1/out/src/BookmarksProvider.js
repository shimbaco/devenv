"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const json = require("jsonc-parser");
const path = require("path");
class JsonOutlineProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        vscode.window.onDidChangeActiveTextEditor(editor => {
            this.parseTree();
            this._onDidChangeTreeData.fire();
        });
        vscode.workspace.onDidChangeTextDocument(e => {
        });
        this.parseTree();
    }
    onDocumentChanged(changeEvent) {
        if (changeEvent.document.uri.toString() === this.editor.document.uri.toString()) {
            for (const change of changeEvent.contentChanges) {
            }
        }
    }
    parseTree() {
        this.tree = null;
        this.editor = vscode.window.activeTextEditor;
        if (this.editor && this.editor.document && this.editor.document.languageId === 'json') {
            this.tree = json.parseTree(this.editor.document.getText());
        }
    }
    getChildren(node) {
        if (node) {
            return Promise.resolve(this._getChildren(node));
        }
        else {
            return Promise.resolve(this.tree ? this.tree.children : []);
        }
    }
    _getChildren(node) {
        return node.parent.type === 'array' ? this.toArrayValueNode(node) : (node.type === 'array' ? node.children[0].children : node.children[1].children);
    }
    toArrayValueNode(node) {
        if (node.type === 'array' || node.type === 'object') {
            return node.children;
        }
        node['arrayValue'] = true;
        return [node];
    }
    getTreeItem(node) {
        let valueNode = node.parent.type === 'array' ? node : node.children[1];
        let hasChildren = (node.parent.type === 'array' && !node['arrayValue']) || valueNode.type === 'object' || valueNode.type === 'array';
        let treeItem = new vscode.TreeItem(this.getLabel(node), hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        treeItem.command = {
            command: 'extension.openJsonSelection',
            title: '',
            arguments: [new vscode.Range(this.editor.document.positionAt(node.offset), this.editor.document.positionAt(node.offset + node.length))]
        };
        treeItem.iconPath = this.getIcon(node);
        treeItem.contextValue = this.getNodeType(node);
        return treeItem;
    }
    select(range) {
        this.editor.selection = new vscode.Selection(range.start, range.end);
    }
    getIcon(node) {
        let nodeType = this.getNodeType(node);
        if (nodeType === 'boolean') {
            return {
                light: this.context.asAbsolutePath(path.join('resources', 'light', 'boolean.svg')),
                dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'boolean.svg'))
            };
        }
        if (nodeType === 'string') {
            return {
                light: this.context.asAbsolutePath(path.join('resources', 'light', 'string.svg')),
                dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'string.svg'))
            };
        }
        if (nodeType === 'number') {
            return {
                light: this.context.asAbsolutePath(path.join('resources', 'light', 'number.svg')),
                dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'number.svg'))
            };
        }
        return null;
    }
    getNodeType(node) {
        if (node.parent.type === 'array') {
            return node.type;
        }
        return node.children[1].type;
    }
    getLabel(node) {
        if (node.parent.type === 'array') {
            if (node['arrayValue']) {
                delete node['arrayValue'];
                if (!node.children) {
                    return node.value.toString();
                }
            }
            else {
                return node.parent.children.indexOf(node).toString();
            }
        }
        const property = node.children[0].value.toString();
        if (node.children[1].type === 'object') {
            return '{ } ' + property;
        }
        if (node.children[1].type === 'array') {
            return '[ ] ' + property;
        }
        const value = this.editor.document.getText(new vscode.Range(this.editor.document.positionAt(node.children[1].offset), this.editor.document.positionAt(node.children[1].offset + node.children[1].length)));
        return `${property}: ${value}`;
    }
}
exports.JsonOutlineProvider = JsonOutlineProvider;
//# sourceMappingURL=BookmarksProvider.js.map