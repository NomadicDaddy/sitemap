import { type TreeNode } from '../types/TreeNode';

/**
 * Clipboard buffer for copy/paste operations
 */
interface ClipboardBuffer {
	nodes: TreeNode[];
	timestamp: number;
}

let clipboard: ClipboardBuffer | null = null;

/**
 * Deep clone a tree node and its children with new IDs
 */
function cloneNodeWithNewIds(node: TreeNode, idPrefix: string = '', depth: number = 0): TreeNode {
	const newId = `${idPrefix}copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const cloned: TreeNode = {
		...node,
		children: node.children
			? node.children.map((child) => cloneNodeWithNewIds(child, idPrefix, depth + 1))
			: undefined,
		depth,
		id: newId,
		metadata: node.metadata ? { ...node.metadata } : undefined,
	};

	return cloned;
}

/**
 * Copy nodes to internal clipboard buffer
 *
 * @param nodes - Array of tree nodes to copy
 * @returns The copied nodes
 */
export function copyNodes(nodes: TreeNode[]): TreeNode[] {
	if (nodes.length === 0) {
		return [];
	}

	// Clone nodes with new IDs to avoid conflicts when pasting
	const copiedNodes = nodes.map((node) => cloneNodeWithNewIds(node));

	// Store in clipboard buffer
	clipboard = {
		nodes: copiedNodes,
		timestamp: Date.now(),
	};

	return copiedNodes;
}

/**
 * Get nodes from clipboard buffer
 *
 * @returns The clipboard nodes or null if clipboard is empty
 */
export function getClipboardNodes(): TreeNode[] | null {
	if (!clipboard) {
		return null;
	}

	// Check if clipboard is too old (5 minutes)
	const MAX_CLIPBOARD_AGE = 5 * 60 * 1000;
	if (Date.now() - clipboard.timestamp > MAX_CLIPBOARD_AGE) {
		clipboard = null;
		return null;
	}

	return clipboard.nodes;
}

/**
 * Clear the clipboard buffer
 */
export function clearClipboard(): void {
	clipboard = null;
}

/**
 * Check if clipboard has nodes available for paste
 *
 * @returns true if clipboard contains nodes
 */
export function hasClipboardNodes(): boolean {
	return clipboard !== null;
}

/**
 * Paste nodes into a tree at a specified location
 *
 * @param treeNodes - Current tree nodes
 * @param nodesToPaste - Nodes to paste (from clipboard)
 * @param targetId - ID of target node (where to paste)
 * @param position - Position relative to target ('before', 'after', 'inside')
 * @returns Updated tree with pasted nodes
 */
export function pasteNodes(
	treeNodes: TreeNode[],
	nodesToPaste: TreeNode[],
	targetId?: string,
	position: 'before' | 'after' | 'inside' = 'inside'
): TreeNode[] {
	if (nodesToPaste.length === 0) {
		return treeNodes;
	}

	// Clone nodes again when pasting to avoid sharing references
	const clonedNodes = nodesToPaste.map((node) => cloneNodeWithNewIds(node, 'paste-'));

	// If no target specified, append to roots
	if (!targetId) {
		return [...treeNodes, ...clonedNodes];
	}

	// Find target node
	const targetNode = findNodeById(treeNodes, targetId);
	if (!targetNode) {
		return treeNodes;
	}

	// Insert at specified position
	return insertNodes(treeNodes, targetId, position, clonedNodes);
}

/**
 * Find a node in the tree by ID
 */
function findNodeById(nodes: TreeNode[], id: string): TreeNode | undefined {
	const stack = [...nodes];
	while (stack.length > 0) {
		const current = stack.shift();
		if (!current) continue;

		if (current.id === id) {
			return current;
		}

		if (current.children) {
			stack.push(...current.children);
		}
	}
	return undefined;
}

/**
 * Insert nodes at a specific position relative to a target node
 */
function insertNodes(
	treeNodes: TreeNode[],
	targetId: string,
	position: 'before' | 'after' | 'inside',
	nodesToInsert: TreeNode[]
): TreeNode[] {
	const result: TreeNode[] = [];

	for (let i = 0; i < treeNodes.length; i++) {
		const node = treeNodes[i];

		if (node.id === targetId) {
			if (position === 'before') {
				result.push(...nodesToInsert);
				result.push(node);
			} else if (position === 'after') {
				result.push(node);
				result.push(...nodesToInsert);
			} else {
				// inside - add as children
				const children = node.children
					? [...node.children, ...nodesToInsert]
					: nodesToInsert;
				result.push({ ...node, children });
			}
		} else if (node.children) {
			const newChildren = insertNodes(node.children, targetId, position, nodesToInsert);
			result.push({ ...node, children: newChildren });
		} else {
			result.push(node);
		}
	}

	return result;
}
