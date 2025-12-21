/**
 * Tree Operations Utility Tests
 *
 * Covers moveNode logic used by drag-and-drop reordering.
 */
import { type TreeNode } from '../types/TreeNode';
import { moveNode } from '../utils/treeOperations';

function createTree(): TreeNode[] {
	return [
		{
			children: [
				{ depth: 1, id: 'child-1', label: 'Child 1' },
				{
					children: [{ depth: 2, id: 'grandchild-1', label: 'Grandchild 1' }],
					depth: 1,
					id: 'child-2',
					label: 'Child 2',
				},
			],
			depth: 0,
			id: 'root',
			label: 'Root',
		},
		{
			depth: 0,
			id: 'root-2',
			label: 'Root 2',
		},
	];
}

describe('moveNode', () => {
	it('should move a node before another node at same level', () => {
		const nodes = createTree();
		const result = moveNode(nodes, {
			draggedId: 'child-2',
			position: 'before',
			targetId: 'child-1',
		});

		const rootChildren = result[0].children ?? [];
		expect(rootChildren.map((n) => n.id)).toEqual(['child-2', 'child-1']);
		expect(rootChildren[0].depth).toBe(1);
		expect(rootChildren[1].depth).toBe(1);
	});

	it('should append inside when dropping inside a node', () => {
		const nodes = createTree();
		const result = moveNode(nodes, {
			draggedId: 'child-1',
			position: 'inside',
			targetId: 'child-2',
		});

		const child2 = (result[0].children ?? []).find((n) => n.id === 'child-2');
		expect(child2?.children?.map((n) => n.id)).toContain('child-1');
		expect(child2?.children?.[0].depth).toBe(2);
	});

	it('should remove node if draggedId equals targetId or invalid', () => {
		const nodes = createTree();
		const result = moveNode(nodes, {
			draggedId: 'child-1',
			position: 'after',
			targetId: 'child-1',
		});

		expect(result).toEqual(nodes);
	});

	it('should normalize depths for moved subtree', () => {
		const nodes = createTree();
		const result = moveNode(nodes, {
			draggedId: 'child-2',
			position: 'after',
			targetId: 'root-2',
		});

		const movedChild = result.find((node) => node.id === 'child-2');
		expect(movedChild?.depth).toBe(0);
		expect(movedChild?.children?.[0].depth).toBe(1);
	});
});
