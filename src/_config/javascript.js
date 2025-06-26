const esbuild = require("esbuild");
const fs = require("node:fs/promises");
const path = require("node:path");
const server = require("../_config/server");
const isProduction = server.isProduction;

module.exports = {
    outputFileExtension: "js",
    init: async function () {
        await fs.mkdir("docs/assets/js", { recursive: true });
    },
    compile: async (content, inputPath) => {
        if (!inputPath.includes("src/assets/js/")) return;

        const result = await esbuild.build({
            entryPoints: [inputPath],
            outdir: "docs/assets/js",
            write: false,
            bundle: true,
            minify: isProduction,
            sourcemap: !isProduction,
            target: isProduction ? "es6" : "esnext",
        });

        return async () => {
            for (const file of result.outputFiles) {
                await fs.mkdir(path.dirname(file.path), { recursive: true });
                await fs.writeFile(file.path, file.text);
            }
            return;
        };
    },
};
