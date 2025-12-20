/**
 * Parser Error Utilities
 *
 * Provides error detection, user-friendly error messages, and fix suggestions
 * for malformed tree structures in the UX Sitemap Visualizer.
 */
import {
	type ErrorSeverity,
	type ParseError,
	type ParseErrorCode,
	type ParsedNode,
	type ParserOptions,
} from '../types/TreeNode';
import { TREE_CHARS } from './treeParser';

// ============================================================================
// Error Message Templates
// ============================================================================

/**
 * Human-readable error messages for each error code.
 */
const ERROR_MESSAGES: Record<ParseErrorCode, string> = {
	DUPLICATE_SIBLING: 'This node has the same name as another sibling at the same level.',
	EMPTY_LABEL: 'A node has no label text. Each node must have a name or description.',
	INCONSISTENT_INDENT_SIZE:
		'The indentation spacing is inconsistent. Use the same number of spaces for each level.',
	INVALID_DEPTH_JUMP:
		'A node is nested too deeply. Each node can only be one level deeper than its parent.',
	INVALID_LINE_FORMAT:
		'This line could not be parsed. Check for unusual characters or formatting.',
	INVALID_TREE_CHARS:
		'Invalid tree drawing characters found. Use standard characters: ├──, └──, │',
	MALFORMED_TREE_CHARS:
		'Tree characters are malformed or in the wrong order. Check the structure markers.',
	MIXED_INDENTATION:
		'This file uses both tabs and spaces for indentation. Use one method consistently.',
	ORPHANED_BRANCH_MARKER:
		'A tree branch marker (├── or └──) appears without a parent node above it.',
	UNCLOSED_TREE_STRUCTURE:
		'The tree structure appears incomplete. Check for missing closing branches.',
};

/**
 * Suggestion templates for fixing each error type.
 */
const FIX_SUGGESTIONS: Record<ParseErrorCode, string> = {
	DUPLICATE_SIBLING:
		'Rename this node to distinguish it from its sibling, or merge the duplicate entries.',
	EMPTY_LABEL: 'Add a descriptive label for this node, or remove the empty line.',
	INCONSISTENT_INDENT_SIZE:
		'Use a consistent number of spaces (e.g., 2 or 4) for each indentation level.',
	INVALID_DEPTH_JUMP:
		'Add intermediate parent nodes, or reduce the indentation level of this node.',
	INVALID_LINE_FORMAT:
		'Remove any special characters and ensure the line follows the format: [indentation][label]',
	INVALID_TREE_CHARS:
		'Replace with valid tree characters: ├── for branches, └── for last branch, │ for continuation.',
	MALFORMED_TREE_CHARS:
		'Ensure tree characters follow the pattern: │ for vertical lines, then ├── or └── for branches.',
	MIXED_INDENTATION: 'Convert all indentation to either spaces or tabs throughout the document.',
	ORPHANED_BRANCH_MARKER:
		'Add a parent node above this line, or remove the branch marker and start a new root node.',
	UNCLOSED_TREE_STRUCTURE:
		'Ensure all branches have proper ending markers (└──) for the last child.',
};

// ============================================================================
// Error Creation Helpers
// ============================================================================

/**
 * Creates a ParseError object with all required fields and optional suggestions.
 */
export function createParseError(
	code: ParseErrorCode,
	lineNumber: number,
	lineContent: string,
	options: {
		severity?: ErrorSeverity;
		customMessage?: string;
		suggestion?: string;
		expected?: string;
		actual?: string;
	} = {}
): ParseError {
	return {
		actual: options.actual,
		code,
		expected: options.expected,
		lineContent,
		lineNumber,
		message: options.customMessage || ERROR_MESSAGES[code],
		severity: options.severity || 'error',
		suggestion: options.suggestion || FIX_SUGGESTIONS[code],
	};
}

/**
 * Creates an error for invalid depth jumps with detailed context.
 */
export function createDepthJumpError(
	lineNumber: number,
	lineContent: string,
	previousDepth: number,
	currentDepth: number
): ParseError {
	const jump = currentDepth - previousDepth;
	return createParseError('INVALID_DEPTH_JUMP', lineNumber, lineContent, {
		actual: `depth ${currentDepth}`,
		customMessage: `Invalid depth jump: node jumps ${jump} levels deep (from depth ${previousDepth} to ${currentDepth}). Maximum allowed jump is 1 level.`,
		expected: `depth ${previousDepth + 1} or less`,
		suggestion: `Add ${jump - 1} intermediate parent node(s), or reduce the indentation of this node.`,
	});
}

/**
 * Creates an error for empty labels.
 */
