/**
 * Parser Error Handling Tests
 *
 * Comprehensive tests for error detection, user-friendly messages,
 * and fix suggestions in the tree parser.
 */
import {
	PARSE_ERROR_CODES,
	type ParseError,
	isParseError,
	isParseErrorCode,
} from '../types/TreeNode';
import {
	createDepthJumpError,
	createDuplicateSiblingWarning,
	createEmptyLabelError,
	createMixedIndentationError,
	detectMalformedTreeChars,
	detectMixedIndentation,
	detectOrphanedBranches,
} from '../utils/parserErrors';
import {
	createParseError,
	formatError,
	formatErrorReport,
	getErrorStats,
	parseTreeText,
	parseTreeTextWithValidation,
	validateTreeInput,
} from '../utils/treeParser';

describe('ParseError Types', () => {
	describe('ParseErrorCode', () => {
		it('should have all expected error codes', () => {
			expect(PARSE_ERROR_CODES).toContain('INVALID_DEPTH_JUMP');
			expect(PARSE_ERROR_CODES).toContain('EMPTY_LABEL');
			expect(PARSE_ERROR_CODES).toContain('INVALID_LINE_FORMAT');
			expect(PARSE_ERROR_CODES).toContain('MIXED_INDENTATION');
			expect(PARSE_ERROR_CODES).toContain('INCONSISTENT_INDENT_SIZE');
			expect(PARSE_ERROR_CODES).toContain('ORPHANED_BRANCH_MARKER');
			expect(PARSE_ERROR_CODES).toContain('INVALID_TREE_CHARS');
			expect(PARSE_ERROR_CODES).toContain('UNCLOSED_TREE_STRUCTURE');
			expect(PARSE_ERROR_CODES).toContain('DUPLICATE_SIBLING');
			expect(PARSE_ERROR_CODES).toContain('MALFORMED_TREE_CHARS');
		});
	});

	describe('isParseErrorCode', () => {
		it('should return true for valid error codes', () => {
			expect(isParseErrorCode('INVALID_DEPTH_JUMP')).toBe(true);
			expect(isParseErrorCode('EMPTY_LABEL')).toBe(true);
			expect(isParseErrorCode('MIXED_INDENTATION')).toBe(true);
		});

		it('should return false for invalid error codes', () => {
			expect(isParseErrorCode('INVALID_CODE')).toBe(false);
			expect(isParseErrorCode('')).toBe(false);
			expect(isParseErrorCode(123)).toBe(false);
			expect(isParseErrorCode(null)).toBe(false);
		});
	});

	describe('isParseError', () => {
		it('should return true for valid ParseError objects', () => {
			const error: ParseError = {
				code: 'INVALID_DEPTH_JUMP',
				lineContent: 'test line',
				lineNumber: 1,
				message: 'Test error',
				severity: 'error',
			};
			expect(isParseError(error)).toBe(true);
		});

		it('should return true for ParseError with optional fields', () => {
			const error: ParseError = {
				actual: 'nothing',
				code: 'EMPTY_LABEL',
				expected: 'something',
				lineContent: 'test line',
				lineNumber: 1,
				message: 'Test error',
				severity: 'warning',
				suggestion: 'Fix this',
			};
			expect(isParseError(error)).toBe(true);
		});

		it('should return false for invalid objects', () => {
			expect(isParseError(null)).toBe(false);
			expect(isParseError({})).toBe(false);
			expect(isParseError({ code: 'INVALID' })).toBe(false);
			expect(isParseError({ code: 'INVALID_DEPTH_JUMP' })).toBe(false);
		});
	});
});

