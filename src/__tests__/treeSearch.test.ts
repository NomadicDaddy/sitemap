/**
 * Tree Search Utility Tests
 *
 * Tests for the tree search functionality including:
 * - Basic search by label
 * - Search by tags, category, and properties
 * - Case sensitivity
 * - Exact match
 * - Filtering
 * - Highlighting
 * - Match navigation
 */
import { type TreeNode } from '../types/TreeNode';
import {
	expandAncestors,
	filterTreeByMatches,
	getHighlightSegments,
	getMatchingNodesInOrder,
	getNextMatchId,
	getPreviousMatchId,
	markMatchingNodes,
	searchTree,
} from '../utils/treeSearch';

// ============================================================================
// Test Data
// ============================================================================

const createTestTree = (): TreeNode[] => [
	{
		children: [
			{
				depth: 1,
				id: 'hero',
				label: 'Hero Section',
				metadata: {
					category: 'Section',
					tags: ['featured', 'main'],
				},
			},
			{
				children: [
					{
						depth: 2,
						id: 'feature-1',
						label: 'Fast Performance',
						metadata: {
							tags: ['performance'],
						},
					},
					{
						depth: 2,
						id: 'feature-2',
						label: 'Easy Integration',
						metadata: {
							tags: ['integration'],
						},
					},
				],
				depth: 1,
				id: 'features',
				label: 'Features',
			},
		],
		depth: 0,
		id: 'home',
		label: 'Home Page',
	},
	{
		children: [
			{
				depth: 1,
				id: 'team',
				label: 'Our Team',
			},
			{
				depth: 1,
				id: 'history',
				label: 'Company History',
			},
		],
		depth: 0,
		id: 'about',
		label: 'About Us',
		metadata: {
			category: 'Page',
		},
	},
	{
		depth: 0,
		id: 'contact',
		label: 'Contact',
		metadata: {
			customProp: 'email-form',
		},
	},
];

// ============================================================================
// Tests
// ============================================================================

describe('searchTree', () => {
	describe('basic label search', () => {
		it('should find nodes by partial label match', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Home');

			expect(result.matchCount).toBe(1);
			expect(result.matchingIds.has('home')).toBe(true);
		});

		it('should find multiple matching nodes', () => {
			// Create test nodes specifically for this test
			const testNodes: TreeNode[] = [
				{ depth: 0, id: 'node-1', label: 'Test Item One' },
				{ depth: 0, id: 'node-2', label: 'Test Item Two' },
				{ depth: 0, id: 'node-3', label: 'Test Item Three' },
			];
			const result = searchTree(testNodes, 'Test');

			expect(result.matchCount).toBe(3);
			expect(result.matchingIds.has('node-1')).toBe(true);
			expect(result.matchingIds.has('node-2')).toBe(true);
			expect(result.matchingIds.has('node-3')).toBe(true);
		});

		it('should be case-insensitive by default', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'home');

			expect(result.matchCount).toBe(1);
			expect(result.matchingIds.has('home')).toBe(true);
		});

		it('should return empty result for non-matching query', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'nonexistent');

			expect(result.matchCount).toBe(0);
			expect(result.matchingIds.size).toBe(0);
		});

		it('should return empty result for empty query', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, '');

			expect(result.matchCount).toBe(0);
		});

		it('should return empty result for whitespace-only query', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, '   ');

			expect(result.matchCount).toBe(0);
		});
	});

	describe('case sensitivity', () => {
		it('should respect caseSensitive option when true', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'home', { caseSensitive: true });

			expect(result.matchCount).toBe(0);
		});

		it('should find match with correct case when caseSensitive is true', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Home', { caseSensitive: true });

			expect(result.matchCount).toBe(1);
		});
	});

	describe('exact match', () => {
		it('should not match partial when exactMatch is true', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Home', { exactMatch: true });

			expect(result.matchCount).toBe(0);
		});

		it('should match exact label when exactMatch is true', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Home Page', { exactMatch: true });

			expect(result.matchCount).toBe(1);
			expect(result.matchingIds.has('home')).toBe(true);
		});
	});

	describe('search fields', () => {
		it('should search in tags when specified', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'featured', {
				searchFields: ['tags'],
			});

			expect(result.matchCount).toBe(1);
			expect(result.matchingIds.has('hero')).toBe(true);
		});

		it('should search in category when specified', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Section', {
				searchFields: ['category'],
			});

			expect(result.matchCount).toBe(1);
			expect(result.matchingIds.has('hero')).toBe(true);
		});

		it('should search in properties when specified', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'email-form', {
				searchFields: ['properties'],
			});

			expect(result.matchCount).toBe(1);
			expect(result.matchingIds.has('contact')).toBe(true);
		});

		it('should search in multiple fields', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'page', {
				searchFields: ['label', 'category'],
			});

			expect(result.matchCount).toBe(2);
			expect(result.matchingIds.has('home')).toBe(true);
			expect(result.matchingIds.has('about')).toBe(true);
		});
	});

	describe('ancestor tracking', () => {
		it('should track ancestors of matching nodes', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Performance');

			expect(result.matchCount).toBe(1);
			expect(result.matchingIds.has('feature-1')).toBe(true);
			expect(result.ancestorIds.has('features')).toBe(true);
			expect(result.ancestorIds.has('home')).toBe(true);
		});

		it('should not include matching nodes in ancestors', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Features');

			expect(result.matchingIds.has('features')).toBe(true);
			expect(result.ancestorIds.has('features')).toBe(false);
		});
	});

	describe('match details', () => {
		it('should include match details with start and end indices', () => {
			const nodes = createTestTree();
			const result = searchTree(nodes, 'Home');

			const details = result.matchDetails.get('home');
			expect(details).toBeDefined();
			expect(details?.[0].field).toBe('label');
			expect(details?.[0].startIndex).toBe(0);
			expect(details?.[0].endIndex).toBe(4);
		});

		it('should find multiple occurrences in a single label', () => {
			const testNodes: TreeNode[] = [
				{
					depth: 0,
					id: 'test',
					label: 'Home is where home is',
				},
			];
			const result = searchTree(testNodes, 'home');

			const details = result.matchDetails.get('test');
			expect(details?.length).toBe(2);
		});
	});
});

