/**
 * ResponsiveCardGrid Component
 *
 * A React component that renders content in a responsive grid layout using
 * Tailwind CSS flexbox utilities. Adapts seamlessly to desktop, tablet, and
 * mobile views with automatic card wrapping.
 *
 * @example
 * ```tsx
 * import { ResponsiveCardGrid } from './components/ResponsiveCardGrid';
 * import { TreeNode } from './types/TreeNode';
 *
 * const nodes: TreeNode[] = [
 *   { id: '1', label: 'Home', depth: 0 },
 *   { id: '2', label: 'About', depth: 0 },
 *   { id: '3', label: 'Contact', depth: 0 },
 * ];
 *
 * <ResponsiveCardGrid items={nodes} />
 * ```
 */
import React from 'react';

import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Types
// ============================================================================

/**
 * Layout options for the responsive grid.
 */
export type GridLayout = 'auto' | 'fixed-2' | 'fixed-3' | 'fixed-4';

/**
 * Gap size options for spacing between cards.
 */
export type GapSize = 'sm' | 'md' | 'lg' | 'responsive';

/**
 * Card style variants.
 */
export type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat';

/**
 * Props for the ResponsiveCardGrid component.
 */
export interface ResponsiveCardGridProps {
	/** Array of items to render in the grid */
	items: TreeNode[];

	/** Optional CSS class name for the container */
	className?: string;

	/** Layout mode for the grid (default: 'auto') */
	layout?: GridLayout;

	/** Gap size between cards (default: 'md') */
	gap?: GapSize;

	/** Card visual style variant (default: 'default') */
	cardVariant?: CardVariant;

	/** Whether to use depth-based color coding (default: true) */
	useDepthColors?: boolean;

	/** Optional callback when a card is clicked */
	onCardClick?: (item: TreeNode) => void;

	/** Optional custom render function for card content */
	renderCard?: (item: TreeNode) => React.ReactNode;

	/** Accessible label for the grid container */
	ariaLabel?: string;

	/** Whether to show the children count badge (default: true) */
	showChildrenCount?: boolean;

	/** Minimum height for cards in pixels (default: undefined - auto) */
	minCardHeight?: number;
}

/**
 * Props for the internal GridCard component.
 */
interface GridCardProps {
	/** The tree node item to render */
	item: TreeNode;

	/** Card visual style variant */
	variant: CardVariant;

	/** Whether to use depth-based color coding */
	useDepthColors: boolean;

	/** Optional callback when the card is clicked */
	onClick?: (item: TreeNode) => void;

	/** Optional custom render function for card content */
	renderCard?: (item: TreeNode) => React.ReactNode;

	/** Whether to show the children count badge */
	showChildrenCount: boolean;

