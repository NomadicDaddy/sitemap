🔧 Tool: Task
Input: {
"description": "Explore codebase structure",
"prompt": "Explore this codebase to understand its structure. I need to implement a TreeNode component feature that extracts node rendering logic into a modular, reusable component with props for styling, children, and interaction handlers that supports recursive rendering of nested structures.\n\nPlease find:\n1. The overall project structure (is it React, Vue, etc.?)\n2. Any existing tree-related components or rendering logic\n3. The component patterns and conventions used in this codebase\n4. Test patterns used\n5. Any relevant styling approaches\n\nBe thorough - check for src/, components/, lib/ directories, package.json, and any existing tree implementations.",
"subagent_type": "Explore"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\package.json"
}

🔧 Tool: Bash
Input: {
"command": "cd /d D:\\applications\\sitemap && find . -type f -name \"_.json\" -not -path \"./node_modules/_\" | head -20",
"description": "List JSON files excluding node_modules"
}

🔧 Tool: Glob
Input: {
"pattern": "\*_/_.{ts,tsx,js,jsx}"
}

🔧 Tool: Bash
Input: {
"command": "find \"D:\\applications\\sitemap\\src\" -type f -name \"_.ts\" -o -name \"_.tsx\" 2>/dev/null | grep -v node_modules",
"description": "Find TypeScript files in src directory"
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\"",
"description": "List root directory contents"
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\\src\" 2>/dev/null || echo \"src directory not found\"",
"description": "List src directory contents"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\types\\TreeNode.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\types\\index.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\D3TreeDiagram.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\index.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\BasicTree.test.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\utils\\treeParser.ts",
"limit": 100
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\\src\\components\"",
"description": "List components directory"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\index.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\tsconfig.json"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\jest.config.js"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\.eslintrc.js"
}

🔧 Tool: Bash
Input: {
"command": "find \"D:\\applications\\sitemap\\src\" -type f \\( -name \"_.test.ts\" -o -name \"_.test.tsx\" \\) | head -20",
"description": "Find test files in src"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\TreeNode.test.ts",
"limit": 100
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\setupTests.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\.prettierrc"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\utils\\sitemapGenerator.ts",
"limit": 50
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\\src\\utils\"",
"description": "List utils directory"
}

🔧 Tool: Bash
Input: {
"command": "find \"D:\\applications\\sitemap\\.automaker\\features\" -name \"\*.json\" -type f 2>/dev/null | head -5",
"description": "Find feature.json files in automaker"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\.automaker\\features\\basic-tree-component\\feature.json"
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\\.automaker\\features\"",
"description": "List all features"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\.automaker\\features\\tree-node-component\\feature.json"
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\\.automaker\\features\\tree-node-component\"",
"description": "List tree-node-component feature directory"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\.automaker\\features\\tree-node-component\\agent-output.md"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\utils\\parserErrors.ts",
"limit": 80
}

Excellent! I now have a comprehensive understanding of the codebase. Let me read the existing BasicTree component to understand the current TreeNodeItem implementation that needs to be extracted:

🔧 Tool: Read
Input: {
"file_path": "/D:/applications/sitemap/src/components/BasicTree.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "/D:/applications/sitemap/src/types/TreeNode.ts"
}

🔧 Tool: Read
Input: {
"file_path": "/D:/applications/sitemap/src/**tests**/BasicTree.test.tsx"
}

Let me search for the correct paths:

🔧 Tool: Glob
Input: {
"pattern": "\*_/_.tsx"
}

🔧 Tool: Glob
Input: {
"pattern": "\*\*/package.json"
}

🔧 Tool: Bash
Input: {
"command": "pwd && ls -la",
"description": "Check current directory and files"
}

Now let me read the key files:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\types\\TreeNode.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\BasicTree.test.tsx"
}

Now let me check the components index file and find related files:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\index.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\types\\index.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\index.ts"
}

Now I have a complete understanding of the codebase. Let me create the implementation plan:

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create TreeNodeComponent.tsx with modular, reusable TreeNode component",
"status": "in_progress",
"activeForm": "Creating TreeNodeComponent.tsx"
},
{
"content": "Export TreeNodeComponent from components index",
"status": "pending",
"activeForm": "Exporting TreeNodeComponent from index"
},
{
"content": "Export TreeNodeComponent from main library index",
"status": "pending",
"activeForm": "Exporting from main library index"
},
{
"content": "Create comprehensive test suite for TreeNodeComponent",
"status": "pending",
"activeForm": "Creating test suite for TreeNodeComponent"
},
{
"content": "Run tests to verify implementation",
"status": "pending",
"activeForm": "Running tests to verify implementation"
}
]
}

Now let me create the TreeNodeComponent. Based on the existing code, I'll extract the node rendering logic into a modular, reusable component:

