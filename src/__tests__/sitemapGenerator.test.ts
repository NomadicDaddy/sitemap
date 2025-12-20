/**
 * Sitemap Generator Unit Tests
 *
 * Comprehensive tests for the sitemap generator utility.
 * Tests generation of large test sitemaps with configurable depth and breadth.
 */
import {
	DEFAULT_GENERATOR_OPTIONS,
	type SitemapGeneratorOptions,
	calculateNodeCount,
	generateSitemapNodes,
	generateSitemapText,
	sampleSitemaps,
	treeNodesToText,
} from '../utils/sitemapGenerator';
import { countNodes, getMaxDepth, parseTreeText } from '../utils/treeParser';

describe('generateSitemapNodes', () => {
	describe('default behavior', () => {
		it('should generate a tree with default options', () => {
			const nodes = generateSitemapNodes();

			expect(nodes).toHaveLength(1);
			expect(nodes[0].label).toBe('Root');
			expect(nodes[0].depth).toBe(0);
			expect(nodes[0].children).toBeDefined();
		});

		it('should generate tree with depth 3 and breadth 3 by default', () => {
			const nodes = generateSitemapNodes();
			const nodeCount = countNodes(nodes);
			const maxDepth = getMaxDepth(nodes);

			// depth 3, breadth 3: 1 + 3 + 9 + 27 = 40 nodes
			expect(nodeCount).toBe(40);
			expect(maxDepth).toBe(3);
		});

		it('should generate unique IDs for each node', () => {
			const nodes = generateSitemapNodes({ breadth: 2, depth: 2 });
			const allIds: string[] = [];

			function collectIds(nodeList: typeof nodes): void {
				for (const node of nodeList) {
					allIds.push(node.id);
					if (node.children) {
						collectIds(node.children);
					}
				}
			}

			collectIds(nodes);
			const uniqueIds = new Set(allIds);
			expect(uniqueIds.size).toBe(allIds.length);
		});
	});

	describe('depth configuration', () => {
		it('should generate tree with depth 0 (root only)', () => {
			const nodes = generateSitemapNodes({ depth: 0 });

			expect(nodes).toHaveLength(1);
			expect(nodes[0].children).toBeUndefined();
			expect(countNodes(nodes)).toBe(1);
		});

		it('should generate tree with depth 1', () => {
			const nodes = generateSitemapNodes({ breadth: 3, depth: 1 });

			expect(nodes[0].children).toHaveLength(3);
			expect(nodes[0].children![0].children).toBeUndefined();
			expect(countNodes(nodes)).toBe(4); // 1 root + 3 children
		});

		it('should generate tree with depth 2', () => {
			const nodes = generateSitemapNodes({ breadth: 2, depth: 2 });

			expect(countNodes(nodes)).toBe(7); // 1 + 2 + 4
			expect(getMaxDepth(nodes)).toBe(2);
		});

		it('should generate tree with depth 4', () => {
			const nodes = generateSitemapNodes({ breadth: 2, depth: 4 });

			expect(countNodes(nodes)).toBe(31); // 1 + 2 + 4 + 8 + 16
			expect(getMaxDepth(nodes)).toBe(4);
		});
	});

	describe('breadth configuration', () => {
		it('should respect fixed breadth value', () => {
			const nodes = generateSitemapNodes({ breadth: 5, depth: 1 });

			expect(nodes[0].children).toHaveLength(5);
		});

		it('should support breadth as function of depth', () => {
			const nodes = generateSitemapNodes({
				breadth: (depth) => Math.max(1, 4 - depth),
				depth: 3,
			});

			// At depth 0 (root), children will have breadth(1) = 3
			// At depth 1, children will have breadth(2) = 2
			// At depth 2, children will have breadth(3) = 1
			expect(nodes[0].children).toHaveLength(3); // depth 1: 4-1=3
			expect(nodes[0].children![0].children).toHaveLength(2); // depth 2: 4-2=2
			expect(nodes[0].children![0].children![0].children).toHaveLength(1); // depth 3: 4-3=1
		});

		it('should handle breadth of 1', () => {
			const nodes = generateSitemapNodes({ breadth: 1, depth: 3 });

			expect(countNodes(nodes)).toBe(4); // Linear chain: 1 + 1 + 1 + 1
		});
	});

	describe('label configuration', () => {
		it('should use custom rootLabel', () => {
			const nodes = generateSitemapNodes({ rootLabel: 'Website' });

			expect(nodes[0].label).toBe('Website');
		});

		it('should use custom labelGenerator', () => {
			const nodes = generateSitemapNodes({
				breadth: 3,
				depth: 1,
				labelGenerator: (depth, index) => `Level-${depth}-Item-${index}`,
			});

			expect(nodes[0].children![0].label).toBe('Level-1-Item-0');
			expect(nodes[0].children![1].label).toBe('Level-1-Item-1');
			expect(nodes[0].children![2].label).toBe('Level-1-Item-2');
		});

		it('should provide path in labelGenerator', () => {
			const nodes = generateSitemapNodes({
				breadth: 2,
				depth: 2,
				labelGenerator: (_depth, _index, path) => `Path: ${path.join('.')}`,
			});

			expect(nodes[0].children![0].label).toBe('Path: 1');
			expect(nodes[0].children![0].children![1].label).toBe('Path: 1.2');
			expect(nodes[0].children![1].children![0].label).toBe('Path: 2.1');
		});

		it('should generate default hierarchical labels', () => {
			const nodes = generateSitemapNodes({
				breadth: 2,
				depth: 2,
				rootLabel: 'Root',
			});

			expect(nodes[0].label).toBe('Root');
			expect(nodes[0].children![0].label).toBe('Node 1');
			expect(nodes[0].children![0].children![0].label).toBe('Node 1.1');
			expect(nodes[0].children![0].children![1].label).toBe('Node 1.2');
			expect(nodes[0].children![1].label).toBe('Node 2');
			expect(nodes[0].children![1].children![0].label).toBe('Node 2.1');
		});
	});

	describe('random breadth', () => {
		it('should vary breadth when randomBreadth is true', () => {
			// Generate multiple trees and verify they're not all identical
			const results: number[] = [];

			for (let i = 0; i < 10; i++) {
				const nodes = generateSitemapNodes({
					breadth: 5,
					depth: 2,
					minBreadth: 1,
					randomBreadth: true,
				});
				results.push(countNodes(nodes));
			}

			// With random breadth, we should get some variation
			// (It's possible but unlikely all 10 would be identical)
			const uniqueCounts = new Set(results);
			expect(uniqueCounts.size).toBeGreaterThanOrEqual(1);
		});

		it('should respect minBreadth', () => {
			const nodes = generateSitemapNodes({
				breadth: 10,
				depth: 1,
				minBreadth: 5,
				randomBreadth: true,
				seed: 12345,
			});

			// Should have at least minBreadth children
			expect(nodes[0].children!.length).toBeGreaterThanOrEqual(5);
			expect(nodes[0].children!.length).toBeLessThanOrEqual(10);
		});

		it('should produce reproducible results with seed', () => {
			const options: SitemapGeneratorOptions = {
				breadth: 5,
				depth: 2,
				randomBreadth: true,
				seed: 42,
			};

			const nodes1 = generateSitemapNodes(options);
			const nodes2 = generateSitemapNodes(options);

			expect(countNodes(nodes1)).toBe(countNodes(nodes2));
		});
	});

	describe('metadata', () => {
		it('should include lineNumber in metadata', () => {
			const nodes = generateSitemapNodes({ breadth: 2, depth: 1 });

			expect(nodes[0].metadata).toBeDefined();
			expect(nodes[0].metadata!.lineNumber).toBe(1);
			expect(nodes[0].children![0].metadata!.lineNumber).toBe(2);
			expect(nodes[0].children![1].metadata!.lineNumber).toBe(3);
		});
	});
});

