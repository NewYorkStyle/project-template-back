import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import * as importPlugin from 'eslint-plugin-import';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/.eslintrc.js'],
  },
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  {
    languageOptions: {
      ecmaVersion: 5,

      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },

      sourceType: 'module',
    },

    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      import: importPlugin,
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys-fix': sortKeysFix,
    },

    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': [
        'warn',
        {
          alphabetize: {
            order: 'asc',
          },

          groups: ['builtin', ['sibling', 'parent'], 'index', 'object'],

          named: true,
        },
      ],
      'max-lines': ['error', 1015],
      'no-console': ['warn'],
      'no-multiple-empty-lines': 'warn',
      'no-trailing-spaces': 'warn',

      'sort-destructure-keys/sort-destructure-keys': 2,
      'sort-keys-fix/sort-keys-fix': 'warn',
    },
  },
];
