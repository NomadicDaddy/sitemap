/**
 * useTreeParser Hook
 *
 * A custom React hook that provides real-time parsing of tree text input.
 * Encapsulates the parsing logic and provides immediate feedback as users type.
 *
 * @example
 * ```tsx
 * const { tree, errors, success, inputValue, setInputValue } = useTreeParser();
 *
 * return (
 *   <div>
 *     <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
 *     <BasicTree nodes={tree} />
 *     {errors.map(error => <div key={error.lineNumber}>{error.message}</div>)}
 *   </div>
 * );
 * ```
 */
import { useCallback, useMemo, useState } from 'react';

import { type ParseError, type ParserOptions, type TreeNode } from '../types/TreeNode';
import { parseAndBuildTree } from '../utils/treeParser';
import { useDebounce } from './useDebounce';

/**
 * Options for the useTreeParser hook.
 */
export interface UseTreeParserOptions {
	/** Initial text value for the input */
	initialValue?: string;

	/** Parser options to customize parsing behavior */
	parserOptions?: ParserOptions;

	/**
	 * Debounce delay in milliseconds for parsing.
	 * Set to 0 to disable debouncing (parse on every keystroke).
	 * Recommended: 300-500ms for a good balance between responsiveness and performance.
	 * @default 0 (no debouncing for backward compatibility)
	 */
	debounceDelay?: number;
}

/**
 * Return type for the useTreeParser hook.
 */
export interface UseTreeParserResult {
	/** The current input value */
	inputValue: string;

	/** Set the input value - triggers re-parsing */
	setInputValue: (value: string) => void;

	/** Handler for textarea onChange events */
	handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;

	/** The parsed tree structure */
	tree: TreeNode[];

	/** Array of parsing errors */
	errors: ParseError[];

	/** Whether parsing was successful (no errors) */
	success: boolean;

	/** Number of nodes in the tree */
	nodeCount: number;

	/** Maximum depth of the tree */
	maxDepth: number;

	/** Clear the input and reset to empty state */
	clear: () => void;

	/** Reset to initial value */
	reset: () => void;
}

/**
 * Counts the total number of nodes in a tree hierarchy.
 */
function countTreeNodes(nodes: TreeNode[]): number {
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
 */
function getTreeMaxDepth(nodes: TreeNode[]): number {
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
 * Custom hook for real-time tree text parsing.
 *
 * Provides a controlled input value with automatic parsing on every change,
 * enabling instant visual feedback as users type their sitemap structure.
 *
 * @param options - Configuration options for the hook
 * @returns Object containing input state, parsed tree, errors, and utility functions
 *
 * @example
 * ```tsx
 * function SitemapEditor() {
 *   const {
 *     inputValue,
 *     handleInputChange,
 *     tree,
 *     errors,
 *     success
 *   } = useTreeParser({ initialValue: 'Home\n├── About\n└── Contact' });
 *
 *   return (
 *     <div className="editor-container">
 *       <textarea
 *         value={inputValue}
 *         onChange={handleInputChange}
 *         placeholder="Enter your sitemap structure..."
 *       />
 *       {success ? (
 *         <BasicTree nodes={tree} />
 *       ) : (
 *         <div className="errors">
 *           {errors.map(e => <p key={e.lineNumber}>{e.message}</p>)}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTreeParser(options: UseTreeParserOptions = {}): UseTreeParserResult {
	const { initialValue = '', parserOptions, debounceDelay = 0 } = options;

	// Store the input value in state
	const [inputValue, setInputValue] = useState<string>(initialValue);

	// Debounce the input value for parsing
	// When debounceDelay is 0, this returns inputValue immediately (no debouncing)
	const debouncedInputValue = useDebounce(inputValue, debounceDelay);

	// Parse the debounced input value whenever it changes using useMemo
	// This provides debounced re-parsing while textarea updates remain instant
	const parseResult = useMemo(() => {
		return parseAndBuildTree(debouncedInputValue, parserOptions);
	}, [debouncedInputValue, parserOptions]);

	// Extract parsed results
	const { tree, errors, success } = parseResult;

	// Calculate derived values
	const nodeCount = useMemo(() => countTreeNodes(tree), [tree]);
	const maxDepth = useMemo(() => getTreeMaxDepth(tree), [tree]);

	// Handler for textarea onChange events
	const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputValue(event.target.value);
	}, []);

	// Clear function to reset to empty state
	const clear = useCallback(() => {
		setInputValue('');
	}, []);

	// Reset function to return to initial value
	const reset = useCallback(() => {
		setInputValue(initialValue);
	}, [initialValue]);

	return {
		clear,
		errors,
		handleInputChange,
		inputValue,
		maxDepth,
		nodeCount,
		reset,
		setInputValue,
		success,
		tree,
	};
}

export default useTreeParser;
