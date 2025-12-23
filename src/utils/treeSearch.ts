/**
 * Tree Search Utilities
 *
 * Provides functions for searching, filtering, and highlighting nodes in a tree structure.
 * Supports searching by label text, tags, and metadata properties with real-time filtering.
 *
 * @example
 * ```tsx
 * import { searchTree, filterTreeByMatches, highlightMatches } from './utils/treeSearch';
 *
 * const results = searchTree(nodes, 'home', { searchFields: ['label', 'tags'] });
 * const filteredTree = filterTreeByMatches(nodes, results.matchingIds);
 * ```
 */
import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Types
// ============================================================================

/**
 * Options for configuring tree search behavior.
 */
export interface SearchOptions {
	/** Fields to search in (default: ['label']) */
	searchFields?: SearchField[];

	/** Whether to use case-sensitive matching (default: false) */
	caseSensitive?: boolean;

	/** Whether to use exact match instead of partial match (default: false) */
	exactMatch?: boolean;

	/** Maximum depth to search (undefined = no limit) */
	maxDepth?: number;
}

/**
 * Fields that can be searched within a node.
 */
export type SearchField = 'label' | 'tags' | 'properties' | 'category';

/**
 * Result of a tree search operation.
 */
export interface SearchResult {
	/** IDs of nodes that directly match the search query */
	matchingIds: Set<string>;

	/** IDs of all nodes in the path to matching nodes (ancestors) */
	ancestorIds: Set<string>;

	/** Total number of matches found */
	matchCount: number;

	/** The search query used */
	query: string;

	/** Map of node ID to matching field info for highlighting */
	matchDetails: Map<string, MatchDetail[]>;
}

/**
 * Details about a match within a specific node.
 */
export interface MatchDetail {
	/** The field where the match was found */
	field: SearchField;

	/** The matched text */
	matchedText: string;

	/** Start index of the match in the original text */
	startIndex: number;

	/** End index of the match in the original text */
	endIndex: number;
}

/**
 * Default search options.
 */
export const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
	caseSensitive: false,
	exactMatch: false,
	maxDepth: undefined as unknown as number,
	searchFields: ['label'],
};

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Searches a tree for nodes matching the given query.
 *
 * @param nodes - The tree nodes to search
 * @param query - The search query string
 * @param options - Search configuration options
 * @returns SearchResult containing matching node IDs and match details
 *
 * @example
 * ```tsx
 * const result = searchTree(nodes, 'home');
 * console.log(`Found ${result.matchCount} matches`);
 * ```
 */
export function searchTree(
	nodes: TreeNode[],
	query: string,
	options: SearchOptions = {}
): SearchResult {
	const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
	const matchingIds = new Set<string>();
	const ancestorIds = new Set<string>();
	const matchDetails = new Map<string, MatchDetail[]>();

	// Empty query returns no matches
	if (!query.trim()) {
		return {
			ancestorIds,
			matchCount: 0,
			matchDetails,
			matchingIds,
			query,
		};
	}

	const normalizedQuery = opts.caseSensitive ? query : query.toLowerCase();

	/**
	 * Recursively search through the tree.
	 * Returns true if this node or any descendant matches.
	 */
	function traverse(node: TreeNode, ancestors: string[], depth: number): boolean {
		// Check max depth
		if (opts.maxDepth !== undefined && depth > opts.maxDepth) {
			return false;
		}

		let hasMatch = false;
		const nodeMatches: MatchDetail[] = [];

		// Check each search field
		for (const field of opts.searchFields) {
			const fieldMatches = searchField(node, field, normalizedQuery, opts);
			if (fieldMatches.length > 0) {
				hasMatch = true;
				nodeMatches.push(...fieldMatches);
			}
		}

		// If this node matches, add it and all ancestors
		if (hasMatch) {
			matchingIds.add(node.id);
			matchDetails.set(node.id, nodeMatches);
			ancestors.forEach((id) => ancestorIds.add(id));
		}

		// Check children
		let hasMatchingDescendant = false;
		if (node.children) {
			for (const child of node.children) {
				const childHasMatch = traverse(child, [...ancestors, node.id], depth + 1);
				if (childHasMatch) {
					hasMatchingDescendant = true;
				}
			}
		}

		// If a descendant matches, this node is an ancestor
		if (hasMatchingDescendant && !matchingIds.has(node.id)) {
			ancestorIds.add(node.id);
		}

		return hasMatch || hasMatchingDescendant;
	}

	// Start traversal from root nodes
	for (const node of nodes) {
		traverse(node, [], 0);
	}

	return {
		ancestorIds,
		matchCount: matchingIds.size,
		matchDetails,
		matchingIds,
		query,
	};
}

