/**
 * Tree Parser Utility
 *
 * Parses raw text input with indentation markers (├──, └──, │, spaces)
 * and converts it into a structured array of node objects with depth and label properties.
 *
 * This is the foundation for all visualization features in the UX Sitemap Visualizer.
 *
 * @example
 * Input:
 * ```
 * Home
 * ├── About
 * │   ├── Team
 * │   └── History
 * └── Contact
 * ```
 *
 * Output:
 * ```
 * [
 *   { id: '1', label: 'Home', depth: 0, lineNumber: 1 },
 *   { id: '2', label: 'About', depth: 1, lineNumber: 2 },
 *   { id: '3', label: 'Team', depth: 2, lineNumber: 3 },
 *   { id: '4', label: 'History', depth: 2, lineNumber: 4 },
 *   { id: '5', label: 'Contact', depth: 1, lineNumber: 5 },
 * ]
 * ```
 */
import {
	DEFAULT_PARSER_OPTIONS,
	type ParseError,
	type ParseResult,
	type ParsedNode,
	type ParserOptions,
	type TreeNode,
} from '../types/TreeNode';
import {
	createEmptyLabelError,
	createParseError,
	validateInputText,
	validateTreeStructure,
} from './parserErrors';

/**
 * Unicode tree drawing characters used for indentation markers.
 * Exported for use by consumers who need to generate tree text.
 */
export const TREE_CHARS = {
	BRANCH: '├──',
	// Vertical line (continuation from parent)
	HORIZONTAL: '─',

	// Branch connector (has siblings below)
	LAST_BRANCH: '└──',
	// Last branch connector (no siblings below)
	VERTICAL: '│', // Horizontal line (part of connector)
} as const;

/**
 * Pattern to match tree indentation markers and extract the label.
 * Matches: ├──, └──, │, and leading spaces/tabs
 */
const INDENTATION_PATTERN = /^([\s│├└─]*)(.*?)$/;

/**
 * Pattern to identify tree drawing characters that indicate depth.
 */
const DEPTH_MARKER_PATTERN = /[│├└]/g;

/**
 * Generates a unique ID for a node.
 * @param index - The index/sequence number for the node
 * @returns A unique string identifier
 */
function generateNodeId(index: number): string {
	return `node-${index}`;
}

/**
 * Calculates the depth of a node based on its indentation pattern.
 *
 * The depth is determined by counting the number of tree structure markers
 * (├ or └) which indicate branch points in the hierarchy.
 *
 * @param indentation - The indentation/prefix portion of the line
 * @param options - Parser options including indentSize
 * @returns The calculated depth (0 = root level)
 */
function calculateDepth(indentation: string, options: Required<ParserOptions>): number {
	// If no indentation at all, it's a root-level node
	if (!indentation || indentation.length === 0) {
		return 0;
	}

	// Count tree structure markers (│, ├, └) to determine depth
	const branchMarkers = indentation.match(DEPTH_MARKER_PATTERN);
	const treeMarkerCount = branchMarkers ? branchMarkers.length : 0;

	if (treeMarkerCount > 0) {
		// If we have tree markers, also check for leading spaces before the first tree marker
		// This handles mixed format where spaces come before tree markers (e.g., "    ├── Label")
		const leadingSpaces = indentation.match(/^[\s]*/)?.[0] || '';
		const leadingSpaceCount = leadingSpaces.replace(/\t/g, '    ').length;
		const leadingSpaceDepth = Math.floor(leadingSpaceCount / options.indentSize);

		return treeMarkerCount + leadingSpaceDepth;
	}

	// Fallback: Calculate depth based on leading spaces/tabs only
	// This handles pure space-based indentation without tree characters
	const spaceCount = indentation.replace(/\t/g, '    ').length; // Convert tabs to 4 spaces
	return Math.floor(spaceCount / options.indentSize);
}

/**
 * Extracts the label (node name) from a line, removing tree drawing characters.
 *
 * @param line - The full line of text
 * @param trimLabels - Whether to trim whitespace from the label
 * @returns The extracted label text
 */
function extractLabel(line: string, trimLabels: boolean): string {
	// Remove tree drawing characters and extract the label
	let label = line
		.replace(/[├└│]/g, '') // Remove tree structure characters
		.replace(/─+/g, ''); // Remove horizontal lines

	if (trimLabels) {
		label = label.trim();
	} else {
		// When not trimming, only remove leading whitespace (indentation),
		// but preserve any trailing whitespace the user may have intended
		label = label.replace(/^\s+/, '');
	}

	return label;
}

/**
 * Checks if a line is empty or contains only tree drawing characters.
 *
 * @param line - The line to check
 * @returns True if the line should be skipped
 */
function isEmptyLine(line: string): boolean {
	// Remove all tree characters and whitespace, check if anything remains
	const content = line.replace(/[├└│─\s]/g, '').trim();
	return content.length === 0;
}

/**
 * Validates the structure of parsed nodes for consistency.
 * Uses the comprehensive validation from parserErrors module.
 *
 * @param nodes - Array of parsed nodes
 * @param options - Parser options for context
 * @returns Array of validation errors (empty if valid)
 */