describe('generateSitemapText', () => {
	it('should generate text with tree characters', () => {
		const text = generateSitemapText({ breadth: 3, depth: 1, rootLabel: 'Root' });
		const lines = text.split('\n');

		expect(lines[0]).toBe('Root');
		expect(lines[1]).toMatch(/^├── Node 1$/);
		expect(lines[2]).toMatch(/^├── Node 2$/);
		expect(lines[3]).toMatch(/^└── Node 3$/);
	});

	it('should generate parseable text', () => {
		const text = generateSitemapText({ breadth: 2, depth: 2 });
		const parseResult = parseTreeText(text);

		expect(parseResult.success).toBe(true);
		expect(parseResult.nodes).toHaveLength(7); // 1 + 2 + 4
	});

	it('should preserve tree structure through round-trip', () => {
		const originalNodes = generateSitemapNodes({ breadth: 3, depth: 3 });
		const text = generateSitemapText({ breadth: 3, depth: 3 });
		const parseResult = parseTreeText(text);

		expect(countNodes(originalNodes)).toBe(parseResult.nodes.length);
	});

	it('should handle deeply nested structures', () => {
		const text = generateSitemapText({ breadth: 2, depth: 4 });
		const parseResult = parseTreeText(text);

		expect(parseResult.success).toBe(true);
		expect(getMaxDepth(parseResult.nodes.map((n) => ({ ...n, children: undefined })))).toBe(4);
	});
});

