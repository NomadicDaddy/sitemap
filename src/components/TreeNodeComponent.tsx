/**
 * TreeNodeComponent
 *
 * A modular, reusable React component for rendering individual tree nodes.
 * Supports recursive rendering of nested structures with customizable styling,
 * children, and interaction handlers.
 *
 * @example
 * ```tsx
 * import { TreeNodeComponent } from './components/TreeNodeComponent';
 *
 * const node = { id: 'node-1', label: 'Home', depth: 0, children: [...] };
 *
 * <TreeNodeComponent
 *   node={node}
 *   onNodeClick={(node) => console.log('Clicked:', node.label)}
 *   showDepthIndicators
 * />
 * ```
 */
import React, { memo, useCallback, useMemo, useState } from 'react';

import { computeBulletThemeStyles, createTheme } from '../theme';
import type { TreeTheme } from '../theme';
import { type EditingState, type NodeStyleOverrides, type TreeNode } from '../types/TreeNode';
import { EditButton, InlineEditInput } from './InlineEditInput';
import {
	DEFAULT_TREE_NODE_PROPS,
	computeBulletStyles,
	computeNodeStyles,
	getDepthColor,
} from './TreeNodeUtils';

// ============================================================================
// Types
// ============================================================================

/**
 * Depth-based color configuration for visual styling.
 */
/**
 * Props for the TreeNodeComponent.
 */
export interface TreeNodeComponentProps {
	/** The tree node to render */
	node: TreeNode;

	/** Indentation size in pixels per depth level (default: 24) */
	indentSize?: number;

	/** Whether to show depth-based visual indicators (default: true) */
	showDepthIndicators?: boolean;

	/** Optional callback when a node is clicked */
	onNodeClick?: (node: TreeNode) => void;

	/** Optional callback when a node receives hover */
	onNodeHover?: (node: TreeNode | null) => void;

	/** Optional callback when a node receives focus */
	onNodeFocus?: (node: TreeNode) => void;

	/** Optional callback when a node loses focus */
	onNodeBlur?: (node: TreeNode) => void;

	/** Optional custom render function for node labels */
	renderLabel?: (node: TreeNode) => React.ReactNode;

	/** Optional custom render function for the entire node content */
	renderContent?: (node: TreeNode, defaultContent: React.ReactNode) => React.ReactNode;

	/** Optional custom render function for children container */
	renderChildren?: (
		node: TreeNode,
		children: React.ReactNode[],
		defaultContainer: React.ReactNode
	) => React.ReactNode;

	/** Whether the node is currently selected */
	isSelected?: boolean;

	/** Whether the node is currently expanded (controls children visibility) */
	isExpanded?: boolean;

	/** Custom depth colors override */
	depthColors?: TreeTheme['depthColors'];

	/** Optional theme overrides for styling */
	theme?: Partial<TreeTheme>;

	/** Custom style overrides that take precedence over depth-based styling */
	styleOverrides?: NodeStyleOverrides;

	/** Additional CSS class name for the node container */
	className?: string;

	/** Additional CSS class name for the node label */
	labelClassName?: string;

	/** Font size in pixels (default: 14) */
	fontSize?: number;

	/** Whether to show children count indicator (default: true) */
	showChildrenCount?: boolean;

	/** Whether to render children recursively (default: true) */
	recursive?: boolean;

	/** Maximum depth to render (undefined = no limit) */
	maxDepth?: number;

	/** Custom data attributes to add to the node */
	dataAttributes?: Record<string, string>;

	/** ARIA role for the node (default: undefined, uses 'button' when clickable) */
	role?: string;