export function createEmptyLabelError(lineNumber: number, lineContent: string): ParseError {
	return createParseError('EMPTY_LABEL', lineNumber, lineContent, {
		suggestion:
			lineContent.trim().length === 0
				? 'This appears to be an empty line. If intentional, ensure "skipEmptyLines" option is enabled.'
				: 'The line only contains tree characters. Add a label after the tree markers (e.g., "├── My Label").',
	});
}

/**
 * Creates an error for mixed indentation (tabs and spaces).
 */
export function createMixedIndentationError(
	lineNumber: number,
	lineContent: string,
	hasTabs: boolean,
	hasSpaces: boolean
): ParseError {
	const predominant = hasTabs && hasSpaces ? 'both tabs and spaces' : hasTabs ? 'tabs' : 'spaces';
	return createParseError('MIXED_INDENTATION', lineNumber, lineContent, {
		customMessage: `Mixed indentation detected: this line uses ${predominant}.`,
		severity: 'warning',
		suggestion:
			'Choose either tabs OR spaces for indentation throughout your document. Spaces are recommended for consistency.',
	});
}

/**
 * Creates an error for inconsistent indent sizes.
 */
export function createInconsistentIndentError(
	lineNumber: number,
	lineContent: string,
	expectedSize: number,
	actualSize: number
): ParseError {
	return createParseError('INCONSISTENT_INDENT_SIZE', lineNumber, lineContent, {
		actual: `${actualSize} spaces`,
		customMessage: `Inconsistent indentation: expected ${expectedSize} spaces, found ${actualSize}.`,
		expected: `${expectedSize} spaces per indent level`,
		severity: 'warning',
		suggestion: `Adjust indentation to use exactly ${expectedSize} spaces per level.`,
	});
}

/**
 * Creates an error for orphaned branch markers.
 */
export function createOrphanedBranchError(lineNumber: number, lineContent: string): ParseError {
	return createParseError('ORPHANED_BRANCH_MARKER', lineNumber, lineContent, {
		customMessage:
			'Branch marker (├── or └──) found at the start of the file or after an empty section.',
		suggestion:
			'Add a root-level parent node above this line, or remove the branch marker to make this a root node.',
	});
}

/**
 * Creates an error for malformed tree characters.
 */
export function createMalformedTreeCharsError(
	lineNumber: number,
	lineContent: string,
	issue: string
): ParseError {
	return createParseError('MALFORMED_TREE_CHARS', lineNumber, lineContent, {
		customMessage: `Malformed tree structure: ${issue}`,
		suggestion: `Use proper tree markers: "${TREE_CHARS.BRANCH}" for items with siblings below, "${TREE_CHARS.LAST_BRANCH}" for the last item, "${TREE_CHARS.VERTICAL}" for continuation lines.`,
	});
}

/**
 * Creates a warning for duplicate sibling names.
 */
export function createDuplicateSiblingWarning(
	lineNumber: number,
	lineContent: string,
	duplicateLabel: string,
	firstOccurrenceLine: number
): ParseError {
	return createParseError('DUPLICATE_SIBLING', lineNumber, lineContent, {
		customMessage: `Duplicate sibling: "${duplicateLabel}" already exists at the same level (first defined on line ${firstOccurrenceLine}).`,
		severity: 'warning',
		suggestion: `Rename this node to distinguish it from its sibling, or consider merging them.`,
	});
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Detects mixed indentation (tabs and spaces) in the input text.
 */
export function detectMixedIndentation(lines: string[]): ParseError[] {
	const errors: ParseError[] = [];
	let firstTabLine: number | null = null;
	let firstSpaceLine: number | null = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNumber = i + 1;

		// Extract leading whitespace (before any tree characters)
		const leadingMatch = line.match(/^(\s*)/);
		if (!leadingMatch || leadingMatch[1].length === 0) continue;

		const leading = leadingMatch[1];
		const hasTabs = leading.includes('\t');
		const hasSpaces = leading.includes(' ');

		if (hasTabs && firstTabLine === null) firstTabLine = lineNumber;
		if (hasSpaces && firstSpaceLine === null) firstSpaceLine = lineNumber;

		// Single line with both tabs and spaces
		if (hasTabs && hasSpaces) {
			errors.push(createMixedIndentationError(lineNumber, line, true, true));
		}
	}

	// Document uses both tabs and spaces across different lines
	if (firstTabLine !== null && firstSpaceLine !== null && errors.length === 0) {
		// Add warning on the second type found
		const laterLine = Math.max(firstTabLine, firstSpaceLine);
		errors.push(
			createParseError('MIXED_INDENTATION', laterLine, lines[laterLine - 1], {
				customMessage: `Document uses mixed indentation: tabs first appear on line ${firstTabLine}, spaces on line ${firstSpaceLine}.`,
				severity: 'warning',
				suggestion:
					'Convert all indentation to either spaces or tabs throughout the document.',
			})
		);
	}

	return errors;
}

