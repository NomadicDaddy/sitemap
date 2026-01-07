/**
 * KeyboardShortcutsHelp Component
 *
 * A dialog/modal component that displays available keyboard shortcuts
 * for tree navigation and actions.
 */
import React, { useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface KeyboardShortcut {
	/** The key(s) to press */
	keys: string[];
	/** Description of what the shortcut does */
	description: string;
	/** Category for grouping shortcuts */
	category?: 'navigation' | 'selection' | 'actions' | 'general';
}

export interface KeyboardShortcutsHelpProps {
	/** Whether the dialog is open */
	isOpen: boolean;
	/** Callback when the dialog should close */
	onClose: () => void;
	/** Custom shortcuts to display (uses defaults if not provided) */
	shortcuts?: KeyboardShortcut[];
	/** Title for the dialog */
	title?: string;
	/** Whether to show the legend inline (tooltip style) or as a modal */
	variant?: 'modal' | 'inline' | 'tooltip';
	/** Position for inline/tooltip variant */
	position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// ============================================================================
// Default Shortcuts
// ============================================================================

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_TREE_SHORTCUTS: KeyboardShortcut[] = [
	// Navigation
	{ category: 'navigation', description: 'Move to previous node', keys: ['Arrow Up'] },
	{ category: 'navigation', description: 'Move to next node', keys: ['Arrow Down'] },
	{
		category: 'navigation',
		description: 'Collapse node or move to parent',
		keys: ['Arrow Left'],
	},
	{
		category: 'navigation',
		description: 'Expand node or move to first child',
		keys: ['Arrow Right'],
	},
	{ category: 'navigation', description: 'Move to first node', keys: ['Home'] },
	{ category: 'navigation', description: 'Move to last node', keys: ['End'] },
	{ category: 'navigation', description: 'Move to next node', keys: ['Tab'] },
	{ category: 'navigation', description: 'Move to previous node', keys: ['Shift', 'Tab'] },

	// Selection
	{ category: 'selection', description: 'Select/deselect focused node', keys: ['Space'] },
	{
		category: 'selection',
		description: 'Toggle selection (multi-select)',
		keys: ['Ctrl/Cmd', 'Space'],
	},
	{
		category: 'selection',
		description: 'Range select to focused node',
		keys: ['Shift', 'Space'],
	},

	// Actions
	{ category: 'actions', description: 'Toggle expand/collapse', keys: ['Enter'] },
	{ category: 'actions', description: 'Delete selected node(s)', keys: ['Delete'] },
	{ category: 'actions', description: 'Delete selected node(s)', keys: ['Backspace'] },
	{ category: 'actions', description: 'Copy selected node(s)', keys: ['Ctrl/Cmd', 'C'] },
	{ category: 'actions', description: 'Paste node(s)', keys: ['Ctrl/Cmd', 'V'] },

	// General
	{ category: 'general', description: 'Show/hide keyboard shortcuts', keys: ['?'] },
	{ category: 'general', description: 'Close this dialog', keys: ['Escape'] },
];

// ============================================================================
// Styles
// ============================================================================

const overlayStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'rgba(0, 0, 0, 0.5)',
	bottom: 0,
	display: 'flex',
	justifyContent: 'center',
	left: 0,
	position: 'fixed',
	right: 0,
	top: 0,
	zIndex: 1000,
};

const modalStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	borderRadius: '12px',
	boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
	maxHeight: '80vh',
	maxWidth: '480px',
	overflow: 'hidden',
	width: '90%',
};

const headerStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#f8fafc',
	borderBottom: '1px solid #e2e8f0',
	display: 'flex',
	justifyContent: 'space-between',
	padding: '16px 20px',
};

const titleStyles: React.CSSProperties = {
	color: '#1e293b',
	fontSize: '18px',
	fontWeight: 600,
	margin: 0,
};

const closeButtonStyles: React.CSSProperties = {
	alignItems: 'center',
	background: 'none',
	border: 'none',
	borderRadius: '6px',
	color: '#64748b',
	cursor: 'pointer',
	display: 'flex',
	fontSize: '20px',
	height: '32px',
	justifyContent: 'center',
	transition: 'background-color 0.15s ease, color 0.15s ease',
	width: '32px',
};

const contentStyles: React.CSSProperties = {
	maxHeight: 'calc(80vh - 100px)',
	overflowY: 'auto',
	padding: '16px 20px',
};

const categoryStyles: React.CSSProperties = {
	marginBottom: '16px',
};

const categoryTitleStyles: React.CSSProperties = {
	borderBottom: '1px solid #e2e8f0',
	color: '#475569',
	fontSize: '12px',
	fontWeight: 600,
	letterSpacing: '0.05em',
	marginBottom: '8px',
	paddingBottom: '4px',
	textTransform: 'uppercase',
};

const shortcutRowStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'space-between',
	marginBottom: '8px',
	padding: '4px 0',
};

const keysContainerStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: '4px',
};