	/** Minimum height for the card */
	minHeight?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets Tailwind CSS classes for the grid layout.
 */
function getLayoutClasses(layout: GridLayout): string {
	switch (layout) {
		case 'fixed-2':
			return 'sm:w-[calc(50%-0.5rem)]';
		case 'fixed-3':
			return 'sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]';
		case 'fixed-4':
			return 'sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]';
		case 'auto':
		default:
			return 'sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]';
	}
}

/**
 * Gets Tailwind CSS classes for gap sizing.
 */
function getGapClasses(gap: GapSize): string {
	switch (gap) {
		case 'sm':
			return 'gap-2';
		case 'lg':
			return 'gap-6';
		case 'responsive':
			return 'gap-2 sm:gap-3 md:gap-4 lg:gap-6';
		case 'md':
		default:
			return 'gap-4';
	}
}

/**
 * Gets Tailwind CSS classes for card variant styling.
 */
function getCardVariantClasses(variant: CardVariant): string {
	switch (variant) {
		case 'bordered':
			return 'border-2 bg-white shadow-none hover:border-gray-400';
		case 'elevated':
			return 'border-0 bg-white shadow-lg hover:shadow-xl';
		case 'flat':
			return 'border-0 bg-gray-50 shadow-none hover:bg-gray-100';
		case 'default':
		default:
			return 'border bg-white shadow-sm hover:shadow-md';
	}
}

/**
 * Gets inline styles for depth-based color coding.
 * Matches the color scheme used in BasicTree component for consistency.
 */
function getDepthStyles(depth: number, useDepthColors: boolean): React.CSSProperties {
	if (!useDepthColors) {
		return {};
	}

	const depthColors: Record<number, { bg: string; border: string; text: string }> = {
		0: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' }, // Blue
		1: { bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d' }, // Green
		2: { bg: '#faf5ff', border: '#e9d5ff', text: '#581c87' }, // Purple
		3: { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12' }, // Orange
		4: { bg: '#fdf2f8', border: '#fbcfe8', text: '#831843' }, // Pink
	};

	// Cycle through colors for depths >= 5
	const normalizedDepth = depth % 5;
	const colors = depthColors[normalizedDepth] || depthColors[0];

	return {
		backgroundColor: colors.bg,
		borderColor: colors.border,
		color: colors.text,
	};
}

// ============================================================================
// GridCard Component (Internal)
// ============================================================================

/**
 * Internal component for rendering a single card in the grid.
 */
function GridCard({
	item,
	variant,
	useDepthColors,
	onClick,
	renderCard,
	showChildrenCount,
	minHeight,
}: GridCardProps): React.ReactElement {
	const hasChildren = item.children && item.children.length > 0;
	const depthStyles = getDepthStyles(item.depth, useDepthColors);
	const variantClasses = getCardVariantClasses(variant);

	const handleClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		onClick?.(item);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (onClick && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			onClick(item);
		}
	};

	const cardStyles: React.CSSProperties = {
		...depthStyles,
		minHeight: minHeight ? `${minHeight}px` : undefined,
	};

	return (
		<div
			className={`rounded-lg p-4 transition-all duration-200 ease-in-out ${variantClasses} ${onClick ? 'cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none' : ''} `}
			style={cardStyles}
			onClick={onClick ? handleClick : undefined}
			onKeyDown={onClick ? handleKeyDown : undefined}
			role={onClick ? 'button' : 'article'}
			tabIndex={onClick ? 0 : undefined}
			data-card-id={item.id}
			data-depth={item.depth}
			aria-label={`${item.label}${hasChildren ? `, ${item.children!.length} children` : ''}`}>
			{renderCard ? (
				renderCard(item)
			) : (
				<div className="flex h-full flex-col">
					{/* Card Header */}
					<div className="mb-2 flex items-start justify-between">
						{/* Depth indicator */}
						<span
							className="mt-1.5 mr-2 inline-block h-2 w-2 flex-shrink-0 rounded-full"
							style={{
								backgroundColor: depthStyles.borderColor || '#9ca3af',
							}}
							aria-hidden="true"
						/>

						{/* Label */}
						<span className="flex-grow text-sm font-medium break-words sm:text-base">
							{item.label}
						</span>

						{/* Children count badge */}
						{showChildrenCount && hasChildren && (
							<span
								className="ml-2 flex-shrink-0 rounded-full bg-black/10 px-2 py-0.5 text-xs"
								aria-label={`${item.children!.length} child items`}>
								{item.children!.length}
							</span>
						)}
					</div>

					{/* Metadata section (if available) */}
					{item.metadata?.category && (
						<div className="mt-auto border-t border-current/10 pt-2">
							<span className="text-xs opacity-70">{item.metadata.category}</span>
						</div>
					)}

					{/* Depth level indicator */}
					<div className="mt-2 text-xs opacity-50">Level {item.depth}</div>
				</div>
			)}
		</div>
	);
}

// ============================================================================
// ResponsiveCardGrid Component
// ============================================================================

/**
 * ResponsiveCardGrid component renders items in a flexible grid layout that
 * adapts to different screen sizes using Tailwind CSS flexbox utilities.
 *
 * Features:
 * - Responsive layout adapting to desktop (3 cols), tablet (2 cols), and mobile (1 col)
 * - Automatic card wrapping for content overflow
 * - Depth-based color coding consistent with BasicTree component
 * - Configurable card variants and gap sizes
 * - Accessible with keyboard navigation support
 * - Custom render function support
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ResponsiveCardGrid items={treeNodes} />
 *
 * // With click handler
 * <ResponsiveCardGrid
 *   items={treeNodes}
 *   onCardClick={(item) => console.log('Clicked:', item.label)}
 * />
 *
 * // With custom layout and styling
 * <ResponsiveCardGrid
 *   items={treeNodes}
 *   layout="fixed-4"
 *   gap="lg"
 *   cardVariant="elevated"
 *   useDepthColors={false}
 * />
 *
 * // With custom card rendering
 * <ResponsiveCardGrid
 *   items={treeNodes}
 *   renderCard={(item) => (
 *     <div>
 *       <h3>{item.label}</h3>
 *       <p>Depth: {item.depth}</p>
 *     </div>
 *   )}
 * />
 * ```
 */
export function ResponsiveCardGrid({
	items,
	className = '',
	layout = 'auto',
	gap = 'md',
	cardVariant = 'default',
	useDepthColors = true,
	onCardClick,
	renderCard,
	ariaLabel = 'Content grid',
	showChildrenCount = true,
	minCardHeight,
}: ResponsiveCardGridProps): React.ReactElement {
	// Handle empty state
	if (!items || items.length === 0) {
		return (
			<div
				className={`flex items-center justify-center p-8 text-gray-500 italic ${className}`.trim()}
				role="region"
				aria-label={ariaLabel}>
				No items to display
			</div>
		);
	}

	const gapClasses = getGapClasses(gap);
	const layoutClasses = getLayoutClasses(layout);

	return (
		<div
			className={`flex flex-wrap ${gapClasses} ${className}`.trim()}
			role="region"
			aria-label={ariaLabel}
			style={{
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			}}>
			{items.map((item) => (
				<div key={item.id} className={`w-full ${layoutClasses} min-w-0`}>
					<GridCard
						item={item}
						variant={cardVariant}
						useDepthColors={useDepthColors}
						onClick={onCardClick}
						renderCard={renderCard}
						showChildrenCount={showChildrenCount}
						minHeight={minCardHeight}
					/>
				</div>
			))}
		</div>
	);
}

// Default export for convenience
export default ResponsiveCardGrid;
