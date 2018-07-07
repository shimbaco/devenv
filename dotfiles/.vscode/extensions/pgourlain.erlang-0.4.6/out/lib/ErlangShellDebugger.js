"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GenericShell_1 = require("./GenericShell");
const path = require("path");
const os = require("os");
const fs = require("fs");
//inspired from https://github.com/WebFreak001/code-debug/blob/master/src/backend/mi2/mi2.ts for inspiration of an EventEmitter 
const nonOutput = /^(?:\d*|undefined)[\*\+\=]|[\~\@\&\^]/;
class FunctionBreakpoint {
    constructor(i, n, mn, fn, a) {
        this.id = i;
        this.verified = false;
        this.name = n;
        this.moduleName = mn;
        this.functionName = fn;
        this.arity = a;
    }
}
exports.FunctionBreakpoint = FunctionBreakpoint;
// export interface IErlangShellOutputForDebugging {
//     show(): void;
//     appendLine(value: string): void;
//     append(value: string): void;
//     debug(value: string): void;
//     error(value: string): void;
// }
class ErlangShellForDebugging extends GenericShell_1.ErlGenericShell {
    constructor(whichOutput) {
        super(whichOutput);
        this.breakPoints = [];
        this.functionBreakPoints = [];
    }
    Start(erlPath, startDir, listen_port, bridgePath, launchArguments) {
        var randomSuffix = Math.floor(Math.random() * 10000000).toString();
        this.argsFileName = path.join(os.tmpdir(), path.basename(startDir) + '_' + randomSuffix);
        var debugStartArgs = ["-noshell", "-pa", `"${bridgePath}"`, "-s", "int",
            "-vscode_port", listen_port.toString(),
            "-s", "vscode_connection", "start"];
        var argsFile = this.createArgsFile(startDir, launchArguments.noDebug, launchArguments.addEbinsToCodepath);
        var processArgs = debugStartArgs.concat(argsFile).concat([launchArguments.arguments]);
        this.started = true;
        var result = this.LaunchProcess(erlPath, startDir, processArgs, !launchArguments.verbose);
        return result;
    }
    CleanupAfterStart() {
        if (this.argsFileName && fs.existsSync(this.argsFileName)) {
            fs.unlinkSync(this.argsFileName);
        }
    }
    uniqueBy(arr, keySelector) {
        var unique = {};
        var distinct = [];
        arr.forEach(function (x) {
            var key = keySelector(x);
            if (!unique[key]) {
                distinct.push(x);
                unique[key] = true;
            }
        });
        return distinct;
    }
    formatPath(filePath) {
        if (os.platform() == 'win32') {
            if (filePath == undefined) {
                return filePath;
            }
            filePath = filePath.split("\\").join("/");
            return filePath;
        }
        return filePath;
    }
    findEbinDirs(dir, dirList = []) {
        fs.readdirSync(dir).forEach(name => {
            const fullpath = path.join(dir, name);
            if (fs.existsSync(fullpath) && fs.statSync(fullpath).isDirectory()) {
                if (name === 'ebin')
                    dirList.push(fullpath);
                else
                    this.findEbinDirs(fullpath, dirList);
            }
        });
        return dirList;
    }
    findErlFiles(dir, fileList = []) {
        fs.readdirSync(dir).forEach(file => {
            if (file == '_build')
                return;
            const filePath = path.join(dir, file);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())
                this.findErlFiles(filePath, fileList);
            else if (path.extname(file) === '.erl')
                fileList.push(filePath);
        });
        return fileList;
    }
    createArgsFile(startDir, noDebug, addEbinsToCodepath) {
        var result = [];
        if (this.breakPoints) {
            var argsFileContents = "";
            if (!noDebug) {
                argsFileContents += "-eval 'int:start()";
                var modulesWithoutBp = {};
                this.findErlFiles(startDir).forEach(fileName => {
                    modulesWithoutBp[fileName] = true;
                });
                //first interpret source
                var bps = this.uniqueBy(this.breakPoints, bp => bp.source.path);
                bps.forEach(bp => {
                    argsFileContents += ",int:ni(\\\"" + this.formatPath(bp.source.path) + "\\\")";
                    delete modulesWithoutBp[bp.source.path];
                });
                for (var fileName in modulesWithoutBp) {
                    argsFileContents += ",int:ni(\\\"" + this.formatPath(fileName) + "\\\")";
                }
                //then set break
                this.breakPoints.forEach(bp => {
                    var moduleName = path.basename(bp.source.name, ".erl");
                    argsFileContents += `,int:break(${moduleName}, ${bp.line})`;
                });
                this.functionBreakPoints.forEach(bp => {
                    argsFileContents += `,vscode_connection:set_breakpoint(${bp.moduleName}, {function, ${bp.functionName}, ${bp.arity}})`;
                });
                argsFileContents += "'";
            }
            if (addEbinsToCodepath) {
                this.findEbinDirs(path.join(startDir, "_build")).forEach(ebin => {
                    argsFileContents += " -pz \"" + this.formatPath(ebin) + "\"";
                });
            }
            fs.writeFileSync(this.argsFileName, argsFileContents);
            result.push("-args_file");
            result.push("\"" + this.argsFileName + "\"");
        }
        return result;
    }
    /** compile specific files */
    Compile(startDir, args) {
        //if erl is used, -compile must be used
        //var processArgs = ["-compile"].concat(args);
        var processArgs = [].concat(args);
        var result = this.RunProcess("erlc", startDir, processArgs);
        return result;
    }
    setBreakPointsRequest(bps, fbps) {
        if (!this.started) {
            this.breakPoints = this.breakPoints.concat(bps);
            this.functionBreakPoints = this.functionBreakPoints.concat(fbps);
        }
    }
}
exports.ErlangShellForDebugging = ErlangShellForDebugging;
//# sourceMappingURL=ErlangShellDebugger.js.map