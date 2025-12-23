/**
 * useTreeSearch Hook
 *
 * A custom React hook that provides real-time tree search functionality.
 * Manages search state, performs filtering, and provides navigation between matches.
 *
 * @example
 * ```tsx
 * const {
 *   query,
 *   setQuery,
 *   searchResult,
 *   filteredNodes,
 *   currentMatchIndex,
 *   goToNextMatch,
 *   goToPreviousMatch,
 * } = useTreeSearch(nodes);
 *
 * return (
 *   <div>
 *     <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *     <span>{searchResult.matchCount} matches</span>
 *     <BasicTree nodes={filteredNodes} />
 *   </div>
 * );
 * ```
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type TreeNode } from '../types/TreeNode';
import {
	type MatchDetail,
	type SearchField,
	type SearchOptions,
	type SearchResult,
	expandAncestors,
	filterTreeByMatches,
	getNextMatchId,
	getPreviousMatchId,
	markMatchingNodes,
	searchTree,
} from '../utils/treeSearch';

// ============================================================================
// Types
// ============================================================================

/**
 * Options for the useTreeSearch hook.
 */
export interface UseTreeSearchOptions {
	/** Initial search query */
	initialQuery?: string;

	/** Debounce delay in milliseconds (default: 150) */
	debounceMs?: number;

	/** Search options (fields to search, case sensitivity, etc.) */
	searchOptions?: SearchOptions;

	/** Whether to automatically filter the tree (default: false - shows all nodes with highlighting) */
	autoFilter?: boolean;

	/** Callback when search results change */
	onSearchChange?: (result: SearchResult) => void;

	/** Callback when the current match changes */
	onMatchChange?: (matchId: string | undefined) => void;
}

/**
 * Return type for the useTreeSearch hook.
 */
export interface UseTreeSearchResult {
	/** The current search query */
	query: string;

	/** Set the search query - triggers re-search with debounce */
	setQuery: (value: string) => void;

	/** Handler for input onChange events */
	handleQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

	/** The search result containing matching IDs and details */
	searchResult: SearchResult;

	/** Whether a search is currently active (query is not empty) */
	isSearchActive: boolean;

	/** Whether the search is currently being debounced */
	isSearching: boolean;

	/** The filtered/marked tree nodes based on search */
	filteredNodes: TreeNode[];

	/** The original nodes with match metadata added */
	markedNodes: TreeNode[];

	/** ID of the currently focused match */
	currentMatchId: string | undefined;

	/** 1-based index of the current match */
	currentMatchIndex: number;

	/** Navigate to the next match */
	goToNextMatch: () => void;

	/** Navigate to the previous match */
	goToPreviousMatch: () => void;

	/** Navigate to a specific match by ID */
	goToMatch: (matchId: string) => void;

	/** Clear the search query */
	clearSearch: () => void;

	/** Get highlight segments for a specific node's label */
	getHighlightSegments: (nodeId: string) => Array<{ text: string; isMatch: boolean }>;

	/** Check if a node is a match */
	isMatch: (nodeId: string) => boolean;

	/** Check if a node is an ancestor of a match */
	isAncestor: (nodeId: string) => boolean;

	/** Check if a node is the currently focused match */
	isCurrentMatch: (nodeId: string) => boolean;

	/** Search configuration */
	searchFields: SearchField[];

	/** Update search fields */
	setSearchFields: (fields: SearchField[]) => void;

	/** Whether case-sensitive search is enabled */
	caseSensitive: boolean;

	/** Toggle case sensitivity */
	setCaseSensitive: (value: boolean) => void;
}

/**
 * Empty search result for initialization.
 */