const keyStyles: React.CSSProperties = {
	backgroundColor: '#f1f5f9',
	border: '1px solid #cbd5e1',
	borderBottomWidth: '2px',
	borderRadius: '4px',
	color: '#334155',
	fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
	fontSize: '12px',
	fontWeight: 500,
	minWidth: '24px',
	padding: '4px 8px',
	textAlign: 'center',
};

const plusStyles: React.CSSProperties = {
	color: '#94a3b8',
	fontSize: '12px',
	margin: '0 2px',
};

const descriptionStyles: React.CSSProperties = {
	color: '#475569',
	fontSize: '13px',
	textAlign: 'right',
};

const inlineContainerStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #e2e8f0',
	borderRadius: '8px',
	boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
	maxWidth: '360px',
	padding: '12px 16px',
	position: 'absolute',
	zIndex: 100,
};

const tooltipContainerStyles: React.CSSProperties = {
	backgroundColor: '#1e293b',
	borderRadius: '8px',
	boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
	color: '#f8fafc',
	maxWidth: '320px',
	padding: '12px 16px',
	position: 'absolute',
	zIndex: 100,
};

const tooltipKeyStyles: React.CSSProperties = {
	...keyStyles,
	backgroundColor: '#334155',
	borderColor: '#475569',
	color: '#f8fafc',
};

const tooltipDescriptionStyles: React.CSSProperties = {
	...descriptionStyles,
	color: '#cbd5e1',
};

const tooltipCategoryTitleStyles: React.CSSProperties = {
	...categoryTitleStyles,
	borderBottomColor: '#475569',
	color: '#94a3b8',
};

// ============================================================================
// Helper Components
// ============================================================================

interface KeyBadgeProps {
	keyName: string;
	style?: React.CSSProperties;
}

function KeyBadge({ keyName, style = keyStyles }: KeyBadgeProps): React.ReactElement {
	return <span style={style}>{keyName}</span>;
}

interface ShortcutRowProps {
	shortcut: KeyboardShortcut;
	keyStyle?: React.CSSProperties;
	descriptionStyle?: React.CSSProperties;
}

function ShortcutRow({
	shortcut,
	keyStyle = keyStyles,
	descriptionStyle = descriptionStyles,
}: ShortcutRowProps): React.ReactElement {
	return (
		<div style={shortcutRowStyles}>
			<div style={keysContainerStyles}>
				{shortcut.keys.map((key, index) => (
					<React.Fragment key={key}>
						{index > 0 && <span style={plusStyles}>+</span>}
						<KeyBadge keyName={key} style={keyStyle} />
					</React.Fragment>
				))}
			</div>
			<span style={descriptionStyle}>{shortcut.description}</span>
		</div>
	);
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * KeyboardShortcutsHelp displays available keyboard shortcuts for tree navigation.
 *
 * @example
 * ```tsx
 * // Modal variant
 * <KeyboardShortcutsHelp
 *   isOpen={isHelpOpen}
 *   onClose={() => setIsHelpOpen(false)}
 * />
 *
 * // Inline variant
 * <KeyboardShortcutsHelp
 *   isOpen={showTooltip}
 *   onClose={() => setShowTooltip(false)}
 *   variant="inline"
 *   position="bottom-right"
 * />
 * ```
 */
export function KeyboardShortcutsHelp({
	isOpen,
	onClose,
	shortcuts = DEFAULT_TREE_SHORTCUTS,
	title = 'Keyboard Shortcuts',
	variant = 'modal',
	position = 'bottom-right',
}: KeyboardShortcutsHelpProps): React.ReactElement | null {
	const dialogRef = useRef<HTMLDivElement>(null);

	// Group shortcuts by category
	const groupedShortcuts = React.useMemo(() => {
		const groups: Record<string, KeyboardShortcut[]> = {
			actions: [],
			general: [],
			navigation: [],
			selection: [],
		};

		shortcuts.forEach((shortcut) => {
			const category = shortcut.category || 'general';
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(shortcut);
		});

		return groups;
	}, [shortcuts]);

	const categoryLabels: Record<string, string> = {
		actions: 'Actions',
		general: 'General',
		navigation: 'Navigation',
		selection: 'Selection',
	};

	// Handle escape key
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				onClose();
			}
		},
		[isOpen, onClose]
	);

	// Handle click outside
	const handleClickOutside = useCallback(
		(event: MouseEvent) => {
			if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
				onClose();
			}
		},
		[onClose]
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener('keydown', handleKeyDown);
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, handleKeyDown, handleClickOutside]);

	// Focus trap for modal
	useEffect(() => {
		if (isOpen && variant === 'modal' && dialogRef.current) {
			const firstFocusable = dialogRef.current.querySelector('button');
			if (firstFocusable) {
				(firstFocusable as HTMLElement).focus();
			}
		}
	}, [isOpen, variant]);

	if (!isOpen) {
		return null;
	}

	const isTooltip = variant === 'tooltip';
	const isInline = variant === 'inline';
	const isModal = variant === 'modal';

	// Position styles for inline/tooltip variants
	const positionStyles: React.CSSProperties = {};
	if (isInline || isTooltip) {
		switch (position) {
			case 'top-left':
				positionStyles.top = '8px';
				positionStyles.left = '8px';
				break;
			case 'top-right':
				positionStyles.top = '8px';
				positionStyles.right = '8px';
				break;
			case 'bottom-left':
				positionStyles.bottom = '8px';
				positionStyles.left = '8px';
				break;
			case 'bottom-right':
				positionStyles.bottom = '8px';
				positionStyles.right = '8px';
				break;
		}
	}

	const containerStyle = isTooltip
		? { ...tooltipContainerStyles, ...positionStyles }
		: isInline
			? { ...inlineContainerStyles, ...positionStyles }
			: modalStyles;

	const currentKeyStyle = isTooltip ? tooltipKeyStyles : keyStyles;
	const currentDescriptionStyle = isTooltip ? tooltipDescriptionStyles : descriptionStyles;
	const currentCategoryTitleStyle = isTooltip ? tooltipCategoryTitleStyles : categoryTitleStyles;

	const content = (
		<div ref={dialogRef} style={containerStyle} role="dialog" aria-label={title}>
			{isModal && (
				<div style={headerStyles}>
					<h2 style={titleStyles}>{title}</h2>
					<button
						onClick={onClose}
						style={closeButtonStyles}
						aria-label="Close"
						type="button"
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = '#e2e8f0';
							e.currentTarget.style.color = '#334155';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'transparent';
							e.currentTarget.style.color = '#64748b';
						}}>
						&times;
					</button>
				</div>
			)}

			<div style={isModal ? contentStyles : undefined}>
				{Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
					if (categoryShortcuts.length === 0) return null;

					return (
						<div key={category} style={categoryStyles}>
							<div style={currentCategoryTitleStyle}>{categoryLabels[category]}</div>
							{categoryShortcuts.map((shortcut, index) => (
								<ShortcutRow
									key={`${shortcut.keys.join('-')}-${index}`}
									shortcut={shortcut}
									keyStyle={currentKeyStyle}
									descriptionStyle={currentDescriptionStyle}
								/>
							))}
						</div>
					);
				})}
			</div>
		</div>
	);

	if (isModal) {
		return (
			<div style={overlayStyles} role="presentation" onClick={onClose}>
				<div onClick={(e) => e.stopPropagation()}>{content}</div>
			</div>
		);
	}

	return content;
}

