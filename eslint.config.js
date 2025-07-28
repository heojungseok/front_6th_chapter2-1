import globals from "globals";
import pluginJs from "@eslint/js";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      globals: globals.browser
    }
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      ...configPrettier.rules,
      "prettier/prettier": "error"
    }
  }
];
