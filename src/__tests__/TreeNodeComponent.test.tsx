/**
 * TreeNodeComponent Unit Tests
 *
 * Comprehensive tests for the TreeNodeComponent React component that renders
 * individual tree nodes with recursive child support.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { TreeNodeComponent } from '../components/TreeNodeComponent';
import {
	DEFAULT_DEPTH_COLORS,
	DEFAULT_TREE_NODE_PROPS,
	computeBulletStyles,
	computeNodeStyles,
	getDepthColor,
	useTreeNodeExpansion,
	useTreeNodeSelection,
} from '../components/TreeNodeUtils';
import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Test Data Helpers
// ============================================================================

/**
 * Creates a simple leaf node for testing.
 */
function createLeafNode(overrides: Partial<TreeNode> = {}): TreeNode {
	return {
		depth: 0,
		id: 'leaf-1',
		label: 'Leaf Node',
		...overrides,
	};
}

/**
 * Creates a node with children for testing.
 */
function createNodeWithChildren(): TreeNode {
	return {
		children: [
			{ depth: 1, id: 'child-1', label: 'Child 1' },
			{ depth: 1, id: 'child-2', label: 'Child 2' },
		],
		depth: 0,
		id: 'parent-1',
		label: 'Parent',
	};
}

/**
 * Creates a deeply nested node structure.
 */
function createDeepNode(): TreeNode {
	return {
		children: [
			{
				children: [
					{
						children: [
							{
								children: [{ depth: 4, id: 'level-4', label: 'Level 4' }],
								depth: 3,
								id: 'level-3',
								label: 'Level 3',
							},
						],
						depth: 2,
						id: 'level-2',
						label: 'Level 2',
					},
				],
				depth: 1,
				id: 'level-1',
				label: 'Level 1',
			},
		],
		depth: 0,
		id: 'level-0',
		label: 'Level 0',
	};
}

/**
 * Creates a node with metadata for testing.
 */
function createNodeWithMetadata(): TreeNode {
	return {
		depth: 0,
		id: 'meta-node',
		label: 'Node with Metadata',
		metadata: {
			category: 'Page',
			expanded: true,
			lineNumber: 1,
			style: {
				backgroundColor: '#ff0000',
				borderColor: '#cc0000',
				textColor: '#ffffff',
			},
		},
	};
}

// ============================================================================
// Tests
// ============================================================================