/**
 * Validates the structure of parsed nodes and returns detailed errors.
 */
export function validateTreeStructure(
	nodes: ParsedNode[],
	_options: ParserOptions = {}
): ParseError[] {
	// Note: options parameter reserved for future use
	const errors: ParseError[] = [];

	if (nodes.length === 0) return errors;

	// Track siblings at each depth level for duplicate detection
	const siblingsByDepth: Map<
		number,
		Map<string, { label: string; lineNumber: number }[]>
	> = new Map();

	// Track parent chain for validation
	const parentChain: { depth: number; lineNumber: number }[] = [];

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		const previousNode = i > 0 ? nodes[i - 1] : null;

		// 1. Check for depth jumps
		if (previousNode && node.depth > previousNode.depth + 1) {
			errors.push(
				createDepthJumpError(node.lineNumber, node.label, previousNode.depth, node.depth)
			);
		}

		// 2. Update parent chain and check for siblings
		while (parentChain.length > 0 && parentChain[parentChain.length - 1].depth >= node.depth) {
			parentChain.pop();
		}

		// Determine parent depth for sibling grouping
		const parentDepth = parentChain.length > 0 ? parentChain[parentChain.length - 1].depth : -1;
		const siblingKey = `${parentDepth}-${node.depth}`;

		if (!siblingsByDepth.has(node.depth)) {
			siblingsByDepth.set(node.depth, new Map());
		}

		const siblingsAtDepth = siblingsByDepth.get(node.depth)!;
		if (!siblingsAtDepth.has(siblingKey)) {
			siblingsAtDepth.set(siblingKey, []);
		}

		const siblings = siblingsAtDepth.get(siblingKey)!;

		// 3. Check for duplicate siblings
		const duplicate = siblings.find((s) => s.label.toLowerCase() === node.label.toLowerCase());
		if (duplicate) {
			errors.push(
				createDuplicateSiblingWarning(
					node.lineNumber,
					node.label,
					node.label,
					duplicate.lineNumber
				)
			);
		}

		siblings.push({ label: node.label, lineNumber: node.lineNumber });
		parentChain.push({ depth: node.depth, lineNumber: node.lineNumber });
	}

	return errors;
}

/**
 * Detects malformed tree characters in the input text.
 */
export function detectMalformedTreeChars(lines: string[]): ParseError[] {
	const errors: ParseError[] = [];

	// Note: Valid patterns defined here for future validation use
	// Currently only error patterns are used for detection

	// Patterns that indicate common mistakes
	const errorPatterns: { pattern: RegExp; issue: string }[] = [
		{
			issue: 'Branch marker "├─" is incomplete. Use "├──" (three characters).',
			pattern: /├─[^─]/,
		},
		{
			issue: 'Last branch marker "└─" is incomplete. Use "└──" (three characters).',
			pattern: /└─[^─]/,
		},
		{
			issue: 'Tree characters are in the wrong order. Branch marker should come first.',
			pattern: /──├/,
		},
		{
			issue: 'Tree characters are in the wrong order. Branch marker should come first.',
			pattern: /──└/,
		},
		{
			issue: 'Missing space after branch marker "├──". Add a space before the label.',
			pattern: /├──[^\s]/,
		},
		{
			issue: 'Missing space after last branch marker "└──". Add a space before the label.',
			pattern: /└──[^\s]/,
		},
		{
			issue: 'Branch marker without a label. Add content after the branch marker.',
			pattern: /[├└]──?\s*$/,
		},
		{
			issue: 'Too many horizontal lines. Use exactly two: "├──" or "└──".',
			pattern: /─{4,}/,
		},
	];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNumber = i + 1;

		// Skip empty lines
		if (line.trim().length === 0) continue;

		// Check for error patterns
		for (const { pattern, issue } of errorPatterns) {
			if (pattern.test(line)) {
				errors.push(createMalformedTreeCharsError(lineNumber, line, issue));
				break; // Only report first error per line
			}
		}
	}

	return errors;
}

/**
 * Detects orphaned branch markers (branches without parent).
 */
