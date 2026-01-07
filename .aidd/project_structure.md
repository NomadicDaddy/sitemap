# UX Sitemap Visualizer - Project Structure

## Overview

This is a React-based library for visualizing and editing hierarchical sitemap structures. The application transforms text-based tree structures into interactive visualizations for UX/product design documentation.

## Technology Stack

### Core Technologies

- **React 19.2.3**: UI framework with modern hooks and concurrent features
- **TypeScript 5.9.3**: Type-safe development with strict mode enabled
- **Vite 7.3.0**: Fast build tool and dev server
- **Bun**: Runtime and package manager (>=1.1.30 required)

### Visualization Libraries

- **D3.js 7.9.0**: Data visualization for D3TreeDiagram component
- **React Flow (@xyflow/react) 12.10.0**: Flowchart-style tree visualization
- **React Window 2.2.3**: Virtualization for large datasets

### Styling

- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS processing
- **Autoprefixer 10.4.23**: CSS vendor prefixes

### Testing

- **Jest 30.2.0**: Unit testing framework
- **React Testing Library 16.3.1**: Component testing utilities
- **Playwright 1.57.0**: End-to-end testing framework
- **Babel 7.28.5**: JavaScript transpiler for Jest

### Code Quality

- **ESLint 9.39.2**: Linting with TypeScript support
- **Prettier 3.7.4**: Code formatting
- **TypeScript ESLint 8.50.0**: ESLint plugins for TypeScript

## Directory Structure

```
/
├── .aidd/                          # AI development infrastructure
│   ├── spec.txt                   # Application specification
│   ├── feature_list.json          # Feature tracking with test cases
│   ├── progress.md                # Development progress tracking
│   └── project_structure.md       # This file
├── .git/                          # Git version control
├── .windsurf/                     # Windsurf AI IDE configuration
│   ├── rules/                     # Development rules and best practices
│   └── workflows/                 # AI workflow configurations
├── dist/                          # Build output directory
├── node_modules/                  # Dependencies
├── public/                        # Static assets
├── src/                           # Source code
│   ├── __tests__/                 # Test files
│   │   ├── BasicTree.test.tsx     # BasicTree component tests
│   │   ├── D3TreeDiagram.test.tsx # D3 diagram tests
│   │   ├── InlineEditInput.test.tsx # Inline editing tests
│   │   ├── parserErrors.test.ts   # Parser error detection tests
│   │   ├── pngExport.test.ts      # PNG export functionality tests
│   │   ├── ResponsiveCardGrid.test.tsx # Responsive grid tests
│   │   ├── SelectableTree.test.tsx # Selectable tree tests
│   │   ├── SitemapEditor.test.tsx # Editor component tests
│   │   ├── sitemapGenerator.test.ts # Sitemap generation tests
│   │   ├── svgExport.test.ts      # SVG export functionality tests
│   │   ├── treeComparison.test.ts # Tree comparison tests
│   │   ├── TreeNode.test.ts       # TreeNode type and utility tests
│   │   ├── treeOperations.test.ts # Tree manipulation tests
│   │   ├── treeParser.test.ts     # Tree parsing tests
│   │   ├── treeSearch.test.ts     # Tree search functionality tests
│   │   ├── useTreeNodeEditing.test.ts # Editing hook tests
│   │   ├── useTreeParser.test.ts  # Parser hook tests
│   │   └── versionStorage.test.ts # Version management tests
│   ├── components/                # React components
│   │   ├── BasicTree.tsx          # Simple hierarchical tree visualization
│   │   ├── D3TreeDiagram.tsx      # D3.js-based tree visualization
│   │   ├── DiffViewer.tsx         # Side-by-side tree comparison
│   │   ├── ExportButton.tsx       # PNG/SVG export functionality
│   │   ├── FlowchartDiagram.tsx   # Flowchart-style tree using React Flow
│   │   ├── HorizontalNavBar.tsx   # Navigation bar component
│   │   ├── InlineEditInput.tsx    # Editable node label input
│   │   ├── KeyboardShortcutsHelp.tsx # Keyboard shortcuts documentation
│   │   ├── ResponsiveCardGrid.tsx # Responsive grid layout
│   │   ├── SearchableTree.tsx     # Tree with search capabilities
│   │   ├── SearchPanel.tsx        # Search interface component
│   │   ├── SelectableTree.tsx     # Interactive tree with selection
│   │   ├── SitemapEditor.tsx      # Full-featured editor with preview
│   │   ├── SitemapEditorWithComparison.tsx # Editor with diff view
│   │   ├── TreeNodeComponent.tsx  # Individual tree node component
│   │   ├── TreeNodeUtils.ts       # Tree node utility functions
│   │   ├── VersionManager.tsx     # Version save/restore interface
│   │   ├── VirtualizedTree.tsx    # Performance-optimized large tree
│   │   └── index.ts               # Component exports
│   ├── hooks/                     # Custom React hooks
│   │   ├── useDebounce.ts         # Debounce utility hook
│   │   ├── useTreeComparison.ts   # Tree comparison hook
│   │   ├── useTreeKeyboardNavigation.ts # Keyboard navigation hook
│   │   ├── useTreeNodeEditing.ts  # Node editing state management
│   │   ├── useTreeParser.ts       # Tree parsing hook
│   │   ├── useTreeSearch.ts       # Tree search hook
│   │   └── index.ts               # Hook exports
│   ├── styles/                    # Global styles and CSS
│   ├── theme/                     # Theming system
│   ├── types/                     # TypeScript type definitions
│   │   └── TreeNode.ts            # Core tree data structures
│   ├── utils/                     # Utility functions
│   │   ├── index.ts               # Utility exports
│   │   ├── parserErrors.ts        # Error detection and formatting
│   │   ├── pngExport.ts           # PNG export functionality
│   │   ├── sitemapGenerator.ts    # Sample sitemap generation
│   │   ├── svgExport.ts           # SVG export functionality
│   │   ├── treeComparison.ts      # Tree comparison logic
│   │   ├── treeFlattening.ts      # Tree flattening utilities
│   │   ├── treeOperations.ts     # Tree manipulation operations
│   │   ├── treeParser.ts          # Tree text parsing logic
│   │   ├── treeSearch.ts          # Tree search algorithms
│   │   └── versionStorage.ts      # LocalStorage version management
│   ├── demo.tsx                   # Development demo entry point
│   ├── DemoApp.tsx                # Demo application component
│   ├── index.ts                   # Main library exports
│   └── setupTests.ts              # Jest test setup
├── test-results/                  # Jest test coverage reports
├── .editorconfig                  # Editor configuration
├── .eslintrc.json                 # ESLint configuration
├── .gitattributes                 # Git attributes
├── .gitignore                     # Git ignore patterns
├── .prettierignore                # Prettier ignore patterns
├── .prettierrc                    # Prettier configuration
├── babel.config.cjs               # Babel configuration
├── CLAUDE.md                      # Code quality and architectural rules
├── index.html                     # HTML entry point
├── jest.config.cjs                # Jest configuration
├── package.json                   # Project metadata and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite configuration
```