function validateStructure(nodes: ParsedNode[], options: ParserOptions = {}): ParseError[] {
	return validateTreeStructure(nodes, options);
}

/**
 * Parses raw text input into a flat array of parsed nodes.
 *
 * This is the main parsing function that handles text with indentation markers
 * (├──, └──, │, spaces) and converts it into structured node objects.
 *
 * @param input - Raw text input with tree structure
 * @param options - Optional parser configuration
 * @returns ParseResult containing nodes and any errors
 *
 * @example
 * ```typescript
 * const result = parseTreeText(`
 * Home
 * ├── Products
 * │   ├── Category A
 * │   └── Category B
 * └── Contact
 * `);
 *
 * console.log(result.nodes);
 * // [
 * //   { id: 'node-1', label: 'Home', depth: 0, lineNumber: 2 },
 * //   { id: 'node-2', label: 'Products', depth: 1, lineNumber: 3 },
 * //   { id: 'node-3', label: 'Category A', depth: 2, lineNumber: 4 },
 * //   { id: 'node-4', label: 'Category B', depth: 2, lineNumber: 5 },
 * //   { id: 'node-5', label: 'Contact', depth: 1, lineNumber: 6 },
 * // ]
 * ```
 */
export function parseTreeText(input: string, options: ParserOptions = {}): ParseResult {
	const opts: Required<ParserOptions> = {
		...DEFAULT_PARSER_OPTIONS,
		...options,
	};

	const nodes: ParsedNode[] = [];
	const errors: ParseError[] = [];

	// Handle empty input
	if (!input || input.trim() === '') {
		return { errors: [], nodes: [], success: true };
	}

	// Split input into lines
	const lines = input.split(/\r?\n/);
	let nodeIndex = 0;

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex];
		const lineNumber = lineIndex + 1; // 1-indexed line numbers

		// Skip empty lines if configured
		if (opts.skipEmptyLines && isEmptyLine(line)) {
			continue;
		}

		// Match the line against the indentation pattern
		const match = line.match(INDENTATION_PATTERN);
		if (!match) {
			// This shouldn't happen with our pattern, but handle it gracefully
			errors.push(
				createParseError('INVALID_LINE_FORMAT', lineNumber, line, {
					customMessage:
						'Unable to parse line format. The line contains unexpected characters.',
					suggestion:
						'Check for unusual Unicode characters or formatting issues in this line.',
				})
			);
			continue;
		}

		const [, indentation] = match;
		const label = extractLabel(line, opts.trimLabels);

		// Skip if label is empty after extraction
		if (!label) {
			if (!opts.skipEmptyLines) {
				errors.push(createEmptyLabelError(lineNumber, line));
			}
			continue;
		}

		// Calculate depth from indentation
		const depth = calculateDepth(indentation, opts);

		// Create the node
		const node: ParsedNode = {
			depth,
			id: opts.generateIds ? generateNodeId(++nodeIndex) : String(nodeIndex++),
			label,
			lineNumber,
		};

		nodes.push(node);
	}

	// Validate structure
	const structureErrors = validateStructure(nodes, opts);
	errors.push(...structureErrors);

	return {
		errors,
		nodes,
		success: errors.filter((e) => e.severity === 'error').length === 0,
	};
}

/**
 * Converts a flat array of parsed nodes into a hierarchical tree structure.
 *
 * @param nodes - Flat array of parsed nodes
 * @returns Array of root-level TreeNode objects with nested children
 *
 * @example
 * ```typescript
 * const flatNodes = [
 *   { id: '1', label: 'Home', depth: 0, lineNumber: 1 },
 *   { id: '2', label: 'About', depth: 1, lineNumber: 2 },
 *   { id: '3', label: 'Contact', depth: 1, lineNumber: 3 },
 * ];
 *
 * const tree = buildTreeHierarchy(flatNodes);
 * // [
 * //   {
 * //     id: '1', label: 'Home', depth: 0,
 * //     children: [
 * //       { id: '2', label: 'About', depth: 1 },
 * //       { id: '3', label: 'Contact', depth: 1 },
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function buildTreeHierarchy(nodes: ParsedNode[]): TreeNode[] {
	if (nodes.length === 0) {
		return [];
	}

	const rootNodes: TreeNode[] = [];
	const stack: TreeNode[] = [];

	for (const node of nodes) {
		const treeNode: TreeNode = {
			depth: node.depth,
			id: node.id,
			label: node.label,
			metadata: {
				lineNumber: node.lineNumber,
			},
		};

		// Pop nodes from stack until we find the parent (node with depth - 1)
		while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
			stack.pop();
		}

		if (stack.length === 0) {
			// This is a root-level node
			rootNodes.push(treeNode);
		} else {
			// Add as child of the node at the top of the stack
			const parent = stack[stack.length - 1];
			if (!parent.children) {
				parent.children = [];
			}
			parent.children.push(treeNode);
		}

		// Push current node onto stack
		stack.push(treeNode);
	}

	return rootNodes;
}

/**
 * Convenience function that parses text and builds the tree hierarchy in one step.
 *
 * @param input - Raw text input with tree structure
 * @param options - Optional parser configuration
 * @returns Object containing the tree hierarchy and any parsing errors
 *
 * @example
 * ```typescript
 * const { tree, errors } = parseAndBuildTree(`
 * Home
 * ├── About
 * └── Contact
 * `);
 * ```
 */
