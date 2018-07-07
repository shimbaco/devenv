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
const events_1 = require("events");
const http = require("http");
const path = require("path");
const ErlangShellDebugger_1 = require("./ErlangShellDebugger");
const fs = require("fs");
exports.erlangBridgePath = path.join(__dirname, "..", "..", "apps", "erlangbridge", "src");
let extensionPath = "";
function setExtensionPath(currentExtensionPath) {
    extensionPath = currentExtensionPath;
    exports.erlangBridgePath = path.join(extensionPath, "apps", "erlangbridge", "src");
}
exports.setExtensionPath = setExtensionPath;
/** this class is responsible to send/receive debug command to erlang bridge */
class ErlangConnection extends events_1.EventEmitter {
    get isConnected() {
        return this.erlangbridgePort > 0;
    }
    constructor(output) {
        super();
        this._output = output;
        this.erlangbridgePort = -1;
        this.verbose = true;
    }
    log(msg) {
        if (this._output) {
            this._output.appendLine(msg);
        }
    }
    logAppend(msg) {
        if (this._output) {
            //this._output.append(msg);
        }
    }
    debug(msg) {
        if (this._output) {
            this._output.appendLine("debug:" + msg);
        }
    }
    error(msg) {
        if (this._output) {
            //this._output.error(msg);
        }
    }
    Start(verbose) {
        return __awaiter(this, void 0, void 0, function* () {
            this.verbose = verbose;
            return new Promise((a, r) => {
                //this.debug("erlangConnection.Start");
                this.compile_erlang_connection().then(() => {
                    return this.start_events_receiver().then(res => {
                        a(res);
                    }, exitCode => {
                        //this.log("reject");
                        r(exitCode);
                    });
                }, exiCode => {
                    r(`Erlang compile failed : ${exiCode}`);
                });
            });
        });
    }
    compile_erlang_connection() {
        return new Promise((a, r) => {
            //TODO: #if DEBUG
            var compiler = new ErlangShellDebugger_1.ErlangShellForDebugging(this.verbose ? this._output : null);
            var erlFiles = this.get_ErlangFiles();
            //create dir if not exists
            let ebinDir = path.normalize(path.join(exports.erlangBridgePath, "..", "ebin"));
            if (!fs.existsSync(ebinDir)) {
                fs.mkdirSync(ebinDir);
            }
            let args = ["-o", "../ebin"].concat(erlFiles);
            return compiler.Compile(exports.erlangBridgePath, args).then(res => {
                //this.debug("Compilation of erlang bridge...ok");
                a(res);
            }, exitCode => {
                this.error("Compilation of erlang bridge...ko");
                r(exitCode);
            });
        });
    }
    start_events_receiver() {
        if (this.verbose)
            this.debug("Starting http listener...");
        return new Promise((accept, reject) => {
            this.events_receiver = http.createServer((req, res) => {
                var url = req.url;
                var body = [];
                var jsonBody = null;
                req.on('error', err => {
                    this.error("request error");
                }).on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    //here : receive all events from erlangBridge
                    var sbody = Buffer.concat(body).toString();
                    try {
                        //this.log("body:" + sbody);
                        jsonBody = JSON.parse(sbody);
                        this.handle_erlang_event(url, jsonBody);
                    }
                    catch (err) {
                        this.error("error while receving command :" + err + "\r\n" + sbody);
                    }
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('ok');
                });
            });
            this.events_receiver.listen(0, '127.0.0.1', () => {
                var p = this.events_receiver.address().port;
                if (this.verbose)
                    this.debug(` on http://127.0.0.1:${p}\n`);
                accept(p);
            });
        });
    }
    post(verb, body, multilineBody) {
        return new Promise((a, r) => {
            if (!body) {
                body = "";
            }
            var options = {
                host: "127.0.0.1",
                path: verb,
                port: this.erlangbridgePort,
                method: "POST",
                headers: {
                    'Content-Type': 'plain/text',
                    'Content-Length': Buffer.byteLength(body)
                }
            };
            if (multilineBody) {
                options.headers['X-Multiline-Body'] = 'true';
            }
            var postReq = http.request(options, response => {
                var body = '';
                response.on('data', buf => {
                    body += buf;
                });
                response.on('end', () => {
                    try {
                        //this.log("command response : " + body);
                        var parsed = JSON.parse(body);
                        a(parsed);
                    }
                    catch (err) {
                        this.log("unable to parse response as JSON:" + err);
                        //console.error('Unable to parse response as JSON', err);
                        r(err);
                    }
                });
                response.on("error", err => {
                    this.log("error while sending command to erlang :" + err);
                });
            });
            postReq.write(body);
            postReq.end();
        });
    }
}
exports.ErlangConnection = ErlangConnection;
//# sourceMappingURL=erlangConnection.js.map