## Core Components

### Tree Visualization Components

- **BasicTree**: Simple, lightweight tree display
- **SelectableTree**: Interactive tree with selection and expansion
- **VirtualizedTree**: Optimized for large datasets with 1000+ nodes
- **D3TreeDiagram**: D3.js-powered interactive visualization
- **FlowchartDiagram**: Flowchart layout using React Flow

### Editor Components

- **SitemapEditor**: Main editor with real-time preview
- **SitemapEditorWithComparison**: Editor with integrated version comparison
- **InlineEditInput**: Inline editing for node labels
- **SearchPanel**: Search interface for filtering nodes

### Comparison & Versioning

- **DiffViewer**: Visual comparison between two tree versions
- **VersionManager**: Save/load/manage tree versions
- **useTreeComparison**: Hook for comparing tree structures

### Utility Components

- **ExportButton**: PNG/SVG export functionality
- **KeyboardShortcutsHelp**: Documentation for keyboard shortcuts
- **ResponsiveCardGrid**: Responsive grid layout wrapper

## Core Utilities

### Tree Parsing (`utils/treeParser.ts`)

- Parse indented text into TreeNode hierarchy
- Support for multiple tree character formats
- Error detection for malformed structures
- Validation utilities

### Tree Operations (`utils/treeOperations.ts`)

- Add/remove nodes
- Move nodes within tree
- Flatten tree to array
- Reconstruct tree from flattened array

### Tree Comparison (`utils/treeComparison.ts`)

- Compare two tree structures
- Identify added/removed/modified nodes
- Generate diff summary
- Hash-based comparison

### Tree Search (`utils/treeSearch.ts`)

- Search nodes by label
- Filter nodes based on criteria
- Navigate search results
- Highlight matches

### Export Functions

- **pngExport.ts**: Export tree as PNG image
- **svgExport.ts**: Export tree as SVG vector graphics

### Version Management (`utils/versionStorage.ts`)

- Save versions to LocalStorage
- Load/delete versions
- Export/import version snapshots
- Version metadata management

### Error Handling (`utils/parserErrors.ts`)

- Detect indentation errors
- Detect orphaned branches
- Detect mixed indentation
- Format error messages

## Custom Hooks

### `useTreeParser`

- Parse tree text with validation
- Handle parse errors
- Parse result management

### `useTreeKeyboardNavigation`

- Keyboard navigation support
- Arrow key navigation
- Expand/collapse with keyboard
- Focus management

### `useTreeNodeEditing`

- Inline editing state
- Save/cancel edit handlers
- Edit mode toggle

### `useTreeComparison`

- Compare two trees
- Track differences
- Compute diff statistics

### `useTreeSearch`

- Search functionality
- Filter nodes
- Navigate results
- Highlight matches

## Type Definitions

### TreeNode (`types/TreeNode.ts`)

```typescript
interface TreeNode {
	id: string;
	label: string;
	children?: TreeNode[];
	depth: number;
	expanded?: boolean;
	selected?: boolean;
	metadata?: NodeMetadata;
}
```

### ParseResult

