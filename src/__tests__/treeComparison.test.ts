/**
 * Tests for tree comparison utilities
 */
import type { TreeNode } from '../types/TreeNode';
import {
	areTreesIdentical,
	compareTrees,
	describeDifference,
	flattenDifferences,
	getChangedNodes,
	hashNode,
	hashTree,
} from '../utils/treeComparison';

describe('treeComparison', () => {
	// Helper to create test nodes
	const createNode = (
		id: string,
		label: string,
		depth: number,
		children?: TreeNode[]
	): TreeNode => ({
		children,
		depth,
		id,
		label,
	});

	describe('compareTrees', () => {
		it('should detect identical trees', () => {
			const tree1: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About', 1),
					createNode('3', 'Contact', 1),
				]),
			];

			const tree2: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About', 1),
					createNode('3', 'Contact', 1),
				]),
			];

			const result = compareTrees(tree1, tree2);

			expect(result.summary.addedCount).toBe(0);
			expect(result.summary.removedCount).toBe(0);
			expect(result.summary.modifiedCount).toBe(0);
			expect(result.summary.unchangedCount).toBe(3);
			expect(result.summary.similarityPercentage).toBe(100);
		});

		it('should detect added nodes', () => {
			const tree1: TreeNode[] = [createNode('1', 'Home', 0)];

			const tree2: TreeNode[] = [createNode('1', 'Home', 0, [createNode('2', 'About', 1)])];

			const result = compareTrees(tree1, tree2);

			expect(result.summary.addedCount).toBe(1);
			expect(result.addedNodeIds.has('2')).toBe(true);
		});

		it('should detect removed nodes', () => {
			const tree1: TreeNode[] = [createNode('1', 'Home', 0, [createNode('2', 'About', 1)])];

			const tree2: TreeNode[] = [createNode('1', 'Home', 0)];

			const result = compareTrees(tree1, tree2);

			expect(result.summary.removedCount).toBe(1);
			expect(result.removedNodeIds.has('2')).toBe(true);
		});

		it('should detect modified nodes (label change)', () => {
			const tree1: TreeNode[] = [createNode('1', 'Home', 0)];
			const tree2: TreeNode[] = [createNode('1', 'Homepage', 0)];

			const result = compareTrees(tree1, tree2);

			expect(result.summary.modifiedCount).toBe(1);
			expect(result.modifiedNodeIds.has('1')).toBe(true);

			const diff = result.differences[0];
			expect(diff.type).toBe('modified');
			expect(diff.changes).toHaveLength(1);
			expect(diff.changes![0].property).toBe('label');
			expect(diff.changes![0].oldValue).toBe('Home');
			expect(diff.changes![0].newValue).toBe('Homepage');
		});

		it('should handle complex tree changes', () => {
			const tree1: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About', 1),
					createNode('3', 'Products', 1, [
						createNode('4', 'Product A', 2),
						createNode('5', 'Product B', 2),
					]),
				]),
			];

			const tree2: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About Us', 1), // Modified
					createNode('3', 'Products', 1, [
						createNode('4', 'Product A', 2),
						// Product B removed
						createNode('6', 'Product C', 2), // Added
					]),
				]),
			];

			const result = compareTrees(tree1, tree2);

			expect(result.summary.addedCount).toBe(1);
			expect(result.summary.removedCount).toBe(1);
			expect(result.summary.modifiedCount).toBe(1);
			expect(result.addedNodeIds.has('6')).toBe(true);
			expect(result.removedNodeIds.has('5')).toBe(true);
			expect(result.modifiedNodeIds.has('2')).toBe(true);
		});

		it('should handle empty trees', () => {
			const result = compareTrees([], []);

			expect(result.summary.addedCount).toBe(0);
			expect(result.summary.removedCount).toBe(0);
			expect(result.summary.similarityPercentage).toBe(100);
		});

		it('should handle comparison of empty vs non-empty tree', () => {
			const tree: TreeNode[] = [createNode('1', 'Home', 0)];

			const result1 = compareTrees([], tree);
			expect(result1.summary.addedCount).toBe(1);

			const result2 = compareTrees(tree, []);
			expect(result2.summary.removedCount).toBe(1);
		});
	});

	describe('flattenDifferences', () => {
		it('should flatten nested differences', () => {
			const tree1: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About', 1, [createNode('3', 'Team', 2)]),
				]),
			];

			const tree2: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About', 1, [createNode('3', 'Team', 2)]),
				]),
			];

			const result = compareTrees(tree1, tree2);
			const flat = flattenDifferences(result);

			expect(flat).toHaveLength(3);
			expect(flat.map((d) => d.id)).toEqual(['1', '2', '3']);
		});
	});

	describe('getChangedNodes', () => {
		it('should return only changed nodes', () => {
			const tree1: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About', 1),
					createNode('3', 'Contact', 1),
				]),
			];

			const tree2: TreeNode[] = [
				createNode('1', 'Home', 0, [
					createNode('2', 'About Us', 1), // Modified
					// Contact removed
					createNode('4', 'Products', 1), // Added
				]),
			];

			const result = compareTrees(tree1, tree2);
			const changed = getChangedNodes(result);

			expect(changed).toHaveLength(3);
			expect(changed.some((d) => d.id === '2' && d.type === 'modified')).toBe(true);
			expect(changed.some((d) => d.id === '3' && d.type === 'removed')).toBe(true);
			expect(changed.some((d) => d.id === '4' && d.type === 'added')).toBe(true);
		});
	});

	describe('describeDifference', () => {
		it('should describe added nodes', () => {
			const tree1: TreeNode[] = [];
			const tree2: TreeNode[] = [createNode('1', 'Home', 0)];

			const result = compareTrees(tree1, tree2);
			const description = describeDifference(result.differences[0]);

			expect(description).toBe('Added: "Home"');
		});

		it('should describe removed nodes', () => {
			const tree1: TreeNode[] = [createNode('1', 'Home', 0)];
			const tree2: TreeNode[] = [];

			const result = compareTrees(tree1, tree2);
			const description = describeDifference(result.differences[0]);

			expect(description).toBe('Removed: "Home"');
		});

		it('should describe modified nodes with rename', () => {
			const tree1: TreeNode[] = [createNode('1', 'Home', 0)];
			const tree2: TreeNode[] = [createNode('1', 'Homepage', 0)];

			const result = compareTrees(tree1, tree2);
			const description = describeDifference(result.differences[0]);

			expect(description).toContain('Modified: "Home"');
			expect(description).toContain('renamed from "Home" to "Homepage"');
		});
	});

	describe('areTreesIdentical', () => {
		it('should return true for identical trees', () => {
			const tree: TreeNode[] = [createNode('1', 'Home', 0)];
			expect(areTreesIdentical(tree, tree)).toBe(true);
		});

		it('should return false for different trees', () => {
			const tree1: TreeNode[] = [createNode('1', 'Home', 0)];
			const tree2: TreeNode[] = [createNode('1', 'Homepage', 0)];
			expect(areTreesIdentical(tree1, tree2)).toBe(false);
		});
	});

	describe('hashNode', () => {
		it('should create a hash for a node', () => {
			const node = createNode('1', 'Home', 0);
			const hash = hashNode(node);

			expect(hash).toBe('1|Home|0');
		});

		it('should include children in hash by default', () => {
			const node = createNode('1', 'Home', 0, [createNode('2', 'About', 1)]);
			const hash = hashNode(node);

			expect(hash).toContain('1|Home|0');
			expect(hash).toContain('2|About|1');
		});

		it('should exclude children when requested', () => {
			const node = createNode('1', 'Home', 0, [createNode('2', 'About', 1)]);
			const hash = hashNode(node, false);

			expect(hash).toBe('1|Home|0');
		});
	});

	describe('hashTree', () => {
		it('should create a hash for the entire tree', () => {
			const tree: TreeNode[] = [createNode('1', 'Home', 0), createNode('2', 'About', 0)];

			const hash = hashTree(tree);

			expect(hash).toContain('1|Home|0');
			expect(hash).toContain('2|About|0');
			expect(hash).toContain('||');
		});
	});

	describe('metadata comparison', () => {
		it('should detect metadata changes when compareMetadata is true', () => {
			const tree1: TreeNode[] = [
				{
					depth: 0,
					id: '1',
					label: 'Home',
					metadata: { category: 'Page' as const },
				},
			];

			const tree2: TreeNode[] = [
				{
					depth: 0,
					id: '1',
					label: 'Home',
					metadata: { category: 'Section' as const },
				},
			];

			const result = compareTrees(tree1, tree2, { compareMetadata: true });

			expect(result.summary.modifiedCount).toBe(1);
			expect(result.differences[0].changes).toContainEqual({
				newValue: 'Section',
				oldValue: 'Page',
				property: 'metadata.category',
			});
		});

		it('should ignore specified properties', () => {
			const tree1: TreeNode[] = [
				{
					depth: 0,
					id: '1',
					label: 'Home',
					metadata: { lineNumber: 1 },
				},
			];

			const tree2: TreeNode[] = [
				{
					depth: 0,
					id: '1',
					label: 'Home',
					metadata: { lineNumber: 2 },
				},
			];

			const result = compareTrees(tree1, tree2, {
				ignoreProperties: ['lineNumber'],
			});

			expect(result.summary.modifiedCount).toBe(0);
		});
	});
});
