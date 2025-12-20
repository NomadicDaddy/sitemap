/**
 * Tree Parser Unit Tests
 *
 * Comprehensive tests for the text-input-parser feature.
 * Tests parsing of indentation markers (├──, └──, │, spaces) and
 * conversion to structured node objects.
 */
import { DEFAULT_PARSER_OPTIONS } from '../types/TreeNode';
import {
	buildTreeHierarchy,
	countNodes,
	getMaxDepth,
	parseAndBuildTree,
	parseTreeText,
} from '../utils/treeParser';

describe('parseTreeText', () => {
	describe('basic parsing', () => {
		it('should parse a single root node', () => {
			const input = 'Home';
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(1);
			expect(result.nodes[0]).toMatchObject({
				depth: 0,
				label: 'Home',
				lineNumber: 1,
			});
		});

		it('should parse multiple root nodes', () => {
			const input = `Home
About
Contact`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(3);
			expect(result.nodes.map((n) => n.label)).toEqual(['Home', 'About', 'Contact']);
			expect(result.nodes.map((n) => n.depth)).toEqual([0, 0, 0]);
		});

		it('should handle empty input', () => {
			const result = parseTreeText('');
			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(0);
		});

		it('should handle whitespace-only input', () => {
			const result = parseTreeText('   \n  \n   ');
			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(0);
		});
	});

	describe('tree character parsing', () => {
		it('should parse tree with ├── markers', () => {
			const input = `Home
├── About
├── Products
├── Contact`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(4);
			expect(result.nodes[0]).toMatchObject({ depth: 0, label: 'Home' });
			expect(result.nodes[1]).toMatchObject({ depth: 1, label: 'About' });
			expect(result.nodes[2]).toMatchObject({ depth: 1, label: 'Products' });
			expect(result.nodes[3]).toMatchObject({ depth: 1, label: 'Contact' });
		});

		it('should parse tree with └── markers', () => {
			const input = `Home
└── Contact`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(2);
			expect(result.nodes[1]).toMatchObject({ depth: 1, label: 'Contact' });
		});

		it('should parse tree with mixed ├── and └── markers', () => {
			const input = `Home
├── About
├── Products
└── Contact`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(4);
			expect(result.nodes.map((n) => n.depth)).toEqual([0, 1, 1, 1]);
		});

		it('should parse nested tree with │ continuation', () => {
			const input = `Home
├── About
│   ├── Team
│   └── History
└── Contact`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(5);
			expect(result.nodes[0]).toMatchObject({ depth: 0, label: 'Home' });
			expect(result.nodes[1]).toMatchObject({ depth: 1, label: 'About' });
			expect(result.nodes[2]).toMatchObject({ depth: 2, label: 'Team' });
			expect(result.nodes[3]).toMatchObject({ depth: 2, label: 'History' });
			expect(result.nodes[4]).toMatchObject({ depth: 1, label: 'Contact' });
		});

		it('should parse deeply nested tree', () => {
			const input = `Root
├── Level 1
│   ├── Level 2
│   │   ├── Level 3
│   │   │   └── Level 4
│   │   └── Level 3 Sibling
│   └── Level 2 Sibling
└── Level 1 Sibling`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(8);
			expect(result.nodes.map((n) => ({ depth: n.depth, label: n.label }))).toEqual([
				{ depth: 0, label: 'Root' },
				{ depth: 1, label: 'Level 1' },
				{ depth: 2, label: 'Level 2' },
				{ depth: 3, label: 'Level 3' },
				{ depth: 4, label: 'Level 4' },
				{ depth: 3, label: 'Level 3 Sibling' },
				{ depth: 2, label: 'Level 2 Sibling' },
				{ depth: 1, label: 'Level 1 Sibling' },
			]);
		});
	});

	describe('space-based indentation', () => {
		it('should parse pure space-based indentation', () => {
			const input = `Home
    About
    Products
        Category A
        Category B
    Contact`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(6);
			expect(result.nodes[0]).toMatchObject({ depth: 0, label: 'Home' });
			expect(result.nodes[1]).toMatchObject({ depth: 1, label: 'About' });
			expect(result.nodes[3]).toMatchObject({ depth: 2, label: 'Category A' });
		});

		it('should respect custom indentSize option', () => {
			const input = `Home
  About
  Products`;
			const result = parseTreeText(input, { indentSize: 2 });

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(3);
			expect(result.nodes[1]).toMatchObject({ depth: 1, label: 'About' });
			expect(result.nodes[2]).toMatchObject({ depth: 1, label: 'Products' });
		});
	});

	describe('edge cases', () => {
		it('should handle labels with special characters', () => {
			const input = `Home
├── About (Company)
├── Products & Services
└── Contact: Email`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes[1]).toMatchObject({ depth: 1, label: 'About (Company)' });
			expect(result.nodes[2]).toMatchObject({ depth: 1, label: 'Products & Services' });
			expect(result.nodes[3]).toMatchObject({ depth: 1, label: 'Contact: Email' });
		});

		it('should handle labels with numbers', () => {
			const input = `Home
├── Section 1
├── Section 2
└── 3rd Section`;
			const result = parseTreeText(input);

			expect(result.nodes.map((n) => n.label)).toEqual([
				'Home',
				'Section 1',
				'Section 2',
				'3rd Section',
			]);
		});

		it('should handle Windows line endings (CRLF)', () => {
			const input = 'Home\r\n├── About\r\n└── Contact';
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(3);
		});

		it('should handle Unix line endings (LF)', () => {
			const input = 'Home\n├── About\n└── Contact';
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(3);
		});

		it('should skip empty lines by default', () => {
			const input = `Home

├── About

└── Contact`;
			const result = parseTreeText(input);

			expect(result.success).toBe(true);
			expect(result.nodes).toHaveLength(3);
		});

		it('should trim labels by default', () => {
			const input = `  Home
├──   About
└──   Contact   `;
			const result = parseTreeText(input);

			expect(result.nodes[0].label).toBe('Home');
			expect(result.nodes[1].label).toBe('About');
			expect(result.nodes[2].label).toBe('Contact');
		});
	});

	describe('ID generation', () => {
		it('should generate unique IDs for each node', () => {
			const input = `Home
├── About
└── Contact`;
			const result = parseTreeText(input);

			const ids = result.nodes.map((n) => n.id);
			expect(new Set(ids).size).toBe(ids.length); // All IDs unique
		});

		it('should generate sequential IDs', () => {
			const input = `Home
├── About
└── Contact`;
			const result = parseTreeText(input);

			expect(result.nodes[0].id).toBe('node-1');
			expect(result.nodes[1].id).toBe('node-2');
			expect(result.nodes[2].id).toBe('node-3');
		});
	});

	describe('line numbers', () => {
		it('should track correct line numbers', () => {
			const input = `Home
├── About
└── Contact`;
			const result = parseTreeText(input);

			expect(result.nodes[0].lineNumber).toBe(1);
			expect(result.nodes[1].lineNumber).toBe(2);
			expect(result.nodes[2].lineNumber).toBe(3);
		});

		it('should track line numbers with empty lines skipped', () => {
			const input = `Home

├── About

└── Contact`;
			const result = parseTreeText(input);

			expect(result.nodes[0].lineNumber).toBe(1);
			expect(result.nodes[1].lineNumber).toBe(3);
			expect(result.nodes[2].lineNumber).toBe(5);
		});
	});

	describe('validation errors', () => {
		it('should detect invalid depth jumps', () => {
			const input = `Home
├── About
│   │   └── Deep Node`; // Jumps from depth 1 to depth 3
			const result = parseTreeText(input);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain('Invalid depth jump');
		});

		it('should still return nodes even with validation errors', () => {
			const input = `Home
├── About
│   │   └── Deep Node`;
			const result = parseTreeText(input);

			expect(result.nodes).toHaveLength(3);
		});
	});
});

