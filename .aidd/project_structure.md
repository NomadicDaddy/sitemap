# Project Structure

## Overview

The UX Sitemap Visualizer is a React/TypeScript web application that transforms text-based tree structures into beautiful, interactive visualizations for UX/product design documentation. The application serves designers, product managers, and developers who need to quickly visualize and document sitemaps, wireframes, and hierarchical information architecture. The primary constraints include maintaining high code quality (zero TypeScript errors, zero ESLint warnings), comprehensive test coverage, and responsive design for desktop and tablet viewing.

## Repository Layout

### Root Level

```
sitemap/
├── src/                      # Source code
│   ├── components/           # React components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions and helpers
│   ├── types/               # TypeScript type definitions
│   ├── theme/               # Theme system configuration
│   ├── styles/              # Global styles
│   └── __tests__/           # Test files
├── public/                  # Static assets
├── dist/                    # Build output
├── node_modules/            # Dependencies
├── .aidd/                   # AI project management files
├── .automaker/              # Legacy project management (migrated to .aidd/)
├── .git/                    # Git repository
├── index.html               # HTML entry point
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── jest.config.cjs          # Jest test configuration
├── eslint.config.js        # ESLint linting configuration
├── .prettierrc              # Prettier formatting configuration
└── README.md                # Project documentation
```

## Key Concepts / Modules

### Core Parser System

- **Responsibility**: Parse text-based tree structures with various indentation formats (├──, └──, │, spaces) into structured TreeNode objects
- **Key files**:
    - `src/utils/treeParser.ts` - Main parsing logic
    - `src/utils/parserErrors.ts` - Error detection and reporting
    - `src/utils/sitemapGenerator.ts` - Generate sample sitemaps
    - `src/types/TreeNode.ts` - Type definitions
- **Primary entry points**:
    - `parseTreeText()` - Parse text to flat node array
    - `buildTreeHierarchy()` - Build nested tree structure
    - `parseAndBuildTree()` - Combined parsing and hierarchy building
    - `validateTreeInput()` - Validate tree structure

### Visualization Components

- **Responsibility**: Render parsed tree structures in various visualization modes
- **Key files**:
    - `src/components/SitemapEditor.tsx` - Main editor with real-time preview
    - `src/components/BasicTree.tsx` - Simple hierarchical tree
    - `src/components/SelectableTree.tsx` - Interactive tree with selection
    - `src/components/D3TreeDiagram.tsx` - D3.js powered visualization
    - `src/components/FlowchartDiagram.tsx` - React Flow diagram
    - `src/components/VirtualizedTree.tsx` - Performance-optimized for large datasets
    - `src/components/TreeNodeComponent.tsx` - Reusable tree node component
- **Primary entry points**:
    - `<SitemapEditor />` - Full-featured editor component
    - `<BasicTree />` - Simple tree display
    - `<SelectableTree />` - Interactive tree with selection

### Interactive Features

- **Responsibility**: Handle user interactions like editing, navigation, and search
- **Key files**:
    - `src/hooks/useTreeParser.ts` - Parse tree text with validation
    - `src/hooks/useTreeKeyboardNavigation.ts` - Keyboard navigation support
    - `src/hooks/useTreeSearch.ts` - Search and filter functionality
    - `src/hooks/useTreeNodeEditing.ts` - Inline editing state
    - `src/hooks/useTreeComparison.ts` - Version comparison
    - `src/components/InlineEditInput.tsx` - Inline editing input
    - `src/components/KeyboardShortcutsHelp.tsx` - Keyboard shortcuts documentation
- **Primary entry points**:
    - `useTreeParser()` - Parse and validate tree text
    - `useTreeKeyboardNavigation()` - Keyboard navigation state and handlers
    - `useTreeSearch()` - Search functionality

### Version Management

- **Responsibility**: Save, load, and compare tree versions using localStorage
- **Key files**:
    - `src/components/VersionManager.tsx` - Version management UI
    - `src/components/DiffViewer.tsx` - Side-by-side comparison
    - `src/components/SitemapEditorWithComparison.tsx` - Editor with comparison
    - `src/utils/versionStorage.ts` - localStorage operations
    - `src/utils/treeComparison.ts` - Tree diff algorithm
- **Primary entry points**:
    - `saveVersion()` - Save tree version
    - `getVersions()` - Get all saved versions
    - `compareTrees()` - Compare two tree structures

### Export Functionality

- **Responsibility**: Export visualizations to various formats (PNG, SVG)
- **Key files**:
    - `src/components/ExportButton.tsx` - Export UI component
    - `src/utils/pngExport.ts` - PNG export implementation
    - `src/utils/svgExport.ts` - SVG export implementation
