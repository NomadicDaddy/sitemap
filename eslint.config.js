import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'**/*.min.js',
			'**/dist/**',
			'**/node_modules/**',
			'backups/**',
			'logs/**',
			'backend/prisma/generated/**',
			'backend/node_modules/**',
			'frontend/node_modules/**',
		],
	},

	// base configs
	js.configs.recommended,
	...tseslint.configs.recommended,

	// project configuration
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'sort-keys-fix': sortKeysFix,
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': [
				'warn',
				{ fixStyle: 'inline-type-imports', prefer: 'type-imports' },
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'react-hooks/exhaustive-deps': 'warn',
			'react-hooks/rules-of-hooks': 'error',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'sort-imports': [
				'warn',
				{
					allowSeparatedGroups: true,
					ignoreCase: false,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
				},
			],
			'sort-keys': 'off',
			'sort-keys-fix/sort-keys-fix': [
				'warn',
				'asc',
				{
					caseSensitive: true,
					natural: false,
				},
			],
		},
	},

	// node specific overrides
	{
		files: ['backend/**/*.{ts,tsx}', 'scripts/**/*.ts', 'backend/prisma/seed.ts'],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'no-console': 'off',
		},
	},

	// test file overrides
	{
		files: ['**/*.test.ts', '**/*.spec.ts', '**/test-*.ts'],
		languageOptions: {
			globals: globals.jest,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'max-lines-per-function': 'off',
			'no-console': 'off',
			'no-magic-numbers': 'off',
		},
	}
);
