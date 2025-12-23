/**
 * SearchableTree Component
 *
 * A tree component with integrated search/filter functionality. Combines
 * SelectableTree with SearchPanel and useTreeSearch for a complete search
 * experience including real-time filtering, highlighting, and match navigation.
 *
 * @example
 * ```tsx
 * import { SearchableTree } from './components/SearchableTree';
 *
 * function App() {
 *   return (
 *     <SearchableTree
 *       nodes={treeNodes}
 *       onSelectionChange={(ids) => console.log('Selected:', ids)}
 *     />
 *   );
 * }
 * ```
 */
import React, { memo, useCallback, useMemo } from 'react';

import { type UseTreeSearchOptions, useTreeSearch } from '../hooks/useTreeSearch';
import { type TreeTheme } from '../theme';
import { type SelectionState, type TreeNode } from '../types/TreeNode';
import { type MatchDetail, getHighlightSegments } from '../utils/treeSearch';
import { SearchPanel, type SearchPanelProps } from './SearchPanel';
import { type NodeClickEvent, SelectableTree } from './SelectableTree';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SearchableTree component.
 */
export interface SearchableTreeProps {
	/** Array of root-level tree nodes to render */
	nodes: TreeNode[];

	/** Optional CSS class name for the container */
	className?: string;

	/** Indentation size in pixels per depth level (default: 24) */
	indentSize?: number;

	/** Whether to show depth-based visual indicators (default: true) */
	showDepthIndicators?: boolean;

	/** Whether to show the selection info panel (default: true) */
	showSelectionInfo?: boolean;

	/** Initial set of selected node IDs */
	initialSelectedIds?: Set<string>;

	/** Callback when selection changes */
	onSelectionChange?: (selectedIds: Set<string>, selectionState: SelectionState) => void;

	/** Callback when nodes are reordered via drag-and-drop */
	onTreeReorder?: (nodes: TreeNode[]) => void;

	/** Callback when a node is clicked */
	onNodeClick?: (event: NodeClickEvent) => void;

	/** Whether to allow deselecting by clicking on an already selected node (default: true) */
	allowDeselect?: boolean;

	/** Whether to clear selection when clicking outside nodes (default: false) */
	clearOnClickOutside?: boolean;

	/** Maximum number of nodes that can be selected */
	maxSelections?: number;

	/** Whether to show bulk action controls (default: true) */
	showBulkActions?: boolean;

	/** Callback when bulk delete is confirmed */
	onBulkDelete?: (selectedNodes: TreeNode[]) => void;

	/** Callback when bulk change color is confirmed */
	onBulkChangeColor?: (selectedNodes: TreeNode[], color: string) => void;

	/** Callback when bulk add tag is confirmed */
	onBulkAddTag?: (selectedNodes: TreeNode[], tag: string) => void;

	/** Callback when bulk modify properties is confirmed */
	onBulkModifyProperties?: (
		selectedNodes: TreeNode[],
		properties: Record<string, unknown>
	) => void;

	/** Optional theme overrides */
	theme?: Partial<TreeTheme>;

	/** Aria label for the tree container */
	ariaLabel?: string;

	/** Whether to show export buttons (default: false) */
	showExportButtons?: boolean;

	/** Whether nodes should be collapsible (default: false) */
	collapsible?: boolean;

	/** Callback when a node's expand/collapse state changes */
	onToggleCollapse?: (node: TreeNode) => void;

	// ============================================================================
	// Search Props
	// ============================================================================

	/** Whether to show the search panel (default: true) */
	showSearchPanel?: boolean;

	/** Options for the search functionality */
	searchOptions?: Omit<UseTreeSearchOptions, 'onSearchChange' | 'onMatchChange'>;

	/** Callback when search results change */
	onSearchChange?: UseTreeSearchOptions['onSearchChange'];

	/** Callback when the current match changes */
	onMatchChange?: UseTreeSearchOptions['onMatchChange'];

	/** Props to pass to the SearchPanel component */
	searchPanelProps?: Partial<Omit<SearchPanelProps, 'searchState'>>;

	/** Whether to filter the tree to only show matching nodes (default: false) */
	filterOnSearch?: boolean;

	/** Whether to highlight matching text in node labels (default: true) */
	highlightMatches?: boolean;

	/** Custom highlight styles */
	highlightStyle?: React.CSSProperties;

	// ============================================================================
	// Virtual Scrolling Props
	// ============================================================================

	/** Enable virtual scrolling for large trees */
	enableVirtualization?: boolean;