- **Primary entry points**:
    - `exportD3TreeDiagramAsPng()` - Export D3 tree as PNG
    - `exportD3TreeDiagramAsSvg()` - Export D3 tree as SVG
    - `exportBasicTreeAsPng()` - Export basic tree as PNG
    - `exportBasicTreeAsSvg()` - Export basic tree as SVG

### Theme System

- **Responsibility**: Provide customizable styling and theming
- **Key files**:
    - `src/theme/theme.ts` - Theme configuration
    - `src/components/TreeNodeUtils.ts` - Style computation utilities
- **Primary entry points**:
    - `createTheme()` - Create custom theme
    - `defaultTheme` - Default theme configuration
    - `computeNodeStyles()` - Compute node styles based on depth

## Technology Stack

### Frontend

- **Framework**: React 19+
- **Language**: TypeScript 5+
- **Build Tool**: Vite 7+
- **Styling**: Tailwind CSS 4+
- **Runtime**: Bun >= 1.1.30 (package manager)
- **Visualization Libraries**:
    - D3.js 7+ for tree diagrams
    - React Flow (@xyflow/react) for flowcharts
    - react-window for virtualization
- **Testing**:
    - Jest 30+ for unit testing
    - @testing-library/react for component testing
    - @testing-library/jest-dom for DOM assertions
- **Code Quality**:
    - ESLint 9+ with TypeScript support
    - Prettier for code formatting
    - TypeScript strict mode enabled

### Build & Development

- **Package Manager**: Bun
- **Runtime**: Node.js 14+ compatible environment
- **Build Output**: dist/ directory
- **Entry Point**: src/index.ts

## Data Model Overview

### Core Types

- **TreeNode**: Hierarchical tree node with label, id, children, and metadata
- **ParsedNode**: Flat parsed representation from text input
- **ParseResult**: Result of parsing operation with nodes and errors
- **ParseError**: Validation error with line number, code, and suggestion

### Tree Structure

The tree structure is built from:

1. Flat nodes parsed from text input (ParsedNode)
2. Hierarchical TreeNode objects with nested children
3. Optional metadata for each node (lineNumber, category, tags, properties)
4. Selection and expansion state tracking

### Version Storage

- **SitemapVersion**: Saved version with id, name, description, date, and tree
- **ComparisonResult**: Diff between two tree structures
- **NodeDifference**: Individual node change (added, removed, modified)

## API Overview

### Public API (src/index.ts)

The library exports:

- Components: SitemapEditor, BasicTree, SelectableTree, D3TreeDiagram, FlowchartDiagram, VirtualizedTree, SearchableTree, DiffViewer, VersionManager, ExportButton
- Hooks: useTreeParser, useTreeSearch, useTreeKeyboardNavigation, useTreeNodeEditing, useTreeComparison, useDebounce
- Utilities: parseTreeText, buildTreeHierarchy, generateSitemapText, compareTrees, export functions
- Types: All TypeScript type definitions
- Theme: createTheme, defaultTheme, theme utilities

### No Backend API

This is a frontend-only application with no server-side API. All data is:

- Parsed client-side from text input
- Stored in localStorage for version management
- Exported directly to browser downloads

## Development Workflow

### Install

```bash
bun install
```

### Dev

```bash
bun run dev          # Start development server at http://localhost:5173
```

### Tests

```bash
bun run test          # Run Jest tests
bun run test:watch    # Run tests in watch mode
bun run test:coverage # Run tests with coverage report
```

### Build

```bash
bun run build         # Build for production
```

### Code Quality

```bash
bun run lint          # Run ESLint
bun run lint:fix      # Fix ESLint issues automatically
bun run typecheck     # TypeScript type checking
bun run format        # Format with Prettier
```

### Quality Check

```bash
bun run smoke:qc      # Run all quality checks (lint, typecheck, format, build, test)
```

## Notes / Gotchas

- **Jest Configuration Warnings**: The current jest.config.cjs uses deprecated ts-jest configuration under `globals`. This should be migrated to the newer transform array format.
- **Virtualization**: For large trees (1000+ nodes), use VirtualizedTree component for optimal performance.
- **Browser Support**: Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge). Mobile browsers supported via responsive design.
- **Type Safety**: TypeScript strict mode is enabled. All code must pass type checking.
- **Quality Standards**: Zero ESLint warnings policy - all warnings must be addressed.
- **Export Formats**: PNG and SVG exports work by capturing DOM elements and converting to downloadable files.
- **Version Storage**: Uses localStorage with automatic cleanup of old auto-saves (maxAutoSaves limit).
- **Keyboard Shortcuts**: Full keyboard navigation support with Arrow keys for navigation and Enter for editing.
- **Search Functionality**: Supports partial matching, case-insensitive search (configurable), and search in multiple fields (label, tags, category).
- **Tree Formats**: Supports multiple indentation formats including ├──, └──, │ markers, simple indentation, and dash-based formats.
- **Performance**: React.memo() and useMemo() used for optimization when handling large node lists.