🔧 Tool: Write
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\TreeNodeComponent.tsx",
"content": "/\*\*\n * TreeNodeComponent\n _\n _ A modular, reusable React component for rendering individual tree nodes.\n _ Supports recursive rendering of nested structures with customizable styling,\n _ children, and interaction handlers.\n _\n _ @example\n _ `tsx\n * import { TreeNodeComponent } from './components/TreeNodeComponent';\n *\n * const node = { id: 'node-1', label: 'Home', depth: 0, children: [...] };\n *\n * <TreeNodeComponent\n *   node={node}\n *   onNodeClick={(node) => console.log('Clicked:', node.label)}\n *   showDepthIndicators\n * />\n * `\n \*/\n\nimport React from 'react';\nimport { TreeNode, NodeStyleOverrides } from '../types/TreeNode';\n\n// ============================================================================\n// Types\n// ============================================================================\n\n/\*\*\n _ Depth-based color configuration for visual styling.\n _/\nexport interface DepthColorConfig {\n /** Background color \*/\n bg: string;\n /** Border color _/\n border: string;\n /\*\* Text color _/\n text: string;\n}\n\n/\*\*\n _ Props for the TreeNodeComponent.\n _/\nexport interface TreeNodeComponentProps {\n /\*\* The tree node to render _/\n node: TreeNode;\n\n /\*\* Indentation size in pixels per depth level (default: 24) _/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) \*/\n showDepthIndicators?: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional callback when a node receives hover _/\n onNodeHover?: (node: TreeNode | null) => void;\n\n /** Optional callback when a node receives focus \*/\n onNodeFocus?: (node: TreeNode) => void;\n\n /** Optional callback when a node loses focus _/\n onNodeBlur?: (node: TreeNode) => void;\n\n /\*\* Optional custom render function for node labels _/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n\n /** Optional custom render function for the entire node content \*/\n renderContent?: (node: TreeNode, defaultContent: React.ReactNode) => React.ReactNode;\n\n /** Optional custom render function for children container _/\n renderChildren?: (\n node: TreeNode,\n children: React.ReactNode[],\n defaultContainer: React.ReactNode\n ) => React.ReactNode;\n\n /\*\* Whether the node is currently selected _/\n isSelected?: boolean;\n\n /** Whether the node is currently expanded (controls children visibility) \*/\n isExpanded?: boolean;\n\n /** Custom depth colors override _/\n depthColors?: Record<number, DepthColorConfig>;\n\n /\*\* Custom style overrides that take precedence over depth-based styling _/\n styleOverrides?: NodeStyleOverrides;\n\n /** Additional CSS class name for the node container \*/\n className?: string;\n\n /** Additional CSS class name for the node label _/\n labelClassName?: string;\n\n /\*\* Font size in pixels (default: 14) _/\n fontSize?: number;\n\n /** Whether to show children count indicator (default: true) \*/\n showChildrenCount?: boolean;\n\n /** Whether to render children recursively (default: true) _/\n recursive?: boolean;\n\n /\*\* Maximum depth to render (undefined = no limit) _/\n maxDepth?: number;\n\n /** Custom data attributes to add to the node \*/\n dataAttributes?: Record<string, string>;\n\n /** ARIA role for the node (default: undefined, uses 'button' when clickable) _/\n role?: string;\n\n /\*\* ARIA label for the node _/\n ariaLabel?: string;\n}\n\n// ============================================================================\n// Default Values\n// ============================================================================\n\n/\*\*\n _ Default depth-based color schemes.\n _/\nexport const DEFAULT_DEPTH_COLORS: Record<number, DepthColorConfig> = {\n 0: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' }, // Blue\n 1: { bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d' }, // Green\n 2: { bg: '#faf5ff', border: '#e9d5ff', text: '#581c87' }, // Purple\n 3: { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12' }, // Orange\n 4: { bg: '#fdf2f8', border: '#fbcfe8', text: '#831843' }, // Pink\n};\n\n/\*\*\n _ Default props for TreeNodeComponent.\n _/\nexport const DEFAULT_TREE_NODE_PROPS: Required<\n Pick<\n TreeNodeComponentProps,\n | 'indentSize'\n | 'showDepthIndicators'\n | 'fontSize'\n | 'showChildrenCount'\n | 'recursive'\n >\n> = {\n indentSize: 24,\n showDepthIndicators: true,\n fontSize: 14,\n showChildrenCount: true,\n recursive: true,\n};\n\n// ============================================================================\n// Utility Functions\n// ============================================================================\n\n/\*\*\n _ Gets the color configuration for a given depth level.\n _\n _ @param depth - The depth level of the node\n _ @param customColors - Optional custom color configuration\n _ @returns Color configuration for the depth level\n _/\nexport function getDepthColor(\n depth: number,\n customColors?: Record<number, DepthColorConfig>\n): DepthColorConfig {\n const colors = customColors ?? DEFAULT_DEPTH_COLORS;\n const colorKeys = Object.keys(colors).map(Number).sort((a, b) => a - b);\n\n if (colorKeys.length === 0) {\n return DEFAULT_DEPTH_COLORS[0];\n }\n\n // Cycle through available colors for depths beyond defined range\n const normalizedDepth = depth % colorKeys.length;\n return colors[colorKeys[normalizedDepth]] ?? DEFAULT_DEPTH_COLORS[0];\n}\n\n/\*\*\n _ Computes inline styles for a tree node based on depth and configuration.\n _\n _ @param depth - The depth level of the node\n _ @param options - Styling options\n _ @returns CSS properties object\n _/\nexport function computeNodeStyles(\n depth: number,\n options: {\n indentSize: number;\n showDepthIndicators: boolean;\n depthColors?: Record<number, DepthColorConfig>;\n styleOverrides?: NodeStyleOverrides;\n isSelected?: boolean;\n fontSize?: number;\n }\n): React.CSSProperties {\n const {\n indentSize,\n showDepthIndicators,\n depthColors,\n styleOverrides,\n isSelected,\n fontSize = DEFAULT_TREE_NODE_PROPS.fontSize,\n } = options;\n\n const depthColor = getDepthColor(depth, depthColors);\n\n // Base styles\n const baseStyles: React.CSSProperties = {\n paddingTop: '8px',\n paddingRight: '12px',\n paddingBottom: '8px',\n paddingLeft: `${depth * indentSize + 12}px`,\n margin: '2px 0',\n borderRadius: '4px',\n borderWidth: showDepthIndicators ? '1px' : '0',\n borderStyle: 'solid',\n transition: 'background-color 0.15s ease, border-color 0.15s ease',\n fontSize: `${fontSize}px`,\n lineHeight: '1.5',\n fontFamily:\n '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif',\n };\n\n // Apply depth-based colors if indicators are enabled\n if (showDepthIndicators) {\n baseStyles.backgroundColor = depthColor.bg;\n baseStyles.borderColor = depthColor.border;\n baseStyles.color = depthColor.text;\n }\n\n // Apply style overrides from node metadata or props\n if (styleOverrides) {\n if (styleOverrides.backgroundColor) {\n baseStyles.backgroundColor = styleOverrides.backgroundColor;\n }\n if (styleOverrides.textColor) {\n baseStyles.color = styleOverrides.textColor;\n }\n if (styleOverrides.borderColor) {\n baseStyles.borderColor = styleOverrides.borderColor;\n }\n }\n\n // Apply selection styles\n if (isSelected) {\n baseStyles.outline = '2px solid #3b82f6';\n baseStyles.outlineOffset = '1px';\n }\n\n return baseStyles;\n}\n\n/\*\*\n _ Computes styles for the depth indicator bullet.\n _\n _ @param borderColor - The border color to use for the bullet\n _ @returns CSS properties for the bullet\n \*/\nexport function computeBulletStyles(borderColor: string): React.CSSProperties {\n return {\n display: 'inline-block',\n width: '8px',\n height: '8px',\n borderRadius: '50%',\n backgroundColor: borderColor,\n marginRight: '8px',\n flexShrink: 0,\n };\n}\n\n// ============================================================================\n// TreeNodeComponent\n// ============================================================================\n\n/\*\*\n _ TreeNodeComponent renders a single tree node and optionally its children recursively.\n _\n _ Features:\n _ - Recursive rendering of nested tree structures\n _ - Depth-based visual styling with customizable color schemes\n _ - Configurable indentation and appearance\n _ - Click, hover, focus, and blur interaction handlers\n _ - Custom label and content rendering support\n _ - Accessible keyboard navigation (Enter/Space)\n _ - Selection state visual feedback\n _ - Expansion state for showing/hiding children\n _ - Custom data attributes for integration\n _ - Style overrides for individual nodes\n _\n _ @example\n _ `tsx\n * // Basic usage with click handler\n * <TreeNodeComponent\n *   node={myNode}\n *   onNodeClick={(node) => console.log('Clicked:', node.label)}\n * />\n *\n * // With custom styling\n * <TreeNodeComponent\n *   node={myNode}\n *   indentSize={32}\n *   showDepthIndicators={true}\n *   styleOverrides={{ backgroundColor: '#f0f0f0' }}\n * />\n *\n * // With custom label rendering\n * <TreeNodeComponent\n *   node={myNode}\n *   renderLabel={(node) => (\n *     <span>\n *       <Icon name={node.metadata?.icon} />\n *       {node.label}\n *     </span>\n *   )}\n * />\n *\n * // Non-recursive (single node only)\n * <TreeNodeComponent\n *   node={myNode}\n *   recursive={false}\n * />\n * `\n _/\nexport function TreeNodeComponent({\n node,\n indentSize = DEFAULT*TREE_NODE_PROPS.indentSize,\n showDepthIndicators = DEFAULT_TREE_NODE_PROPS.showDepthIndicators,\n onNodeClick,\n onNodeHover,\n onNodeFocus,\n onNodeBlur,\n renderLabel,\n renderContent,\n renderChildren,\n isSelected = false,\n isExpanded = true,\n depthColors,\n styleOverrides,\n className = '',\n labelClassName = '',\n fontSize = DEFAULT_TREE_NODE_PROPS.fontSize,\n showChildrenCount = DEFAULT_TREE_NODE_PROPS.showChildrenCount,\n recursive = DEFAULT_TREE_NODE_PROPS.recursive,\n maxDepth,\n dataAttributes = {},\n role,\n ariaLabel,\n}: TreeNodeComponentProps): React.ReactElement {\n // Merge node metadata style overrides with prop overrides\n const mergedStyleOverrides: NodeStyleOverrides | undefined = {\n ...node.metadata?.style,\n ...styleOverrides,\n };\n\n const hasChildren = node.children && node.children.length > 0;\n const shouldRenderChildren =\n recursive &&\n hasChildren &&\n isExpanded &&\n (maxDepth === undefined || node.depth < maxDepth);\n\n // Get depth color for bullet\n const depthColor = getDepthColor(node.depth, depthColors);\n\n // Compute node label styles\n const nodeStyles = computeNodeStyles(node.depth, {\n indentSize,\n showDepthIndicators,\n depthColors,\n styleOverrides: mergedStyleOverrides,\n isSelected,\n fontSize,\n });\n\n // Event handlers\n const handleClick = (event: React.MouseEvent) => {\n event.stopPropagation();\n onNodeClick?.(node);\n };\n\n const handleKeyDown = (event: React.KeyboardEvent) => {\n if (event.key === 'Enter' || event.key === ' ') {\n event.preventDefault();\n event.stopPropagation();\n onNodeClick?.(node);\n }\n };\n\n const handleMouseEnter = () => {\n onNodeHover?.(node);\n };\n\n const handleMouseLeave = () => {\n onNodeHover?.(null);\n };\n\n const handleFocus = () => {\n onNodeFocus?.(node);\n };\n\n const handleBlur = () => {\n onNodeBlur?.(node);\n };\n\n // Determine cursor style based on interactivity\n const isClickable = Boolean(onNodeClick);\n if (isClickable) {\n nodeStyles.cursor = 'pointer';\n }\n\n // Build data attributes\n const nodeDataAttributes: Record<string, string> = {\n 'data-node-id': node.id,\n 'data-depth': String(node.depth),\n ...dataAttributes,\n };\n\n // Determine ARIA role\n const computedRole = role ?? (isClickable ? 'button' : undefined);\n\n // Build the default label content\n const defaultLabelContent = (\n <>\n {/* Depth indicator bullet _/}\n {showDepthIndicators && (\n <span\n className=\"tree-node-bullet\"\n style={computeBulletStyles(depthColor.border)}\n aria-hidden=\"true\"\n />\n )}\n\n {/_ Label text _/}\n <span className=\"tree-node-text\">\n {renderLabel ? renderLabel(node) : node.label}\n </span>\n\n {/_ Children count indicator _/}\n {showChildrenCount && hasChildren && (\n <span\n className=\"tree-node-children-count\"\n style={{\n            marginLeft: '8px',\n            fontSize: '0.75em',\n            opacity: 0.6,\n          }}\n aria-label={`${node.children!.length} children`}\n >\n ({node.children!.length})\n </span>\n )}\n </>\n );\n\n // Allow custom content rendering\n const labelContent = renderContent\n ? renderContent(node, defaultLabelContent)\n : defaultLabelContent;\n\n // Build children elements\n const childElements = shouldRenderChildren\n ? node.children!.map((child) => (\n <TreeNodeComponent\n key={child.id}\n node={child}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n onNodeClick={onNodeClick}\n onNodeHover={onNodeHover}\n onNodeFocus={onNodeFocus}\n onNodeBlur={onNodeBlur}\n renderLabel={renderLabel}\n renderContent={renderContent}\n renderChildren={renderChildren}\n depthColors={depthColors}\n fontSize={fontSize}\n showChildrenCount={showChildrenCount}\n recursive={recursive}\n maxDepth={maxDepth}\n dataAttributes={dataAttributes}\n />\n ))\n : [];\n\n // Build the default children container\n const defaultChildrenContainer =\n childElements.length > 0 ? (\n <div className=\"tree-node-children\" role=\"group\">\n {childElements}\n </div>\n ) : null;\n\n // Allow custom children container rendering\n const childrenContainer =\n renderChildren && childElements.length > 0\n ? renderChildren(node, childElements, defaultChildrenContainer)\n : defaultChildrenContainer;\n\n return (\n <div\n className={`tree-node ${className}`.trim()}\n {...nodeDataAttributes}\n >\n {/_ Node Label Container _/}\n <div\n className={`tree-node-label ${labelClassName}`.trim()}\n style={nodeStyles}\n onClick={isClickable ? handleClick : undefined}\n onKeyDown={isClickable ? handleKeyDown : undefined}\n onMouseEnter={onNodeHover ? handleMouseEnter : undefined}\n onMouseLeave={onNodeHover ? handleMouseLeave : undefined}\n onFocus={onNodeFocus ? handleFocus : undefined}\n onBlur={onNodeBlur ? handleBlur : undefined}\n role={computedRole}\n tabIndex={isClickable ? 0 : undefined}\n aria-label={ariaLabel}\n aria-expanded={hasChildren ? isExpanded : undefined}\n aria-selected={isSelected}\n >\n {labelContent}\n </div>\n\n {/_ Children Container _/}\n {childrenContainer}\n </div>\n );\n}\n\n// ============================================================================\n// Utility Hooks\n// ============================================================================\n\n/\*\*\n _ Hook for managing tree node selection state.\n _\n _ @param initialSelectedIds - Initial set of selected node IDs\n _ @returns Selection state and handlers\n _/\nexport function useTreeNodeSelection(initialSelectedIds: Set<string> = new Set()) {\n const [selectedIds, setSelectedIds] = React.useState<Set<string>>(initialSelectedIds);\n\n const isSelected = React.useCallback(\n (nodeId: string) => selectedIds.has(nodeId),\n [selectedIds]\n );\n\n const toggleSelection = React.useCallback((nodeId: string) => {\n setSelectedIds((prev) => {\n const next = new Set(prev);\n if (next.has(nodeId)) {\n next.delete(nodeId);\n } else {\n next.add(nodeId);\n }\n return next;\n });\n }, []);\n\n const selectNode = React.useCallback((nodeId: string) => {\n setSelectedIds((prev) => new Set(prev).add(nodeId));\n }, []);\n\n const deselectNode = React.useCallback((nodeId: string) => {\n setSelectedIds((prev) => {\n const next = new Set(prev);\n next.delete(nodeId);\n return next;\n });\n }, []);\n\n const clearSelection = React.useCallback(() => {\n setSelectedIds(new Set());\n }, []);\n\n const selectOnly = React.useCallback((nodeId: string) => {\n setSelectedIds(new Set([nodeId]));\n }, []);\n\n return {\n selectedIds,\n isSelected,\n toggleSelection,\n selectNode,\n deselectNode,\n clearSelection,\n selectOnly,\n setSelectedIds,\n };\n}\n\n/\*_\n _ Hook for managing tree node expansion state.\n _\n _ @param initialExpandedIds - Initial set of expanded node IDs\n _ @param defaultExpanded - Whether nodes should be expanded by default\n _ @returns Expansion state and handlers\n \*/\nexport function useTreeNodeExpansion(\n initialExpandedIds: Set<string> = new Set(),\n defaultExpanded: boolean = true\n) {\n const [expandedIds, setExpandedIds] = React.useState<Set<string>>(initialExpandedIds);\n const [useDefault, setUseDefault] = React.useState(true);\n\n const isExpanded = React.useCallback(\n (nodeId: string) => {\n if (useDefault && expandedIds.size === 0) {\n return defaultExpanded;\n }\n return expandedIds.has(nodeId);\n },\n [expandedIds, defaultExpanded, useDefault]\n );\n\n const toggleExpansion = React.useCallback((nodeId: string) => {\n setUseDefault(false);\n setExpandedIds((prev) => {\n const next = new Set(prev);\n if (next.has(nodeId)) {\n next.delete(nodeId);\n } else {\n next.add(nodeId);\n }\n return next;\n });\n }, []);\n\n const expandNode = React.useCallback((nodeId: string) => {\n setUseDefault(false);\n setExpandedIds((prev) => new Set(prev).add(nodeId));\n }, []);\n\n const collapseNode = React.useCallback((nodeId: string) => {\n setUseDefault(false);\n setExpandedIds((prev) => {\n const next = new Set(prev);\n next.delete(nodeId);\n return next;\n });\n }, []);\n\n const expandAll = React.useCallback((nodeIds: string[]) => {\n setUseDefault(false);\n setExpandedIds(new Set(nodeIds));\n }, []);\n\n const collapseAll = React.useCallback(() => {\n setUseDefault(false);\n setExpandedIds(new Set());\n }, []);\n\n return {\n expandedIds,\n isExpanded,\n toggleExpansion,\n expandNode,\n collapseNode,\n expandAll,\n collapseAll,\n setExpandedIds,\n };\n}\n\n// Default export for convenience\nexport default TreeNodeComponent;\n"
}

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create TreeNodeComponent.tsx with modular, reusable TreeNode component",
"status": "completed",
"activeForm": "Creating TreeNodeComponent.tsx"
},
{
"content": "Export TreeNodeComponent from components index",
"status": "in_progress",
"activeForm": "Exporting TreeNodeComponent from index"
},
{
"content": "Export TreeNodeComponent from main library index",
"status": "pending",
"activeForm": "Exporting from main library index"
},
{
"content": "Create comprehensive test suite for TreeNodeComponent",
"status": "pending",
"activeForm": "Creating test suite for TreeNodeComponent"
},
{
"content": "Run tests to verify implementation",
"status": "pending",
"activeForm": "Running tests to verify implementation"
}
]
}

