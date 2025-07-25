// Basic ESLint config for Next.js/React/TypeScript

import js from '@eslint/js';
import next from 'eslint-config-next';

export default [
  js.config({
    extends: [
      'eslint:recommended',
    ],
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  }),
  ...next,
]; 