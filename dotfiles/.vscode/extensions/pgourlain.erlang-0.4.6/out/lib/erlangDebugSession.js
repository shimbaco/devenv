"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_debugadapter_1 = require("vscode-debugadapter");
const ErlangShellDebugger_1 = require("./ErlangShellDebugger");
const path = require("path");
const fs = require("fs");
const erlangConnection_1 = require("./erlangConnection");
const erlangDebugConnection_1 = require("./erlangDebugConnection");
class ConditionalBreakpoint {
    constructor(condition, hitCondition) {
        this.condition = condition;
        this.hitCount = parseInt(hitCondition);
        this.actualHitCount = 0;
    }
}
/** this class is entry point of debugger  */
class ErlangDebugSession extends vscode_debugadapter_1.DebugSession {
    constructor(verbose) {
        super();
        //private _breakPoints = new Map<string, DebugProtocol.Breakpoint[]>();
        this._rebarBuildPath = path.join("_build", "default", "lib");
        this._functionBreakPoints = new Map();
        this._conditionalBreakPoints = new Map();
        this._breakPoints = [];
        this._variableHandles = new vscode_debugadapter_1.Handles();
        this.threadIDs = {};
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(false);
        process.addListener('unhandledRejection', reason => {
            this.error(`******** Error in DebugAdapter - Unhandled promise rejection: ${reason}`);
        });
        process.addListener('uncaughtException', reason => {
            this.error(`******** Error in DebugAdapter - uncaughtException: ${reason}`);
        });
    }
    threadsRequest(response) {
        //this.debug("threadsRequest");
        var ths = [];
        for (var key in this.threadIDs) {
            var thread = this.threadIDs[key];
            if (thread.vscode) {
                ths.push(new vscode_debugadapter_1.Thread(thread.thid, "Process " + key));
            }
        }
        response.body = {
            threads: ths
        };
        this.sendResponse(response);
    }
    dispatchRequest(request) {
        //uncomment to show the calling workflow of debuging session  
        //this.debug(`dispatch request: ${request.command}(${JSON.stringify(request.arguments) })`);
        super.dispatchRequest(request);
    }
    initializeRequest(response, args) {
        //this.debug("Initializing erlang debugger");		
        this.erlDebugger = new ErlangShellDebugger_1.ErlangShellForDebugging(this);
        this.erlDebugger.on('close', (exitCode) => {
            this.quitEvent(exitCode);
        });
        this.erlangConnection = new erlangDebugConnection_1.ErlangDebugConnection(this);
        this.erlangConnection.on("listen", (msg) => this.onStartListening(msg));
        this.erlangConnection.on("new_module", (arg) => this.onNewModule(arg));
        this.erlangConnection.on("new_break", (arg) => this.onNewBreak(arg));
        this.erlangConnection.on("new_process", (arg) => this.onNewProcess(arg));
        this.erlangConnection.on("new_status", (pid, status, reason, moduleName, line) => this.onNewStatus(pid, status, reason, moduleName, line));
        this.erlangConnection.on("on_break", (pid, moduleName, line, stacktrace) => this.onBreak(pid, moduleName, line, stacktrace));
        this.erlangConnection.on("fbp_verified", (moduleName, functionName, arity) => this.onFbpVerified(moduleName, functionName, arity));
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsConditionalBreakpoints = true;
        response.body.supportsHitConditionalBreakpoints = true;
        response.body.supportsFunctionBreakpoints = true;
        response.body.supportsEvaluateForHovers = false;
        response.body.supportsSetVariable = false;
        response.body.supportsStepBack = false;
        response.body.exceptionBreakpointFilters = [];
        /*
        */
        this.sendResponse(response);
        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        //this.sendEvent(new InitializedEvent());
    }
    launchRequest(response, args) {
        //store launch arguments in order to start erlang when configuration is done
        if (!args.erlpath) {
            args.erlpath = "erl";
        }
        else if (!fs.exists(args.erlpath)) {
            this.log("The specified erlPath in your launch.json is invalid. Please fix !");
            this.sendErrorResponse(response, 3000, `The specified erlPath is invalid : check your launch configuration.`);
            return;
        }
        if (typeof args.addEbinsToCodepath === "undefined") {
            args.addEbinsToCodepath = true;
        }
        this._LaunchArguments = args;
        this.erlangConnection.Start(this._LaunchArguments.verbose).then(port => {
            //this.debug("Local webserver for erlang is started");
            this._port = port;
            //Initialize the workflow only when webserver is started
            this.sendEvent(new vscode_debugadapter_1.InitializedEvent());
            this.sendResponse(response);
        }).catch(reason => {
            this.sendErrorResponse(response, 3000, `Launching debugger throw an error : ${reason}`);
        });
    }
    configurationDoneRequest(response, argsConf) {
        var args = this._LaunchArguments;
        if (args.verbose) {
            this.debug("Starting erlang");
            this.debug(`	path      : ${args.cwd}`);
            this.debug(`	arguments : ${args.arguments}`);
        }
        this.erlDebugger.erlangPath = args.erlangPath;
        var bridgeBinPath = path.normalize(path.join(erlangConnection_1.erlangBridgePath, "..", "ebin"));
        this.erlDebugger.Start(args.erlpath, args.cwd, this._port, bridgeBinPath, args).then(r => {
            this.sendResponse(response);
        }).catch(reason => {
            this.sendErrorResponse(response, 3000, `Launching application throw an error : ${reason}`);
        });
    }
    disconnectRequest(response, args) {
        //this.debug("disconnectRequest");
        if (this.erlangConnection) {
            this.erlangConnection.Quit();
        }
        this.sendResponse(response);
        this.erlDebugger.CleanupAfterStart();
    }
    quitEvent(exitCode) {
        this.log(`erl exit with code ${exitCode}`);
        this.quit = true;
        this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
        this.erlDebugger.CleanupAfterStart();
    }
    evaluateRequest(response, args) {
        //this.log("evaluateRequest");
        //send entire expression entered in debugger console wend
        if (this.erlangConnection.isConnected) {
            var frameId = Math.floor(args.frameId / 100000);
            var threadId = (args.frameId - frameId * 100000);
            var processName = this.thread_id_to_pid(threadId);
            this.erlangConnection.debuggerEval(processName, frameId.toString(), args.expression).then((res) => {
                var result = this.mapRawVariables(res);
                response.body = {
                    result: result.value,
                    type: result.type,
                    variablesReference: result.variablesReference
                };
                this.sendResponse(response);
            });
        }
    }
    setBreakPointsRequest(response, args) {
        //it's called 1 per source file
        // this is returned to VS Code
        let vscodeBreakpoints;
        vscodeBreakpoints = [];
        //this.debug("setbreakpoints : " + JSON.stringify(<any>args));
        let targetModuleName = path.basename(args.source.path, ".erl");
        this._conditionalBreakPoints.delete(targetModuleName);
        args.breakpoints.forEach(bp => {
            vscodeBreakpoints.push(new vscode_debugadapter_1.Breakpoint(true, bp.line, 1, new vscode_debugadapter_1.Source(targetModuleName, args.source.path)));
            if (bp.condition || bp.hitCondition) {
                if (!this._conditionalBreakPoints.has(targetModuleName)) {
                    this._conditionalBreakPoints.set(targetModuleName, new Map());
                }
                var cbp = new ConditionalBreakpoint(bp.condition, bp.hitCondition);
                this._conditionalBreakPoints.get(targetModuleName).set(bp.line, cbp);
            }
        });
        this._updateBreakPoints(targetModuleName, vscodeBreakpoints);
        this._setAllBreakpoints(targetModuleName);
        response.body = { breakpoints: vscodeBreakpoints };
        this.sendResponse(response);
    }
    _setAllBreakpoints(moduleName) {
        let modulebreakpoints = this._breakPoints.filter((bp) => bp.source.name == moduleName);
        let moduleFunctionBreakpoints = this._functionBreakPoints.has(moduleName) ? this._functionBreakPoints.get(moduleName) : [];
        if (this.erlangConnection.isConnected) {
            if (!this._LaunchArguments.noDebug) {
                this.erlangConnection.setBreakPointsRequest(moduleName, modulebreakpoints, moduleFunctionBreakpoints);
            }
        }
        else if (this.erlDebugger) {
            this.erlDebugger.setBreakPointsRequest(modulebreakpoints, moduleFunctionBreakpoints);
        }
    }
    _updateBreakPoints(moduleName, bps) {
        let newBps = this._breakPoints.filter((bp) => bp.source.name != moduleName);
        this._breakPoints = newBps.concat(bps);
    }
    setExceptionBreakPointsRequest(response, args) {
        //this.debug("setExceptionBreakPointsRequest : " + JSON.stringify(<any>args));	
        this.sendResponse(response);
    }
    setFunctionBreakPointsRequest(response, args) {
        let vscodeBreakpoints = [];
        let modulesToSetBreakpoints = new Set();
        let re = new RegExp("^(.+):(.+)/([0-9]+)$");
        this._functionBreakPoints.forEach((breakpoints, moduleName) => modulesToSetBreakpoints.add(moduleName));
        this._functionBreakPoints = new Map();
        args.breakpoints.forEach(bp => {
            let parsed = re.exec(bp.name);
            if (parsed) {
                let moduleName = parsed[1];
                let breakpoint = new ErlangShellDebugger_1.FunctionBreakpoint(bp.id, bp.name, moduleName, parsed[2], +parsed[3]);
                vscodeBreakpoints.push(breakpoint);
                if (this._functionBreakPoints.has(moduleName))
                    this._functionBreakPoints.get(moduleName).push(breakpoint);
                else
                    this._functionBreakPoints.set(moduleName, [breakpoint]);
            }
            else {
                let name = bp.name;
                if (!name.endsWith(" (Invalid format)")) {
                    name += " (Invalid format)";
                }
                let breakpoint = new ErlangShellDebugger_1.FunctionBreakpoint("", name, "", "", 0);
                vscodeBreakpoints.push(breakpoint);
            }
        });
        this._functionBreakPoints.forEach((breakpoints, moduleName) => modulesToSetBreakpoints.add(moduleName));
        modulesToSetBreakpoints.forEach((moduleName) => this._setAllBreakpoints(moduleName));
        response.body = { breakpoints: vscodeBreakpoints };
        this.sendResponse(response);
    }
    doProcessUserRequest(threadId, response, fn) {
        this.sendResponse(response);
        fn(this.thread_id_to_pid(threadId)).then(() => {
            this.sendEvent(new vscode_debugadapter_1.ContinuedEvent(threadId, false));
        }, (reason) => {
            this.error("unable to continue debugging.");
            this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            this.sendErrorResponse(response, 3000, `Unable to continue debugging : ${reason}`);
        });
    }
    continueRequest(response, args) {
        response.body = { allThreadsContinued: false };
        this.doProcessUserRequest(args.threadId, response, (pid) => this.erlangConnection.debuggerContinue(pid));
    }
    nextRequest(response, args) {
        this.doProcessUserRequest(args.threadId, response, (pid) => this.erlangConnection.debuggerNext(pid));
    }
    stepInRequest(response, args) {
        this.doProcessUserRequest(args.threadId, response, (pid) => this.erlangConnection.debuggerStepIn(pid));
    }
    stepOutRequest(response, args) {
        var processName = this.thread_id_to_pid(args.threadId);
        var thread = this.threadIDs[processName];
        if (thread && thread.stack && thread.stack.length == 1) {
            this.doProcessUserRequest(args.threadId, response, (pid) => this.erlangConnection.debuggerContinue(pid));
        }
        else {
            this.doProcessUserRequest(args.threadId, response, (pid) => this.erlangConnection.debuggerStepOut(pid));
        }
    }
    pauseRequest(response, args) {
        //this.debug("pauseRequest :" + JSON.stringify(args));
        this.sendResponse(response);
        this.erlangConnection.debuggerPause(this.thread_id_to_pid(args.threadId)).then(() => {
        }, (reason) => {
            this.error("unable to pause.");
            this.sendErrorResponse(response, 3000, `Unable to pause : ${reason}`);
        });
    }
    scopesRequest(response, args) {
        //this.debug("scopesRequest :" + JSON.stringify(args));
        var vars = [];
        var frameId = Math.floor(args.frameId / 100000);
        var threadId = (args.frameId - frameId * 100000);
        //this.debug(`${threadId} : ${frameId}`);
        var processName = this.thread_id_to_pid(threadId);
        var that = this;
        this.erlangConnection.debuggerBindings(processName, frameId.toString()).then(v => {
            vars = v.map((el) => this.mapRawVariables(el));
            var scopes = new Array();
            var localVariables = {
                name: 'Local',
                value: '',
                variablesReference: 0,
                children: vars
            };
            scopes.push(new vscode_debugadapter_1.Scope('Local', this._variableHandles.create(localVariables), false));
            response.body = { scopes };
            this.sendResponse(response);
        });
    }
    variablesRequest(response, args) {
        const variables = [];
        const id = this._variableHandles.get(args.variablesReference);
        if (id != null) {
            id.children.forEach((el) => variables.push(el));
        }
        response.body = {
            variables: variables
        };
        this.sendResponse(response);
    }
    stackTraceRequest(response, args) {
        //this.debug("stackTraceRequest :" + JSON.stringify(args));
        var processName = this.thread_id_to_pid(args.threadId);
        var thread = this.threadIDs[processName];
        var stackAsObject = thread.stack;
        if (thread && stackAsObject) {
            //"{\"process\":\"<0.97.0>\", \"initial_call\":\"zcmailchecker_app/start/2\", \"break_module\":\"zcmailchecker_app\", \"line\":10}"
            //first step -> just show one frame
            const frames = new Array();
            const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
            const maxLevels = args.levels;
            const endFrame = Math.min(startFrame + maxLevels, stackAsObject.length);
            for (let i = startFrame; i < endFrame; i++) {
                var frame = stackAsObject[i];
                const name = frame.func;
                const sourceFile = frame.source;
                const line = frame.line;
                if (fs.existsSync(sourceFile)) {
                    frames.push(new vscode_debugadapter_1.StackFrame(frame.sp * 100000 + thread.thid, name, new vscode_debugadapter_1.Source(frame.module, this.convertDebuggerPathToClient(sourceFile)), this.convertDebuggerLineToClient(line), 0));
                }
                else {
                    frames.push(new vscode_debugadapter_1.StackFrame(frame.sp * 100000 + thread.thid, path.basename(sourceFile), null, ""));
                }
            }
            response.body = {
                stackFrames: frames,
                totalFrames: endFrame - startFrame
            };
            this.sendResponse(response);
        }
        else {
            response.body = {
                stackFrames: [],
                totalFrames: 0
            };
            this.sendResponse(response);
        }
    }
    sourceRequest(response, args) {
        this.debug("sourceRequest");
        super.sourceRequest(response, args);
    }
    convertClientLineToDebugger(line) {
        this.debug("convertClientLineToDebugger");
        return super.convertClientLineToDebugger(line);
    }
    convertDebuggerLineToClient(line) {
        var result = super.convertDebuggerLineToClient(line);
        //this.debug(`convertDebuggerLineToClient ${line}:${result}`);
        return result;
    }
    convertClientColumnToDebugger(column) {
        return super.convertClientColumnToDebugger(column);
    }
    convertDebuggerColumnToClient(column) {
        return super.convertDebuggerColumnToClient(column);
    }
    convertClientPathToDebugger(clientPath) {
        return super.convertClientPathToDebugger(clientPath);
    }
    convertDebuggerPathToClient(debuggerPath) {
        var relative = path.relative(this._LaunchArguments.cwd, debuggerPath);
        var ret = super.convertDebuggerPathToClient(debuggerPath);
        if (relative.startsWith(this._rebarBuildPath)) {
            relative = path.relative(path.join(this._LaunchArguments.cwd, this._rebarBuildPath), debuggerPath);
            if (fs.existsSync(path.join(this._LaunchArguments.cwd, "apps", relative))) {
                ret = path.join(this._LaunchArguments.cwd, "apps", relative);
            }
            else {
                var basedirname = path.parse(this._LaunchArguments.cwd).base;
                if (relative.startsWith(basedirname + path.sep)) {
                    var converted = path.join(this._LaunchArguments.cwd, "..", relative);
                    if (fs.existsSync(converted)) {
                        ret = converted;
                    }
                }
            }
        }
        return ret;
    }
    thread_id_to_pid(current_thid) {
        for (var key in this.threadIDs) {
            var thread = this.threadIDs[key];
            if (thread.thid == current_thid) {
                return key;
            }
        }
        return "<0.0.0>";
    }
    mapRawVariables(v) {
        var handler = 0;
        if (v.children) {
            handler = this._variableHandles.create({
                name: v.name,
                value: v.value,
                type: v["type"],
                variablesReference: 0,
                children: v.children.map((el) => this.mapRawVariables(el))
            });
        }
        return {
            name: v.name,
            type: v["type"],
            value: v.value,
            variablesReference: handler
        };
    }
    threadCount() {
        var result = 0;
        for (var key in this.threadIDs) {
            result++;
        }
        return result;
    }
    log(msg) {
        this.outLine(`${msg}\n`);
    }
    outLine(msg, category) {
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(msg, category ? category : 'console'));
    }
    /** send message to console with color of debug category */
    debug(msg) {
        //other category can be 'console', 'stdout', 'stderr', 'telemetry'		
        this.outLine(`${msg}\n`, "debug");
    }
    error(msg) {
        this.outLine(`${msg}\n`, "stderr");
    }
    show() {
    }
    appendLine(value) {
        this.log(value);
    }
    append(value) {
        this.outLine(`${value}`);
    }
    //----------- events from erlangConnection
    onStartListening(message) {
        if (this._LaunchArguments.verbose)
            this.debug(message);
    }
    onNewModule(moduleName) {
        //this.debug("OnNewModule : " + moduleName);
        this.sendEvent(new vscode_debugadapter_1.ModuleEvent("new", new vscode_debugadapter_1.Module(moduleName, moduleName)));
    }
    onNewBreak(breakName) {
        //this.debug("OnNewBreak : " + breakName);
    }
    pid_to_number(processName) {
        var pidAsString = processName.substr(1, processName.length - 2);
        pidAsString = pidAsString.replace(".", "");
        return Number.parseInt(pidAsString);
    }
    onNewProcess(processName) {
        //each process in erlang is mapped to one 'thread'
        //this.debug("OnNewProcess : " + processName);
        var thid = this.pid_to_number(processName);
        this.threadIDs[processName] = { thid: thid, stack: null, vscode: false };
        var that = this;
        setTimeout(function () {
            that.sendThreadStartedEventIfNeeded(processName);
        }, 250);
    }
    sendThreadStartedEventIfNeeded(processName) {
        var thread = this.threadIDs[processName];
        if (thread && !thread.vscode) {
            thread.vscode = true;
            this.sendEvent(new vscode_debugadapter_1.ThreadEvent("started", thread.thid));
        }
    }
    breakReason(module, line) {
        if (this.isOnBreakPoint(module, line)) {
            return "breakpoint";
        }
        return "";
    }
    findConditionalBreakpoint(module, line) {
        if (this._conditionalBreakPoints.has(module)) {
            var moduleConditionalBreakpoints = this._conditionalBreakPoints.get(module);
            var lineNo = parseInt(line);
            if (moduleConditionalBreakpoints.has(lineNo)) {
                return moduleConditionalBreakpoints.get(lineNo);
            }
        }
        return null;
    }
    conditionalBreakpointHit(cbp, processName, module, line, thid) {
        if (isNaN(cbp.hitCount)) {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent(this.breakReason(module, line), thid));
        }
        else {
            if (++cbp.actualHitCount == cbp.hitCount) {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent(this.breakReason(module, line), thid));
            }
            else {
                this.erlangConnection.debuggerContinue(processName);
            }
        }
    }
    onBreak(processName, module, line, stacktrace) {
        //this.debug(`onBreak : ${processName} stacktrace:${JSON.stringify(stacktrace)}`);
        this.sendThreadStartedEventIfNeeded(processName);
        var currentThread = this.threadIDs[processName];
        if (currentThread) {
            currentThread.stack = stacktrace;
            var cbp = this.findConditionalBreakpoint(module, line);
            if (cbp) {
                if (cbp.condition) {
                    var sp = stacktrace && stacktrace.length > 0 ? stacktrace[0].sp : -1;
                    this.erlangConnection.debuggerEval(processName, sp, cbp.condition).then((res) => {
                        if (res.value == "true") {
                            this.conditionalBreakpointHit(cbp, processName, module, line, currentThread.thid);
                        }
                        else {
                            this.erlangConnection.debuggerContinue(processName);
                        }
                    });
                }
                else {
                    this.conditionalBreakpointHit(cbp, processName, module, line, currentThread.thid);
                }
            }
            else {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent(this.breakReason(module, line), currentThread.thid));
            }
        }
    }
    isOnBreakPoint(module, line) {
        var nLine = Number(line);
        var candidates = this._breakPoints.filter(bp => {
            return bp.line == nLine && bp.source.name == module;
        });
        return candidates.length > 0;
    }
    onNewStatus(processName, status, reason, moudleName, line) {
        //this.debug("OnStatus : " + processName + "," + status);
        if (status === 'exit') {
            var that = this;
            //Use 125ms delay to mitigate case when a process spawns another one and exits
            //It is then possible to receive onNewStatus('exit') before onNewProcess for the spawned process
            setTimeout(function () {
                var currentThread = that.threadIDs[processName];
                delete that.threadIDs[processName];
                if (currentThread.vscode) {
                    that.sendEvent(new vscode_debugadapter_1.ThreadEvent("exited", currentThread.thid));
                }
                var thCount = that.threadCount();
                if (thCount == 0) {
                    that.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
                }
                else {
                    //that.debug(`thcount:${thCount}, ${JSON.stringify(that.threadIDs)}`);
                }
            }, 125);
        }
    }
    onFbpVerified(moduleName, functionName, arity) {
        if (this._functionBreakPoints.has(moduleName)) {
            this._functionBreakPoints.get(moduleName).forEach((fbp) => {
                if (fbp.functionName === functionName && fbp.arity === arity) {
                    fbp.verified = true;
                    this.sendEvent(new vscode_debugadapter_1.BreakpointEvent("changed", fbp));
                }
            });
        }
    }
}
exports.ErlangDebugSession = ErlangDebugSession;
//# sourceMappingURL=erlangDebugSession.js.map