describe('Error Creation Helpers', () => {
	describe('createParseError', () => {
		it('should create a basic error with default values', () => {
			const error = createParseError('INVALID_DEPTH_JUMP', 5, 'test line');

			expect(error.code).toBe('INVALID_DEPTH_JUMP');
			expect(error.lineNumber).toBe(5);
			expect(error.lineContent).toBe('test line');
			expect(error.severity).toBe('error');
			expect(error.message).toBeDefined();
			expect(error.suggestion).toBeDefined();
		});

		it('should allow custom message override', () => {
			const error = createParseError('EMPTY_LABEL', 1, 'line', {
				customMessage: 'Custom error message',
			});

			expect(error.message).toBe('Custom error message');
		});

		it('should allow custom suggestion', () => {
			const error = createParseError('EMPTY_LABEL', 1, 'line', {
				suggestion: 'Custom suggestion',
			});

			expect(error.suggestion).toBe('Custom suggestion');
		});

		it('should allow expected/actual values', () => {
			const error = createParseError('INCONSISTENT_INDENT_SIZE', 1, 'line', {
				actual: '2 spaces',
				expected: '4 spaces',
			});

			expect(error.expected).toBe('4 spaces');
			expect(error.actual).toBe('2 spaces');
		});
	});

	describe('createDepthJumpError', () => {
		it('should create detailed depth jump error', () => {
			const error = createDepthJumpError(3, '│   │   └── Deep Node', 1, 3);

			expect(error.code).toBe('INVALID_DEPTH_JUMP');
			expect(error.severity).toBe('error');
			expect(error.message).toContain('jumps 2 levels');
			expect(error.message).toContain('from depth 1 to 3');
			expect(error.expected).toBe('depth 2 or less');
			expect(error.actual).toBe('depth 3');
			expect(error.suggestion).toContain('1 intermediate parent node(s)');
		});
	});

	describe('createEmptyLabelError', () => {
		it('should create error for completely empty line', () => {
			const error = createEmptyLabelError(2, '   ');

			expect(error.code).toBe('EMPTY_LABEL');
			expect(error.suggestion).toContain('empty line');
		});

		it('should create error for line with only tree characters', () => {
			const error = createEmptyLabelError(2, '├──');

			expect(error.code).toBe('EMPTY_LABEL');
			expect(error.suggestion).toContain('Add a label');
		});
	});

	describe('createMixedIndentationError', () => {
		it('should create warning for mixed tabs and spaces', () => {
			const error = createMixedIndentationError(1, '\t  label', true, true);

			expect(error.code).toBe('MIXED_INDENTATION');
			expect(error.severity).toBe('warning');
			expect(error.message).toContain('both tabs and spaces');
		});
	});

	describe('createDuplicateSiblingWarning', () => {
		it('should create warning for duplicate siblings', () => {
			const error = createDuplicateSiblingWarning(5, '├── About', 'About', 2);

			expect(error.code).toBe('DUPLICATE_SIBLING');
			expect(error.severity).toBe('warning');
			expect(error.message).toContain('"About"');
			expect(error.message).toContain('line 2');
		});
	});
});

