/**
 * SearchPanel Component
 *
 * A search/filter panel for tree structures that provides real-time filtering
 * as users type. Supports searching by label text, tags, and properties with
 * highlighting of matching nodes and navigation between matches.
 *
 * @example
 * ```tsx
 * import { SearchPanel } from './components/SearchPanel';
 * import { useTreeSearch } from './hooks/useTreeSearch';
 *
 * function App() {
 *   const search = useTreeSearch(nodes);
 *
 *   return (
 *     <div>
 *       <SearchPanel searchState={search} />
 *       <BasicTree nodes={search.filteredNodes} />
 *     </div>
 *   );
 * }
 * ```
 */
import React, { memo, useCallback, useRef } from 'react';

import { type UseTreeSearchResult } from '../hooks/useTreeSearch';
import { type SearchField } from '../utils/treeSearch';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SearchPanel component.
 */
export interface SearchPanelProps {
	/** The search state from useTreeSearch hook */
	searchState: UseTreeSearchResult;

	/** Whether to show the search field options (default: true) */
	showFieldOptions?: boolean;

	/** Whether to show the case sensitivity toggle (default: true) */
	showCaseSensitiveToggle?: boolean;

	/** Whether to show the match navigation (prev/next buttons) (default: true) */
	showMatchNavigation?: boolean;

	/** Whether to show the match count (default: true) */
	showMatchCount?: boolean;

	/** Placeholder text for the search input (default: 'Search nodes...') */
	placeholder?: string;

	/** Additional CSS class name */
	className?: string;

	/** Inline styles for the container */
	style?: React.CSSProperties;

	/** Size variant (default: 'medium') */
	size?: 'small' | 'medium' | 'large';

	/** Aria label for the search input */
	ariaLabel?: string;
}

// ============================================================================
// Styles
// ============================================================================

const containerStyles: React.CSSProperties = {
	alignItems: 'flex-start',
	backgroundColor: '#f8fafc',
	border: '1px solid #e2e8f0',
	borderRadius: '8px',
	display: 'flex',
	flexDirection: 'column',
	gap: '8px',
	padding: '12px',
};

const searchRowStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: '8px',
	width: '100%',
};

const inputContainerStyles: React.CSSProperties = {
	flex: 1,
	position: 'relative' as const,
};

const inputStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #cbd5e1',
	borderRadius: '6px',
	boxSizing: 'border-box' as const,
	fontFamily: 'inherit',
	fontSize: '14px',
	lineHeight: '1.5',
	outline: 'none',
	padding: '8px 36px 8px 12px',
	transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
	width: '100%',
};

const inputFocusStyles: React.CSSProperties = {
	...inputStyles,
	borderColor: '#3b82f6',
	boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
};

const clearButtonStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'transparent',
	border: 'none',
	borderRadius: '4px',
	color: '#64748b',
	cursor: 'pointer',
	display: 'flex',
	height: '24px',
	justifyContent: 'center',
	padding: 0,
	position: 'absolute' as const,
	right: '6px',
	top: '50%',
	transform: 'translateY(-50%)',
	transition: 'color 0.15s ease, background-color 0.15s ease',
	width: '24px',
};

const clearButtonHoverStyles: React.CSSProperties = {
	...clearButtonStyles,
	backgroundColor: '#f1f5f9',
	color: '#334155',
};

const matchCountStyles: React.CSSProperties = {
	backgroundColor: '#e0f2fe',
	borderRadius: '4px',
	color: '#0369a1',
	fontSize: '12px',
	fontWeight: 500,
	padding: '4px 8px',
	whiteSpace: 'nowrap' as const,
};

const noMatchStyles: React.CSSProperties = {
	...matchCountStyles,
	backgroundColor: '#fef2f2',
	color: '#b91c1c',
};

const navButtonStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#ffffff',
	border: '1px solid #cbd5e1',
	borderRadius: '4px',
	color: '#475569',
	cursor: 'pointer',
	display: 'flex',
	height: '32px',
	justifyContent: 'center',
	padding: 0,
	transition: 'background-color 0.15s ease, border-color 0.15s ease',
	width: '32px',
};

const navButtonHoverStyles: React.CSSProperties = {
	...navButtonStyles,
	backgroundColor: '#f8fafc',
	borderColor: '#94a3b8',
};

const navButtonDisabledStyles: React.CSSProperties = {
	...navButtonStyles,
	backgroundColor: '#f1f5f9',
	color: '#94a3b8',
	cursor: 'not-allowed',
};

const optionsRowStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexWrap: 'wrap' as const,
	gap: '12px',
};

const optionGroupStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: '6px',
};

const optionLabelStyles: React.CSSProperties = {
	color: '#64748b',
	fontSize: '12px',
	fontWeight: 500,
};

const checkboxLabelStyles: React.CSSProperties = {
	alignItems: 'center',
	color: '#475569',
	cursor: 'pointer',
	display: 'flex',
	fontSize: '12px',
	gap: '4px',
};

