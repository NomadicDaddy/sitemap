/**
 * TreeNode Type Definitions
 *
 * Defines the data structures for representing tree nodes in the UX Sitemap Visualizer.
 * These types are used throughout the application for parsing, rendering, and manipulating
 * hierarchical sitemap structures.
 */

// ============================================================================
// Core Node Types
// ============================================================================

/**
 * Represents a single node in the tree structure.
 * This is the primary data type output by the text parser.
 */
export interface TreeNode {
	/** Unique identifier for the node */
	id: string;

	/** Display text/name of the node */
	label: string;

	/** Depth level in the hierarchy (0 = root level) */
	depth: number;

	/** Child nodes (optional, for hierarchical representation) */
	children?: TreeNode[];

	/** Additional metadata for extensibility */
	metadata?: NodeMetadata;
}

/**
 * A readonly version of TreeNode for immutable operations.
 */
export type ReadonlyTreeNode = Readonly<TreeNode> & {
	readonly children?: ReadonlyArray<ReadonlyTreeNode>;
	readonly metadata?: Readonly<NodeMetadata>;
};

/**
 * Unique identifier type for nodes.
 * Using branded type for better type safety.
 */
export type NodeId = string & { readonly __brand: 'NodeId' };

/**
 * Helper function to create a NodeId from a string.
 */
export function createNodeId(id: string): NodeId {
	return id as NodeId;
}

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * Metadata that can be attached to a node for additional information.
 */
export interface NodeMetadata {
	/** Node category (e.g., 'Page', 'Section', 'Component') */
	category?: NodeCategory;

	/** Original line number from the source text */
	lineNumber?: number;

	/** Whether the node is expanded in the UI */
	expanded?: boolean;

	/** Custom styling overrides */
	style?: NodeStyleOverrides;

	/** Optional tags associated with the node */
	tags?: string[];

	/** Any custom properties */
	[key: string]: unknown;
}

/**
 * Predefined categories for nodes based on their depth or purpose.
 */
export type NodeCategory = 'Page' | 'Section' | 'Component' | 'Element' | 'Custom';

/**
 * Array of all valid node categories for validation.
 */
export const NODE_CATEGORIES: readonly NodeCategory[] = [
	'Page',
	'Section',
	'Component',
	'Element',
	'Custom',
] as const;

/**
 * Custom style overrides for a specific node.
 */
export interface NodeStyleOverrides {
	/** Background color */
	backgroundColor?: string;
	/** Text color */
	textColor?: string;
	/** Border color */
	borderColor?: string;
	/** Custom CSS class name */
	className?: string;
}

// ============================================================================
// Parsing Types
// ============================================================================

/**
 * A flat representation of a parsed node, before building the tree hierarchy.
 * This is the intermediate format used during parsing.
 */
export interface ParsedNode {
	/** Unique identifier for the node */
	id: string;

	/** Display text/name of the node */
	label: string;

	/** Depth level in the hierarchy (0 = root level) */
	depth: number;

	/** Original line number from the source text */
	lineNumber: number;
}

/**
 * Result of parsing text input, including both nodes and any errors encountered.
 */
export interface ParseResult {
	/** Array of parsed nodes in flat format */
	nodes: ParsedNode[];

	/** Whether parsing was successful (true if no errors) */
	success: boolean;

	/** Array of error messages if any issues were encountered */
	errors: ParseError[];
}

/**
 * Error severity levels for parsing errors.
 */
export type ErrorSeverity = 'error' | 'warning';

/**
 * Error codes for specific parsing error types.
 * Using codes allows for internationalization and programmatic handling.
 */
export type ParseErrorCode =
	| 'INVALID_DEPTH_JUMP'
	| 'EMPTY_LABEL'
	| 'INVALID_LINE_FORMAT'
	| 'MIXED_INDENTATION'
	| 'INCONSISTENT_INDENT_SIZE'
	| 'ORPHANED_BRANCH_MARKER'
	| 'INVALID_TREE_CHARS'
	| 'UNCLOSED_TREE_STRUCTURE'
	| 'DUPLICATE_SIBLING'
	| 'MALFORMED_TREE_CHARS';

/**
 * Array of all valid parse error codes for validation.
 */
export const PARSE_ERROR_CODES: readonly ParseErrorCode[] = [
	'INVALID_DEPTH_JUMP',
	'EMPTY_LABEL',
	'INVALID_LINE_FORMAT',
	'MIXED_INDENTATION',
	'INCONSISTENT_INDENT_SIZE',
	'ORPHANED_BRANCH_MARKER',
	'INVALID_TREE_CHARS',
	'UNCLOSED_TREE_STRUCTURE',
	'DUPLICATE_SIBLING',
	'MALFORMED_TREE_CHARS',
] as const;

/**
 * Represents a parsing error with context information.
 */
export interface ParseError {
	/** Error code for programmatic identification */
	code: ParseErrorCode;

	/** Error message describing the issue */
	message: string;

	/** Line number where the error occurred (1-indexed) */
	lineNumber: number;

	/** The problematic line content */
	lineContent: string;

	/** Severity of the error (error = blocking, warning = non-blocking) */
	severity: ErrorSeverity;

	/** Optional suggestion for fixing the error */
	suggestion?: string;

	/** Optional expected format or value */
	expected?: string;

	/** Optional actual value found */
	actual?: string;
}

/**
 * Configuration options for the parser.
 */
export interface ParserOptions {
	/** Number of spaces that represent one level of indentation (default: 4) */
	indentSize?: number;

