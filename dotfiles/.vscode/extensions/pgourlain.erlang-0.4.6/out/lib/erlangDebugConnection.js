"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const erlangConnection_1 = require("./erlangConnection");
class ErlangDebugConnection extends erlangConnection_1.ErlangConnection {
    get_ErlangFiles() {
        return ["gen_connection.erl", "vscode_connection.erl", "vscode_jsone.erl"];
    }
    handle_erlang_event(url, body) {
        //this method handle every event receiver from erlang
        switch (url) {
            case "/listen":
                this.erlangbridgePort = body.port;
                this.emit("listen", "erlang bridge listen on port :" + this.erlangbridgePort.toString());
                break;
            case "/interpret":
                this.emit("new_module", body.module);
                break;
            case "/new_process":
                this.emit("new_process", body.process);
                break;
            case "/new_status":
                this.emit("new_status", body.process, body.status, body.reason, body.module, body.line);
                break;
            case "/new_break":
                this.emit("new_break", body.module, body.line);
                break;
            case "/on_break":
                this.emit("on_break", body.process, body.module, body.line, body.stacktrace);
                break;
            case "/delete_break":
                break;
            case "/fbp_verified":
                this.emit("fbp_verified", body.module, body.name, body.arity);
                break;
            default:
                this.debug("receive from erlangbridge :" + url + ", body :" + JSON.stringify(body));
                break;
        }
    }
    setBreakPointsRequest(moduleName, breakPoints, functionBreakpoints) {
        if (this.erlangbridgePort > 0) {
            let bps = moduleName + "\r\n";
            breakPoints.forEach(bp => {
                bps += `line ${bp.line}\r\n`;
            });
            functionBreakpoints.forEach(bp => {
                bps += `function ${bp.functionName} ${bp.arity}\r\n`;
            });
            return this.post("set_bp", bps).then(res => {
                return true;
            }, err => {
                return false;
            });
        }
        else {
            return new Promise(() => false);
        }
    }
    debuggerContinue(pid) {
        if (this.erlangbridgePort > 0) {
            return this.post("debugger_continue", pid).then(res => {
                return true;
            }, err => {
                return false;
            });
        }
        else {
            return new Promise(() => false);
        }
    }
    debuggerNext(pid) {
        if (this.erlangbridgePort > 0) {
            return this.post("debugger_next", pid).then(res => {
                return true;
            }, err => {
                return false;
            });
        }
        else {
            return new Promise(() => false);
        }
    }
    debuggerStepIn(pid) {
        if (this.erlangbridgePort > 0) {
            return this.post("debugger_stepin", pid).then(res => {
                return true;
            }, err => {
                return false;
            });
        }
        else {
            return new Promise(() => false);
        }
    }
    debuggerStepOut(pid) {
        if (this.erlangbridgePort > 0) {
            return this.post("debugger_stepout", pid).then(res => {
                return true;
            }, err => {
                return false;
            });
        }
        else {
            return new Promise(() => false);
        }
    }
    debuggerPause(pid) {
        if (this.erlangbridgePort > 0) {
            return this.post("debugger_pause", pid).then(res => {
                return true;
            }, err => {
                return false;
            });
        }
        else {
            return new Promise(() => false);
        }
    }
    debuggerBindings(pid, frameId) {
        if (this.erlangbridgePort > 0) {
            return this.post("debugger_bindings", pid + "\r\n" + frameId).then(res => {
                //this.debug(`result of bindings : ${JSON.stringify(res)}`);
                return res;
            }, err => {
                this.debug(`debugger_bindings error : ${err}`);
                return [];
            });
        }
        else {
            return new Promise(() => []);
        }
    }
    debuggerEval(pid, frameId, expression) {
        if (this.erlangbridgePort > 0) {
            return this.post("debugger_eval", pid + "\r\n" + frameId + "\r\n" + expression).then(res => {
                return res;
            }, err => {
                this.debug(`debugger_eval error : ${err}`);
                return [];
            });
        }
        else {
            return new Promise(() => []);
        }
    }
    debuggerExit() {
        if (this.erlangbridgePort > 0) {
            //this.debug('exit')
            return this.post("debugger_exit", "").then(res => {
                this.debug('exit yes');
                return res;
            }, err => {
                this.debug('exit no');
                this.debug(`debugger_exit error : ${err}`);
                return [];
            });
        }
        else {
            return new Promise(() => []);
        }
    }
    Quit() {
        this.debuggerExit().then(() => {
            this.events_receiver.close();
        });
    }
}
exports.ErlangDebugConnection = ErlangDebugConnection;
//# sourceMappingURL=erlangDebugConnection.js.map