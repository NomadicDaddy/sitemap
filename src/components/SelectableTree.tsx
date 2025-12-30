/**
 * SelectableTree Component
 *
 * A wrapper around BasicTree that adds click-to-select functionality with
 * visual highlighting. Supports multi-select with Ctrl/Cmd-click and displays
 * the current selection state in the UI.
 *
 * @example
 * ```tsx
 * import { SelectableTree } from './components/SelectableTree';
 *
 * function App() {
 *   return (
 *     <SelectableTree
 *       nodes={treeNodes}
 *       onSelectionChange={(selectedIds) => console.log('Selected:', selectedIds)}
 *     />
 *   );
 * }
 * ```
 */
import React from 'react';
import { List, type RowComponentProps } from 'react-window';

import { useTreeKeyboardNavigation } from '../hooks/useTreeKeyboardNavigation';
import {
	type TreeTheme,
	computeBulletThemeStyles,
	computeNodeThemeStyles,
	createTheme,
} from '../theme';
import {
	type DragState,
	type DropPosition,
	type SelectionState,
	type TreeNode,
} from '../types/TreeNode';
import { type FlattenedNode, flattenTree } from '../utils/treeFlattening';
import { isDescendant, moveNode } from '../utils/treeOperations';
import { ExportButton } from './ExportButton';
import { KeyboardShortcutsHelp, KeyboardShortcutsHelpButton } from './KeyboardShortcutsHelp';
import { useTreeNodeSelection } from './TreeNodeUtils';

// ============================================================================
// Types
// ============================================================================

/**
 * Extended click event that includes modifier key information.
 */
export interface NodeClickEvent {
	/** The clicked node */
	node: TreeNode;
	/** Whether Ctrl (Windows/Linux) or Cmd (Mac) was held */
	isMultiSelectKey: boolean;
	/** Whether Shift was held */
	isShiftKey: boolean;
	/** The original mouse event */
	originalEvent: React.MouseEvent;
}

/**
 * Props for the SelectableTree component.
 */
export interface SelectableTreeProps {
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

	/** Callback when a node is clicked (before selection is updated) */
	onNodeClick?: (event: NodeClickEvent) => void;

	/** Optional custom render function for node labels */
	renderLabel?: (node: TreeNode, isSelected: boolean) => React.ReactNode;

	/** Whether to allow deselecting by clicking on an already selected node (default: true) */
	allowDeselect?: boolean;

	/** Whether to clear selection when clicking outside nodes (default: false) */
	clearOnClickOutside?: boolean;

	/** Maximum number of nodes that can be selected (undefined = unlimited) */
	maxSelections?: number;

	/** Whether to surface bulk action controls (default: true) */
	showBulkActions?: boolean;

	/** Callback when a bulk delete is confirmed */
	onBulkDelete?: (selectedNodes: TreeNode[]) => void;

	/** Callback when bulk change color action is confirmed */
	onBulkChangeColor?: (selectedNodes: TreeNode[], color: string) => void;

	/** Callback when bulk add tag action is confirmed */
	onBulkAddTag?: (selectedNodes: TreeNode[], tag: string) => void;

	/** Callback when bulk modify properties action is confirmed with JSON object */
	onBulkModifyProperties?: (
		selectedNodes: TreeNode[],
		properties: Record<string, unknown>
	) => void;

	/** Optional theme overrides for depth colors, spacing, and typography */
	theme?: Partial<TreeTheme>;

	/** Aria label for the tree container */
	ariaLabel?: string;

	/** Aria label for the selection info panel */
	selectionInfoLabel?: string;

	/** Whether to show export buttons (default: false) */
	showExportButtons?: boolean;

	/** Whether nodes should be collapsible (default: false) */
	collapsible?: boolean;

	/** Callback when a node's expand/collapse state changes */
	onToggleCollapse?: (node: TreeNode) => void;

	/** Callback when export completes */
	onExportComplete?: (result: { svgContent: string; filename: string; size: number }) => void;

	/** Callback when export fails */
	onExportError?: (error: Error) => void;

	// ============================================================================
	// Virtual Scrolling Props
	// ============================================================================

	/** Enable virtual scrolling for large trees (1000+ nodes) */
	enableVirtualization?: boolean;

	/** Height of the virtualized container in pixels (required when enableVirtualization is true) */
	virtualHeight?: number;

	/** Width of the virtualized container (default: '100%') */
	virtualWidth?: number | string;

	/** Height of each row in pixels for virtualization (default: 32) */
	virtualRowHeight?: number;

	/** Number of items to render above/below the visible area (default: 5) */
	overscanCount?: number;

