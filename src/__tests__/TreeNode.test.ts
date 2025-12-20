/**
 * Tests for TreeNode type definitions and type guards
 */
import {
	DEFAULT_PARSER_OPTIONS,
	type DragState,
	NODE_CATEGORIES,
	type NodeCategory,
	type NodeMetadata,
	type ParseResult,
	type ParsedNode,
	type SelectionState,
	type TreeBuildResult,
	type TreeNode,
	createNodeId,
	isNodeCategory,
	isParseResult,
	isParsedNode,
	isTreeNode,
} from '../types';

describe('TreeNode Type Definitions', () => {
	describe('TreeNode interface', () => {
		it('should allow creating a valid TreeNode with required properties', () => {
			const node: TreeNode = {
				depth: 0,
				id: 'node-1',
				label: 'Home',
			};

			expect(node.id).toBe('node-1');
			expect(node.label).toBe('Home');
			expect(node.depth).toBe(0);
		});

		it('should allow creating a TreeNode with children', () => {
			const node: TreeNode = {
				children: [
					{ depth: 1, id: 'child-1', label: 'Child 1' },
					{ depth: 1, id: 'child-2', label: 'Child 2' },
				],
				depth: 0,
				id: 'parent',
				label: 'Parent',
			};

			expect(node.children).toHaveLength(2);
			expect(node.children![0].label).toBe('Child 1');
		});

		it('should allow creating a TreeNode with metadata', () => {
			const metadata: NodeMetadata = {
				category: 'Page',
				customField: 'custom value',
				expanded: true,
				lineNumber: 1,
			};

			const node: TreeNode = {
				depth: 0,
				id: 'node-1',
				label: 'Home',
				metadata,
			};

			expect(node.metadata?.category).toBe('Page');
			expect(node.metadata?.lineNumber).toBe(1);
			expect(node.metadata?.expanded).toBe(true);
			expect(node.metadata?.customField).toBe('custom value');
		});

		it('should allow deeply nested tree structures', () => {
			const tree: TreeNode = {
				children: [
					{
						children: [
							{
								children: [{ depth: 3, id: 'level-3', label: 'Level 3' }],
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
				id: 'root',
				label: 'Root',
			};

			expect(tree.children![0].children![0].children![0].depth).toBe(3);
		});
	});

	describe('ParsedNode interface', () => {
		it('should allow creating a valid ParsedNode', () => {
			const parsed: ParsedNode = {
				depth: 2,
				id: 'parsed-1',
				label: 'Parsed Node',
				lineNumber: 5,
			};

			expect(parsed.id).toBe('parsed-1');
			expect(parsed.lineNumber).toBe(5);
		});
	});

	describe('ParseResult interface', () => {
		it('should allow creating a successful ParseResult', () => {
			const result: ParseResult = {
				errors: [],
				nodes: [
					{ depth: 0, id: '1', label: 'Node 1', lineNumber: 1 },
					{ depth: 1, id: '2', label: 'Node 2', lineNumber: 2 },
				],
				success: true,
			};

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(2);
			expect(result.errors).toHaveLength(0);
		});

		it('should allow creating a ParseResult with errors', () => {
			const result: ParseResult = {
				errors: [
					{
						code: 'INVALID_DEPTH_JUMP',
						lineContent: '   Invalid line',
						lineNumber: 3,
						message: 'Invalid indentation',
						severity: 'error',
					},
				],
				nodes: [],
				success: false,
			};

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe('Invalid indentation');
			expect(result.errors[0].code).toBe('INVALID_DEPTH_JUMP');
			expect(result.errors[0].severity).toBe('error');
		});
	});

	describe('TreeBuildResult interface', () => {
		it('should allow creating a TreeBuildResult', () => {
			const result: TreeBuildResult = {
				maxDepth: 3,
				nodeCount: 5,
				roots: [{ depth: 0, id: 'root', label: 'Root' }],
			};

			expect(result.roots).toHaveLength(1);
			expect(result.nodeCount).toBe(5);
			expect(result.maxDepth).toBe(3);
		});
	});

	describe('SelectionState interface', () => {
		it('should allow creating a SelectionState', () => {
			const state: SelectionState = {
				focusedId: 'node-1',
				lastSelectedId: 'node-2',
				selectedIds: new Set(['node-1', 'node-2']),
			};

			expect(state.selectedIds.has('node-1')).toBe(true);
			expect(state.lastSelectedId).toBe('node-2');
		});
	});

	describe('DragState interface', () => {
		it('should allow creating a DragState', () => {
			const state: DragState = {
				draggedId: 'node-1',
				isValidDrop: true,
				position: 'inside',
				targetId: 'node-2',
			};

			expect(state.draggedId).toBe('node-1');
			expect(state.position).toBe('inside');
		});
	});
});

describe('Type Guards', () => {
	describe('isTreeNode', () => {
		it('should return true for valid TreeNode', () => {
			expect(
				isTreeNode({
					depth: 0,
					id: 'node-1',
					label: 'Test',
				})
			).toBe(true);
		});

		it('should return true for TreeNode with optional properties', () => {
			expect(
				isTreeNode({
					children: [],
					depth: 0,
					id: 'node-1',
					label: 'Test',
					metadata: { category: 'Page' },
				})
			).toBe(true);
		});

		it('should return false for null', () => {
			expect(isTreeNode(null)).toBe(false);
		});

		it('should return false for undefined', () => {
			expect(isTreeNode(undefined)).toBe(false);
		});

		it('should return false for primitive types', () => {
			expect(isTreeNode('string')).toBe(false);
			expect(isTreeNode(123)).toBe(false);
			expect(isTreeNode(true)).toBe(false);
		});

		it('should return false for objects missing required properties', () => {
			expect(isTreeNode({ id: 'node-1' })).toBe(false);
			expect(isTreeNode({ id: 'node-1', label: 'Test' })).toBe(false);
			expect(isTreeNode({ depth: 0, label: 'Test' })).toBe(false);
		});

		it('should return false for objects with wrong property types', () => {
			expect(isTreeNode({ depth: 0, id: 123, label: 'Test' })).toBe(false);
			expect(isTreeNode({ depth: 0, id: 'node-1', label: 123 })).toBe(false);
			expect(isTreeNode({ depth: '0', id: 'node-1', label: 'Test' })).toBe(false);
		});

		it('should return false for objects with invalid children', () => {
			expect(
				isTreeNode({
					children: 'not an array',
					depth: 0,
					id: 'node-1',
					label: 'Test',
				})
			).toBe(false);
		});

		it('should return false for objects with invalid metadata', () => {
			expect(
				isTreeNode({
					depth: 0,
					id: 'node-1',
					label: 'Test',
					metadata: 'not an object',
				})
			).toBe(false);
		});
	});

	describe('isParsedNode', () => {
		it('should return true for valid ParsedNode', () => {
			expect(
				isParsedNode({
					depth: 0,
					id: 'node-1',
					label: 'Test',
					lineNumber: 1,
				})
			).toBe(true);
		});

		it('should return false for null', () => {
			expect(isParsedNode(null)).toBe(false);
		});

		it('should return false for objects missing lineNumber', () => {
			expect(
				isParsedNode({
					depth: 0,
					id: 'node-1',
					label: 'Test',
				})
			).toBe(false);
		});

		it('should return false for objects with wrong types', () => {
			expect(
				isParsedNode({
					depth: 0,
					id: 'node-1',
					label: 'Test',
					lineNumber: '1',
				})
			).toBe(false);
		});
	});

	describe('isNodeCategory', () => {
		it('should return true for valid categories', () => {
			expect(isNodeCategory('Page')).toBe(true);
			expect(isNodeCategory('Section')).toBe(true);
			expect(isNodeCategory('Component')).toBe(true);
			expect(isNodeCategory('Element')).toBe(true);
			expect(isNodeCategory('Custom')).toBe(true);
		});

		it('should return false for invalid categories', () => {
			expect(isNodeCategory('Invalid')).toBe(false);
			expect(isNodeCategory('')).toBe(false);
			expect(isNodeCategory(null)).toBe(false);
			expect(isNodeCategory(undefined)).toBe(false);
			expect(isNodeCategory(123)).toBe(false);
		});
	});

	describe('isParseResult', () => {
		it('should return true for valid ParseResult', () => {
			expect(
				isParseResult({
					errors: [],
					nodes: [],
					success: true,
				})
			).toBe(true);
		});

		it('should return true for ParseResult with nodes and errors', () => {
			expect(
				isParseResult({
					errors: [{ lineContent: 'test', lineNumber: 1, message: 'Error' }],
					nodes: [{ depth: 0, id: '1', label: 'Test', lineNumber: 1 }],
					success: false,
				})
			).toBe(true);
		});

		it('should return false for null', () => {
			expect(isParseResult(null)).toBe(false);
		});

		it('should return false for objects missing required properties', () => {
			expect(isParseResult({ nodes: [] })).toBe(false);
			expect(isParseResult({ success: true })).toBe(false);
			expect(isParseResult({ errors: [] })).toBe(false);
		});

		it('should return false for objects with wrong types', () => {
			expect(
				isParseResult({
					errors: [],
					nodes: 'not an array',
					success: true,
				})
			).toBe(false);
			expect(
				isParseResult({
					errors: [],
					nodes: [],
					success: 'true',
				})
			).toBe(false);
		});
	});
});

describe('Helper Functions', () => {
	describe('createNodeId', () => {
		it('should create a branded NodeId from a string', () => {
			const id = createNodeId('test-id');
			expect(id).toBe('test-id');
			// The branded type ensures type safety at compile time
			// At runtime, it's still a string
			expect(typeof id).toBe('string');
		});
	});
});

describe('Constants', () => {
	describe('NODE_CATEGORIES', () => {
		it('should contain all valid categories', () => {
			expect(NODE_CATEGORIES).toEqual(['Page', 'Section', 'Component', 'Element', 'Custom']);
		});

		it('should be readonly', () => {
			// This is a compile-time check, but we can verify the array contents
			expect(NODE_CATEGORIES.length).toBe(5);
		});
	});

	describe('DEFAULT_PARSER_OPTIONS', () => {
		it('should have correct default values', () => {
			expect(DEFAULT_PARSER_OPTIONS.indentSize).toBe(4);
			expect(DEFAULT_PARSER_OPTIONS.trimLabels).toBe(true);
			expect(DEFAULT_PARSER_OPTIONS.skipEmptyLines).toBe(true);
			expect(DEFAULT_PARSER_OPTIONS.generateIds).toBe(true);
		});
	});
});

describe('Type Safety', () => {
	describe('NodeCategory type', () => {
		it('should only allow valid categories', () => {
			// These should all compile without error
			const page: NodeCategory = 'Page';
			const section: NodeCategory = 'Section';
			const component: NodeCategory = 'Component';
			const element: NodeCategory = 'Element';
			const custom: NodeCategory = 'Custom';

			expect([page, section, component, element, custom]).toEqual([
				'Page',
				'Section',
				'Component',
				'Element',
				'Custom',
			]);
		});
	});

	describe('TreeNode recursive children', () => {
		it('should support arbitrary nesting depth', () => {
			const deepTree: TreeNode = {
				children: [
					{
						children: [
							{
								children: [
									{
										children: [
											{
												depth: 4,
												id: 'l4',
												label: 'Level 4',
											},
										],
										depth: 3,
										id: 'l3',
										label: 'Level 3',
									},
								],
								depth: 2,
								id: 'l2',
								label: 'Level 2',
							},
						],
						depth: 1,
						id: 'l1',
						label: 'Level 1',
					},
				],
				depth: 0,
				id: 'root',
				label: 'Root',
			};

			// Navigate to deepest level
			let current: TreeNode | undefined = deepTree;
			let maxDepth = 0;
			while (current?.children?.[0]) {
				current = current.children[0];
				maxDepth = current.depth;
			}

			expect(maxDepth).toBe(4);
		});
	});

	describe('NodeMetadata extensibility', () => {
		it('should allow custom properties via index signature', () => {
			const metadata: NodeMetadata = {
				category: 'Page',
				customArray: [1, 2, 3],
				customBoolean: true,
				customNumber: 42,
				customObject: { nested: 'data' },
				customString: 'value',
				lineNumber: 1,
			};

			expect(metadata.customString).toBe('value');
			expect(metadata.customNumber).toBe(42);
		});
	});
});
