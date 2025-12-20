/**
 * useTreeNodeEditing Hook Tests
 *
 * Comprehensive tests for the useTreeNodeEditing hook that manages
 * inline editing state for tree node labels.
 */
import { act, renderHook } from '@testing-library/react';

import { useTreeNodeEditing } from '../hooks/useTreeNodeEditing';
import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Test Data
// ============================================================================

const createTestNode = (overrides: Partial<TreeNode> = {}): TreeNode => ({
	depth: 0,
	id: 'test-node',
	label: 'Test Label',
	...overrides,
});

// ============================================================================
// Hook Tests
// ============================================================================

describe('useTreeNodeEditing', () => {
	describe('initial state', () => {
		it('should initialize with no node being edited', () => {
			const { result } = renderHook(() => useTreeNodeEditing());

			expect(result.current.editingId).toBeUndefined();
			expect(result.current.editValue).toBe('');
		});

		it('should return empty editing state initially', () => {
			const { result } = renderHook(() => useTreeNodeEditing());

			expect(result.current.editingState).toEqual({
				editValue: '',
				editingId: undefined,
			});
		});

		it('should not be editing any node initially', () => {
			const { result } = renderHook(() => useTreeNodeEditing());

			expect(result.current.isEditing('any-id')).toBe(false);
		});
	});

	describe('startEditing', () => {
		it('should start editing a node', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node = createTestNode({ id: 'node-1', label: 'Hello' });

			act(() => {
				result.current.startEditing(node);
			});

			expect(result.current.editingId).toBe('node-1');
			expect(result.current.editValue).toBe('Hello');
			expect(result.current.isEditing('node-1')).toBe(true);
		});

		it('should call onEditStart callback', () => {
			const onEditStart = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onEditStart }));
			const node = createTestNode({ id: 'node-1', label: 'Hello' });

			act(() => {
				result.current.startEditing(node);
			});

			expect(onEditStart).toHaveBeenCalledWith('node-1', 'Hello');
		});

		it('should switch to editing a different node', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node1 = createTestNode({ id: 'node-1', label: 'First' });
			const node2 = createTestNode({ id: 'node-2', label: 'Second' });

			act(() => {
				result.current.startEditing(node1);
			});

			expect(result.current.isEditing('node-1')).toBe(true);

			act(() => {
				result.current.startEditing(node2);
			});

			expect(result.current.isEditing('node-1')).toBe(false);
			expect(result.current.isEditing('node-2')).toBe(true);
			expect(result.current.editValue).toBe('Second');
		});
	});

	describe('startEditingById', () => {
		it('should start editing by ID and label', () => {
			const { result } = renderHook(() => useTreeNodeEditing());

			act(() => {
				result.current.startEditingById('custom-id', 'Custom Label');
			});

			expect(result.current.editingId).toBe('custom-id');
			expect(result.current.editValue).toBe('Custom Label');
		});
	});

	describe('updateEditValue', () => {
		it('should update the edit value', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
			});

			act(() => {
				result.current.updateEditValue('New Value');
			});

			expect(result.current.editValue).toBe('New Value');
		});
	});

	describe('handleInputChange', () => {
		it('should update value from input event', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
			});

			const mockEvent = {
				target: { value: 'From Event' },
			} as React.ChangeEvent<HTMLInputElement>;

			act(() => {
				result.current.handleInputChange(mockEvent);
			});

			expect(result.current.editValue).toBe('From Event');
		});
	});

	describe('commitEdit', () => {
		it('should call onLabelChange with new value', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onLabelChange }));
			const node = createTestNode({ id: 'node-1', label: 'Original' });

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('Updated');
			});

			act(() => {
				result.current.commitEdit();
			});

			expect(onLabelChange).toHaveBeenCalledWith('node-1', 'Updated', 'Original');
		});

		it('should clear editing state after commit', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('New Value');
			});

			act(() => {
				result.current.commitEdit();
			});

			expect(result.current.editingId).toBeUndefined();
			expect(result.current.editValue).toBe('');
		});

		it('should return true on successful commit', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('New Value');
			});

			let commitResult: boolean = false;
			act(() => {
				commitResult = result.current.commitEdit();
			});

			expect(commitResult).toBe(true);
		});

		it('should return false if no node is being edited', () => {
			const { result } = renderHook(() => useTreeNodeEditing());

			let commitResult: boolean = true;
			act(() => {
				commitResult = result.current.commitEdit();
			});

			expect(commitResult).toBe(false);
		});

		it('should trim labels by default', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onLabelChange }));
			const node = createTestNode({ id: 'node-1', label: 'Original' });

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('  Trimmed  ');
			});

			act(() => {
				result.current.commitEdit();
			});

			expect(onLabelChange).toHaveBeenCalledWith('node-1', 'Trimmed', 'Original');
		});

		it('should not trim labels when trimLabels is false', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() =>
				useTreeNodeEditing({ onLabelChange, trimLabels: false })
			);
			const node = createTestNode({ id: 'node-1', label: 'Original' });

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('  Untrimmed  ');
			});

			act(() => {
				result.current.commitEdit();
			});

			expect(onLabelChange).toHaveBeenCalledWith('node-1', '  Untrimmed  ', 'Original');
		});

		it('should reject empty labels by default', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onLabelChange }));
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('   '); // Just whitespace
			});

			let commitResult: boolean = true;
			act(() => {
				commitResult = result.current.commitEdit();
			});

			expect(commitResult).toBe(false);
			expect(onLabelChange).not.toHaveBeenCalled();
		});

		it('should allow empty labels when allowEmptyLabels is true', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() =>
				useTreeNodeEditing({ allowEmptyLabels: true, onLabelChange })
			);
			const node = createTestNode({ id: 'node-1', label: 'Original' });

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('');
			});

			let commitResult: boolean = false;
			act(() => {
				commitResult = result.current.commitEdit();
			});

			expect(commitResult).toBe(true);
			expect(onLabelChange).toHaveBeenCalledWith('node-1', '', 'Original');
		});

		it('should not call onLabelChange if value did not change', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onLabelChange }));
			const node = createTestNode({ id: 'node-1', label: 'Same Value' });

			act(() => {
				result.current.startEditing(node);
				// Don't change the value
			});

			let commitResult: boolean = false;
			act(() => {
				commitResult = result.current.commitEdit();
			});

			expect(commitResult).toBe(true); // Still successful (close editor)
			expect(onLabelChange).not.toHaveBeenCalled(); // But no change callback
		});

		it('should prevent commit if onLabelChange returns false', () => {
			const onLabelChange = jest.fn().mockReturnValue(false);
			const { result } = renderHook(() => useTreeNodeEditing({ onLabelChange }));
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('Invalid Value');
			});

			let commitResult: boolean = true;
			act(() => {
				commitResult = result.current.commitEdit();
			});

			expect(commitResult).toBe(false);
			// Note: editing state is cleared even on rejection in current implementation
		});
	});

	describe('cancelEdit', () => {
		it('should clear editing state', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('Changed');
			});

			expect(result.current.editingId).toBeDefined();

			act(() => {
				result.current.cancelEdit();
			});

			expect(result.current.editingId).toBeUndefined();
			expect(result.current.editValue).toBe('');
		});

		it('should call onEditCancel callback', () => {
			const onEditCancel = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onEditCancel }));
			const node = createTestNode({ id: 'node-1' });

			act(() => {
				result.current.startEditing(node);
			});

			act(() => {
				result.current.cancelEdit();
			});

			expect(onEditCancel).toHaveBeenCalledWith('node-1');
		});

		it('should not call onEditCancel if not editing', () => {
			const onEditCancel = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onEditCancel }));

			act(() => {
				result.current.cancelEdit();
			});

			expect(onEditCancel).not.toHaveBeenCalled();
		});
	});

	describe('handleKeyDown', () => {
		it('should commit on Enter key', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onLabelChange }));
			const node = createTestNode({ id: 'node-1', label: 'Original' });

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('New');
			});

			const enterEvent = {
				key: 'Enter',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			} as unknown as React.KeyboardEvent<HTMLInputElement>;

			act(() => {
				result.current.handleKeyDown(enterEvent);
			});

			expect(enterEvent.preventDefault).toHaveBeenCalled();
			expect(enterEvent.stopPropagation).toHaveBeenCalled();
			expect(onLabelChange).toHaveBeenCalled();
		});

		it('should cancel on Escape key', () => {
			const onEditCancel = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onEditCancel }));
			const node = createTestNode({ id: 'node-1' });

			act(() => {
				result.current.startEditing(node);
			});

			const escapeEvent = {
				key: 'Escape',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			} as unknown as React.KeyboardEvent<HTMLInputElement>;

			act(() => {
				result.current.handleKeyDown(escapeEvent);
			});

			expect(escapeEvent.preventDefault).toHaveBeenCalled();
			expect(escapeEvent.stopPropagation).toHaveBeenCalled();
			expect(onEditCancel).toHaveBeenCalled();
		});

		it('should not react to other keys', () => {
			const onLabelChange = jest.fn();
			const onEditCancel = jest.fn();
			const { result } = renderHook(() =>
				useTreeNodeEditing({ onEditCancel, onLabelChange })
			);
			const node = createTestNode();

			act(() => {
				result.current.startEditing(node);
			});

			const otherEvent = {
				key: 'Tab',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			} as unknown as React.KeyboardEvent<HTMLInputElement>;

			act(() => {
				result.current.handleKeyDown(otherEvent);
			});

			expect(otherEvent.preventDefault).not.toHaveBeenCalled();
			expect(onLabelChange).not.toHaveBeenCalled();
			expect(onEditCancel).not.toHaveBeenCalled();
		});
	});

	describe('handleBlur', () => {
		it('should commit on blur', () => {
			const onLabelChange = jest.fn();
			const { result } = renderHook(() => useTreeNodeEditing({ onLabelChange }));
			const node = createTestNode({ id: 'node-1', label: 'Original' });

			act(() => {
				result.current.startEditing(node);
				result.current.updateEditValue('New');
			});

			act(() => {
				result.current.handleBlur();
			});

			expect(onLabelChange).toHaveBeenCalled();
			expect(result.current.editingId).toBeUndefined();
		});
	});

	describe('editingState object', () => {
		it('should reflect current editing state', () => {
			const { result } = renderHook(() => useTreeNodeEditing());
			const node = createTestNode({ id: 'node-123', label: 'Label' });

			act(() => {
				result.current.startEditing(node);
			});

			expect(result.current.editingState).toEqual({
				editValue: 'Label',
				editingId: 'node-123',
			});

			act(() => {
				result.current.updateEditValue('Updated Label');
			});

			expect(result.current.editingState).toEqual({
				editValue: 'Updated Label',
				editingId: 'node-123',
			});
		});
	});
});
