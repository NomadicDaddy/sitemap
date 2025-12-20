/**
 * useTreeNodeEditing Hook
 *
 * A custom React hook for managing inline editing of tree node labels.
 * Provides state management and handlers for starting, committing, and canceling edits.
 *
 * @example
 * ```tsx
 * const {
 *   editingId,
 *   editValue,
 *   isEditing,
 *   startEditing,
 *   updateEditValue,
 *   commitEdit,
 *   cancelEdit,
 * } = useTreeNodeEditing({
 *   onLabelChange: (nodeId, newLabel) => {
 *     // Update your tree state here
 *   },
 * });
 * ```
 */
import { useCallback, useRef, useState } from 'react';

import { type EditingState, type TreeNode } from '../types/TreeNode';

/**
 * Options for the useTreeNodeEditing hook.
 */
export interface UseTreeNodeEditingOptions {
	/**
	 * Callback fired when a node label is successfully committed.
	 * Return false to prevent the edit from being committed.
	 */
	onLabelChange?: (nodeId: string, newLabel: string, oldLabel: string) => void | boolean;

	/**
	 * Callback fired when editing starts.
	 */
	onEditStart?: (nodeId: string, currentLabel: string) => void;

	/**
	 * Callback fired when editing is canceled.
	 */
	onEditCancel?: (nodeId: string) => void;

	/**
	 * Whether to allow empty labels. Defaults to false.
	 */
	allowEmptyLabels?: boolean;

	/**
	 * Whether to trim whitespace from labels. Defaults to true.
	 */
	trimLabels?: boolean;
}

/**
 * Return type for the useTreeNodeEditing hook.
 */
export interface UseTreeNodeEditingResult {
	/** The ID of the node currently being edited (undefined if not editing) */
	editingId: string | undefined;

	/** The current value being edited */
	editValue: string;

	/** The current editing state object */
	editingState: EditingState;

	/**
	 * Check if a specific node is being edited.
	 * @param nodeId - The ID of the node to check
	 */
	isEditing: (nodeId: string) => boolean;

	/**
	 * Start editing a node.
	 * @param node - The node to start editing
	 */
	startEditing: (node: TreeNode) => void;

	/**
	 * Start editing by node ID and current label.
	 * @param nodeId - The ID of the node to edit
	 * @param currentLabel - The current label value
	 */
	startEditingById: (nodeId: string, currentLabel: string) => void;

	/**
	 * Update the current edit value.
	 * @param value - The new value
	 */
	updateEditValue: (value: string) => void;

	/**
	 * Commit the current edit and save the new label.
	 * Returns true if the edit was committed, false if it was rejected.
	 */
	commitEdit: () => boolean;

	/**
	 * Cancel the current edit and discard changes.
	 */
	cancelEdit: () => void;

	/**
	 * Handler for input change events.
	 */
	handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

	/**
	 * Handler for keyboard events (Enter to commit, Escape to cancel).
	 */
	handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;

	/**
	 * Handler for blur events (commits edit by default).
	 */
	handleBlur: () => void;
}

/**
 * Custom hook for managing inline editing of tree node labels.
 *
 * Provides complete state management and event handlers for:
 * - Starting edits (on double-click or button click)
 * - Updating the edit value as the user types
 * - Committing edits (on Enter or blur)
 * - Canceling edits (on Escape)
 *
 * @param options - Configuration options for the hook
 * @returns Object containing editing state and handlers
 *
 * @example
 * ```tsx
 * function EditableTree({ tree, setTree }) {
 *   const editing = useTreeNodeEditing({
 *     onLabelChange: (nodeId, newLabel) => {
 *       setTree(updateNodeLabel(tree, nodeId, newLabel));
 *     },
 *   });
 *
 *   return (
 *     <TreeNodeComponent
 *       node={tree}
 *       onNodeDoubleClick={(node) => editing.startEditing(node)}
 *       renderLabel={(node) =>
 *         editing.isEditing(node.id) ? (
 *           <input
 *             value={editing.editValue}
 *             onChange={editing.handleInputChange}
 *             onKeyDown={editing.handleKeyDown}
 *             onBlur={editing.handleBlur}
 *             autoFocus
 *           />
 *         ) : (
 *           node.label
 *         )
 *       }
 *     />
 *   );
 * }
 * ```
 */
