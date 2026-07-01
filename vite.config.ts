import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: resolve(__dirname, "tsconfig.app.json"),
            include: ["src/**/*.ts"],
            entryRoot: "src",
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "effeen",
            formats: ["es", "cjs"],
            fileName: "index",
        },
        rollupOptions: {
            external: ["effect"],
        },
    },
});
