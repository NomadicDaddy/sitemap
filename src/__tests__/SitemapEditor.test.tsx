/**
 * SitemapEditor Component Unit Tests
 *
 * Comprehensive tests for the SitemapEditor React component that provides
 * real-time sitemap visualization with an onChange handler.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { SitemapEditor } from '../components/SitemapEditor';
import { type ParseError } from '../types/TreeNode';

// ============================================================================
// Tests
// ============================================================================

describe('SitemapEditor', () => {
	describe('rendering', () => {
		it('should render textarea and preview sections', () => {
			render(<SitemapEditor />);

			expect(screen.getByRole('textbox')).toBeInTheDocument();
			expect(screen.getByRole('region', { name: /preview/i })).toBeInTheDocument();
		});

		it('should render with initial value', () => {
			render(<SitemapEditor initialValue={'Home\n├── About\n└── Contact'} />);

			const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
			expect(textarea.value).toContain('Home');
			expect(textarea.value).toContain('About');
			expect(textarea.value).toContain('Contact');
		});

		it('should display placeholder text when empty', () => {
			const placeholder = 'Enter your sitemap...';
			render(<SitemapEditor placeholder={placeholder} />);

			expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
		});

		it('should apply custom className', () => {
			const { container } = render(<SitemapEditor className="my-editor" />);

			expect(container.querySelector('.sitemap-editor')).toHaveClass('my-editor');
		});

		it('should set correct number of rows on textarea', () => {
			render(<SitemapEditor rows={15} />);

			const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
			expect(textarea.getAttribute('rows')).toBe('15');
		});
	});

	describe('real-time preview', () => {
		it('should update preview instantly when typing', async () => {
			const { container } = render(<SitemapEditor />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'Home' } });

			// Check that the text appears in the preview tree
			const previewNode = container.querySelector('.tree-node-text');
			expect(previewNode).toHaveTextContent('Home');
		});

		it('should parse tree structure and display in preview', async () => {
			const { container } = render(<SitemapEditor />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, {
				target: { value: 'Website\n├── About\n└── Contact' },
			});

			// Check all nodes are in the preview
			const nodeTexts = container.querySelectorAll('.tree-node-text');
			const labels = Array.from(nodeTexts).map((el) => el.textContent);
			expect(labels).toContain('Website');
			expect(labels).toContain('About');
			expect(labels).toContain('Contact');
		});

		it('should update preview on every keystroke', async () => {
			const { container } = render(<SitemapEditor />);

			const textarea = screen.getByRole('textbox');

			// Type incrementally
			fireEvent.change(textarea, { target: { value: 'H' } });
			expect(container.querySelector('.tree-node-text')).toHaveTextContent('H');

			fireEvent.change(textarea, { target: { value: 'Ho' } });
			expect(container.querySelector('.tree-node-text')).toHaveTextContent('Ho');

			fireEvent.change(textarea, { target: { value: 'Home' } });
			expect(container.querySelector('.tree-node-text')).toHaveTextContent('Home');
		});

		it('should display empty state message when no nodes', async () => {
			render(<SitemapEditor />);

			await waitFor(() => {
				expect(screen.getByText('No nodes to display')).toBeInTheDocument();
			});
		});
	});

	describe('error display', () => {
		it('should display parsing errors when showErrors is true', async () => {
			const { container } = render(<SitemapEditor showErrors />);

			const textarea = screen.getByRole('textbox');
			// Invalid depth jump should cause an error
			fireEvent.change(textarea, { target: { value: 'Root\n│   │   └── TooDeep' } });

			// Check that errors are displayed
			await waitFor(() => {
				const errorSection = container.querySelector('.sitemap-editor-errors');
				expect(errorSection).toBeInTheDocument();
			});
		});

		it('should hide errors when showErrors is false', async () => {
			const { container } = render(<SitemapEditor showErrors={false} />);

			const textarea = screen.getByRole('textbox');
			// Invalid depth jump
			fireEvent.change(textarea, { target: { value: 'Root\n│   │   └── TooDeep' } });

			// The error section should not be in the DOM
			const errorSection = container.querySelector('.sitemap-editor-errors');
			expect(errorSection).not.toBeInTheDocument();
		});

		it('should clear errors when input becomes valid', async () => {
			const { container } = render(<SitemapEditor showErrors />);

			const textarea = screen.getByRole('textbox');

			// First set invalid input (depth jump)
			fireEvent.change(textarea, { target: { value: 'Root\n│   │   └── TooDeep' } });

			// Verify errors are shown
			await waitFor(() => {
				const errorSection = container.querySelector('.sitemap-editor-errors');
				expect(errorSection).toBeInTheDocument();
			});

			// Then set valid input
			fireEvent.change(textarea, { target: { value: 'Root\n├── Child' } });

			// Errors should be cleared
			await waitFor(() => {
				const errorSection = container.querySelector('.sitemap-editor-errors');
				expect(errorSection).not.toBeInTheDocument();
			});
		});
	});

	describe('statistics display', () => {
		it('should show stats when showStats is true', () => {
			const { container } = render(<SitemapEditor showStats />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'Root\n├── Child 1\n└── Child 2' } });

			const statsSection = container.querySelector('.sitemap-editor-stats');
			expect(statsSection).toBeInTheDocument();
			expect(statsSection).toHaveTextContent('Nodes:');
			expect(statsSection).toHaveTextContent('3');
			expect(statsSection).toHaveTextContent('Max Depth:');
		});

		it('should hide stats when showStats is false', () => {
			render(<SitemapEditor showStats={false} initialValue="Root" />);

			expect(screen.queryByText(/Nodes:/)).not.toBeInTheDocument();
			expect(screen.queryByText(/Max Depth:/)).not.toBeInTheDocument();
		});

		it('should update stats in real-time', () => {
			const { container } = render(<SitemapEditor showStats />);

			const textarea = screen.getByRole('textbox');
			const statsSection = container.querySelector('.sitemap-editor-stats');

			// Add nodes one by one
			fireEvent.change(textarea, { target: { value: 'Root' } });
			expect(statsSection).toHaveTextContent('1'); // 1 node

			fireEvent.change(textarea, { target: { value: 'Root\n├── Child' } });
			expect(statsSection).toHaveTextContent('2'); // 2 nodes
		});
	});

	describe('preview visibility', () => {
		it('should show preview by default', () => {
			render(<SitemapEditor />);

			expect(screen.getByRole('region', { name: /preview/i })).toBeInTheDocument();
		});

		it('should hide preview when showPreview is false', () => {
			render(<SitemapEditor showPreview={false} />);

			expect(screen.queryByRole('region', { name: /preview/i })).not.toBeInTheDocument();
		});
	});

	describe('disabled state', () => {
		it('should disable textarea when disabled prop is true', () => {
			render(<SitemapEditor disabled />);

			const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
			expect(textarea).toBeDisabled();
		});

		it('should not be disabled by default', () => {
			render(<SitemapEditor />);

			const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
			expect(textarea).not.toBeDisabled();
		});
	});

	describe('callbacks', () => {
		it('should call onTreeChange when tree changes', async () => {
			const handleTreeChange = jest.fn();
			render(<SitemapEditor onTreeChange={handleTreeChange} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'Root' } });

			await waitFor(() => {
				expect(handleTreeChange).toHaveBeenCalled();
				const [tree, success] =
					handleTreeChange.mock.calls[handleTreeChange.mock.calls.length - 1];
				expect(tree).toHaveLength(1);
				expect(tree[0].label).toBe('Root');
				expect(success).toBe(true);
			});
		});

		it('should call onErrorsChange when errors change', async () => {
			const handleErrorsChange = jest.fn();
			render(<SitemapEditor onErrorsChange={handleErrorsChange} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: '├── Orphaned' } });

			await waitFor(() => {
				expect(handleErrorsChange).toHaveBeenCalled();
			});
		});

		it('should call onInputChange when input changes', () => {
			const handleInputChange = jest.fn();
			render(<SitemapEditor onInputChange={handleInputChange} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'New Value' } });

			expect(handleInputChange).toHaveBeenCalledWith('New Value');
		});
	});

	describe('tree props', () => {
		it('should pass treeProps to BasicTree', () => {
			const handleNodeClick = jest.fn();
			const { container } = render(
				<SitemapEditor initialValue="Root" treeProps={{ onNodeClick: handleNodeClick }} />
			);

			// Click on the tree node label in the preview
			const nodeLabel = container.querySelector('.tree-node-label');
			fireEvent.click(nodeLabel!);
			expect(handleNodeClick).toHaveBeenCalled();
		});

		it('should apply custom indentSize from treeProps', () => {
			const { container } = render(<SitemapEditor treeProps={{ indentSize: 40 }} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'Root\n├── Child' } });

			const childNode = container.querySelector(
				'[data-node-id="node-2"] > .tree-node-label'
			) as HTMLElement;
			expect(childNode.style.paddingLeft).toBe('52px'); // 1 * 40 + 12
		});
	});

	describe('parser options', () => {
		it('should pass parser options to the hook', () => {
			const { container } = render(<SitemapEditor parserOptions={{ indentSize: 2 }} />);

			const textarea = screen.getByRole('textbox');
			// 2-space indent should work with custom parser options
			fireEvent.change(textarea, { target: { value: 'Root\n  Child' } });

			// Child should be parsed as depth 1 - check it exists in preview
			const nodeTexts = container.querySelectorAll('.tree-node-text');
			const labels = Array.from(nodeTexts).map((el) => el.textContent);
			expect(labels).toContain('Root');
			expect(labels).toContain('Child');
		});
	});

	describe('custom renderers', () => {
		it('should use custom renderErrors function', () => {
			const customRenderErrors = (errors: ParseError[]) => (
				<div data-testid="custom-errors">
					{errors.map((e, i) => (
						<span key={i}>Custom Error: {e.message}</span>
					))}
				</div>
			);

			render(<SitemapEditor showErrors renderErrors={customRenderErrors} />);

			const textarea = screen.getByRole('textbox');
			// Use input that causes an actual error
			fireEvent.change(textarea, { target: { value: 'Root\n│   │   └── TooDeep' } });

			expect(screen.getByTestId('custom-errors')).toBeInTheDocument();
		});

		it('should use custom renderStats function', () => {
			const customRenderStats = (nodeCount: number, maxDepth: number) => (
				<div data-testid="custom-stats">
					Custom Nodes: {nodeCount}, Custom Depth: {maxDepth}
				</div>
			);

			render(<SitemapEditor showStats renderStats={customRenderStats} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'Root\n├── Child' } });

			expect(screen.getByTestId('custom-stats')).toBeInTheDocument();
			expect(screen.getByText('Custom Nodes: 2, Custom Depth: 1')).toBeInTheDocument();
		});
	});

	describe('accessibility', () => {
		it('should have proper aria-label on textarea', () => {
			render(<SitemapEditor textareaLabel="Sitemap Structure" />);

			expect(screen.getByLabelText('Sitemap Structure')).toBeInTheDocument();
		});

		it('should have proper aria-label on preview', () => {
			render(<SitemapEditor previewLabel="Tree Preview" />);

			expect(screen.getByRole('region', { name: 'Tree Preview' })).toBeInTheDocument();
		});

		it('should set aria-invalid when there are errors', () => {
			render(<SitemapEditor />);

			const textarea = screen.getByRole('textbox');
			// Input that causes actual errors (depth jump)
			fireEvent.change(textarea, { target: { value: 'Root\n│   │   └── TooDeep' } });
			expect(textarea).toHaveAttribute('aria-invalid', 'true');
		});

		it('should set aria-invalid to false when valid', () => {
			render(<SitemapEditor initialValue="Root" />);

			const textarea = screen.getByRole('textbox');
			expect(textarea).toHaveAttribute('aria-invalid', 'false');
		});

		it('should disable spellcheck on textarea', () => {
			render(<SitemapEditor />);

			const textarea = screen.getByRole('textbox');
			expect(textarea).toHaveAttribute('spellCheck', 'false');
		});
	});

	describe('complex interactions', () => {
		it('should handle rapid typing', async () => {
			const { container } = render(<SitemapEditor />);

			const textarea = screen.getByRole('textbox');
			const values = [
				'H',
				'Ho',
				'Hom',
				'Home',
				'Home\n',
				'Home\n├',
				'Home\n├──',
				'Home\n├── About',
			];

			for (const value of values) {
				fireEvent.change(textarea, { target: { value } });
			}

			const nodeTexts = container.querySelectorAll('.tree-node-text');
			const labels = Array.from(nodeTexts).map((el) => el.textContent);
			expect(labels).toContain('Home');
			expect(labels).toContain('About');
		});

		it('should handle clearing and re-entering text', async () => {
			const { container } = render(<SitemapEditor initialValue="Initial" />);

			const textarea = screen.getByRole('textbox');

			// Clear
			fireEvent.change(textarea, { target: { value: '' } });

			// Wait for the empty state to appear
			await waitFor(() => {
				expect(screen.getByText('No nodes to display')).toBeInTheDocument();
			});

			// Re-enter
			fireEvent.change(textarea, { target: { value: 'New Content' } });

			// Wait for the new content to appear
			await waitFor(() => {
				const nodeText = container.querySelector('.tree-node-text');
				expect(nodeText).toHaveTextContent('New Content');
			});
		});

		it('should handle complex sitemap structures', () => {
			const complexSitemap = `Website
├── Home
│   ├── Hero Section
│   └── Features
├── Products
│   ├── Category A
│   │   ├── Product 1
│   │   └── Product 2
│   └── Category B
└── Contact
    ├── Form
    └── Map`;

			const { container } = render(<SitemapEditor initialValue={complexSitemap} showStats />);

			// All nodes should be rendered in preview
			const nodeTexts = container.querySelectorAll('.tree-node-text');
			const labels = Array.from(nodeTexts).map((el) => el.textContent);
			expect(labels).toContain('Website');
			expect(labels).toContain('Hero Section');
			expect(labels).toContain('Product 1');
			expect(labels).toContain('Map');

			// Stats should be correct
			const statsSection = container.querySelector('.sitemap-editor-stats');
			expect(statsSection).toHaveTextContent('12'); // 12 nodes
		});
	});

	describe('labels', () => {
		it('should display custom textarea label', () => {
			render(<SitemapEditor textareaLabel="Enter Structure" />);

			expect(screen.getByText('Enter Structure')).toBeInTheDocument();
		});

		it('should display custom preview label', () => {
			render(<SitemapEditor previewLabel="Visualization" />);

			expect(screen.getByText('Visualization')).toBeInTheDocument();
		});
	});
});
