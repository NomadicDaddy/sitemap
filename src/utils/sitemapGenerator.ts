/**
 * Sitemap Generator Utility
 *
 * Provides functions to programmatically generate large test sitemaps
 * with configurable depth and breadth. Useful for performance testing
 * and demo purposes.
 *
 * @example
 * ```typescript
 * // Generate a simple sitemap text
 * const text = generateSitemapText({ depth: 3, breadth: 4 });
 *
 * // Generate with custom labels
 * const customText = generateSitemapText({
 *   depth: 2,
 *   breadth: 3,
 *   labelGenerator: (depth, index) => `Section ${depth}-${index}`,
 * });
 *
 * // Generate TreeNode array directly
 * const nodes = generateSitemapNodes({ depth: 3, breadth: 5 });
 * ```
 */
import { type TreeNode } from '../types/TreeNode';
import { TREE_CHARS } from './treeParser';

/**
 * Options for generating a sitemap.
 */
export interface SitemapGeneratorOptions {
	/**
	 * Maximum depth of the tree (0 = root only, 1 = root + one level of children, etc.)
	 * @default 3
	 */
	depth?: number;

	/**
	 * Number of children at each level (can be a number or a function that returns number based on depth)
	 * @default 3
	 */
	breadth?: number | ((depth: number) => number);

	/**
	 * Custom label generator function
	 * @default Creates labels like "Node 1", "Node 1.1", etc.
	 */
	labelGenerator?: (depth: number, index: number, path: number[]) => string;

	/**
	 * Root node label
	 * @default "Root"
	 */
	rootLabel?: string;

	/**
	 * Whether to include random variation in breadth (makes tree less uniform)
	 * When true, breadth is treated as max breadth and actual breadth varies
	 * @default false
	 */
	randomBreadth?: boolean;

	/**
	 * Seed for random number generation (for reproducible random trees)
	 * Only used when randomBreadth is true
	 * @default undefined (uses Math.random)
	 */
	seed?: number;

	/**
	 * Minimum breadth when randomBreadth is true
	 * @default 1
	 */
	minBreadth?: number;
}

/**
 * Default options for sitemap generation.
 */
export const DEFAULT_GENERATOR_OPTIONS: Required<
	Omit<SitemapGeneratorOptions, 'labelGenerator' | 'seed'>
> = {
	breadth: 3,
	depth: 3,
	minBreadth: 1,
	randomBreadth: false,
	rootLabel: 'Root',
};

/**
 * Simple seeded random number generator for reproducible results.
 */
function createSeededRandom(seed: number): () => number {
	let current = seed;
	return () => {
		current = (current * 1103515245 + 12345) & 0x7fffffff;
		return current / 0x7fffffff;
	};
}

/**
 * Default label generator that creates hierarchical labels.
 * Creates labels like "Node 1", "Node 1.1", "Node 1.1.2", etc.
 */
function defaultLabelGenerator(_depth: number, _index: number, path: number[]): string {
	if (path.length === 0) {
		return 'Root';
	}
	return `Node ${path.join('.')}`;
}

/**
 * Calculates the breadth at a given depth.
 */
function getBreadthAtDepth(
	breadthOption: number | ((depth: number) => number),
	currentDepth: number
): number {
	if (typeof breadthOption === 'function') {
		return breadthOption(currentDepth);
	}
	return breadthOption;
}

/**
 * Generates a tree of TreeNode objects with configurable depth and breadth.
 *
 * @param options - Configuration options for the generator
 * @returns Array of root-level TreeNode objects
 *
 * @example
 * ```typescript
 * // Generate a tree with 3 levels and 3 children at each level
 * const nodes = generateSitemapNodes({ depth: 3, breadth: 3 });
 *
 * // Generate a tree with varying breadth at each level
 * const variableNodes = generateSitemapNodes({
 *   depth: 4,
 *   breadth: (depth) => Math.max(1, 5 - depth), // 5 children at root, 4 at depth 1, etc.
 * });
 *
 * // Generate with custom labels
 * const customNodes = generateSitemapNodes({
 *   depth: 2,
 *   breadth: 3,
 *   labelGenerator: (depth, index, path) => {
 *     const names = ['Home', 'About', 'Products', 'Services', 'Contact'];
 *     return names[index % names.length] + (path.length > 1 ? ` ${path.slice(1).join('.')}` : '');
 *   },
 * });
 * ```
 */