- Parsed tree data
- Parse errors
- Validation status

### ComparisonResult

- Added nodes
- Removed nodes
- Modified nodes
- Diff summary

### SitemapVersion

- Version name
- Tree data
- Timestamp
- Metadata

## Build & Development Scripts

### Available Scripts

- `bun run build`: TypeScript compilation for production
- `bun run dev`: Start Vite development server
- `bun run start`: Alias for dev
- `bun run test`: Run Jest tests
- `bun run test:watch`: Run tests in watch mode
- `bun run test:coverage`: Run tests with coverage report
- `bun run lint`: ESLint check (zero errors, zero warnings)
- `bun run lint:fix`: Auto-fix linting issues
- `bun run typecheck`: TypeScript type checking
- `bun run format`: Format code with Prettier
- `bun run smoke:qc`: Comprehensive quality check (lint, typecheck, format, build, test)

## Key Features Implemented

### Parser & Generation

- ✅ Text-based tree parsing
- ✅ Multiple tree character formats
- ✅ Error detection and reporting
- ✅ Sample sitemap generation

### Visual Components

- ✅ Basic tree visualization
- ✅ Selectable tree with expansion
- ✅ D3 tree diagram
- ✅ Flowchart diagram
- ✅ Virtualized tree for large datasets
- ✅ Searchable tree

### Editing

- ✅ Real-time preview editor
- ✅ Inline node editing
- ✅ Keyboard navigation
- ✅ Copy/paste support

### Comparison & Versioning

- ✅ Tree comparison
- ✅ Diff viewer
- ✅ Version manager
- ✅ LocalStorage persistence

### Export

- ✅ PNG export
- ✅ SVG export

### Testing

- ✅ Comprehensive unit tests
- ✅ Component tests
- ✅ Export functionality tests
- ✅ Coverage reporting

### Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Prettier formatting
- ✅ Automated quality checks

## Known Issues & Technical Debt

### Testing

- E2E tests with Playwright need implementation
- Some components may need additional edge case coverage
- Integration tests for complex workflows

### Performance

- Virtualized tree may need optimization for 5000+ nodes
- D3 diagram may have performance issues with very deep trees
- Tree comparison could be optimized for large trees

### Features

- Advanced diff visualization (not side-by-side)
- Custom node styling
- Collaborative editing
- Import/export of version snapshots with metadata
- Advanced search filters (regex, wildcards, etc.)

### Documentation

- README.md needs creation
- API documentation for all components
- Usage examples for common patterns
- Migration guide from other sitemap tools

## Configuration Files

### TypeScript (`tsconfig.json`)

- Strict mode enabled
- ES2020 target
- Module resolution: bundler
- Path aliases configured

### Vite (`vite.config.ts`)

- React plugin configured
- Development server settings
- Build optimizations

### Jest (`jest.config.cjs`)

- jsdom environment
- TypeScript support
- Coverage thresholds configured

### Tailwind (`tailwind.config.js`)

- Custom theme configuration
- Plugin setup
- Content paths

### ESLint (`eslint.config.js`)

- TypeScript parser
- React plugins
- Prettier integration
- Custom rules

## Development Workflow

### Quality Verification

1. Run `bun run format` - Format code
2. Run `bun run lint:fix` - Fix linting issues
3. Run `bun run typecheck` - TypeScript validation
4. Run `bun run build` - Verify production build
5. Run `bun run test` - Run all tests

### Before Committing

- All quality checks must pass
- No TypeScript errors
- No ESLint errors or warnings
- Tests must pass
- Code must be formatted

## Environment

- **OS**: Windows 11
- **Shell**: PowerShell 7.5+
- **Node Runtime**: Bun >=1.1.30
- **Package Manager**: Bun

## Dependencies

### Runtime Dependencies

- React 19.2.3
- React DOM 19.2.3
- D3 7.9.0
- React Flow 12.10.0
- React Window 2.2.3

### Development Dependencies

- TypeScript 5.9.3
- Vite 7.3.0
- Jest 30.2.0
- ESLint 9.39.2
- Prettier 3.7.4
- Playwright 1.57.0
- Tailwind CSS 4.1.18
- And many other development tools

## Export Structure

The library exports a comprehensive API:

### Components

- BasicTree
- SelectableTree
- D3TreeDiagram
- FlowchartDiagram
- SitemapEditor
- DiffViewer
- VersionManager
- And more...

### Hooks

- useTreeParser
- useTreeComparison
- useTreeSearch
- useTreeKeyboardNavigation
- useTreeNodeEditing

### Utilities

- parseTreeText
- buildTreeHierarchy
- compareTrees
- generateSitemapText
- And many more...

### Types

- TreeNode
- ParseResult
- ComparisonResult
- SitemapVersion
- And more...

## Next Steps for Development

1. Run `bun run smoke:qc` to verify current state
2. Identify failing tests and fix them
3. Implement missing features from feature_list.json
4. Add E2E tests with Playwright
5. Create comprehensive README.md
6. Improve documentation for all components
7. Optimize performance for large trees
8. Implement advanced diff visualization
9. Add collaborative editing features
10. Create migration guide and examples