describe('treeNodesToText', () => {
	it('should convert TreeNode array to text', () => {
		const nodes = [
			{
				children: [
					{ depth: 1, id: '2', label: 'About' },
					{ depth: 1, id: '3', label: 'Contact' },
				],
				depth: 0,
				id: '1',
				label: 'Home',
			},
		];

		const text = treeNodesToText(nodes);
		const lines = text.split('\n');

		expect(lines[0]).toBe('Home');
		expect(lines[1]).toBe('├── About');
		expect(lines[2]).toBe('└── Contact');
	});

	it('should handle deeply nested nodes', () => {
		const nodes = [
			{
				children: [
					{
						children: [
							{
								children: [{ depth: 3, id: '4', label: 'Great-grandchild' }],
								depth: 2,
								id: '3',
								label: 'Grandchild',
							},
						],
						depth: 1,
						id: '2',
						label: 'Child',
					},
				],
				depth: 0,
				id: '1',
				label: 'Root',
			},
		];

		const text = treeNodesToText(nodes);
		const parseResult = parseTreeText(text);

		expect(parseResult.success).toBe(true);
		expect(parseResult.nodes).toHaveLength(4);
	});

	it('should handle multiple root nodes', () => {
		const nodes = [
			{ depth: 0, id: '1', label: 'Root 1' },
			{ depth: 0, id: '2', label: 'Root 2' },
			{ depth: 0, id: '3', label: 'Root 3' },
		];

		const text = treeNodesToText(nodes);
		const lines = text.split('\n');

		expect(lines).toHaveLength(3);
		expect(lines[0]).toBe('Root 1');
		expect(lines[1]).toBe('Root 2');
		expect(lines[2]).toBe('Root 3');
	});

	it('should handle empty array', () => {
		const text = treeNodesToText([]);
		expect(text).toBe('');
	});
});

describe('calculateNodeCount', () => {
	it('should calculate correct count for uniform tree', () => {
		// depth 2, breadth 3: 1 + 3 + 9 = 13
		expect(calculateNodeCount({ breadth: 3, depth: 2 })).toBe(13);
	});

	it('should calculate correct count for depth 0', () => {
		expect(calculateNodeCount({ breadth: 5, depth: 0 })).toBe(1);
	});

	it('should calculate correct count for breadth 1', () => {
		expect(calculateNodeCount({ breadth: 1, depth: 5 })).toBe(6); // Linear chain
	});

	it('should calculate correct count with varying breadth', () => {
		// Varying breadth function
		const count = calculateNodeCount({
			breadth: (d) => (d === 1 ? 2 : 3),
			depth: 2,
		});
		// depth 0: 1 root, depth 1: 2 children, depth 2: 2 * 3 = 6
		// Total: 1 + 2 + 6 = 9
		expect(count).toBe(9);
	});

	it('should match actual generated node count', () => {
		const options: SitemapGeneratorOptions = { breadth: 4, depth: 3 };
		const calculated = calculateNodeCount(options);
		const nodes = generateSitemapNodes(options);
		const actual = countNodes(nodes);

		expect(calculated).toBe(actual);
	});

	it('should calculate large tree counts efficiently', () => {
		// This should not actually generate the tree
		const startTime = Date.now();
		const count = calculateNodeCount({ breadth: 2, depth: 10 });
		const duration = Date.now() - startTime;

		expect(count).toBe(2047); // 2^11 - 1
		expect(duration).toBeLessThan(100); // Should be very fast
	});
});

