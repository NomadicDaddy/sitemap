/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'src/**/*.tsx',
		'!src/**/__tests__/**',
		'!src/**/index.ts',
	],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 50,
			lines: 50,
			statements: 50,
		},
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
	verbose: true,
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
	// Transform D3 and its dependencies (they use ESM)
	transformIgnorePatterns: [
		'/node_modules/(?!(d3|d3-.*|internmap|delaunator|robust-predicates)/)',
	],
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: {
					allowSyntheticDefaultImports: true,
					esModuleInterop: true,
					forceConsistentCasingInFileNames: true,
					jsx: 'react',
					lib: ['ES2020', 'DOM'],
					module: 'commonjs',
					moduleResolution: 'node',
					noImplicitAny: false, // Disable for tests
					noImplicitReturns: false, // Disable for tests
					noUnusedLocals: false,
					noUnusedParameters: false,
					resolveJsonModule: true,
					skipLibCheck: true,
					sourceMap: true,
					strict: false, // Disable for tests
					target: 'ES2020',
					types: ['jest', '@testing-library/jest-dom', 'node'],
				},
			},
		],
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
	globals: {
		'ts-jest': {
			useESM: false,
		},
	},
};