describe('filterTreeByMatches', () => {
	it('should return only matching nodes and their ancestors', () => {
		const nodes = createTestTree();
		const searchResult = searchTree(nodes, 'Performance');
		const filtered = filterTreeByMatches(
			nodes,
			searchResult.matchingIds,
			searchResult.ancestorIds
		);

		expect(filtered.length).toBe(1);
		expect(filtered[0].id).toBe('home');
		expect(filtered[0].children?.length).toBe(1);
		expect(filtered[0].children?.[0].id).toBe('features');
		expect(filtered[0].children?.[0].children?.length).toBe(1);
		expect(filtered[0].children?.[0].children?.[0].id).toBe('feature-1');
	});

	it('should return empty array when no matches', () => {
		const nodes = createTestTree();
		const filtered = filterTreeByMatches(nodes, new Set(), new Set());

		expect(filtered.length).toBe(0);
	});

	it('should expand filtered nodes to show matches', () => {
		const nodes = createTestTree();
		const searchResult = searchTree(nodes, 'Performance');
		const filtered = filterTreeByMatches(
			nodes,
			searchResult.matchingIds,
			searchResult.ancestorIds
		);

		expect(filtered[0].metadata?.expanded).toBe(true);
	});
});

describe('markMatchingNodes', () => {
	it('should add search metadata to matching nodes', () => {
		const nodes = createTestTree();
		const searchResult = searchTree(nodes, 'Features');
		const marked = markMatchingNodes(nodes, searchResult.matchingIds, searchResult.ancestorIds);

		const featuresNode = marked[0].children?.[1];
		expect(featuresNode?.metadata?._searchIsMatch).toBe(true);
	});

	it('should mark ancestors as ancestors', () => {
		const nodes = createTestTree();
		const searchResult = searchTree(nodes, 'Performance');
		const marked = markMatchingNodes(nodes, searchResult.matchingIds, searchResult.ancestorIds);

		expect(marked[0].metadata?._searchIsAncestor).toBe(true);
		expect(marked[0].metadata?._searchIsMatch).toBeFalsy();
	});
});