/**
 * Search a specific field of a node for matches.
 */
function searchField(
	node: TreeNode,
	field: SearchField,
	normalizedQuery: string,
	opts: Required<SearchOptions>
): MatchDetail[] {
	const matches: MatchDetail[] = [];

	switch (field) {
		case 'label': {
			const labelMatches = findMatches(node.label, normalizedQuery, field, opts);
			matches.push(...labelMatches);
			break;
		}

		case 'tags': {
			const tags = node.metadata?.tags;
			if (tags && Array.isArray(tags)) {
				for (const tag of tags) {
					const tagMatches = findMatches(tag, normalizedQuery, field, opts);
					matches.push(...tagMatches);
				}
			}
			break;
		}

		case 'category': {
			const category = node.metadata?.category;
			if (category && typeof category === 'string') {
				const categoryMatches = findMatches(category, normalizedQuery, field, opts);
				matches.push(...categoryMatches);
			}
			break;
		}

		case 'properties': {
			const metadata = node.metadata;
			if (metadata) {
				// Search through all metadata properties (except known ones)
				const knownKeys = new Set(['category', 'lineNumber', 'expanded', 'style', 'tags']);
				for (const [key, value] of Object.entries(metadata)) {
					if (!knownKeys.has(key) && value !== undefined) {
						const stringValue = String(value);
						const propMatches = findMatches(stringValue, normalizedQuery, field, opts);
						matches.push(...propMatches);
					}
				}
			}
			break;
		}
	}

	return matches;
}

/**
 * Find all matches of a query within a text string.
 */
function findMatches(
	text: string,
	normalizedQuery: string,
	field: SearchField,
	opts: Required<SearchOptions>
): MatchDetail[] {
	const matches: MatchDetail[] = [];
	const normalizedText = opts.caseSensitive ? text : text.toLowerCase();

	if (opts.exactMatch) {
		// Exact match: the entire text must equal the query
		if (normalizedText === normalizedQuery) {
			matches.push({
				endIndex: text.length,
				field,
				matchedText: text,
				startIndex: 0,
			});
		}
	} else {
		// Partial match: find all occurrences
		let startIndex = 0;
		let foundIndex: number;

		while ((foundIndex = normalizedText.indexOf(normalizedQuery, startIndex)) !== -1) {
			matches.push({
				endIndex: foundIndex + normalizedQuery.length,
				field,
				matchedText: text.substring(foundIndex, foundIndex + normalizedQuery.length),
				startIndex: foundIndex,
			});
			startIndex = foundIndex + 1;
		}
	}

	return matches;
}

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Filters a tree to only include matching nodes and their ancestors.
 * Non-matching branches are removed from the tree.
 *
 * @param nodes - The tree nodes to filter
 * @param matchingIds - Set of node IDs that match the search
 * @param ancestorIds - Set of ancestor node IDs (optional, will be computed if not provided)
 * @returns A new tree containing only matching nodes and their ancestors
 *
 * @example
 * ```tsx
 * const result = searchTree(nodes, 'home');
 * const filtered = filterTreeByMatches(nodes, result.matchingIds, result.ancestorIds);
 * ```
 */
