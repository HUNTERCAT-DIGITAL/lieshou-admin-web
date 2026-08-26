// ESLint 9 flat config
// 规则来源：.ai/CONVENTIONS.md §1-§6
// 跑法：pnpm lint / pnpm lint:fix
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. 忽略构建产物与依赖
  {
    ignores: [
      'dist/**',
      '.vite/**',
      'node_modules/**',
      'node_modules.bak/**',
      'open/**',
      'src/types/global.d.ts',
    ],
  },

  // 2. 基础集 + TypeScript 推荐
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. 业务规则：与 §1-§6 对齐
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      eqeqeq: ['error', 'always'],
    },
  },

  // 4. 测试文件可以宽松
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);
