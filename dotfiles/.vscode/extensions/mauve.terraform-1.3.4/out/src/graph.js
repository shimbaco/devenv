"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers_1 = require("./helpers");
const template_1 = require("./template");
const Viz = require('viz.js');
exports.graphPreviewUri = vscode.Uri.parse('terraform-graph://authority/terraform-graph');
class GraphContentProvider {
    constructor(ctx) {
        this.ctx = ctx;
        this._onDidChange = new vscode.EventEmitter();
        this.dot = "";
        this.type = "";
        this.groupUri = "";
        this.onDidChange = this._onDidChange.event;
    }
    provideTextDocumentContent(uri, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let template = yield helpers_1.read(this.ctx.asAbsolutePath('out/src/ui/graph.html'));
            let svgDoc = Viz(this.dot);
            let start = svgDoc.indexOf('<svg');
            let end = svgDoc.indexOf('</svg>', start);
            let element = svgDoc.substr(start, end - start + 6);
            return template_1.loadTemplate(this.ctx.asAbsolutePath('out/src/ui/graph.html'), {
                type: this.type,
                element: element,
                groupUri: this.groupUri
            });
        });
    }
    update(dot, type, group) {
        this.dot = dot;
        this.type = type;
        this.groupUri = group.uri.toString();
        this._onDidChange.fire();
    }
}
exports.GraphContentProvider = GraphContentProvider;

//# sourceMappingURL=graph.js.map