export function useTreeNodeEditing(
	options: UseTreeNodeEditingOptions = {}
): UseTreeNodeEditingResult {
	const {
		onLabelChange,
		onEditStart,
		onEditCancel,
		allowEmptyLabels = false,
		trimLabels = true,
	} = options;

	// Core editing state
	const [editingId, setEditingId] = useState<string | undefined>(undefined);
	const [editValue, setEditValue] = useState<string>('');

	// Store original value for cancel/comparison
	const originalValueRef = useRef<string>('');

	// Check if a specific node is being edited
	const isEditing = useCallback((nodeId: string): boolean => editingId === nodeId, [editingId]);

	// Start editing a node
	const startEditing = useCallback(
		(node: TreeNode): void => {
			setEditingId(node.id);
			setEditValue(node.label);
			originalValueRef.current = node.label;
			onEditStart?.(node.id, node.label);
		},
		[onEditStart]
	);

	// Start editing by node ID and current label
	const startEditingById = useCallback(
		(nodeId: string, currentLabel: string): void => {
			setEditingId(nodeId);
			setEditValue(currentLabel);
			originalValueRef.current = currentLabel;
			onEditStart?.(nodeId, currentLabel);
		},
		[onEditStart]
	);

	// Update the edit value
	const updateEditValue = useCallback((value: string): void => {
		setEditValue(value);
	}, []);

	// Commit the edit
	const commitEdit = useCallback((): boolean => {
		if (!editingId) {
			return false;
		}

		let finalValue = editValue;

		// Apply trimming if enabled
		if (trimLabels) {
			finalValue = finalValue.trim();
		}

		// Check for empty labels
		if (!allowEmptyLabels && finalValue === '') {
			// Revert to original if empty labels are not allowed
			setEditingId(undefined);
			setEditValue('');
			return false;
		}

		// Check if value actually changed
		if (finalValue === originalValueRef.current) {
			// No change, just close the editor
			setEditingId(undefined);
			setEditValue('');
			return true;
		}

		// Call the change handler
		const result = onLabelChange?.(editingId, finalValue, originalValueRef.current);

		// If the handler returned false, don't commit
		if (result === false) {
			return false;
		}

		// Clear editing state
		setEditingId(undefined);
		setEditValue('');
		return true;
	}, [editingId, editValue, onLabelChange, allowEmptyLabels, trimLabels]);

	// Cancel the edit
	const cancelEdit = useCallback((): void => {
		if (editingId) {
			onEditCancel?.(editingId);
		}
		setEditingId(undefined);
		setEditValue('');
	}, [editingId, onEditCancel]);

	// Handler for input change events
	const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
		setEditValue(event.target.value);
	}, []);

	// Handler for keyboard events
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>): void => {
			if (event.key === 'Enter') {
				event.preventDefault();
				event.stopPropagation();
				commitEdit();
			} else if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				cancelEdit();
			}
		},
		[commitEdit, cancelEdit]
	);

	// Handler for blur events
	const handleBlur = useCallback((): void => {
		commitEdit();
	}, [commitEdit]);

	// Build the editing state object
	const editingState: EditingState = {
		editValue,
		editingId,
	};

	return {
		cancelEdit,
		commitEdit,
		editValue,
		editingId,
		editingState,
		handleBlur,
		handleInputChange,
		handleKeyDown,
		isEditing,
		startEditing,
		startEditingById,
		updateEditValue,
	};
}

export default useTreeNodeEditing;
