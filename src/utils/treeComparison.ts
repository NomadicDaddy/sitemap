/**
 * Tree Comparison Utilities
 *
 * Provides functions for comparing two tree structures and identifying differences.
 * Supports detecting added, removed, and modified nodes with detailed change tracking.
 */
import type {
	ComparisonOptions,
	ComparisonResult,
	ComparisonSummary,
	DiffType,
	NodeDifference,
	PropertyChange,
	TreeNode,
} from '../types/TreeNode';

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_COMPARISON_OPTIONS: Required<ComparisonOptions> = {
	compareMetadata: true,
	comparePosition: false,
	ignoreProperties: ['lineNumber', 'expanded'],
	matchNodes: (base, compare) => base.id === compare.id,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Counts total nodes in a tree.
 */
function countNodes(nodes: TreeNode[]): number {
	let count = 0;

	function traverse(nodeList: TreeNode[]): void {
		for (const node of nodeList) {
			count++;
			if (node.children) {
				traverse(node.children);
			}
		}
	}

	traverse(nodes);
	return count;
}

/**
 * Gets all node IDs from a tree.
 */
function getAllNodeIds(nodes: TreeNode[]): Set<string> {
	const ids = new Set<string>();

	function traverse(nodeList: TreeNode[]): void {
		for (const node of nodeList) {
			ids.add(node.id);
			if (node.children) {
				traverse(node.children);
			}
		}
	}

	traverse(nodes);
	return ids;
}

/**
 * Compares two values for equality.
 */
function areValuesEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a === null || b === null) return false;
	if (typeof a !== typeof b) return false;

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((val, idx) => areValuesEqual(val, b[idx]));
	}

	if (typeof a === 'object' && typeof b === 'object') {
		const aKeys = Object.keys(a as Record<string, unknown>);
		const bKeys = Object.keys(b as Record<string, unknown>);
		if (aKeys.length !== bKeys.length) return false;
		return aKeys.every((key) =>
			areValuesEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
		);
	}

	return false;
}

/**
 * Compares two nodes and returns the property changes.
 */
function compareNodeProperties(
	baseNode: TreeNode,
	targetNode: TreeNode,
	options: Required<ComparisonOptions>
): PropertyChange[] {
	const changes: PropertyChange[] = [];
	const ignoreSet = new Set(options.ignoreProperties);

	// Compare label
	if (baseNode.label !== targetNode.label) {
		changes.push({
			newValue: targetNode.label,
			oldValue: baseNode.label,
			property: 'label',
		});
	}

	// Compare depth
	if (baseNode.depth !== targetNode.depth) {
		changes.push({
			newValue: targetNode.depth,
			oldValue: baseNode.depth,
			property: 'depth',
		});
	}

	// Compare metadata if enabled
	if (options.compareMetadata) {
		const baseMetadata = baseNode.metadata ?? {};
		const targetMetadata = targetNode.metadata ?? {};

		const allMetadataKeys = new Set([
			...Object.keys(baseMetadata),
			...Object.keys(targetMetadata),
		]);

		for (const key of allMetadataKeys) {
			if (ignoreSet.has(key)) continue;

			const baseValue = baseMetadata[key];
			const targetValue = targetMetadata[key];

			if (!areValuesEqual(baseValue, targetValue)) {
				changes.push({
					newValue: targetValue,
					oldValue: baseValue,
					property: `metadata.${key}`,
				});
			}
		}
	}

	return changes;
}

// ============================================================================
// Core Comparison Function
// ============================================================================

/**
 * Internal function to compare nodes recursively.
 */
