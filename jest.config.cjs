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
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	verbose: true,
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
	// Transform D3 and its dependencies (they use ESM)
	transformIgnorePatterns: [
		'/node_modules/(?!(d3|d3-.*|internmap|delaunator|robust-predicates)/)',
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
};
