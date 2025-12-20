/**
 * UX Sitemap Visualizer - Main Entry Point
 *
 * This library provides utilities for parsing text-based tree structures
 * and converting them into structured data for visualization.
 */

// Parser utilities
export {
	parseTreeText,
	buildTreeHierarchy,
	parseAndBuildTree,
	countNodes,
	getMaxDepth,
	TREE_CHARS,
	// Error handling exports
	validateTreeInput,
	parseTreeTextWithValidation,
	formatError,
	formatErrorReport,
	getErrorStats,
	createParseError,
	validateInput,
} from './utils/treeParser';

// Sitemap generator utilities
export {
	generateSitemapNodes,
	generateSitemapText,
	treeNodesToText,
	calculateNodeCount,
	sampleSitemaps,
	DEFAULT_GENERATOR_OPTIONS,
} from './utils/sitemapGenerator';

// React Components
export { BasicTree, type BasicTreeProps } from './components/BasicTree';

export { TreeNodeComponent, type TreeNodeComponentProps } from './components/TreeNodeComponent';

export {
	type DepthColorConfig,
	DEFAULT_DEPTH_COLORS,
	DEFAULT_TREE_NODE_PROPS,
	computeBulletStyles,
	computeNodeStyles,
	getDepthColor,
	useTreeNodeExpansion,
	useTreeNodeSelection,
} from './components/TreeNodeUtils';

// Theme system
export {
	createTheme,
	defaultTheme,
	type TreeTheme,
	type DepthColors,
	type DepthColorValue,
	type TypographyScale,
	type SpacingScale,
	type SelectionStyle,
	computeNodeThemeStyles,
	computeBulletThemeStyles,
	getDepthColor as getThemeDepthColor,
	getDepthFontSize,
} from './theme';

export { SitemapEditor, type SitemapEditorProps } from './components/SitemapEditor';

// React Hooks
export {
	useTreeParser,
	type UseTreeParserOptions,
	type UseTreeParserResult,
} from './hooks/useTreeParser';

// Types
export type {
	TreeNode,
	ParsedNode,
	ParseResult,
	ParseError,
	ParserOptions,
	NodeMetadata,
	NodeCategory,
	// Error types
	ParseErrorCode,
	ErrorSeverity,
} from './types/TreeNode';

export type { SitemapGeneratorOptions } from './utils/sitemapGenerator';

// Type guards and helpers
export {
	isTreeNode,
	isParsedNode,
	isNodeCategory,
	isParseResult,
	createNodeId,
	DEFAULT_PARSER_OPTIONS,
	NODE_CATEGORIES,
	// Error type guards and constants
	isParseErrorCode,
	isParseError,
	PARSE_ERROR_CODES,
} from './types/TreeNode';

// Error utilities (for advanced usage)
export {
	createDepthJumpError,
	createEmptyLabelError,
	createMixedIndentationError,
	createInconsistentIndentError,
	createOrphanedBranchError,
	createMalformedTreeCharsError,
	createDuplicateSiblingWarning,
	detectMixedIndentation,
	detectMalformedTreeChars,
	detectOrphanedBranches,
	validateTreeStructure,
	validateInputText,
} from './utils/parserErrors';