function diffNodes(
	baseNode: TreeNode | undefined,
	targetNode: TreeNode | undefined,
	options: Required<ComparisonOptions>,
	path: string[] = []
): NodeDifference {
	const id = baseNode?.id ?? targetNode?.id ?? 'unknown';
	const currentPath = [...path, id];

	// Node was added
	if (!baseNode && targetNode) {
		const childDiffs = (targetNode.children ?? []).map((child) =>
			diffNodes(undefined, child, options, currentPath)
		);

		return {
			childDifferences: childDiffs.length > 0 ? childDiffs : undefined,
			compareNode: targetNode,
			id,
			path: currentPath,
			type: 'added',
		};
	}

	// Node was removed
	if (baseNode && !targetNode) {
		const childDiffs = (baseNode.children ?? []).map((child) =>
			diffNodes(child, undefined, options, currentPath)
		);

		return {
			baseNode,
			childDifferences: childDiffs.length > 0 ? childDiffs : undefined,
			id,
			path: currentPath,
			type: 'removed',
		};
	}

	// Both nodes exist - compare them
	if (baseNode && targetNode) {
		const changes = compareNodeProperties(baseNode, targetNode, options);

		// Build map for target children
		const targetChildMap = new Map((targetNode.children ?? []).map((n) => [n.id, n]));

		const childDifferences: NodeDifference[] = [];
		const processedIds = new Set<string>();

		// Process base children
		for (const baseChild of baseNode.children ?? []) {
			const targetChild = targetChildMap.get(baseChild.id);
			childDifferences.push(diffNodes(baseChild, targetChild, options, currentPath));
			processedIds.add(baseChild.id);
		}

		// Process added children (in target but not in base)
		for (const targetChild of targetNode.children ?? []) {
			if (!processedIds.has(targetChild.id)) {
				childDifferences.push(diffNodes(undefined, targetChild, options, currentPath));
			}
		}

		const hasChanges = changes.length > 0;
		const hasChildChanges = childDifferences.some((d) => d.type !== 'unchanged');

		const type: DiffType = hasChanges ? 'modified' : 'unchanged';

		return {
			baseNode,
			changes: hasChanges ? changes : undefined,
			childDifferences:
				hasChildChanges || childDifferences.length > 0 ? childDifferences : undefined,
			compareNode: targetNode,
			id,
			path: currentPath,
			type,
		};
	}

	// Should not reach here
	return {
		id,
		path: currentPath,
		type: 'unchanged',
	};
}

/**
 * Collects all differences into flat sets for easy lookup.
 */
