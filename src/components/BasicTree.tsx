/**
 * BasicTree Component
 *
 * A React component that renders parsed nodes as a hierarchical layout using
 * nested divs and Tailwind CSS. Displays nodes in a simple indented list format.
 *
 * @example
 * ```tsx
 * import { BasicTree } from './components/BasicTree';
 * import { parseAndBuildTree } from './utils/treeParser';
 *
 * const { tree } = parseAndBuildTree(`
 * Home
 * ├── About
 * └── Contact
 * `);
 *
 * <BasicTree nodes={tree} />
 * ```
 */
import React, { memo, useCallback, useMemo, useState } from 'react';

import {
	type TreeTheme,
	computeBulletThemeStyles,
	computeNodeThemeStyles,
	createTheme,
} from '../theme';
import { type EditingState, type TreeNode } from '../types/TreeNode';
import { EditButton, InlineEditInput } from './InlineEditInput';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the BasicTree component.
 */
export interface BasicTreeProps {
	/** Array of root-level tree nodes to render */
	nodes: TreeNode[];

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
}

/**
 * Props for the internal TreeNodeItem component.
 */
interface TreeNodeItemProps {
	/** The tree node to render */
	node: TreeNode;

	/** Indentation size in pixels per depth level */
	indentSize: number;

	/** Whether to show depth-based visual indicators */
	showDepthIndicators: boolean;

	/** Optional theme overrides for styling */
	theme?: Partial<TreeTheme>;

	/** Optional callback when a node is clicked */
	onNodeClick?: (node: TreeNode) => void;

	/** Optional callback when a node is clicked with the mouse event */
	onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;

	/** Optional custom render function for node labels */
	renderLabel?: (node: TreeNode) => React.ReactNode;

	/** Set of selected node IDs for visual highlighting */
	selectedIds?: Set<string>;