describe('TreeNodeComponent', () => {
	describe('basic rendering', () => {
		it('should render a simple leaf node', () => {
			const node = createLeafNode();
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText('Leaf Node')).toBeInTheDocument();
		});

		it('should render node with data-node-id attribute', () => {
			const node = createLeafNode({ id: 'test-id' });
			const { container } = render(<TreeNodeComponent node={node} />);

			expect(container.querySelector('[data-node-id="test-id"]')).toBeInTheDocument();
		});

		it('should render node with data-depth attribute', () => {
			const node = createLeafNode({ depth: 3 });
			const { container } = render(<TreeNodeComponent node={node} />);

			expect(container.querySelector('[data-depth="3"]')).toBeInTheDocument();
		});

		it('should render children recursively by default', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText('Parent')).toBeInTheDocument();
			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();
		});

		it('should render deeply nested structures', () => {
			const node = createDeepNode();
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText('Level 0')).toBeInTheDocument();
			expect(screen.getByText('Level 1')).toBeInTheDocument();
			expect(screen.getByText('Level 2')).toBeInTheDocument();
			expect(screen.getByText('Level 3')).toBeInTheDocument();
			expect(screen.getByText('Level 4')).toBeInTheDocument();
		});

		it('should show children count by default', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText('(2)')).toBeInTheDocument();
		});

		it('should hide children count when showChildrenCount is false', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} showChildrenCount={false} />);

			expect(screen.queryByText('(2)')).not.toBeInTheDocument();
		});

		it('should not show children count for leaf nodes', () => {
			const node = createLeafNode();
			render(<TreeNodeComponent node={node} />);

			expect(screen.queryByText('(0)')).not.toBeInTheDocument();
		});
	});

	describe('non-recursive rendering', () => {
		it('should not render children when recursive is false', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} recursive={false} />);

			expect(screen.getByText('Parent')).toBeInTheDocument();
			expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
			expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
		});

		it('should still show children count when recursive is false', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} recursive={false} />);

			expect(screen.getByText('(2)')).toBeInTheDocument();
		});
	});

	describe('maxDepth prop', () => {
		it('should limit rendering to maxDepth', () => {
			const node = createDeepNode();
			render(<TreeNodeComponent node={node} maxDepth={2} />);

			expect(screen.getByText('Level 0')).toBeInTheDocument();
			expect(screen.getByText('Level 1')).toBeInTheDocument();
			expect(screen.getByText('Level 2')).toBeInTheDocument();
			expect(screen.queryByText('Level 3')).not.toBeInTheDocument();
			expect(screen.queryByText('Level 4')).not.toBeInTheDocument();
		});

		it('should render all levels when maxDepth is undefined', () => {
			const node = createDeepNode();
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText('Level 0')).toBeInTheDocument();
			expect(screen.getByText('Level 4')).toBeInTheDocument();
		});
	});

	describe('isExpanded prop', () => {
		it('should not render children when isExpanded is false', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} isExpanded={false} />);

			expect(screen.getByText('Parent')).toBeInTheDocument();
			expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
			expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
		});

		it('should render children when isExpanded is true', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} isExpanded={true} />);

			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();
		});

		it('should set aria-expanded attribute on nodes with children', () => {
			const node = createNodeWithChildren();
			const { container } = render(
				<TreeNodeComponent node={node} isExpanded={true} onNodeClick={() => {}} />
			);

			const label = container.querySelector('[data-node-id="parent-1"] > .tree-node-label');
			expect(label).toHaveAttribute('aria-expanded', 'true');
		});

		it('should not set aria-expanded on leaf nodes', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} onNodeClick={() => {}} />);

			const label = container.querySelector('.tree-node-label');
			expect(label).not.toHaveAttribute('aria-expanded');
		});
	});

	describe('depth indicators', () => {
		it('should show depth indicators by default', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} />);

			expect(container.querySelector('.tree-node-bullet')).toBeInTheDocument();
		});

		it('should hide depth indicators when showDepthIndicators is false', () => {
			const node = createLeafNode();
			const { container } = render(
				<TreeNodeComponent node={node} showDepthIndicators={false} />
			);

			expect(container.querySelector('.tree-node-bullet')).not.toBeInTheDocument();
		});

		it('should have aria-hidden on depth indicator bullets', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} />);

			const bullet = container.querySelector('.tree-node-bullet');
			expect(bullet).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('indentation', () => {
		it('should use default indent size of 24px', () => {
			const node = createLeafNode({ depth: 1 });
			const { container } = render(<TreeNodeComponent node={node} />);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			// depth 1 * 24 + 12 = 36px
			expect(label.style.paddingLeft).toBe('36px');
		});

		it('should apply custom indent size', () => {
			const node = createLeafNode({ depth: 1 });
			const { container } = render(<TreeNodeComponent node={node} indentSize={40} />);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			// depth 1 * 40 + 12 = 52px
			expect(label.style.paddingLeft).toBe('52px');
		});

		it('should correctly calculate indentation for deep nodes', () => {
			const node = createLeafNode({ depth: 3 });
			const { container } = render(<TreeNodeComponent node={node} indentSize={20} />);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			// depth 3 * 20 + 12 = 72px
			expect(label.style.paddingLeft).toBe('72px');
		});
	});

	describe('click handling', () => {
		it('should call onNodeClick when node is clicked', () => {
			const node = createLeafNode();
			const handleClick = jest.fn();
			render(<TreeNodeComponent node={node} onNodeClick={handleClick} />);

			fireEvent.click(screen.getByText('Leaf Node'));

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick).toHaveBeenCalledWith(node);
		});

		it('should stop propagation on click', () => {
			const node = createNodeWithChildren();
			const handleClick = jest.fn();
			render(<TreeNodeComponent node={node} onNodeClick={handleClick} />);

			fireEvent.click(screen.getByText('Child 1'));

			// Should only be called once (not bubbling to parent)
			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'child-1' }));
		});

		it('should have role="button" when onNodeClick is provided', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} onNodeClick={() => {}} />);

			expect(container.querySelector('[role="button"]')).toBeInTheDocument();
		});

		it('should not have role="button" when onNodeClick is not provided', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} />);

			expect(container.querySelector('[role="button"]')).not.toBeInTheDocument();
		});

		it('should be focusable when onNodeClick is provided', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} onNodeClick={() => {}} />);

			const label = container.querySelector('.tree-node-label');
			expect(label).toHaveAttribute('tabIndex', '0');
		});

		it('should not be focusable when onNodeClick is not provided', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} />);

			const label = container.querySelector('.tree-node-label');
			expect(label).not.toHaveAttribute('tabIndex');
		});
	});

	describe('keyboard navigation', () => {
		it('should trigger click on Enter key', () => {
			const node = createLeafNode();
			const handleClick = jest.fn();
			const { container } = render(
				<TreeNodeComponent node={node} onNodeClick={handleClick} />
			);

			const label = container.querySelector('.tree-node-label');
			fireEvent.keyDown(label!, { key: 'Enter' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should trigger click on Space key', () => {
			const node = createLeafNode();
			const handleClick = jest.fn();
			const { container } = render(
				<TreeNodeComponent node={node} onNodeClick={handleClick} />
			);

			const label = container.querySelector('.tree-node-label');
			fireEvent.keyDown(label!, { key: ' ' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should prevent default on Enter/Space', () => {
			const node = createLeafNode();
			const handleClick = jest.fn();
			const { container } = render(
				<TreeNodeComponent node={node} onNodeClick={handleClick} />
			);

			const label = container.querySelector('.tree-node-label');
			const enterEvent = fireEvent.keyDown(label!, { key: 'Enter' });
			const spaceEvent = fireEvent.keyDown(label!, { key: ' ' });

			// fireEvent returns false if preventDefault was called
			expect(enterEvent).toBe(false);
			expect(spaceEvent).toBe(false);
		});
	});

	describe('hover handling', () => {
		it('should call onNodeHover with node on mouse enter', () => {
			const node = createLeafNode();
			const handleHover = jest.fn();
			const { container } = render(
				<TreeNodeComponent node={node} onNodeHover={handleHover} />
			);

			const label = container.querySelector('.tree-node-label');
			fireEvent.mouseEnter(label!);

			expect(handleHover).toHaveBeenCalledWith(node);
		});

		it('should call onNodeHover with null on mouse leave', () => {
			const node = createLeafNode();
			const handleHover = jest.fn();
			const { container } = render(
				<TreeNodeComponent node={node} onNodeHover={handleHover} />
			);

			const label = container.querySelector('.tree-node-label');
			fireEvent.mouseLeave(label!);

			expect(handleHover).toHaveBeenCalledWith(null);
		});
	});

	describe('focus handling', () => {
		it('should call onNodeFocus on focus', () => {
			const node = createLeafNode();
			const handleFocus = jest.fn();
			const { container } = render(
				<TreeNodeComponent node={node} onNodeFocus={handleFocus} onNodeClick={() => {}} />
			);

			const label = container.querySelector('.tree-node-label');
			fireEvent.focus(label!);

			expect(handleFocus).toHaveBeenCalledWith(node);
		});

		it('should call onNodeBlur on blur', () => {
			const node = createLeafNode();
			const handleBlur = jest.fn();
			const { container } = render(
				<TreeNodeComponent node={node} onNodeBlur={handleBlur} onNodeClick={() => {}} />
			);

			const label = container.querySelector('.tree-node-label');
			fireEvent.blur(label!);

			expect(handleBlur).toHaveBeenCalledWith(node);
		});
	});

	describe('custom rendering', () => {
		it('should support custom renderLabel function', () => {
			const node = createLeafNode();
			render(
				<TreeNodeComponent
					node={node}
					renderLabel={(n) => <strong>Custom: {n.label}</strong>}
				/>
			);

			expect(screen.getByText('Custom: Leaf Node')).toBeInTheDocument();
		});

		it('should support custom renderContent function', () => {
			const node = createLeafNode();
			render(
				<TreeNodeComponent
					node={node}
					renderContent={(_n, defaultContent) => (
						<div data-testid="custom-content">
							<span>Before</span>
							{defaultContent}
							<span>After</span>
						</div>
					)}
				/>
			);

			expect(screen.getByTestId('custom-content')).toBeInTheDocument();
			expect(screen.getByText('Before')).toBeInTheDocument();
			expect(screen.getByText('After')).toBeInTheDocument();
		});

		it('should support custom renderChildren function', () => {
			const node = createNodeWithChildren();
			render(
				<TreeNodeComponent
					node={node}
					renderChildren={(n, _children, defaultContainer) => (
						<div data-testid="custom-children">
							<span>Children of {n.label}:</span>
							{defaultContainer}
						</div>
					)}
				/>
			);

			expect(screen.getByTestId('custom-children')).toBeInTheDocument();
			expect(screen.getByText('Children of Parent:')).toBeInTheDocument();
		});
	});

	describe('styling', () => {
		it('should apply custom className to node container', () => {
			const node = createLeafNode();
			const { container } = render(
				<TreeNodeComponent node={node} className="my-custom-class" />
			);

			expect(container.querySelector('.tree-node')).toHaveClass('my-custom-class');
		});

		it('should apply custom labelClassName to label', () => {
			const node = createLeafNode();
			const { container } = render(
				<TreeNodeComponent node={node} labelClassName="my-label-class" />
			);

			expect(container.querySelector('.tree-node-label')).toHaveClass('my-label-class');
		});

		it('should apply custom fontSize', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} fontSize={18} />);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			expect(label.style.fontSize).toBe('18px');
		});

		it('should apply styleOverrides', () => {
			const node = createLeafNode();
			const { container } = render(
				<TreeNodeComponent
					node={node}
					styleOverrides={{
						backgroundColor: '#123456',
						borderColor: '#fedcba',
						textColor: '#abcdef',
					}}
				/>
			);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			expect(label.style.backgroundColor).toBe('rgb(18, 52, 86)');
			expect(label.style.color).toBe('rgb(171, 205, 239)');
			expect(label.style.borderColor).toBe('rgb(254, 220, 186)');
		});

		it('should apply metadata style overrides', () => {
			const node = createNodeWithMetadata();
			const { container } = render(<TreeNodeComponent node={node} />);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			expect(label.style.backgroundColor).toBe('rgb(255, 0, 0)');
			expect(label.style.color).toBe('rgb(255, 255, 255)');
		});

		it('should prefer prop styleOverrides over metadata styles', () => {
			const node = createNodeWithMetadata();
			const { container } = render(
				<TreeNodeComponent node={node} styleOverrides={{ backgroundColor: '#00ff00' }} />
			);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			expect(label.style.backgroundColor).toBe('rgb(0, 255, 0)');
		});

		it('should show selection styling when isSelected is true', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} isSelected={true} />);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			expect(label.style.outline).toBe('2px solid #3b82f6');
		});
	});

	describe('custom depth colors', () => {
		it('should use custom depth colors', () => {
			const node = createLeafNode({ depth: 0 });
			const customColors = {
				0: { bg: '#ffff00', border: '#cccc00', text: '#000000' },
			};
			const { container } = render(
				<TreeNodeComponent node={node} depthColors={customColors} />
			);

			const label = container.querySelector('.tree-node-label') as HTMLElement;
			expect(label.style.backgroundColor).toBe('rgb(255, 255, 0)');
		});
	});

	describe('data attributes', () => {
		it('should apply custom data attributes', () => {
			const node = createLeafNode();
			const { container } = render(
				<TreeNodeComponent
					node={node}
					dataAttributes={{ 'data-custom': 'value', 'data-test': 'test-value' }}
				/>
			);

			const nodeEl = container.querySelector('.tree-node');
			expect(nodeEl).toHaveAttribute('data-custom', 'value');
			expect(nodeEl).toHaveAttribute('data-test', 'test-value');
		});
	});

	describe('accessibility', () => {
		it('should apply custom role', () => {
			const node = createLeafNode();
			const { container } = render(<TreeNodeComponent node={node} role="treeitem" />);

			expect(container.querySelector('[role="treeitem"]')).toBeInTheDocument();
		});

		it('should apply aria-label', () => {
			const node = createLeafNode();
			const { container } = render(
				<TreeNodeComponent node={node} ariaLabel="Custom label" onNodeClick={() => {}} />
			);

			const label = container.querySelector('.tree-node-label');
			expect(label).toHaveAttribute('aria-label', 'Custom label');
		});

		it('should set aria-selected when isSelected is true', () => {
			const node = createLeafNode();
			const { container } = render(
				<TreeNodeComponent node={node} isSelected={true} onNodeClick={() => {}} />
			);

			const label = container.querySelector('.tree-node-label');
			expect(label).toHaveAttribute('aria-selected', 'true');
		});

		it('should have aria-label for children count', () => {
			const node = createNodeWithChildren();
			render(<TreeNodeComponent node={node} />);

			const countSpan = screen.getByText('(2)');
			expect(countSpan).toHaveAttribute('aria-label', '2 children');
		});
	});

	describe('edge cases', () => {
		it('should handle empty label', () => {
			const node = createLeafNode({ label: '' });
			const { container } = render(<TreeNodeComponent node={node} />);

			expect(container.querySelector('[data-node-id="leaf-1"]')).toBeInTheDocument();
		});

		it('should handle special characters in label', () => {
			const node = createLeafNode({ label: 'Products & Services <test>' });
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText('Products & Services <test>')).toBeInTheDocument();
		});

		it('should handle very long labels', () => {
			const longLabel = 'A'.repeat(500);
			const node = createLeafNode({ label: longLabel });
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText(longLabel)).toBeInTheDocument();
		});

		it('should handle empty children array', () => {
			const node = createLeafNode({ children: [] });
			render(<TreeNodeComponent node={node} />);

			expect(screen.getByText('Leaf Node')).toBeInTheDocument();
			expect(screen.queryByText('(0)')).not.toBeInTheDocument();
		});
	});
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('getDepthColor', () => {
	it('should return default colors for depth 0', () => {
		const color = getDepthColor(0);
		expect(color).toEqual(DEFAULT_DEPTH_COLORS[0]);
	});

	it('should cycle colors for depths >= 5', () => {
		const color5 = getDepthColor(5);
		const color0 = getDepthColor(0);
		expect(color5).toEqual(color0);
	});

	it('should use custom colors when provided', () => {
		const customColors = {
			0: { bg: '#000', border: '#111', text: '#222' },
		};
		const color = getDepthColor(0, customColors);
		expect(color).toEqual(customColors[0]);
	});

	it('should fall back to default when custom colors are empty', () => {
		const color = getDepthColor(0, {});
		expect(color).toEqual(DEFAULT_DEPTH_COLORS[0]);
	});
});