export function filterTreeByMatches(
	nodes: TreeNode[],
	matchingIds: Set<string>,
	ancestorIds?: Set<string>
): TreeNode[] {
	// If no matches, return empty tree
	if (matchingIds.size === 0) {
		return [];
	}

	const allRelevantIds = new Set([...matchingIds, ...(ancestorIds ?? [])]);

	function filterNode(node: TreeNode): TreeNode | null {
		// If this node is not relevant, skip it
		if (!allRelevantIds.has(node.id)) {
			return null;
		}

		// Filter children recursively
		const filteredChildren = node.children
			?.map(filterNode)
			.filter((child): child is TreeNode => child !== null);

		// Return node with filtered children
		return {
			...node,
			children:
				filteredChildren && filteredChildren.length > 0 ? filteredChildren : undefined,
			// Ensure filtered nodes are expanded so matches are visible
			metadata: {
				...node.metadata,
				expanded: true,
			},
		};
	}

	return nodes.map(filterNode).filter((node): node is TreeNode => node !== null);
}

/**
 * Marks nodes in a tree with their match status for highlighting.
 * Returns a new tree with metadata indicating match status.
 *
 * @param nodes - The tree nodes to mark
 * @param matchingIds - Set of node IDs that match the search
 * @param ancestorIds - Set of ancestor node IDs
 * @returns A new tree with _searchMatch metadata on nodes
 */
export function markMatchingNodes(
	nodes: TreeNode[],
	matchingIds: Set<string>,
	ancestorIds: Set<string>
): TreeNode[] {
	function markNode(node: TreeNode): TreeNode {
		const isMatch = matchingIds.has(node.id);
		const isAncestor = ancestorIds.has(node.id);
		const isRelevant = isMatch || isAncestor;

		const markedChildren = node.children?.map(markNode);

		return {
			...node,
			children: markedChildren,
			metadata: {
				...node.metadata,

				// Custom search metadata
				_searchIsAncestor: isAncestor && !isMatch,

				_searchIsMatch: isMatch,
				// Expand nodes that are relevant to show matches
				expanded: isRelevant ? true : node.metadata?.expanded,
			},
		};
	}

	return nodes.map(markNode);
}

// ============================================================================
// Highlight Functions
// ============================================================================

/**
 * Configuration for highlight rendering.
 */
export interface HighlightConfig {
	/** CSS class name for highlighted text */
	highlightClassName?: string;

	/** Inline styles for highlighted text */
	highlightStyle?: React.CSSProperties;
}

/**
 * Default highlight styles.
 */
export const DEFAULT_HIGHLIGHT_STYLE: React.CSSProperties = {
	backgroundColor: '#fef08a', // Yellow highlight
	borderRadius: '2px',
	color: '#854d0e',
	fontWeight: 500,
	padding: '0 2px',
};

/**
 * Splits a label into segments for highlighting matched portions.
 *
 * @param label - The label text to process
 * @param matchDetails - Array of match details for this node
 * @returns Array of segments, each marked as matching or not
 */