describe('buildTreeHierarchy', () => {
	it('should build hierarchy from flat nodes', () => {
		const flatNodes = [
			{ depth: 0, id: '1', label: 'Home', lineNumber: 1 },
			{ depth: 1, id: '2', label: 'About', lineNumber: 2 },
			{ depth: 1, id: '3', label: 'Contact', lineNumber: 3 },
		];
		const tree = buildTreeHierarchy(flatNodes);

		expect(tree).toHaveLength(1);
		expect(tree[0].label).toBe('Home');
		expect(tree[0].children).toHaveLength(2);
		expect(tree[0].children![0].label).toBe('About');
		expect(tree[0].children![1].label).toBe('Contact');
	});

	it('should handle multiple root nodes', () => {
		const flatNodes = [
			{ depth: 0, id: '1', label: 'Home', lineNumber: 1 },
			{ depth: 0, id: '2', label: 'Blog', lineNumber: 2 },
			{ depth: 0, id: '3', label: 'Shop', lineNumber: 3 },
		];
		const tree = buildTreeHierarchy(flatNodes);

		expect(tree).toHaveLength(3);
		expect(tree.map((n) => n.label)).toEqual(['Home', 'Blog', 'Shop']);
	});

	it('should handle deeply nested structures', () => {
		const flatNodes = [
			{ depth: 0, id: '1', label: 'Root', lineNumber: 1 },
			{ depth: 1, id: '2', label: 'L1', lineNumber: 2 },
			{ depth: 2, id: '3', label: 'L2', lineNumber: 3 },
			{ depth: 3, id: '4', label: 'L3', lineNumber: 4 },
		];
		const tree = buildTreeHierarchy(flatNodes);

		expect(tree).toHaveLength(1);
		expect(tree[0].children![0].children![0].children![0].label).toBe('L3');
	});

	it('should handle empty input', () => {
		const tree = buildTreeHierarchy([]);
		expect(tree).toHaveLength(0);
	});

	it('should include metadata with lineNumber', () => {
		const flatNodes = [{ depth: 0, id: '1', label: 'Home', lineNumber: 5 }];
		const tree = buildTreeHierarchy(flatNodes);

		expect(tree[0].metadata).toBeDefined();
		expect(tree[0].metadata!.lineNumber).toBe(5);
	});
});