describe('computeNodeStyles', () => {
	it('should compute basic styles', () => {
		const styles = computeNodeStyles(0, {
			indentSize: 24,
			showDepthIndicators: true,
		});

		expect(styles.paddingLeft).toBe('12px');
		expect(styles.borderRadius).toBe('4px');
	});

	it('should apply depth-based colors when showDepthIndicators is true', () => {
		const styles = computeNodeStyles(0, {
			indentSize: 24,
			showDepthIndicators: true,
		});

		expect(styles.backgroundColor).toBe(DEFAULT_DEPTH_COLORS[0].bg);
		expect(styles.color).toBe(DEFAULT_DEPTH_COLORS[0].text);
	});

	it('should not apply depth colors when showDepthIndicators is false', () => {
		const styles = computeNodeStyles(0, {
			indentSize: 24,
			showDepthIndicators: false,
		});

		expect(styles.backgroundColor).toBeUndefined();
	});

	it('should apply selection outline when isSelected is true', () => {
		const styles = computeNodeStyles(0, {
			indentSize: 24,
			isSelected: true,
			showDepthIndicators: true,
		});

		expect(styles.outline).toBe('2px solid #3b82f6');
	});
});

describe('computeBulletStyles', () => {
	it('should return correct bullet styles', () => {
		const styles = computeBulletStyles('#ff0000');

		expect(styles.backgroundColor).toBe('#ff0000');
		expect(styles.width).toBe('8px');
		expect(styles.height).toBe('8px');
		expect(styles.borderRadius).toBe('50%');
	});
});

