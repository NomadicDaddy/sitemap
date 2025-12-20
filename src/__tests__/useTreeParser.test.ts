/**
 * useTreeParser Hook Unit Tests
 *
 * Comprehensive tests for the useTreeParser custom React hook that provides
 * real-time parsing of tree text input.
 */
import { act, renderHook } from '@testing-library/react';
import type React from 'react';

import { useTreeParser } from '../hooks/useTreeParser';

// ============================================================================
// Tests
// ============================================================================

describe('useTreeParser', () => {
	describe('initialization', () => {
		it('should initialize with empty state by default', () => {
			const { result } = renderHook(() => useTreeParser());

			expect(result.current.inputValue).toBe('');
			expect(result.current.tree).toEqual([]);
			expect(result.current.errors).toEqual([]);
			expect(result.current.success).toBe(true);
			expect(result.current.nodeCount).toBe(0);
			expect(result.current.maxDepth).toBe(0);
		});

		it('should initialize with provided initial value', () => {
			const initialValue = 'Home\n├── About\n└── Contact';
			const { result } = renderHook(() => useTreeParser({ initialValue }));

			expect(result.current.inputValue).toBe(initialValue);
			expect(result.current.tree).toHaveLength(1);
			expect(result.current.tree[0].label).toBe('Home');
			expect(result.current.tree[0].children).toHaveLength(2);
			expect(result.current.success).toBe(true);
			expect(result.current.nodeCount).toBe(3);
			expect(result.current.maxDepth).toBe(1);
		});

		it('should parse complex tree structure on initialization', () => {
			const initialValue = `Website
├── Home
├── Products
│   ├── Category A
│   └── Category B
└── Contact`;

			const { result } = renderHook(() => useTreeParser({ initialValue }));

			expect(result.current.tree).toHaveLength(1);
			expect(result.current.tree[0].label).toBe('Website');
			expect(result.current.tree[0].children).toHaveLength(3);
			expect(result.current.nodeCount).toBe(6);
			expect(result.current.maxDepth).toBe(2);
		});
	});

	describe('setInputValue', () => {
		it('should update input value and re-parse', () => {
			const { result } = renderHook(() => useTreeParser());

			act(() => {
				result.current.setInputValue('Root\n├── Child 1\n└── Child 2');
			});

			expect(result.current.inputValue).toBe('Root\n├── Child 1\n└── Child 2');
			expect(result.current.tree).toHaveLength(1);
			expect(result.current.tree[0].label).toBe('Root');
			expect(result.current.tree[0].children).toHaveLength(2);
		});

		it('should trigger instant re-parse on every change', () => {
			const { result } = renderHook(() => useTreeParser());

			// First update
			act(() => {
				result.current.setInputValue('A');
			});
			expect(result.current.tree[0]?.label).toBe('A');

			// Second update
			act(() => {
				result.current.setInputValue('AB');
			});
			expect(result.current.tree[0]?.label).toBe('AB');

			// Third update - add child
			act(() => {
				result.current.setInputValue('AB\n├── Child');
			});
			expect(result.current.tree[0]?.label).toBe('AB');
			expect(result.current.tree[0]?.children?.[0]?.label).toBe('Child');
		});
	});

	describe('handleInputChange', () => {
		it('should handle textarea onChange events', () => {
			const { result } = renderHook(() => useTreeParser());

			const mockEvent = {
				target: { value: 'New Value' },
			} as React.ChangeEvent<HTMLTextAreaElement>;

			act(() => {
				result.current.handleInputChange(mockEvent);
			});

			expect(result.current.inputValue).toBe('New Value');
		});

		it('should parse on each keystroke simulation', () => {
			const { result } = renderHook(() => useTreeParser());

			// Simulate typing "Home" character by character
			['H', 'Ho', 'Hom', 'Home'].forEach((value) => {
				act(() => {
					result.current.handleInputChange({
						target: { value },
					} as React.ChangeEvent<HTMLTextAreaElement>);
				});
				expect(result.current.tree[0]?.label).toBe(value);
			});
		});
	});

	describe('error handling', () => {
		it('should detect and report parsing errors', () => {
			const { result } = renderHook(() => useTreeParser());

			act(() => {
				// Invalid depth jump (going from depth 0 directly to depth 3)
				result.current.setInputValue('Root\n│   │   └── Too Deep');
			});

			// Should have errors
			expect(result.current.errors.length).toBeGreaterThan(0);
		});

		it('should clear errors when input becomes valid', () => {
			const { result } = renderHook(() => useTreeParser());

			// Set invalid input
			act(() => {
				result.current.setInputValue('├── Orphaned');
			});

			// Now set valid input
			act(() => {
				result.current.setInputValue('Root\n├── Child');
			});

			expect(result.current.success).toBe(true);
			expect(result.current.tree[0]?.label).toBe('Root');
		});
	});

	describe('clear function', () => {
		it('should clear input and reset to empty state', () => {
			const { result } = renderHook(() => useTreeParser({ initialValue: 'Home\n├── About' }));

			expect(result.current.inputValue).not.toBe('');
			expect(result.current.tree).not.toEqual([]);

			act(() => {
				result.current.clear();
			});

			expect(result.current.inputValue).toBe('');
			expect(result.current.tree).toEqual([]);
			expect(result.current.nodeCount).toBe(0);
		});
	});

	describe('reset function', () => {
		it('should reset to initial value', () => {
			const initialValue = 'Initial Value';
			const { result } = renderHook(() => useTreeParser({ initialValue }));

			// Modify the input
			act(() => {
				result.current.setInputValue('Modified Value');
			});

			expect(result.current.inputValue).toBe('Modified Value');

			// Reset to initial
			act(() => {
				result.current.reset();
			});

			expect(result.current.inputValue).toBe(initialValue);
		});
	});

	describe('nodeCount calculation', () => {
		it('should calculate correct node count for simple tree', () => {
			const { result } = renderHook(() => useTreeParser({ initialValue: 'A\n├── B\n└── C' }));

			expect(result.current.nodeCount).toBe(3);
		});

		it('should calculate correct node count for deeply nested tree', () => {
			const { result } = renderHook(() =>
				useTreeParser({
					initialValue: 'A\n├── B\n│   ├── C\n│   │   └── D\n│   └── E\n└── F',
				})
			);

			expect(result.current.nodeCount).toBe(6);
		});

		it('should return 0 for empty input', () => {
			const { result } = renderHook(() => useTreeParser());

			expect(result.current.nodeCount).toBe(0);
		});
	});

	describe('maxDepth calculation', () => {
		it('should calculate correct max depth for flat tree', () => {
			const { result } = renderHook(() => useTreeParser({ initialValue: 'A\nB\nC' }));

			expect(result.current.maxDepth).toBe(0);
		});

		it('should calculate correct max depth for nested tree', () => {
			const { result } = renderHook(() =>
				useTreeParser({
					initialValue: 'Root\n├── Level 1\n│   ├── Level 2\n│   │   └── Level 3',
				})
			);

			expect(result.current.maxDepth).toBe(3);
		});
	});

	describe('parser options', () => {
		it('should respect custom indent size', () => {
			const { result } = renderHook(() =>
				useTreeParser({
					initialValue: 'Root\n  Child',
					parserOptions: { indentSize: 2 },
				})
			);

			expect(result.current.tree[0]?.children?.[0]?.label).toBe('Child');
			expect(result.current.tree[0]?.children?.[0]?.depth).toBe(1);
		});

		it('should respect trimLabels option', () => {
			const { result } = renderHook(() =>
				useTreeParser({
					initialValue: '  Trimmed  ',
					parserOptions: { trimLabels: true },
				})
			);

			expect(result.current.tree[0]?.label).toBe('Trimmed');
		});
	});

	describe('multiple root nodes', () => {
		it('should handle multiple root nodes', () => {
			const { result } = renderHook(() =>
				useTreeParser({
					initialValue: 'Root 1\n├── Child 1\nRoot 2\n└── Child 2',
				})
			);

			expect(result.current.tree).toHaveLength(2);
			expect(result.current.tree[0].label).toBe('Root 1');
			expect(result.current.tree[1].label).toBe('Root 2');
			expect(result.current.nodeCount).toBe(4);
		});
	});

	describe('real-time update simulation', () => {
		it('should handle rapid successive updates', () => {
			const { result } = renderHook(() => useTreeParser());

			// Simulate rapid typing
			const inputs = [
				'H',
				'Ho',
				'Hom',
				'Home',
				'Home\n',
				'Home\n├',
				'Home\n├─',
				'Home\n├──',
				'Home\n├── ',
				'Home\n├── A',
				'Home\n├── Ab',
				'Home\n├── Abo',
				'Home\n├── Abou',
				'Home\n├── About',
			];

			inputs.forEach((input) => {
				act(() => {
					result.current.setInputValue(input);
				});
			});

			// Final state should be correct
			expect(result.current.inputValue).toBe('Home\n├── About');
			expect(result.current.tree[0]?.label).toBe('Home');
			expect(result.current.tree[0]?.children?.[0]?.label).toBe('About');
		});
	});

	describe('special characters in labels', () => {
		it('should handle labels with special characters', () => {
			const { result } = renderHook(() =>
				useTreeParser({
					initialValue:
						'Products & Services\n├── Category: Electronics\n└── Item (Special)',
				})
			);

			expect(result.current.tree[0]?.label).toBe('Products & Services');
			expect(result.current.tree[0]?.children?.[0]?.label).toBe('Category: Electronics');
			expect(result.current.tree[0]?.children?.[1]?.label).toBe('Item (Special)');
		});

		it('should handle labels with unicode characters', () => {
			const { result } = renderHook(() =>
				useTreeParser({
					initialValue: '🏠 Home\n├── 📄 About\n└── 📞 Contact',
				})
			);

			expect(result.current.tree[0]?.label).toBe('🏠 Home');
			expect(result.current.nodeCount).toBe(3);
		});
	});
});
