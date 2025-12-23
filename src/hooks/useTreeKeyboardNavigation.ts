/**
 * useTreeKeyboardNavigation Hook
 *
 * Provides keyboard navigation functionality for tree components.
 * Supports arrow keys for navigation, Enter for expand/collapse,
 * Delete for removing nodes, and Tab for focus management.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type TreeNode } from '../types/TreeNode';
import { type FlattenedNode, flattenTree } from '../utils/treeFlattening';

// ============================================================================
// Types
// ============================================================================

export interface KeyboardNavigationOptions {
	/** Array of root-level tree nodes */
	nodes: TreeNode[];

	/** Whether keyboard navigation is enabled (default: true) */
	enabled?: boolean;

	/** Set of selected node IDs */
	selectedIds?: Set<string>;

	/** Callback when a node should be focused */
	onFocusChange?: (nodeId: string | undefined) => void;

	/** Callback when a node's expand/collapse state should toggle */
	onToggleExpand?: (node: TreeNode) => void;

	/** Callback when nodes should be deleted */
	onDeleteNodes?: (nodeIds: string[]) => void;

	/** Callback when selection should change */
	onSelectionChange?: (nodeId: string, event: { ctrlKey: boolean; shiftKey: boolean }) => void;

	/** Whether to prevent default behavior for handled keys (default: true) */
	preventDefault?: boolean;

	/** Container element ref for keyboard event attachment */
	containerRef?: React.RefObject<HTMLElement | null>;
}

export interface KeyboardNavigationState {
	/** Currently focused node ID */
	focusedId: string | undefined;

	/** Whether keyboard shortcuts help dialog is open */
	isHelpOpen: boolean;
}

export interface KeyboardNavigationActions {
	/** Set the focused node ID */
	setFocusedId: (id: string | undefined) => void;

	/** Navigate to the previous visible node */
	navigatePrevious: () => void;

	/** Navigate to the next visible node */
	navigateNext: () => void;

	/** Navigate to the parent node */
	navigateToParent: () => void;

	/** Navigate to the first child node */
	navigateToFirstChild: () => void;

	/** Toggle expand/collapse on focused node */
	toggleExpand: () => void;

	/** Delete focused/selected nodes */
	deleteNodes: () => void;

	/** Select the focused node */
	selectFocused: (options?: { ctrlKey?: boolean; shiftKey?: boolean }) => void;

	/** Focus the first node */
	focusFirst: () => void;

	/** Focus the last node */
	focusLast: () => void;

	/** Toggle keyboard shortcuts help dialog */
	toggleHelp: () => void;

	/** Close keyboard shortcuts help dialog */
	closeHelp: () => void;

	/** Get the keyboard event handler */
	handleKeyDown: (event: React.KeyboardEvent | KeyboardEvent) => void;
}