	// Inline editing props
	editable?: boolean;
	editingState?: EditingState;
	onNodeDoubleClick?: (node: TreeNode) => void;
	onEditValueChange?: (value: string) => void;
	onEditCommit?: () => void;
	onEditCancel?: () => void;
	showEditButton?: boolean;
	onEditButtonClick?: (node: TreeNode) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

// ============================================================================
// TreeNodeItem Component (Internal)
// ============================================================================

/**
 * Internal component for rendering a single tree node and its children recursively.
 * Memoized with React.memo() for performance optimization when handling large sitemaps.
 */
const TreeNodeItem = memo(function TreeNodeItem({
	node,
	indentSize,
	showDepthIndicators,
	theme,
	onNodeClick,
	onNodeClickWithEvent,
	renderLabel,
	selectedIds,
	// Inline editing props
	editable = false,
	editingState,
	onNodeDoubleClick,
	onEditValueChange,
	onEditCommit,
	onEditCancel,
	showEditButton,
	onEditButtonClick,
}: TreeNodeItemProps): React.ReactElement {
	const [isHovered, setIsHovered] = useState(false);

	// Memoize computed values to prevent unnecessary recalculations
	const hasChildren = useMemo(() => node.children && node.children.length > 0, [node.children]);

	const isSelected = useMemo(() => selectedIds?.has(node.id) ?? false, [selectedIds, node.id]);

	const isClickable = useMemo(
		() => Boolean(onNodeClick || onNodeClickWithEvent),
		[onNodeClick, onNodeClickWithEvent]
	);

	// Inline editing state - memoized
	const isNodeEditing = useMemo(
		() => editable && editingState?.editingId === node.id,
		[editable, editingState?.editingId, node.id]
	);

	const shouldShowEditButton = useMemo(
		() => editable && (showEditButton ?? true) && !isNodeEditing,
		[editable, showEditButton, isNodeEditing]
	);

	// Memoize event handlers with useCallback
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
					// Create a synthetic event with modifier keys
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

	const handleMouseEnter = useCallback(() => {
		setIsHovered(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovered(false);
	}, []);

	const handleEditButtonClickCb = useCallback(() => {
		if (onEditButtonClick) {
			onEditButtonClick(node);
		} else if (onNodeDoubleClick) {
			onNodeDoubleClick(node);
		}
	}, [onEditButtonClick, onNodeDoubleClick, node]);

	// Merge theme with indent override so prop indentSize wins
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

	// Memoize styles using centralized theme system
	const depthStyles = useMemo(
		() =>
			computeNodeThemeStyles(node.depth, {
				isSelected,
				showDepthIndicators,
				theme: mergedTheme,
			}),
		[node.depth, mergedTheme, showDepthIndicators, isSelected]
	);

	const fontSize = useMemo(
		() => Number(depthStyles.fontSize?.toString().replace('px', '')) || undefined,
		[depthStyles.fontSize]
	);

	// Determine if we need mouse handlers
	const needsMouseHandlers = shouldShowEditButton;

	// Render label content (either inline input or regular text)
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
			className={`tree-node ${isSelected ? 'tree-node--selected' : ''}`}
			data-node-id={node.id}
			data-depth={node.depth}
			data-selected={isSelected ? 'true' : undefined}>
			{/* Node Label */}
			<div
				className={`tree-node-label ${isSelected ? 'tree-node-label--selected' : ''}`}
				style={{
					...depthStyles,
					cursor: isClickable ? 'pointer' : 'default',
				}}
				onClick={isClickable ? handleClick : undefined}
				onDoubleClick={editable ? handleDoubleClick : undefined}
				onMouseEnter={needsMouseHandlers ? handleMouseEnter : undefined}
				onMouseLeave={needsMouseHandlers ? handleMouseLeave : undefined}
				role={isClickable ? 'button' : undefined}
				tabIndex={isClickable ? 0 : undefined}
				onKeyDown={isClickable ? handleKeyDown : undefined}
				aria-selected={isSelected}>
				{/* Depth indicator bullet */}
				{showDepthIndicators && (
					<span
						className="tree-node-bullet"
						style={{
							...computeBulletThemeStyles(node.depth, { theme: mergedTheme }),
							flexShrink: 0,
						}}
						aria-hidden="true"
					/>
				)}

				{/* Label content (input or text with optional edit button) */}
				{labelContent}

				{/* Children count indicator */}
				{hasChildren && (
					<span
						className="tree-node-children-count"
						style={{
							fontSize: '0.75em',
							marginLeft: '8px',
							opacity: 0.6,
						}}>
						({node.children!.length})
					</span>
				)}
			</div>

			{/* Render children recursively */}
			{hasChildren && (
				<div className="tree-node-children">
					{node.children!.map((child) => (
						<TreeNodeItem
							key={child.id}
							node={child}
							indentSize={indentSize}
							showDepthIndicators={showDepthIndicators}
							theme={theme}
							onNodeClick={onNodeClick}
							onNodeClickWithEvent={onNodeClickWithEvent}
							renderLabel={renderLabel}
							selectedIds={selectedIds}
							// Pass inline editing props
							editable={editable}
							editingState={editingState}
							onNodeDoubleClick={onNodeDoubleClick}
							onEditValueChange={onEditValueChange}
							onEditCommit={onEditCommit}
							onEditCancel={onEditCancel}
							showEditButton={showEditButton}
							onEditButtonClick={onEditButtonClick}
						/>
					))}
				</div>
			)}
		</div>
	);
});

// ============================================================================
// BasicTree Component
// ============================================================================

/**
 * BasicTree component renders a hierarchical tree structure as nested divs.
 *
 * Features:
 * - Recursive rendering of tree nodes
 * - Depth-based visual styling with color coding
 * - Configurable indentation
 * - Optional click handlers for interactivity
 * - Custom label rendering support
 * - Accessible keyboard navigation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BasicTree nodes={treeNodes} />
 *
 * // With click handler
 * <BasicTree
 *   nodes={treeNodes}
 *   onNodeClick={(node) => console.log('Clicked:', node.label)}
 * />
 *
 * // With custom styling
 * <BasicTree
 *   nodes={treeNodes}
 *   indentSize={32}
 *   showDepthIndicators={false}
 *   className="my-tree"
 * />
 *
 * // With custom label rendering
 * <BasicTree
 *   nodes={treeNodes}
 *   renderLabel={(node) => (
 *     <span>
 *       <strong>{node.label}</strong>
 *       {node.metadata?.category && ` (${node.metadata.category})`}
 *     </span>
 *   )}
 * />
 * ```
 */
export function BasicTree({
	nodes,
	className = '',
	indentSize = 24,
	showDepthIndicators = true,
	theme,
	onNodeClick,
	onNodeClickWithEvent,
	renderLabel,
	selectedIds,
	// Inline editing props
	editable = false,
	editingState,
	onNodeDoubleClick,
	onEditValueChange,
	onEditCommit,
	onEditCancel,
	showEditButton,
	onEditButtonClick,
}: BasicTreeProps): React.ReactElement {
	if (!nodes || nodes.length === 0) {
		return (
			<div
				className={`basic-tree basic-tree--empty ${className}`.trim()}
				style={{
					color: '#6b7280',
					fontStyle: 'italic',
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
			className={`basic-tree ${className}`.trim()}
			style={{
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				fontSize: '14px',
				lineHeight: '1.5',
			}}
			role="tree"
			aria-label="Tree structure"
			aria-multiselectable={Boolean(selectedIds)}>
			{nodes.map((node) => (
				<TreeNodeItem
					key={node.id}
					node={node}
					indentSize={indentSize}
					showDepthIndicators={showDepthIndicators}
					theme={theme}
					onNodeClick={onNodeClick}
					onNodeClickWithEvent={onNodeClickWithEvent}
					renderLabel={renderLabel}
					selectedIds={selectedIds}
					// Pass inline editing props
					editable={editable}
					editingState={editingState}
					onNodeDoubleClick={onNodeDoubleClick}
					onEditValueChange={onEditValueChange}
					onEditCommit={onEditCommit}
					onEditCancel={onEditCancel}
					showEditButton={showEditButton}
					onEditButtonClick={onEditButtonClick}
				/>
			))}
		</div>
	);
}

// Default export for convenience
export default BasicTree;
