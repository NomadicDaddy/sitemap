/**
 * VirtualizedTree Component
 *
 * A high-performance tree component that uses react-window for virtual scrolling.
 * Only renders visible nodes in the viewport, enabling smooth handling of 1000+ nodes.
 *
 * @example
 * ```tsx
 * import { VirtualizedTree } from './components/VirtualizedTree';
 *
 * <VirtualizedTree
 *   nodes={treeNodes}
 *   height={600}
 *   onNodeClick={(node) => console.log('Clicked:', node.label)}
 * />
 * ```
 */
import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react';
import { List, type RowComponentProps } from 'react-window';

import {
	type TreeTheme,
	computeBulletThemeStyles,
	computeNodeThemeStyles,
	createTheme,
} from '../theme';
import { type EditingState, type TreeNode } from '../types/TreeNode';
import { type FlattenedNode, flattenTree } from '../utils/treeFlattening';
import { EditButton, InlineEditInput } from './InlineEditInput';

// Note: flattenTree, countVisibleNodes, and FlattenedNode are exported from
// '../utils/treeFlattening' directly. Import from there for utility functions.
// Also available via './components' index exports.

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the VirtualizedTree component.
 */
export interface VirtualizedTreeProps {
	/** Array of root-level tree nodes to render */
	nodes: TreeNode[];

	/** Height of the virtualized container in pixels */
	height: number;

	/** Width of the virtualized container (default: 100%) */
	width?: number | string;

	/** Height of each row in pixels (default: 32) */
	rowHeight?: number;

	/** Optional CSS class name for the container */
	className?: string;

	/** Indentation size in pixels per depth level (default: 24) */
	indentSize?: number;

	/** Whether to show depth-based visual indicators (default: true) */
	showDepthIndicators?: boolean;

	/** Optional theme overrides for styling */
	theme?: Partial<TreeTheme>;

	/** Optional callback when a node is clicked */
	onNodeClick?: (node: TreeNode) => void;

	/** Optional callback when a node is clicked with the mouse event (for multi-select) */
	onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;

	/** Optional custom render function for node labels */
	renderLabel?: (node: TreeNode) => React.ReactNode;

	/** Set of selected node IDs for visual highlighting */
	selectedIds?: Set<string>;

	// ============================================================================
	// Inline Editing Props
	// ============================================================================

	/** Whether inline editing is enabled (default: false) */
	editable?: boolean;

	/** The current editing state (required if editable is true) */
	editingState?: EditingState;

	/** Callback when a node's label should be edited (double-click trigger) */
	onNodeDoubleClick?: (node: TreeNode) => void;

	/** Callback when a node's edit value changes */
	onEditValueChange?: (value: string) => void;

	/** Callback when an edit is committed */
	onEditCommit?: () => void;

	/** Callback when an edit is canceled */
	onEditCancel?: () => void;

	/** Whether to show edit button on hover (default: true when editable) */
	showEditButton?: boolean;

	/** Callback when the edit button is clicked */
	onEditButtonClick?: (node: TreeNode) => void;

	/** Whether nodes should be collapsible (default: true for virtualized) */
	collapsible?: boolean;

	/** Callback when a node's expand/collapse state changes */
	onToggleCollapse?: (node: TreeNode) => void;

	/** Number of items to render above/below the visible area (default: 5) */
	overscanCount?: number;
}

/**
 * Props passed to each virtualized row.
 */
interface VirtualizedRowData {
	flattenedNodes: FlattenedNode[];
	showDepthIndicators: boolean;
	theme: TreeTheme;
	onNodeClick?: (node: TreeNode) => void;
	onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;
	renderLabel?: (node: TreeNode) => React.ReactNode;
	selectedIds?: Set<string>;
	editable: boolean;
	editingState?: EditingState;
	onNodeDoubleClick?: (node: TreeNode) => void;
	onEditValueChange?: (value: string) => void;
	onEditCommit?: () => void;
	onEditCancel?: () => void;
	showEditButton: boolean;
	onEditButtonClick?: (node: TreeNode) => void;
	collapsible: boolean;
	onToggleCollapse?: (node: TreeNode) => void;
}

