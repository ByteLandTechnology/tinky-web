import eslint from "@eslint/js";

import { defineConfig } from "eslint/config";
import eslintTypescript from "typescript-eslint";
import eslintReact from "eslint-plugin-react";
import globals from "globals";

export default defineConfig(
  eslint.configs.recommended,
  eslintTypescript.configs.stylistic,
  eslintTypescript.configs.strict,
  eslintReact.configs.flat.recommended,
  eslintReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
    },
  },
);