function collectDifferenceIds(differences: NodeDifference[]): {
	addedIds: Set<string>;
	removedIds: Set<string>;
	modifiedIds: Set<string>;
	unchangedIds: Set<string>;
} {
	const addedIds = new Set<string>();
	const removedIds = new Set<string>();
	const modifiedIds = new Set<string>();
	const unchangedIds = new Set<string>();

	function traverse(diffs: NodeDifference[]): void {
		for (const diff of diffs) {
			switch (diff.type) {
				case 'added':
					addedIds.add(diff.id);
					break;
				case 'removed':
					removedIds.add(diff.id);
					break;
				case 'modified':
					modifiedIds.add(diff.id);
					break;
				case 'unchanged':
					unchangedIds.add(diff.id);
					break;
			}

			if (diff.childDifferences) {
				traverse(diff.childDifferences);
			}
		}
	}

	traverse(differences);
	return { addedIds, modifiedIds, removedIds, unchangedIds };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Compares two tree structures and returns a detailed comparison result.
 *
 * @param baseTree - The base/original tree (left side in diff view)
 * @param compareTree - The compare/new tree (right side in diff view)
 * @param options - Comparison options
 * @returns Detailed comparison result with all differences
 *
 * @example
 * ```typescript
 * const result = compareTrees(oldTree, newTree);
 * console.log(`Added: ${result.summary.addedCount}`);
 * console.log(`Removed: ${result.summary.removedCount}`);
 * console.log(`Modified: ${result.summary.modifiedCount}`);
 * ```
 */
export function compareTrees(
	baseTree: TreeNode[],
	compareTree: TreeNode[],
	options: ComparisonOptions = {}
): ComparisonResult {
	const mergedOptions: Required<ComparisonOptions> = {
		...DEFAULT_COMPARISON_OPTIONS,
		...options,
	};

	// Build map for compare tree roots
	const compareMap = new Map(compareTree.map((n) => [n.id, n]));

	const differences: NodeDifference[] = [];
	const processedIds = new Set<string>();

	// Process base roots
	for (const baseNode of baseTree) {
		const targetNode = compareMap.get(baseNode.id);
		differences.push(diffNodes(baseNode, targetNode, mergedOptions, []));
		processedIds.add(baseNode.id);
	}

	// Process added roots (in compare but not in base)
	for (const targetNode of compareTree) {
		if (!processedIds.has(targetNode.id)) {
			differences.push(diffNodes(undefined, targetNode, mergedOptions, []));
		}
	}

	// Collect IDs by type
	const { addedIds, removedIds, modifiedIds, unchangedIds } = collectDifferenceIds(differences);

	// Calculate summary
	const baseNodeCount = countNodes(baseTree);
	const compareNodeCount = countNodes(compareTree);
	const totalUnique = new Set([...getAllNodeIds(baseTree), ...getAllNodeIds(compareTree)]).size;
	const similarityPercentage =
		totalUnique > 0 ? Math.round((unchangedIds.size / totalUnique) * 100) : 100;

	const summary: ComparisonSummary = {
		addedCount: addedIds.size,
		baseNodeCount,
		compareNodeCount,
		modifiedCount: modifiedIds.size,
		removedCount: removedIds.size,
		similarityPercentage,
		unchangedCount: unchangedIds.size,
	};

	return {
		addedNodeIds: addedIds,
		differences,
		matchingNodeIds: unchangedIds,
		modifiedNodeIds: modifiedIds,
		removedNodeIds: removedIds,
		summary,
	};
}

/**
 * Creates a flat list of all differences for easier iteration.
 *
 * @param result - Comparison result from compareTrees
 * @returns Flat array of all node differences
 */
export function flattenDifferences(result: ComparisonResult): NodeDifference[] {
	const flat: NodeDifference[] = [];

	function traverse(diffs: NodeDifference[]): void {
		for (const diff of diffs) {
			flat.push(diff);
			if (diff.childDifferences) {
				traverse(diff.childDifferences);
			}
		}
	}

	traverse(result.differences);
	return flat;
}

/**
 * Filters differences to only include changed nodes (not unchanged).
 *
 * @param result - Comparison result from compareTrees
 * @returns Array of only changed (added, removed, modified) differences
 */
export function getChangedNodes(result: ComparisonResult): NodeDifference[] {
	return flattenDifferences(result).filter((d) => d.type !== 'unchanged');
}

/**
 * Gets a human-readable description of a difference.
 *
 * @param diff - The node difference
 * @returns Human-readable description
 */
export function describeDifference(diff: NodeDifference): string {
	const nodeName = diff.baseNode?.label ?? diff.compareNode?.label ?? 'Unknown';

	switch (diff.type) {
		case 'added':
			return `Added: "${nodeName}"`;
		case 'removed':
			return `Removed: "${nodeName}"`;
		case 'modified': {
			const changeDescriptions = diff.changes?.map((c) => {
				if (c.property === 'label') {
					return `renamed from "${c.oldValue}" to "${c.newValue}"`;
				}
				return `${c.property} changed`;
			});
			return `Modified: "${nodeName}" (${changeDescriptions?.join(', ') ?? 'changes'})`;
		}
		case 'unchanged':
			return `Unchanged: "${nodeName}"`;
		default:
			return `${diff.type}: "${nodeName}"`;
	}
}

/**
 * Checks if two trees are identical.
 *
 * @param baseTree - First tree
 * @param compareTree - Second tree
 * @param options - Comparison options
 * @returns True if trees are identical
 */
export function areTreesIdentical(
	baseTree: TreeNode[],
	compareTree: TreeNode[],
	options: ComparisonOptions = {}
): boolean {
	const result = compareTrees(baseTree, compareTree, options);
	return (
		result.summary.addedCount === 0 &&
		result.summary.removedCount === 0 &&
		result.summary.modifiedCount === 0
	);
}

/**
 * Creates a hash string for a tree node (useful for quick comparison).
 *
 * @param node - The node to hash
 * @param includeChildren - Whether to include children in hash
 * @returns Hash string representing the node
 */
export function hashNode(node: TreeNode, includeChildren = true): string {
	const parts = [node.id, node.label, String(node.depth)];

	if (node.metadata) {
		const metaKeys = Object.keys(node.metadata).sort();
		for (const key of metaKeys) {
			if (key !== 'expanded' && key !== 'lineNumber') {
				parts.push(`${key}:${JSON.stringify(node.metadata[key])}`);
			}
		}
	}

	if (includeChildren && node.children) {
		for (const child of node.children) {
			parts.push(hashNode(child, true));
		}
	}

	return parts.join('|');
}

/**
 * Creates a hash for an entire tree.
 *
 * @param nodes - Root nodes of the tree
 * @returns Hash string for the entire tree
 */
export function hashTree(nodes: TreeNode[]): string {
	return nodes.map((n) => hashNode(n, true)).join('||');
}

export default compareTrees;
