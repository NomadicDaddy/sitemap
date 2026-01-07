# UX Sitemap Visualizer

A powerful web-based tool that transforms text-based tree structures into beautiful, interactive visualizations for UX/product design documentation.

## Features

### Core Functionality

- **Tree Parsing**: Convert indented text into structured hierarchical trees
- **Real-time Preview**: See visual updates instantly as you type
- **Multiple Visualizations**: Choose from tree, D3 diagram, or flowchart layouts
- **Error Detection**: Get instant feedback on malformed tree structures

### Interactive Features

- **Node Selection & Expansion**: Click to select nodes, expand/collapse branches
- **Inline Editing**: Double-click nodes to edit labels directly
- **Keyboard Navigation**: Navigate trees efficiently with arrow keys
- **Search & Filter**: Quickly find nodes across the entire tree

### Version Management

- **Save Versions**: Store multiple tree versions locally
- **Compare Changes**: Visual diff viewer highlights added/removed/modified nodes
- **Version History**: Track and restore previous iterations

### Export Options

- **PNG Export**: Download high-quality raster images
- **SVG Export**: Export scalable vector graphics for editing
- **Text Export**: Copy tree structure as text

### Performance

- **Virtualization**: Handle large trees (1000+ nodes) efficiently
- **Optimized Rendering**: Smooth scrolling and interactions
- **Lazy Loading**: Only render visible nodes

## Installation

### Prerequisites

- Bun >= 1.1.30
- Node.js compatible environment

### Install Dependencies

```bash
bun install
```

## Getting Started

### Development Server

Start the development server:

```bash
bun run dev
```

The demo application will be available at `http://localhost:5173`

### Basic Usage

```tsx
import { SitemapEditor } from 'ux-sitemap-visualizer';

function App() {
	const sampleTree = `
Home
├── About
│   ├── Team
│   └── History
└── Services
    ├── Design
    └── Development
  `;

	return (
		<SitemapEditor
			initialValue={sampleTree}
			onTreeChange={(tree, success) => console.log(tree, success)}
			showStats={true}
			showErrors={true}
		/>
	);
}
```

## Components

### SitemapEditor

Full-featured editor with real-time preview.

```tsx
import { SitemapEditor } from 'ux-sitemap-visualizer';

<SitemapEditor
	initialValue="your tree text here"
	onTreeChange={(tree, success) => {}}
	onInputChange={(value) => {}}
	showStats={true}
	showErrors={true}
/>;
```

### BasicTree

Simple hierarchical tree display.

```tsx
import { BasicTree } from 'ux-sitemap-visualizer';
import type { TreeNode } from 'ux-sitemap-visualizer';

<BasicTree tree={treeData} />;
```

### SelectableTree

Interactive tree with selection and expansion.

```tsx
import { SelectableTree } from 'ux-sitemap-visualizer';

<SelectableTree
	tree={treeData}
	onNodeSelect={(node) => console.log(node)}
	onNodeToggle={(node, isExpanded) => {}}
/>;
```

### D3TreeDiagram

D3.js-powered interactive visualization.

```tsx
import { D3TreeDiagram } from 'ux-sitemap-visualizer';

<D3TreeDiagram tree={treeData} width={800} height={600} />;
```

### FlowchartDiagram

Flowchart-style tree using React Flow.

```tsx
import { FlowchartDiagram } from 'ux-sitemap-visualizer';

<FlowchartDiagram tree={treeData} direction="vertical" />;
```

### VirtualizedTree

Performance-optimized for large datasets.

```tsx
import { VirtualizedTree } from 'ux-sitemap-visualizer';

<VirtualizedTree tree={largeTreeData} itemHeight={32} estimatedSize={1000} />;
```

### SearchableTree

Tree with built-in search functionality.

```tsx
import { SearchableTree } from 'ux-sitemap-visualizer';

<SearchableTree tree={treeData} onSearch={(query) => {}} placeholder="Search nodes..." />;
```

### DiffViewer

Side-by-side tree comparison.

```tsx
import { DiffViewer } from 'ux-sitemap-visualizer';

<DiffViewer treeA={oldTree} treeB={newTree} />;
```

### VersionManager

Save and manage tree versions.

```tsx
import { VersionManager } from 'ux-sitemap-visualizer';

<VersionManager tree={treeData} onSave={(name) => {}} onLoad={(version) => {}} />;
```

## Tree Format

The library supports various indented text formats:

```
Home
├── About
│   ├── Team
│   └── History
└── Services
    ├── Design
    └── Development
```

Alternative formats:

```
Home
- About
  - Team
  - History
- Services
  - Design
  - Development
```

Or simple indentation:

```
Home
  About
    Team
    History
  Services
    Design
    Development
```

## Keyboard Shortcuts

- **Arrow Down**: Navigate to next node
- **Arrow Up**: Navigate to previous node
- **Arrow Right**: Expand node (if has children)
- **Arrow Left**: Collapse node (if expanded)
- **Enter**: Edit node label
- **Escape**: Cancel edit / Close modal
- **Ctrl/Cmd + F**: Focus search input

## Hooks

### useTreeParser

Parse tree text with validation.