export function generateSitemapNodes(options: SitemapGeneratorOptions = {}): TreeNode[] {
	const opts = {
		...DEFAULT_GENERATOR_OPTIONS,
		...options,
		labelGenerator: options.labelGenerator || defaultLabelGenerator,
	};

	const random = opts.seed !== undefined ? createSeededRandom(opts.seed) : Math.random;
	let nodeCounter = 0;

	function generateNode(currentDepth: number, index: number, path: number[]): TreeNode {
		nodeCounter++;
		const nodeId = `node-${nodeCounter}`;
		const label = opts.labelGenerator(currentDepth, index, path);

		const node: TreeNode = {
			depth: currentDepth,
			id: nodeId,
			label,
			metadata: {
				lineNumber: nodeCounter,
			},
		};

		// Generate children if we haven't reached max depth
		if (currentDepth < opts.depth) {
			let childCount = getBreadthAtDepth(opts.breadth, currentDepth + 1);

			// Apply random variation if enabled
			if (opts.randomBreadth) {
				const minBreadth = opts.minBreadth;
				childCount = Math.floor(random() * (childCount - minBreadth + 1)) + minBreadth;
			}

			if (childCount > 0) {
				node.children = [];
				for (let i = 0; i < childCount; i++) {
					const childPath = [...path, i + 1];
					node.children.push(generateNode(currentDepth + 1, i, childPath));
				}
			}
		}

		return node;
	}

	// Generate root node(s)
	const rootNode = generateNode(0, 0, []);
	rootNode.label = opts.rootLabel;

	return [rootNode];
}

/**
 * Generates a text-based sitemap with tree drawing characters.
 *
 * @param options - Configuration options for the generator
 * @returns String representation of the tree with ├──, └──, │ markers
 *
 * @example
 * ```typescript
 * // Generate a simple sitemap
 * const text = generateSitemapText({ depth: 2, breadth: 3 });
 * // Output:
 * // Root
 * // ├── Node 1
 * // │   ├── Node 1.1
 * // │   ├── Node 1.2
 * // │   └── Node 1.3
 * // ├── Node 2
 * // │   ├── Node 2.1
 * // │   ├── Node 2.2
 * // │   └── Node 2.3
 * // └── Node 3
 * //     ├── Node 3.1
 * //     ├── Node 3.2
 * //     └── Node 3.3
 * ```
 */
export function generateSitemapText(options: SitemapGeneratorOptions = {}): string {
	const nodes = generateSitemapNodes(options);
	return treeNodesToText(nodes);
}

/**
 * Converts an array of TreeNode objects to text format with tree drawing characters.
 *
 * @param nodes - Array of root-level TreeNode objects
 * @returns String representation of the tree
 *
 * @example
 * ```typescript
 * const nodes = [
 *   {
 *     id: '1',
 *     label: 'Home',
 *     depth: 0,
 *     children: [
 *       { id: '2', label: 'About', depth: 1 },
 *       { id: '3', label: 'Contact', depth: 1 },
 *     ],
 *   },
 * ];
 *
 * const text = treeNodesToText(nodes);
 * // Output:
 * // Home
 * // ├── About
 * // └── Contact
 * ```
 */
export function treeNodesToText(nodes: TreeNode[]): string {
	const lines: string[] = [];

	function renderNode(node: TreeNode, prefix: string, isLast: boolean, isRoot: boolean): void {
		if (isRoot) {
			lines.push(node.label);
		} else {
			const connector = isLast ? TREE_CHARS.LAST_BRANCH : TREE_CHARS.BRANCH;
			lines.push(`${prefix}${connector} ${node.label}`);
		}

		if (node.children && node.children.length > 0) {
			const childPrefix = isRoot
				? ''
				: prefix + (isLast ? '    ' : `${TREE_CHARS.VERTICAL}   `);

			node.children.forEach((child, index) => {
				const isLastChild = index === node.children!.length - 1;
				renderNode(child, childPrefix, isLastChild, false);
			});
		}
	}

	nodes.forEach((node, index) => {
		const isLastRoot = index === nodes.length - 1;
		renderNode(node, '', isLastRoot, true);
	});

	return lines.join('\n');
}

