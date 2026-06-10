import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import obsidianmdPlugin from "eslint-plugin-obsidianmd";
import js from "@eslint/js";

export default [
  {
    ignores: [
      "main.js"
    ],
  },
  {
    languageOptions: {
      globals: {
        process: "readonly",
        window: "readonly",
      },
    },
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json", // point ESLint to TS-config
        tsconfigRootDir: import.meta.dirname, // Set correct path independent of OS
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "obsidianmd": obsidianmdPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...obsidianmdPlugin.configs.recommended.rules,
      "@typescript-eslint/no-redundant-type-constituents": "error", // catch redundant types like 'Error | unknown'
      "@typescript-eslint/no-explicit-any": "warn",
      "no-undef": "error",
      // "require-await": "error",
      "@typescript-eslint/no-misused-promises": [ "error", { "checksVoidReturn": true } ],
    },
  },
];
