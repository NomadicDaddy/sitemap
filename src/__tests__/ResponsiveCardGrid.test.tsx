/**
 * ResponsiveCardGrid Component Unit Tests
 *
 * Comprehensive tests for the ResponsiveCardGrid React component that renders
 * items in a responsive flexbox grid layout.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ResponsiveCardGrid } from '../components/ResponsiveCardGrid';
import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Test Data Helpers
// ============================================================================

/**
 * Creates a simple flat list of items for testing.
 */
function createSimpleItems(): TreeNode[] {
	return [
		{ depth: 0, id: 'item-1', label: 'Item 1' },
		{ depth: 0, id: 'item-2', label: 'Item 2' },
		{ depth: 0, id: 'item-3', label: 'Item 3' },
	];
}

/**
 * Creates items with varying depths for testing depth-based styling.
 */
function createDepthVariedItems(): TreeNode[] {
	return [
		{ depth: 0, id: 'item-1', label: 'Depth 0' },
		{ depth: 1, id: 'item-2', label: 'Depth 1' },
		{ depth: 2, id: 'item-3', label: 'Depth 2' },
		{ depth: 3, id: 'item-4', label: 'Depth 3' },
		{ depth: 4, id: 'item-5', label: 'Depth 4' },
		{ depth: 5, id: 'item-6', label: 'Depth 5' }, // Should cycle back to depth 0 colors
	];
}

/**
 * Creates items with children for testing children count display.
 */
function createItemsWithChildren(): TreeNode[] {
	return [
		{
			children: [
				{ depth: 1, id: 'child-1', label: 'Child 1' },
				{ depth: 1, id: 'child-2', label: 'Child 2' },
				{ depth: 1, id: 'child-3', label: 'Child 3' },
			],
			depth: 0,
			id: 'item-1',
			label: 'Parent Item',
		},
		{ depth: 0, id: 'item-2', label: 'Leaf Item' },
	];
}

/**
 * Creates items with metadata for testing metadata display.
 */
function createItemsWithMetadata(): TreeNode[] {
	return [
		{
			depth: 0,
			id: 'item-1',
			label: 'Page Item',
			metadata: { category: 'Page' },
		},
		{
			depth: 1,
			id: 'item-2',
			label: 'Section Item',
			metadata: { category: 'Section' },
		},
	];
}

// ============================================================================
// Tests
// ============================================================================

