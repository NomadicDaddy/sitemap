/**
 * Hooks Module
 *
 * Exports all custom React hooks for the UX Sitemap Visualizer.
 */

export { useDebounce } from './useDebounce';
export { default as useDebounceDefault } from './useDebounce';

export {
	useTreeParser,
	type UseTreeParserOptions,
	type UseTreeParserResult,
} from './useTreeParser';
export { default as useTreeParserDefault } from './useTreeParser';

export {
	useTreeNodeEditing,
	type UseTreeNodeEditingOptions,
	type UseTreeNodeEditingResult,
} from './useTreeNodeEditing';
export { default as useTreeNodeEditingDefault } from './useTreeNodeEditing';

export {
	useTreeKeyboardNavigation,
	type KeyboardNavigationOptions,
	type KeyboardNavigationState,
	type KeyboardNavigationActions,
	type UseTreeKeyboardNavigationResult,
} from './useTreeKeyboardNavigation';
export { default as useTreeKeyboardNavigationDefault } from './useTreeKeyboardNavigation';

export {
	useTreeSearch,
	type UseTreeSearchOptions,
	type UseTreeSearchResult,
} from './useTreeSearch';
export { default as useTreeSearchDefault } from './useTreeSearch';
