/**
 * Tree Flattening Utilities
 *
 * Utilities for flattening hierarchical tree structures into 1D arrays
 * for use with virtualized list rendering.
 */
import { type TreeNode } from '../types/TreeNode';

/**
 * Represents a flattened node with rendering context.
 */
export interface FlattenedNode {
	/** The original tree node */
	node: TreeNode;
	/** Depth level for indentation */
	depth: number;
	/** Whether this node has children */
	hasChildren: boolean;
	/** Whether this node is expanded (only relevant if hasChildren) */
	isExpanded: boolean;
	/** Unique key for React rendering */
	key: string;
}

/**
 * Flattens a tree structure into a 1D array for virtualized rendering.
 * Only includes visible nodes (respects expanded/collapsed state).
 *
 * @param nodes - Array of root-level tree nodes
 * @returns Flattened array of nodes with rendering context
 *
 * @example
 * ```ts
 * const flatNodes = flattenTree(treeNodes);
 * // Returns array of FlattenedNode objects in DFS order
 * // Only includes nodes that are visible (parent is expanded)
 * ```
 */
export function flattenTree(nodes: TreeNode[]): FlattenedNode[] {
	const result: FlattenedNode[] = [];

	function traverse(node: TreeNode, depth: number) {
		const hasChildren = Boolean(node.children && node.children.length > 0);
		const isExpanded = node.metadata?.expanded !== false;

		result.push({
			depth,
			hasChildren,
			isExpanded,
			key: node.id,
			node,
		});

		// Only traverse children if expanded
		if (hasChildren && isExpanded && node.children) {
			for (const child of node.children) {
				traverse(child, depth + 1);
			}
		}
	}

	for (const node of nodes) {
		traverse(node, node.depth);
	}

	return result;
}

/**
 * Counts total visible nodes in a tree (respecting expand/collapse state).
 *
 * @param nodes - Array of root-level tree nodes
 * @returns Count of visible nodes
 *
 * @example
 * ```ts
 * const count = countVisibleNodes(treeNodes);
 * console.log(`${count} nodes are currently visible`);
 * ```
 */
export function countVisibleNodes(nodes: TreeNode[]): number {
	let count = 0;

	function traverse(node: TreeNode) {
		count++;
		const isExpanded = node.metadata?.expanded !== false;
		if (isExpanded && node.children) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	}

	for (const node of nodes) {
		traverse(node);
	}

	return count;
}