export function getHighlightSegments(
	label: string,
	matchDetails?: MatchDetail[]
): Array<{ text: string; isMatch: boolean }> {
	// If no matches, return the entire label as non-matching
	if (!matchDetails || matchDetails.length === 0) {
		return [{ isMatch: false, text: label }];
	}

	// Filter to only label matches and sort by start index
	const labelMatches = matchDetails
		.filter((m) => m.field === 'label')
		.sort((a, b) => a.startIndex - b.startIndex);

	if (labelMatches.length === 0) {
		return [{ isMatch: false, text: label }];
	}

	// Merge overlapping matches
	const mergedRanges: Array<{ start: number; end: number }> = [];
	for (const match of labelMatches) {
		const last = mergedRanges[mergedRanges.length - 1];
		if (last && match.startIndex <= last.end) {
			last.end = Math.max(last.end, match.endIndex);
		} else {
			mergedRanges.push({ end: match.endIndex, start: match.startIndex });
		}
	}

	// Build segments
	const segments: Array<{ text: string; isMatch: boolean }> = [];
	let currentIndex = 0;

	for (const range of mergedRanges) {
		// Add non-matching segment before this match
		if (range.start > currentIndex) {
			segments.push({
				isMatch: false,
				text: label.substring(currentIndex, range.start),
			});
		}

		// Add matching segment
		segments.push({
			isMatch: true,
			text: label.substring(range.start, range.end),
		});

		currentIndex = range.end;
	}

	// Add remaining non-matching segment
	if (currentIndex < label.length) {
		segments.push({
			isMatch: false,
			text: label.substring(currentIndex),
		});
	}

	return segments;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Expands all ancestors of matching nodes to ensure matches are visible.
 *
 * @param nodes - The tree nodes
 * @param ancestorIds - Set of ancestor node IDs to expand
 * @returns A new tree with ancestor nodes expanded
 */
export function expandAncestors(nodes: TreeNode[], ancestorIds: Set<string>): TreeNode[] {
	function expandNode(node: TreeNode): TreeNode {
		const shouldExpand = ancestorIds.has(node.id);
		const expandedChildren = node.children?.map(expandNode);

		return {
			...node,
			children: expandedChildren,
			metadata: {
				...node.metadata,
				expanded: shouldExpand ? true : node.metadata?.expanded,
			},
		};
	}

	return nodes.map(expandNode);
}

/**
 * Counts the total number of visible matches in the tree.
 */
export function countVisibleMatches(nodes: TreeNode[], matchingIds: Set<string>): number {
	let count = 0;

	function traverse(node: TreeNode): void {
		if (matchingIds.has(node.id)) {
			count++;
		}

		const isExpanded = node.metadata?.expanded !== false;
		if (node.children && isExpanded) {
			node.children.forEach(traverse);
		}
	}

	nodes.forEach(traverse);
	return count;
}

/**
 * Gets all matching node IDs as an array, preserving tree order.
 */
export function getMatchingNodesInOrder(nodes: TreeNode[], matchingIds: Set<string>): string[] {
	const result: string[] = [];

	function traverse(node: TreeNode): void {
		if (matchingIds.has(node.id)) {
			result.push(node.id);
		}
		if (node.children) {
			node.children.forEach(traverse);
		}
	}

	nodes.forEach(traverse);
	return result;
}

/**
 * Finds the next matching node ID after the given ID.
 * Wraps around to the first match if at the end.
 */
export function getNextMatchId(
	nodes: TreeNode[],
	matchingIds: Set<string>,
	currentId?: string
): string | undefined {
	const orderedMatches = getMatchingNodesInOrder(nodes, matchingIds);
	if (orderedMatches.length === 0) return undefined;

	if (!currentId) {
		return orderedMatches[0];
	}

	const currentIndex = orderedMatches.indexOf(currentId);
	if (currentIndex === -1) {
		return orderedMatches[0];
	}

	const nextIndex = (currentIndex + 1) % orderedMatches.length;
	return orderedMatches[nextIndex];
}

/**
 * Finds the previous matching node ID before the given ID.
 * Wraps around to the last match if at the beginning.
 */
export function getPreviousMatchId(
	nodes: TreeNode[],
	matchingIds: Set<string>,
	currentId?: string
): string | undefined {
	const orderedMatches = getMatchingNodesInOrder(nodes, matchingIds);
	if (orderedMatches.length === 0) return undefined;

	if (!currentId) {
		return orderedMatches[orderedMatches.length - 1];
	}

	const currentIndex = orderedMatches.indexOf(currentId);
	if (currentIndex === -1) {
		return orderedMatches[orderedMatches.length - 1];
	}

	const prevIndex = (currentIndex - 1 + orderedMatches.length) % orderedMatches.length;
	return orderedMatches[prevIndex];
}
