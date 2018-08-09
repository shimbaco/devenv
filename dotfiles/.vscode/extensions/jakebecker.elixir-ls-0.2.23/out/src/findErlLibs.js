"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const upath = require("upath");
const path = require("path");
function findErlLibs(baseDir = null) {
    baseDir = baseDir || path.join(__dirname, "..");
    const releasePath = upath.normalize(path.join(baseDir, "elixir-ls-release"));
    const pathSeparator = os_1.platform() == "win32" ? ";" : ":";
    const prevErlLibs = process.env["ERL_LIBS"];
    return prevErlLibs
        ? prevErlLibs + pathSeparator + releasePath
        : releasePath;
}
exports.default = findErlLibs;
//# sourceMappingURL=findErlLibs.js.map