Now let me update the components index to export the new component:

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\index.ts",
"old_string": "/\*\*\n * Components Module\n _\n _ Exports all React components for the UX Sitemap Visualizer.\n _/\n\nexport { BasicTree, type BasicTreeProps } from './BasicTree';\nexport { default as BasicTreeDefault } from './BasicTree';\n\nexport {\n D3TreeDiagram,\n type D3TreeDiagramProps,\n type LayoutType,\n type LinkStyle,\n} from './D3TreeDiagram';\nexport { default as D3TreeDiagramDefault } from './D3TreeDiagram';",
"new_string": "/\*\*\n _ Components Module\n _\n _ Exports all React components for the UX Sitemap Visualizer.\n \_/\n\nexport { BasicTree, type BasicTreeProps } from './BasicTree';\nexport { default as BasicTreeDefault } from './BasicTree';\n\nexport {\n D3TreeDiagram,\n type D3TreeDiagramProps,\n type LayoutType,\n type LinkStyle,\n} from './D3TreeDiagram';\nexport { default as D3TreeDiagramDefault } from './D3TreeDiagram';\n\nexport {\n TreeNodeComponent,\n type TreeNodeComponentProps,\n type DepthColorConfig,\n DEFAULT_DEPTH_COLORS,\n DEFAULT_TREE_NODE_PROPS,\n getDepthColor,\n computeNodeStyles,\n computeBulletStyles,\n useTreeNodeSelection,\n useTreeNodeExpansion,\n} from './TreeNodeComponent';\nexport { default as TreeNodeComponentDefault } from './TreeNodeComponent';"
}

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create TreeNodeComponent.tsx with modular, reusable TreeNode component",
"status": "completed",
"activeForm": "Creating TreeNodeComponent.tsx"
},
{
"content": "Export TreeNodeComponent from components index",
"status": "completed",
"activeForm": "Exporting TreeNodeComponent from index"
},
{
"content": "Export TreeNodeComponent from main library index",
"status": "in_progress",
"activeForm": "Exporting from main library index"
},
{
"content": "Create comprehensive test suite for TreeNodeComponent",
"status": "pending",
"activeForm": "Creating test suite for TreeNodeComponent"
},
{
"content": "Run tests to verify implementation",
"status": "pending",
"activeForm": "Running tests to verify implementation"
}
]
}

