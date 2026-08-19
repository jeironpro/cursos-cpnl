import js from "@eslint/js";
import globals from "globals";

/**
 * Configuración de ESLint (formato plano, ESLint 9).
 * La base es la recomendada de @eslint/js; se delimitan los entornos
 * (navegador para src/, node para scripts/ y la propia configuración).
 */
export default [
  {
    ignores: ["node_modules/", "src/js/inventory.generated.js"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["src/test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
];