describe('parseAndBuildTree', () => {
	it('should combine parsing and hierarchy building', () => {
		const input = `Home
├── About
│   ├── Team
│   └── History
└── Contact`;
		const { tree, errors, success } = parseAndBuildTree(input);

		expect(success).toBe(true);
		expect(errors).toHaveLength(0);
		expect(tree).toHaveLength(1);
		expect(tree[0].label).toBe('Home');
		expect(tree[0].children).toHaveLength(2);
		expect(tree[0].children![0].label).toBe('About');
		expect(tree[0].children![0].children).toHaveLength(2);
	});
});

describe('countNodes', () => {
	it('should count all nodes including children', () => {
		const { tree } = parseAndBuildTree(`Home
├── About
│   ├── Team
│   └── History
└── Contact`);

		expect(countNodes(tree)).toBe(5);
	});

	it('should return 0 for empty tree', () => {
		expect(countNodes([])).toBe(0);
	});
});

describe('getMaxDepth', () => {
	it('should return maximum depth in tree', () => {
		const { tree } = parseAndBuildTree(`Root
├── Level 1
│   ├── Level 2
│   │   └── Level 3
└── Another Level 1`);

		expect(getMaxDepth(tree)).toBe(3);
	});

	it('should return 0 for single root node', () => {
		const { tree } = parseAndBuildTree('Home');
		expect(getMaxDepth(tree)).toBe(0);
	});

	it('should return 0 for empty tree', () => {
		expect(getMaxDepth([])).toBe(0);
	});
});

describe('parser options', () => {
	it('should use default options when none provided', () => {
		expect(DEFAULT_PARSER_OPTIONS).toEqual({
			generateIds: true,
			indentSize: 4,
			skipEmptyLines: true,
			trimLabels: true,
		});
	});

	it('should allow disabling label trimming', () => {
		const input = `├──   Padded Label   `;
		const result = parseTreeText(input, { trimLabels: false });

		// When trimLabels is false, leading whitespace (indentation) is still removed,
		// but trailing whitespace is preserved
		expect(result.nodes[0].label).toBe('Padded Label   ');
	});
});

describe('real-world examples', () => {
	it('should parse a typical website sitemap', () => {
		const input = `Website
├── Home
├── Products
│   ├── Category A
│   │   ├── Product 1
│   │   └── Product 2
│   └── Category B
│       └── Product 3
├── About
│   ├── Our Story
│   ├── Team
│   └── Careers
├── Blog
│   ├── Latest Posts
│   └── Archives
└── Contact
    ├── Form
    └── Location`;

		const result = parseTreeText(input);

		expect(result.success).toBe(true);
		// Count: Website, Home, Products, Category A, Product 1, Product 2,
		// Category B, Product 3, About, Our Story, Team, Careers, Blog,
		// Latest Posts, Archives, Contact, Form, Location = 18
		expect(result.nodes).toHaveLength(18);

		const { tree } = parseAndBuildTree(input);
		expect(tree).toHaveLength(1);
		expect(tree[0].label).toBe('Website');
		expect(tree[0].children).toHaveLength(5); // Home, Products, About, Blog, Contact
	});

	it('should parse a mobile app structure', () => {
		const input = `App
├── Authentication
│   ├── Login Screen
│   ├── Register Screen
│   └── Forgot Password
├── Dashboard
│   ├── Overview
│   ├── Charts
│   └── Quick Actions
├── Profile
│   ├── Settings
│   └── Preferences
└── Notifications`;

		const result = parseTreeText(input);

		expect(result.success).toBe(true);
		// Count: App, Authentication, Login Screen, Register Screen, Forgot Password,
		// Dashboard, Overview, Charts, Quick Actions, Profile, Settings, Preferences,
		// Notifications = 13
		expect(result.nodes).toHaveLength(13);
	});
});