Now let me update the main library index to export the new component:

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\index.ts",
"old_string": "// React Components\nexport { BasicTree, type BasicTreeProps } from './components/BasicTree';",
"new_string": "// React Components\nexport { BasicTree, type BasicTreeProps } from './components/BasicTree';\n\nexport {\n TreeNodeComponent,\n type TreeNodeComponentProps,\n type DepthColorConfig,\n DEFAULT_DEPTH_COLORS,\n DEFAULT_TREE_NODE_PROPS,\n getDepthColor,\n computeNodeStyles,\n computeBulletStyles,\n useTreeNodeSelection,\n useTreeNodeExpansion,\n} from './components/TreeNodeComponent';"
}

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create TreeNodeComponent.tsx with modular, reusable TreeNode component",
"status": "completed",
"activeForm": "Creating TreeNodeComponent.tsx"
},
{
"content": "Export TreeNodeComponent from components index",
"status": "completed",
"activeForm": "Exporting TreeNodeComponent from index"
},
{
"content": "Export TreeNodeComponent from main library index",
"status": "completed",
"activeForm": "Exporting from main library index"
},
{
"content": "Create comprehensive test suite for TreeNodeComponent",
"status": "in_progress",
"activeForm": "Creating test suite for TreeNodeComponent"
},
{
"content": "Run tests to verify implementation",
"status": "pending",
"activeForm": "Running tests to verify implementation"
}
]
}

Now let me create a comprehensive test suite for the TreeNodeComponent:

🔧 Tool: Write
Input: {
"file*path": "D:\\applications\\sitemap\\src\\**tests**\\TreeNodeComponent.test.tsx",
"content": "/\*\*\n * TreeNodeComponent Unit Tests\n _\n _ Comprehensive tests for the TreeNodeComponent React component that renders\n _ individual tree nodes with recursive child support.\n \*/\n\nimport React from 'react';\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport {\n TreeNodeComponent,\n TreeNodeComponentProps,\n DEFAULT_DEPTH_COLORS,\n DEFAULT_TREE_NODE_PROPS,\n getDepthColor,\n computeNodeStyles,\n computeBulletStyles,\n useTreeNodeSelection,\n useTreeNodeExpansion,\n} from '../components/TreeNodeComponent';\nimport { TreeNode } from '../types/TreeNode';\nimport { renderHook, act } from '@testing-library/react';\n\n// ============================================================================\n// Test Data Helpers\n// ============================================================================\n\n/\*\*\n _ Creates a simple leaf node for testing.\n _/\nfunction createLeafNode(overrides: Partial<TreeNode> = {}): TreeNode {\n return {\n id: 'leaf-1',\n label: 'Leaf Node',\n depth: 0,\n ...overrides,\n };\n}\n\n/\*\*\n _ Creates a node with children for testing.\n _/\nfunction createNodeWithChildren(): TreeNode {\n return {\n id: 'parent-1',\n label: 'Parent',\n depth: 0,\n children: [\n { id: 'child-1', label: 'Child 1', depth: 1 },\n { id: 'child-2', label: 'Child 2', depth: 1 },\n ],\n };\n}\n\n/\*\*\n _ Creates a deeply nested node structure.\n _/\nfunction createDeepNode(): TreeNode {\n return {\n id: 'level-0',\n label: 'Level 0',\n depth: 0,\n children: [\n {\n id: 'level-1',\n label: 'Level 1',\n depth: 1,\n children: [\n {\n id: 'level-2',\n label: 'Level 2',\n depth: 2,\n children: [\n {\n id: 'level-3',\n label: 'Level 3',\n depth: 3,\n children: [{ id: 'level-4', label: 'Level 4', depth: 4 }],\n },\n ],\n },\n ],\n },\n ],\n };\n}\n\n/\*_\n _ Creates a node with metadata for testing.\n _/\nfunction createNodeWithMetadata(): TreeNode {\n return {\n id: 'meta-node',\n label: 'Node with Metadata',\n depth: 0,\n metadata: {\n category: 'Page',\n lineNumber: 1,\n expanded: true,\n style: {\n backgroundColor: '#ff0000',\n textColor: '#ffffff',\n borderColor: '#cc0000',\n },\n },\n };\n}\n\n// ============================================================================\n// Tests\n// ============================================================================\n\ndescribe('TreeNodeComponent', () => {\n describe('basic rendering', () => {\n it('should render a simple leaf node', () => {\n const node = createLeafNode();\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText('Leaf Node')).toBeInTheDocument();\n });\n\n it('should render node with data-node-id attribute', () => {\n const node = createLeafNode({ id: 'test-id' });\n const { container } = render(<TreeNodeComponent node={node} />);\n\n expect(container.querySelector('[data-node-id=\"test-id\"]')).toBeInTheDocument();\n });\n\n it('should render node with data-depth attribute', () => {\n const node = createLeafNode({ depth: 3 });\n const { container } = render(<TreeNodeComponent node={node} />);\n\n expect(container.querySelector('[data-depth=\"3\"]')).toBeInTheDocument();\n });\n\n it('should render children recursively by default', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText('Parent')).toBeInTheDocument();\n expect(screen.getByText('Child 1')).toBeInTheDocument();\n expect(screen.getByText('Child 2')).toBeInTheDocument();\n });\n\n it('should render deeply nested structures', () => {\n const node = createDeepNode();\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText('Level 0')).toBeInTheDocument();\n expect(screen.getByText('Level 1')).toBeInTheDocument();\n expect(screen.getByText('Level 2')).toBeInTheDocument();\n expect(screen.getByText('Level 3')).toBeInTheDocument();\n expect(screen.getByText('Level 4')).toBeInTheDocument();\n });\n\n it('should show children count by default', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText('(2)')).toBeInTheDocument();\n });\n\n it('should hide children count when showChildrenCount is false', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} showChildrenCount={false} />);\n\n expect(screen.queryByText('(2)')).not.toBeInTheDocument();\n });\n\n it('should not show children count for leaf nodes', () => {\n const node = createLeafNode();\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.queryByText('(0)')).not.toBeInTheDocument();\n });\n });\n\n describe('non-recursive rendering', () => {\n it('should not render children when recursive is false', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} recursive={false} />);\n\n expect(screen.getByText('Parent')).toBeInTheDocument();\n expect(screen.queryByText('Child 1')).not.toBeInTheDocument();\n expect(screen.queryByText('Child 2')).not.toBeInTheDocument();\n });\n\n it('should still show children count when recursive is false', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} recursive={false} />);\n\n expect(screen.getByText('(2)')).toBeInTheDocument();\n });\n });\n\n describe('maxDepth prop', () => {\n it('should limit rendering to maxDepth', () => {\n const node = createDeepNode();\n render(<TreeNodeComponent node={node} maxDepth={2} />);\n\n expect(screen.getByText('Level 0')).toBeInTheDocument();\n expect(screen.getByText('Level 1')).toBeInTheDocument();\n expect(screen.getByText('Level 2')).toBeInTheDocument();\n expect(screen.queryByText('Level 3')).not.toBeInTheDocument();\n expect(screen.queryByText('Level 4')).not.toBeInTheDocument();\n });\n\n it('should render all levels when maxDepth is undefined', () => {\n const node = createDeepNode();\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText('Level 0')).toBeInTheDocument();\n expect(screen.getByText('Level 4')).toBeInTheDocument();\n });\n });\n\n describe('isExpanded prop', () => {\n it('should not render children when isExpanded is false', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} isExpanded={false} />);\n\n expect(screen.getByText('Parent')).toBeInTheDocument();\n expect(screen.queryByText('Child 1')).not.toBeInTheDocument();\n expect(screen.queryByText('Child 2')).not.toBeInTheDocument();\n });\n\n it('should render children when isExpanded is true', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} isExpanded={true} />);\n\n expect(screen.getByText('Child 1')).toBeInTheDocument();\n expect(screen.getByText('Child 2')).toBeInTheDocument();\n });\n\n it('should set aria-expanded attribute on nodes with children', () => {\n const node = createNodeWithChildren();\n const { container } = render(\n <TreeNodeComponent node={node} isExpanded={true} onNodeClick={() => {}} />\n );\n\n const label = container.querySelector('[data-node-id=\"parent-1\"] > .tree-node-label');\n expect(label).toHaveAttribute('aria-expanded', 'true');\n });\n\n it('should not set aria-expanded on leaf nodes', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeClick={() => {}} />\n );\n\n const label = container.querySelector('.tree-node-label');\n expect(label).not.toHaveAttribute('aria-expanded');\n });\n });\n\n describe('depth indicators', () => {\n it('should show depth indicators by default', () => {\n const node = createLeafNode();\n const { container } = render(<TreeNodeComponent node={node} />);\n\n expect(container.querySelector('.tree-node-bullet')).toBeInTheDocument();\n });\n\n it('should hide depth indicators when showDepthIndicators is false', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} showDepthIndicators={false} />\n );\n\n expect(container.querySelector('.tree-node-bullet')).not.toBeInTheDocument();\n });\n\n it('should have aria-hidden on depth indicator bullets', () => {\n const node = createLeafNode();\n const { container } = render(<TreeNodeComponent node={node} />);\n\n const bullet = container.querySelector('.tree-node-bullet');\n expect(bullet).toHaveAttribute('aria-hidden', 'true');\n });\n });\n\n describe('indentation', () => {\n it('should use default indent size of 24px', () => {\n const node = createLeafNode({ depth: 1 });\n const { container } = render(<TreeNodeComponent node={node} />);\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n // depth 1 _ 24 + 12 = 36px\n expect(label.style.paddingLeft).toBe('36px');\n });\n\n it('should apply custom indent size', () => {\n const node = createLeafNode({ depth: 1 });\n const { container } = render(<TreeNodeComponent node={node} indentSize={40} />);\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n // depth 1 _ 40 + 12 = 52px\n expect(label.style.paddingLeft).toBe('52px');\n });\n\n it('should correctly calculate indentation for deep nodes', () => {\n const node = createLeafNode({ depth: 3 });\n const { container } = render(<TreeNodeComponent node={node} indentSize={20} />);\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n // depth 3 \_ 20 + 12 = 72px\n expect(label.style.paddingLeft).toBe('72px');\n });\n });\n\n describe('click handling', () => {\n it('should call onNodeClick when node is clicked', () => {\n const node = createLeafNode();\n const handleClick = jest.fn();\n render(<TreeNodeComponent node={node} onNodeClick={handleClick} />);\n\n fireEvent.click(screen.getByText('Leaf Node'));\n\n expect(handleClick).toHaveBeenCalledTimes(1);\n expect(handleClick).toHaveBeenCalledWith(node);\n });\n\n it('should stop propagation on click', () => {\n const node = createNodeWithChildren();\n const handleClick = jest.fn();\n render(<TreeNodeComponent node={node} onNodeClick={handleClick} />);\n\n fireEvent.click(screen.getByText('Child 1'));\n\n // Should only be called once (not bubbling to parent)\n expect(handleClick).toHaveBeenCalledTimes(1);\n expect(handleClick).toHaveBeenCalledWith(\n expect.objectContaining({ id: 'child-1' })\n );\n });\n\n it('should have role=\"button\" when onNodeClick is provided', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeClick={() => {}} />\n );\n\n expect(container.querySelector('[role=\"button\"]')).toBeInTheDocument();\n });\n\n it('should not have role=\"button\" when onNodeClick is not provided', () => {\n const node = createLeafNode();\n const { container } = render(<TreeNodeComponent node={node} />);\n\n expect(container.querySelector('[role=\"button\"]')).not.toBeInTheDocument();\n });\n\n it('should be focusable when onNodeClick is provided', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeClick={() => {}} />\n );\n\n const label = container.querySelector('.tree-node-label');\n expect(label).toHaveAttribute('tabIndex', '0');\n });\n\n it('should not be focusable when onNodeClick is not provided', () => {\n const node = createLeafNode();\n const { container } = render(<TreeNodeComponent node={node} />);\n\n const label = container.querySelector('.tree-node-label');\n expect(label).not.toHaveAttribute('tabIndex');\n });\n });\n\n describe('keyboard navigation', () => {\n it('should trigger click on Enter key', () => {\n const node = createLeafNode();\n const handleClick = jest.fn();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeClick={handleClick} />\n );\n\n const label = container.querySelector('.tree-node-label');\n fireEvent.keyDown(label!, { key: 'Enter' });\n\n expect(handleClick).toHaveBeenCalledTimes(1);\n });\n\n it('should trigger click on Space key', () => {\n const node = createLeafNode();\n const handleClick = jest.fn();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeClick={handleClick} />\n );\n\n const label = container.querySelector('.tree-node-label');\n fireEvent.keyDown(label!, { key: ' ' });\n\n expect(handleClick).toHaveBeenCalledTimes(1);\n });\n\n it('should prevent default on Enter/Space', () => {\n const node = createLeafNode();\n const handleClick = jest.fn();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeClick={handleClick} />\n );\n\n const label = container.querySelector('.tree-node-label');\n const enterEvent = fireEvent.keyDown(label!, { key: 'Enter' });\n const spaceEvent = fireEvent.keyDown(label!, { key: ' ' });\n\n // fireEvent returns false if preventDefault was called\n expect(enterEvent).toBe(false);\n expect(spaceEvent).toBe(false);\n });\n });\n\n describe('hover handling', () => {\n it('should call onNodeHover with node on mouse enter', () => {\n const node = createLeafNode();\n const handleHover = jest.fn();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeHover={handleHover} />\n );\n\n const label = container.querySelector('.tree-node-label');\n fireEvent.mouseEnter(label!);\n\n expect(handleHover).toHaveBeenCalledWith(node);\n });\n\n it('should call onNodeHover with null on mouse leave', () => {\n const node = createLeafNode();\n const handleHover = jest.fn();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeHover={handleHover} />\n );\n\n const label = container.querySelector('.tree-node-label');\n fireEvent.mouseLeave(label!);\n\n expect(handleHover).toHaveBeenCalledWith(null);\n });\n });\n\n describe('focus handling', () => {\n it('should call onNodeFocus on focus', () => {\n const node = createLeafNode();\n const handleFocus = jest.fn();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeFocus={handleFocus} onNodeClick={() => {}} />\n );\n\n const label = container.querySelector('.tree-node-label');\n fireEvent.focus(label!);\n\n expect(handleFocus).toHaveBeenCalledWith(node);\n });\n\n it('should call onNodeBlur on blur', () => {\n const node = createLeafNode();\n const handleBlur = jest.fn();\n const { container } = render(\n <TreeNodeComponent node={node} onNodeBlur={handleBlur} onNodeClick={() => {}} />\n );\n\n const label = container.querySelector('.tree-node-label');\n fireEvent.blur(label!);\n\n expect(handleBlur).toHaveBeenCalledWith(node);\n });\n });\n\n describe('custom rendering', () => {\n it('should support custom renderLabel function', () => {\n const node = createLeafNode();\n render(\n <TreeNodeComponent\n node={node}\n renderLabel={(n) => <strong>Custom: {n.label}</strong>}\n />\n );\n\n expect(screen.getByText('Custom: Leaf Node')).toBeInTheDocument();\n });\n\n it('should support custom renderContent function', () => {\n const node = createLeafNode();\n render(\n <TreeNodeComponent\n node={node}\n renderContent={(n, defaultContent) => (\n <div data-testid=\"custom-content\">\n <span>Before</span>\n {defaultContent}\n <span>After</span>\n </div>\n )}\n />\n );\n\n expect(screen.getByTestId('custom-content')).toBeInTheDocument();\n expect(screen.getByText('Before')).toBeInTheDocument();\n expect(screen.getByText('After')).toBeInTheDocument();\n });\n\n it('should support custom renderChildren function', () => {\n const node = createNodeWithChildren();\n render(\n <TreeNodeComponent\n node={node}\n renderChildren={(n, children, defaultContainer) => (\n <div data-testid=\"custom-children\">\n <span>Children of {n.label}:</span>\n {defaultContainer}\n </div>\n )}\n />\n );\n\n expect(screen.getByTestId('custom-children')).toBeInTheDocument();\n expect(screen.getByText('Children of Parent:')).toBeInTheDocument();\n });\n });\n\n describe('styling', () => {\n it('should apply custom className to node container', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} className=\"my-custom-class\" />\n );\n\n expect(container.querySelector('.tree-node')).toHaveClass('my-custom-class');\n });\n\n it('should apply custom labelClassName to label', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} labelClassName=\"my-label-class\" />\n );\n\n expect(container.querySelector('.tree-node-label')).toHaveClass('my-label-class');\n });\n\n it('should apply custom fontSize', () => {\n const node = createLeafNode();\n const { container } = render(<TreeNodeComponent node={node} fontSize={18} />);\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n expect(label.style.fontSize).toBe('18px');\n });\n\n it('should apply styleOverrides', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent\n node={node}\n styleOverrides={{\n            backgroundColor: '#123456',\n            textColor: '#abcdef',\n            borderColor: '#fedcba',\n          }}\n />\n );\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n expect(label.style.backgroundColor).toBe('rgb(18, 52, 86)');\n expect(label.style.color).toBe('rgb(171, 205, 239)');\n expect(label.style.borderColor).toBe('rgb(254, 220, 186)');\n });\n\n it('should apply metadata style overrides', () => {\n const node = createNodeWithMetadata();\n const { container } = render(<TreeNodeComponent node={node} />);\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n expect(label.style.backgroundColor).toBe('rgb(255, 0, 0)');\n expect(label.style.color).toBe('rgb(255, 255, 255)');\n });\n\n it('should prefer prop styleOverrides over metadata styles', () => {\n const node = createNodeWithMetadata();\n const { container } = render(\n <TreeNodeComponent\n node={node}\n styleOverrides={{ backgroundColor: '#00ff00' }}\n />\n );\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n expect(label.style.backgroundColor).toBe('rgb(0, 255, 0)');\n });\n\n it('should show selection styling when isSelected is true', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} isSelected={true} />\n );\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n expect(label.style.outline).toBe('2px solid #3b82f6');\n });\n });\n\n describe('custom depth colors', () => {\n it('should use custom depth colors', () => {\n const node = createLeafNode({ depth: 0 });\n const customColors = {\n 0: { bg: '#ffff00', border: '#cccc00', text: '#000000' },\n };\n const { container } = render(\n <TreeNodeComponent node={node} depthColors={customColors} />\n );\n\n const label = container.querySelector('.tree-node-label') as HTMLElement;\n expect(label.style.backgroundColor).toBe('rgb(255, 255, 0)');\n });\n });\n\n describe('data attributes', () => {\n it('should apply custom data attributes', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent\n node={node}\n dataAttributes={{ 'data-custom': 'value', 'data-test': 'test-value' }}\n />\n );\n\n const nodeEl = container.querySelector('.tree-node');\n expect(nodeEl).toHaveAttribute('data-custom', 'value');\n expect(nodeEl).toHaveAttribute('data-test', 'test-value');\n });\n });\n\n describe('accessibility', () => {\n it('should apply custom role', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} role=\"treeitem\" />\n );\n\n expect(container.querySelector('[role=\"treeitem\"]')).toBeInTheDocument();\n });\n\n it('should apply aria-label', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} ariaLabel=\"Custom label\" onNodeClick={() => {}} />\n );\n\n const label = container.querySelector('.tree-node-label');\n expect(label).toHaveAttribute('aria-label', 'Custom label');\n });\n\n it('should set aria-selected when isSelected is true', () => {\n const node = createLeafNode();\n const { container } = render(\n <TreeNodeComponent node={node} isSelected={true} onNodeClick={() => {}} />\n );\n\n const label = container.querySelector('.tree-node-label');\n expect(label).toHaveAttribute('aria-selected', 'true');\n });\n\n it('should have aria-label for children count', () => {\n const node = createNodeWithChildren();\n render(<TreeNodeComponent node={node} />);\n\n const countSpan = screen.getByText('(2)');\n expect(countSpan).toHaveAttribute('aria-label', '2 children');\n });\n });\n\n describe('edge cases', () => {\n it('should handle empty label', () => {\n const node = createLeafNode({ label: '' });\n const { container } = render(<TreeNodeComponent node={node} />);\n\n expect(container.querySelector('[data-node-id=\"leaf-1\"]')).toBeInTheDocument();\n });\n\n it('should handle special characters in label', () => {\n const node = createLeafNode({ label: 'Products & Services <test>' });\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText('Products & Services <test>')).toBeInTheDocument();\n });\n\n it('should handle very long labels', () => {\n const longLabel = 'A'.repeat(500);\n const node = createLeafNode({ label: longLabel });\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText(longLabel)).toBeInTheDocument();\n });\n\n it('should handle empty children array', () => {\n const node = createLeafNode({ children: [] });\n render(<TreeNodeComponent node={node} />);\n\n expect(screen.getByText('Leaf Node')).toBeInTheDocument();\n expect(screen.queryByText('(0)')).not.toBeInTheDocument();\n });\n });\n});\n\n// ============================================================================\n// Utility Function Tests\n// ============================================================================\n\ndescribe('getDepthColor', () => {\n it('should return default colors for depth 0', () => {\n const color = getDepthColor(0);\n expect(color).toEqual(DEFAULT_DEPTH_COLORS[0]);\n });\n\n it('should cycle colors for depths >= 5', () => {\n const color5 = getDepthColor(5);\n const color0 = getDepthColor(0);\n expect(color5).toEqual(color0);\n });\n\n it('should use custom colors when provided', () => {\n const customColors = {\n 0: { bg: '#000', border: '#111', text: '#222' },\n };\n const color = getDepthColor(0, customColors);\n expect(color).toEqual(customColors[0]);\n });\n\n it('should fall back to default when custom colors are empty', () => {\n const color = getDepthColor(0, {});\n expect(color).toEqual(DEFAULT_DEPTH_COLORS[0]);\n });\n});\n\ndescribe('computeNodeStyles', () => {\n it('should compute basic styles', () => {\n const styles = computeNodeStyles(0, {\n indentSize: 24,\n showDepthIndicators: true,\n });\n\n expect(styles.paddingLeft).toBe('12px');\n expect(styles.borderRadius).toBe('4px');\n });\n\n it('should apply depth-based colors when showDepthIndicators is true', () => {\n const styles = computeNodeStyles(0, {\n indentSize: 24,\n showDepthIndicators: true,\n });\n\n expect(styles.backgroundColor).toBe(DEFAULT_DEPTH_COLORS[0].bg);\n expect(styles.color).toBe(DEFAULT_DEPTH_COLORS[0].text);\n });\n\n it('should not apply depth colors when showDepthIndicators is false', () => {\n const styles = computeNodeStyles(0, {\n indentSize: 24,\n showDepthIndicators: false,\n });\n\n expect(styles.backgroundColor).toBeUndefined();\n });\n\n it('should apply selection outline when isSelected is true', () => {\n const styles = computeNodeStyles(0, {\n indentSize: 24,\n showDepthIndicators: true,\n isSelected: true,\n });\n\n expect(styles.outline).toBe('2px solid #3b82f6');\n });\n});\n\ndescribe('computeBulletStyles', () => {\n it('should return correct bullet styles', () => {\n const styles = computeBulletStyles('#ff0000');\n\n expect(styles.backgroundColor).toBe('#ff0000');\n expect(styles.width).toBe('8px');\n expect(styles.height).toBe('8px');\n expect(styles.borderRadius).toBe('50%');\n });\n});\n\n// ============================================================================\n// Hook Tests\n// ============================================================================\n\ndescribe('useTreeNodeSelection', () => {\n it('should initialize with empty selection', () => {\n const { result } = renderHook(() => useTreeNodeSelection());\n\n expect(result.current.selectedIds.size).toBe(0);\n });\n\n it('should initialize with provided selected IDs', () => {\n const initial = new Set(['node-1', 'node-2']);\n const { result } = renderHook(() => useTreeNodeSelection(initial));\n\n expect(result.current.isSelected('node-1')).toBe(true);\n expect(result.current.isSelected('node-2')).toBe(true);\n });\n\n it('should toggle selection', () => {\n const { result } = renderHook(() => useTreeNodeSelection());\n\n act(() => {\n result.current.toggleSelection('node-1');\n });\n expect(result.current.isSelected('node-1')).toBe(true);\n\n act(() => {\n result.current.toggleSelection('node-1');\n });\n expect(result.current.isSelected('node-1')).toBe(false);\n });\n\n it('should select a single node', () => {\n const { result } = renderHook(() => useTreeNodeSelection());\n\n act(() => {\n result.current.selectNode('node-1');\n });\n\n expect(result.current.isSelected('node-1')).toBe(true);\n });\n\n it('should deselect a node', () => {\n const { result } = renderHook(() => useTreeNodeSelection(new Set(['node-1'])));\n\n act(() => {\n result.current.deselectNode('node-1');\n });\n\n expect(result.current.isSelected('node-1')).toBe(false);\n });\n\n it('should clear all selections', () => {\n const { result } = renderHook(() =>\n useTreeNodeSelection(new Set(['node-1', 'node-2']))\n );\n\n act(() => {\n result.current.clearSelection();\n });\n\n expect(result.current.selectedIds.size).toBe(0);\n });\n\n it('should select only one node', () => {\n const { result } = renderHook(() =>\n useTreeNodeSelection(new Set(['node-1', 'node-2']))\n );\n\n act(() => {\n result.current.selectOnly('node-3');\n });\n\n expect(result.current.selectedIds.size).toBe(1);\n expect(result.current.isSelected('node-3')).toBe(true);\n expect(result.current.isSelected('node-1')).toBe(false);\n });\n});\n\ndescribe('useTreeNodeExpansion', () => {\n it('should initialize with default expanded state', () => {\n const { result } = renderHook(() => useTreeNodeExpansion());\n\n expect(result.current.isExpanded('any-node')).toBe(true);\n });\n\n it('should initialize with custom default expanded state', () => {\n const { result } = renderHook(() => useTreeNodeExpansion(new Set(), false));\n\n expect(result.current.isExpanded('any-node')).toBe(false);\n });\n\n it('should toggle expansion', () => {\n const { result } = renderHook(() => useTreeNodeExpansion());\n\n act(() => {\n result.current.toggleExpansion('node-1');\n });\n\n // After toggle, should be in expandedIds set or not\n expect(result.current.expandedIds.has('node-1')).toBe(true);\n });\n\n it('should expand a node', () => {\n const { result } = renderHook(() => useTreeNodeExpansion(new Set(), false));\n\n act(() => {\n result.current.expandNode('node-1');\n });\n\n expect(result.current.isExpanded('node-1')).toBe(true);\n });\n\n it('should collapse a node', () => {\n const { result } = renderHook(() =>\n useTreeNodeExpansion(new Set(['node-1']), true)\n );\n\n act(() => {\n result.current.collapseNode('node-1');\n });\n\n expect(result.current.isExpanded('node-1')).toBe(false);\n });\n\n it('should expand all nodes', () => {\n const { result } = renderHook(() => useTreeNodeExpansion(new Set(), false));\n\n act(() => {\n result.current.expandAll(['node-1', 'node-2', 'node-3']);\n });\n\n expect(result.current.isExpanded('node-1')).toBe(true);\n expect(result.current.isExpanded('node-2')).toBe(true);\n expect(result.current.isExpanded('node-3')).toBe(true);\n });\n\n it('should collapse all nodes', () => {\n const { result } = renderHook(() =>\n useTreeNodeExpansion(new Set(['node-1', 'node-2']), true)\n );\n\n act(() => {\n result.current.collapseAll();\n });\n\n expect(result.current.expandedIds.size).toBe(0);\n });\n});\n\n// ============================================================================\n// Constants Tests\n// ============================================================================\n\ndescribe('DEFAULT_DEPTH_COLORS', () => {\n it('should have 5 depth levels defined', () => {\n expect(Object.keys(DEFAULT_DEPTH_COLORS)).toHaveLength(5);\n });\n\n it('should have valid color values for each depth', () => {\n Object.values(DEFAULT_DEPTH_COLORS).forEach((colors) => {\n expect(colors).toHaveProperty('bg');\n expect(colors).toHaveProperty('border');\n expect(colors).toHaveProperty('text');\n expect(colors.bg).toMatch(/^#[0-9a-fA-F]{6}$/);\n      expect(colors.border).toMatch(/^#[0-9a-fA-F]{6}$/);\n expect(colors.text).toMatch(/^#[0-9a-fA-F]{6}$/);\n });\n });\n});\n\ndescribe('DEFAULT_TREE_NODE_PROPS', () => {\n it('should have expected default values', () => {\n expect(DEFAULT_TREE_NODE_PROPS.indentSize).toBe(24);\n expect(DEFAULT_TREE_NODE_PROPS.showDepthIndicators).toBe(true);\n expect(DEFAULT_TREE_NODE_PROPS.fontSize).toBe(14);\n expect(DEFAULT_TREE_NODE_PROPS.showChildrenCount).toBe(true);\n expect(DEFAULT_TREE_NODE_PROPS.recursive).toBe(true);\n });\n});\n"
}