// ============================================================================
// Hook Tests
// ============================================================================

describe('useTreeNodeSelection', () => {
	it('should initialize with empty selection', () => {
		const { result } = renderHook(() => useTreeNodeSelection());

		expect(result.current.selectedIds.size).toBe(0);
	});

	it('should initialize with provided selected IDs', () => {
		const initial = new Set(['node-1', 'node-2']);
		const { result } = renderHook(() => useTreeNodeSelection(initial));

		expect(result.current.isSelected('node-1')).toBe(true);
		expect(result.current.isSelected('node-2')).toBe(true);
	});

	it('should toggle selection', () => {
		const { result } = renderHook(() => useTreeNodeSelection());

		act(() => {
			result.current.toggleSelection('node-1');
		});
		expect(result.current.isSelected('node-1')).toBe(true);

		act(() => {
			result.current.toggleSelection('node-1');
		});
		expect(result.current.isSelected('node-1')).toBe(false);
	});

	it('should select a single node', () => {
		const { result } = renderHook(() => useTreeNodeSelection());

		act(() => {
			result.current.selectNode('node-1');
		});

		expect(result.current.isSelected('node-1')).toBe(true);
	});

	it('should deselect a node', () => {
		const { result } = renderHook(() => useTreeNodeSelection(new Set(['node-1'])));

		act(() => {
			result.current.deselectNode('node-1');
		});

		expect(result.current.isSelected('node-1')).toBe(false);
	});

	it('should clear all selections', () => {
		const { result } = renderHook(() => useTreeNodeSelection(new Set(['node-1', 'node-2'])));

		act(() => {
			result.current.clearSelection();
		});

		expect(result.current.selectedIds.size).toBe(0);
	});

	it('should select only one node', () => {
		const { result } = renderHook(() => useTreeNodeSelection(new Set(['node-1', 'node-2'])));

		act(() => {
			result.current.selectOnly('node-3');
		});

		expect(result.current.selectedIds.size).toBe(1);
		expect(result.current.isSelected('node-3')).toBe(true);
		expect(result.current.isSelected('node-1')).toBe(false);
	});
});

