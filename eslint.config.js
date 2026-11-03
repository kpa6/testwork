import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['dist/**', 'public/mockServiceWorker.js'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2022,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: { plugins: ['typescript', 'jsx'] },
        },
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
