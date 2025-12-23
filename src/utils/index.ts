/**
 * Utilities Index
 *
 * Re-exports all utility functions for convenient imports.
 */

export {
	parseTreeText,
	buildTreeHierarchy,
	parseAndBuildTree,
	countNodes,
	getMaxDepth,
	TREE_CHARS,
} from './treeParser';

// Re-export types from treeParser for convenience
export type { ParsedNode, ParseResult, ParseError, ParserOptions, TreeNode } from './treeParser';

// Sitemap generator utilities
export {
	generateSitemapNodes,
	generateSitemapText,
	treeNodesToText,
	calculateNodeCount,
	sampleSitemaps,
	DEFAULT_GENERATOR_OPTIONS,
} from './sitemapGenerator';

export type { SitemapGeneratorOptions } from './sitemapGenerator';

// Export utilities
export {
	exportD3TreeDiagramAsSvg,
	exportBasicTreeAsSvg,
	downloadSvg,
	copySvgToClipboard,
	type SvgExportOptions,
	type SvgExportResult,
} from './svgExport';

export {
	exportD3TreeDiagramAsPng,
	exportBasicTreeAsPng,
	downloadPng,
	copyPngToClipboard,
	type PngExportOptions,
	type PngExportResult,
} from './pngExport';

export {
	deleteNodes,
	changeNodesColor,
	addTagToNodes,
	modifyNodeProperties,
	toggleNodeExpanded,
	expandAllNodes,
	collapseAllNodes,
	filterCollapsedNodes,
	moveNode,
	isDescendant,
} from './treeOperations';

// Tree flattening utilities for virtualization
export { flattenTree, countVisibleNodes, type FlattenedNode } from './treeFlattening';

// Tree search utilities
export {
	searchTree,
	filterTreeByMatches,
	markMatchingNodes,
	getHighlightSegments,
	expandAncestors,
	countVisibleMatches,
	getMatchingNodesInOrder,
	getNextMatchId,
	getPreviousMatchId,
	DEFAULT_SEARCH_OPTIONS,
	DEFAULT_HIGHLIGHT_STYLE,
	type SearchOptions,
	type SearchField,
	type SearchResult,
	type MatchDetail,
	type HighlightConfig,
} from './treeSearch';