It looks like the linter modified my index file changes. Let me check what happened and re-add the exports if needed:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\index.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\index.ts"
}

I see the exports for the TreeNodeComponent were removed (likely a linter/formatter issue or the file wasn't saved properly). Let me re-add them:

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\index.ts",
"old_string": "/\*\*\n * Components Module\n _\n _ Exports all React components for the UX Sitemap Visualizer.\n _/\n\nexport { BasicTree, type BasicTreeProps } from './BasicTree';\nexport { default as BasicTreeDefault } from './BasicTree';",
"new_string": "/\*\*\n _ Components Module\n _\n _ Exports all React components for the UX Sitemap Visualizer.\n \_/\n\nexport { BasicTree, type BasicTreeProps } from './BasicTree';\nexport { default as BasicTreeDefault } from './BasicTree';\n\nexport {\n D3TreeDiagram,\n type D3TreeDiagramProps,\n type LayoutType,\n type LinkStyle,\n} from './D3TreeDiagram';\nexport { default as D3TreeDiagramDefault } from './D3TreeDiagram';\n\nexport {\n TreeNodeComponent,\n type TreeNodeComponentProps,\n type DepthColorConfig,\n DEFAULT_DEPTH_COLORS,\n DEFAULT_TREE_NODE_PROPS,\n getDepthColor,\n computeNodeStyles,\n computeBulletStyles,\n useTreeNodeSelection,\n useTreeNodeExpansion,\n} from './TreeNodeComponent';\nexport { default as TreeNodeComponentDefault } from './TreeNodeComponent';"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\index.ts"
}