describe('getHighlightSegments', () => {
	it('should split label into matching and non-matching segments', () => {
		const matchDetails = [
			{
				endIndex: 4,
				field: 'label' as const,
				matchedText: 'Home',
				startIndex: 0,
			},
		];
		const segments = getHighlightSegments('Home Page', matchDetails);

		expect(segments.length).toBe(2);
		expect(segments[0].text).toBe('Home');
		expect(segments[0].isMatch).toBe(true);
		expect(segments[1].text).toBe(' Page');
		expect(segments[1].isMatch).toBe(false);
	});

	it('should handle match in middle of label', () => {
		const matchDetails = [
			{
				endIndex: 9,
				field: 'label' as const,
				matchedText: 'Page',
				startIndex: 5,
			},
		];
		const segments = getHighlightSegments('Home Page', matchDetails);

		expect(segments.length).toBe(2);
		expect(segments[0].text).toBe('Home ');
		expect(segments[0].isMatch).toBe(false);
		expect(segments[1].text).toBe('Page');
		expect(segments[1].isMatch).toBe(true);
	});

	it('should handle multiple matches', () => {
		const matchDetails = [
			{
				endIndex: 4,
				field: 'label' as const,
				matchedText: 'Home',
				startIndex: 0,
			},
			{
				endIndex: 18,
				field: 'label' as const,
				matchedText: 'home',
				startIndex: 14,
			},
		];
		const segments = getHighlightSegments('Home is where home is', matchDetails);

		expect(segments.length).toBe(4);
		expect(segments[0].isMatch).toBe(true);
		expect(segments[1].isMatch).toBe(false);
		expect(segments[2].isMatch).toBe(true);
		expect(segments[3].isMatch).toBe(false);
	});

	it('should return single non-matching segment when no matches', () => {
		const segments = getHighlightSegments('Home Page', undefined);

		expect(segments.length).toBe(1);
		expect(segments[0].text).toBe('Home Page');
		expect(segments[0].isMatch).toBe(false);
	});

	it('should ignore non-label match details', () => {
		const matchDetails = [
			{
				endIndex: 8,
				field: 'tags' as const,
				matchedText: 'featured',
				startIndex: 0,
			},
		];
		const segments = getHighlightSegments('Home Page', matchDetails);

		expect(segments.length).toBe(1);
		expect(segments[0].isMatch).toBe(false);
	});
});

describe('expandAncestors', () => {
	it('should expand ancestor nodes', () => {
		const nodes = createTestTree();
		const ancestorIds = new Set(['home', 'features']);
		const expanded = expandAncestors(nodes, ancestorIds);

		expect(expanded[0].metadata?.expanded).toBe(true);
		expect(expanded[0].children?.[1].metadata?.expanded).toBe(true);
	});

	it('should not change non-ancestor nodes', () => {
		const nodes: TreeNode[] = [
			{
				depth: 0,
				id: 'test',
				label: 'Test',
				metadata: { expanded: false },
			},
		];
		const expanded = expandAncestors(nodes, new Set());

		expect(expanded[0].metadata?.expanded).toBe(false);
	});
});

describe('match navigation', () => {
	// Create test tree with multiple matching nodes for navigation tests
	const createNavigationTestTree = (): TreeNode[] => [
		{
			children: [
				{
					depth: 1,
					id: 'page-1-section',
					label: 'Test Section',
				},
			],
			depth: 0,
			id: 'page-1',
			label: 'Test Page One',
		},
		{
			depth: 0,
			id: 'page-2',
			label: 'Test Page Two',
		},
		{
			depth: 0,
			id: 'page-3',
			label: 'Test Page Three',
		},
	];

	it('should return matches in tree order', () => {
		const nodes = createNavigationTestTree();
		const searchResult = searchTree(nodes, 'Test');
		const ordered = getMatchingNodesInOrder(nodes, searchResult.matchingIds);

		expect(ordered).toEqual(['page-1', 'page-1-section', 'page-2', 'page-3']);
	});

	it('should get next match', () => {
		const nodes = createNavigationTestTree();
		const searchResult = searchTree(nodes, 'Test');

		const next = getNextMatchId(nodes, searchResult.matchingIds, 'page-1');
		expect(next).toBe('page-1-section');
	});

	it('should wrap around to first match', () => {
		const nodes = createNavigationTestTree();
		const searchResult = searchTree(nodes, 'Test');

		const next = getNextMatchId(nodes, searchResult.matchingIds, 'page-3');
		expect(next).toBe('page-1');
	});

	it('should get previous match', () => {
		const nodes = createNavigationTestTree();
		const searchResult = searchTree(nodes, 'Test');

		const prev = getPreviousMatchId(nodes, searchResult.matchingIds, 'page-3');
		expect(prev).toBe('page-2');
	});

	it('should wrap around to last match', () => {
		const nodes = createNavigationTestTree();
		const searchResult = searchTree(nodes, 'Test');

		const prev = getPreviousMatchId(nodes, searchResult.matchingIds, 'page-1');
		expect(prev).toBe('page-3');
	});

	it('should return first match when no current match', () => {
		const nodes = createNavigationTestTree();
		const searchResult = searchTree(nodes, 'Test');

		const next = getNextMatchId(nodes, searchResult.matchingIds, undefined);
		expect(next).toBe('page-1');
	});

	it('should return undefined when no matches', () => {
		const nodes = createNavigationTestTree();

		const next = getNextMatchId(nodes, new Set(), undefined);
		expect(next).toBeUndefined();
	});
});