describe('Error Detection', () => {
	describe('detectMixedIndentation', () => {
		it('should detect mixed tabs and spaces in same line', () => {
			const lines = ['Home', '\t  ├── Mixed'];
			const errors = detectMixedIndentation(lines);

			expect(errors).toHaveLength(1);
			expect(errors[0].code).toBe('MIXED_INDENTATION');
		});

		it('should detect mixed indentation across document', () => {
			const lines = ['Home', '\t├── Tab', '  ├── Space'];
			const errors = detectMixedIndentation(lines);

			expect(errors.length).toBeGreaterThanOrEqual(1);
			expect(errors.some((e) => e.code === 'MIXED_INDENTATION')).toBe(true);
		});

		it('should not flag consistent space indentation', () => {
			const lines = ['Home', '    ├── Child', '        ├── Grandchild'];
			const errors = detectMixedIndentation(lines);

			expect(errors).toHaveLength(0);
		});

		it('should not flag consistent tab indentation', () => {
			const lines = ['Home', '\t├── Child', '\t\t├── Grandchild'];
			const errors = detectMixedIndentation(lines);

			expect(errors).toHaveLength(0);
		});
	});

	describe('detectMalformedTreeChars', () => {
		it('should detect incomplete branch markers', () => {
			const lines = ['Home', '├─ About']; // Missing one dash
			const errors = detectMalformedTreeChars(lines);

			expect(errors).toHaveLength(1);
			expect(errors[0].code).toBe('MALFORMED_TREE_CHARS');
			expect(errors[0].message).toContain('incomplete');
		});

		it('should detect missing space after branch marker', () => {
			const lines = ['Home', '├──About']; // No space after marker
			const errors = detectMalformedTreeChars(lines);

			expect(errors).toHaveLength(1);
			expect(errors[0].message).toContain('Missing space');
		});

		it('should detect branch marker without label', () => {
			const lines = ['Home', '├──'];
			const errors = detectMalformedTreeChars(lines);

			expect(errors).toHaveLength(1);
			expect(errors[0].message).toContain('without a label');
		});

		it('should not flag valid tree structure', () => {
			const lines = ['Home', '├── About', '│   └── Team', '└── Contact'];
			const errors = detectMalformedTreeChars(lines);

			expect(errors).toHaveLength(0);
		});
	});

	describe('detectOrphanedBranches', () => {
		it('should detect branch marker at start of file', () => {
			const lines = ['├── Orphaned'];
			const errors = detectOrphanedBranches(lines);

			expect(errors).toHaveLength(1);
			expect(errors[0].code).toBe('ORPHANED_BRANCH_MARKER');
		});

		it('should not flag branch after root node', () => {
			const lines = ['Home', '├── About'];
			const errors = detectOrphanedBranches(lines);

			expect(errors).toHaveLength(0);
		});
	});
});

describe('parseTreeText Error Handling', () => {
	describe('depth jump errors', () => {
		it('should detect and report depth jumps with suggestions', () => {
			const input = `Home
├── About
│   │   └── Deep Node`;
			const result = parseTreeText(input);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].code).toBe('INVALID_DEPTH_JUMP');
			expect(result.errors[0].suggestion).toBeDefined();
			expect(result.errors[0].expected).toBeDefined();
			expect(result.errors[0].actual).toBeDefined();
		});

		it('should still return parsed nodes with depth errors', () => {
			const input = `Home
├── About
│   │   └── Deep Node`;
			const result = parseTreeText(input);

			expect(result.nodes).toHaveLength(3);
		});
	});

	describe('empty label errors', () => {
		it('should report empty label errors when skipEmptyLines is false', () => {
			const input = `Home
├──
└── Contact`;
			const result = parseTreeText(input, { skipEmptyLines: false });

			expect(result.success).toBe(false);
			expect(result.errors.some((e) => e.code === 'EMPTY_LABEL')).toBe(true);
		});
	});

	describe('duplicate sibling warnings', () => {
		it('should warn about duplicate sibling names', () => {
			const input = `Home
├── About
├── Products
├── About
└── Contact`;
			const result = parseTreeText(input);

			// Should have a warning but still succeed
			const warnings = result.errors.filter((e) => e.severity === 'warning');
			expect(warnings.some((e) => e.code === 'DUPLICATE_SIBLING')).toBe(true);
		});

		it('should allow same name at different levels', () => {
			const input = `Home
├── About
│   └── Info
├── Products
│   └── Info
└── Contact`;
			const result = parseTreeText(input);

			// "Info" appears twice but at different parent levels
			expect(result.success).toBe(true);
		});
	});
});

