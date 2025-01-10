import pluginJs from '@eslint/js'
import parserAstro from 'astro-eslint-parser'
import { configs as configsAstro, environments } from 'eslint-plugin-astro'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import pluginPackageJson from 'eslint-plugin-package-json/configs/recommended'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginYml from 'eslint-plugin-yml'
import globals from 'globals'
import parserJsonc from 'jsonc-eslint-parser'
import neostandard, { plugins, resolveIgnoresFromGitignore } from 'neostandard'
import { parser as parserTs } from 'typescript-eslint'
import parserYml from 'yaml-eslint-parser'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: resolveIgnoresFromGitignore() },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...neostandard({
    noJsx: true,
    noStyle: true,
    ts: true
  }),
  plugins.promise.configs['flat/recommended'],
  plugins['@stylistic'].configs['recommended-flat'],
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      ...plugins['import-x'].flatConfigs.typescript.rules,
      ...plugins['import-x'].flatConfigs.recommended.rules,
      ...plugins.n.configs['flat/recommended'].rules,
      'n/no-missing-import': 'off'
    }
  },
  {
    ignores: ['package-lock.json'],
    files: ['**/package.json'],
    ...pluginPackageJson
  },
  {
    files: ['**/*.{json,jsonc,json5}'],
    plugins: { jsonc: eslintPluginJsonc },
    languageOptions: {
      parser: parserJsonc
    },
    rules: {
      ...eslintPluginJsonc.configs['flat/recommended-with-json'][2].rules,
      ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'][2].rules,
      ...eslintPluginJsonc.configs['flat/recommended-with-json5'][2].rules,
      'jsonc/key-name-casing': ['error',
        {
          camelCase: true,
          'kebab-case': true,
          PascalCase: false,
          SCREAMING_SNAKE_CASE: false,
          snake_case: true,
          ignores: [
            '^\\$', // Claves que comienzan con `$`
            '^[^.]+(\\.[^.]+)+$', // Claves con puntos `.`
            '^[^:]+:[^:]+$', // Claves con dos puntos `:`
            '^\\[.+\\]$', // Claves con corchetes como `[astro]`
            '^@[a-z0-9-]+\\/\\*$', // Alias de rutas como `@namespace/*`
            '^@[a-z0-9-]+$', // Alias de rutas como `@namespace`
            '^\\.\\/.*\\*\\*\\/.*\\.(\\w+|\\{[^}]+\\})$', // Patrones complejos de rutas
            '^(\\*|\\.\\/\\*)[^/]*\\.\\w+$', // Patrones simples como `*.js` o `./*.js`
            '^@[a-z0-9-]+\\/[a-z0-9-]+$' // Claves con dependencias con la sintaxis `@org/package`
          ]
        }
      ]
    }
  },
  {
    ignores: ['pnpm-lock.yaml'],
    files: ['**/*.{yml,yaml}'],
    plugins: { yml: pluginYml },
    languageOptions: {
      parser: parserYml
    },
    rules: {
      ...pluginYml.configs['flat/standard'].rules,
      'yml/indent': ['error', 3, { indicatorValueIndent: 2 }],
      'yml/quotes': ['error', { prefer: 'double' }],
      '@stylistic/spaced-comment': 'off'
    }
  },
  {
    files: ['src/**/*.astro'],
    languageOptions: {
      globals: environments.astro.globals,
      parser: parserAstro,
      parserOptions: {
        extraFileExtensions: ['.astro'],
        parser: parserTs
      }
    },
    processor: 'astro/client-side-ts',
    rules: {
      'astro/jsx-a11y/anchor-is-valid': 'warn'
    }
  },
  {
    files: ['src/**/*.astro/*.{js,ts}'],
    processor: 'astro/client-side-ts',
    rules: {
      '@stylistic/indent': ['error', 2],
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-missing-import': 'off'
    }
  },
  ...configsAstro['flat/jsx-a11y-recommended'],
  ...configsAstro['flat/recommended'],
  {
    plugins: {
      perfectionist
    },
    rules: {
      'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-imports': ['error', {
        groups: [
          'type',
          ['parent-type', 'sibling-type', 'index-type', 'internal-type'],
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'side-effect',
          'object',
          'unknown'
        ],
        newlinesBetween: 'ignore',
        order: 'asc',
        type: 'natural'
      }],
      'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          specialCharacters: 'keep'
        }
      ]
    }
  },
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/operator-linebreak': [
        'error',
        'after',
        { overrides: { '?': 'before', ':': 'before' } }
      ],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: false }]
    }
  },
  {
    settings: {
      ...plugins['import-x'].flatConfigs.typescript.settings
    }
  }
]
