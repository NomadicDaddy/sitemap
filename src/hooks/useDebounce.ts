/**
 * useDebounce Hook
 *
 * A custom React hook that provides debounced values.
 * Useful for delaying expensive operations like parsing until
 * the user stops typing.
 *
 * @example
 * ```tsx
 * const [inputValue, setInputValue] = useState('');
 * const debouncedValue = useDebounce(inputValue, 300);
 *
 * // debouncedValue updates 300ms after inputValue stops changing
 * useEffect(() => {
 *   console.log('Debounced value:', debouncedValue);
 * }, [debouncedValue]);
 * ```
 */
import { useEffect, useState } from 'react';

/**
 * Debounces a value, delaying updates until the specified delay has passed
 * without the value changing.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (0 means no debouncing)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   useEffect(() => {
 *     // This runs 300ms after the user stops typing
 *     performSearch(debouncedQuery);
 *   }, [debouncedQuery]);
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		// If delay is 0 or less, update immediately (no debouncing)
		if (delay <= 0) {
			setDebouncedValue(value);
			return;
		}

		// Set up the timeout to update the debounced value
		const timeoutId = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Cleanup: cancel the timeout if value changes before delay completes
		return () => {
			clearTimeout(timeoutId);
		};
	}, [value, delay]);

	return debouncedValue;
}

export default useDebounce;