const toggleButtonStyles: React.CSSProperties = {
	backgroundColor: '#f1f5f9',
	border: '1px solid #e2e8f0',
	borderRadius: '4px',
	color: '#64748b',
	cursor: 'pointer',
	fontSize: '11px',
	fontWeight: 500,
	padding: '4px 8px',
	transition: 'all 0.15s ease',
};

const toggleButtonActiveStyles: React.CSSProperties = {
	...toggleButtonStyles,
	backgroundColor: '#3b82f6',
	borderColor: '#3b82f6',
	color: '#ffffff',
};

// Size variants
const sizeVariants = {
	large: {
		containerPadding: '16px',
		fontSize: '15px',
		gap: '10px',
		inputPadding: '10px 40px 10px 14px',
	},
	medium: {
		containerPadding: '12px',
		fontSize: '14px',
		gap: '8px',
		inputPadding: '8px 36px 8px 12px',
	},
	small: {
		containerPadding: '8px',
		fontSize: '13px',
		gap: '6px',
		inputPadding: '6px 32px 6px 10px',
	},
};

// ============================================================================
// Helper Components
// ============================================================================

interface ClearButtonProps {
	onClick: () => void;
	visible: boolean;
}

const ClearButton = memo(function ClearButton({ onClick, visible }: ClearButtonProps) {
	const [isHovered, setIsHovered] = React.useState(false);

	if (!visible) return null;

	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={isHovered ? clearButtonHoverStyles : clearButtonStyles}
			aria-label="Clear search"
			title="Clear search (Escape)">
			<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
			</svg>
		</button>
	);
});

interface NavButtonProps {
	onClick: () => void;
	disabled: boolean;
	direction: 'prev' | 'next';
}

const NavButton = memo(function NavButton({ onClick, disabled, direction }: NavButtonProps) {
	const [isHovered, setIsHovered] = React.useState(false);

	const label = direction === 'prev' ? 'Previous match' : 'Next match';
	const icon =
		direction === 'prev' ? (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path
					fillRule="evenodd"
					d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
				/>
			</svg>
		) : (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path
					fillRule="evenodd"
					d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
				/>
			</svg>
		);

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={
				disabled
					? navButtonDisabledStyles
					: isHovered
						? navButtonHoverStyles
						: navButtonStyles
			}
			aria-label={label}
			title={`${label} (${direction === 'prev' ? '↑' : '↓'})`}>
			{icon}
		</button>
	);
});

interface FieldToggleProps {
	field: SearchField;
	label: string;
	isActive: boolean;
	onToggle: () => void;
}

const FieldToggle = memo(function FieldToggle({
	field: _field,
	label,
	isActive,
	onToggle,
}: FieldToggleProps) {
	// _field is used for type-safety in props but not directly in render
	void _field;
	return (
		<button
			type="button"
			onClick={onToggle}
			style={isActive ? toggleButtonActiveStyles : toggleButtonStyles}
			aria-pressed={isActive}
			title={`Search in ${label.toLowerCase()}`}>
			{label}
		</button>
	);
});

// ============================================================================
// SearchPanel Component
// ============================================================================

/**
 * SearchPanel provides a complete search/filter interface for tree structures.
 *
 * Features:
 * - Real-time search as you type (with debouncing)
 * - Search by label, tags, or properties
 * - Case-sensitive toggle
 * - Match count display
 * - Navigation between matches (previous/next)
 * - Clear button to reset search
 * - Keyboard shortcuts (Escape to clear, Enter to go to next match)
 *
 * @example
 * ```tsx
 * // Basic usage with useTreeSearch hook
 * const search = useTreeSearch(nodes);
 *
 * <SearchPanel searchState={search} />
 *
 * // Minimal panel
 * <SearchPanel
 *   searchState={search}
 *   showFieldOptions={false}
 *   showCaseSensitiveToggle={false}
 * />
 *
 * // Small size
 * <SearchPanel searchState={search} size="small" />
 * ```
 */