	// ============================================================================
	// Keyboard Navigation Props
	// ============================================================================

	/** Enable keyboard navigation (default: true) */
	enableKeyboardNavigation?: boolean;

	/** Whether to show the keyboard shortcuts help button (default: true when keyboard navigation is enabled) */
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
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	gap: '12px',
};

const treeContainerStyles: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
};

const selectionInfoStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#f0f9ff',
	border: '2px solid #bae6fd',
	borderRadius: '8px',
	boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
	color: '#0369a1',
	display: 'flex',
	fontSize: '13px',
	gap: '12px',
	padding: '10px 16px',
};

const selectionCountStyles: React.CSSProperties = {
	fontWeight: 600,
};

const clearButtonStyles: React.CSSProperties = {
	backgroundColor: '#0ea5e9',
	border: 'none',
	borderRadius: '6px',
	boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
	color: '#ffffff',
	cursor: 'pointer',
	fontSize: '12px',
	fontWeight: '600',
	marginLeft: 'auto',
	padding: '6px 12px',
	transition: 'all 0.2s ease',
};

const clearButtonHoverStyles: React.CSSProperties = {
	...clearButtonStyles,
	backgroundColor: '#0284c7',
	boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3), 0 2px 4px -1px rgba(14, 165, 233, 0.2)',
	transform: 'translateY(-1px)',
};

const isBrowser = typeof window !== 'undefined';

const bulkButtonStyles: React.CSSProperties = {
	backgroundColor: '#6366f1',
	border: 'none',
	borderRadius: '6px',
	boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
	color: '#ffffff',
	cursor: 'pointer',
	fontSize: '12px',
	fontWeight: '600',
	padding: '6px 12px',
	transition: 'all 0.2s ease',
};

const bulkButtonDisabledStyles: React.CSSProperties = {
	backgroundColor: '#94a3b8',
	opacity: 0.5,
	pointerEvents: 'none',
};

const getBulkButtonStyles = (disabled: boolean): React.CSSProperties => ({
	...bulkButtonStyles,
	...(disabled ? bulkButtonDisabledStyles : {}),
});

function promptForJSON(message: string): Record<string, unknown> | undefined {
	if (!isBrowser) {
		return undefined;
	}

	const input = window.prompt(message ?? '');
	if (!input) {
		return undefined;
	}

	try {
		const parsed = JSON.parse(input);
		if (parsed && typeof parsed === 'object') {
			return parsed as Record<string, unknown>;
		}
		window.alert('Please provide a valid JSON object.');
	} catch {
		window.alert('Invalid JSON. Please check your input.');
	}

	return undefined;
}

function promptForValue(message: string): string | undefined {
	if (!isBrowser) {
		return undefined;
	}

	const input = window.prompt(message ?? '');
	if (!input) {
		return undefined;
	}

	const trimmed = input.trim();
	return trimmed === '' ? undefined : trimmed;
}

function confirmBulkAction(message: string): boolean {
	return isBrowser ? window.confirm(message) : true;
}

const selectedLabelBadgeStyles: React.CSSProperties = {
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
};

const hintTextStyles: React.CSSProperties = {
	color: '#64748b',
	fontSize: '12px',
	marginTop: '4px',
};

const bulkToolbarNoteStyles: React.CSSProperties = {
	color: '#475569',
	fontSize: '12px',
	fontWeight: 500,
};

const focusedNodeStyles: React.CSSProperties = {
	outline: '2px solid #60a5fa',
	outlineOffset: '1px',
};

const toolbarContainerStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexWrap: 'wrap',
	gap: '8px',
	justifyContent: 'space-between',
};

const toolbarLeftStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexWrap: 'wrap',
	gap: '8px',
};

function resolveDropPositionFromEvent(event: React.DragEvent<HTMLDivElement>): DropPosition {
	const { top, height } = event.currentTarget?.getBoundingClientRect() ?? { height: 0, top: 0 };
	if (height === 0) {
		return 'inside';
	}

	const offset = event.clientY - top;
	const threshold = Math.max(height / 3, 4);

	if (offset <= threshold) {
		return 'before';
	}

	if (offset >= height - threshold) {
		return 'after';
	}

	return 'inside';
}

const DRAG_DATA_TYPE = 'application/x-ux-sitemap-node';

// ============================================================================
// SelectionInfo Component
// ============================================================================

interface SelectionInfoProps {
	selectedCount: number;
	selectedNodes: TreeNode[];
	onClearSelection: () => void;
	ariaLabel?: string;
}

