/**
 * InlineEditInput Component
 *
 * A focused input component for inline editing of tree node labels.
 * Automatically focuses and selects text when mounted, and handles
 * keyboard navigation (Enter to save, Escape to cancel).
 *
 * @example
 * ```tsx
 * <InlineEditInput
 *   value={editValue}
 *   onChange={handleChange}
 *   onCommit={commitEdit}
 *   onCancel={cancelEdit}
 * />
 * ```
 */
import React, { memo, useCallback, useEffect, useRef } from 'react';

/**
 * Props for the InlineEditInput component.
 */
export interface InlineEditInputProps {
	/** The current input value */
	value: string;

	/** Handler for input value changes */
	onChange: (value: string) => void;

	/** Handler called when edit is committed (Enter key or blur) */
	onCommit: () => void;

	/** Handler called when edit is canceled (Escape key) */
	onCancel: () => void;

	/** Whether to commit on blur. Defaults to true. */
	commitOnBlur?: boolean;

	/** Whether to auto-select text on focus. Defaults to true. */
	selectOnFocus?: boolean;

	/** Placeholder text for empty input */
	placeholder?: string;

	/** Additional CSS class name */
	className?: string;

	/** Inline styles for the input */
	style?: React.CSSProperties;

	/** Minimum width for the input in pixels */
	minWidth?: number;

	/** Maximum width for the input in pixels */
	maxWidth?: number;

	/** ARIA label for accessibility */
	ariaLabel?: string;

	/** Font size in pixels (should match the label font size) */
	fontSize?: number;
}

/**
 * Default styles for the inline edit input.
 */
const DEFAULT_INPUT_STYLES: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #3b82f6',
	borderRadius: '2px',
	boxSizing: 'border-box',
	fontFamily: 'inherit',
	lineHeight: 'inherit',
	outline: 'none',
	padding: '2px 4px',
};

/**
 * InlineEditInput provides a focused text input for inline editing.
 *
 * Features:
 * - Auto-focuses when mounted
 * - Auto-selects all text on focus (configurable)
 * - Enter key commits the edit
 * - Escape key cancels the edit
 * - Optional blur handling
 * - Inherits font styling from parent
 * - Accessible with ARIA support
 *
 * @example
 * ```tsx
 * // Basic usage with edit hook
 * const editing = useTreeNodeEditing({ onLabelChange: handleChange });
 *
 * {editing.isEditing(node.id) ? (
 *   <InlineEditInput
 *     value={editing.editValue}
 *     onChange={editing.updateEditValue}
 *     onCommit={editing.commitEdit}
 *     onCancel={editing.cancelEdit}
 *   />
 * ) : (
 *   <span onDoubleClick={() => editing.startEditing(node)}>
 *     {node.label}
 *   </span>
 * )}
 * ```
 */
export const InlineEditInput = memo(function InlineEditInput({
	value,
	onChange,
	onCommit,
	onCancel,
	commitOnBlur = true,
	selectOnFocus = true,
	placeholder = '',
	className = '',
	style,
	minWidth = 50,
	maxWidth,
	ariaLabel = 'Edit label',
	fontSize = 14,
}: InlineEditInputProps): React.ReactElement {
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus and optionally select text on mount
	useEffect(() => {
		const input = inputRef.current;
		if (input) {
			input.focus();
			if (selectOnFocus) {
				input.select();
			}
		}
	}, [selectOnFocus]);

	// Handle input change
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			onChange(event.target.value);
		},
		[onChange]
	);

	// Handle keyboard events
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				event.stopPropagation();
				onCommit();
			} else if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				onCancel();
			}
		},
		[onCommit, onCancel]
	);

	// Handle blur
	const handleBlur = useCallback(() => {
		if (commitOnBlur) {
			onCommit();
		}
	}, [commitOnBlur, onCommit]);

	// Prevent click propagation to avoid triggering parent handlers
	const handleClick = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);

	// Compute input styles
	const inputStyles: React.CSSProperties = {
		...DEFAULT_INPUT_STYLES,
		fontSize: `${fontSize}px`,
		minWidth: `${minWidth}px`,
		...(maxWidth ? { maxWidth: `${maxWidth}px` } : {}),
		...style,
	};

	return (
		<input
			ref={inputRef}
			type="text"
			value={value}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onClick={handleClick}
			placeholder={placeholder}
			className={`inline-edit-input ${className}`.trim()}
			style={inputStyles}
			aria-label={ariaLabel}
			autoComplete="off"
			spellCheck={false}
		/>
	);
});

/**
 * Edit button component for triggering inline editing.
 */
export interface EditButtonProps {
	/** Handler called when the button is clicked */
	onClick: () => void;

	/** Additional CSS class name */
	className?: string;

	/** Inline styles for the button */
	style?: React.CSSProperties;

	/** ARIA label for accessibility */
	ariaLabel?: string;

	/** Whether to show the button only on hover (controlled by parent) */
	visible?: boolean;

	/** Size of the button in pixels */
	size?: number;
}

/**
 * Default styles for the edit button.
 */
const DEFAULT_BUTTON_STYLES: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'transparent',
	border: 'none',
	borderRadius: '2px',
	color: '#6b7280',
	cursor: 'pointer',
	display: 'inline-flex',
	flexShrink: 0,
	justifyContent: 'center',
	marginLeft: '4px',
	padding: '2px',
	transition: 'background-color 0.15s ease, color 0.15s ease',
};

/**
 * EditButton provides a clickable icon button to trigger inline editing.
 *
 * @example
 * ```tsx
 * <div className="node-label">
 *   <span>{node.label}</span>
 *   <EditButton
 *     onClick={() => editing.startEditing(node)}
 *     visible={isHovered}
 *   />
 * </div>
 * ```
 */
export const EditButton = memo(function EditButton({
	onClick,
	className = '',
	style,
	ariaLabel = 'Edit',
	visible = true,
	size = 16,
}: EditButtonProps): React.ReactElement | null {
	// Prevent click propagation
	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			onClick();
		},
		[onClick]
	);

	// Handle keyboard activation
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				event.stopPropagation();
				onClick();
			}
		},
		[onClick]
	);

	const buttonStyles: React.CSSProperties = {
		...DEFAULT_BUTTON_STYLES,
		height: `${size}px`,
		opacity: visible ? 1 : 0,
		pointerEvents: visible ? 'auto' : 'none',
		width: `${size}px`,
		...style,
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={`inline-edit-button ${className}`.trim()}
			style={buttonStyles}
			aria-label={ariaLabel}
			tabIndex={visible ? 0 : -1}>
			{/* Pencil/Edit SVG Icon */}
			<svg
				width={size - 4}
				height={size - 4}
				viewBox="0 0 16 16"
				fill="currentColor"
				aria-hidden="true">
				<path d="M12.146 0.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.638-.638l1.5-4a.5.5 0 0 1 .11-.168l9-9zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zM10.5 3.207L2.5 11.207V12.5h1.293l8-8L10.5 3.207z" />
			</svg>
		</button>
	);
});

export default InlineEditInput;
