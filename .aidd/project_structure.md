# Project Structure

## Overview

The UX Sitemap Visualizer is a React-based web application that transforms text-based tree structures into interactive visual hierarchies for UX and product design documentation. It bridges the gap between technical documentation and visual design communication, enabling teams to understand project structure at a glance. The tool supports multiple visualization modes including basic tree layouts, D3.js diagrams, and flowchart views, with capabilities for real-time editing, version management, and export to design tools like Figma.

## Repository Layout

### Root Level

```
sitemap/
├── src/                       # Source code (React/TypeScript)
├── public/                    # Static assets
├── .aidd/                     # AI development tracking
├── .automaker/                # Legacy development tracking
├── .git/                      # Git repository
├── .gitignore                 # Git ignore rules
├── .gitattributes             # Git attributes
├── .prettierrc                # Prettier configuration
├── .prettierignore            # Prettier ignore patterns
├── babel.config.cjs           # Babel configuration
├── eslint.config.js            # ESLint configuration
├── index.html                 # HTML entry point
├── jest.config.cjs            # Jest test configuration
├── package.json               # Project dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite bundler configuration
├── CLAUDE.md                  # Development guidelines
└── README.md                  # Project documentation
```

### Frontend Layout (src/)

```
src/
├── components/                # React components
│   ├── BasicTree.tsx         # Basic hierarchical tree display
│   ├── TreeNodeComponent.tsx  # Reusable tree node with children
│   ├── SitemapEditor.tsx     # Main editor with input and preview
│   ├── D3TreeDiagram.tsx     # D3.js-powered interactive visualization
│   ├── FlowchartDiagram.tsx   # Flowchart-style tree using React Flow
│   ├── VirtualizedTree.tsx    # Performance-optimized for large datasets
│   ├── SearchableTree.tsx     # Tree with built-in search functionality
│   ├── SelectableTree.tsx     # Interactive tree with selection and expansion
│   ├── DiffViewer.tsx        # Side-by-side tree comparison
│   ├── VersionManager.tsx    # Save and manage tree versions
│   ├── ExportButton.tsx       # Export to SVG/PNG
│   ├── InlineEditInput.tsx   # Inline editing input component
│   ├── KeyboardShortcutsHelp.tsx # Keyboard shortcuts help display
│   ├── TreeNodeUtils.ts       # Node rendering utilities and hooks
│   ├── SearchPanel.tsx        # Search UI component
│   ├── HorizontalNavBar.tsx   # Navigation bar
│   ├── ResponsiveCardGrid.tsx # Responsive layout grid
│   ├── SitemapEditorWithComparison.tsx # Editor with comparison features
│   └── index.ts              # Component exports
├── hooks/                    # Custom React hooks
│   ├── useTreeParser.ts      # Parse tree text with validation
│   ├── useTreeComparison.ts  # Compare two tree structures
│   ├── useTreeSearch.ts      # Search across tree nodes
│   ├── useTreeKeyboardNavigation.ts # Keyboard navigation support
│   ├── useTreeNodeEditing.ts # Inline editing state management
│   ├── useDebounce.ts        # Debounce utility hook
│   └── index.ts              # Hook exports
├── utils/                    # Utility functions
│   ├── treeParser.ts         # Core tree parsing logic
│   ├── treeComparison.ts     # Tree comparison and diff utilities
│   ├── treeSearch.ts        # Search utilities for trees
│   ├── treeOperations.ts    # Tree manipulation operations
│   ├── treeFlattening.ts    # Flatten trees for rendering
│   ├── parserErrors.ts      # Parser error detection and handling
│   ├── sitemapGenerator.ts  # Generate sample sitemaps for testing
│   ├── svgExport.ts         # Export visualization to SVG
│   ├── pngExport.ts         # Export visualization to PNG
│   ├── versionStorage.ts    # Local storage for version management
│   └── index.ts             # Utility exports
├── types/                    # TypeScript type definitions
│   ├── TreeNode.ts          # Core node and parser types
│   └── index.ts             # Type exports
├── theme/                    # Theme system
│   ├── theme.ts             # Theme configuration and utilities
│   └── index.ts             # Theme exports
├── styles/                   # Global styles
│   └── index.css            # Global CSS and Tailwind imports
├── __tests__/               # Test files
│   ├── BasicTree.test.tsx   # BasicTree component tests
│   ├── D3TreeDiagram.test.tsx # D3TreeDiagram tests
│   ├── InlineEditInput.test.tsx # InlineEditInput tests
│   └── global.d.ts          # Global test type definitions
├── demo.tsx                 # Demo entry point
├── DemoApp.tsx              # Demo application component
├── setupTests.ts             # Test setup configuration
└── index.ts                  # Main library entry point
```

## Key Concepts / Modules

### Tree Parser