export function parseAndBuildTree(
	input: string,
	options: ParserOptions = {}
): { tree: TreeNode[]; errors: ParseError[]; success: boolean } {
	const parseResult = parseTreeText(input, options);
	const tree = buildTreeHierarchy(parseResult.nodes);

	return {
		errors: parseResult.errors,
		success: parseResult.success,
		tree,
	};
}

/**
 * Counts the total number of nodes in a tree hierarchy.
 *
 * @param nodes - Array of root-level tree nodes
 * @returns Total count of all nodes including nested children
 */
export function countNodes(nodes: TreeNode[]): number {
	let count = 0;

	function traverse(nodeList: TreeNode[]): void {
		for (const node of nodeList) {
			count++;
			if (node.children) {
				traverse(node.children);
			}
		}
	}

	traverse(nodes);
	return count;
}

/**
 * Gets the maximum depth of the tree.
 *
 * @param nodes - Array of root-level tree nodes
 * @returns Maximum depth found in the tree (0 if empty)
 */
export function getMaxDepth(nodes: TreeNode[]): number {
	let maxDepth = 0;

	function traverse(nodeList: TreeNode[]): void {
		for (const node of nodeList) {
			if (node.depth > maxDepth) {
				maxDepth = node.depth;
			}
			if (node.children) {
				traverse(node.children);
			}
		}
	}

	traverse(nodes);
	return maxDepth;
}

/**
 * Validates input text before parsing to detect structural issues early.
 * This is a comprehensive validation that checks for common mistakes.
 *
 * @param input - Raw text input with tree structure
 * @param options - Optional parser configuration
 * @returns Object containing validation results and any errors found
 *
 * @example
 * ```typescript
 * const validation = validateTreeInput(`
 * ├── Orphaned Branch
 * `);
 *
 * if (!validation.valid) {
 *   console.log(validation.errors);
 *   // Shows: orphaned branch marker error with suggestion
 * }
 * ```
 */
export function validateTreeInput(
	input: string,
	options: ParserOptions = {}
): { valid: boolean; errors: ParseError[]; warnings: ParseError[] } {
	const allErrors = validateInputText(input, options);

	const errors = allErrors.filter((e) => e.severity === 'error');
	const warnings = allErrors.filter((e) => e.severity === 'warning');

	return {
		errors,
		valid: errors.length === 0,
		warnings,
	};
}

/**
 * Parses text with comprehensive validation, returning detailed error information.
 * This is the recommended function for parsing with full error reporting.
 *
 * @param input - Raw text input with tree structure
 * @param options - Optional parser configuration
 * @returns Complete parsing result with detailed errors and warnings
 *
 * @example
 * ```typescript
 * const result = parseTreeTextWithValidation(`
 * Home
 * ├── About
 * │   │   └── Deep Node
 * └── Contact
 * `);
 *
 * if (!result.success) {
 *   // Access user-friendly error messages with suggestions
 *   result.errors.forEach(error => {
 *     console.log(error.message);
 *     console.log('Suggestion:', error.suggestion);
 *   });
 * }
 * ```
 */
export function parseTreeTextWithValidation(
	input: string,
	options: ParserOptions = {}
): ParseResult & { warnings: ParseError[] } {
	// Run pre-parsing validation
	const preValidation = validateInputText(input, options);

	// Run normal parsing
	const parseResult = parseTreeText(input, options);

	// Combine errors, avoiding duplicates based on line number and code
	const seenErrors = new Set<string>();
	const allErrors: ParseError[] = [];

	// Add pre-validation errors first
	for (const error of preValidation) {
		const key = `${error.lineNumber}-${error.code}`;
		if (!seenErrors.has(key)) {
			seenErrors.add(key);
			allErrors.push(error);
		}
	}

	// Add parsing errors
	for (const error of parseResult.errors) {
		const key = `${error.lineNumber}-${error.code}`;
		if (!seenErrors.has(key)) {
			seenErrors.add(key);
			allErrors.push(error);
		}
	}

	// Sort by line number
	allErrors.sort((a, b) => a.lineNumber - b.lineNumber);

	const errors = allErrors.filter((e) => e.severity === 'error');
	const warnings = allErrors.filter((e) => e.severity === 'warning');

	return {
		errors: allErrors,
		nodes: parseResult.nodes,
		success: errors.length === 0,
		warnings,
	};
}

// Re-export types for convenience
export type {
	ParsedNode,
	ParseResult,
	ParseError,
	ParserOptions,
	TreeNode,
	ParseErrorCode,
	ErrorSeverity,
} from '../types/TreeNode';

// Re-export error utilities for consumers
export {
	createParseError,
	formatError,
	formatErrorReport,
	getErrorStats,
	validateInputText as validateInput,
} from './parserErrors';