```tsx
import { useTreeParser } from 'ux-sitemap-visualizer';

const { tree, errors, isValid } = useTreeParser(treeText, {
	validate: true,
	onError: (error) => console.error(error),
});
```

### useTreeComparison

Compare two tree structures.

```tsx
import { useTreeComparison } from 'ux-sitemap-visualizer';

const { differences, summary } = useTreeComparison(treeA, treeB);
```

### useTreeSearch

Search across tree nodes.

```tsx
import { useTreeSearch } from 'ux-sitemap-visualizer';

const { results, query, setQuery } = useTreeSearch(tree);
```

### useTreeKeyboardNavigation

Keyboard navigation support.

```tsx
import { useTreeKeyboardNavigation } from 'ux-sitemap-visualizer';

const { focusedNode, handleKeyDown } = useTreeKeyboardNavigation(tree);
```

### useTreeNodeEditing

Inline editing state management.

```tsx
import { useTreeNodeEditing } from 'ux-sitemap-visualizer';

const { editingNode, startEdit, saveEdit, cancelEdit } = useTreeNodeEditing();
```

## Utilities

### parseTreeText

Parse indented text into TreeNode hierarchy.

```tsx
import { parseTreeText } from 'ux-sitemap-visualizer';

const tree = parseTreeText(text);
```

### generateSitemapText

Generate sample sitemaps for testing.

```tsx
import { generateSitemapText } from 'ux-sitemap-visualizer';

const text = generateSitemapText({ breadth: 3, depth: 3 });
```

### compareTrees

Compare two tree structures.

```tsx
import { compareTrees } from 'ux-sitemap-visualizer';

const differences = compareTrees(treeA, treeB);
```

## Theming

Customize appearance with the theme system:

```tsx
import { createTheme } from 'ux-sitemap-visualizer';

const customTheme = createTheme({
	depthColors: {
		0: '#3B82F6',
		1: '#10B981',
		2: '#F59E0B',
	},
	typography: {
		fontSize: 14,
		lineHeight: 1.5,
	},
	spacing: {
		node: 8,
		level: 16,
	},
});
```

## Development

### Available Scripts

```bash
# Development
bun run dev          # Start dev server
bun run start         # Alias for dev

# Build
bun run build         # Build for production

# Testing
bun run test          # Run Jest tests
bun run test:watch    # Run tests in watch mode
bun run test:coverage # Run tests with coverage

# Code Quality
bun run lint          # Run ESLint
bun run lint:fix      # Fix ESLint issues
bun run typecheck     # TypeScript type checking
bun run format        # Format with Prettier

# Quality Check
bun run smoke:qc      # Run all quality checks
```

### Quality Standards

This project maintains high code quality standards:

- **Zero TypeScript errors** (strict mode enabled)
- **Zero ESLint errors** (zero warnings policy)
- **Comprehensive test coverage** (90%+ target)
- **Formatted with Prettier** (consistent style)

### Project Structure

```
src/
├── components/       # React components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript types
├── theme/           # Theme system
├── styles/          # Global styles
└── __tests__/       # Test files
```

## API Reference

### Components

- [SitemapEditor](#sitemapeditor)
- [BasicTree](#basictree)
- [SelectableTree](#selectabletree)
- [D3TreeDiagram](#d3treediagram)
- [FlowchartDiagram](#flowchartdiagram)
- [VirtualizedTree](#virtualizedtree)
- [SearchableTree](#searchabletree)
- [DiffViewer](#diffviewer)
- [VersionManager](#versionmanager)
- [ExportButton](#exportbutton)
- [KeyboardShortcutsHelp](#keyboardshortcutshelp)

### Hooks

- [useTreeParser](#usetreeparser)
- [useTreeComparison](#usetreecomparison)
- [useTreeSearch](#usetreesearch)
- [useTreeKeyboardNavigation](#usetreekeyboardnavigation)
- [useTreeNodeEditing](#usetreenodeediting)
- [useDebounce](#usedebounce)

### Utilities

- [parseTreeText](#parsetreetext)
- [buildTreeHierarchy](#buildtreehierarchy)
- [compareTrees](#comparetrees)
- [generateSitemapText](#generatesitemaptext)
- [areTreesIdentical](#aretreesidentical)
- [hashTree](#hashtree)

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
bun install
bun run build
```

### Tests Fail

```bash
# Run tests in watch mode to see details
bun run test:watch
```

### Type Errors

```bash
# Check TypeScript
bun run typecheck
# Review tsconfig.json settings
```

### Linting Errors

```bash
# Auto-fix issues
bun run lint:fix
# Review remaining issues manually
bun run lint
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run quality checks: `bun run smoke:qc`
5. Commit your changes
6. Push to the branch
7. Create a Pull Request

## License

MIT

## Support

For issues, questions, or contributions, please visit the project repository.

## Roadmap

- [ ] Collaborative editing
- [ ] Advanced diff visualization
- [ ] Custom node styling
- [ ] Plugin system
- [ ] Real-time sync
- [ ] Import/export from other tools
- [ ] Advanced search (regex, wildcards)
- [ ] Version branching
- [ ] Analytics and metrics

## Acknowledgments

Built with:

- [React](https://react.dev/)
- [D3.js](https://d3js.org/)
- [React Flow](https://reactflow.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
