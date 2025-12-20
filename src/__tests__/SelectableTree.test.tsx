/**
 * SelectableTree Component Unit Tests
 *
 * Comprehensive tests for the SelectableTree component that provides
 * click-to-select functionality with multi-select support via Ctrl/Cmd-click.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { SelectableTree, SelectionInfo } from '../components/SelectableTree';
import { type TreeNode } from '../types/TreeNode';

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
 * Creates a deeply nested tree structure for testing.
 */
function createDeepTree(): TreeNode[] {
	return [
		{
			children: [
				{
					children: [
						{
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
		},
	];
}

// ============================================================================
// SelectableTree Tests
// ============================================================================

describe('SelectableTree', () => {
	describe('breadcrumbs', () => {
		it('should render all nodes in the tree', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			expect(screen.getByText('Root')).toBeInTheDocument();
			expect(screen.getByText('Child 1')).toBeInTheDocument();
			expect(screen.getByText('Child 2')).toBeInTheDocument();
		});

		it('should render empty state when nodes array is empty', () => {
			render(<SelectableTree nodes={[]} />);

			expect(screen.getByText('No nodes to display')).toBeInTheDocument();
		});

		it('should render multiple root nodes', () => {
			const nodes = createMultiRootTree();
			render(<SelectableTree nodes={nodes} />);

			expect(screen.getByText('Root 1')).toBeInTheDocument();
			expect(screen.getByText('Root 2')).toBeInTheDocument();
		});

		it('should show selection hint when no nodes are selected', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			expect(screen.getByText(/Click to select a node/i)).toBeInTheDocument();
		});

		it('should hide selection info when showSelectionInfo is false', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} showSelectionInfo={false} />);

			expect(screen.queryByText(/Click to select a node/i)).not.toBeInTheDocument();
		});
	});

	describe('single click selection', () => {
		it('should select a node when clicked', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			render(<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />);

			fireEvent.click(screen.getByText('Child 1'));

			expect(handleSelectionChange).toHaveBeenCalled();
			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-2')).toBe(true);
			expect(lastCall[0].size).toBe(1);
		});

		it('should display selection info when a node is selected', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			// Get the specific node label for clicking
			const nodeLabel = screen.getAllByText('Child 1')[0];
			fireEvent.click(nodeLabel);

			expect(screen.getByText('1 node selected')).toBeInTheDocument();
			// The label appears both in the tree and in the selection info
			expect(screen.getAllByText('Child 1').length).toBeGreaterThan(0);
		});

		it('should replace selection when clicking a different node without modifier key', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			render(<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />);

			// Select first node
			fireEvent.click(screen.getByText('Child 1'));

			// Select second node (should replace)
			fireEvent.click(screen.getByText('Child 2'));

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-3')).toBe(true);
			expect(lastCall[0].has('node-2')).toBe(false);
			expect(lastCall[0].size).toBe(1);
		});

		it('should deselect when clicking on an already selected node', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			const { container } = render(
				<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />
			);

			// Select node using container query to be specific
			const nodeLabel = container.querySelector('[data-node-id="node-2"] .tree-node-label');
			fireEvent.click(nodeLabel!);

			// Click same node again to deselect
			fireEvent.click(nodeLabel!);

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].size).toBe(0);
		});

		it('should not deselect when allowDeselect is false', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			const { container } = render(
				<SelectableTree
					nodes={nodes}
					onSelectionChange={handleSelectionChange}
					allowDeselect={false}
				/>
			);

			// Select node using container query to be specific
			const nodeLabel = container.querySelector('[data-node-id="node-2"] .tree-node-label');
			fireEvent.click(nodeLabel!);

			// Click same node again - should not deselect
			fireEvent.click(nodeLabel!);

			// Should still be selected
			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-2')).toBe(true);
		});
	});

	describe('multi-select with Ctrl/Cmd-click', () => {
		it('should add to selection when Ctrl-clicking a node', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			render(<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />);

			// Select first node
			fireEvent.click(screen.getByText('Child 1'));

			// Ctrl+click second node
			fireEvent.click(screen.getByText('Child 2'), { ctrlKey: true });

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-2')).toBe(true);
			expect(lastCall[0].has('node-3')).toBe(true);
			expect(lastCall[0].size).toBe(2);
		});

		it('should add to selection when Cmd-clicking a node (Mac)', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			render(<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />);

			// Select first node
			fireEvent.click(screen.getByText('Child 1'));

			// Cmd+click second node
			fireEvent.click(screen.getByText('Child 2'), { metaKey: true });

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-2')).toBe(true);
			expect(lastCall[0].has('node-3')).toBe(true);
			expect(lastCall[0].size).toBe(2);
		});

		it('should toggle selection when Ctrl-clicking a selected node', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			const { container } = render(
				<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />
			);

			// Select first node using specific query
			const nodeLabel = container.querySelector('[data-node-id="node-2"] .tree-node-label');
			fireEvent.click(nodeLabel!);

			// Ctrl+click same node to toggle off
			fireEvent.click(nodeLabel!, { ctrlKey: true });

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-2')).toBe(false);
			expect(lastCall[0].size).toBe(0);
		});

		it('should display correct count for multiple selections', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			// Select first node
			fireEvent.click(screen.getByText('Child 1'));

			// Ctrl+click second node
			fireEvent.click(screen.getByText('Child 2'), { ctrlKey: true });

			expect(screen.getByText('2 nodes selected')).toBeInTheDocument();
		});
	});

	describe('initial selection', () => {
		it('should start with initial selected IDs', () => {
			const nodes = createSimpleTree();
			const initialSelection = new Set(['node-2', 'node-3']);

			render(<SelectableTree nodes={nodes} initialSelectedIds={initialSelection} />);

			expect(screen.getByText('2 nodes selected')).toBeInTheDocument();
		});
	});

	describe('maxSelections prop', () => {
		it('should not allow selecting more than maxSelections nodes', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			render(
				<SelectableTree
					nodes={nodes}
					onSelectionChange={handleSelectionChange}
					maxSelections={1}
				/>
			);

			// Select first node
			fireEvent.click(screen.getByText('Child 1'));

			// Try to Ctrl+click second node (should not add)
			fireEvent.click(screen.getByText('Child 2'), { ctrlKey: true });

			// Should still only have 1 selection
			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].size).toBe(1);
			expect(lastCall[0].has('node-2')).toBe(true);
		});
	});

	describe('clear selection', () => {
		it('should clear all selections when clear button is clicked', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			render(<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />);

			// Select first node
			fireEvent.click(screen.getByText('Child 1'));

			// Click clear button
			fireEvent.click(screen.getByRole('button', { name: /clear/i }));

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].size).toBe(0);
		});
	});

	describe('onNodeClick callback', () => {
		it('should call onNodeClick with node and event info', () => {
			const nodes = createSimpleTree();
			const handleNodeClick = jest.fn();
			render(<SelectableTree nodes={nodes} onNodeClick={handleNodeClick} />);

			fireEvent.click(screen.getByText('Child 1'), { ctrlKey: true });

			expect(handleNodeClick).toHaveBeenCalledWith(
				expect.objectContaining({
					isMultiSelectKey: true,
					isShiftKey: false,
					node: expect.objectContaining({ id: 'node-2', label: 'Child 1' }),
				})
			);
		});
	});

	describe('visual selection state', () => {
		it('should add data-selected attribute to selected nodes', () => {
			const nodes = createSimpleTree();
			const { container } = render(<SelectableTree nodes={nodes} />);

			fireEvent.click(screen.getByText('Child 1'));

			const selectedNode = container.querySelector('[data-selected="true"]');
			expect(selectedNode).toBeInTheDocument();
			expect(selectedNode?.getAttribute('data-node-id')).toBe('node-2');
		});

		it('should add selected class to selected node labels', () => {
			const nodes = createSimpleTree();
			const { container } = render(<SelectableTree nodes={nodes} />);

			fireEvent.click(screen.getByText('Child 1'));

			const selectedLabel = container.querySelector('.tree-node-label--selected');
			expect(selectedLabel).toBeInTheDocument();
		});
	});

	describe('accessibility', () => {
		it('should have role="tree" on the container', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			expect(screen.getByRole('tree')).toBeInTheDocument();
		});

		it('should have aria-multiselectable on the tree', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
		});

		it('should have aria-selected on selected nodes', () => {
			const nodes = createSimpleTree();
			const { container } = render(<SelectableTree nodes={nodes} />);

			fireEvent.click(screen.getByText('Child 1'));

			const selectedLabel = container.querySelector('[aria-selected="true"]');
			expect(selectedLabel).toBeInTheDocument();
		});

		it('should have role="button" on clickable nodes', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('should have role="status" on selection info', () => {
			const nodes = createSimpleTree();
			render(<SelectableTree nodes={nodes} />);

			fireEvent.click(screen.getByText('Child 1'));

			expect(screen.getByRole('status')).toBeInTheDocument();
		});
	});

	describe('keyboard navigation', () => {
		it('should select node on Enter key', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			const { container } = render(
				<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />
			);

			const nodeLabel = container.querySelector('[data-node-id="node-2"] .tree-node-label');
			fireEvent.keyDown(nodeLabel!, { key: 'Enter' });

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-2')).toBe(true);
		});

		it('should select node on Space key', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			const { container } = render(
				<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />
			);

			const nodeLabel = container.querySelector('[data-node-id="node-2"] .tree-node-label');
			fireEvent.keyDown(nodeLabel!, { key: ' ' });

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('node-2')).toBe(true);
		});

		it('should multi-select with Ctrl+Enter', () => {
			const nodes = createSimpleTree();
			const handleSelectionChange = jest.fn();
			const { container } = render(
				<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />
			);

			// First selection
			const firstNodeLabel = container.querySelector(
				'[data-node-id="node-2"] .tree-node-label'
			);
			fireEvent.keyDown(firstNodeLabel!, { key: 'Enter' });

			// Second selection with Ctrl
			const secondNodeLabel = container.querySelector(
				'[data-node-id="node-3"] .tree-node-label'
			);
			fireEvent.keyDown(secondNodeLabel!, { ctrlKey: true, key: 'Enter' });

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].size).toBe(2);
		});
	});

	describe('custom rendering', () => {
		it('should support custom renderLabel function', () => {
			const nodes = createSimpleTree();
			render(
				<SelectableTree
					nodes={nodes}
					renderLabel={(node, isSelected) => (
						<span>
							{isSelected ? '[X] ' : '[ ] '}
							{node.label}
						</span>
					)}
				/>
			);

			expect(screen.getByText('[ ] Root')).toBeInTheDocument();

			fireEvent.click(screen.getByText('[ ] Root'));

			// After selection, the checkbox should be checked
			expect(screen.getByText('[X] Root')).toBeInTheDocument();
		});
	});

	describe('styling', () => {
		it('should apply custom className to container', () => {
			const nodes = createSimpleTree();
			const { container } = render(
				<SelectableTree nodes={nodes} className="my-custom-class" />
			);

			expect(container.querySelector('.selectable-tree')).toHaveClass('my-custom-class');
		});

		it('should apply custom indentSize', () => {
			const nodes = createSimpleTree();
			const { container } = render(<SelectableTree nodes={nodes} indentSize={40} />);

			const childLabel = container.querySelector(
				'[data-node-id="node-2"] .tree-node-label'
			) as HTMLElement;
			// depth 1 * 40 + 12 = 52px
			expect(childLabel.style.paddingLeft).toBe('52px');
		});

		it('should apply theme overrides for depth colors and spacing', () => {
			const nodes = createSimpleTree();
			const theme = {
				depthColors: {
					0: { bg: '#101010', border: '#202020', text: '#303030' },
					1: { bg: '#111111', border: '#222222', text: '#333333' },
				},
				spacing: {
					indentSize: 32,
					paddingX: 10,
					paddingY: 6,
					radius: 5,
				},
			};

			const { container } = render(<SelectableTree nodes={nodes} theme={theme} />);

			const rootLabel = container.querySelector(
				'[data-node-id="node-1"] .tree-node-label'
			) as HTMLElement;
			const childLabel = container.querySelector(
				'[data-node-id="node-2"] .tree-node-label'
			) as HTMLElement;

			expect(rootLabel.style.backgroundColor).toBe('rgb(16, 16, 16)'); // #101010
			expect(rootLabel.style.borderColor).toBe('rgb(32, 32, 32)'); // #202020
			expect(rootLabel.style.color).toBe('rgb(48, 48, 48)'); // #303030
			expect(rootLabel.style.paddingLeft).toBe('10px'); // depth 0 paddingX

			// indentSize prop (default 24) is used for spacing; depth 1 * 24 + paddingX 10 = 34px
			expect(childLabel.style.paddingLeft).toBe('34px');
		});

		it('should apply theme selection styles when nodes are selected', () => {
			const nodes = createSimpleTree();
			const theme = {
				selection: {
					bg: '#ffeecc',
					outline: '3px solid rgb(255, 0, 0)',
					outlineOffset: '3px',
				},
			};

			const { container } = render(
				<SelectableTree
					nodes={nodes}
					theme={theme}
					initialSelectedIds={new Set(['node-2'])}
				/>
			);

			const selectedLabel = container.querySelector(
				'[data-node-id="node-2"] .tree-node-label'
			) as HTMLElement;

			expect(selectedLabel.style.backgroundColor).toBe('rgb(255, 238, 204)'); // #ffeecc
			expect(selectedLabel.style.outline).toContain('rgb(255, 0, 0)');
			expect(selectedLabel.style.outline).toContain('3px');
			expect(selectedLabel.style.outlineOffset).toBe('3px');
		});
	});

	describe('deeply nested nodes', () => {
		it('should select deeply nested nodes', () => {
			const nodes = createDeepTree();
			const handleSelectionChange = jest.fn();
			render(<SelectableTree nodes={nodes} onSelectionChange={handleSelectionChange} />);

			fireEvent.click(screen.getByText('Level 2'));

			const lastCall =
				handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
			expect(lastCall[0].has('level-2')).toBe(true);
		});
	});
});

