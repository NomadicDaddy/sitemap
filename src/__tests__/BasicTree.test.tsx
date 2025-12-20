/**
 * BasicTree Component Unit Tests
 *
 * Comprehensive tests for the BasicTree React component that renders
 * parsed nodes as a hierarchical layout.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { BasicTree } from '../components/BasicTree';
import { type TreeNode } from '../types/TreeNode';
import { parseAndBuildTree } from '../utils/treeParser';

// ============================================================================
// Test Data Helpers
// ============================================================================

/**
 * Creates a simple tree structure for testing.
 */
function createSimpleTree(): TreeNode[] {
	return [
		{
			children: [
				{ depth: 1, id: 'node-2', label: 'Child 1' },
				{ depth: 1, id: 'node-3', label: 'Child 2' },
			],
			depth: 0,
			id: 'node-1',
			label: 'Root',
		},
	];
}

/**
 * Creates a deeply nested tree structure for testing.
 */
function createDeepTree(): TreeNode[] {
	return [
		{
			children: [
				{
					children: [
						{
							children: [
								{
									children: [{ depth: 4, id: 'node-5', label: 'Level 4' }],
									depth: 3,
									id: 'node-4',
									label: 'Level 3',
								},
							],
							depth: 2,
							id: 'node-3',
							label: 'Level 2',
						},
					],
					depth: 1,
					id: 'node-2',
					label: 'Level 1',
				},
			],
			depth: 0,
			id: 'node-1',
			label: 'Level 0',
		},
	];
}

/**
 * Creates a tree with multiple roots for testing.
 */
function createMultiRootTree(): TreeNode[] {
	return [
		{
			children: [{ depth: 1, id: 'node-2', label: 'Child of Root 1' }],
			depth: 0,
			id: 'node-1',
			label: 'Root 1',
		},
		{
			children: [{ depth: 1, id: 'node-4', label: 'Child of Root 2' }],
			depth: 0,
			id: 'node-3',
			label: 'Root 2',
		},
	];
}

// ============================================================================
// Tests
// ============================================================================