// ============================================================================
// VirtualizedRowItem Component (Internal)
// ============================================================================

/**
 * Renders the content of a single row in the virtualized list.
 */
const VirtualizedRowItem = memo(function VirtualizedRowItem({
	flatNode,
	showDepthIndicators,
	theme,
	onNodeClick,
	onNodeClickWithEvent,
	renderLabel,
	selectedIds,
	editable,
	editingState,
	onNodeDoubleClick,
	onEditValueChange,
	onEditCommit,
	onEditCancel,
	showEditButton,
	onEditButtonClick,
	collapsible,
	onToggleCollapse,
}: {
	flatNode: FlattenedNode;
	showDepthIndicators: boolean;
	theme: TreeTheme;
	onNodeClick?: (node: TreeNode) => void;
	onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;
	renderLabel?: (node: TreeNode) => React.ReactNode;
	selectedIds?: Set<string>;
	editable: boolean;
	editingState?: EditingState;
	onNodeDoubleClick?: (node: TreeNode) => void;
	onEditValueChange?: (value: string) => void;
	onEditCommit?: () => void;
	onEditCancel?: () => void;
	showEditButton: boolean;
	onEditButtonClick?: (node: TreeNode) => void;
	collapsible: boolean;
	onToggleCollapse?: (node: TreeNode) => void;
}) {
	const { node, depth, hasChildren, isExpanded } = flatNode;

	const [isHovered, setIsHovered] = useState(false);

	const isSelected = selectedIds?.has(node.id) ?? false;
	const isClickable = Boolean(onNodeClick || onNodeClickWithEvent);
	const isNodeEditing = editable && editingState?.editingId === node.id;
	const shouldShowEditButton = editable && showEditButton && !isNodeEditing;

	// Compute styles
	const depthStyles = useMemo(
		() =>
			computeNodeThemeStyles(depth, {
				isSelected,
				showDepthIndicators,
				theme,
			}),
		[depth, theme, showDepthIndicators, isSelected]
	);

	const bulletStyles = useMemo(() => computeBulletThemeStyles(depth, { theme }), [depth, theme]);

	const fontSize = useMemo(
		() => Number(depthStyles.fontSize?.toString().replace('px', '')) || undefined,
		[depthStyles.fontSize]
	);

	// Event handlers
	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			if (onNodeClickWithEvent) {
				onNodeClickWithEvent(node, event);
			} else if (onNodeClick) {
				onNodeClick(node);
			}
		},
		[onNodeClick, onNodeClickWithEvent, node]
	);

	const handleDoubleClick = useCallback(
		(event: React.MouseEvent) => {
			if (editable && onNodeDoubleClick) {
				event.preventDefault();
				event.stopPropagation();
				onNodeDoubleClick(node);
			}
		},
		[editable, onNodeDoubleClick, node]
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				event.stopPropagation();
				if (onNodeClickWithEvent) {
					onNodeClickWithEvent(node, {
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						shiftKey: event.shiftKey,
						stopPropagation: () => {},
					} as unknown as React.MouseEvent);
				} else if (onNodeClick) {
					onNodeClick(node);
				}
			}
		},
		[onNodeClick, onNodeClickWithEvent, node]
	);

	const handleToggleCollapse = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			if (onToggleCollapse) {
				onToggleCollapse(node);
			}
		},
		[onToggleCollapse, node]
	);

	const handleEditButtonClickCb = useCallback(() => {
		if (onEditButtonClick) {
			onEditButtonClick(node);
		} else if (onNodeDoubleClick) {
			onNodeDoubleClick(node);
		}
	}, [onEditButtonClick, onNodeDoubleClick, node]);

	// Render label content
	const labelContent =
		isNodeEditing && editingState ? (
			<InlineEditInput
				value={editingState.editValue ?? ''}
				onChange={(value) => onEditValueChange?.(value)}
				onCommit={() => onEditCommit?.()}
				onCancel={() => onEditCancel?.()}
				fontSize={fontSize}
				ariaLabel={`Edit label for ${node.label}`}
			/>
		) : (
			<>
				<span className="tree-node-text">
					{renderLabel ? renderLabel(node) : node.label}
				</span>
				{shouldShowEditButton && (
					<EditButton
						onClick={handleEditButtonClickCb}
						visible={isHovered}
						ariaLabel={`Edit ${node.label}`}
					/>
				)}
			</>
		);

	return (
		<div
			className={`tree-node-label ${isSelected ? 'tree-node-label--selected' : ''}`}
			style={{
				...depthStyles,
				alignItems: 'center',
				boxSizing: 'border-box',
				cursor: isClickable ? 'pointer' : 'default',
				display: 'flex',
				height: '100%',
				width: '100%',
			}}
			onClick={isClickable ? handleClick : undefined}
			onDoubleClick={editable ? handleDoubleClick : undefined}
			onMouseEnter={shouldShowEditButton ? () => setIsHovered(true) : undefined}
			onMouseLeave={shouldShowEditButton ? () => setIsHovered(false) : undefined}
			role={isClickable ? 'button' : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onKeyDown={isClickable ? handleKeyDown : undefined}
			aria-selected={isSelected}>
			{/* Collapse/expand button */}
			{collapsible && hasChildren && (
				<button
					onClick={handleToggleCollapse}
					style={{
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						flexShrink: 0,
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
				<span
					className="tree-node-bullet"
					style={{
						...bulletStyles,
						flexShrink: 0,
					}}
					aria-hidden="true"
				/>
			)}

			{/* Label content */}
			{labelContent}

			{/* Children count indicator */}
			{hasChildren && (
				<span
					className="tree-node-children-count"
					style={{
						flexShrink: 0,
						fontSize: '0.75em',
						marginLeft: '8px',
						opacity: 0.6,
					}}>
					({node.children!.length})
				</span>
			)}
		</div>
	);
});

// ============================================================================
// VirtualizedRow Component (Internal) - react-window v2 compatible
// ============================================================================

/**
 * Row component for react-window v2.
 * This receives index, style, and any rowProps.
 */
function VirtualizedRow({ index, style, ...rowData }: RowComponentProps<VirtualizedRowData>) {
	const {
		flattenedNodes,
		showDepthIndicators,
		theme,
		onNodeClick,
		onNodeClickWithEvent,
		renderLabel,
		selectedIds,
		editable,
		editingState,
		onNodeDoubleClick,
		onEditValueChange,
		onEditCommit,
		onEditCancel,
		showEditButton,
		onEditButtonClick,
		collapsible,
		onToggleCollapse,
	} = rowData;

	const flatNode = flattenedNodes[index];
	if (!flatNode) return <div style={style} />;

	return (
		<div
			style={{
				...style,
				alignItems: 'center',
				display: 'flex',
			}}
			className={`tree-node ${selectedIds?.has(flatNode.node.id) ? 'tree-node--selected' : ''}`}
			data-node-id={flatNode.node.id}
			data-depth={flatNode.depth}
			data-selected={selectedIds?.has(flatNode.node.id) ? 'true' : undefined}
			data-testid={`virtualized-tree-node-${flatNode.node.id}`}>
			<VirtualizedRowItem
				flatNode={flatNode}
				showDepthIndicators={showDepthIndicators}
				theme={theme}
				onNodeClick={onNodeClick}
				onNodeClickWithEvent={onNodeClickWithEvent}
				renderLabel={renderLabel}
				selectedIds={selectedIds}
				editable={editable}
				editingState={editingState}
				onNodeDoubleClick={onNodeDoubleClick}
				onEditValueChange={onEditValueChange}
				onEditCommit={onEditCommit}
				onEditCancel={onEditCancel}
				showEditButton={showEditButton}
				onEditButtonClick={onEditButtonClick}
				collapsible={collapsible}
				onToggleCollapse={onToggleCollapse}
			/>
		</div>
	);
}

// ============================================================================
// VirtualizedTree Component
// ============================================================================

/**
 * VirtualizedTree component renders a large tree structure efficiently using
 * react-window for virtual scrolling. Only visible nodes are rendered to the DOM.
 *
 * Features:
 * - Virtual scrolling for 1000+ nodes
 * - Collapse/expand functionality
 * - Selection highlighting
 * - Inline editing support
 * - Customizable appearance
 * - Accessible keyboard navigation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <VirtualizedTree nodes={treeNodes} height={600} />
 *
 * // With selection and click handler
 * <VirtualizedTree
 *   nodes={treeNodes}
 *   height={600}
 *   selectedIds={selectedSet}
 *   onNodeClick={(node) => console.log('Clicked:', node.label)}
 * />
 * ```
 */
export const VirtualizedTree = forwardRef<HTMLDivElement, VirtualizedTreeProps>(
	(
		{
			nodes,
			height,
			rowHeight = 32,
			className = '',
			indentSize = 24,
			showDepthIndicators = true,
			theme,
			onNodeClick,
			onNodeClickWithEvent,
			renderLabel,
			selectedIds,
			editable = false,
			editingState,
			onNodeDoubleClick,
			onEditValueChange,
			onEditCommit,
			onEditCancel,
			showEditButton = true,
			onEditButtonClick,
			collapsible = true,
			onToggleCollapse,
			overscanCount = 5,
		},
		ref
	) => {
		// Merge theme with indent override
		const mergedTheme = useMemo(() => {
			const base = createTheme(theme);
			return {
				...base,
				spacing: {
					...base.spacing,
					indentSize,
				},
			};
		}, [theme, indentSize]);

		// Flatten tree for virtualized rendering
		const flattenedNodes = useMemo(() => flattenTree(nodes), [nodes]);

		// Row props for the list - memoized to prevent unnecessary re-renders
		const rowProps = useMemo<VirtualizedRowData>(
			() => ({
				collapsible,
				editable,
				editingState,
				flattenedNodes,
				onEditButtonClick,
				onEditCancel,
				onEditCommit,
				onEditValueChange,
				onNodeClick,
				onNodeClickWithEvent,
				onNodeDoubleClick,
				onToggleCollapse,
				renderLabel,
				selectedIds,
				showDepthIndicators,
				showEditButton,
				theme: mergedTheme,
			}),
			[
				flattenedNodes,
				showDepthIndicators,
				mergedTheme,
				onNodeClick,
				onNodeClickWithEvent,
				renderLabel,
				selectedIds,
				editable,
				editingState,
				onNodeDoubleClick,
				onEditValueChange,
				onEditCommit,
				onEditCancel,
				showEditButton,
				onEditButtonClick,
				collapsible,
				onToggleCollapse,
			]
		);

		// Empty state
		if (!nodes || nodes.length === 0) {
			return (
				<div
					ref={ref}
					className={`virtualized-tree virtualized-tree--empty ${className}`.trim()}
					style={{
						color: '#6b7280',
						fontStyle: 'italic',
						height,
						padding: '16px',
						textAlign: 'center',
					}}
					role="tree"
					aria-label="Empty tree">
					No nodes to display
				</div>
			);
		}

		return (
			<div
				ref={ref}
				className={`virtualized-tree ${className}`.trim()}
				style={{
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
					fontSize: '14px',
					lineHeight: '1.5',
				}}
				role="tree"
				aria-label="Virtualized tree structure"
				aria-multiselectable={Boolean(selectedIds)}
				data-testid="virtualized-tree">
				<List
					defaultHeight={height}
					rowCount={flattenedNodes.length}
					rowHeight={rowHeight}
					rowComponent={VirtualizedRow}
					rowProps={rowProps}
					overscanCount={overscanCount}
				/>
			</div>
		);
	}
);

VirtualizedTree.displayName = 'VirtualizedTree';

export default VirtualizedTree;