	/** Height of the virtualized container in pixels */
	virtualHeight?: number;

	/** Width of the virtualized container */
	virtualWidth?: number | string;

	/** Height of each row in pixels for virtualization */
	virtualRowHeight?: number;

	/** Number of items to render above/below the visible area */
	overscanCount?: number;

	// ============================================================================
	// Keyboard Navigation Props
	// ============================================================================

	/** Enable keyboard navigation (default: true) */
	enableKeyboardNavigation?: boolean;

	/** Whether to show the keyboard shortcuts help button */
	showKeyboardShortcutsButton?: boolean;

	/** Callback when nodes are deleted via keyboard */
	onDeleteNodes?: (nodeIds: string[]) => void;

	/** Callback when the focused node changes */
	onFocusChange?: (nodeId: string | undefined) => void;
}

// ============================================================================
// Styles
// ============================================================================

const containerStyles: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: '12px',
};

const defaultHighlightStyle: React.CSSProperties = {
	backgroundColor: '#fef08a',
	borderRadius: '2px',
	color: '#854d0e',
	fontWeight: 500,
	padding: '0 2px',
};

const currentMatchHighlightStyle: React.CSSProperties = {
	...defaultHighlightStyle,
	backgroundColor: '#fbbf24',
	boxShadow: '0 0 0 2px #f59e0b',
};

const ancestorNodeStyle: React.CSSProperties = {
	opacity: 0.7,
};

// ============================================================================
// HighlightedLabel Component
// ============================================================================

interface HighlightedLabelProps {
	label: string;
	matchDetails?: MatchDetail[];
	isCurrentMatch?: boolean;
	highlightStyle?: React.CSSProperties;
}

const HighlightedLabel = memo(function HighlightedLabel({
	label,
	matchDetails,
	isCurrentMatch = false,
	highlightStyle = defaultHighlightStyle,
}: HighlightedLabelProps): React.ReactElement {
	const segments = useMemo(
		() => getHighlightSegments(label, matchDetails),
		[label, matchDetails]
	);

	const currentStyle = isCurrentMatch ? currentMatchHighlightStyle : highlightStyle;

	return (
		<span className="highlighted-label">
			{segments.map((segment, index) =>
				segment.isMatch ? (
					<mark key={index} style={currentStyle} className="search-highlight">
						{segment.text}
					</mark>
				) : (
					<span key={index}>{segment.text}</span>
				)
			)}
		</span>
	);
});

// ============================================================================
// SearchableTree Component
// ============================================================================

/**
 * SearchableTree provides a complete searchable tree experience.
 *
 * Features:
 * - Integrated search panel with real-time filtering
 * - Highlighting of matching text in node labels
 * - Navigation between matches (previous/next)
 * - Support for searching by label, tags, category, and properties
 * - Optional filtering to show only matching branches
 * - Automatic expansion of ancestor nodes to reveal matches
 * - Full SelectableTree functionality (selection, bulk actions, etc.)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SearchableTree nodes={treeNodes} />
 *
 * // With filtering enabled
 * <SearchableTree
 *   nodes={treeNodes}
 *   filterOnSearch={true}
 * />
 *
 * // With custom search options
 * <SearchableTree
 *   nodes={treeNodes}
 *   searchOptions={{
 *     debounceMs: 300,
 *     searchOptions: { searchFields: ['label', 'tags'] },
 *   }}
 * />
 *
 * // Minimal search panel
 * <SearchableTree
 *   nodes={treeNodes}
 *   searchPanelProps={{
 *     showFieldOptions: false,
 *     showCaseSensitiveToggle: false,
 *   }}
 * />
 * ```
 */
