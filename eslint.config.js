import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        HTMLElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'space-before-function-paren': ['error', 'never'],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never']
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.js'
    ]
  }
]