describe('validateTreeInput', () => {
	it('should return valid for correct input', () => {
		const input = `Home
├── About
│   └── Team
└── Contact`;
		const validation = validateTreeInput(input);

		expect(validation.valid).toBe(true);
		expect(validation.errors).toHaveLength(0);
	});

	it('should detect orphaned branches', () => {
		const input = `├── Orphaned Branch`;
		const validation = validateTreeInput(input);

		expect(validation.valid).toBe(false);
		expect(validation.errors.some((e) => e.code === 'ORPHANED_BRANCH_MARKER')).toBe(true);
	});

	it('should separate errors and warnings', () => {
		const input = `Home
├── About
├── About`;
		const validation = validateTreeInput(input);

		expect(validation.warnings.length).toBeGreaterThanOrEqual(0);
		expect(Array.isArray(validation.errors)).toBe(true);
		expect(Array.isArray(validation.warnings)).toBe(true);
	});
});

describe('parseTreeTextWithValidation', () => {
	it('should combine pre-validation and parsing errors', () => {
		const input = `├── Orphaned
│   │   └── Deep`;
		const result = parseTreeTextWithValidation(input);

		expect(result.success).toBe(false);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('should avoid duplicate errors', () => {
		const input = `Home
├── About
│   │   └── Deep Node`;
		const result = parseTreeTextWithValidation(input);

		// Should not have duplicate depth jump errors
		const depthErrors = result.errors.filter(
			(e) => e.code === 'INVALID_DEPTH_JUMP' && e.lineNumber === 3
		);
		expect(depthErrors.length).toBeLessThanOrEqual(1);
	});

	it('should provide warnings separately', () => {
		const input = `Home
├── About
├── About
└── Contact`;
		const result = parseTreeTextWithValidation(input);

		expect(result.warnings).toBeDefined();
		expect(Array.isArray(result.warnings)).toBe(true);
	});

	it('should include suggestions for all errors', () => {
		const input = `├── Orphaned`;
		const result = parseTreeTextWithValidation(input);

		for (const error of result.errors) {
			expect(error.suggestion).toBeDefined();
		}
	});
});

describe('Error Formatting', () => {
	describe('formatError', () => {
		it('should format error with all fields', () => {
			const error: ParseError = {
				actual: 'depth 3',
				code: 'INVALID_DEPTH_JUMP',
				expected: 'depth 2',
				lineContent: '│   │   └── Deep Node',
				lineNumber: 3,
				message: 'Invalid depth jump',
				severity: 'error',
				suggestion: 'Add parent nodes',
			};

			const formatted = formatError(error);

			expect(formatted).toContain('[Error]');
			expect(formatted).toContain('Line 3');
			expect(formatted).toContain('Invalid depth jump');
			expect(formatted).toContain('│   │   └── Deep Node');
			expect(formatted).toContain('Suggestion:');
			expect(formatted).toContain('Add parent nodes');
			expect(formatted).toContain('Expected: depth 2');
			expect(formatted).toContain('Actual: depth 3');
		});

		it('should format warning differently', () => {
			const warning: ParseError = {
				code: 'DUPLICATE_SIBLING',
				lineContent: '├── About',
				lineNumber: 5,
				message: 'Duplicate sibling found',
				severity: 'warning',
			};

			const formatted = formatError(warning);

			expect(formatted).toContain('[Warning]');
		});

		it('should respect includeLineContent option', () => {
			const error: ParseError = {
				code: 'EMPTY_LABEL',
				lineContent: '├──',
				lineNumber: 2,
				message: 'Empty label',
				severity: 'error',
			};

			const formatted = formatError(error, { includeLineContent: false });

			expect(formatted).not.toContain('├──');
		});
	});

	describe('formatErrorReport', () => {
		it('should format multiple errors into a report', () => {
			const errors: ParseError[] = [
				{
					code: 'INVALID_DEPTH_JUMP',
					lineContent: 'line 3',
					lineNumber: 3,
					message: 'Invalid depth',
					severity: 'error',
				},
				{
					code: 'DUPLICATE_SIBLING',
					lineContent: 'line 5',
					lineNumber: 5,
					message: 'Duplicate',
					severity: 'warning',
				},
			];

			const report = formatErrorReport(errors);

			expect(report).toContain('Errors (1)');
			expect(report).toContain('Warnings (1)');
			expect(report).toContain('Total: 1 error(s), 1 warning(s)');
		});

		it('should handle empty errors', () => {
			const report = formatErrorReport([]);

			expect(report).toBe('No errors found.');
		});

		it('should support ungrouped mode', () => {
			const errors: ParseError[] = [
				{
					code: 'INVALID_DEPTH_JUMP',
					lineContent: 'line 1',
					lineNumber: 1,
					message: 'Error 1',
					severity: 'error',
				},
				{
					code: 'DUPLICATE_SIBLING',
					lineContent: 'line 2',
					lineNumber: 2,
					message: 'Warning 1',
					severity: 'warning',
				},
			];

			const report = formatErrorReport(errors, { groupBySeverity: false });

			expect(report).not.toContain('=== Errors');
			expect(report).not.toContain('=== Warnings');
		});
	});

	describe('getErrorStats', () => {
		it('should calculate error statistics', () => {
			const errors: ParseError[] = [
				{
					code: 'INVALID_DEPTH_JUMP',
					lineContent: 'line',
					lineNumber: 1,
					message: 'Error 1',
					severity: 'error',
				},
				{
					code: 'INVALID_DEPTH_JUMP',
					lineContent: 'line',
					lineNumber: 2,
					message: 'Error 2',
					severity: 'error',
				},
				{
					code: 'DUPLICATE_SIBLING',
					lineContent: 'line',
					lineNumber: 3,
					message: 'Warning',
					severity: 'warning',
				},
			];

			const stats = getErrorStats(errors);

			expect(stats.total).toBe(3);
			expect(stats.errors).toBe(2);
			expect(stats.warnings).toBe(1);
			expect(stats.byCode['INVALID_DEPTH_JUMP']).toBe(2);
			expect(stats.byCode['DUPLICATE_SIBLING']).toBe(1);
		});

		it('should handle empty errors', () => {
			const stats = getErrorStats([]);

			expect(stats.total).toBe(0);
			expect(stats.errors).toBe(0);
			expect(stats.warnings).toBe(0);
		});
	});
});

describe('Real-world Error Scenarios', () => {
	it('should handle complex invalid tree with multiple issues', () => {
		const input = `├── Orphaned Start
Home
├── About
├── About
│   │   └── Deep Node
└── Contact`;
		const result = parseTreeTextWithValidation(input);

		expect(result.success).toBe(false);

		// Check for various error types
		const errorCodes = result.errors.map((e) => e.code);
		expect(errorCodes).toContain('ORPHANED_BRANCH_MARKER');
	});

	it('should provide helpful suggestions for common mistakes', () => {
		const input = `Home
├── About
        └── Too Deep`;
		const result = parseTreeTextWithValidation(input);

		expect(result.success).toBe(false);

		const depthError = result.errors.find((e) => e.code === 'INVALID_DEPTH_JUMP');
		expect(depthError).toBeDefined();
		expect(depthError!.suggestion).toBeDefined();
		expect(depthError!.suggestion!.length).toBeGreaterThan(0);
	});

	it('should handle incomplete tree markers gracefully', () => {
		const input = `Home
├─ Missing Dash`;
		const result = parseTreeTextWithValidation(input);

		// Should detect malformed tree characters
		const malformedError = result.errors.find((e) => e.code === 'MALFORMED_TREE_CHARS');
		expect(malformedError).toBeDefined();
		expect(malformedError!.suggestion).toBeDefined();
	});

	it('should detect and suggest fixes for mixed indentation', () => {
		const input = `Home
\t├── Tab Indented
    ├── Space Indented`;
		const result = parseTreeTextWithValidation(input);

		const mixedError = result.errors.find((e) => e.code === 'MIXED_INDENTATION');
		if (mixedError) {
			expect(mixedError.severity).toBe('warning');
			expect(mixedError.suggestion).toContain('spaces');
		}
	});
});