describe('BasicTree', () => {
	describe('rendering', () => {
		it('should render a simple tree structure', () => {
			const nodes = createSimpleTree();
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByText('Root')).toBeInTheDocument();
			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();
		});

		it('should render an empty state when nodes array is empty', () => {
			render(<BasicTree nodes={[]} />);

			expect(screen.getByText('No nodes to display')).toBeInTheDocument();
		});

		it('should render multiple root nodes', () => {
			const nodes = createMultiRootTree();
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByText('Root 1')).toBeInTheDocument();
			expect(screen.getByText('Root 2')).toBeInTheDocument();
			expect(screen.getByText('Child of Root 1')).toBeInTheDocument();
			expect(screen.getByText('Child of Root 2')).toBeInTheDocument();
		});

		it('should render deeply nested nodes', () => {
			const nodes = createDeepTree();
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByText('Level 0')).toBeInTheDocument();
			expect(screen.getByText('Level 1')).toBeInTheDocument();
			expect(screen.getByText('Level 2')).toBeInTheDocument();
			expect(screen.getByText('Level 3')).toBeInTheDocument();
			expect(screen.getByText('Level 4')).toBeInTheDocument();
		});

		it('should show children count for nodes with children', () => {
			const nodes = createSimpleTree();
			render(<BasicTree nodes={nodes} />);

			// Root has 2 children
			expect(screen.getByText('(2)')).toBeInTheDocument();
		});

		it('should not show children count for leaf nodes', () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Leaf' }];
			render(<BasicTree nodes={nodes} />);

			expect(screen.queryByText('(0)')).not.toBeInTheDocument();
		});
	});

	describe('data attributes', () => {
		it('should set data-node-id attribute on each node', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeElements = container.querySelectorAll('[data-node-id]');
			expect(nodeElements).toHaveLength(3);

			expect(nodeElements[0].getAttribute('data-node-id')).toBe('node-1');
			expect(nodeElements[1].getAttribute('data-node-id')).toBe('node-2');
			expect(nodeElements[2].getAttribute('data-node-id')).toBe('node-3');
		});

		it('should set data-depth attribute on each node', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeElements = container.querySelectorAll('[data-depth]');
			expect(nodeElements).toHaveLength(3);

			expect(nodeElements[0].getAttribute('data-depth')).toBe('0');
			expect(nodeElements[1].getAttribute('data-depth')).toBe('1');
			expect(nodeElements[2].getAttribute('data-depth')).toBe('1');
		});
	});

	describe('styling and customization', () => {
		it('should apply custom className to container', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} className="my-custom-class" />);

			expect(container.querySelector('.basic-tree')).toHaveClass('my-custom-class');
		});

		it('should apply custom indentSize', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} indentSize={40} />);

			// Get root node (depth 0) - should have paddingLeft of 0 * 40 + 12 = 12px
			const rootNode = container.querySelector(
				'[data-node-id="node-1"] > .tree-node-label'
			) as HTMLElement;
			expect(rootNode.style.paddingLeft).toBe('12px');

			// Get child node (depth 1) - should have paddingLeft of 1 * 40 + 12 = 52px
			const childNode = container.querySelector(
				'[data-node-id="node-2"] > .tree-node-label'
			) as HTMLElement;
			expect(childNode.style.paddingLeft).toBe('52px');
		});

		it('should hide depth indicators when showDepthIndicators is false', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} showDepthIndicators={false} />);

			const bullets = container.querySelectorAll('.tree-node-bullet');
			expect(bullets).toHaveLength(0);
		});

		it('should show depth indicators by default', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			const bullets = container.querySelectorAll('.tree-node-bullet');
			expect(bullets.length).toBeGreaterThan(0);
		});
	});

	describe('interactivity', () => {
		it('should call onNodeClick when a node is clicked', () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			render(<BasicTree nodes={nodes} onNodeClick={handleClick} />);

			fireEvent.click(screen.getByText('Child 1'));

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'node-2', label: 'Child 1' })
			);
		});

		it('should not trigger parent click when child is clicked', () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			render(<BasicTree nodes={nodes} onNodeClick={handleClick} />);

			fireEvent.click(screen.getByText('Child 1'));

			// Should only be called once (for child), not twice (for child and parent)
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should support keyboard navigation with Enter key', () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			render(<BasicTree nodes={nodes} onNodeClick={handleClick} />);

			const nodeLabel = screen.getByText('Child 1').closest('.tree-node-label');
			fireEvent.keyDown(nodeLabel!, { key: 'Enter' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should support keyboard navigation with Space key', () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			render(<BasicTree nodes={nodes} onNodeClick={handleClick} />);

			const nodeLabel = screen.getByText('Child 1').closest('.tree-node-label');
			fireEvent.keyDown(nodeLabel!, { key: ' ' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should have role="button" when onNodeClick is provided', () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			const { container } = render(<BasicTree nodes={nodes} onNodeClick={handleClick} />);

			const buttons = container.querySelectorAll('[role="button"]');
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('should not have role="button" when onNodeClick is not provided', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			const buttons = container.querySelectorAll('[role="button"]');
			expect(buttons).toHaveLength(0);
		});
	});

	describe('custom label rendering', () => {
		it('should support custom renderLabel function', () => {
			const nodes = createSimpleTree();
			const customRender = (node: TreeNode) => <strong>Custom: {node.label}</strong>;
			render(<BasicTree nodes={nodes} renderLabel={customRender} />);

			expect(screen.getByText('Custom: Root')).toBeInTheDocument();
			expect(screen.getByText('Custom: Child 1')).toBeInTheDocument();
		});

		it('should use default label rendering when renderLabel is not provided', () => {
			const nodes = createSimpleTree();
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByText('Root')).toBeInTheDocument();
		});
	});

	describe('accessibility', () => {
		it('should have role="tree" on container', () => {
			const nodes = createSimpleTree();
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByRole('tree')).toBeInTheDocument();
		});

		it('should have aria-label on container', () => {
			const nodes = createSimpleTree();
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'Tree structure');
		});

		it('should have aria-label for empty tree', () => {
			render(<BasicTree nodes={[]} />);

			expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'Empty tree');
		});

		it('should hide decorative bullets from screen readers', () => {
			const nodes = createSimpleTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			const bullets = container.querySelectorAll('.tree-node-bullet');
			bullets.forEach((bullet) => {
				expect(bullet).toHaveAttribute('aria-hidden', 'true');
			});
		});
	});

	describe('integration with parser', () => {
		it('should render tree from parseAndBuildTree output', () => {
			const input = `Website
├── Home
├── About
│   ├── Team
│   └── History
└── Contact`;

			const { tree } = parseAndBuildTree(input);
			render(<BasicTree nodes={tree} />);

			expect(screen.getByText('Website')).toBeInTheDocument();
			expect(screen.getByText('Home')).toBeInTheDocument();
			expect(screen.getByText('About')).toBeInTheDocument();
			expect(screen.getByText('Team')).toBeInTheDocument();
			expect(screen.getByText('History')).toBeInTheDocument();
			expect(screen.getByText('Contact')).toBeInTheDocument();
		});

		it('should handle complex sitemap structures', () => {
			const input = `App
├── Authentication
│   ├── Login
│   ├── Register
│   └── Forgot Password
├── Dashboard
│   ├── Overview
│   └── Charts
└── Profile`;

			const { tree } = parseAndBuildTree(input);
			render(<BasicTree nodes={tree} />);

			expect(screen.getByText('App')).toBeInTheDocument();
			expect(screen.getByText('Authentication')).toBeInTheDocument();
			expect(screen.getByText('Login')).toBeInTheDocument();
			expect(screen.getByText('Dashboard')).toBeInTheDocument();
			expect(screen.getByText('Overview')).toBeInTheDocument();
		});
	});

	describe('depth-based styling', () => {
		it('should apply blue background color for depth 0 (page level)', () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-1"] > .tree-node-label'
			) as HTMLElement;
			// Blue background for depth 0
			expect(nodeLabel.style.backgroundColor).toBe('rgb(219, 234, 254)'); // #dbeafe
		});

		it('should apply white background color for depth 1 (section level)', () => {
			const nodes: TreeNode[] = [
				{
					children: [{ depth: 1, id: 'node-2', label: 'Section' }],
					depth: 0,
					id: 'node-1',
					label: 'Page',
				},
			];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-2"] > .tree-node-label'
			) as HTMLElement;
			// White background for depth 1
			expect(nodeLabel.style.backgroundColor).toBe('rgb(255, 255, 255)'); // #ffffff
		});

		it('should apply gray background color for depth 2+ (component level)', () => {
			const nodes: TreeNode[] = [
				{
					children: [
						{
							children: [{ depth: 2, id: 'node-3', label: 'Component' }],
							depth: 1,
							id: 'node-2',
							label: 'Section',
						},
					],
					depth: 0,
					id: 'node-1',
					label: 'Page',
				},
			];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-3"] > .tree-node-label'
			) as HTMLElement;
			// Gray background for depth 2
			expect(nodeLabel.style.backgroundColor).toBe('rgb(243, 244, 246)'); // #f3f4f6
		});

		it('should apply progressive gray shades for deeper levels', () => {
			const nodes = createDeepTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			// Depth 3 should have lighter gray
			const depth3Label = container.querySelector(
				'[data-node-id="node-4"] > .tree-node-label'
			) as HTMLElement;
			expect(depth3Label.style.backgroundColor).toBe('rgb(249, 250, 251)'); // #f9fafb

			// Depth 4 should have lightest gray
			const depth4Label = container.querySelector(
				'[data-node-id="node-5"] > .tree-node-label'
			) as HTMLElement;
			expect(depth4Label.style.backgroundColor).toBe('rgb(250, 250, 250)'); // #fafafa
		});

		it('should apply larger font size for depth 0', () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-1"] > .tree-node-label'
			) as HTMLElement;
			expect(nodeLabel.style.fontSize).toBe('15px');
		});

		it('should apply progressively smaller font sizes for deeper levels', () => {
			const nodes = createDeepTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			// Check font sizes decrease with depth
			const depth0Label = container.querySelector(
				'[data-node-id="node-1"] > .tree-node-label'
			) as HTMLElement;
			const depth1Label = container.querySelector(
				'[data-node-id="node-2"] > .tree-node-label'
			) as HTMLElement;
			const depth2Label = container.querySelector(
				'[data-node-id="node-3"] > .tree-node-label'
			) as HTMLElement;

			// Font sizes should decrease
			const depth0Size = parseFloat(depth0Label.style.fontSize);
			const depth1Size = parseFloat(depth1Label.style.fontSize);
			const depth2Size = parseFloat(depth2Label.style.fontSize);

			expect(depth0Size).toBeGreaterThan(depth1Size);
			expect(depth1Size).toBeGreaterThan(depth2Size);
		});

		it('should apply heavier font weight for depth 0', () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-1"] > .tree-node-label'
			) as HTMLElement;
			expect(nodeLabel.style.fontWeight).toBe('600');
		});

		it('should apply medium font weight for depth 1', () => {
			const nodes: TreeNode[] = [
				{
					children: [{ depth: 1, id: 'node-2', label: 'Section' }],
					depth: 0,
					id: 'node-1',
					label: 'Page',
				},
			];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-2"] > .tree-node-label'
			) as HTMLElement;
			expect(nodeLabel.style.fontWeight).toBe('500');
		});

		it('should apply normal font weight for depth 2+', () => {
			const nodes: TreeNode[] = [
				{
					children: [
						{
							children: [{ depth: 2, id: 'node-3', label: 'Component' }],
							depth: 1,
							id: 'node-2',
							label: 'Section',
						},
					],
					depth: 0,
					id: 'node-1',
					label: 'Page',
				},
			];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-3"] > .tree-node-label'
			) as HTMLElement;
			expect(nodeLabel.style.fontWeight).toBe('400');
		});

		it('should apply blue border color for depth 0', () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-1"] > .tree-node-label'
			) as HTMLElement;
			// Blue border for depth 0
			expect(nodeLabel.style.borderColor).toBe('rgb(59, 130, 246)'); // #3b82f6
		});

		it('should apply gray border color for depth 1+', () => {
			const nodes: TreeNode[] = [
				{
					children: [{ depth: 1, id: 'node-2', label: 'Section' }],
					depth: 0,
					id: 'node-1',
					label: 'Page',
				},
			];
			const { container } = render(<BasicTree nodes={nodes} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-2"] > .tree-node-label'
			) as HTMLElement;
			// Light gray border for depth 1
			expect(nodeLabel.style.borderColor).toBe('rgb(229, 231, 235)'); // #e5e7eb
		});

		it('should not apply depth styles when showDepthIndicators is false', () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(<BasicTree nodes={nodes} showDepthIndicators={false} />);

			const nodeLabel = container.querySelector(
				'[data-node-id="node-1"] > .tree-node-label'
			) as HTMLElement;
			// When indicators are disabled, no background color is set
			expect(nodeLabel.style.backgroundColor).toBe('');
		});
	});

	describe('edge cases', () => {
		it('should handle nodes with special characters in labels', () => {
			const nodes: TreeNode[] = [
				{
					children: [
						{ depth: 1, id: 'node-2', label: 'Category: Electronics' },
						{ depth: 1, id: 'node-3', label: 'Item (Special)' },
					],
					depth: 0,
					id: 'node-1',
					label: 'Products & Services',
				},
			];
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByText('Products & Services')).toBeInTheDocument();
			expect(screen.getByText('Category: Electronics')).toBeInTheDocument();
			expect(screen.getByText('Item (Special)')).toBeInTheDocument();
		});

		it('should handle nodes with empty string labels', () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: '' }];
			const { container } = render(<BasicTree nodes={nodes} />);

			expect(container.querySelector('[data-node-id="node-1"]')).toBeInTheDocument();
		});

		it('should handle nodes with long labels', () => {
			const longLabel =
				'This is a very long label that might overflow the container in some scenarios';
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: longLabel }];
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByText(longLabel)).toBeInTheDocument();
		});

		it('should handle deeply nested structures (5+ levels)', () => {
			const nodes = createDeepTree();
			const { container } = render(<BasicTree nodes={nodes} />);

			// All 5 levels should be rendered
			const nodeElements = container.querySelectorAll('[data-node-id]');
			expect(nodeElements).toHaveLength(5);
		});

		it('should handle nodes with metadata', () => {
			const nodes: TreeNode[] = [
				{
					depth: 0,
					id: 'node-1',
					label: 'With Metadata',
					metadata: {
						category: 'Page',
						expanded: true,
						lineNumber: 5,
					},
				},
			];
			render(<BasicTree nodes={nodes} />);

			expect(screen.getByText('With Metadata')).toBeInTheDocument();
		});
	});

	describe('selection support', () => {
		it('should apply selection styles when selectedIds contains node id', () => {
			const nodes = createSimpleTree();
			const selectedIds = new Set(['node-2']);
			const { container } = render(<BasicTree nodes={nodes} selectedIds={selectedIds} />);

			const selectedLabel = container.querySelector(
				'[data-node-id="node-2"] > .tree-node-label'
			) as HTMLElement;
			expect(selectedLabel.style.outline).toBe('2px solid #3b82f6');
		});

		it('should add data-selected attribute to selected nodes', () => {
			const nodes = createSimpleTree();
			const selectedIds = new Set(['node-2']);
			const { container } = render(<BasicTree nodes={nodes} selectedIds={selectedIds} />);

			const selectedNode = container.querySelector('[data-selected="true"]');
			expect(selectedNode).toBeInTheDocument();
			expect(selectedNode?.getAttribute('data-node-id')).toBe('node-2');
		});

		it('should add selected class to selected node labels', () => {
			const nodes = createSimpleTree();
			const selectedIds = new Set(['node-1', 'node-2']);
			const { container } = render(<BasicTree nodes={nodes} selectedIds={selectedIds} />);

			const selectedLabels = container.querySelectorAll('.tree-node-label--selected');
			expect(selectedLabels.length).toBe(2);
		});

		it('should set aria-selected on selected nodes', () => {
			const nodes = createSimpleTree();
			const selectedIds = new Set(['node-2']);
			const { container } = render(
				<BasicTree nodes={nodes} selectedIds={selectedIds} onNodeClick={() => {}} />
			);

			const selectedLabel = container.querySelector('[aria-selected="true"]');
			expect(selectedLabel).toBeInTheDocument();
		});

		it('should set aria-multiselectable when selectedIds is provided', () => {
			const nodes = createSimpleTree();
			const selectedIds = new Set<string>();
			render(<BasicTree nodes={nodes} selectedIds={selectedIds} />);

			expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
		});

		it('should call onNodeClickWithEvent with node and mouse event', () => {
			const nodes = createSimpleTree();
			const handleClickWithEvent = jest.fn();
			render(<BasicTree nodes={nodes} onNodeClickWithEvent={handleClickWithEvent} />);

			fireEvent.click(screen.getByText('Child 1'), { ctrlKey: true });

			expect(handleClickWithEvent).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'node-2', label: 'Child 1' }),
				expect.objectContaining({ ctrlKey: true })
			);
		});

		it('should prefer onNodeClickWithEvent over onNodeClick when both are provided', () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			const handleClickWithEvent = jest.fn();
			render(
				<BasicTree
					nodes={nodes}
					onNodeClick={handleClick}
					onNodeClickWithEvent={handleClickWithEvent}
				/>
			);

			fireEvent.click(screen.getByText('Child 1'));

			expect(handleClickWithEvent).toHaveBeenCalled();
			expect(handleClick).not.toHaveBeenCalled();
		});

		it('should support keyboard multi-select with Ctrl modifier', () => {
			const nodes = createSimpleTree();
			const handleClickWithEvent = jest.fn();
			const { container } = render(
				<BasicTree nodes={nodes} onNodeClickWithEvent={handleClickWithEvent} />
			);

			const nodeLabel = container.querySelector('[data-node-id="node-2"] > .tree-node-label');
			fireEvent.keyDown(nodeLabel!, { ctrlKey: true, key: 'Enter' });

			expect(handleClickWithEvent).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'node-2' }),
				expect.objectContaining({ ctrlKey: true })
			);
		});
	});
});
