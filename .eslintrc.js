module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import',
    'sort-destructure-keys',
    'sort-keys-fix',
  ],
  extends: ['plugin:@typescript-eslint/recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'max-lines': ['error', 1015],
    'no-console': ['warn'],
    'no-multiple-empty-lines': 'warn',
    'no-trailing-spaces': 'warn',
    'sort-keys-fix/sort-keys-fix': 'warn',
    'sort-destructure-keys/sort-destructure-keys': 2,
    'import/order': [
      'warn',
      {
        named: true,
        alphabetize: {
          order: 'asc',
        },
        groups: ['builtin', ['sibling', 'parent'], 'index', 'object'],
      },
    ],
  },
};
