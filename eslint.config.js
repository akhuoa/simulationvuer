import js from "@eslint/js";
import babelParser from "@babel/eslint-parser";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import vue from "eslint-plugin-vue";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "docs/.vitepress/**", "docs/components/**"],
  },
  js.configs.recommended,
  ...vue.configs["flat/essential"],
  {
    files: ["**/*.{js,vue}"],
    plugins: {
      prettier,
    },
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        parser: babelParser,
        requireConfigFile: false,
      },
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
];
