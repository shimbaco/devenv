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
const erlangConnection_1 = require("../erlangConnection");
class ErlangLspConnection extends erlangConnection_1.ErlangConnection {
    get_ErlangFiles() {
        return ["vscode_lsp_entry.erl"];
        //return [];
    }
    handle_erlang_event(url, body) {
        //console.log(`handle_erlang_event url:${url}, body:${body}`);
        //throw new Error("Method not implemented.");
        switch (url) {
            case "/listen":
                this.erlangbridgePort = body.port;
                this.debug("erlang lsp listen on port :" + this.erlangbridgePort.toString());
                break;
            default:
                this.debug(`url command '${url}' is not handled`);
                break;
        }
    }
    setConfig(entries, callback) {
        var body = "";
        entries.forEach(function (value, key) {
            body += key + "=" + value + "\r\n";
        });
        this.post("set_config", body, true).then(res => {
            if (res.error) {
                this.debug(`setConfig error:${res.error}`);
            }
            else {
                callback();
            }
            return true;
        }, err => { return false; });
    }
    parseSourceFile(uri, tmpContentsFile, callback) {
        var body = this.toErlangUri(uri);
        if (tmpContentsFile)
            body += "\r\n" + tmpContentsFile;
        this.post("parse_source_file", body).then(res => {
            if (res.error) {
                this.debug(`parseSourceFile error:${res.error}`);
            }
            else {
                callback();
            }
            return true;
        }, err => { return false; });
    }
    validateParsedSourceFile(uri, callback) {
        this.post("validate_parsed_source_file", this.toErlangUri(uri)).then(res => {
            if (res.error) {
                this.debug(`validateParsedSourceFile error:${res.error}`);
            }
            else {
                callback(res);
            }
            return true;
        }, err => { return false; });
    }
    validateConfigFile(uri, tmpContentsFile, callback) {
        var body = this.toErlangUri(uri);
        if (tmpContentsFile)
            body += "\r\n" + tmpContentsFile;
        this.post("validate_config_file", body).then(res => {
            if (res.error) {
                this.debug(`validateConfigFile error:${res.error}`);
            }
            else {
                callback(res);
            }
            return true;
        }, err => { return false; });
    }
    completeModuleFunction(moduleName, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("complete_module_function", moduleName + "\r\n" + prefix).then(res => {
                if (res.error) {
                    this.debug(`completeModuleFunction error:${res.error}`);
                    return [];
                }
                else {
                    return res.items;
                }
            }, err => { return []; });
        });
    }
    completeRecord(uri, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("complete_record", this.toErlangUri(uri) + "\r\n" + prefix).then(res => {
                if (res.error) {
                    this.debug(`completeRecord error:${res.error}`);
                    return [];
                }
                else {
                    return res.items;
                }
            }, err => { return []; });
        });
    }
    completeField(uri, record, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("complete_field", this.toErlangUri(uri) + "\r\n" + record + "\r\n" + prefix).then(res => {
                if (res.error) {
                    this.debug(`completeField error:${res.error}`);
                    return [];
                }
                else {
                    return res.items;
                }
            }, err => { return []; });
        });
    }
    completeVariable(uri, line, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("complete_variable", this.toErlangUri(uri) + "\r\n" + line.toString() + "\r\n" + prefix).then(res => {
                if (res.error) {
                    this.debug(`completeVariable error:${res.error}`);
                    return [];
                }
                else {
                    return res.items;
                }
            }, err => { return []; });
        });
    }
    FormatDocument(uri) {
        this.post("format_document", this.toErlangUri(uri)).then(res => {
            if (res.error) {
                this.debug(`validateTextDocument error:${res.error}`);
            }
            else {
                this.debug(`FormatDocument result : ${JSON.stringify(res)}`);
            }
            return true;
        }, err => { return false; });
    }
    GetModuleExports(uri) {
    }
    onDocumentClosed(uri) {
        this.post("document_closed", this.toErlangUri(uri)).then(res => { return true; }, err => { return false; });
    }
    getDefinitionLocation(uri, line, character) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("goto_definition", this.toErlangUri(uri) + "\r\n" + (line + 1).toString() + "\r\n" + (character + 1).toString()).then(res => {
                //this.debug(`goto_definition result : ${JSON.stringify(res)}`);
                if (res.result == "ok") {
                    return {
                        uri: this.fromErlangUri(res.uri),
                        line: res.line - 1,
                        character: res.character - 1
                    };
                }
                return null;
            }, err => { return null; });
        });
    }
    getHoverInfo(uri, line, character) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("hover_info", this.toErlangUri(uri) + "\r\n" + (line + 1).toString() + "\r\n" + (character + 1).toString()).then(res => {
                if (res.result == "ok") {
                    return {
                        text: res.text,
                        moduleName: res.moduleName,
                        functionName: res.functionName
                    };
                }
                return null;
            }, err => { return null; });
        });
    }
    getReferencesInfo(uri, line, character) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("references_info", this.toErlangUri(uri) + "\r\n" + (line + 1).toString() + "\r\n" + (character + 1).toString()).then(res => {
                //this.debug(`references_info result : ${JSON.stringify(res)}`);
                if (res.result == "ok") {
                    let refs = res.references;
                    let self = this;
                    refs.map(x => {
                        x.uri = self.fromErlangUri(x.uri);
                        x.line = x.line - 1;
                        x.character = x.character - 1;
                        return x;
                    });
                    return refs;
                }
                return null;
            }, err => { return null; });
        });
    }
    getCodeLensInfo(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post("codelens_info", this.toErlangUri(uri)).then(res => {
                //this.debug(`getCodeLensInfo result : ${JSON.stringify(res)}`);
                if (res.result == "ok") {
                    let result = {};
                    result.uri = this.fromErlangUri(res.uri);
                    let codelens = res.codelens;
                    let self = this;
                    codelens.map(x => {
                        x.line = x.line - 1;
                        x.character = x.character - 1;
                        return x;
                    });
                    return {
                        uri: res.uri,
                        codelens: codelens
                    };
                }
                return null;
            }, err => { return null; });
        });
    }
    Quit() {
        this.post("stop_server");
        this.events_receiver.close();
    }
    toErlangUri(uri) {
        if (process.platform == 'win32')
            return uri.replace(/file:\/\/\/([A-Za-z])%3A\//, 'file://$1:/');
        else
            return uri;
    }
    fromErlangUri(uri) {
        if (process.platform == 'win32')
            return uri.replace(/file:\/\/([A-Za-z]):/, 'file:///$1%3A');
        else
            return uri;
    }
}
exports.ErlangLspConnection = ErlangLspConnection;
//# sourceMappingURL=erlangLspConnection.js.map