/**
 * Displays information about the current selection state.
 */
function SelectionInfo({
	selectedCount,
	selectedNodes,
	onClearSelection,
	ariaLabel = 'Selection information',
}: SelectionInfoProps): React.ReactElement | null {
	const [isHoveringClear, setIsHoveringClear] = React.useState(false);

	if (selectedCount === 0) {
		return (
			<div style={hintTextStyles} aria-label={ariaLabel}>
				Click to select a node. Hold Ctrl/Cmd and click to select multiple nodes.
			</div>
		);
	}

	const displayLabels = selectedNodes.slice(0, 3).map((n) => n.label);
	const moreCount = selectedCount - displayLabels.length;

	return (
		<div style={selectionInfoStyles} role="status" aria-label={ariaLabel} aria-live="polite">
			<span style={selectionCountStyles}>
				{selectedCount} node{selectedCount !== 1 ? 's' : ''} selected
			</span>
			<span>
				{displayLabels.join(', ')}
				{moreCount > 0 && ` +${moreCount} more`}
			</span>
			<button
				onClick={onClearSelection}
				onMouseEnter={() => setIsHoveringClear(true)}
				onMouseLeave={() => setIsHoveringClear(false)}
				style={isHoveringClear ? clearButtonHoverStyles : clearButtonStyles}
				aria-label="Clear selection"
				type="button">
				Clear
			</button>
		</div>
	);
}

// ============================================================================
// SelectableTreeNodeItem Component (Internal)
// ============================================================================

interface DragAttributes extends React.HTMLAttributes<HTMLDivElement> {
	'data-drop-invalid'?: string;
}

interface SelectableTreeNodeItemProps {
	node: TreeNode;
	showDepthIndicators: boolean;
	isSelected: boolean;
	isFocused?: boolean;
	onNodeClick: (node: TreeNode, event: React.MouseEvent) => void;
	renderLabel?: (node: TreeNode, isSelected: boolean) => React.ReactNode;
	depthStyles: React.CSSProperties;
	bulletStyles: React.CSSProperties;
	dragProps?: DragAttributes;
	theme?: TreeTheme;
	collapsible?: boolean;
	onToggleCollapse?: (node: TreeNode) => void;
}

/**
 * Internal component for rendering a single selectable tree node.
 */