const EMPTY_SEARCH_RESULT: SearchResult = {
	ancestorIds: new Set(),
	matchCount: 0,
	matchDetails: new Map(),
	matchingIds: new Set(),
	query: '',
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for real-time tree search with debouncing and navigation.
 *
 * @param nodes - The tree nodes to search
 * @param options - Configuration options for the hook
 * @returns Object containing search state, results, and control functions
 */
export function useTreeSearch(
	nodes: TreeNode[],
	options: UseTreeSearchOptions = {}
): UseTreeSearchResult {
	const {
		initialQuery = '',
		debounceMs = 150,
		searchOptions: initialSearchOptions = {},
		autoFilter = false,
		onSearchChange,
		onMatchChange,
	} = options;

	// Search query state
	const [query, setQuery] = useState<string>(initialQuery);
	const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);
	const [isSearching, setIsSearching] = useState<boolean>(false);

	// Search options state
	const [searchFields, setSearchFields] = useState<SearchField[]>(
		initialSearchOptions.searchFields ?? ['label']
	);
	const [caseSensitive, setCaseSensitive] = useState<boolean>(
		initialSearchOptions.caseSensitive ?? false
	);

	// Current match navigation state
	const [currentMatchId, setCurrentMatchId] = useState<string | undefined>();

	// Refs for callbacks to avoid stale closures
	const onSearchChangeRef = useRef(onSearchChange);
	const onMatchChangeRef = useRef(onMatchChange);
	onSearchChangeRef.current = onSearchChange;
	onMatchChangeRef.current = onMatchChange;

	// Debounce the search query
	useEffect(() => {
		if (debounceMs <= 0) {
			setDebouncedQuery(query);
			return;
		}

		setIsSearching(true);
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
			setIsSearching(false);
		}, debounceMs);

		return () => {
			clearTimeout(timer);
		};
	}, [query, debounceMs]);

	// Compute search result
	const searchResult = useMemo<SearchResult>(() => {
		if (!debouncedQuery.trim()) {
			return EMPTY_SEARCH_RESULT;
		}

		return searchTree(nodes, debouncedQuery, {
			caseSensitive,
			searchFields,
		});
	}, [nodes, debouncedQuery, searchFields, caseSensitive]);

	// Notify on search result changes
	useEffect(() => {
		if (onSearchChangeRef.current && debouncedQuery) {
			onSearchChangeRef.current(searchResult);
		}
	}, [searchResult, debouncedQuery]);

	// Reset current match when search results change
	useEffect(() => {
		if (searchResult.matchCount > 0) {
			// Select first match
			const firstMatch = getNextMatchId(nodes, searchResult.matchingIds, undefined);
			setCurrentMatchId(firstMatch);
		} else {
			setCurrentMatchId(undefined);
		}
	}, [searchResult.matchingIds, nodes, searchResult.matchCount]);

	// Notify on current match changes
	useEffect(() => {
		if (onMatchChangeRef.current) {
			onMatchChangeRef.current(currentMatchId);
		}
	}, [currentMatchId]);

	// Compute marked nodes (with search metadata)
	const markedNodes = useMemo<TreeNode[]>(() => {
		if (!debouncedQuery.trim()) {
			return nodes;
		}

		const marked = markMatchingNodes(nodes, searchResult.matchingIds, searchResult.ancestorIds);
		return expandAncestors(marked, searchResult.ancestorIds);
	}, [nodes, debouncedQuery, searchResult]);

	// Compute filtered nodes (only matching branches)
	const filteredNodes = useMemo<TreeNode[]>(() => {
		if (!debouncedQuery.trim()) {
			return nodes;
		}

		if (autoFilter) {
			return filterTreeByMatches(nodes, searchResult.matchingIds, searchResult.ancestorIds);
		}

		return markedNodes;
	}, [nodes, debouncedQuery, autoFilter, searchResult, markedNodes]);

	// Current match index (1-based for display)
	const currentMatchIndex = useMemo<number>(() => {
		if (!currentMatchId || searchResult.matchCount === 0) {
			return 0;
		}

		// Get ordered matches and find current position
		const orderedMatches: string[] = [];
		function traverse(node: TreeNode): void {
			if (searchResult.matchingIds.has(node.id)) {
				orderedMatches.push(node.id);
			}
			if (node.children) {
				node.children.forEach(traverse);
			}
		}
		nodes.forEach(traverse);

		const index = orderedMatches.indexOf(currentMatchId);
		return index >= 0 ? index + 1 : 0;
	}, [currentMatchId, searchResult.matchingIds, searchResult.matchCount, nodes]);

	// Navigation functions
	const goToNextMatch = useCallback(() => {
		const nextId = getNextMatchId(nodes, searchResult.matchingIds, currentMatchId);
		if (nextId) {
			setCurrentMatchId(nextId);
		}
	}, [nodes, searchResult.matchingIds, currentMatchId]);

	const goToPreviousMatch = useCallback(() => {
		const prevId = getPreviousMatchId(nodes, searchResult.matchingIds, currentMatchId);
		if (prevId) {
			setCurrentMatchId(prevId);
		}
	}, [nodes, searchResult.matchingIds, currentMatchId]);

	const goToMatch = useCallback(
		(matchId: string) => {
			if (searchResult.matchingIds.has(matchId)) {
				setCurrentMatchId(matchId);
			}
		},
		[searchResult.matchingIds]
	);

	// Clear search
	const clearSearch = useCallback(() => {
		setQuery('');
		setDebouncedQuery('');
		setCurrentMatchId(undefined);
	}, []);

	// Input handler
	const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	}, []);

	// Helper functions
	const getHighlightSegmentsForNode = useCallback(
		(nodeId: string): Array<{ text: string; isMatch: boolean }> => {
			const details = searchResult.matchDetails.get(nodeId);
			const node = findNodeById(nodes, nodeId);
			if (!node) {
				return [];
			}

			return getHighlightSegmentsFromDetails(node.label, details);
		},
		[searchResult.matchDetails, nodes]
	);

	const isMatch = useCallback(
		(nodeId: string): boolean => {
			return searchResult.matchingIds.has(nodeId);
		},
		[searchResult.matchingIds]
	);

	const isAncestor = useCallback(
		(nodeId: string): boolean => {
			return searchResult.ancestorIds.has(nodeId);
		},
		[searchResult.ancestorIds]
	);

	const isCurrentMatch = useCallback(
		(nodeId: string): boolean => {
			return currentMatchId === nodeId;
		},
		[currentMatchId]
	);

	const isSearchActive = query.trim().length > 0;

	return {
		caseSensitive,
		clearSearch,
		currentMatchId,
		currentMatchIndex,
		filteredNodes,
		getHighlightSegments: getHighlightSegmentsForNode,
		goToMatch,
		goToNextMatch,
		goToPreviousMatch,
		handleQueryChange,
		isAncestor,
		isCurrentMatch,
		isMatch,
		isSearchActive,
		isSearching,
		markedNodes,
		query,
		searchFields,
		searchResult,
		setCaseSensitive,
		setQuery,
		setSearchFields,
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find a node by ID in the tree.
 */
function findNodeById(nodes: TreeNode[], id: string): TreeNode | undefined {
	for (const node of nodes) {
		if (node.id === id) {
			return node;
		}
		if (node.children) {
			const found = findNodeById(node.children, id);
			if (found) {
				return found;
			}
		}
	}
	return undefined;
}

/**
 * Get highlight segments from match details.
 */
function getHighlightSegmentsFromDetails(
	label: string,
	matchDetails?: MatchDetail[]
): Array<{ text: string; isMatch: boolean }> {
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
		if (range.start > currentIndex) {
			segments.push({
				isMatch: false,
				text: label.substring(currentIndex, range.start),
			});
		}

		segments.push({
			isMatch: true,
			text: label.substring(range.start, range.end),
		});

		currentIndex = range.end;
	}

	if (currentIndex < label.length) {
		segments.push({
			isMatch: false,
			text: label.substring(currentIndex),
		});
	}

	return segments;
}

export default useTreeSearch;