export const SearchableTree = memo(function SearchableTree({
	nodes,
	className = '',
	indentSize = 24,
	showDepthIndicators = true,
	showSelectionInfo = true,
	initialSelectedIds,
	onSelectionChange,
	onTreeReorder,
	onNodeClick,
	allowDeselect = true,
	clearOnClickOutside = false,
	maxSelections,
	showBulkActions = true,
	onBulkDelete,
	onBulkChangeColor,
	onBulkAddTag,
	onBulkModifyProperties,
	theme,
	ariaLabel = 'Searchable tree structure',
	showExportButtons = false,
	collapsible = false,
	onToggleCollapse,
	// Search props
	showSearchPanel = true,
	searchOptions = {},
	onSearchChange,
	onMatchChange,
	searchPanelProps = {},
	filterOnSearch = false,
	highlightMatches = true,
	highlightStyle,
	// Virtual scrolling props
	enableVirtualization = false,
	virtualHeight = 600,
	virtualWidth,
	virtualRowHeight = 32,
	overscanCount = 5,
	// Keyboard navigation props
	enableKeyboardNavigation = true,
	showKeyboardShortcutsButton,
	onDeleteNodes,
	onFocusChange,
}: SearchableTreeProps): React.ReactElement {
	// Initialize tree search
	const searchState = useTreeSearch(nodes, {
		...searchOptions,
		autoFilter: filterOnSearch,
		onMatchChange,
		onSearchChange,
	});

	const { filteredNodes, isSearchActive, searchResult, currentMatchId, isMatch, isAncestor } =
		searchState;

	// Use filtered or original nodes based on filter setting
	const displayNodes = isSearchActive ? filteredNodes : nodes;

	// Custom render function for labels with highlighting
	const renderLabelWithHighlight = useCallback(
		(node: TreeNode, isSelected: boolean): React.ReactNode => {
			if (!highlightMatches || !isSearchActive) {
				return (
					<>
						<span className="tree-node-text">{node.label}</span>
						{isSelected && (
							<span
								style={{
									alignItems: 'center',
									backgroundColor: '#dbeafe',
									borderRadius: '4px',
									color: '#1d4ed8',
									display: 'inline-flex',
									fontSize: '11px',
									fontWeight: 500,
									gap: '6px',
									marginLeft: '8px',
									padding: '2px 6px',
								}}>
								Selected
							</span>
						)}
					</>
				);
			}

			const nodeIsMatch = isMatch(node.id);
			const nodeIsAncestor = isAncestor(node.id);
			const nodeIsCurrentMatch = currentMatchId === node.id;
			const matchDetails = nodeIsMatch ? searchResult.matchDetails.get(node.id) : undefined;

			return (
				<span style={nodeIsAncestor && !nodeIsMatch ? ancestorNodeStyle : undefined}>
					<HighlightedLabel
						label={node.label}
						matchDetails={matchDetails}
						isCurrentMatch={nodeIsCurrentMatch}
						highlightStyle={highlightStyle}
					/>
					{isSelected && (
						<span
							style={{
								alignItems: 'center',
								backgroundColor: '#dbeafe',
								borderRadius: '4px',
								color: '#1d4ed8',
								display: 'inline-flex',
								fontSize: '11px',
								fontWeight: 500,
								gap: '6px',
								marginLeft: '8px',
								padding: '2px 6px',
							}}>
							Selected
						</span>
					)}
				</span>
			);
		},
		[
			highlightMatches,
			isSearchActive,
			isMatch,
			isAncestor,
			currentMatchId,
			searchResult.matchDetails,
			highlightStyle,
		]
	);

	return (
		<div className={`searchable-tree ${className}`.trim()} style={containerStyles}>
			{/* Search panel */}
			{showSearchPanel && <SearchPanel searchState={searchState} {...searchPanelProps} />}

			{/* Tree */}
			<SelectableTree
				nodes={displayNodes}
				indentSize={indentSize}
				showDepthIndicators={showDepthIndicators}
				showSelectionInfo={showSelectionInfo}
				initialSelectedIds={initialSelectedIds}
				onSelectionChange={onSelectionChange}
				onTreeReorder={onTreeReorder}
				onNodeClick={onNodeClick}
				renderLabel={
					highlightMatches && isSearchActive ? renderLabelWithHighlight : undefined
				}
				allowDeselect={allowDeselect}
				clearOnClickOutside={clearOnClickOutside}
				maxSelections={maxSelections}
				showBulkActions={showBulkActions}
				onBulkDelete={onBulkDelete}
				onBulkChangeColor={onBulkChangeColor}
				onBulkAddTag={onBulkAddTag}
				onBulkModifyProperties={onBulkModifyProperties}
				theme={theme}
				ariaLabel={ariaLabel}
				showExportButtons={showExportButtons}
				collapsible={collapsible}
				onToggleCollapse={onToggleCollapse}
				enableVirtualization={enableVirtualization}
				virtualHeight={virtualHeight}
				virtualWidth={virtualWidth}
				virtualRowHeight={virtualRowHeight}
				overscanCount={overscanCount}
				enableKeyboardNavigation={enableKeyboardNavigation}
				showKeyboardShortcutsButton={showKeyboardShortcutsButton}
				onDeleteNodes={onDeleteNodes}
				onFocusChange={onFocusChange}
			/>
		</div>
	);
});

export default SearchableTree;