- **Responsibility**: Parse text-based tree structures with indentation markers into structured TreeNode hierarchies
- **Key files**:
    - `src/utils/treeParser.ts` - Core parsing logic with error detection
    - `src/hooks/useTreeParser.ts` - React hook for parsing with validation
- **Primary entry points**:
    - `parseTreeText(text)` - Parse indented text into ParsedNode array
    - `buildTreeHierarchy(nodes)` - Convert flat nodes to hierarchical tree
    - `parseTreeTextWithValidation(text)` - Parse with detailed error reporting

### Visualization Components

- **Responsibility**: Render parsed trees in various visual formats with interactive features
- **Key files**:
    - `src/components/BasicTree.tsx` - Simple hierarchical layout
    - `src/components/D3TreeDiagram.tsx` - D3.js interactive diagrams
    - `src/components/FlowchartDiagram.tsx` - React Flow flowcharts
    - `src/components/VirtualizedTree.tsx` - Large dataset optimization
- **Primary entry points**:
    - `<BasicTree tree={treeData} />` - Basic tree display
    - `<D3TreeDiagram tree={treeData} width={800} height={600} />` - D3 visualization
    - `<FlowchartDiagram tree={treeData} direction="vertical" />` - Flowchart

### Theme System

- **Responsibility**: Manage customizable colors, typography, and spacing for node styling
- **Key files**:
    - `src/theme/theme.ts` - Theme configuration and computation
    - `src/components/TreeNodeUtils.ts` - Node styling utilities
- **Primary entry points**:
    - `createTheme(config)` - Create custom theme
    - `defaultTheme` - Built-in default theme
    - `getDepthColor(depth)` - Get color by depth level

### Version Management

- **Responsibility**: Save, load, and compare multiple versions of sitemaps
- **Key files**:
    - `src/utils/versionStorage.ts` - Local storage operations
    - `src/components/VersionManager.tsx` - Version management UI
    - `src/components/DiffViewer.tsx` - Version comparison display
- **Primary entry points**:
    - `saveVersion(name, tree)` - Save tree version
    - `getVersions()` - Get all saved versions
    - `compareTrees(treeA, treeB)` - Compare two trees

## Technology Stack

### Frontend

- **Framework**: React 19
- **Runtime**: Node.js / Bun 1.1.30+
- **Build Tool**: Vite 7
- **Type System**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Visualization**: D3.js 7, React Flow 12
- **Testing**: Jest 30, React Testing Library 16, Playwright 1
- **Linting**: ESLint 9, Prettier 4

### Development

- **Package Manager**: Bun
- **Language**: TypeScript (strict mode)
- **Code Quality**: ESLint + Prettier + Jest
- **Git**: Distributed version control

## Data Model Overview

- **Entities**:
    - **TreeNode**: Core node with id, label, depth, children, metadata
    - **ParsedNode**: Intermediate parsed node with lineNumber
    - **SitemapVersion**: Saved version with id, name, timestamp, tree data
    - **ParseError**: Parsing error with code, message, lineNumber, severity
    - **NodeDifference**: Comparison result showing added/removed/modified nodes

## API Overview

- **Entry Point**: `src/index.ts` exports all public APIs
- **Module Pattern**: ESM modules with named exports
- **Type System**: Comprehensive TypeScript types exported from `src/types/`

## Development Workflow

- **Install**: `bun install`
- **Dev**: `bun run dev` (Start Vite dev server on port 5173)
- **Tests**: `bun run test` (Run Jest tests)
- **Build**: `bun run build` (TypeScript compilation)
- **Lint**: `bun run lint` (ESLint with zero warnings policy)
- **Typecheck**: `bun run typecheck` (TypeScript strict mode check)
- **Format**: `bun run format` (Prettier formatting)
- **Smoke QC**: `bun run smoke:qc` (All quality checks: lint, typecheck, format, build, test)

## Notes / Gotchas

- **Bun Required**: This project uses Bun as the package manager and requires version 1.1.30+
- **TypeScript Strict Mode**: No `any` types or `@ts-ignore` without explicit justification
- **Zero Linting Policy**: All ESLint warnings must be addressed; cannot relax rules without explicit approval
- **Test Coverage**: Target 90%+ coverage; `smoke:qc` must pass before declaring features complete
- **D3.js Integration**: D3TreeDiagram uses SVG manipulation directly; ensure cleanup on unmount
- **Virtual Scrolling**: VirtualizedTree component is required for trees with 1000+ nodes
- **Error Handling**: Parser errors are user-friendly with suggestions; display in UI, not console
- **Local Storage**: Version management uses localStorage; clear if storage quota exceeded
- **Performance**: React.memo and useMemo are required for performance optimization with large trees
- **No Backend**: This is a pure frontend application; all data stored in browser localStorage
- **Export Formats**: SVG export for vector graphics; PNG export for raster images