	/** ARIA label for the node */
	ariaLabel?: string;

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

// ============================================================================
// Default Values
// ============================================================================

// ============================================================================
// TreeNodeComponent
// ============================================================================

/**
 * TreeNodeComponent renders a single tree node and optionally its children recursively.
 *
 * Features:
 * - Recursive rendering of nested tree structures
 * - Depth-based visual styling with customizable color schemes
 * - Configurable indentation and appearance
 * - Click, hover, focus, and blur interaction handlers
 * - Custom label and content rendering support
 * - Accessible keyboard navigation (Enter/Space)
 * - Selection state visual feedback
 * - Expansion state for showing/hiding children
 * - Custom data attributes for integration
 * - Style overrides for individual nodes
 * - Performance optimized with React.memo() and useMemo()
 *
 * @example
 * ```tsx
 * // Basic usage with click handler
 * <TreeNodeComponent
 *   node={myNode}
 *   onNodeClick={(node) => console.log('Clicked:', node.label)}
 * />
 *
 * // With custom styling
 * <TreeNodeComponent
 *   node={myNode}
 *   indentSize={32}
 *   showDepthIndicators={true}
 *   styleOverrides={{ backgroundColor: '#f0f0f0' }}
 * />
 *
 * // With custom label rendering
 * <TreeNodeComponent
 *   node={myNode}
 *   renderLabel={(node) => (
 *     <span>
 *       <Icon name={node.metadata?.icon} />
 *       {node.label}
 *     </span>
 *   )}
 * />
 *
 * // Non-recursive (single node only)
 * <TreeNodeComponent
 *   node={myNode}
 *   recursive={false}
 * />
 * ```
 */
function TreeNodeComponentInner({
	node,
	indentSize = DEFAULT_TREE_NODE_PROPS.indentSize,
	showDepthIndicators = DEFAULT_TREE_NODE_PROPS.showDepthIndicators,
	onNodeClick,
	onNodeHover,
	onNodeFocus,
	onNodeBlur,
	renderLabel,
	renderContent,
	renderChildren,
	isSelected = false,
	isExpanded = true,
	depthColors,
	theme,
	styleOverrides,
	className = '',
	labelClassName = '',
	fontSize = DEFAULT_TREE_NODE_PROPS.fontSize,
	showChildrenCount = DEFAULT_TREE_NODE_PROPS.showChildrenCount,
	recursive = DEFAULT_TREE_NODE_PROPS.recursive,
	maxDepth,
	dataAttributes = {},
	role,
	ariaLabel,
	// Inline editing props
	editable = false,
	editingState,
	onNodeDoubleClick,
	onEditValueChange,
	onEditCommit,
	onEditCancel,
	showEditButton,
	onEditButtonClick,
}: TreeNodeComponentProps): React.ReactElement {
	// Hover state for showing edit button
	const [isHovered, setIsHovered] = useState(false);

	// Determine if this node is currently being edited
	const isNodeEditing = useMemo(
		() => editable && editingState?.editingId === node.id,
		[editable, editingState?.editingId, node.id]
	);

	// Compute whether to show edit button (defaults to true when editable)
	const shouldShowEditButton = useMemo(
		() => editable && (showEditButton ?? true) && !isNodeEditing,
		[editable, showEditButton, isNodeEditing]
	);
	// Memoize merged style overrides to prevent unnecessary recalculations
	const mergedStyleOverrides = useMemo<NodeStyleOverrides | undefined>(
		() => ({
			...node.metadata?.style,
			...styleOverrides,
		}),
		[node.metadata?.style, styleOverrides]
	);

	// Memoize computed values
	const hasChildren = useMemo(() => node.children && node.children.length > 0, [node.children]);

	const shouldRenderChildren = useMemo(
		() =>
			recursive &&
			hasChildren &&
			isExpanded &&
			(maxDepth === undefined || node.depth < maxDepth),
		[recursive, hasChildren, isExpanded, maxDepth, node.depth]
	);

	// Resolve theme with indent override
	const resolvedTheme = useMemo(() => {
		const base = createTheme(theme);
		return {
			...base,
			spacing: {
				...base.spacing,
				indentSize,
			},
		};
	}, [theme, indentSize]);

	// Memoize depth color calculation (fallback path)
	const depthColor = useMemo(
		() => getDepthColor(node.depth, depthColors),
		[node.depth, depthColors]
	);

	// Memoize node label styles
	const nodeStyles = useMemo(() => {
		const styles = computeNodeStyles(node.depth, {
			depthColors,
			fontSize,
			indentSize,
			isSelected,
			showDepthIndicators,
			styleOverrides: mergedStyleOverrides,
			theme: resolvedTheme,
		});
		if (onNodeClick) {
			styles.cursor = 'pointer';
		}
		return styles;
	}, [
		node.depth,
		depthColors,
		fontSize,
		indentSize,
		isSelected,
		mergedStyleOverrides,
		onNodeClick,
		resolvedTheme,
		showDepthIndicators,
	]);

	// Memoize event handlers with useCallback
	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			onNodeClick?.(node);
		},
		[onNodeClick, node]
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				event.stopPropagation();
				onNodeClick?.(node);
			}
		},
		[onNodeClick, node]
	);

	const handleMouseEnter = useCallback(() => {
		setIsHovered(true);
		onNodeHover?.(node);
	}, [onNodeHover, node]);

	const handleMouseLeave = useCallback(() => {
		setIsHovered(false);
		onNodeHover?.(null);
	}, [onNodeHover]);

	const handleFocus = useCallback(() => {
		onNodeFocus?.(node);
	}, [onNodeFocus, node]);

	const handleBlur = useCallback(() => {
		onNodeBlur?.(node);
	}, [onNodeBlur, node]);

	// Double-click handler for starting edit mode
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

	// Edit button click handler
	const handleEditButtonClick = useCallback(() => {
		if (onEditButtonClick) {
			onEditButtonClick(node);
		} else if (onNodeDoubleClick) {
			// Fall back to double-click handler if no edit button handler provided
			onNodeDoubleClick(node);
		}
	}, [onEditButtonClick, onNodeDoubleClick, node]);

	// Edit input change handler
	const handleEditInputChange = useCallback(
		(value: string) => {
			onEditValueChange?.(value);
		},
		[onEditValueChange]
	);

	// Edit commit handler
	const handleEditCommit = useCallback(() => {
		onEditCommit?.();
	}, [onEditCommit]);

	// Edit cancel handler
	const handleEditCancel = useCallback(() => {
		onEditCancel?.();
	}, [onEditCancel]);

	// Determine if clickable
	const isClickable = Boolean(onNodeClick);

	// Memoize data attributes
	const nodeDataAttributes = useMemo<Record<string, string>>(
		() => ({
			'data-depth': String(node.depth),
			'data-node-id': node.id,
			...dataAttributes,
		}),
		[node.id, node.depth, dataAttributes]
	);

	// Determine ARIA role
	const computedRole = role ?? (isClickable ? 'button' : undefined);

	// Memoize bullet styles
	const bulletStyles = useMemo(
		() =>
			theme || depthColors
				? computeBulletThemeStyles(node.depth, { theme: resolvedTheme })
				: computeBulletStyles(depthColor.border),
		[depthColor.border, depthColors, node.depth, resolvedTheme, theme]
	);

	// Memoize children count styles
	const childrenCountStyles = useMemo(
		() => ({
			fontSize: '0.75em',
			marginLeft: '8px',
			opacity: 0.6,
		}),
		[]
	);

	// Memoize the label text/input - with inline editing support
	const labelTextContent = useMemo(() => {
		if (isNodeEditing && editingState) {
			// Render inline edit input when editing
			return (
				<InlineEditInput
					value={editingState.editValue ?? ''}
					onChange={handleEditInputChange}
					onCommit={handleEditCommit}
					onCancel={handleEditCancel}
					fontSize={fontSize}
					ariaLabel={`Edit label for ${node.label}`}
				/>
			);
		}

		// Render regular label text when not editing
		return (
			<>
				<span className="tree-node-text">
					{renderLabel ? renderLabel(node) : node.label}
				</span>
				{/* Edit button (shown on hover when editable) */}
				{shouldShowEditButton && (
					<EditButton
						onClick={handleEditButtonClick}
						visible={isHovered}
						ariaLabel={`Edit ${node.label}`}
					/>
				)}
			</>
		);
	}, [
		isNodeEditing,
		editingState,
		handleEditInputChange,
		handleEditCommit,
		handleEditCancel,
		fontSize,
		node,
		renderLabel,
		shouldShowEditButton,
		handleEditButtonClick,
		isHovered,
	]);

	// Memoize the default label content
	const defaultLabelContent = useMemo(
		() => (
			<>
				{/* Depth indicator bullet */}
				{showDepthIndicators && (
					<span className="tree-node-bullet" style={bulletStyles} aria-hidden="true" />
				)}

				{/* Label text or edit input */}
				{labelTextContent}

				{/* Children count indicator */}
				{showChildrenCount && hasChildren && (
					<span
						className="tree-node-children-count"
						style={childrenCountStyles}
						aria-label={`${node.children!.length} children`}>
						({node.children!.length})
					</span>
				)}
			</>
		),
		[
			showDepthIndicators,
			bulletStyles,
			labelTextContent,
			showChildrenCount,
			hasChildren,
			childrenCountStyles,
			node.children,
		]
	);

	// Allow custom content rendering
	const labelContent = useMemo(
		() => (renderContent ? renderContent(node, defaultLabelContent) : defaultLabelContent),
		[renderContent, node, defaultLabelContent]
	);

	// Memoize children elements - uses the memoized TreeNodeComponent
	const childElements = useMemo(
		() =>
			shouldRenderChildren
				? node.children!.map((child) => (
						<TreeNodeComponent
							key={child.id}
							node={child}
							indentSize={indentSize}
							showDepthIndicators={showDepthIndicators}
							onNodeClick={onNodeClick}
							onNodeHover={onNodeHover}
							onNodeFocus={onNodeFocus}
							onNodeBlur={onNodeBlur}
							renderLabel={renderLabel}
							renderContent={renderContent}
							renderChildren={renderChildren}
							depthColors={depthColors}
							theme={theme}
							fontSize={fontSize}
							showChildrenCount={showChildrenCount}
							recursive={recursive}
							maxDepth={maxDepth}
							dataAttributes={dataAttributes}
							// Pass down inline editing props
							editable={editable}
							editingState={editingState}
							onNodeDoubleClick={onNodeDoubleClick}
							onEditValueChange={onEditValueChange}
							onEditCommit={onEditCommit}
							onEditCancel={onEditCancel}
							showEditButton={showEditButton}
							onEditButtonClick={onEditButtonClick}
						/>
					))
				: [],
		[
			shouldRenderChildren,
			node.children,
			indentSize,
			showDepthIndicators,
			onNodeClick,
			onNodeHover,
			onNodeFocus,
			onNodeBlur,
			renderLabel,
			renderContent,
			renderChildren,
			depthColors,
			theme,
			fontSize,
			showChildrenCount,
			recursive,
			maxDepth,
			dataAttributes,
			editable,
			editingState,
			onNodeDoubleClick,
			onEditValueChange,
			onEditCommit,
			onEditCancel,
			showEditButton,
			onEditButtonClick,
		]
	);

	// Memoize the default children container
	const defaultChildrenContainer = useMemo(
		() =>
			childElements.length > 0 ? (
				<div className="tree-node-children" role="group">
					{childElements}
				</div>
			) : null,
		[childElements]
	);

	// Allow custom children container rendering
	const childrenContainer = useMemo(
		() =>
			renderChildren && childElements.length > 0
				? renderChildren(node, childElements, defaultChildrenContainer)
				: defaultChildrenContainer,
		[renderChildren, childElements, node, defaultChildrenContainer]
	);

	// Memoize class names
	const nodeClassName = useMemo(() => `tree-node ${className}`.trim(), [className]);

	const labelClassNameComputed = useMemo(
		() => `tree-node-label ${labelClassName}`.trim(),
		[labelClassName]
	);

	// Determine if we need mouse handlers (for hover or edit button visibility)
	const needsMouseHandlers = Boolean(onNodeHover) || shouldShowEditButton;

	return (
		<div className={nodeClassName} {...nodeDataAttributes}>
			{/* Node Label Container */}
			<div
				className={labelClassNameComputed}
				style={nodeStyles}
				onClick={isClickable ? handleClick : undefined}
				onDoubleClick={editable ? handleDoubleClick : undefined}
				onKeyDown={isClickable ? handleKeyDown : undefined}
				onMouseEnter={needsMouseHandlers ? handleMouseEnter : undefined}
				onMouseLeave={needsMouseHandlers ? handleMouseLeave : undefined}
				onFocus={onNodeFocus ? handleFocus : undefined}
				onBlur={onNodeBlur ? handleBlur : undefined}
				role={computedRole}
				tabIndex={isClickable ? 0 : undefined}
				aria-label={ariaLabel}
				aria-expanded={hasChildren ? isExpanded : undefined}
				aria-selected={isSelected}>
				{labelContent}
			</div>

			{/* Children Container */}
			{childrenContainer}
		</div>
	);
}

/**
 * Memoized TreeNodeComponent for performance optimization.
 * Prevents unnecessary re-renders when handling large sitemaps with hundreds of nodes.
 */
export const TreeNodeComponent = memo(TreeNodeComponentInner);
// Default export for convenience
export default TreeNodeComponent;

// Export inner component for testing purposes if needed
export { TreeNodeComponentInner };