export function detectOrphanedBranches(lines: string[]): ParseError[] {
	const errors: ParseError[] = [];
	let hasRootNode = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNumber = i + 1;

		// Skip empty lines
		if (line.trim().length === 0) continue;

		// Check if this line starts with a branch marker
		const startsWithBranch = /^[├└]/.test(line.trim());

		if (startsWithBranch && !hasRootNode) {
			errors.push(createOrphanedBranchError(lineNumber, line));
		}

		// A line without leading tree characters is a potential root node
		if (!/^[\s│]*[├└]/.test(line)) {
			hasRootNode = true;
		}
	}

	return errors;
}

// ============================================================================
// Error Formatting
// ============================================================================

/**
 * Formats a single ParseError into a human-readable string.
 */
export function formatError(
	error: ParseError,
	options: { includeLineContent?: boolean; colorize?: boolean } = {}
): string {
	const { includeLineContent = true, colorize = false } = options;

	const severityLabel = error.severity === 'error' ? 'Error' : 'Warning';
	const prefix = colorize
		? error.severity === 'error'
			? '\x1b[31m' // Red for errors
			: '\x1b[33m' // Yellow for warnings
		: '';
	const reset = colorize ? '\x1b[0m' : '';

	let formatted = `${prefix}[${severityLabel}]${reset} Line ${error.lineNumber}: ${error.message}`;

	if (includeLineContent && error.lineContent) {
		formatted += `\n  > ${error.lineContent}`;
	}

	if (error.suggestion) {
		formatted += `\n  💡 Suggestion: ${error.suggestion}`;
	}

	if (error.expected && error.actual) {
		formatted += `\n  Expected: ${error.expected}`;
		formatted += `\n  Actual: ${error.actual}`;
	}

	return formatted;
}

/**
 * Formats multiple ParseErrors into a human-readable report.
 */
export function formatErrorReport(
	errors: ParseError[],
	options: { includeLineContent?: boolean; colorize?: boolean; groupBySeverity?: boolean } = {}
): string {
	const { groupBySeverity = true, ...formatOptions } = options;

	if (errors.length === 0) {
		return 'No errors found.';
	}

	let report = '';

	if (groupBySeverity) {
		const errorGroup = errors.filter((e) => e.severity === 'error');
		const warningGroup = errors.filter((e) => e.severity === 'warning');

		if (errorGroup.length > 0) {
			report += `=== Errors (${errorGroup.length}) ===\n\n`;
			report += errorGroup.map((e) => formatError(e, formatOptions)).join('\n\n');
			report += '\n';
		}

		if (warningGroup.length > 0) {
			if (report) report += '\n';
			report += `=== Warnings (${warningGroup.length}) ===\n\n`;
			report += warningGroup.map((e) => formatError(e, formatOptions)).join('\n\n');
		}
	} else {
		report = errors.map((e) => formatError(e, formatOptions)).join('\n\n');
	}

	const totalErrors = errors.filter((e) => e.severity === 'error').length;
	const totalWarnings = errors.filter((e) => e.severity === 'warning').length;

	report += `\n\n---\nTotal: ${totalErrors} error(s), ${totalWarnings} warning(s)`;

	return report;
}

/**
 * Gets error statistics from a list of parse errors.
 */
export function getErrorStats(errors: ParseError[]): {
	total: number;
	errors: number;
	warnings: number;
	byCode: Record<ParseErrorCode, number>;
} {
	const byCode: Record<ParseErrorCode, number> = {} as Record<ParseErrorCode, number>;

	for (const error of errors) {
		byCode[error.code] = (byCode[error.code] || 0) + 1;
	}

	return {
		byCode,
		errors: errors.filter((e) => e.severity === 'error').length,
		total: errors.length,
		warnings: errors.filter((e) => e.severity === 'warning').length,
	};
}

// ============================================================================
// Comprehensive Validation
// ============================================================================

/**
 * Performs comprehensive validation on input text, detecting all types of errors.
 * This runs before parsing to catch structural issues early.
 */
export function validateInputText(input: string, _options: ParserOptions = {}): ParseError[] {
	// Note: _options parameter reserved for future use with custom validation rules
	if (!input || input.trim() === '') {
		return [];
	}

	const lines = input.split(/\r?\n/);
	const allErrors: ParseError[] = [];

	// Run all detection functions
	allErrors.push(...detectMixedIndentation(lines));
	allErrors.push(...detectMalformedTreeChars(lines));
	allErrors.push(...detectOrphanedBranches(lines));

	// Sort by line number, then by severity (errors first)
	allErrors.sort((a, b) => {
		if (a.lineNumber !== b.lineNumber) {
			return a.lineNumber - b.lineNumber;
		}
		return a.severity === 'error' ? -1 : 1;
	});

	return allErrors;
}