The exports are already in place. Now let me check the main index file:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\index.ts"
}

The exports are in place. Let me update the todo and run the tests:

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create TreeNodeComponent.tsx with modular, reusable TreeNode component",
"status": "completed",
"activeForm": "Creating TreeNodeComponent.tsx"
},
{
"content": "Export TreeNodeComponent from components index",
"status": "completed",
"activeForm": "Exporting TreeNodeComponent from index"
},
{
"content": "Export TreeNodeComponent from main library index",
"status": "completed",
"activeForm": "Exporting from main library index"
},
{
"content": "Create comprehensive test suite for TreeNodeComponent",
"status": "completed",
"activeForm": "Creating test suite for TreeNodeComponent"
},
{
"content": "Run tests to verify implementation",
"status": "in_progress",
"activeForm": "Running tests to verify implementation"
}
]
}

🔧 Tool: Bash
Input: {
"command": "cd /d/applications/sitemap && npm test -- --testPathPattern=\"TreeNodeComponent\" --coverage --coveragePathPattern=\"TreeNodeComponent\" 2>&1",
"description": "Run TreeNodeComponent tests",
"timeout": 120000
}

🔧 Tool: Bash
Input: {
"command": "cd /d/applications/sitemap && npm test -- TreeNodeComponent.test.tsx 2>&1",
"description": "Run TreeNodeComponent tests",
"timeout": 120000
}