	/** Whether to trim whitespace from labels (default: true) */
	trimLabels?: boolean;

	/** Whether to skip empty lines (default: true) */
	skipEmptyLines?: boolean;

	/** Whether to generate automatic IDs (default: true) */
	generateIds?: boolean;
}

/**
 * Default parser options.
 */
export const DEFAULT_PARSER_OPTIONS: Required<ParserOptions> = {
	generateIds: true,
	indentSize: 4,
	skipEmptyLines: true,
	trimLabels: true,
};

// ============================================================================
// Tree Operation Types
// ============================================================================

/**
 * Represents the result of building a tree from parsed nodes.
 */
export interface TreeBuildResult {
	/** The root nodes of the tree (can be multiple for forest-like structures) */
	roots: TreeNode[];

	/** Total number of nodes in the tree */
	nodeCount: number;

	/** Maximum depth encountered */
	maxDepth: number;
}

/**
 * Options for traversing the tree.
 */
export interface TraversalOptions {
	/** Traversal order: 'pre' for pre-order (parent first), 'post' for post-order (children first) */
	order?: 'pre' | 'post';

	/** Maximum depth to traverse (undefined = no limit) */
	maxDepth?: number;

	/** Filter function to skip certain nodes */
	filter?: (node: TreeNode) => boolean;
}

/**
 * Callback function type for tree traversal.
 */
export type TraversalCallback = (node: TreeNode, depth: number, path: TreeNode[]) => void | boolean;

// ============================================================================
// Selection & Interaction Types
// ============================================================================

/**
 * Represents the selection state in the tree.
 */
export interface SelectionState {
	/** Set of selected node IDs */
	selectedIds: Set<string>;

	/** The ID of the last selected node (for shift-click range selection) */
	lastSelectedId?: string;

	/** The ID of the focused node (for keyboard navigation) */
	focusedId?: string;
}

/**
 * Represents the editing state for inline node editing.
 */
export interface EditingState {
	/** The ID of the node currently being edited (undefined if not editing) */
	editingId?: string;

	/** The current value being edited */
	editValue?: string;
}

// ============================================================================
// Drag & Drop Types
// ============================================================================

/**
 * Position for drop operations.
 */
export type DropPosition = 'before' | 'after' | 'inside';

/**
 * Represents the state during a drag operation.
 */
export interface DragState {
	/** The ID of the node being dragged */
	draggedId: string;

	/** The ID of the current drop target node */
	targetId?: string;

	/** Where to drop relative to the target */
	position?: DropPosition;

	/** Whether the drop is currently valid */
	isValidDrop: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid TreeNode.
 */
export function isTreeNode(value: unknown): value is TreeNode {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		typeof obj.id === 'string' &&
		typeof obj.label === 'string' &&
		typeof obj.depth === 'number' &&
		(obj.children === undefined || Array.isArray(obj.children)) &&
		(obj.metadata === undefined || typeof obj.metadata === 'object')
	);
}

/**
 * Type guard to check if a value is a valid ParsedNode.
 */
export function isParsedNode(value: unknown): value is ParsedNode {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		typeof obj.id === 'string' &&
		typeof obj.label === 'string' &&
		typeof obj.depth === 'number' &&
		typeof obj.lineNumber === 'number'
	);
}

/**
 * Type guard to check if a value is a valid NodeCategory.
 */
export function isNodeCategory(value: unknown): value is NodeCategory {
	return NODE_CATEGORIES.includes(value as NodeCategory);
}

/**
 * Type guard to check if a value is a valid ParseResult.
 */
export function isParseResult(value: unknown): value is ParseResult {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		Array.isArray(obj.nodes) && typeof obj.success === 'boolean' && Array.isArray(obj.errors)
	);
}

/**
 * Type guard to check if a value is a valid ParseErrorCode.
 */
export function isParseErrorCode(value: unknown): value is ParseErrorCode {
	return PARSE_ERROR_CODES.includes(value as ParseErrorCode);
}

/**
 * Type guard to check if a value is a valid ParseError.
 */
export function isParseError(value: unknown): value is ParseError {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		isParseErrorCode(obj.code) &&
		typeof obj.message === 'string' &&
		typeof obj.lineNumber === 'number' &&
		typeof obj.lineContent === 'string' &&
		(obj.severity === 'error' || obj.severity === 'warning')
	);
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extracts all node IDs from a tree structure recursively.
 */
export type ExtractNodeIds<T extends TreeNode> =
	| T['id']
	| (T['children'] extends TreeNode[] ? ExtractNodeIds<T['children'][number]> : never);

/**
 * A partial TreeNode for creating or updating nodes.
 */
export type PartialTreeNode = Partial<TreeNode> & Pick<TreeNode, 'id'>;

/**
 * TreeNode with required children (for nodes that must have children).
 */
export type TreeNodeWithChildren = TreeNode & { children: TreeNode[] };

/**
 * TreeNode without children (leaf node type).
 */
export type LeafNode = Omit<TreeNode, 'children'>;

/**
 * Update payload for modifying a node.
 */
export interface NodeUpdate {
	/** The ID of the node to update */
	id: string;

	/** Partial node data to merge */
	changes: Partial<Omit<TreeNode, 'id'>>;
}

/**
 * Factory function signature for creating new nodes.
 */
export type NodeFactory = (
	label: string,
	depth: number,
	options?: Partial<Omit<TreeNode, 'id' | 'label' | 'depth'>>
) => TreeNode;