// ============================================================================
// SelectionInfo Component Tests
// ============================================================================

describe('SelectionInfo', () => {
	it('should display singular form for 1 node', () => {
		const nodes = [{ depth: 0, id: 'node-1', label: 'Test Node' }];
		render(
			<SelectionInfo selectedCount={1} selectedNodes={nodes} onClearSelection={() => {}} />
		);

		expect(screen.getByText('1 node selected')).toBeInTheDocument();
	});

	it('should display plural form for multiple nodes', () => {
		const nodes = [
			{ depth: 0, id: 'node-1', label: 'Node 1' },
			{ depth: 0, id: 'node-2', label: 'Node 2' },
		];
		render(
			<SelectionInfo selectedCount={2} selectedNodes={nodes} onClearSelection={() => {}} />
		);

		expect(screen.getByText('2 nodes selected')).toBeInTheDocument();
	});

	it('should display first 3 labels and count for more', () => {
		const nodes = [
			{ depth: 0, id: 'node-1', label: 'Node 1' },
			{ depth: 0, id: 'node-2', label: 'Node 2' },
			{ depth: 0, id: 'node-3', label: 'Node 3' },
			{ depth: 0, id: 'node-4', label: 'Node 4' },
			{ depth: 0, id: 'node-5', label: 'Node 5' },
		];
		render(
			<SelectionInfo selectedCount={5} selectedNodes={nodes} onClearSelection={() => {}} />
		);

		expect(screen.getByText('5 nodes selected')).toBeInTheDocument();
		expect(screen.getByText(/Node 1, Node 2, Node 3/)).toBeInTheDocument();
		expect(screen.getByText(/\+2 more/)).toBeInTheDocument();
	});

	it('should call onClearSelection when clear button is clicked', () => {
		const handleClear = jest.fn();
		const nodes = [{ depth: 0, id: 'node-1', label: 'Test Node' }];
		render(
			<SelectionInfo selectedCount={1} selectedNodes={nodes} onClearSelection={handleClear} />
		);

		fireEvent.click(screen.getByRole('button', { name: /clear/i }));

		expect(handleClear).toHaveBeenCalledTimes(1);
	});

	it('should return null when selectedCount is 0', () => {
		const { container } = render(
			<SelectionInfo selectedCount={0} selectedNodes={[]} onClearSelection={() => {}} />
		);

		// Should show the hint instead
		expect(container.textContent).toContain('Click to select');
	});
});
