/**
 * Type Definitions Index
 *
 * Re-exports all type definitions for convenient imports.
 * Import types from this file for cleaner imports:
 *
 * @example
 * import { TreeNode, ParseResult, isTreeNode } from './types';
 */

// Core Node Types
export type { TreeNode, ReadonlyTreeNode, NodeId } from './TreeNode';

// Metadata Types
export type { NodeMetadata, NodeCategory, NodeStyleOverrides } from './TreeNode';

// Parsing Types
export type { ParsedNode, ParseResult, ParseError, ParserOptions } from './TreeNode';

// Tree Operation Types
export type { TreeBuildResult, TraversalOptions, TraversalCallback } from './TreeNode';

// Selection & Interaction Types
export type { SelectionState, EditingState } from './TreeNode';

// Drag & Drop Types
export type { DropPosition, DragState } from './TreeNode';

// Utility Types
export type {
	ExtractNodeIds,
	PartialTreeNode,
	TreeNodeWithChildren,
	LeafNode,
	NodeUpdate,
	NodeFactory,
} from './TreeNode';

// Constants
export { DEFAULT_PARSER_OPTIONS, NODE_CATEGORIES } from './TreeNode';

// Type Guards
export { isTreeNode, isParsedNode, isNodeCategory, isParseResult } from './TreeNode';

// Helper Functions
export { createNodeId } from './TreeNode';