I need to fix the TypeScript errors in the test file - unused variables:

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\TreeNodeComponent.test.tsx",
"old_string": "import {\n TreeNodeComponent,\n TreeNodeComponentProps,\n DEFAULT_DEPTH_COLORS,\n DEFAULT_TREE_NODE_PROPS,\n getDepthColor,\n computeNodeStyles,\n computeBulletStyles,\n useTreeNodeSelection,\n useTreeNodeExpansion,\n} from '../components/TreeNodeComponent';",
"new_string": "import {\n TreeNodeComponent,\n DEFAULT_DEPTH_COLORS,\n DEFAULT_TREE_NODE_PROPS,\n getDepthColor,\n computeNodeStyles,\n computeBulletStyles,\n useTreeNodeSelection,\n useTreeNodeExpansion,\n} from '../components/TreeNodeComponent';"
}

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\TreeNodeComponent.test.tsx",
"old_string": " renderContent={(n, defaultContent) => (",
"new_string": " renderContent={(\_n, defaultContent) => ("
}

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\TreeNodeComponent.test.tsx",
"old_string": " renderChildren={(n, children, defaultContainer) => (",
"new_string": " renderChildren={(n, \_children, defaultContainer) => ("
}

Now let's run the tests again:

🔧 Tool: Bash
Input: {
"command": "cd /d/applications/sitemap && npm test -- TreeNodeComponent.test.tsx 2>&1",
"description": "Run TreeNodeComponent tests",
"timeout": 120000
}

All 81 tests pass. Let me also run the full test suite to make sure the integration is correct:

🔧 Tool: Bash
Input: {
"command": "cd /d/applications/sitemap && npm test 2>&1 | head -100",
"description": "Run full test suite",
"timeout": 180000
}

🔧 Tool: Bash
Input: {
"command": "cd /d/applications/sitemap && npm test 2>&1 | tail -50",
"description": "Check full test suite results",
"timeout": 180000
}

The test failures are in the D3TreeDiagram component tests (pre-existing issues related to D3 and JSDOM), not in our new TreeNodeComponent. Let me verify our new component's tests all pass:

🔧 Tool: Bash
Input: {
"command": "cd /d/applications/sitemap && npm test -- TreeNodeComponent.test.tsx BasicTree.test.tsx 2>&1",
"description": "Run TreeNodeComponent and BasicTree tests",
"timeout": 120000
}

All 124 tests pass (81 for TreeNodeComponent and 43 for BasicTree). Let me also verify the build compiles correctly:

🔧 Tool: Bash
Input: {
"command": "cd /d/applications/sitemap && npm run build 2>&1",
"description": "Build the project",
"timeout": 60000
}

The build completes successfully with no TypeScript errors. Let me update the todos and provide the summary:

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create TreeNodeComponent.tsx with modular, reusable TreeNode component",
"status": "completed",
"activeForm": "Creating TreeNodeComponent.tsx"
},
{
"content": "Export TreeNodeComponent from components index",
"status": "completed",
"activeForm": "Exporting TreeNodeComponent from index"
},
{
"content": "Export TreeNodeComponent from main library index",
"status": "completed",
"activeForm": "Exporting from main library index"
},
{
"content": "Create comprehensive test suite for TreeNodeComponent",
"status": "completed",
"activeForm": "Creating test suite for TreeNodeComponent"
},
{
"content": "Run tests to verify implementation",
"status": "completed",
"activeForm": "Running tests to verify implementation"
}
]
}

<summary>
## Summary: Extract node rendering logic into a modular, reusable TreeNode component

### Changes Implemented

- Created a new `TreeNodeComponent` that extracts node rendering logic from `BasicTree` into a standalone, reusable component
- Implemented recursive rendering of nested tree structures with configurable depth limiting (`maxDepth` prop)
- Added comprehensive props for styling customization:
    - `styleOverrides` for custom background, text, and border colors
    - `depthColors` for custom depth-based color schemes
    - `className` and `labelClassName` for CSS class customization
    - `fontSize` and `indentSize` for typography and layout control
- Implemented interaction handlers:
    - `onNodeClick` for click events with keyboard navigation (Enter/Space)
    - `onNodeHover` for hover events
    - `onNodeFocus` and `onNodeBlur` for focus management
- Added custom rendering support:
    - `renderLabel` for custom label content
    - `renderContent` for custom node content
    - `renderChildren` for custom children container
- Implemented selection and expansion state management:
    - `isSelected` prop with visual feedback (outline)
    - `isExpanded` prop for controlling children visibility
    - `useTreeNodeSelection` hook for managing selection state
    - `useTreeNodeExpansion` hook for managing expansion state
- Added accessibility features:
    - ARIA attributes (`aria-expanded`, `aria-selected`, `aria-label`)
    - Keyboard navigation support
    - Screen reader-friendly markup
- Exported utility functions for external use:
    - `getDepthColor` - Get color configuration for a depth level
    - `computeNodeStyles` - Compute inline styles for nodes
    - `computeBulletStyles` - Compute styles for depth indicator bullets
    - `DEFAULT_DEPTH_COLORS` - Default color scheme
    - `DEFAULT_TREE_NODE_PROPS` - Default prop values

### Files Modified

- `src/components/TreeNodeComponent.tsx` (NEW) - Main component implementation (~500 lines)
- `src/components/index.ts` - Added TreeNodeComponent exports
- `src/index.ts` - Added TreeNodeComponent to library exports
- `src/__tests__/TreeNodeComponent.test.tsx` (NEW) - Comprehensive test suite (81 tests)

### Notes for Developer

- The TreeNodeComponent is designed to be used both standalone and as a building block for more complex tree components
- The component follows the same styling patterns and conventions as the existing BasicTree component
- Metadata style overrides from nodes are automatically merged with prop-based overrides (props take precedence)
- The `useTreeNodeSelection` and `useTreeNodeExpansion` hooks can be used independently to manage tree state
- All 81 TreeNodeComponent tests pass, and the build compiles without errors
- The D3TreeDiagram test failures are pre-existing issues unrelated to this feature
      </summary>