export interface UseTreeKeyboardNavigationResult {
	state: KeyboardNavigationState;
	actions: KeyboardNavigationActions;
	/** Props to spread on the container element */
	containerProps: {
		tabIndex: number;
		role: string;
		'aria-activedescendant': string | undefined;
		onKeyDown: (event: React.KeyboardEvent) => void;
	};
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing keyboard navigation in tree components.
 *
 * Keyboard shortcuts:
 * - Arrow Up: Navigate to previous visible node
 * - Arrow Down: Navigate to next visible node
 * - Arrow Left: Collapse current node or move to parent
 * - Arrow Right: Expand current node or move to first child
 * - Enter: Toggle expand/collapse
 * - Space: Select/toggle selection on focused node
 * - Delete/Backspace: Delete selected nodes
 * - Tab: Move focus to next node
 * - Shift+Tab: Move focus to previous node
 * - Home: Focus first node
 * - End: Focus last node
 * - ?: Show keyboard shortcuts help
 * - Escape: Close help dialog
 *
 * @example
 * ```tsx
 * function MyTree({ nodes }: { nodes: TreeNode[] }) {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const { state, actions, containerProps } = useTreeKeyboardNavigation({
 *     nodes,
 *     containerRef,
 *     onToggleExpand: (node) => handleToggle(node),
 *     onDeleteNodes: (ids) => handleDelete(ids),
 *   });
 *
 *   return (
 *     <div ref={containerRef} {...containerProps}>
 *       {renderTree(nodes, state.focusedId)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTreeKeyboardNavigation(
	options: KeyboardNavigationOptions
): UseTreeKeyboardNavigationResult {
	const {
		nodes,
		enabled = true,
		selectedIds = new Set(),
		onFocusChange,
		onToggleExpand,
		onDeleteNodes,
		onSelectionChange,
		preventDefault = true,
		containerRef,
	} = options;

	// State
	const [focusedId, setFocusedIdState] = useState<string | undefined>(undefined);
	const [isHelpOpen, setIsHelpOpen] = useState(false);

	// Refs for stable callbacks
	const nodesRef = useRef(nodes);
	nodesRef.current = nodes;

	const selectedIdsRef = useRef(selectedIds);
	selectedIdsRef.current = selectedIds;

	// Flatten tree for navigation (visible nodes only)
	const flattenedNodes = useMemo(() => flattenTree(nodes), [nodes]);

	// Create a map for quick node lookup
	const nodeMap = useMemo(() => {
		const map = new Map<string, { node: TreeNode; index: number; flatNode: FlattenedNode }>();
		flattenedNodes.forEach((flatNode, index) => {
			map.set(flatNode.node.id, { flatNode, index, node: flatNode.node });
		});
		return map;
	}, [flattenedNodes]);

	// Find parent of a node
	const findParent = useCallback(
		(nodeId: string): TreeNode | undefined => {
			const findParentRecursive = (
				searchNodes: TreeNode[],
				parent: TreeNode | undefined
			): TreeNode | undefined => {
				for (const node of searchNodes) {
					if (node.id === nodeId) {
						return parent;
					}
					if (node.children) {
						const found = findParentRecursive(node.children, node);
						if (found !== undefined) {
							return found;
						}
					}
				}
				return undefined;
			};
			return findParentRecursive(nodesRef.current, undefined);
		},
		[nodesRef]
	);

	// Set focused ID with callback
	const setFocusedId = useCallback(
		(id: string | undefined) => {
			setFocusedIdState(id);
			onFocusChange?.(id);
		},
		[onFocusChange]
	);

	// Navigation actions
	const navigatePrevious = useCallback(() => {
		if (!focusedId) {
			// Focus last node if nothing is focused
			if (flattenedNodes.length > 0) {
				setFocusedId(flattenedNodes[flattenedNodes.length - 1].node.id);
			}
			return;
		}

		const current = nodeMap.get(focusedId);
		if (current && current.index > 0) {
			setFocusedId(flattenedNodes[current.index - 1].node.id);
		}
	}, [focusedId, flattenedNodes, nodeMap, setFocusedId]);

	const navigateNext = useCallback(() => {
		if (!focusedId) {
			// Focus first node if nothing is focused
			if (flattenedNodes.length > 0) {
				setFocusedId(flattenedNodes[0].node.id);
			}
			return;
		}

		const current = nodeMap.get(focusedId);
		if (current && current.index < flattenedNodes.length - 1) {
			setFocusedId(flattenedNodes[current.index + 1].node.id);
		}
	}, [focusedId, flattenedNodes, nodeMap, setFocusedId]);

	const navigateToParent = useCallback(() => {
		if (!focusedId) return;

		const parent = findParent(focusedId);
		if (parent) {
			setFocusedId(parent.id);
		}
	}, [focusedId, findParent, setFocusedId]);

	const navigateToFirstChild = useCallback(() => {
		if (!focusedId) return;

		const current = nodeMap.get(focusedId);
		if (current?.node.children && current.node.children.length > 0) {
			// Check if node is expanded
			const isExpanded = current.node.metadata?.expanded !== false;
			if (isExpanded) {
				setFocusedId(current.node.children[0].id);
			}
		}
	}, [focusedId, nodeMap, setFocusedId]);

	const toggleExpand = useCallback(() => {
		if (!focusedId || !onToggleExpand) return;

		const current = nodeMap.get(focusedId);
		if (current?.node.children && current.node.children.length > 0) {
			onToggleExpand(current.node);
		}
	}, [focusedId, nodeMap, onToggleExpand]);

	const deleteNodes = useCallback(() => {
		if (!onDeleteNodes) return;

		const idsToDelete: string[] = [];

		// If nodes are selected, delete selected nodes
		if (selectedIdsRef.current.size > 0) {
			selectedIdsRef.current.forEach((id) => idsToDelete.push(id));
		} else if (focusedId) {
			// Otherwise delete focused node
			idsToDelete.push(focusedId);
		}

		if (idsToDelete.length > 0) {
			onDeleteNodes(idsToDelete);

			// Move focus to next or previous node
			if (focusedId && idsToDelete.includes(focusedId)) {
				const current = nodeMap.get(focusedId);
				if (current) {
					const nextIndex = current.index + 1;
					const prevIndex = current.index - 1;

					if (nextIndex < flattenedNodes.length) {
						const nextNode = flattenedNodes[nextIndex];
						if (!idsToDelete.includes(nextNode.node.id)) {
							setFocusedId(nextNode.node.id);
							return;
						}
					}

					if (prevIndex >= 0) {
						const prevNode = flattenedNodes[prevIndex];
						if (!idsToDelete.includes(prevNode.node.id)) {
							setFocusedId(prevNode.node.id);
							return;
						}
					}
				}
				setFocusedId(undefined);
			}
		}
	}, [onDeleteNodes, focusedId, nodeMap, flattenedNodes, setFocusedId]);

	const selectFocused = useCallback(
		(selectOptions?: { ctrlKey?: boolean; shiftKey?: boolean }) => {
			if (!focusedId || !onSelectionChange) return;

			onSelectionChange(focusedId, {
				ctrlKey: selectOptions?.ctrlKey ?? false,
				shiftKey: selectOptions?.shiftKey ?? false,
			});
		},
		[focusedId, onSelectionChange]
	);

	const focusFirst = useCallback(() => {
		if (flattenedNodes.length > 0) {
			setFocusedId(flattenedNodes[0].node.id);
		}
	}, [flattenedNodes, setFocusedId]);

	const focusLast = useCallback(() => {
		if (flattenedNodes.length > 0) {
			setFocusedId(flattenedNodes[flattenedNodes.length - 1].node.id);
		}
	}, [flattenedNodes, setFocusedId]);

	const toggleHelp = useCallback(() => {
		setIsHelpOpen((prev) => !prev);
	}, []);

	const closeHelp = useCallback(() => {
		setIsHelpOpen(false);
	}, []);

	// Main keyboard event handler
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent | KeyboardEvent) => {
			if (!enabled) return;

			// Don't handle if target is an input/textarea
			const target = event.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
				return;
			}

			let handled = false;

			switch (event.key) {
				case 'ArrowUp':
					navigatePrevious();
					handled = true;
					break;

				case 'ArrowDown':
					navigateNext();
					handled = true;
					break;

				case 'ArrowLeft': {
					if (!focusedId) break;
					const current = nodeMap.get(focusedId);
					if (current?.flatNode.hasChildren && current.flatNode.isExpanded) {
						// Collapse if expanded and has children
						toggleExpand();
					} else {
						// Navigate to parent
						navigateToParent();
					}
					handled = true;
					break;
				}

				case 'ArrowRight': {
					if (!focusedId) break;
					const current = nodeMap.get(focusedId);
					if (current?.flatNode.hasChildren) {
						if (!current.flatNode.isExpanded) {
							// Expand if collapsed
							toggleExpand();
						} else {
							// Navigate to first child
							navigateToFirstChild();
						}
					}
					handled = true;
					break;
				}

				case 'Enter':
					toggleExpand();
					handled = true;
					break;

				case ' ':
					selectFocused({ ctrlKey: event.ctrlKey, shiftKey: event.shiftKey });
					handled = true;
					break;

				case 'Delete':
				case 'Backspace':
					deleteNodes();
					handled = true;
					break;

				case 'Tab':
					if (event.shiftKey) {
						navigatePrevious();
					} else {
						navigateNext();
					}
					handled = true;
					break;

				case 'Home':
					focusFirst();
					handled = true;
					break;

				case 'End':
					focusLast();
					handled = true;
					break;

				case '?':
					toggleHelp();
					handled = true;
					break;

				case 'Escape':
					if (isHelpOpen) {
						closeHelp();
						handled = true;
					}
					break;

				default:
					break;
			}

			if (handled && preventDefault) {
				event.preventDefault();
				event.stopPropagation();
			}
		},
		[
			enabled,
			focusedId,
			nodeMap,
			isHelpOpen,
			preventDefault,
			navigatePrevious,
			navigateNext,
			navigateToParent,
			navigateToFirstChild,
			toggleExpand,
			selectFocused,
			deleteNodes,
			focusFirst,
			focusLast,
			toggleHelp,
			closeHelp,
		]
	);

	// Attach keyboard event listener to container if provided
	useEffect(() => {
		if (!enabled || !containerRef?.current) return;

		const container = containerRef.current;

		const listener = (event: KeyboardEvent) => {
			handleKeyDown(event);
		};

		container.addEventListener('keydown', listener);

		return () => {
			container.removeEventListener('keydown', listener);
		};
	}, [enabled, containerRef, handleKeyDown]);

	// Container props for spreading on the tree container
	const containerProps = useMemo(
		() => ({
			'aria-activedescendant': focusedId,
			onKeyDown: handleKeyDown as (event: React.KeyboardEvent) => void,
			role: 'tree',
			tabIndex: 0,
		}),
		[focusedId, handleKeyDown]
	);

	return {
		actions: {
			closeHelp,
			deleteNodes,
			focusFirst,
			focusLast,
			handleKeyDown,
			navigateNext,
			navigatePrevious,
			navigateToFirstChild,
			navigateToParent,
			selectFocused,
			setFocusedId,
			toggleExpand,
			toggleHelp,
		},
		containerProps,
		state: {
			focusedId,
			isHelpOpen,
		},
	};
}

export default useTreeKeyboardNavigation;