describe('useTreeNodeExpansion', () => {
	it('should initialize with default expanded state', () => {
		const { result } = renderHook(() => useTreeNodeExpansion());

		expect(result.current.isExpanded('any-node')).toBe(true);
	});

	it('should initialize with custom default expanded state', () => {
		const { result } = renderHook(() => useTreeNodeExpansion(new Set(), false));

		expect(result.current.isExpanded('any-node')).toBe(false);
	});

	it('should toggle expansion', () => {
		const { result } = renderHook(() => useTreeNodeExpansion());

		act(() => {
			result.current.toggleExpansion('node-1');
		});

		// After toggle, should be in expandedIds set or not
		expect(result.current.expandedIds.has('node-1')).toBe(true);
	});

	it('should expand a node', () => {
		const { result } = renderHook(() => useTreeNodeExpansion(new Set(), false));

		act(() => {
			result.current.expandNode('node-1');
		});

		expect(result.current.isExpanded('node-1')).toBe(true);
	});

	it('should collapse a node', () => {
		const { result } = renderHook(() => useTreeNodeExpansion(new Set(['node-1']), true));

		act(() => {
			result.current.collapseNode('node-1');
		});

		expect(result.current.isExpanded('node-1')).toBe(false);
	});

	it('should expand all nodes', () => {
		const { result } = renderHook(() => useTreeNodeExpansion(new Set(), false));

		act(() => {
			result.current.expandAll(['node-1', 'node-2', 'node-3']);
		});

		expect(result.current.isExpanded('node-1')).toBe(true);
		expect(result.current.isExpanded('node-2')).toBe(true);
		expect(result.current.isExpanded('node-3')).toBe(true);
	});

	it('should collapse all nodes', () => {
		const { result } = renderHook(() =>
			useTreeNodeExpansion(new Set(['node-1', 'node-2']), true)
		);

		act(() => {
			result.current.collapseAll();
		});

		expect(result.current.expandedIds.size).toBe(0);
	});
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('DEFAULT_DEPTH_COLORS', () => {
	it('should have 5 depth levels defined', () => {
		expect(Object.keys(DEFAULT_DEPTH_COLORS)).toHaveLength(5);
	});

	it('should have valid color values for each depth', () => {
		Object.values(DEFAULT_DEPTH_COLORS).forEach((colors) => {
			expect(colors).toHaveProperty('bg');
			expect(colors).toHaveProperty('border');
			expect(colors).toHaveProperty('text');
			expect(colors.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(colors.border).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(colors.text).toMatch(/^#[0-9a-fA-F]{6}$/);
		});
	});
});

describe('DEFAULT_TREE_NODE_PROPS', () => {
	it('should have expected default values', () => {
		expect(DEFAULT_TREE_NODE_PROPS.indentSize).toBe(24);
		expect(DEFAULT_TREE_NODE_PROPS.showDepthIndicators).toBe(true);
		expect(DEFAULT_TREE_NODE_PROPS.fontSize).toBe(14);
		expect(DEFAULT_TREE_NODE_PROPS.showChildrenCount).toBe(true);
		expect(DEFAULT_TREE_NODE_PROPS.recursive).toBe(true);
	});
});
