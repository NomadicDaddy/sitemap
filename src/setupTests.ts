/**
 * Jest test setup file for React Testing Library
 *
 * This file is automatically loaded before running tests.
 * It sets up the testing environment with extended matchers.
 */
import '@testing-library/jest-dom';

/**
 * Mock ResizeObserver for react-window v2 virtualization tests.
 * ResizeObserver is not available in JSDOM but is required by react-window.
 */
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

// Assign to global
globalThis.ResizeObserver = ResizeObserverMock;
