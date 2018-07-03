const cp = require("child_process");
const which = require("which");
const path = require("path");
const env = Object.assign({}, process.env, { ERL_LIBS: path.join([__dirname, "/elixir-ls-release"]) });
cp.spawn(which.sync("mix"), "elixir_ls.debugger", { env: env });
//# sourceMappingURL=debug.js.map