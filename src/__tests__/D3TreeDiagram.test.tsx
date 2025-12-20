/**
 * D3TreeDiagram Component Unit Tests
 *
 * Comprehensive tests for the D3TreeDiagram React component that renders
 * tree diagrams using D3.js with connecting lines and animations.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { D3TreeDiagram } from '../components/D3TreeDiagram';
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

/**
 * Creates a tree with metadata for styling tests.
 */
function createTreeWithMetadata(): TreeNode[] {
	return [
		{
			children: [
				{
					depth: 1,
					id: 'node-2',
					label: 'Child',
				},
			],
			depth: 0,
			id: 'node-1',
			label: 'Styled Node',
			metadata: {
				category: 'Page',
				style: {
					backgroundColor: '#FF5722',
					borderColor: '#E64A19',
					textColor: '#FFFFFF',
				},
			},
		},
	];
}

// ============================================================================
// Tests
// ============================================================================

describe('D3TreeDiagram', () => {
	describe('rendering', () => {
		it('should render an SVG element', () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});

		it('should render a simple tree structure', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			// Wait for D3 rendering
			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(3);
			});
		});

		it('should render an empty state when nodes array is empty', () => {
			render(<D3TreeDiagram nodes={[]} />);

			expect(screen.getByText('No nodes to display')).toBeInTheDocument();
		});

		it('should render multiple root nodes', async () => {
			const nodes = createMultiRootTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(4);
			});
		});

		it('should render deeply nested nodes', async () => {
			const nodes = createDeepTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(5);
			});
		});

		it('should render connecting lines between nodes', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const links = container.querySelectorAll('.d3-tree-link');
				expect(links.length).toBe(2); // 2 children = 2 links
			});
		});
	});

	describe('dimensions and sizing', () => {
		it('should use default width and height', () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', '800');
			expect(svg).toHaveAttribute('height', '600');
		});

		it('should apply custom width and height', () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} width={1200} height={900} />
			);

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', '1200');
			expect(svg).toHaveAttribute('height', '900');
		});

		it('should apply custom className to container', () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} className="my-custom-class" />
			);

			expect(container.querySelector('.d3-tree-diagram')).toHaveClass('my-custom-class');
		});
	});

	describe('data attributes', () => {
		it('should set data-node-id attribute on each node', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeElements = container.querySelectorAll('[data-node-id]');
				expect(nodeElements.length).toBe(3);

				const nodeIds = Array.from(nodeElements).map((el) =>
					el.getAttribute('data-node-id')
				);
				expect(nodeIds).toContain('node-1');
				expect(nodeIds).toContain('node-2');
				expect(nodeIds).toContain('node-3');
			});
		});

		it('should set data-depth attribute on each node', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeElements = container.querySelectorAll('[data-depth]');
				expect(nodeElements.length).toBe(3);

				const depths = Array.from(nodeElements).map((el) => el.getAttribute('data-depth'));
				expect(depths).toContain('0');
				expect(depths).toContain('1');
			});
		});
	});

	describe('layout options', () => {
		it('should render with tree layout by default', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBeGreaterThan(0);
			});
		});

		it('should render with radial layout', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} layout="radial" />
			);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(3);
			});
		});

		it('should render with cluster layout', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} layout="cluster" />
			);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(3);
			});
		});
	});

	describe('link styles', () => {
		it('should render diagonal links by default', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const links = container.querySelectorAll('.d3-tree-link');
				expect(links.length).toBe(2);
				// Diagonal links use cubic bezier curves (C command in path)
				const pathD = links[0].getAttribute('d') || '';
				expect(pathD).toContain('C');
			});
		});

		it('should render straight links', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} linkStyle="straight" />
			);

			await waitFor(() => {
				const links = container.querySelectorAll('.d3-tree-link');
				expect(links.length).toBe(2);
				// Straight links use L command in path
				const pathD = links[0].getAttribute('d') || '';
				expect(pathD).toContain('L');
			});
		});

		it('should render elbow links', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} linkStyle="elbow" />
			);

			await waitFor(() => {
				const links = container.querySelectorAll('.d3-tree-link');
				expect(links.length).toBe(2);
				// Elbow links use H and V commands
				const pathD = links[0].getAttribute('d') || '';
				expect(pathD).toContain('H');
				expect(pathD).toContain('V');
			});
		});
	});

	describe('styling', () => {
		it('should apply custom link color', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} linkColor="#FF0000" />
			);

			await waitFor(() => {
				const links = container.querySelectorAll('.d3-tree-link');
				expect(links[0]).toHaveAttribute('stroke', '#FF0000');
			});
		});

		it('should apply custom node size', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} nodeSize={15} />
			);

			await waitFor(() => {
				const circles = container.querySelectorAll('.d3-tree-node circle');
				expect(circles.length).toBeGreaterThan(0);
				expect(circles[0]).toHaveAttribute('r', '15');
			});
		});

		it('should apply custom text color', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} textColor="#00FF00" />
			);

			await waitFor(() => {
				const texts = container.querySelectorAll('.d3-tree-node text');
				expect(texts.length).toBeGreaterThan(0);
				expect(texts[0]).toHaveAttribute('fill', '#00FF00');
			});
		});

		it('should apply node metadata styling', async () => {
			const nodes = createTreeWithMetadata();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const styledNode = container.querySelector('[data-node-id="node-1"] circle');
				expect(styledNode).toHaveAttribute('fill', '#FF5722');
			});
		});
	});

	describe('interactivity', () => {
		it('should call onNodeClick when a node is clicked', async () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} onNodeClick={handleClick} />
			);

			await waitFor(() => {
				const nodeGroup = container.querySelector('[data-node-id="node-2"]');
				expect(nodeGroup).toBeInTheDocument();
			});

			const nodeGroup = container.querySelector('[data-node-id="node-2"]');
			fireEvent.click(nodeGroup!);

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'node-2', label: 'Child 1' })
			);
		});

		it('should call onNodeHover when hovering over a node', async () => {
			const nodes = createSimpleTree();
			const handleHover = jest.fn();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} onNodeHover={handleHover} />
			);

			await waitFor(() => {
				const nodeGroup = container.querySelector('[data-node-id="node-1"]');
				expect(nodeGroup).toBeInTheDocument();
			});

			const nodeGroup = container.querySelector('[data-node-id="node-1"]');
			fireEvent.mouseEnter(nodeGroup!);

			expect(handleHover).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'node-1', label: 'Root' })
			);

			fireEvent.mouseLeave(nodeGroup!);
			expect(handleHover).toHaveBeenCalledWith(null);
		});

		it('should have pointer cursor when onNodeClick is provided', async () => {
			const nodes = createSimpleTree();
			const handleClick = jest.fn();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} onNodeClick={handleClick} />
			);

			await waitFor(() => {
				const nodeGroup = container.querySelector('.d3-tree-node');
				expect(nodeGroup).toHaveStyle({ cursor: 'pointer' });
			});
		});

		it('should have default cursor when onNodeClick is not provided', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroup = container.querySelector('.d3-tree-node');
				expect(nodeGroup).toHaveStyle({ cursor: 'default' });
			});
		});
	});

	describe('custom label rendering', () => {
		it('should support custom renderLabel function', async () => {
			const nodes = createSimpleTree();
			const customRender = (node: TreeNode) => `Custom: ${node.label}`;
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} renderLabel={customRender} />
			);

			await waitFor(() => {
				const texts = container.querySelectorAll('.d3-tree-node text');
				const labels = Array.from(texts).map((t) => t.textContent);
				expect(labels).toContain('Custom: Root');
				expect(labels).toContain('Custom: Child 1');
			});
		});

		it('should use default label rendering when renderLabel is not provided', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const texts = container.querySelectorAll('.d3-tree-node text');
				const labels = Array.from(texts).map((t) => t.textContent);
				expect(labels).toContain('Root');
				expect(labels).toContain('Child 1');
			});
		});
	});

	describe('accessibility', () => {
		it('should have role="img" on container', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('role', 'img');
		});

		it('should have aria-label on SVG', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('aria-label', 'Tree diagram visualization');
		});

		it('should have title and desc elements for SVG', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			expect(container.querySelector('svg title')).toHaveTextContent('Tree Diagram');
			expect(container.querySelector('svg desc')).toBeInTheDocument();
		});

		it('should have aria-label for empty tree', () => {
			render(<D3TreeDiagram nodes={[]} />);

			expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Empty tree diagram');
		});
	});

	describe('zoom functionality', () => {
		it('should enable zoom by default', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				// SVG should have a transform applied to the main group
				const g = container.querySelector('.d3-tree-container');
				expect(g).toBeInTheDocument();
			});
		});

		it('should disable zoom when enableZoom is false', async () => {
			const nodes = createSimpleTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const g = container.querySelector('.d3-tree-container');
				expect(g).toBeInTheDocument();
			});
		});
	});

	describe('integration with parser', () => {
		it('should render tree from parseAndBuildTree output', async () => {
			const input = `Website
├── Home
├── About
│   ├── Team
│   └── History
└── Contact`;

			const { tree } = parseAndBuildTree(input);
			const { container } = render(<D3TreeDiagram nodes={tree} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(6);
			});
		});

		it('should handle complex sitemap structures', async () => {
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
			const { container } = render(<D3TreeDiagram nodes={tree} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(9);
			});
		});
	});

	describe('depth-based styling', () => {
		it('should apply blue color for depth 0 (page level)', async () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const circle = container.querySelector('[data-node-id="node-1"] circle');
				expect(circle).toHaveAttribute('fill', '#3b82f6');
			});
		});

		it('should apply gray color for depth 1 (section level)', async () => {
			const nodes: TreeNode[] = [
				{
					children: [{ depth: 1, id: 'node-2', label: 'Section' }],
					depth: 0,
					id: 'node-1',
					label: 'Page',
				},
			];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const circle = container.querySelector('[data-node-id="node-2"] circle');
				expect(circle).toHaveAttribute('fill', '#9ca3af');
			});
		});

		it('should apply darker gray for depth 2 (component level)', async () => {
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
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const circle = container.querySelector('[data-node-id="node-3"] circle');
				expect(circle).toHaveAttribute('fill', '#6b7280');
			});
		});

		it('should apply progressively lighter gray for deeper levels', async () => {
			const nodes = createDeepTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				// Depth 3 should have light gray
				const depth3Circle = container.querySelector('[data-node-id="node-4"] circle');
				expect(depth3Circle).toHaveAttribute('fill', '#9ca3af');

				// Depth 4 should have lightest gray
				const depth4Circle = container.querySelector('[data-node-id="node-5"] circle');
				expect(depth4Circle).toHaveAttribute('fill', '#d1d5db');
			});
		});

		it('should apply larger node size for depth 0', async () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} nodeSize={10} />
			);

			await waitFor(() => {
				const circle = container.querySelector('[data-node-id="node-1"] circle');
				// Depth 0 should have full size (10)
				expect(circle).toHaveAttribute('r', '10');
			});
		});

		it('should apply progressively smaller node sizes for deeper levels', async () => {
			const nodes = createDeepTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} nodeSize={10} />
			);

			await waitFor(() => {
				const depth0Circle = container.querySelector('[data-node-id="node-1"] circle');
				const depth1Circle = container.querySelector('[data-node-id="node-2"] circle');
				const depth2Circle = container.querySelector('[data-node-id="node-3"] circle');

				const depth0R = parseFloat(depth0Circle?.getAttribute('r') || '0');
				const depth1R = parseFloat(depth1Circle?.getAttribute('r') || '0');
				const depth2R = parseFloat(depth2Circle?.getAttribute('r') || '0');

				// Sizes should decrease with depth
				expect(depth0R).toBeGreaterThan(depth1R);
				expect(depth1R).toBeGreaterThan(depth2R);
			});
		});

		it('should apply thicker stroke width for depth 0', async () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Page' }];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const circle = container.querySelector('[data-node-id="node-1"] circle');
				expect(circle).toHaveAttribute('stroke-width', '2.5');
			});
		});

		it('should apply progressively thinner stroke widths for deeper levels', async () => {
			const nodes = createDeepTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const depth0Circle = container.querySelector('[data-node-id="node-1"] circle');
				const depth1Circle = container.querySelector('[data-node-id="node-2"] circle');
				const depth2Circle = container.querySelector('[data-node-id="node-3"] circle');

				expect(depth0Circle).toHaveAttribute('stroke-width', '2.5');
				expect(depth1Circle).toHaveAttribute('stroke-width', '2');
				expect(depth2Circle).toHaveAttribute('stroke-width', '1.5');
			});
		});

		it('should apply depth-based font sizes to text labels', async () => {
			const nodes = createDeepTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const depth0Text = container.querySelector('[data-node-id="node-1"] text');
				const depth1Text = container.querySelector('[data-node-id="node-2"] text');
				const depth2Text = container.querySelector('[data-node-id="node-3"] text');

				const depth0Size = parseFloat(depth0Text?.getAttribute('font-size') || '0');
				const depth1Size = parseFloat(depth1Text?.getAttribute('font-size') || '0');
				const depth2Size = parseFloat(depth2Text?.getAttribute('font-size') || '0');

				// Font sizes should decrease with depth
				expect(depth0Size).toBeGreaterThan(depth1Size);
				expect(depth1Size).toBeGreaterThan(depth2Size);
			});
		});

		it('should apply depth-based font weights to text labels', async () => {
			const nodes = createDeepTree();
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const depth0Text = container.querySelector('[data-node-id="node-1"] text');
				const depth1Text = container.querySelector('[data-node-id="node-2"] text');
				const depth2Text = container.querySelector('[data-node-id="node-3"] text');

				expect(depth0Text).toHaveAttribute('font-weight', '600');
				expect(depth1Text).toHaveAttribute('font-weight', '500');
				expect(depth2Text).toHaveAttribute('font-weight', '400');
			});
		});

		it('should still respect metadata style overrides', async () => {
			const nodes: TreeNode[] = [
				{
					depth: 0,
					id: 'node-1',
					label: 'Custom Styled',
					metadata: {
						style: {
							backgroundColor: '#FF0000',
						},
					},
				},
			];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const circle = container.querySelector('[data-node-id="node-1"] circle');
				// Should use metadata color instead of depth-based color
				expect(circle).toHaveAttribute('fill', '#FF0000');
			});
		});
	});

	describe('edge cases', () => {
		it('should handle nodes with special characters in labels', async () => {
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
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const texts = container.querySelectorAll('.d3-tree-node text');
				const labels = Array.from(texts).map((t) => t.textContent);
				expect(labels).toContain('Products & Services');
				expect(labels).toContain('Category: Electronics');
				expect(labels).toContain('Item (Special)');
			});
		});

		it('should handle nodes with empty string labels', async () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: '' }];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(1);
			});
		});

		it('should handle nodes with long labels', async () => {
			const longLabel = 'This is a very long label that might overflow';
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: longLabel }];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const texts = container.querySelectorAll('.d3-tree-node text');
				expect(texts[0]).toHaveTextContent(longLabel);
			});
		});

		it('should handle single node tree', async () => {
			const nodes: TreeNode[] = [{ depth: 0, id: 'node-1', label: 'Single Node' }];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(1);
				// No links for single node
				const links = container.querySelectorAll('.d3-tree-link');
				expect(links.length).toBe(0);
			});
		});

		it('should handle wide tree with many siblings', async () => {
			const nodes: TreeNode[] = [
				{
					children: Array.from({ length: 10 }, (_, i) => ({
						depth: 1,
						id: `child-${i}`,
						label: `Child ${i}`,
					})),
					depth: 0,
					id: 'root',
					label: 'Root',
				},
			];
			const { container } = render(<D3TreeDiagram nodes={nodes} enableZoom={false} />);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(11); // 1 root + 10 children
			});
		});
	});

	describe('animation settings', () => {
		it('should accept custom animation duration', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} animationDuration={1000} />
			);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(3);
			});
		});

		it('should handle zero animation duration', async () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} animationDuration={0} />
			);

			await waitFor(() => {
				const nodeGroups = container.querySelectorAll('.d3-tree-node');
				expect(nodeGroups.length).toBe(3);
			});
		});
	});

	describe('margin customization', () => {
		it('should apply custom margins', async () => {
			const nodes = createSimpleTree();
			const customMargin = { bottom: 20, left: 40, right: 40, top: 20 };
			const { container } = render(
				<D3TreeDiagram nodes={nodes} enableZoom={false} margin={customMargin} />
			);

			await waitFor(() => {
				const g = container.querySelector('.d3-tree-container');
				expect(g).toBeInTheDocument();
			});
		});
	});
});