export const SearchPanel = memo(function SearchPanel({
	searchState,
	showFieldOptions = true,
	showCaseSensitiveToggle = true,
	showMatchNavigation = true,
	showMatchCount = true,
	placeholder = 'Search nodes...',
	className = '',
	style,
	size = 'medium',
	ariaLabel = 'Search tree nodes',
}: SearchPanelProps): React.ReactElement {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = React.useState(false);

	const sizeConfig = sizeVariants[size];

	const {
		query,
		setQuery,
		searchResult,
		isSearchActive,
		isSearching,
		currentMatchIndex,
		goToNextMatch,
		goToPreviousMatch,
		clearSearch,
		searchFields,
		setSearchFields,
		caseSensitive,
		setCaseSensitive,
	} = searchState;

	// Handle input change
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setQuery(event.target.value);
		},
		[setQuery]
	);

	// Handle keyboard shortcuts
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				clearSearch();
				inputRef.current?.blur();
			} else if (event.key === 'Enter') {
				event.preventDefault();
				if (event.shiftKey) {
					goToPreviousMatch();
				} else {
					goToNextMatch();
				}
			} else if (event.key === 'ArrowDown' && event.altKey) {
				event.preventDefault();
				goToNextMatch();
			} else if (event.key === 'ArrowUp' && event.altKey) {
				event.preventDefault();
				goToPreviousMatch();
			}
		},
		[clearSearch, goToNextMatch, goToPreviousMatch]
	);

	// Toggle search field
	const toggleField = useCallback(
		(field: SearchField) => {
			const currentFields = [...searchFields];
			const index = currentFields.indexOf(field);

			if (index >= 0) {
				// Don't remove if it's the last field
				if (currentFields.length > 1) {
					currentFields.splice(index, 1);
				}
			} else {
				currentFields.push(field);
			}

			setSearchFields(currentFields);
		},
		[searchFields, setSearchFields]
	);

	// Toggle case sensitivity
	const toggleCaseSensitive = useCallback(() => {
		setCaseSensitive(!caseSensitive);
	}, [caseSensitive, setCaseSensitive]);

	// Focus the input when clicking the container
	const handleContainerClick = useCallback(() => {
		inputRef.current?.focus();
	}, []);

	// Compute dynamic styles
	const containerDynamicStyles: React.CSSProperties = {
		...containerStyles,
		gap: sizeConfig.gap,
		padding: sizeConfig.containerPadding,
		...style,
	};

	const inputDynamicStyles: React.CSSProperties = {
		...(isFocused ? inputFocusStyles : inputStyles),
		fontSize: sizeConfig.fontSize,
		padding: sizeConfig.inputPadding,
	};

	// Compute match count display
	const renderMatchCount = () => {
		if (!showMatchCount) return null;

		if (!isSearchActive) {
			return null;
		}

		if (isSearching) {
			return <span style={matchCountStyles}>Searching...</span>;
		}

		if (searchResult.matchCount === 0) {
			return <span style={noMatchStyles}>No matches</span>;
		}

		if (currentMatchIndex > 0) {
			return (
				<span style={matchCountStyles}>
					{currentMatchIndex} of {searchResult.matchCount}
				</span>
			);
		}

		return (
			<span style={matchCountStyles}>
				{searchResult.matchCount} match{searchResult.matchCount !== 1 ? 'es' : ''}
			</span>
		);
	};

	return (
		<div
			className={`search-panel search-panel--${size} ${className}`.trim()}
			style={containerDynamicStyles}
			onClick={handleContainerClick}
			role="search"
			aria-label={ariaLabel}>
			{/* Search input row */}
			<div style={searchRowStyles}>
				<div style={inputContainerStyles}>
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder={placeholder}
						style={inputDynamicStyles}
						aria-label={ariaLabel}
						autoComplete="off"
						spellCheck={false}
					/>
					<ClearButton onClick={clearSearch} visible={isSearchActive} />
				</div>

				{/* Match count */}
				{renderMatchCount()}

				{/* Navigation buttons */}
				{showMatchNavigation && isSearchActive && searchResult.matchCount > 0 && (
					<>
						<NavButton
							onClick={goToPreviousMatch}
							disabled={searchResult.matchCount === 0}
							direction="prev"
						/>
						<NavButton
							onClick={goToNextMatch}
							disabled={searchResult.matchCount === 0}
							direction="next"
						/>
					</>
				)}
			</div>

			{/* Options row */}
			{(showFieldOptions || showCaseSensitiveToggle) && (
				<div style={optionsRowStyles}>
					{/* Field options */}
					{showFieldOptions && (
						<div style={optionGroupStyles}>
							<span style={optionLabelStyles}>Search in:</span>
							<FieldToggle
								field="label"
								label="Label"
								isActive={searchFields.includes('label')}
								onToggle={() => toggleField('label')}
							/>
							<FieldToggle
								field="tags"
								label="Tags"
								isActive={searchFields.includes('tags')}
								onToggle={() => toggleField('tags')}
							/>
							<FieldToggle
								field="category"
								label="Category"
								isActive={searchFields.includes('category')}
								onToggle={() => toggleField('category')}
							/>
							<FieldToggle
								field="properties"
								label="Properties"
								isActive={searchFields.includes('properties')}
								onToggle={() => toggleField('properties')}
							/>
						</div>
					)}

					{/* Case sensitivity toggle */}
					{showCaseSensitiveToggle && (
						<div style={optionGroupStyles}>
							<label style={checkboxLabelStyles}>
								<input
									type="checkbox"
									checked={caseSensitive}
									onChange={toggleCaseSensitive}
									aria-label="Case sensitive search"
								/>
								Match case
							</label>
						</div>
					)}
				</div>
			)}
		</div>
	);
});

export default SearchPanel;
