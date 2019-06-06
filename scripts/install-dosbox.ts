import * as fs from "fs";
import * as path from "path";

const files = ["wdosbox.js", "wdosbox.wasm.js", "wdosbox.js.symbols"];
const root = path.resolve(path.dirname(__filename), "..");
const src = path.resolve(root, "node_modules", "js-dos", "dist");
const dst = path.resolve(root, "public", "wdosbox");

files.forEach((file) => {
    fs.copyFileSync(path.resolve(src, file), path.resolve(dst, file));
});