// ============================================================================
// Help Button Component
// ============================================================================

export interface KeyboardShortcutsHelpButtonProps {
	/** Callback when the button is clicked */
	onClick: () => void;
	/** Button size */
	size?: 'small' | 'medium' | 'large';
	/** Button variant */
	variant?: 'icon' | 'text' | 'icon-text';
	/** Custom label */
	label?: string;
	/** Custom className */
	className?: string;
}

const helpButtonBaseStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#f1f5f9',
	border: '1px solid #cbd5e1',
	borderRadius: '6px',
	color: '#475569',
	cursor: 'pointer',
	display: 'inline-flex',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	fontWeight: 500,
	gap: '6px',
	justifyContent: 'center',
	transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
};

const helpButtonSizes = {
	large: { fontSize: '16px', height: '44px', minWidth: '44px', padding: '0 16px' },
	medium: { fontSize: '14px', height: '36px', minWidth: '36px', padding: '0 12px' },
	small: { fontSize: '12px', height: '28px', minWidth: '28px', padding: '0 8px' },
};

/**
 * A button component for triggering the keyboard shortcuts help dialog.
 *
 * @example
 * ```tsx
 * <KeyboardShortcutsHelpButton
 *   onClick={() => setIsHelpOpen(true)}
 *   variant="icon-text"
 *   label="Keyboard Shortcuts"
 * />
 * ```
 */
export function KeyboardShortcutsHelpButton({
	onClick,
	size = 'medium',
	variant = 'icon',
	label = 'Keyboard Shortcuts',
	className,
}: KeyboardShortcutsHelpButtonProps): React.ReactElement {
	const sizeStyles = helpButtonSizes[size];
	const showIcon = variant === 'icon' || variant === 'icon-text';
	const showText = variant === 'text' || variant === 'icon-text';

	return (
		<button
			type="button"
			onClick={onClick}
			style={{ ...helpButtonBaseStyles, ...sizeStyles }}
			className={className}
			aria-label={label}
			title={label}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = '#e2e8f0';
				e.currentTarget.style.borderColor = '#94a3b8';
				e.currentTarget.style.color = '#1e293b';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = '#f1f5f9';
				e.currentTarget.style.borderColor = '#cbd5e1';
				e.currentTarget.style.color = '#475569';
			}}>
			{showIcon && <span aria-hidden="true">?</span>}
			{showText && <span>{label}</span>}
		</button>
	);
}

// ============================================================================
// Exports
// ============================================================================

export default KeyboardShortcutsHelp;