describe('ResponsiveCardGrid', () => {
	describe('rendering', () => {
		it('should render all items in the grid', () => {
			const items = createSimpleItems();
			render(<ResponsiveCardGrid items={items} />);

			expect(screen.getByText('Item 1')).toBeInTheDocument();
			expect(screen.getByText('Item 2')).toBeInTheDocument();
			expect(screen.getByText('Item 3')).toBeInTheDocument();
		});

		it('should render an empty state when items array is empty', () => {
			render(<ResponsiveCardGrid items={[]} />);

			expect(screen.getByText('No items to display')).toBeInTheDocument();
		});

		it('should render depth level indicators', () => {
			const items = createDepthVariedItems();
			render(<ResponsiveCardGrid items={items} />);

			expect(screen.getByText('Level 0')).toBeInTheDocument();
			expect(screen.getByText('Level 1')).toBeInTheDocument();
			expect(screen.getByText('Level 2')).toBeInTheDocument();
		});

		it('should show children count for items with children', () => {
			const items = createItemsWithChildren();
			render(<ResponsiveCardGrid items={items} />);

			// Parent Item has 3 children
			expect(screen.getByText('3')).toBeInTheDocument();
		});

		it('should hide children count when showChildrenCount is false', () => {
			const items = createItemsWithChildren();
			render(<ResponsiveCardGrid items={items} showChildrenCount={false} />);

			// Should not show the children count badge
			expect(screen.queryByText('3')).not.toBeInTheDocument();
		});

		it('should display metadata category when available', () => {
			const items = createItemsWithMetadata();
			render(<ResponsiveCardGrid items={items} />);

			expect(screen.getByText('Page')).toBeInTheDocument();
			expect(screen.getByText('Section')).toBeInTheDocument();
		});
	});

	describe('data attributes', () => {
		it('should set data-card-id attribute on each card', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const cards = container.querySelectorAll('[data-card-id]');
			expect(cards).toHaveLength(3);

			expect(cards[0].getAttribute('data-card-id')).toBe('item-1');
			expect(cards[1].getAttribute('data-card-id')).toBe('item-2');
			expect(cards[2].getAttribute('data-card-id')).toBe('item-3');
		});

		it('should set data-depth attribute on each card', () => {
			const items = createDepthVariedItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const cards = container.querySelectorAll('[data-depth]');
			expect(cards).toHaveLength(6);

			expect(cards[0].getAttribute('data-depth')).toBe('0');
			expect(cards[1].getAttribute('data-depth')).toBe('1');
			expect(cards[2].getAttribute('data-depth')).toBe('2');
		});
	});

	describe('styling and customization', () => {
		it('should apply custom className to container', () => {
			const items = createSimpleItems();
			const { container } = render(
				<ResponsiveCardGrid items={items} className="my-custom-class" />
			);

			expect(container.firstChild).toHaveClass('my-custom-class');
		});

		it('should apply different gap sizes', () => {
			const items = createSimpleItems();

			// Test small gap
			const { container: containerSm, unmount: unmountSm } = render(
				<ResponsiveCardGrid items={items} gap="sm" />
			);
			expect(containerSm.firstChild).toHaveClass('gap-2');
			unmountSm();

			// Test medium gap (default)
			const { container: containerMd, unmount: unmountMd } = render(
				<ResponsiveCardGrid items={items} gap="md" />
			);
			expect(containerMd.firstChild).toHaveClass('gap-4');
			unmountMd();

			// Test large gap
			const { container: containerLg } = render(
				<ResponsiveCardGrid items={items} gap="lg" />
			);
			expect(containerLg.firstChild).toHaveClass('gap-6');
		});

		it('should disable depth colors when useDepthColors is false', () => {
			const items = createSimpleItems();
			const { container } = render(
				<ResponsiveCardGrid items={items} useDepthColors={false} />
			);

			const cards = container.querySelectorAll('[data-card-id]');
			// When depth colors are disabled, cards should not have depth-based background colors
			cards.forEach((card) => {
				const element = card as HTMLElement;
				expect(element.style.backgroundColor).toBe('');
			});
		});

		it('should apply depth-based colors by default', () => {
			const items = createDepthVariedItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const cards = container.querySelectorAll('[data-card-id]');
			// Cards should have depth-based background colors
			const firstCard = cards[0] as HTMLElement;
			expect(firstCard.style.backgroundColor).toBe('rgb(239, 246, 255)'); // Blue for depth 0
		});

		it('should apply minimum card height when specified', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} minCardHeight={200} />);

			const cards = container.querySelectorAll('[data-card-id]');
			cards.forEach((card) => {
				const element = card as HTMLElement;
				expect(element.style.minHeight).toBe('200px');
			});
		});
	});

	describe('layout modes', () => {
		it('should apply auto layout by default', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const wrapper = container.querySelectorAll('[data-card-id]')[0]?.parentElement;
			expect(wrapper).toHaveClass('w-full');
		});

		it('should use flexbox container', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			expect(container.firstChild).toHaveClass('flex');
			expect(container.firstChild).toHaveClass('flex-wrap');
		});
	});

	describe('card variants', () => {
		it('should apply default card variant', () => {
			const items = createSimpleItems();
			const { container } = render(
				<ResponsiveCardGrid items={items} cardVariant="default" />
			);

			const cards = container.querySelectorAll('[data-card-id]');
			expect(cards[0]).toHaveClass('border');
		});

		it('should apply bordered card variant', () => {
			const items = createSimpleItems();
			const { container } = render(
				<ResponsiveCardGrid items={items} cardVariant="bordered" />
			);

			const cards = container.querySelectorAll('[data-card-id]');
			expect(cards[0]).toHaveClass('border-2');
		});

		it('should apply elevated card variant', () => {
			const items = createSimpleItems();
			const { container } = render(
				<ResponsiveCardGrid items={items} cardVariant="elevated" />
			);

			const cards = container.querySelectorAll('[data-card-id]');
			expect(cards[0]).toHaveClass('shadow-lg');
		});

		it('should apply flat card variant', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} cardVariant="flat" />);

			const cards = container.querySelectorAll('[data-card-id]');
			expect(cards[0]).toHaveClass('border-0');
		});
	});

	describe('interactivity', () => {
		it('should call onCardClick when a card is clicked', () => {
			const items = createSimpleItems();
			const handleClick = jest.fn();
			render(<ResponsiveCardGrid items={items} onCardClick={handleClick} />);

			fireEvent.click(screen.getByText('Item 1'));

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'item-1', label: 'Item 1' })
			);
		});

		it('should call onCardClick with correct item when different cards are clicked', () => {
			const items = createSimpleItems();
			const handleClick = jest.fn();
			render(<ResponsiveCardGrid items={items} onCardClick={handleClick} />);

			fireEvent.click(screen.getByText('Item 2'));

			expect(handleClick).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'item-2', label: 'Item 2' })
			);
		});

		it('should support keyboard navigation with Enter key', () => {
			const items = createSimpleItems();
			const handleClick = jest.fn();
			const { container } = render(
				<ResponsiveCardGrid items={items} onCardClick={handleClick} />
			);

			const card = container.querySelector('[data-card-id="item-1"]');
			fireEvent.keyDown(card!, { key: 'Enter' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should support keyboard navigation with Space key', () => {
			const items = createSimpleItems();
			const handleClick = jest.fn();
			const { container } = render(
				<ResponsiveCardGrid items={items} onCardClick={handleClick} />
			);

			const card = container.querySelector('[data-card-id="item-1"]');
			fireEvent.keyDown(card!, { key: ' ' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should have role="button" when onCardClick is provided', () => {
			const items = createSimpleItems();
			const handleClick = jest.fn();
			const { container } = render(
				<ResponsiveCardGrid items={items} onCardClick={handleClick} />
			);

			const buttons = container.querySelectorAll('[role="button"]');
			expect(buttons.length).toBe(3);
		});

		it('should have role="article" when onCardClick is not provided', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const articles = container.querySelectorAll('[role="article"]');
			expect(articles.length).toBe(3);
		});

		it('should have tabIndex when onCardClick is provided', () => {
			const items = createSimpleItems();
			const handleClick = jest.fn();
			const { container } = render(
				<ResponsiveCardGrid items={items} onCardClick={handleClick} />
			);

			const cards = container.querySelectorAll('[data-card-id]');
			cards.forEach((card) => {
				expect(card).toHaveAttribute('tabIndex', '0');
			});
		});
	});

	describe('custom card rendering', () => {
		it('should support custom renderCard function', () => {
			const items = createSimpleItems();
			const customRender = (item: TreeNode) => (
				<div data-testid="custom-card">Custom: {item.label}</div>
			);
			render(<ResponsiveCardGrid items={items} renderCard={customRender} />);

			expect(screen.getByText('Custom: Item 1')).toBeInTheDocument();
			expect(screen.getByText('Custom: Item 2')).toBeInTheDocument();
			expect(screen.getAllByTestId('custom-card')).toHaveLength(3);
		});

		it('should use default card rendering when renderCard is not provided', () => {
			const items = createSimpleItems();
			render(<ResponsiveCardGrid items={items} />);

			// Default rendering includes the label and level indicator
			expect(screen.getByText('Item 1')).toBeInTheDocument();
			expect(screen.getAllByText('Level 0')).toHaveLength(3);
		});
	});

	describe('accessibility', () => {
		it('should have role="region" on container', () => {
			const items = createSimpleItems();
			render(<ResponsiveCardGrid items={items} />);

			expect(screen.getByRole('region')).toBeInTheDocument();
		});

		it('should have aria-label on container', () => {
			const items = createSimpleItems();
			render(<ResponsiveCardGrid items={items} />);

			expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Content grid');
		});

		it('should use custom ariaLabel when provided', () => {
			const items = createSimpleItems();
			render(<ResponsiveCardGrid items={items} ariaLabel="Product catalog" />);

			expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Product catalog');
		});

		it('should have aria-label on each card', () => {
			const items = createItemsWithChildren();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const parentCard = container.querySelector('[data-card-id="item-1"]');
			expect(parentCard).toHaveAttribute('aria-label', 'Parent Item, 3 children');

			const leafCard = container.querySelector('[data-card-id="item-2"]');
			expect(leafCard).toHaveAttribute('aria-label', 'Leaf Item');
		});

		it('should have focus styles when card is interactive', () => {
			const items = createSimpleItems();
			const handleClick = jest.fn();
			const { container } = render(
				<ResponsiveCardGrid items={items} onCardClick={handleClick} />
			);

			const cards = container.querySelectorAll('[data-card-id]');
			cards.forEach((card) => {
				expect(card).toHaveClass('focus:ring-2');
			});
		});
	});

	describe('edge cases', () => {
		it('should handle items with special characters in labels', () => {
			const items: TreeNode[] = [
				{ depth: 0, id: 'item-1', label: 'Products & Services' },
				{ depth: 0, id: 'item-2', label: 'Category: Electronics' },
				{ depth: 0, id: 'item-3', label: 'Item (Special)' },
			];
			render(<ResponsiveCardGrid items={items} />);

			expect(screen.getByText('Products & Services')).toBeInTheDocument();
			expect(screen.getByText('Category: Electronics')).toBeInTheDocument();
			expect(screen.getByText('Item (Special)')).toBeInTheDocument();
		});

		it('should handle items with empty string labels', () => {
			const items: TreeNode[] = [{ depth: 0, id: 'item-1', label: '' }];
			const { container } = render(<ResponsiveCardGrid items={items} />);

			expect(container.querySelector('[data-card-id="item-1"]')).toBeInTheDocument();
		});

		it('should handle items with long labels', () => {
			const longLabel =
				'This is a very long label that might overflow the container in some scenarios and should wrap properly';
			const items: TreeNode[] = [{ depth: 0, id: 'item-1', label: longLabel }];
			render(<ResponsiveCardGrid items={items} />);

			expect(screen.getByText(longLabel)).toBeInTheDocument();
		});

		it('should handle large number of items', () => {
			const items: TreeNode[] = Array.from({ length: 100 }, (_, i) => ({
				depth: i % 5,
				id: `item-${i}`,
				label: `Item ${i}`,
			}));
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const cards = container.querySelectorAll('[data-card-id]');
			expect(cards).toHaveLength(100);
		});

		it('should cycle depth colors for depths >= 5', () => {
			const items = createDepthVariedItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const cards = container.querySelectorAll('[data-card-id]');

			// Depth 0 and Depth 5 should have the same color (cycle)
			const depth0Card = cards[0] as HTMLElement;
			const depth5Card = cards[5] as HTMLElement;

			expect(depth0Card.style.backgroundColor).toBe(depth5Card.style.backgroundColor);
		});

		it('should handle undefined children gracefully', () => {
			const items: TreeNode[] = [{ depth: 0, id: 'item-1', label: 'No Children Defined' }];
			render(<ResponsiveCardGrid items={items} />);

			// Should render without the children count badge
			expect(screen.getByText('No Children Defined')).toBeInTheDocument();
		});

		it('should handle empty children array', () => {
			const items: TreeNode[] = [
				{ children: [], depth: 0, id: 'item-1', label: 'Empty Children' },
			];
			render(<ResponsiveCardGrid items={items} />);

			// Should render without the children count badge for empty arrays
			expect(screen.getByText('Empty Children')).toBeInTheDocument();
			expect(screen.queryByText('0')).not.toBeInTheDocument();
		});
	});

	describe('responsive behavior', () => {
		it('should have responsive width classes on card wrappers', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const wrappers = container.querySelectorAll('[data-card-id]');
			const parentWrapper = wrappers[0]?.parentElement;

			// Check for responsive width classes
			expect(parentWrapper).toHaveClass('w-full');
		});

		it('should apply transition classes for smooth layout changes', () => {
			const items = createSimpleItems();
			const { container } = render(<ResponsiveCardGrid items={items} />);

			const cards = container.querySelectorAll('[data-card-id]');
			cards.forEach((card) => {
				expect(card).toHaveClass('transition-all');
				expect(card).toHaveClass('duration-200');
			});
		});
	});
});
