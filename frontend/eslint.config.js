import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Los archivos de prueba usan describe/test/expect/vi como
    // globales (vitest.config -> test.globals: true), igual que
    // ya hacen los tests de Jest del backend.
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: globals.vitest,
    },
  },
  {
    // vite.config.js corre en Node (durante el build), no en el
    // navegador — usa process.env, que no existe en globals.browser.
    files: ['vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