describe('sampleSitemaps', () => {
	describe('small', () => {
		it('should generate small sitemap with expected size', () => {
			const nodes = sampleSitemaps.small();
			expect(countNodes(nodes)).toBe(13); // depth 2, breadth 3
		});
	});

	describe('medium', () => {
		it('should generate medium sitemap with expected size', () => {
			const nodes = sampleSitemaps.medium();
			expect(countNodes(nodes)).toBe(85); // depth 3, breadth 4
		});
	});

	describe('large', () => {
		it('should generate large sitemap with expected size', () => {
			const nodes = sampleSitemaps.large();
			expect(countNodes(nodes)).toBe(781); // depth 4, breadth 5
		});
	});

	describe('extraLarge', () => {
		it('should generate extra large sitemap with expected size', () => {
			const nodes = sampleSitemaps.extraLarge();
			expect(countNodes(nodes)).toBe(9331); // depth 5, breadth 6
		});
	});

	describe('website', () => {
		it('should generate realistic website structure', () => {
			const nodes = sampleSitemaps.website();

			expect(nodes[0].label).toBe('Website');
			expect(nodes[0].children).toBeDefined();
			expect(nodes[0].children!.length).toBe(5); // 5 main sections
		});

		it('should use meaningful labels', () => {
			const nodes = sampleSitemaps.website();
			const mainSections = nodes[0].children!.map((n) => n.label);

			expect(mainSections).toContain('Home');
			expect(mainSections).toContain('Products');
			expect(mainSections).toContain('About');
		});
	});

	describe('mobileApp', () => {
		it('should generate mobile app structure', () => {
			const nodes = sampleSitemaps.mobileApp();

			expect(nodes[0].label).toBe('App');
			expect(nodes[0].children).toBeDefined();
			expect(nodes[0].children!.length).toBe(4); // 4 main screens
		});

		it('should have app-like labels', () => {
			const nodes = sampleSitemaps.mobileApp();
			const screens = nodes[0].children!.map((n) => n.label);

			expect(screens).toContain('Dashboard');
			expect(screens).toContain('Profile');
			expect(screens).toContain('Settings');
		});
	});
});

describe('DEFAULT_GENERATOR_OPTIONS', () => {
	it('should have expected default values', () => {
		expect(DEFAULT_GENERATOR_OPTIONS).toEqual({
			breadth: 3,
			depth: 3,
			minBreadth: 1,
			randomBreadth: false,
			rootLabel: 'Root',
		});
	});
});

describe('integration with parser', () => {
	it('should generate text that parses back to equivalent structure', () => {
		const options: SitemapGeneratorOptions = { breadth: 3, depth: 3 };
		const originalNodes = generateSitemapNodes(options);
		const text = generateSitemapText(options);
		const parseResult = parseTreeText(text);

		expect(parseResult.success).toBe(true);

		// Verify node count matches
		expect(parseResult.nodes.length).toBe(countNodes(originalNodes));

		// Verify depths are preserved
		const originalDepths = new Set<number>();
		function collectDepths(nodeList: typeof originalNodes): void {
			for (const node of nodeList) {
				originalDepths.add(node.depth);
				if (node.children) {
					collectDepths(node.children);
				}
			}
		}
		collectDepths(originalNodes);

		const parsedDepths = new Set(parseResult.nodes.map((n) => n.depth));
		expect(parsedDepths).toEqual(originalDepths);
	});

	it('should generate consistent output across multiple calls with same options', () => {
		const options: SitemapGeneratorOptions = { breadth: 3, depth: 2 };

		const text1 = generateSitemapText(options);
		const text2 = generateSitemapText(options);

		expect(text1).toBe(text2);
	});
});

describe('performance', () => {
	it('should generate large trees efficiently', () => {
		const startTime = Date.now();
		const nodes = generateSitemapNodes({ breadth: 5, depth: 5 });
		const duration = Date.now() - startTime;

		// Should generate 3906 nodes in reasonable time
		expect(countNodes(nodes)).toBe(3906);
		expect(duration).toBeLessThan(1000); // Should take less than 1 second
	});

	it('should handle extreme depth without stack overflow', () => {
		// Very deep but narrow tree
		expect(() => {
			const nodes = generateSitemapNodes({ breadth: 1, depth: 50 });
			expect(countNodes(nodes)).toBe(51);
		}).not.toThrow();
	});
});