/**
 * Calculates the total number of nodes that would be generated with given options.
 * Useful for estimating memory usage before generating large trees.
 *
 * @param options - Configuration options for the generator
 * @returns Total number of nodes that would be generated
 *
 * @example
 * ```typescript
 * // Calculate nodes for a tree with depth 3 and breadth 4
 * const count = calculateNodeCount({ depth: 3, breadth: 4 });
 * // Result: 1 + 4 + 16 + 64 = 85 nodes
 *
 * // Calculate nodes with varying breadth
 * const variableCount = calculateNodeCount({
 *   depth: 3,
 *   breadth: (d) => 3 - d, // 3 at depth 1, 2 at depth 2, 1 at depth 3
 * });
 * ```
 */
export function calculateNodeCount(options: SitemapGeneratorOptions = {}): number {
	const opts = {
		...DEFAULT_GENERATOR_OPTIONS,
		...options,
	};

	// For random breadth, we calculate the maximum possible (randomness would reduce this)
	function countAtDepth(currentDepth: number): number {
		if (currentDepth > opts.depth) {
			return 0;
		}

		const breadth = getBreadthAtDepth(opts.breadth, currentDepth);
		const childCount = currentDepth === 0 ? 1 : breadth;
		const childrenTotal =
			currentDepth < opts.depth
				? Array(childCount)
						.fill(0)
						.reduce((sum) => sum + countAtDepth(currentDepth + 1), 0)
				: 0;

		return childCount + childrenTotal;
	}

	return countAtDepth(0);
}

/**
 * Generates sample sitemaps for common use cases.
 * Provides pre-configured generators for common testing scenarios.
 */
export const sampleSitemaps = {
	/**
	 * Generates an extra-large sitemap for stress testing.
	 * Depth: 5, Breadth: 6 (9331 nodes total)
	 */
	extraLarge: (): TreeNode[] => generateSitemapNodes({ breadth: 6, depth: 5 }),

	/**
	 * Generates a large sitemap for performance testing.
	 * Depth: 4, Breadth: 5 (781 nodes total)
	 */
	large: (): TreeNode[] => generateSitemapNodes({ breadth: 5, depth: 4 }),

	/**
	 * Generates a medium-sized sitemap for integration tests.
	 * Depth: 3, Breadth: 4 (85 nodes total)
	 */
	medium: (): TreeNode[] => generateSitemapNodes({ breadth: 4, depth: 3 }),

	/**
	 * Generates a mobile app structure sitemap.
	 */
	mobileApp: (): TreeNode[] =>
		generateSitemapNodes({
			breadth: (depth) => (depth === 1 ? 4 : 3),
			depth: 2,
			labelGenerator: (depth, index) => {
				const screens = ['Dashboard', 'Profile', 'Settings', 'Messages'];
				const subScreens = [
					['Overview', 'Analytics', 'Reports'],
					['Edit Profile', 'Privacy', 'Notifications'],
					['General', 'Account', 'Theme'],
					['Inbox', 'Sent', 'Archive'],
				];

				if (depth === 0) return 'App';
				if (depth === 1) return screens[index % screens.length];
				const parentScreen = index % screens.length;
				return subScreens[parentScreen]?.[index % 3] || `Screen ${depth}.${index}`;
			},
			rootLabel: 'App',
		}),

	/**
	 * Generates a small sitemap suitable for unit tests.
	 * Depth: 2, Breadth: 3 (13 nodes total)
	 */
	small: (): TreeNode[] => generateSitemapNodes({ breadth: 3, depth: 2 }),

	/**
	 * Generates a realistic website sitemap.
	 */
	website: (): TreeNode[] =>
		generateSitemapNodes({
			breadth: (depth) => {
				switch (depth) {
					case 1:
						return 5; // 5 main sections
					case 2:
						return 3; // 3 subsections each
					case 3:
						return 4; // 4 pages each
					default:
						return 2;
				}
			},
			depth: 3,
			labelGenerator: (depth, index, _path) => {
				const sections = ['Home', 'Products', 'Services', 'About', 'Contact'];
				const subsections = ['Overview', 'Details', 'Gallery'];
				const pages = ['Page A', 'Page B', 'Page C', 'Page D'];

				if (depth === 0) return 'Website';
				if (depth === 1) return sections[index % sections.length];
				if (depth === 2) return subsections[index % subsections.length];
				return pages[index % pages.length];
			},
			rootLabel: 'Website',
		}),
};
