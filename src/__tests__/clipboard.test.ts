import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { type TreeNode } from '../types/TreeNode';
import {
	clearClipboard,
	copyNodes,
	getClipboardNodes,
	hasClipboardNodes,
	pasteNodes,
} from '../utils/clipboard';

describe('clipboard', () => {
	beforeEach(() => {
		clearClipboard();
	});

	describe('copyNodes', () => {
		it('should copy a single node', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'test-1',
				label: 'Test Node',
			};
			const copied = copyNodes([node]);

			expect(copied).toHaveLength(1);
			expect(copied[0].label).toBe('Test Node');
			expect(copied[0].id).not.toBe('test-1');
			expect(hasClipboardNodes()).toBe(true);
		});

		it('should copy multiple nodes', () => {
			const nodes: TreeNode[] = [
				{
					depth: 0,
					id: 'test-1',
					label: 'Node 1',
				},
				{
					depth: 0,
					id: 'test-2',
					label: 'Node 2',
				},
			];
			const copied = copyNodes(nodes);

			expect(copied).toHaveLength(2);
			expect(copied[0].label).toBe('Node 1');
			expect(copied[1].label).toBe('Node 2');
		});

		it('should clone nodes with new IDs', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'original-id',
				label: 'Original',
			};
			const copied = copyNodes([node]);

			expect(copied[0].id).not.toBe('original-id');
			expect(copied[0].label).toBe('Original');
		});

		it('should clone nodes with children', () => {
			const node: TreeNode = {
				children: [
					{
						depth: 1,
						id: 'test-2',
						label: 'Child',
					},
				],
				depth: 0,
				id: 'test-1',
				label: 'Parent',
			};
			const copied = copyNodes([node]);

			expect(copied).toHaveLength(1);
			expect(copied[0].children).toHaveLength(1);
			expect(copied[0].children?.[0].label).toBe('Child');
			expect(copied[0].id).not.toBe('test-1');
			expect(copied[0].children?.[0].id).not.toBe('test-2');
		});

		it('should clone metadata', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'test-1',
				label: 'Node',
				metadata: {
					category: 'Page',
					lineNumber: 1,
				},
			};
			const copied = copyNodes([node]);

			expect(copied[0].metadata).toEqual({
				category: 'Page',
				lineNumber: 1,
			});
		});

		it('should return empty array for empty input', () => {
			const copied = copyNodes([]);
			expect(copied).toHaveLength(0);
		});
	});

	describe('getClipboardNodes', () => {
		it('should return null when clipboard is empty', () => {
			const nodes = getClipboardNodes();
			expect(nodes).toBeNull();
		});

		it('should return copied nodes', () => {
			const original: TreeNode[] = [
				{
					depth: 0,
					id: 'test-1',
					label: 'Node 1',
				},
			];
			copyNodes(original);

			const retrieved = getClipboardNodes();
			expect(retrieved).not.toBeNull();
			expect(retrieved).toHaveLength(1);
			expect(retrieved?.[0].label).toBe('Node 1');
		});

		it('should return null for expired clipboard (older than 5 minutes)', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'test-1',
				label: 'Test',
			};
			copyNodes([node]);

			// Mock Date.now to return 6 minutes in the future
			const originalDateNow = Date.now;
			jest.spyOn(Date, 'now').mockImplementation(() => originalDateNow() + 6 * 60 * 1000);

			const nodes = getClipboardNodes();
			expect(nodes).toBeNull();

			(jest.spyOn(Date, 'now') as unknown as { mockRestore: () => void }).mockRestore();
		});

		it('should return same reference across multiple calls', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'test-1',
				label: 'Test',
			};
			copyNodes([node]);

			const first = getClipboardNodes();
			const second = getClipboardNodes();
			expect(first).toBe(second);
		});
	});

	describe('clearClipboard', () => {
		it('should clear clipboard', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'test-1',
				label: 'Test',
			};
			copyNodes([node]);
			expect(hasClipboardNodes()).toBe(true);

			clearClipboard();
			expect(hasClipboardNodes()).toBe(false);
		});

		it('should be safe to call when clipboard is empty', () => {
			expect(() => clearClipboard()).not.toThrow();
		});
	});

	describe('hasClipboardNodes', () => {
		it('should return false when clipboard is empty', () => {
			expect(hasClipboardNodes()).toBe(false);
		});

		it('should return true when clipboard has nodes', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'test-1',
				label: 'Test',
			};
			copyNodes([node]);
			expect(hasClipboardNodes()).toBe(true);
		});

		it('should return false after clearing', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'test-1',
				label: 'Test',
			};
			copyNodes([node]);
			clearClipboard();
			expect(hasClipboardNodes()).toBe(false);
		});
	});

	describe('pasteNodes', () => {
		const testTree: TreeNode[] = [
			{
				children: [
					{
						depth: 1,
						id: 'child-1',
						label: 'Child 1',
					},
				],
				depth: 0,
				id: 'root-1',
				label: 'Root 1',
			},
			{
				depth: 0,
				id: 'root-2',
				label: 'Root 2',
			},
		];

		it('should append to roots when no target specified', () => {
			const nodesToPaste: TreeNode[] = [
				{
					depth: 0,
					id: 'paste-1',
					label: 'Pasted Node',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste);

			expect(result).toHaveLength(3);
			expect(result[2].label).toBe('Pasted Node');
		});

		it('should paste before target node', () => {
			const nodesToPaste: TreeNode[] = [
				{
					depth: 0,
					id: 'paste-1',
					label: 'Pasted',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste, 'root-2', 'before');

			expect(result).toHaveLength(3);
			expect(result[0].label).toBe('Root 1');
			expect(result[1].label).toBe('Pasted');
			expect(result[2].label).toBe('Root 2');
		});

		it('should paste after target node', () => {
			const nodesToPaste: TreeNode[] = [
				{
					depth: 0,
					id: 'paste-1',
					label: 'Pasted',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste, 'root-1', 'after');

			expect(result).toHaveLength(3);
			expect(result[0].label).toBe('Root 1');
			expect(result[1].label).toBe('Pasted');
			expect(result[2].label).toBe('Root 2');
		});

		it('should paste inside target node as children', () => {
			const nodesToPaste: TreeNode[] = [
				{
					depth: 0,
					id: 'paste-1',
					label: 'Pasted Child',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste, 'root-1', 'inside');

			expect(result).toHaveLength(2);
			expect(result[0].label).toBe('Root 1');
			expect(result[0].children).toHaveLength(2);
			expect(result[0].children?.[1].label).toBe('Pasted Child');
		});

		it('should clone nodes when pasting', () => {
			const nodesToPaste: TreeNode[] = [
				{
					depth: 0,
					id: 'paste-1',
					label: 'Pasted',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste);

			expect(result[result.length - 1].id).not.toBe('paste-1');
		});

		it('should paste nested structure', () => {
			const nodesToPaste: TreeNode[] = [
				{
					children: [
						{
							depth: 1,
							id: 'paste-2',
							label: 'Child',
						},
					],
					depth: 0,
					id: 'paste-1',
					label: 'Parent',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste);

			expect(result).toHaveLength(3);
			expect(result[2].children).toHaveLength(1);
			expect(result[2].children?.[0].label).toBe('Child');
		});

		it('should return original tree when nodesToPaste is empty', () => {
			const result = pasteNodes(testTree, [], 'root-1', 'after');
			expect(result).toBe(testTree);
		});

		it('should return original tree when target not found', () => {
			const nodesToPaste: TreeNode[] = [
				{
					depth: 0,
					id: 'paste-1',
					label: 'Pasted',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste, 'non-existent', 'after');
			expect(result).toBe(testTree);
		});

		it('should paste multiple nodes', () => {
			const nodesToPaste: TreeNode[] = [
				{
					depth: 0,
					id: 'paste-1',
					label: 'Pasted 1',
				},
				{
					depth: 0,
					id: 'paste-2',
					label: 'Pasted 2',
				},
			];
			const result = pasteNodes(testTree, nodesToPaste);

			expect(result).toHaveLength(4);
			expect(result[2].label).toBe('Pasted 1');
			expect(result[3].label).toBe('Pasted 2');
		});
	});
});
