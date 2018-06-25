"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crystalUtils_1 = require("./crystalUtils");
/**
 * Call tool for get Crystal context
 */
class CrystalContext {
    /**
     * Execute crystal tool context for current file:position
     */
    crystalContext(document, position, key) {
        return crystalUtils_1.spawnTools(document, position, "context", key);
    }
}
exports.CrystalContext = CrystalContext;
//# sourceMappingURL=crystalContext.js.map