function SelectableTreeNodeItem({
	node,
	showDepthIndicators,
	isSelected,
	isFocused = false,
	onNodeClick,
	renderLabel,
	depthStyles,
	bulletStyles,
	dragProps,
	theme,
	collapsible = false,
	onToggleCollapse,
}: SelectableTreeNodeItemProps): React.ReactElement {
	const hasChildren = node.children && node.children.length > 0;
	const isExpanded = node.metadata?.expanded !== false;
	const nodeRef = React.useRef<HTMLDivElement>(null);

	// Scroll focused node into view
	React.useEffect(() => {
		if (isFocused && nodeRef.current) {
			nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [isFocused]);

	const handleClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		onNodeClick(node, event);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			event.stopPropagation();
			onNodeClick(node, {
				ctrlKey: event.ctrlKey,
				metaKey: event.metaKey,
				shiftKey: event.shiftKey,
			} as React.MouseEvent);
		}
	};

	const handleToggleCollapse = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (onToggleCollapse) {
			onToggleCollapse(node);
		}
	};

	// Build the label content
	const labelContent = renderLabel ? (
		renderLabel(node, isSelected)
	) : (
		<>
			<span className="tree-node-text">{node.label}</span>
			{isSelected && (
				<span style={selectedLabelBadgeStyles} aria-hidden="true">
					Selected
				</span>
			)}
		</>
	);

	return (
		<div
			ref={nodeRef}
			className={`tree-node ${isSelected ? 'tree-node--selected' : ''} ${isFocused ? 'tree-node--focused' : ''}`}
			data-node-id={node.id}
			data-depth={node.depth}
			data-selected={isSelected ? 'true' : undefined}
			data-focused={isFocused ? 'true' : undefined}>
			{/* Node Label */}
			<div
				className={`tree-node-label ${isSelected ? 'tree-node-label--selected' : ''} ${isFocused ? 'tree-node-label--focused' : ''}`}
				style={{
					...depthStyles,
					...(isFocused ? focusedNodeStyles : {}),
					alignItems: 'center',
					cursor: 'pointer',
					display: 'flex',
					margin: '2px 0',
				}}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				{...dragProps}
				draggable={Boolean(dragProps?.onDragStart)}
				aria-selected={isSelected}
				role="treeitem"
				tabIndex={isFocused ? 0 : -1}
				id={`tree-node-${node.id}`}>
				{/* Collapse/expand button */}
				{collapsible && hasChildren && (
					<button
						onClick={handleToggleCollapse}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							fontSize: '12px',
							marginRight: '4px',
							padding: '0 4px',
						}}
						aria-label={isExpanded ? 'Collapse' : 'Expand'}
						aria-expanded={isExpanded}
						type="button">
						{isExpanded ? '▼' : '▶'}
					</button>
				)}

				{/* Depth indicator bullet */}
				{showDepthIndicators && (
					<span className="tree-node-bullet" style={bulletStyles} aria-hidden="true" />
				)}

				{/* Label content */}
				{labelContent}

				{/* Children count indicator */}
				{hasChildren && (
					<span
						className="tree-node-children-count"
						style={{
							fontSize: '0.75em',
							marginLeft: '8px',
							opacity: 0.6,
						}}
						aria-label={`${node.children!.length} children`}>
						({node.children!.length})
					</span>
				)}
			</div>

			{/* Render children recursively */}
			{hasChildren && isExpanded && (
				<div className="tree-node-children">
					{node.children!.map((child, _index) => (
						<SelectableTreeNodeItem
							key={child.id}
							node={child}
							showDepthIndicators={showDepthIndicators}
							isSelected={isSelected}
							onNodeClick={onNodeClick}
							renderLabel={renderLabel}
							depthStyles={computeNodeThemeStyles(child.depth, {
								isSelected,
								showDepthIndicators,
								theme,
							})}
							bulletStyles={computeBulletThemeStyles(child.depth, {
								theme,
							})}
							theme={theme}
							collapsible={collapsible}
							onToggleCollapse={onToggleCollapse}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// ============================================================================
// SelectableTree Component
// ============================================================================

/**
 * SelectableTree renders a hierarchical tree structure with click-to-select
 * functionality and multi-select support via Ctrl/Cmd-click.
 *
 * Features:
 * - Click to select a single node
 * - Ctrl/Cmd + click to toggle selection (multi-select)
 * - Visual highlighting of selected nodes
 * - Selection info panel showing selected count and labels
 * - Clear selection button
 * - Accessible keyboard navigation
 * - Customizable appearance
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SelectableTree nodes={treeNodes} />
 *
 * // With callbacks
 * <SelectableTree
 *   nodes={treeNodes}
 *   onSelectionChange={(ids) => console.log('Selected:', ids)}
 *   onNodeClick={(event) => console.log('Clicked:', event.node.label)}
 * />
 *
 * // With initial selection
 * <SelectableTree
 *   nodes={treeNodes}
 *   initialSelectedIds={new Set(['node-1', 'node-2'])}
 * />
 * ```
 */
export function SelectableTree({
	nodes,
	className = '',
	indentSize = 24,
	showDepthIndicators = true,
	showSelectionInfo = true,
	initialSelectedIds = new Set(),
	onSelectionChange,
	onNodeClick,
	renderLabel,
	allowDeselect = true,
	clearOnClickOutside = false,
	maxSelections,
	showBulkActions = true,
	onBulkDelete,
	onBulkChangeColor,
	onBulkAddTag,
	onBulkModifyProperties,
	theme,
	ariaLabel = 'Selectable tree structure',
	selectionInfoLabel = 'Selection information',
	showExportButtons = false,
	onExportComplete,
	onExportError,
	onTreeReorder,
	collapsible = false,
	onToggleCollapse,
	// Virtual scrolling props
	enableVirtualization = false,
	virtualHeight = 600,
	// virtualWidth is accepted for API compatibility but not used in react-window v2
	virtualWidth: _virtualWidth = '100%',
	virtualRowHeight = 32,
	overscanCount = 5,
	// Keyboard navigation props
	enableKeyboardNavigation = true,
	showKeyboardShortcutsButton,
	onDeleteNodes,
	onFocusChange,
}: SelectableTreeProps): React.ReactElement {
	// Suppress unused variable warning - virtualWidth kept for API compatibility
	void _virtualWidth;
	// Refs for export functionality
	const basicTreeRef = React.useRef<HTMLDivElement>(null);

	// Use the selection hook for state management
	const { selectedIds, isSelected, toggleSelection, selectOnly, clearSelection } =
		useTreeNodeSelection(initialSelectedIds);

	// Determine if we should show the keyboard shortcuts button
	const shouldShowShortcutsButton = showKeyboardShortcutsButton ?? enableKeyboardNavigation;

	const resolvedTheme = React.useMemo(() => {
		const base = createTheme(theme);
		return {
			...base,
			spacing: {
				...base.spacing,
				indentSize,
			},
		};
	}, [theme, indentSize]);

	const [internalNodes, setInternalNodes] = React.useState<TreeNode[]>(() => nodes);
	const nodesPropRef = React.useRef(nodes);
	const [dragState, setDragState] = React.useState<DragState | null>(null);

	React.useEffect(() => {
		if (nodes !== nodesPropRef.current) {
			nodesPropRef.current = nodes;
			setInternalNodes(nodes);
			setDragState(null);
		}
	}, [nodes]);

	const handleDragStart = React.useCallback(
		(nodeId: string) => (event: React.DragEvent<HTMLDivElement>) => {
			event.stopPropagation();
			event.dataTransfer?.setData(DRAG_DATA_TYPE, nodeId);
			event.dataTransfer?.setDragImage(event.currentTarget, 0, 0);
			setDragState({
				draggedId: nodeId,
				isValidDrop: false,
			});
		},
		[]
	);

	const handleDragEnd = React.useCallback(() => {
		setDragState(null);
	}, []);

	const handleDragOver = React.useCallback(
		(targetId: string) => (event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();

			setDragState((prev) => {
				if (!prev) {
					return prev;
				}
				const position = resolveDropPositionFromEvent(event);
				const invalidTarget =
					prev.draggedId === targetId ||
					isDescendant(internalNodes, prev.draggedId, targetId);
				return {
					...prev,
					isValidDrop: !invalidTarget,
					position,
					targetId,
				};
			});
		},
		[internalNodes]
	);

	const handleDrop = React.useCallback(
		(targetId: string) => (event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();

			if (!dragState) {
				setDragState(null);
				return;
			}

			const dropPosition = dragState.position ?? resolveDropPositionFromEvent(event);
			const invalidDrop =
				dragState.draggedId === targetId ||
				isDescendant(internalNodes, dragState.draggedId, targetId);

			if (!dragState.isValidDrop || invalidDrop) {
				setDragState(null);
				return;
			}

			const reordered = moveNode(internalNodes, {
				draggedId: dragState.draggedId,
				position: dropPosition,
				targetId,
			});

			setInternalNodes(reordered);
			onTreeReorder?.(reordered);
			setDragState(null);
		},
		[dragState, internalNodes, onTreeReorder]
	);

	// Track the last selected ID for potential shift-click range selection (future enhancement)
	const [lastSelectedId, setLastSelectedId] = React.useState<string | undefined>();

	// Handle keyboard-triggered selection changes
	const handleKeyboardSelectionChange = React.useCallback(
		(nodeId: string, event: { ctrlKey: boolean; shiftKey: boolean }) => {
			if (event.ctrlKey) {
				toggleSelection(nodeId);
			} else {
				selectOnly(nodeId);
			}
			setLastSelectedId(nodeId);
		},
		[toggleSelection, selectOnly]
	);

	// Keyboard navigation hook
	const {
		state: keyboardState,
		actions: keyboardActions,
		containerProps: keyboardContainerProps,
	} = useTreeKeyboardNavigation({
		containerRef: basicTreeRef,
		enabled: enableKeyboardNavigation,
		nodes: internalNodes,
		onDeleteNodes,
		onFocusChange,
		onSelectionChange: handleKeyboardSelectionChange,
		onToggleExpand: onToggleCollapse,
		selectedIds,
	});

	// Build a map of all nodes for quick lookup
	const nodeMap = React.useMemo(() => {
		const map = new Map<string, TreeNode>();

		function traverse(node: TreeNode) {
			map.set(node.id, node);
			if (node.children) {
				node.children.forEach(traverse);
			}
		}

		internalNodes.forEach(traverse);
		return map;
	}, [internalNodes]);

	// Get selected nodes for display
	const selectedNodes = React.useMemo(() => {
		const result: TreeNode[] = [];
		selectedIds.forEach((id) => {
			const node = nodeMap.get(id);
			if (node) {
				result.push(node);
			}
		});
		return result;
	}, [selectedIds, nodeMap]);

	// Create selection state object for callback
	const selectionState = React.useMemo<SelectionState>(
		() => ({
			lastSelectedId,
			selectedIds,
		}),
		[selectedIds, lastSelectedId]
	);

	const bulkActionsDisabled = selectedNodes.length === 0;

	const handleBulkDelete = React.useCallback(() => {
		if (!onBulkDelete || bulkActionsDisabled) {
			return;
		}

		if (!confirmBulkAction('Are you sure you want to delete the selected nodes?')) {
			return;
		}

		onBulkDelete(selectedNodes);
	}, [onBulkDelete, selectedNodes, bulkActionsDisabled]);

	const handleBulkChangeColor = React.useCallback(() => {
		if (!onBulkChangeColor || bulkActionsDisabled) {
			return;
		}

		const color = promptForValue('Enter a hex color (e.g., #1d4ed8)');
		if (!color) {
			return;
		}

		if (!confirmBulkAction(`Apply ${color} to ${selectedNodes.length} node(s)?`)) {
			return;
		}

		onBulkChangeColor(selectedNodes, color);
	}, [onBulkChangeColor, selectedNodes, bulkActionsDisabled]);

	const handleBulkAddTag = React.useCallback(() => {
		if (!onBulkAddTag || bulkActionsDisabled) {
			return;
		}

		const tag = promptForValue('Enter a tag to add to the selected nodes');
		if (!tag) {
			return;
		}

		onBulkAddTag(selectedNodes, tag);
	}, [onBulkAddTag, selectedNodes, bulkActionsDisabled]);

	const handleBulkModifyProperties = React.useCallback(() => {
		if (!onBulkModifyProperties || bulkActionsDisabled) {
			return;
		}

		const properties = promptForJSON(
			'Enter a JSON object describing the properties to merge into each selected node'
		);
		if (!properties) {
			return;
		}

		onBulkModifyProperties(selectedNodes, properties);
	}, [onBulkModifyProperties, selectedNodes, bulkActionsDisabled]);

	// Call onSelectionChange when selection changes
	const prevSelectedIdsRef = React.useRef(selectedIds);
	React.useEffect(() => {
		if (onSelectionChange && selectedIds !== prevSelectedIdsRef.current) {
			onSelectionChange(selectedIds, selectionState);
			prevSelectedIdsRef.current = selectedIds;
		}
	}, [selectedIds, selectionState, onSelectionChange]);

	// Handle node click with multi-select support
	const handleNodeClick = React.useCallback(
		(node: TreeNode, event: React.MouseEvent) => {
			const isMultiSelectKey = event.ctrlKey || event.metaKey;
			const isShiftKey = event.shiftKey;

			// Call optional onNodeClick callback
			if (onNodeClick) {
				onNodeClick({
					isMultiSelectKey,
					isShiftKey,
					node,
					originalEvent: event,
				});
			}

			// Handle selection logic
			if (isMultiSelectKey) {
				// Multi-select mode: toggle the clicked node
				const currentlySelected = isSelected(node.id);

				// Check max selections limit
				if (!currentlySelected && maxSelections !== undefined) {
					if (selectedIds.size >= maxSelections) {
						// At max, don't add more
						return;
					}
				}

				// Check if we allow deselection
				if (currentlySelected && !allowDeselect) {
					return;
				}

				toggleSelection(node.id);
			} else {
				// Single-select mode: select only this node
				const currentlySelected = isSelected(node.id);

				if (currentlySelected && allowDeselect) {
					// If already selected and deselect is allowed, clear selection
					clearSelection();
				} else {
					// Select only this node
					selectOnly(node.id);
				}
			}

			setLastSelectedId(node.id);
		},
		[
			onNodeClick,
			isSelected,
			toggleSelection,
			selectOnly,
			clearSelection,
			allowDeselect,
			maxSelections,
			selectedIds.size,
		]
	);

	// Handle click outside to clear selection
	const handleContainerClick = React.useCallback(
		(event: React.MouseEvent) => {
			if (clearOnClickOutside) {
				// Only clear if clicking directly on the container, not on a node
				const target = event.target as HTMLElement;
				if (target.classList.contains('selectable-tree')) {
					clearSelection();
				}
			}
		},
		[clearOnClickOutside, clearSelection]
	);

	// Flatten the tree for virtualized rendering
	const flattenedNodes = React.useMemo(
		() => (enableVirtualization ? flattenTree(internalNodes) : []),
		[enableVirtualization, internalNodes]
	);

	// Row data for virtualized list
	interface VirtualizedRowData {
		flattenedNodes: FlattenedNode[];
		isSelected: (id: string) => boolean;
		showDepthIndicators: boolean;
		resolvedTheme: TreeTheme;
		handleNodeClick: (node: TreeNode, event: React.MouseEvent) => void;
		renderLabel?: (node: TreeNode, isSelected: boolean) => React.ReactNode;
		dragState: DragState | null;
		handleDragEnd: () => void;
		handleDragOver: (targetId: string) => (event: React.DragEvent<HTMLDivElement>) => void;
		handleDragStart: (nodeId: string) => (event: React.DragEvent<HTMLDivElement>) => void;
		handleDrop: (targetId: string) => (event: React.DragEvent<HTMLDivElement>) => void;
		collapsible: boolean;
		onToggleCollapse?: (node: TreeNode) => void;
	}

	// Virtualized row component
	const VirtualizedSelectableRow = React.useCallback(
		({ index, style, ...rowData }: RowComponentProps<VirtualizedRowData>) => {
			const {
				flattenedNodes: nodes,
				isSelected: checkSelected,
				showDepthIndicators: showIndicators,
				resolvedTheme: theme,
				handleNodeClick: onNodeClick,
				renderLabel: labelRenderer,
				dragState: drag,
				handleDragEnd: onDragEnd,
				handleDragOver: onDragOver,
				handleDragStart: onDragStart,
				handleDrop: onDrop,
				collapsible: isCollapsible,
				onToggleCollapse: toggleCollapse,
			} = rowData;

			const flatNode = nodes[index];
			if (!flatNode) return <div style={style} />;

			const { node, depth, hasChildren } = flatNode;
			const nodeIsSelected = checkSelected(node.id);
			const depthStyles = computeNodeThemeStyles(depth, {
				isSelected: nodeIsSelected,
				showDepthIndicators: showIndicators,
				theme,
			});

			return (
				<div style={style}>
					<SelectableTreeNodeItem
						node={{
							...node,
							children: hasChildren ? node.children : undefined,
						}}
						showDepthIndicators={showIndicators}
						isSelected={nodeIsSelected}
						onNodeClick={onNodeClick}
						renderLabel={labelRenderer}
						depthStyles={depthStyles}
						bulletStyles={computeBulletThemeStyles(depth, { theme })}
						dragProps={{
							'data-drop-invalid':
								drag && drag.targetId === node.id && !drag.isValidDrop
									? 'true'
									: undefined,
							onDragEnd,
							onDragOver: onDragOver(node.id),
							onDragStart: onDragStart(node.id),
							onDrop: onDrop(node.id),
						}}
						theme={theme}
						collapsible={isCollapsible}
						onToggleCollapse={toggleCollapse}
					/>
				</div>
			);
		},
		[]
	);

	// Row props for the list
	const virtualizedRowProps = React.useMemo(
		() => ({
			collapsible,
			dragState,
			flattenedNodes,
			handleDragEnd,
			handleDragOver,
			handleDragStart,
			handleDrop,
			handleNodeClick,
			isSelected,
			onToggleCollapse,
			renderLabel,
			resolvedTheme,
			showDepthIndicators,
		}),
		[
			flattenedNodes,
			isSelected,
			showDepthIndicators,
			resolvedTheme,
			handleNodeClick,
			renderLabel,
			dragState,
			handleDragEnd,
			handleDragOver,
			handleDragStart,
			handleDrop,
			collapsible,
			onToggleCollapse,
		]
	);

	// Flatten the tree for rendering while maintaining hierarchy visually
	const renderTree = (nodeList: TreeNode[]): React.ReactElement[] => {
		const result: React.ReactElement[] = [];

		const traverse = (node: TreeNode) => {
			const nodeIsSelected = isSelected(node.id);
			const nodeIsFocused = keyboardState.focusedId === node.id;
			const depthStyles = computeNodeThemeStyles(node.depth, {
				isSelected: nodeIsSelected,
				showDepthIndicators,
				theme: resolvedTheme,
			});
			const isExpanded = node.metadata?.expanded !== false;

			result.push(
				<SelectableTreeNodeItem
					key={node.id}
					node={{
						...node,
						children: undefined,
					}}
					showDepthIndicators={showDepthIndicators}
					isSelected={nodeIsSelected}
					isFocused={nodeIsFocused}
					onNodeClick={handleNodeClick}
					renderLabel={renderLabel}
					depthStyles={depthStyles}
					bulletStyles={computeBulletThemeStyles(node.depth, { theme: resolvedTheme })}
					dragProps={{
						'data-drop-invalid':
							dragState && dragState.targetId === node.id && !dragState.isValidDrop
								? 'true'
								: undefined,
						onDragEnd: handleDragEnd,
						onDragOver: handleDragOver(node.id),
						onDragStart: handleDragStart(node.id),
						onDrop: handleDrop(node.id),
					}}
					theme={resolvedTheme}
					collapsible={collapsible}
					onToggleCollapse={onToggleCollapse}
				/>
			);

			if (node.children && isExpanded) {
				node.children.forEach(traverse);
			}
		};

		nodeList.forEach(traverse);
		return result;
	};

	// Empty state
	if (!nodes || nodes.length === 0) {
		return (
			<div
				className={`selectable-tree selectable-tree--empty ${className}`.trim()}
				style={{
					color: '#6b7280',
					fontStyle: 'italic',
					padding: '16px',
					textAlign: 'center',
				}}
				role="tree"
				aria-label={ariaLabel}>
				No nodes to display
			</div>
		);
	}

	return (
		<div
			className={`selectable-tree ${className}`.trim()}
			style={containerStyles}
			onClick={handleContainerClick}>
			{/* Selection info panel */}
			{showSelectionInfo && (
				<SelectionInfo
					selectedCount={selectedIds.size}
					selectedNodes={selectedNodes}
					onClearSelection={clearSelection}
					ariaLabel={selectionInfoLabel}
				/>
			)}

			{/* Bulk action toolbar */}
			{showBulkActions && (
				<div style={toolbarContainerStyles} className="selectable-tree-bulk-actions">
					<div style={toolbarLeftStyles}>
						<span style={bulkToolbarNoteStyles}>Bulk actions:</span>
						<button
							type="button"
							onClick={handleBulkDelete}
							disabled={bulkActionsDisabled || !onBulkDelete}
							style={getBulkButtonStyles(bulkActionsDisabled || !onBulkDelete)}>
							Delete
						</button>
						<button
							type="button"
							onClick={handleBulkChangeColor}
							disabled={bulkActionsDisabled || !onBulkChangeColor}
							style={getBulkButtonStyles(bulkActionsDisabled || !onBulkChangeColor)}>
							Change Color
						</button>
						<button
							type="button"
							onClick={handleBulkAddTag}
							disabled={bulkActionsDisabled || !onBulkAddTag}
							style={getBulkButtonStyles(bulkActionsDisabled || !onBulkAddTag)}>
							Add Tag
						</button>
						<button
							type="button"
							onClick={handleBulkModifyProperties}
							disabled={bulkActionsDisabled || !onBulkModifyProperties}
							style={getBulkButtonStyles(
								bulkActionsDisabled || !onBulkModifyProperties
							)}>
							Modify Properties
						</button>
						{showExportButtons && (
							<ExportButton
								visualizationType="basic-tree"
								elementRef={basicTreeRef}
								nodes={nodes}
								onExportComplete={onExportComplete}
								onExportError={onExportError}
								size="small"
								variant="outline"
							/>
						)}
					</div>
					{shouldShowShortcutsButton && (
						<KeyboardShortcutsHelpButton
							onClick={keyboardActions.toggleHelp}
							size="small"
							variant="icon-text"
							label="Keyboard Shortcuts"
						/>
					)}
				</div>
			)}

			{/* Tree container */}
			{enableVirtualization ? (
				<div
					ref={basicTreeRef}
					className="selectable-tree-content"
					style={treeContainerStyles}
					role="tree"
					aria-label={ariaLabel}
					aria-multiselectable="true"
					aria-activedescendant={
						keyboardState.focusedId ? `tree-node-${keyboardState.focusedId}` : undefined
					}
					tabIndex={enableKeyboardNavigation ? 0 : undefined}
					onKeyDown={
						enableKeyboardNavigation ? keyboardContainerProps.onKeyDown : undefined
					}
					data-testid="selectable-virtualized-tree">
					<List
						defaultHeight={virtualHeight}
						rowCount={flattenedNodes.length}
						rowHeight={virtualRowHeight}
						rowComponent={VirtualizedSelectableRow}
						rowProps={virtualizedRowProps}
						overscanCount={overscanCount}
					/>
				</div>
			) : (
				<div
					ref={basicTreeRef}
					className="selectable-tree-content"
					style={treeContainerStyles}
					role="tree"
					aria-label={ariaLabel}
					aria-multiselectable="true"
					aria-activedescendant={
						keyboardState.focusedId ? `tree-node-${keyboardState.focusedId}` : undefined
					}
					tabIndex={enableKeyboardNavigation ? 0 : undefined}
					onKeyDown={
						enableKeyboardNavigation ? keyboardContainerProps.onKeyDown : undefined
					}>
					{renderTree(internalNodes)}
				</div>
			)}

			{/* Keyboard shortcuts help dialog */}
			<KeyboardShortcutsHelp
				isOpen={keyboardState.isHelpOpen}
				onClose={keyboardActions.closeHelp}
			/>
		</div>
	);
}

// ============================================================================
// Exports
// ============================================================================

export default SelectableTree;
export { SelectionInfo };
export type { SelectionInfoProps };
