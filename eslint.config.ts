import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
    // 全局忽略
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**"],
    },

    // JS 推荐规则
    js.configs.recommended,

    // TypeScript 推荐规则
    ...tseslint.configs.recommended,

    // Prettier 集成（禁用冲突规则 + 将 prettier 作为 ESLint 规则运行）
    eslintPluginPrettierRecommended,

    // 项目级规则
    {
        rules: {
            // TypeScript
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-import-type-side-effects": "error",

            // 通用
            "no-console": ["warn", { allow: ["warn", "error", "time", "timeEnd"] }],
            "no-debugger": "warn",
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always"],
        },
    },

    // 测试文件宽松规则
    {
        files: ["tests/**", "**/*.test.ts", "**/*.spec.ts"],
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
]);
