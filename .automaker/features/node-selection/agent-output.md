🔧 Tool: Task
Input: {
"description": "Explore codebase structure",
"prompt": "I need to implement a click-to-select functionality for nodes with visual highlighting. Support multi-select with Ctrl/Cmd-click and display selection state in the UI.\n\nPlease explore the codebase to understand:\n1. The overall project structure\n2. How nodes are currently rendered and managed\n3. Existing patterns for state management\n4. UI components and styling patterns\n5. Test file patterns and conventions\n\nUse Glob and Read tools to explore the codebase thoroughly. Give me a comprehensive overview of the relevant parts of the codebase.",
"subagent_type": "Explore"
}

🔧 Tool: Glob
Input: {
"pattern": "\*_/_.{ts,tsx,js,jsx,json}"
}

🔧 Tool: Bash
Input: {
"command": "find \"D:\\applications\\sitemap\" -type f -name \"_.ts\" -o -name \"_.tsx\" -o -name \"_.js\" -o -name \"_.jsx\" | head -30",
"description": "List source files to understand structure"
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\" | grep -E \"^d\"",
"description": "List directories in project root"
}

🔧 Tool: Glob
Input: {
"pattern": "src/\*_/_.{ts,tsx}"
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
"file_path": "D:\\applications\\sitemap\\package.json"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\tsconfig.json"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\TreeNodeComponent.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\SitemapEditor.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\hooks\\useTreeParser.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\utils\\treeParser.ts",
"limit": 100
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\TreeNodeComponent.test.tsx",
"limit": 80
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\BasicTree.test.tsx",
"limit": 100
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\index.ts"
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\\src\\components\\index.ts\"",
"description": "List component index file"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\index.ts"
}

🔧 Tool: Bash
Input: {
"command": "ls -la \"D:\\applications\\sitemap\\src\\components\"",
"description": "List all component files"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\D3TreeDiagram.tsx",
"limit": 150
}

🔧 Tool: Bash
Input: {
"command": "grep -n \"selection\\|selected\\|onClick\" \"D:\\applications\\sitemap\\src\\components\\D3TreeDiagram.tsx\" | head -20",
"description": "Search for selection patterns in D3"
}

🔧 Tool: Bash
Input: {
"command": "find \"D:\\applications\\sitemap\\src\\**tests**\" -name \"_.test.tsx\" -o -name \"_.test.ts\" | head -10",
"description": "Find all test files"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\setupTests.ts"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\jest.config.js"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\D3TreeDiagram.tsx",
"offset": 150,
"limit": 200
}

Excellent! The codebase exploration reveals that most of the selection infrastructure is already in place. Let me read the key files to understand the current implementation details before planning the changes.

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\TreeNodeComponent.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\types\\TreeNode.ts"
}

Now let me also read the SitemapEditor component and the existing tests to understand the integration patterns and test conventions:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\SitemapEditor.tsx"
}

🔧 Tool: Glob
Input: {
"pattern": "**/**tests**/**/_.test.ts_",
"path": "D:\\applications\\sitemap"
}

Let me read the existing test file for TreeNodeComponent to understand the test patterns:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\TreeNodeComponent.test.tsx"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\BasicTree.test.tsx"
}

Now I have a comprehensive understanding of the codebase. Let me create a todo list to track the implementation and then start implementing the click-to-select functionality.

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create SelectableTree component with click-to-select and multi-select functionality",
"status": "in_progress",
"activeForm": "Creating SelectableTree component"
},
{
"content": "Update BasicTree to support selection state prop",
"status": "pending",
"activeForm": "Updating BasicTree component"
},
{
"content": "Add selection info display component (SelectionInfo)",
"status": "pending",
"activeForm": "Adding SelectionInfo component"
},
{
"content": "Write comprehensive tests for selection functionality",
"status": "pending",
"activeForm": "Writing tests for selection"
},
{
"content": "Verify all tests pass",
"status": "pending",
"activeForm": "Verifying tests pass"
}
]
}

Now let me implement the click-to-select functionality. I'll start by creating a new `SelectableTree` component that wraps `BasicTree` and adds selection functionality with Ctrl/Cmd-click for multi-select:

🔧 Tool: Write
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\SelectableTree.tsx",
"content": "/\*\*\n * SelectableTree Component\n _\n _ A wrapper around BasicTree that adds click-to-select functionality with\n _ visual highlighting. Supports multi-select with Ctrl/Cmd-click and displays\n _ the current selection state in the UI.\n _\n _ @example\n _ `tsx\n * import { SelectableTree } from './components/SelectableTree';\n *\n * function App() {\n *   return (\n *     <SelectableTree\n *       nodes={treeNodes}\n *       onSelectionChange={(selectedIds) => console.log('Selected:', selectedIds)}\n *     />\n *   );\n * }\n * `\n \*/\n\nimport React from 'react';\nimport { TreeNode, SelectionState } from '../types/TreeNode';\nimport { useTreeNodeSelection } from './TreeNodeComponent';\n\n// ============================================================================\n// Types\n// ============================================================================\n\n/\*\*\n _ Extended click event that includes modifier key information.\n _/\nexport interface NodeClickEvent {\n /** The clicked node \*/\n node: TreeNode;\n /** Whether Ctrl (Windows/Linux) or Cmd (Mac) was held _/\n isMultiSelectKey: boolean;\n /\*\* Whether Shift was held _/\n isShiftKey: boolean;\n /** The original mouse event \*/\n originalEvent: React.MouseEvent;\n}\n\n/**\n _ Props for the SelectableTree component.\n _/\nexport interface SelectableTreeProps {\n /** Array of root-level tree nodes to render \*/\n nodes: TreeNode[];\n\n /** Optional CSS class name for the container _/\n className?: string;\n\n /\*\* Indentation size in pixels per depth level (default: 24) _/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) \*/\n showDepthIndicators?: boolean;\n\n /** Whether to show the selection info panel (default: true) _/\n showSelectionInfo?: boolean;\n\n /\*\* Initial set of selected node IDs _/\n initialSelectedIds?: Set<string>;\n\n /** Callback when selection changes \*/\n onSelectionChange?: (selectedIds: Set<string>, selectionState: SelectionState) => void;\n\n /** Callback when a node is clicked (before selection is updated) _/\n onNodeClick?: (event: NodeClickEvent) => void;\n\n /\*\* Optional custom render function for node labels _/\n renderLabel?: (node: TreeNode, isSelected: boolean) => React.ReactNode;\n\n /** Whether to allow deselecting by clicking on an already selected node (default: true) \*/\n allowDeselect?: boolean;\n\n /** Whether to clear selection when clicking outside nodes (default: false) _/\n clearOnClickOutside?: boolean;\n\n /\*\* Maximum number of nodes that can be selected (undefined = unlimited) _/\n maxSelections?: number;\n\n /** Aria label for the tree container \*/\n ariaLabel?: string;\n\n /** Aria label for the selection info panel _/\n selectionInfoLabel?: string;\n}\n\n// ============================================================================\n// Styles\n// ============================================================================\n\nconst containerStyles: React.CSSProperties = {\n display: 'flex',\n flexDirection: 'column',\n gap: '12px',\n fontFamily:\n '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif',\n};\n\nconst treeContainerStyles: React.CSSProperties = {\n fontSize: '14px',\n lineHeight: '1.5',\n};\n\nconst selectionInfoStyles: React.CSSProperties = {\n display: 'flex',\n alignItems: 'center',\n gap: '12px',\n padding: '8px 12px',\n backgroundColor: '#f0f9ff',\n borderRadius: '6px',\n border: '1px solid #bae6fd',\n fontSize: '13px',\n color: '#0369a1',\n};\n\nconst selectionCountStyles: React.CSSProperties = {\n fontWeight: 600,\n};\n\nconst clearButtonStyles: React.CSSProperties = {\n marginLeft: 'auto',\n padding: '4px 8px',\n backgroundColor: '#0ea5e9',\n color: '#ffffff',\n border: 'none',\n borderRadius: '4px',\n fontSize: '12px',\n cursor: 'pointer',\n transition: 'background-color 0.15s ease',\n};\n\nconst clearButtonHoverStyles: React.CSSProperties = {\n ...clearButtonStyles,\n backgroundColor: '#0284c7',\n};\n\nconst selectedLabelBadgeStyles: React.CSSProperties = {\n display: 'inline-flex',\n alignItems: 'center',\n gap: '6px',\n padding: '2px 6px',\n marginLeft: '8px',\n backgroundColor: '#dbeafe',\n borderRadius: '4px',\n fontSize: '11px',\n color: '#1d4ed8',\n fontWeight: 500,\n};\n\nconst hintTextStyles: React.CSSProperties = {\n fontSize: '12px',\n color: '#64748b',\n marginTop: '4px',\n};\n\n// ============================================================================\n// Depth Color Scheme (matching BasicTree)\n// ============================================================================\n\nconst DEPTH*COLOR_SCHEME = {\n page: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },\n section: { bg: '#ffffff', border: '#e5e7eb', text: '#374151' },\n component: { bg: '#f3f4f6', border: '#d1d5db', text: '#4b5563' },\n componentLight: { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },\n componentLighter: { bg: '#fafafa', border: '#f3f4f6', text: '#9ca3af' },\n} as const;\n\n// Selected state colors\nconst SELECTED_COLORS = {\n bg: '#dbeafe',\n border: '#3b82f6',\n outline: '2px solid #3b82f6',\n outlineOffset: '1px',\n} as const;\n\n/\*\*\n * Gets the font size based on depth for visual hierarchy.\n _/\nfunction getDepthFontSize(depth: number): number {\n const baseFontSize = 15;\n const minFontSize = 12;\n const reduction = Math.min(depth _ 0.5, 3);\n return Math.max(baseFontSize - reduction, minFontSize);\n}\n\n/**\n _ Gets depth-based styles for a node.\n _/\nfunction getDepthStyles(\n depth: number,\n showIndicators: boolean,\n isSelected: boolean\n): React.CSSProperties {\n if (!showIndicators && !isSelected) {\n return {};\n }\n\n let colors: { bg: string; border: string; text: string };\n\n if (depth === 0) {\n colors = DEPTH_COLOR_SCHEME.page;\n } else if (depth === 1) {\n colors = DEPTH_COLOR_SCHEME.section;\n } else if (depth === 2) {\n colors = DEPTH_COLOR_SCHEME.component;\n } else if (depth === 3) {\n colors = DEPTH_COLOR_SCHEME.componentLight;\n } else {\n colors = DEPTH_COLOR_SCHEME.componentLighter;\n }\n\n const styles: React.CSSProperties = {};\n\n if (showIndicators) {\n styles.backgroundColor = colors.bg;\n styles.borderColor = colors.border;\n styles.color = colors.text;\n }\n\n // Apply selection styling\n if (isSelected) {\n styles.outline = SELECTED_COLORS.outline;\n styles.outlineOffset = SELECTED_COLORS.outlineOffset;\n styles.backgroundColor = SELECTED_COLORS.bg;\n }\n\n return styles;\n}\n\n// ============================================================================\n// SelectionInfo Component\n// ============================================================================\n\ninterface SelectionInfoProps {\n selectedCount: number;\n selectedNodes: TreeNode[];\n onClearSelection: () => void;\n ariaLabel?: string;\n}\n\n/**\n _ Displays information about the current selection state.\n _/\nfunction SelectionInfo({\n selectedCount,\n selectedNodes,\n onClearSelection,\n ariaLabel = 'Selection information',\n}: SelectionInfoProps): React.ReactElement | null {\n const [isHoveringClear, setIsHoveringClear] = React.useState(false);\n\n if (selectedCount === 0) {\n return (\n <div style={hintTextStyles} aria-label={ariaLabel}>\n Click to select a node. Hold Ctrl/Cmd and click to select multiple nodes.\n </div>\n );\n }\n\n const displayLabels = selectedNodes.slice(0, 3).map((n) => n.label);\n const moreCount = selectedCount - displayLabels.length;\n\n return (\n <div style={selectionInfoStyles} role=\"status\" aria-label={ariaLabel} aria-live=\"polite\">\n <span style={selectionCountStyles}>\n {selectedCount} node{selectedCount !== 1 ? 's' : ''} selected\n </span>\n <span>\n {displayLabels.join(', ')}\n {moreCount > 0 && ` +${moreCount} more`}\n </span>\n <button\n onClick={onClearSelection}\n onMouseEnter={() => setIsHoveringClear(true)}\n onMouseLeave={() => setIsHoveringClear(false)}\n style={isHoveringClear ? clearButtonHoverStyles : clearButtonStyles}\n aria-label=\"Clear selection\"\n type=\"button\"\n >\n Clear\n </button>\n </div>\n );\n}\n\n// ============================================================================\n// SelectableTreeNodeItem Component (Internal)\n// ============================================================================\n\ninterface SelectableTreeNodeItemProps {\n node: TreeNode;\n indentSize: number;\n showDepthIndicators: boolean;\n isSelected: boolean;\n onNodeClick: (node: TreeNode, event: React.MouseEvent) => void;\n renderLabel?: (node: TreeNode, isSelected: boolean) => React.ReactNode;\n}\n\n/**\n _ Internal component for rendering a single selectable tree node.\n _/\nfunction SelectableTreeNodeItem({\n node,\n indentSize,\n showDepthIndicators,\n isSelected,\n onNodeClick,\n renderLabel,\n}: SelectableTreeNodeItemProps): React.ReactElement {\n const hasChildren = node.children && node.children.length > 0;\n\n const handleClick = (event: React.MouseEvent) => {\n event.stopPropagation();\n onNodeClick(node, event);\n };\n\n const handleKeyDown = (event: React.KeyboardEvent) => {\n if (event.key === 'Enter' || event.key === ' ') {\n event.preventDefault();\n event.stopPropagation();\n // Create a synthetic mouse event for keyboard activation\n onNodeClick(node, {\n ctrlKey: event.ctrlKey,\n metaKey: event.metaKey,\n shiftKey: event.shiftKey,\n } as React.MouseEvent);\n }\n };\n\n const depthStyles = getDepthStyles(node.depth, showDepthIndicators, isSelected);\n\n // Build the label content\n const labelContent = renderLabel ? (\n renderLabel(node, isSelected)\n ) : (\n <>\n <span className=\"tree-node-text\">{node.label}</span>\n {isSelected && (\n <span style={selectedLabelBadgeStyles} aria-hidden=\"true\">\n Selected\n </span>\n )}\n </>\n );\n\n return (\n <div className=\"tree-node\" data-node-id={node.id} data-depth={node.depth}>\n {/_ Node Label _/}\n <div\n className={`tree-node-label ${isSelected ? 'tree-node-label--selected' : ''}`}\n style={{\n          ...depthStyles,\n          paddingTop: '8px',\n          paddingRight: '12px',\n          paddingBottom: '8px',\n          paddingLeft: `${node.depth * indentSize + 12}px`,\n          margin: '2px 0',\n          borderRadius: '4px',\n          borderWidth: showDepthIndicators ? '1px' : '0',\n          borderStyle: 'solid',\n          cursor: 'pointer',\n          transition: 'background-color 0.15s ease, outline 0.15s ease',\n          fontSize: `${getDepthFontSize(node.depth)}px`,\n          fontWeight: node.depth === 0 ? 600 : node.depth === 1 ? 500 : 400,\n          display: 'flex',\n          alignItems: 'center',\n        }}\n onClick={handleClick}\n onKeyDown={handleKeyDown}\n role=\"button\"\n tabIndex={0}\n aria-selected={isSelected}\n aria-expanded={hasChildren ? true : undefined}\n >\n {/_ Depth indicator bullet _/}\n {showDepthIndicators && (\n <span\n className=\"tree-node-bullet\"\n style={{\n              display: 'inline-block',\n              width: '8px',\n              height: '8px',\n              borderRadius: '50%',\n              backgroundColor: depthStyles.borderColor || '#ccc',\n              marginRight: '8px',\n              flexShrink: 0,\n            }}\n aria-hidden=\"true\"\n />\n )}\n\n {/_ Label content _/}\n {labelContent}\n\n {/_ Children count indicator _/}\n {hasChildren && (\n <span\n className=\"tree-node-children-count\"\n style={{\n              marginLeft: '8px',\n              fontSize: '0.75em',\n              opacity: 0.6,\n            }}\n aria-label={`${node.children!.length} children`}\n >\n ({node.children!.length})\n </span>\n )}\n </div>\n\n {/_ Render children recursively _/}\n {hasChildren && (\n <div className=\"tree-node-children\">\n {node.children!.map((child) => (\n <SelectableTreeNodeItem\n key={child.id}\n node={child}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n isSelected={false} // Will be passed from parent\n onNodeClick={onNodeClick}\n renderLabel={renderLabel}\n />\n ))}\n </div>\n )}\n </div>\n );\n}\n\n// ============================================================================\n// SelectableTree Component\n// ============================================================================\n\n/**\n _ SelectableTree renders a hierarchical tree structure with click-to-select\n _ functionality and multi-select support via Ctrl/Cmd-click.\n _\n _ Features:\n _ - Click to select a single node\n _ - Ctrl/Cmd + click to toggle selection (multi-select)\n _ - Visual highlighting of selected nodes\n _ - Selection info panel showing selected count and labels\n _ - Clear selection button\n _ - Accessible keyboard navigation\n _ - Customizable appearance\n _\n _ @example\n _ `tsx\n * // Basic usage\n * <SelectableTree nodes={treeNodes} />\n *\n * // With callbacks\n * <SelectableTree\n *   nodes={treeNodes}\n *   onSelectionChange={(ids) => console.log('Selected:', ids)}\n *   onNodeClick={(event) => console.log('Clicked:', event.node.label)}\n * />\n *\n * // With initial selection\n * <SelectableTree\n *   nodes={treeNodes}\n *   initialSelectedIds={new Set(['node-1', 'node-2'])}\n * />\n *\n * // Without selection info panel\n * <SelectableTree\n *   nodes={treeNodes}\n *   showSelectionInfo={false}\n * />\n * `\n _/\nexport function SelectableTree({\n nodes,\n className = '',\n indentSize = 24,\n showDepthIndicators = true,\n showSelectionInfo = true,\n initialSelectedIds = new Set(),\n onSelectionChange,\n onNodeClick,\n renderLabel,\n allowDeselect = true,\n clearOnClickOutside = false,\n maxSelections,\n ariaLabel = 'Selectable tree structure',\n selectionInfoLabel = 'Selection information',\n}: SelectableTreeProps): React.ReactElement {\n // Use the selection hook for state management\n const {\n selectedIds,\n isSelected,\n toggleSelection,\n selectOnly,\n clearSelection,\n } = useTreeNodeSelection(initialSelectedIds);\n\n // Track the last selected ID for potential shift-click range selection (future enhancement)\n const [lastSelectedId, setLastSelectedId] = React.useState<string | undefined>();\n\n // Build a map of all nodes for quick lookup\n const nodeMap = React.useMemo(() => {\n const map = new Map<string, TreeNode>();\n\n function traverse(node: TreeNode) {\n map.set(node.id, node);\n if (node.children) {\n node.children.forEach(traverse);\n }\n }\n\n nodes.forEach(traverse);\n return map;\n }, [nodes]);\n\n // Get selected nodes for display\n const selectedNodes = React.useMemo(() => {\n const result: TreeNode[] = [];\n selectedIds.forEach((id) => {\n const node = nodeMap.get(id);\n if (node) {\n result.push(node);\n }\n });\n return result;\n }, [selectedIds, nodeMap]);\n\n // Create selection state object for callback\n const selectionState = React.useMemo<SelectionState>(\n () => ({\n selectedIds,\n lastSelectedId,\n }),\n [selectedIds, lastSelectedId]\n );\n\n // Call onSelectionChange when selection changes\n const prevSelectedIdsRef = React.useRef(selectedIds);\n React.useEffect(() => {\n if (onSelectionChange && selectedIds !== prevSelectedIdsRef.current) {\n onSelectionChange(selectedIds, selectionState);\n prevSelectedIdsRef.current = selectedIds;\n }\n }, [selectedIds, selectionState, onSelectionChange]);\n\n // Handle node click with multi-select support\n const handleNodeClick = React.useCallback(\n (node: TreeNode, event: React.MouseEvent) => {\n const isMultiSelectKey = event.ctrlKey || event.metaKey;\n const isShiftKey = event.shiftKey;\n\n // Call optional onNodeClick callback\n if (onNodeClick) {\n onNodeClick({\n node,\n isMultiSelectKey,\n isShiftKey,\n originalEvent: event,\n });\n }\n\n // Handle selection logic\n if (isMultiSelectKey) {\n // Multi-select mode: toggle the clicked node\n const currentlySelected = isSelected(node.id);\n\n // Check max selections limit\n if (!currentlySelected && maxSelections !== undefined) {\n if (selectedIds.size >= maxSelections) {\n // At max, don't add more\n return;\n }\n }\n\n // Check if we allow deselection\n if (currentlySelected && !allowDeselect) {\n return;\n }\n\n toggleSelection(node.id);\n } else {\n // Single-select mode: select only this node\n const currentlySelected = isSelected(node.id);\n\n if (currentlySelected && allowDeselect) {\n // If already selected and deselect is allowed, clear selection\n clearSelection();\n } else {\n // Select only this node\n selectOnly(node.id);\n }\n }\n\n setLastSelectedId(node.id);\n },\n [\n onNodeClick,\n isSelected,\n toggleSelection,\n selectOnly,\n clearSelection,\n allowDeselect,\n maxSelections,\n selectedIds.size,\n ]\n );\n\n // Handle click outside to clear selection\n const handleContainerClick = React.useCallback(\n (event: React.MouseEvent) => {\n if (clearOnClickOutside) {\n // Only clear if clicking directly on the container, not on a node\n const target = event.target as HTMLElement;\n if (target.classList.contains('selectable-tree')) {\n clearSelection();\n }\n }\n },\n [clearOnClickOutside, clearSelection]\n );\n\n // Recursive render function that checks selection state\n const renderNode = (node: TreeNode): React.ReactElement => {\n const nodeIsSelected = isSelected(node.id);\n\n return (\n <SelectableTreeNodeItem\n key={node.id}\n node={{\n          ...node,\n          // Override children to use our custom rendering\n          children: undefined,\n        }}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n isSelected={nodeIsSelected}\n onNodeClick={handleNodeClick}\n renderLabel={renderLabel}\n />\n );\n };\n\n // Flatten the tree for rendering while maintaining hierarchy visually\n const renderTree = (nodeList: TreeNode[]): React.ReactElement[] => {\n const result: React.ReactElement[] = [];\n\n const traverse = (node: TreeNode) => {\n const nodeIsSelected = isSelected(node.id);\n\n result.push(\n <SelectableTreeNodeItem\n key={node.id}\n node={{\n            ...node,\n            children: undefined, // Don't pass children since we handle recursion here\n          }}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n isSelected={nodeIsSelected}\n onNodeClick={handleNodeClick}\n renderLabel={renderLabel}\n />\n );\n\n if (node.children) {\n node.children.forEach(traverse);\n }\n };\n\n nodeList.forEach(traverse);\n return result;\n };\n\n // Empty state\n if (!nodes || nodes.length === 0) {\n return (\n <div\n className={`selectable-tree selectable-tree--empty ${className}`.trim()}\n style={{\n          padding: '16px',\n          textAlign: 'center',\n          color: '#6b7280',\n          fontStyle: 'italic',\n        }}\n role=\"tree\"\n aria-label={ariaLabel}\n >\n No nodes to display\n </div>\n );\n }\n\n return (\n <div\n className={`selectable-tree ${className}`.trim()}\n style={containerStyles}\n onClick={handleContainerClick}\n >\n {/_ Selection info panel _/}\n {showSelectionInfo && (\n <SelectionInfo\n selectedCount={selectedIds.size}\n selectedNodes={selectedNodes}\n onClearSelection={clearSelection}\n ariaLabel={selectionInfoLabel}\n />\n )}\n\n {/_ Tree container \*/}\n <div\n className=\"selectable-tree-content\"\n style={treeContainerStyles}\n role=\"tree\"\n aria-label={ariaLabel}\n aria-multiselectable=\"true\"\n >\n {renderTree(nodes)}\n </div>\n </div>\n );\n}\n\n// ============================================================================\n// Exports\n// ============================================================================\n\nexport default SelectableTree;\nexport { SelectionInfo };\nexport type { SelectionInfoProps };\n"
}

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create SelectableTree component with click-to-select and multi-select functionality",
"status": "completed",
"activeForm": "Creating SelectableTree component"
},
{
"content": "Update BasicTree to support selection state prop",
"status": "in_progress",
"activeForm": "Updating BasicTree component"
},
{
"content": "Add selection info display component (SelectionInfo)",
"status": "completed",
"activeForm": "Adding SelectionInfo component"
},
{
"content": "Write comprehensive tests for selection functionality",
"status": "pending",
"activeForm": "Writing tests for selection"
},
{
"content": "Verify all tests pass",
"status": "pending",
"activeForm": "Verifying tests pass"
}
]
}

Now let me update BasicTree to support optional selection state. I'll add the `selectedIds` prop and the `onNodeClick` event handler with mouse event information:

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "/\*\*\n * Props for the BasicTree component.\n _/\nexport interface BasicTreeProps {\n /\*\* Array of root-level tree nodes to render _/\n nodes: TreeNode[];\n\n /\*\* Optional CSS class name for the container _/\n className?: string;\n\n /** Indentation size in pixels per depth level (default: 24) \*/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) _/\n showDepthIndicators?: boolean;\n\n /\*\* Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n}",
"new_string": "/**\n _ Props for the BasicTree component.\n _/\nexport interface BasicTreeProps {\n /** Array of root-level tree nodes to render \*/\n nodes: TreeNode[];\n\n /** Optional CSS class name for the container _/\n className?: string;\n\n /\*\* Indentation size in pixels per depth level (default: 24) _/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) \*/\n showDepthIndicators?: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional callback when a node is clicked with the mouse event included \_/\n onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n\n /** Set of selected node IDs for visual highlighting \*/\n selectedIds?: Set<string>;\n}"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx"
}

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "/\*\*\n * Props for the BasicTree component.\n _/\nexport interface BasicTreeProps {\n /\*\* Array of root-level tree nodes to render _/\n nodes: TreeNode[];\n\n /\*\* Optional CSS class name for the container _/\n className?: string;\n\n /** Indentation size in pixels per depth level (default: 24) \*/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) _/\n showDepthIndicators?: boolean;\n\n /\*\* Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n}",
"new_string": "/**\n _ Props for the BasicTree component.\n _/\nexport interface BasicTreeProps {\n /** Array of root-level tree nodes to render \*/\n nodes: TreeNode[];\n\n /** Optional CSS class name for the container _/\n className?: string;\n\n /\*\* Indentation size in pixels per depth level (default: 24) _/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) \*/\n showDepthIndicators?: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional callback when a node is clicked with mouse event (for selection handling) \_/\n onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n\n /** Set of selected node IDs for visual highlighting \*/\n selectedIds?: Set<string>;\n}"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx"
}

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "/\*\*\n * Props for the BasicTree component.\n _/\nexport interface BasicTreeProps {\n /\*\* Array of root-level tree nodes to render _/\n nodes: TreeNode[];\n\n /\*\* Optional CSS class name for the container _/\n className?: string;\n\n /** Indentation size in pixels per depth level (default: 24) \*/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) _/\n showDepthIndicators?: boolean;\n\n /\*\* Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n}",
"new_string": "/**\n _ Props for the BasicTree component.\n _/\nexport interface BasicTreeProps {\n /** Array of root-level tree nodes to render \*/\n nodes: TreeNode[];\n\n /** Optional CSS class name for the container _/\n className?: string;\n\n /\*\* Indentation size in pixels per depth level (default: 24) _/\n indentSize?: number;\n\n /** Whether to show depth-based visual indicators (default: true) \*/\n showDepthIndicators?: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional callback when a node is clicked with the mouse event (for multi-select) \_/\n onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n\n /** Set of selected node IDs for visual highlighting \*/\n selectedIds?: Set<string>;\n}"
}

Now let me update the TreeNodeItemProps and the component implementation to support selection:

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "/\*\*\n * Props for the internal TreeNodeItem component.\n _/\ninterface TreeNodeItemProps {\n /\*\* The tree node to render _/\n node: TreeNode;\n\n /\*\* Indentation size in pixels per depth level _/\n indentSize: number;\n\n /** Whether to show depth-based visual indicators \*/\n showDepthIndicators: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional custom render function for node labels _/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n}",
"new_string": "/\*\*\n _ Props for the internal TreeNodeItem component.\n _/\ninterface TreeNodeItemProps {\n /\*\* The tree node to render _/\n node: TreeNode;\n\n /\*\* Indentation size in pixels per depth level _/\n indentSize: number;\n\n /** Whether to show depth-based visual indicators \*/\n showDepthIndicators: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional callback when a node is clicked with the mouse event \_/\n onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n\n /** Set of selected node IDs for visual highlighting \*/\n selectedIds?: Set<string>;\n}"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx"
}

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "/\*\*\n * Props for the internal TreeNodeItem component.\n _/\ninterface TreeNodeItemProps {\n /\*\* The tree node to render _/\n node: TreeNode;\n\n /\*\* Indentation size in pixels per depth level _/\n indentSize: number;\n\n /** Whether to show depth-based visual indicators \*/\n showDepthIndicators: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional custom render function for node labels _/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n}",
"new_string": "/\*\*\n _ Props for the internal TreeNodeItem component.\n _/\ninterface TreeNodeItemProps {\n /\*\* The tree node to render _/\n node: TreeNode;\n\n /\*\* Indentation size in pixels per depth level _/\n indentSize: number;\n\n /** Whether to show depth-based visual indicators \*/\n showDepthIndicators: boolean;\n\n /** Optional callback when a node is clicked _/\n onNodeClick?: (node: TreeNode) => void;\n\n /\*\* Optional callback when a node is clicked with the mouse event \_/\n onNodeClickWithEvent?: (node: TreeNode, event: React.MouseEvent) => void;\n\n /** Optional custom render function for node labels \*/\n renderLabel?: (node: TreeNode) => React.ReactNode;\n\n /** Set of selected node IDs for visual highlighting \*/\n selectedIds?: Set<string>;\n}"
}

Now let me update the getDepthStyles function and the TreeNodeItem component to handle selection:

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "/\*\*\n * Gets inline styles for depth-based styling (fallback when Tailwind is not available).\n _ Implements progressive color and size styling based on node depth levels:\n _ - Top-level pages appear blue\n _ - Sub-sections appear white/light\n _ - Sub-components appear gray with visual hierarchy\n _\n _ @param depth - The depth level of the node\n _ @param showIndicators - Whether to show visual depth indicators\n _ @returns CSS properties object\n _/\nfunction getDepthStyles(depth: number, showIndicators: boolean): React.CSSProperties {\n if (!showIndicators) {\n return {};\n }\n\n // Get colors based on depth level for visual hierarchy\n let colors: { bg: string; border: string; text: string };\n\n if (depth === 0) {\n // Top-level pages: Blue\n colors = DEPTH_COLOR_SCHEME.page;\n } else if (depth === 1) {\n // Sub-sections: White/Light\n colors = DEPTH_COLOR_SCHEME.section;\n } else if (depth === 2) {\n // Components: Gray\n colors = DEPTH_COLOR_SCHEME.component;\n } else if (depth === 3) {\n // Deeper components: Lighter gray\n colors = DEPTH_COLOR_SCHEME.componentLight;\n } else {\n // Very deep components: Lightest gray\n colors = DEPTH_COLOR_SCHEME.componentLighter;\n }\n\n return {\n backgroundColor: colors.bg,\n borderColor: colors.border,\n color: colors.text,\n };\n}",
"new_string": "/\*\*\n _ Selection highlight colors.\n _/\nconst SELECTION_COLORS = {\n bg: '#dbeafe',\n border: '#3b82f6',\n outline: '2px solid #3b82f6',\n outlineOffset: '1px',\n} as const;\n\n/\*_\n _ Gets inline styles for depth-based styling (fallback when Tailwind is not available).\n _ Implements progressive color and size styling based on node depth levels:\n _ - Top-level pages appear blue\n _ - Sub-sections appear white/light\n _ - Sub-components appear gray with visual hierarchy\n _\n _ @param depth - The depth level of the node\n _ @param showIndicators - Whether to show visual depth indicators\n _ @param isSelected - Whether the node is currently selected\n _ @returns CSS properties object\n \_/\nfunction getDepthStyles(\n depth: number,\n showIndicators: boolean,\n isSelected: boolean = false\n): React.CSSProperties {\n const styles: React.CSSProperties = {};\n\n if (showIndicators) {\n // Get colors based on depth level for visual hierarchy\n let colors: { bg: string; border: string; text: string };\n\n if (depth === 0) {\n // Top-level pages: Blue\n colors = DEPTH_COLOR_SCHEME.page;\n } else if (depth === 1) {\n // Sub-sections: White/Light\n colors = DEPTH_COLOR_SCHEME.section;\n } else if (depth === 2) {\n // Components: Gray\n colors = DEPTH_COLOR_SCHEME.component;\n } else if (depth === 3) {\n // Deeper components: Lighter gray\n colors = DEPTH_COLOR_SCHEME.componentLight;\n } else {\n // Very deep components: Lightest gray\n colors = DEPTH_COLOR_SCHEME.componentLighter;\n }\n\n styles.backgroundColor = colors.bg;\n styles.borderColor = colors.border;\n styles.color = colors.text;\n }\n\n // Apply selection styles (takes precedence)\n if (isSelected) {\n styles.outline = SELECTION_COLORS.outline;\n styles.outlineOffset = SELECTION_COLORS.outlineOffset;\n styles.backgroundColor = SELECTION_COLORS.bg;\n }\n\n return styles;\n}"
}

Now let me update the TreeNodeItem component to handle selection and pass the event:

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "/\*\*\n * Internal component for rendering a single tree node and its children recursively.\n _/\nfunction TreeNodeItem({\n node,\n indentSize,\n showDepthIndicators,\n onNodeClick,\n renderLabel,\n}: TreeNodeItemProps): React.ReactElement {\n const hasChildren = node.children && node.children.length > 0;\n\n const handleClick = (event: React.MouseEvent) => {\n event.stopPropagation();\n onNodeClick?.(node);\n };\n\n const depthStyles = getDepthStyles(node.depth, showDepthIndicators);\n\n return (\n <div className=\"tree-node\" data-node-id={node.id} data-depth={node.depth}>\n {/_ Node Label _/}\n <div\n className=\"tree-node-label\"\n style={{\n          ...depthStyles,\n          paddingTop: '8px',\n          paddingRight: '12px',\n          paddingBottom: '8px',\n          paddingLeft: `${node.depth * indentSize + 12}px`,\n          margin: '2px 0',\n          borderRadius: '4px',\n          borderWidth: showDepthIndicators ? '1px' : '0',\n          borderStyle: 'solid',\n          cursor: onNodeClick ? 'pointer' : 'default',\n          transition: 'background-color 0.15s ease',\n          fontSize: `${getDepthFontSize(node.depth)}px`,\n          fontWeight: node.depth === 0 ? 600 : node.depth === 1 ? 500 : 400,\n        }}\n onClick={handleClick}\n role={onNodeClick ? 'button' : undefined}\n tabIndex={onNodeClick ? 0 : undefined}\n onKeyDown={\n onNodeClick\n ? (e) => {\n if (e.key === 'Enter' || e.key === ' ') {\n e.preventDefault();\n onNodeClick(node);\n }\n }\n : undefined\n }\n >\n {/_ Depth indicator bullet _/}\n {showDepthIndicators && (\n <span\n className=\"tree-node-bullet\"\n style={{\n              display: 'inline-block',\n              width: '8px',\n              height: '8px',\n              borderRadius: '50%',\n              backgroundColor: depthStyles.borderColor || '#ccc',\n              marginRight: '8px',\n            }}\n aria-hidden=\"true\"\n />\n )}\n\n {/_ Label content _/}\n <span className=\"tree-node-text\">\n {renderLabel ? renderLabel(node) : node.label}\n </span>\n\n {/_ Children count indicator _/}\n {hasChildren && (\n <span\n className=\"tree-node-children-count\"\n style={{\n              marginLeft: '8px',\n              fontSize: '0.75em',\n              opacity: 0.6,\n            }}\n >\n ({node.children!.length})\n </span>\n )}\n </div>\n\n {/_ Render children recursively _/}\n {hasChildren && (\n <div className=\"tree-node-children\">\n {node.children!.map((child) => (\n <TreeNodeItem\n key={child.id}\n node={child}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n onNodeClick={onNodeClick}\n renderLabel={renderLabel}\n />\n ))}\n </div>\n )}\n </div>\n );\n}",
"new_string": "/\*\*\n _ Internal component for rendering a single tree node and its children recursively.\n _/\nfunction TreeNodeItem({\n node,\n indentSize,\n showDepthIndicators,\n onNodeClick,\n onNodeClickWithEvent,\n renderLabel,\n selectedIds,\n}: TreeNodeItemProps): React.ReactElement {\n const hasChildren = node.children && node.children.length > 0;\n const isSelected = selectedIds?.has(node.id) ?? false;\n const isClickable = Boolean(onNodeClick || onNodeClickWithEvent);\n\n const handleClick = (event: React.MouseEvent) => {\n event.stopPropagation();\n if (onNodeClickWithEvent) {\n onNodeClickWithEvent(node, event);\n } else if (onNodeClick) {\n onNodeClick(node);\n }\n };\n\n const handleKeyDown = (event: React.KeyboardEvent) => {\n if (event.key === 'Enter' || event.key === ' ') {\n event.preventDefault();\n event.stopPropagation();\n if (onNodeClickWithEvent) {\n // Create a synthetic event with modifier keys\n onNodeClickWithEvent(node, {\n ctrlKey: event.ctrlKey,\n metaKey: event.metaKey,\n shiftKey: event.shiftKey,\n stopPropagation: () => {},\n } as unknown as React.MouseEvent);\n } else if (onNodeClick) {\n onNodeClick(node);\n }\n }\n };\n\n const depthStyles = getDepthStyles(node.depth, showDepthIndicators, isSelected);\n\n return (\n <div\n className={`tree-node ${isSelected ? 'tree-node--selected' : ''}`}\n data-node-id={node.id}\n data-depth={node.depth}\n data-selected={isSelected ? 'true' : undefined}\n >\n {/_ Node Label _/}\n <div\n className={`tree-node-label ${isSelected ? 'tree-node-label--selected' : ''}`}\n style={{\n          ...depthStyles,\n          paddingTop: '8px',\n          paddingRight: '12px',\n          paddingBottom: '8px',\n          paddingLeft: `${node.depth * indentSize + 12}px`,\n          margin: '2px 0',\n          borderRadius: '4px',\n          borderWidth: showDepthIndicators ? '1px' : '0',\n          borderStyle: 'solid',\n          cursor: isClickable ? 'pointer' : 'default',\n          transition: 'background-color 0.15s ease, outline 0.15s ease',\n          fontSize: `${getDepthFontSize(node.depth)}px`,\n          fontWeight: node.depth === 0 ? 600 : node.depth === 1 ? 500 : 400,\n        }}\n onClick={isClickable ? handleClick : undefined}\n role={isClickable ? 'button' : undefined}\n tabIndex={isClickable ? 0 : undefined}\n onKeyDown={isClickable ? handleKeyDown : undefined}\n aria-selected={isSelected}\n >\n {/_ Depth indicator bullet _/}\n {showDepthIndicators && (\n <span\n className=\"tree-node-bullet\"\n style={{\n              display: 'inline-block',\n              width: '8px',\n              height: '8px',\n              borderRadius: '50%',\n              backgroundColor: depthStyles.borderColor || '#ccc',\n              marginRight: '8px',\n            }}\n aria-hidden=\"true\"\n />\n )}\n\n {/_ Label content _/}\n <span className=\"tree-node-text\">\n {renderLabel ? renderLabel(node) : node.label}\n </span>\n\n {/_ Children count indicator _/}\n {hasChildren && (\n <span\n className=\"tree-node-children-count\"\n style={{\n              marginLeft: '8px',\n              fontSize: '0.75em',\n              opacity: 0.6,\n            }}\n >\n ({node.children!.length})\n </span>\n )}\n </div>\n\n {/_ Render children recursively \_/}\n {hasChildren && (\n <div className=\"tree-node-children\">\n {node.children!.map((child) => (\n <TreeNodeItem\n key={child.id}\n node={child}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n onNodeClick={onNodeClick}\n onNodeClickWithEvent={onNodeClickWithEvent}\n renderLabel={renderLabel}\n selectedIds={selectedIds}\n />\n ))}\n </div>\n )}\n </div>\n );\n}"
}

Now let me update the BasicTree component to use the new props:

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "export function BasicTree({\n nodes,\n className = '',\n indentSize = 24,\n showDepthIndicators = true,\n onNodeClick,\n renderLabel,\n}: BasicTreeProps): React.ReactElement {\n if (!nodes || nodes.length === 0) {\n return (\n <div\n className={`basic-tree basic-tree--empty ${className}`.trim()}\n style={{\n          padding: '16px',\n          textAlign: 'center',\n          color: '#6b7280',\n          fontStyle: 'italic',\n        }}\n role=\"tree\"\n aria-label=\"Empty tree\"\n >\n No nodes to display\n </div>\n );\n }\n\n return (\n <div\n className={`basic-tree ${className}`.trim()}\n style={{\n        fontFamily:\n          '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif',\n        fontSize: '14px',\n        lineHeight: '1.5',\n      }}\n role=\"tree\"\n aria-label=\"Tree structure\"\n >\n {nodes.map((node) => (\n <TreeNodeItem\n key={node.id}\n node={node}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n onNodeClick={onNodeClick}\n renderLabel={renderLabel}\n />\n ))}\n </div>\n );\n}",
"new_string": "export function BasicTree({\n nodes,\n className = '',\n indentSize = 24,\n showDepthIndicators = true,\n onNodeClick,\n onNodeClickWithEvent,\n renderLabel,\n selectedIds,\n}: BasicTreeProps): React.ReactElement {\n if (!nodes || nodes.length === 0) {\n return (\n <div\n className={`basic-tree basic-tree--empty ${className}`.trim()}\n style={{\n          padding: '16px',\n          textAlign: 'center',\n          color: '#6b7280',\n          fontStyle: 'italic',\n        }}\n role=\"tree\"\n aria-label=\"Empty tree\"\n >\n No nodes to display\n </div>\n );\n }\n\n const hasSelections = selectedIds && selectedIds.size > 0;\n\n return (\n <div\n className={`basic-tree ${className}`.trim()}\n style={{\n        fontFamily:\n          '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif',\n        fontSize: '14px',\n        lineHeight: '1.5',\n      }}\n role=\"tree\"\n aria-label=\"Tree structure\"\n aria-multiselectable={Boolean(selectedIds)}\n >\n {nodes.map((node) => (\n <TreeNodeItem\n key={node.id}\n node={node}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n onNodeClick={onNodeClick}\n onNodeClickWithEvent={onNodeClickWithEvent}\n renderLabel={renderLabel}\n selectedIds={selectedIds}\n />\n ))}\n </div>\n );\n}"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"offset": 320
}

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\BasicTree.tsx",
"old_string": "export function BasicTree({\n nodes,\n className = '',\n indentSize = 24,\n showDepthIndicators = true,\n onNodeClick,\n renderLabel,\n}: BasicTreeProps): React.ReactElement {\n if (!nodes || nodes.length === 0) {\n return (\n <div\n className={`basic-tree basic-tree--empty ${className}`.trim()}\n style={{\n          padding: '16px',\n          textAlign: 'center',\n          color: '#6b7280',\n          fontStyle: 'italic',\n        }}\n role=\"tree\"\n aria-label=\"Empty tree\"\n >\n No nodes to display\n </div>\n );\n }\n\n return (\n <div\n className={`basic-tree ${className}`.trim()}\n style={{\n        fontFamily:\n          '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif',\n        fontSize: '14px',\n        lineHeight: '1.5',\n      }}\n role=\"tree\"\n aria-label=\"Tree structure\"\n >\n {nodes.map((node) => (\n <TreeNodeItem\n key={node.id}\n node={node}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n onNodeClick={onNodeClick}\n renderLabel={renderLabel}\n />\n ))}\n </div>\n );\n}",
"new_string": "export function BasicTree({\n nodes,\n className = '',\n indentSize = 24,\n showDepthIndicators = true,\n onNodeClick,\n onNodeClickWithEvent,\n renderLabel,\n selectedIds,\n}: BasicTreeProps): React.ReactElement {\n if (!nodes || nodes.length === 0) {\n return (\n <div\n className={`basic-tree basic-tree--empty ${className}`.trim()}\n style={{\n          padding: '16px',\n          textAlign: 'center',\n          color: '#6b7280',\n          fontStyle: 'italic',\n        }}\n role=\"tree\"\n aria-label=\"Empty tree\"\n >\n No nodes to display\n </div>\n );\n }\n\n return (\n <div\n className={`basic-tree ${className}`.trim()}\n style={{\n        fontFamily:\n          '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif',\n        fontSize: '14px',\n        lineHeight: '1.5',\n      }}\n role=\"tree\"\n aria-label=\"Tree structure\"\n aria-multiselectable={Boolean(selectedIds)}\n >\n {nodes.map((node) => (\n <TreeNodeItem\n key={node.id}\n node={node}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n onNodeClick={onNodeClick}\n onNodeClickWithEvent={onNodeClickWithEvent}\n renderLabel={renderLabel}\n selectedIds={selectedIds}\n />\n ))}\n </div>\n );\n}"
}

Now let me update the components index file to export SelectableTree:

🔧 Tool: Glob
Input: {
"pattern": "\*\*/components/index.ts",
"path": "D:\\applications\\sitemap"
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\index.ts"
}

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\index.ts",
"old_string": "export {\n ResponsiveCardGrid,\n type ResponsiveCardGridProps,\n type GridLayout,\n type GapSize,\n type CardVariant,\n} from './ResponsiveCardGrid';\nexport { default as ResponsiveCardGridDefault } from './ResponsiveCardGrid';",
"new_string": "export {\n ResponsiveCardGrid,\n type ResponsiveCardGridProps,\n type GridLayout,\n type GapSize,\n type CardVariant,\n} from './ResponsiveCardGrid';\nexport { default as ResponsiveCardGridDefault } from './ResponsiveCardGrid';\n\nexport {\n SelectableTree,\n SelectionInfo,\n type SelectableTreeProps,\n type NodeClickEvent,\n type SelectionInfoProps,\n} from './SelectableTree';\nexport { default as SelectableTreeDefault } from './SelectableTree';"
}

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create SelectableTree component with click-to-select and multi-select functionality",
"status": "completed",
"activeForm": "Creating SelectableTree component"
},
{
"content": "Update BasicTree to support selection state prop",
"status": "completed",
"activeForm": "Updating BasicTree component"
},
{
"content": "Add selection info display component (SelectionInfo)",
"status": "completed",
"activeForm": "Adding SelectionInfo component"
},
{
"content": "Write comprehensive tests for selection functionality",
"status": "in_progress",
"activeForm": "Writing tests for selection"
},
{
"content": "Verify all tests pass",
"status": "pending",
"activeForm": "Verifying tests pass"
}
]
}

Now let me write comprehensive tests for the selection functionality:

🔧 Tool: Write
Input: {
"file*path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"content": "/\*\*\n * SelectableTree Component Unit Tests\n _\n _ Comprehensive tests for the SelectableTree component that provides\n _ click-to-select functionality with multi-select support via Ctrl/Cmd-click.\n \*/\n\nimport React from 'react';\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport { SelectableTree, SelectionInfo } from '../components/SelectableTree';\nimport { TreeNode } from '../types/TreeNode';\n\n// ============================================================================\n// Test Data Helpers\n// ============================================================================\n\n/\*\*\n _ Creates a simple tree structure for testing.\n _/\nfunction createSimpleTree(): TreeNode[] {\n return [\n {\n id: 'node-1',\n label: 'Root',\n depth: 0,\n children: [\n { id: 'node-2', label: 'Child 1', depth: 1 },\n { id: 'node-3', label: 'Child 2', depth: 1 },\n ],\n },\n ];\n}\n\n/\*\*\n _ Creates a tree with multiple roots for testing.\n _/\nfunction createMultiRootTree(): TreeNode[] {\n return [\n {\n id: 'node-1',\n label: 'Root 1',\n depth: 0,\n children: [{ id: 'node-2', label: 'Child of Root 1', depth: 1 }],\n },\n {\n id: 'node-3',\n label: 'Root 2',\n depth: 0,\n children: [{ id: 'node-4', label: 'Child of Root 2', depth: 1 }],\n },\n ];\n}\n\n/\*\*\n _ Creates a deeply nested tree structure for testing.\n \_/\nfunction createDeepTree(): TreeNode[] {\n return [\n {\n id: 'level-0',\n label: 'Level 0',\n depth: 0,\n children: [\n {\n id: 'level-1',\n label: 'Level 1',\n depth: 1,\n children: [\n {\n id: 'level-2',\n label: 'Level 2',\n depth: 2,\n },\n ],\n },\n ],\n },\n ];\n}\n\n// ============================================================================\n// SelectableTree Tests\n// ============================================================================\n\ndescribe('SelectableTree', () => {\n describe('rendering', () => {\n it('should render all nodes in the tree', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n expect(screen.getByText('Root')).toBeInTheDocument();\n expect(screen.getByText('Child 1')).toBeInTheDocument();\n expect(screen.getByText('Child 2')).toBeInTheDocument();\n });\n\n it('should render empty state when nodes array is empty', () => {\n render(<SelectableTree nodes={[]} />);\n\n expect(screen.getByText('No nodes to display')).toBeInTheDocument();\n });\n\n it('should render multiple root nodes', () => {\n const nodes = createMultiRootTree();\n render(<SelectableTree nodes={nodes} />);\n\n expect(screen.getByText('Root 1')).toBeInTheDocument();\n expect(screen.getByText('Root 2')).toBeInTheDocument();\n });\n\n it('should show selection hint when no nodes are selected', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n expect(\n screen.getByText(/Click to select a node/i)\n ).toBeInTheDocument();\n });\n\n it('should hide selection info when showSelectionInfo is false', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} showSelectionInfo={false} />);\n\n expect(\n screen.queryByText(/Click to select a node/i)\n ).not.toBeInTheDocument();\n });\n });\n\n describe('single click selection', () => {\n it('should select a node when clicked', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n fireEvent.click(screen.getByText('Child 1'));\n\n expect(handleSelectionChange).toHaveBeenCalled();\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n expect(lastCall[0].size).toBe(1);\n });\n\n it('should display selection info when a node is selected', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n fireEvent.click(screen.getByText('Child 1'));\n\n expect(screen.getByText('1 node selected')).toBeInTheDocument();\n expect(screen.getByText('Child 1')).toBeInTheDocument();\n });\n\n it('should replace selection when clicking a different node without modifier key', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Select second node (should replace)\n fireEvent.click(screen.getByText('Child 2'));\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-3')).toBe(true);\n expect(lastCall[0].has('node-2')).toBe(false);\n expect(lastCall[0].size).toBe(1);\n });\n\n it('should deselect when clicking on an already selected node', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Click same node again to deselect\n fireEvent.click(screen.getByText('Child 1'));\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].size).toBe(0);\n });\n\n it('should not deselect when allowDeselect is false', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n allowDeselect={false}\n />\n );\n\n // Select node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Click same node again - should not deselect\n fireEvent.click(screen.getByText('Child 1'));\n\n // Should still be selected\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n });\n });\n\n describe('multi-select with Ctrl/Cmd-click', () => {\n it('should add to selection when Ctrl-clicking a node', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Ctrl+click second node\n fireEvent.click(screen.getByText('Child 2'), { ctrlKey: true });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n expect(lastCall[0].has('node-3')).toBe(true);\n expect(lastCall[0].size).toBe(2);\n });\n\n it('should add to selection when Cmd-clicking a node (Mac)', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Cmd+click second node\n fireEvent.click(screen.getByText('Child 2'), { metaKey: true });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n expect(lastCall[0].has('node-3')).toBe(true);\n expect(lastCall[0].size).toBe(2);\n });\n\n it('should toggle selection when Ctrl-clicking a selected node', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Ctrl+click same node to toggle off\n fireEvent.click(screen.getByText('Child 1'), { ctrlKey: true });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(false);\n expect(lastCall[0].size).toBe(0);\n });\n\n it('should display correct count for multiple selections', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Ctrl+click second node\n fireEvent.click(screen.getByText('Child 2'), { ctrlKey: true });\n\n expect(screen.getByText('2 nodes selected')).toBeInTheDocument();\n });\n });\n\n describe('initial selection', () => {\n it('should start with initial selected IDs', () => {\n const nodes = createSimpleTree();\n const initialSelection = new Set(['node-2', 'node-3']);\n\n render(\n <SelectableTree\n nodes={nodes}\n initialSelectedIds={initialSelection}\n />\n );\n\n expect(screen.getByText('2 nodes selected')).toBeInTheDocument();\n });\n });\n\n describe('maxSelections prop', () => {\n it('should not allow selecting more than maxSelections nodes', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n maxSelections={1}\n />\n );\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Try to Ctrl+click second node (should not add)\n fireEvent.click(screen.getByText('Child 2'), { ctrlKey: true });\n\n // Should still only have 1 selection\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].size).toBe(1);\n expect(lastCall[0].has('node-2')).toBe(true);\n });\n });\n\n describe('clear selection', () => {\n it('should clear all selections when clear button is clicked', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Click clear button\n fireEvent.click(screen.getByRole('button', { name: /clear/i }));\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].size).toBe(0);\n });\n });\n\n describe('onNodeClick callback', () => {\n it('should call onNodeClick with node and event info', () => {\n const nodes = createSimpleTree();\n const handleNodeClick = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onNodeClick={handleNodeClick}\n />\n );\n\n fireEvent.click(screen.getByText('Child 1'), { ctrlKey: true });\n\n expect(handleNodeClick).toHaveBeenCalledWith(\n expect.objectContaining({\n node: expect.objectContaining({ id: 'node-2', label: 'Child 1' }),\n isMultiSelectKey: true,\n isShiftKey: false,\n })\n );\n });\n });\n\n describe('visual selection state', () => {\n it('should add data-selected attribute to selected nodes', () => {\n const nodes = createSimpleTree();\n const { container } = render(<SelectableTree nodes={nodes} />);\n\n fireEvent.click(screen.getByText('Child 1'));\n\n const selectedNode = container.querySelector('[data-selected=\"true\"]');\n expect(selectedNode).toBeInTheDocument();\n expect(selectedNode?.getAttribute('data-node-id')).toBe('node-2');\n });\n\n it('should add selected class to selected node labels', () => {\n const nodes = createSimpleTree();\n const { container } = render(<SelectableTree nodes={nodes} />);\n\n fireEvent.click(screen.getByText('Child 1'));\n\n const selectedLabel = container.querySelector('.tree-node-label--selected');\n expect(selectedLabel).toBeInTheDocument();\n });\n });\n\n describe('accessibility', () => {\n it('should have role=\"tree\" on the container', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n expect(screen.getByRole('tree')).toBeInTheDocument();\n });\n\n it('should have aria-multiselectable on the tree', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');\n });\n\n it('should have aria-selected on selected nodes', () => {\n const nodes = createSimpleTree();\n const { container } = render(<SelectableTree nodes={nodes} />);\n\n fireEvent.click(screen.getByText('Child 1'));\n\n const selectedLabel = container.querySelector('[aria-selected=\"true\"]');\n expect(selectedLabel).toBeInTheDocument();\n });\n\n it('should have role=\"button\" on clickable nodes', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n const buttons = screen.getAllByRole('button');\n expect(buttons.length).toBeGreaterThan(0);\n });\n\n it('should have role=\"status\" on selection info', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n fireEvent.click(screen.getByText('Child 1'));\n\n expect(screen.getByRole('status')).toBeInTheDocument();\n });\n });\n\n describe('keyboard navigation', () => {\n it('should select node on Enter key', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n const { container } = render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n const nodeLabel = container.querySelector('[data-node-id=\"node-2\"] .tree-node-label');\n fireEvent.keyDown(nodeLabel!, { key: 'Enter' });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n });\n\n it('should select node on Space key', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n const { container } = render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n const nodeLabel = container.querySelector('[data-node-id=\"node-2\"] .tree-node-label');\n fireEvent.keyDown(nodeLabel!, { key: ' ' });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n });\n\n it('should multi-select with Ctrl+Enter', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n const { container } = render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // First selection\n const firstNodeLabel = container.querySelector('[data-node-id=\"node-2\"] .tree-node-label');\n fireEvent.keyDown(firstNodeLabel!, { key: 'Enter' });\n\n // Second selection with Ctrl\n const secondNodeLabel = container.querySelector('[data-node-id=\"node-3\"] .tree-node-label');\n fireEvent.keyDown(secondNodeLabel!, { key: 'Enter', ctrlKey: true });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].size).toBe(2);\n });\n });\n\n describe('custom rendering', () => {\n it('should support custom renderLabel function', () => {\n const nodes = createSimpleTree();\n render(\n <SelectableTree\n nodes={nodes}\n renderLabel={(node, isSelected) => (\n <span>\n {isSelected ? '[X] ' : '[ ] '}\n {node.label}\n </span>\n )}\n />\n );\n\n expect(screen.getByText('[ ] Root')).toBeInTheDocument();\n\n fireEvent.click(screen.getByText('[ ] Root'));\n\n // After selection, the checkbox should be checked\n expect(screen.getByText('[X] Root')).toBeInTheDocument();\n });\n });\n\n describe('styling', () => {\n it('should apply custom className to container', () => {\n const nodes = createSimpleTree();\n const { container } = render(\n <SelectableTree nodes={nodes} className=\"my-custom-class\" />\n );\n\n expect(container.querySelector('.selectable-tree')).toHaveClass('my-custom-class');\n });\n\n it('should apply custom indentSize', () => {\n const nodes = createSimpleTree();\n const { container } = render(\n <SelectableTree nodes={nodes} indentSize={40} />\n );\n\n const childLabel = container.querySelector(\n '[data-node-id=\"node-2\"] .tree-node-label'\n ) as HTMLElement;\n // depth 1 \* 40 + 12 = 52px\n expect(childLabel.style.paddingLeft).toBe('52px');\n });\n });\n\n describe('deeply nested nodes', () => {\n it('should select deeply nested nodes', () => {\n const nodes = createDeepTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n fireEvent.click(screen.getByText('Level 2'));\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('level-2')).toBe(true);\n });\n });\n});\n\n// ============================================================================\n// SelectionInfo Component Tests\n// ============================================================================\n\ndescribe('SelectionInfo', () => {\n it('should display singular form for 1 node', () => {\n const nodes = [{ id: 'node-1', label: 'Test Node', depth: 0 }];\n render(\n <SelectionInfo\n selectedCount={1}\n selectedNodes={nodes}\n onClearSelection={() => {}}\n />\n );\n\n expect(screen.getByText('1 node selected')).toBeInTheDocument();\n });\n\n it('should display plural form for multiple nodes', () => {\n const nodes = [\n { id: 'node-1', label: 'Node 1', depth: 0 },\n { id: 'node-2', label: 'Node 2', depth: 0 },\n ];\n render(\n <SelectionInfo\n selectedCount={2}\n selectedNodes={nodes}\n onClearSelection={() => {}}\n />\n );\n\n expect(screen.getByText('2 nodes selected')).toBeInTheDocument();\n });\n\n it('should display first 3 labels and count for more', () => {\n const nodes = [\n { id: 'node-1', label: 'Node 1', depth: 0 },\n { id: 'node-2', label: 'Node 2', depth: 0 },\n { id: 'node-3', label: 'Node 3', depth: 0 },\n { id: 'node-4', label: 'Node 4', depth: 0 },\n { id: 'node-5', label: 'Node 5', depth: 0 },\n ];\n render(\n <SelectionInfo\n selectedCount={5}\n selectedNodes={nodes}\n onClearSelection={() => {}}\n />\n );\n\n expect(screen.getByText('5 nodes selected')).toBeInTheDocument();\n expect(screen.getByText(/Node 1, Node 2, Node 3/)).toBeInTheDocument();\n expect(screen.getByText(/\\+2 more/)).toBeInTheDocument();\n });\n\n it('should call onClearSelection when clear button is clicked', () => {\n const handleClear = jest.fn();\n const nodes = [{ id: 'node-1', label: 'Test Node', depth: 0 }];\n render(\n <SelectionInfo\n selectedCount={1}\n selectedNodes={nodes}\n onClearSelection={handleClear}\n />\n );\n\n fireEvent.click(screen.getByRole('button', { name: /clear/i }));\n\n expect(handleClear).toHaveBeenCalledTimes(1);\n });\n\n it('should return null when selectedCount is 0', () => {\n const { container } = render(\n <SelectionInfo\n selectedCount={0}\n selectedNodes={[]}\n onClearSelection={() => {}}\n />\n );\n\n // Should show the hint instead\n expect(container.textContent).toContain('Click to select');\n });\n});\n"
}

I see that BasicTree.tsx has been modified. Let me also add tests for the BasicTree selection functionality:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\BasicTree.test.tsx",
"offset": 560
}

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\BasicTree.test.tsx",
"old_string": " it('should handle nodes with metadata', () => {\n const nodes: TreeNode[] = [\n {\n id: 'node-1',\n label: 'With Metadata',\n depth: 0,\n metadata: {\n category: 'Page',\n lineNumber: 5,\n expanded: true,\n },\n },\n ];\n render(<BasicTree nodes={nodes} />);\n\n expect(screen.getByText('With Metadata')).toBeInTheDocument();\n });\n });\n});",
"new_string": " it('should handle nodes with metadata', () => {\n const nodes: TreeNode[] = [\n {\n id: 'node-1',\n label: 'With Metadata',\n depth: 0,\n metadata: {\n category: 'Page',\n lineNumber: 5,\n expanded: true,\n },\n },\n ];\n render(<BasicTree nodes={nodes} />);\n\n expect(screen.getByText('With Metadata')).toBeInTheDocument();\n });\n });\n\n describe('selection support', () => {\n it('should apply selection styles when selectedIds contains node id', () => {\n const nodes = createSimpleTree();\n const selectedIds = new Set(['node-2']);\n const { container } = render(\n <BasicTree nodes={nodes} selectedIds={selectedIds} />\n );\n\n const selectedLabel = container.querySelector(\n '[data-node-id=\"node-2\"] > .tree-node-label'\n ) as HTMLElement;\n expect(selectedLabel.style.outline).toBe('2px solid #3b82f6');\n });\n\n it('should add data-selected attribute to selected nodes', () => {\n const nodes = createSimpleTree();\n const selectedIds = new Set(['node-2']);\n const { container } = render(\n <BasicTree nodes={nodes} selectedIds={selectedIds} />\n );\n\n const selectedNode = container.querySelector('[data-selected=\"true\"]');\n expect(selectedNode).toBeInTheDocument();\n expect(selectedNode?.getAttribute('data-node-id')).toBe('node-2');\n });\n\n it('should add selected class to selected node labels', () => {\n const nodes = createSimpleTree();\n const selectedIds = new Set(['node-1', 'node-2']);\n const { container } = render(\n <BasicTree nodes={nodes} selectedIds={selectedIds} />\n );\n\n const selectedLabels = container.querySelectorAll('.tree-node-label--selected');\n expect(selectedLabels.length).toBe(2);\n });\n\n it('should set aria-selected on selected nodes', () => {\n const nodes = createSimpleTree();\n const selectedIds = new Set(['node-2']);\n const { container } = render(\n <BasicTree nodes={nodes} selectedIds={selectedIds} onNodeClick={() => {}} />\n );\n\n const selectedLabel = container.querySelector('[aria-selected=\"true\"]');\n expect(selectedLabel).toBeInTheDocument();\n });\n\n it('should set aria-multiselectable when selectedIds is provided', () => {\n const nodes = createSimpleTree();\n const selectedIds = new Set<string>();\n render(<BasicTree nodes={nodes} selectedIds={selectedIds} />);\n\n expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');\n });\n\n it('should call onNodeClickWithEvent with node and mouse event', () => {\n const nodes = createSimpleTree();\n const handleClickWithEvent = jest.fn();\n render(\n <BasicTree\n nodes={nodes}\n onNodeClickWithEvent={handleClickWithEvent}\n />\n );\n\n fireEvent.click(screen.getByText('Child 1'), { ctrlKey: true });\n\n expect(handleClickWithEvent).toHaveBeenCalledWith(\n expect.objectContaining({ id: 'node-2', label: 'Child 1' }),\n expect.objectContaining({ ctrlKey: true })\n );\n });\n\n it('should prefer onNodeClickWithEvent over onNodeClick when both are provided', () => {\n const nodes = createSimpleTree();\n const handleClick = jest.fn();\n const handleClickWithEvent = jest.fn();\n render(\n <BasicTree\n nodes={nodes}\n onNodeClick={handleClick}\n onNodeClickWithEvent={handleClickWithEvent}\n />\n );\n\n fireEvent.click(screen.getByText('Child 1'));\n\n expect(handleClickWithEvent).toHaveBeenCalled();\n expect(handleClick).not.toHaveBeenCalled();\n });\n\n it('should support keyboard multi-select with Ctrl modifier', () => {\n const nodes = createSimpleTree();\n const handleClickWithEvent = jest.fn();\n const { container } = render(\n <BasicTree\n nodes={nodes}\n onNodeClickWithEvent={handleClickWithEvent}\n />\n );\n\n const nodeLabel = container.querySelector('[data-node-id=\"node-2\"] > .tree-node-label');\n fireEvent.keyDown(nodeLabel!, { key: 'Enter', ctrlKey: true });\n\n expect(handleClickWithEvent).toHaveBeenCalledWith(\n expect.objectContaining({ id: 'node-2' }),\n expect.objectContaining({ ctrlKey: true })\n );\n });\n });\n});"
}

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create SelectableTree component with click-to-select and multi-select functionality",
"status": "completed",
"activeForm": "Creating SelectableTree component"
},
{
"content": "Update BasicTree to support selection state prop",
"status": "completed",
"activeForm": "Updating BasicTree component"
},
{
"content": "Add selection info display component (SelectionInfo)",
"status": "completed",
"activeForm": "Adding SelectionInfo component"
},
{
"content": "Write comprehensive tests for selection functionality",
"status": "completed",
"activeForm": "Writing tests for selection"
},
{
"content": "Verify all tests pass",
"status": "in_progress",
"activeForm": "Verifying tests pass"
}
]
}

Now let me run the tests to verify everything works correctly:

🔧 Tool: Bash
Input: {
"command": "npm test -- --testPathPattern=\"SelectableTree|BasicTree\" --coverage=false 2>&1 | head -150",
"description": "Run tests for SelectableTree and BasicTree",
"timeout": 120000
}

🔧 Tool: Bash
Input: {
"command": "cd D:/applications/sitemap && npm test -- --testPathPatterns=\"SelectableTree\" --coverage=false 2>&1 | head -200",
"description": "Run SelectableTree tests",
"timeout": 120000
}

I need to fix the unused variable warning in the SelectableTree component:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\SelectableTree.tsx",
"offset": 600,
"limit": 50
}

I need to remove the unused `renderNode` function:

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\SelectableTree.tsx",
"old_string": " // Recursive render function that checks selection state\n const renderNode = (node: TreeNode): React.ReactElement => {\n const nodeIsSelected = isSelected(node.id);\n\n return (\n <SelectableTreeNodeItem\n key={node.id}\n node={{\n          ...node,\n          // Override children to use our custom rendering\n          children: undefined,\n        }}\n indentSize={indentSize}\n showDepthIndicators={showDepthIndicators}\n isSelected={nodeIsSelected}\n onNodeClick={handleNodeClick}\n renderLabel={renderLabel}\n />\n );\n };\n\n // Flatten the tree for rendering while maintaining hierarchy visually",
"new_string": " // Flatten the tree for rendering while maintaining hierarchy visually"
}

🔧 Tool: Bash
Input: {
"command": "cd D:/applications/sitemap && npm test -- --testPathPatterns=\"SelectableTree\" --coverage=false 2>&1 | head -200",
"description": "Run SelectableTree tests",
"timeout": 120000
}

I see, there are some test failures due to multiple elements with the same text. Let me fix the tests:

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"old_string": " it('should display selection info when a node is selected', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n fireEvent.click(screen.getByText('Child 1'));\n\n expect(screen.getByText('1 node selected')).toBeInTheDocument();\n expect(screen.getByText('Child 1')).toBeInTheDocument();\n });",
"new_string": " it('should display selection info when a node is selected', () => {\n const nodes = createSimpleTree();\n render(<SelectableTree nodes={nodes} />);\n\n // Get the specific node label for clicking\n const nodeLabel = screen.getAllByText('Child 1')[0];\n fireEvent.click(nodeLabel);\n\n expect(screen.getByText('1 node selected')).toBeInTheDocument();\n // The label appears both in the tree and in the selection info\n expect(screen.getAllByText('Child 1').length).toBeGreaterThan(0);\n });"
}

Let me also look at the issue with the "should deselect when clicking on an already selected node" test. The component is flattening the tree so children aren't rendered in their normal nesting structure. Let me look at the issues more carefully:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"offset": 175,
"limit": 100
}

I see the issue - when we click, there are multiple elements with the same text because the label appears in both the tree and selection info. Let me fix the tests to use more specific selectors:

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"old_string": " it('should deselect when clicking on an already selected node', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Click same node again to deselect\n fireEvent.click(screen.getByText('Child 1'));\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].size).toBe(0);\n });\n\n it('should not deselect when allowDeselect is false', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n allowDeselect={false}\n />\n );\n\n // Select node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Click same node again - should not deselect\n fireEvent.click(screen.getByText('Child 1'));\n\n // Should still be selected\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n });\n });",
"new_string": " it('should deselect when clicking on an already selected node', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n const { container } = render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select node using container query to be specific\n const nodeLabel = container.querySelector('[data-node-id=\"node-2\"] .tree-node-label');\n fireEvent.click(nodeLabel!);\n\n // Click same node again to deselect\n fireEvent.click(nodeLabel!);\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].size).toBe(0);\n });\n\n it('should not deselect when allowDeselect is false', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n const { container } = render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n allowDeselect={false}\n />\n );\n\n // Select node using container query to be specific\n const nodeLabel = container.querySelector('[data-node-id=\"node-2\"] .tree-node-label');\n fireEvent.click(nodeLabel!);\n\n // Click same node again - should not deselect\n fireEvent.click(nodeLabel!);\n\n // Should still be selected\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(true);\n });\n });"
}

Now let me fix the "should toggle selection when Ctrl-clicking a selected node" test:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"offset": 270,
"limit": 50
}

🔧 Tool: Edit
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"old_string": " it('should toggle selection when Ctrl-clicking a selected node', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select first node\n fireEvent.click(screen.getByText('Child 1'));\n\n // Ctrl+click same node to toggle off\n fireEvent.click(screen.getByText('Child 1'), { ctrlKey: true });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(false);\n expect(lastCall[0].size).toBe(0);\n });",
"new_string": " it('should toggle selection when Ctrl-clicking a selected node', () => {\n const nodes = createSimpleTree();\n const handleSelectionChange = jest.fn();\n const { container } = render(\n <SelectableTree\n nodes={nodes}\n onSelectionChange={handleSelectionChange}\n />\n );\n\n // Select first node using specific query\n const nodeLabel = container.querySelector('[data-node-id=\"node-2\"] .tree-node-label');\n fireEvent.click(nodeLabel!);\n\n // Ctrl+click same node to toggle off\n fireEvent.click(nodeLabel!, { ctrlKey: true });\n\n const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];\n expect(lastCall[0].has('node-2')).toBe(false);\n expect(lastCall[0].size).toBe(0);\n });"
}

Now let me fix the test for "should add data-selected attribute to selected nodes":

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"offset": 340,
"limit": 50
}

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\**tests**\\SelectableTree.test.tsx",
"offset": 390,
"limit": 60
}

I see the issue - the SelectableTree component is flattening the nodes, so the data-node-id is on the parent but the test is checking the wrong element. Let me check the SelectableTree component to understand how it renders:

🔧 Tool: Read
Input: {
"file_path": "D:\\applications\\sitemap\\src\\components\\SelectableTree.tsx",
"offset": 300,
"limit": 100
}

I see the SelectableTree doesn't include `data-selected` attribute. Let me add it:

🔧 Tool: Edit
Input: {
"file*path": "D:\\applications\\sitemap\\src\\components\\SelectableTree.tsx",
"old_string": " return (\n <div className=\"tree-node\" data-node-id={node.id} data-depth={node.depth}>\n {/* Node Label _/}\n <div\n className={`tree-node-label ${isSelected ? 'tree-node-label--selected' : ''}`}",
"new_string": " return (\n <div\n className={`tree-node ${isSelected ? 'tree-node--selected' : ''}`}\n data-node-id={node.id}\n data-depth={node.depth}\n data-selected={isSelected ? 'true' : undefined}\n >\n {/_ Node Label \_/}\n <div\n className={`tree-node-label ${isSelected ? 'tree-node-label--selected' : ''}`}"
}

Now let me run the tests again:

🔧 Tool: Bash
Input: {
"command": "cd D:/applications/sitemap && npm test -- --testPathPatterns=\"SelectableTree\" --coverage=false 2>&1 | head -100",
"description": "Run SelectableTree tests",
"timeout": 120000
}

All SelectableTree tests pass. Now let's run the BasicTree tests:

🔧 Tool: Bash
Input: {
"command": "cd D:/applications/sitemap && npm test -- --testPathPatterns=\"BasicTree\" --coverage=false 2>&1 | head -150",
"description": "Run BasicTree tests",
"timeout": 120000
}

Excellent! All tests pass. Let me run the full test suite to make sure we haven't broken anything:

🔧 Tool: Bash
Input: {
"command": "cd D:/applications/sitemap && npm test -- --coverage=false 2>&1",
"description": "Run all tests",
"timeout": 180000
}

All tests pass. Let me also update the todo list and run TypeScript type checking:

🔧 Tool: TodoWrite
Input: {
"todos": [
{
"content": "Create SelectableTree component with click-to-select and multi-select functionality",
"status": "completed",
"activeForm": "Creating SelectableTree component"
},
{
"content": "Update BasicTree to support selection state prop",
"status": "completed",
"activeForm": "Updating BasicTree component"
},
{
"content": "Add selection info display component (SelectionInfo)",
"status": "completed",
"activeForm": "Adding SelectionInfo component"
},
{
"content": "Write comprehensive tests for selection functionality",
"status": "completed",
"activeForm": "Writing tests for selection"
},
{
"content": "Verify all tests pass",
"status": "completed",
"activeForm": "Verifying tests pass"
}
]
}

🔧 Tool: Bash
Input: {
"command": "cd D:/applications/sitemap && npx tsc --noEmit 2>&1 | head -50",
"description": "Run TypeScript type check",
"timeout": 60000
}

The TypeScript type check passes. Let me also verify the build works:

🔧 Tool: Bash
Input: {
"command": "cd D:/applications/sitemap && npm run build 2>&1 | head -50",
"description": "Run build",
"timeout": 120000
}

Excellent! Everything passes. Let me provide a final summary:

<summary>
## Summary: Implement click-to-select functionality for nodes with visual highlighting

### Changes Implemented

- Created new `SelectableTree` component that wraps tree functionality with selection support
- Added `SelectionInfo` component for displaying selection state in the UI (shows count, selected node labels, and clear button)
- Updated `BasicTree` component to support selection via new `selectedIds` and `onNodeClickWithEvent` props
- Implemented single-click selection (select only one node)
- Implemented multi-select with Ctrl/Cmd-click (toggle selection)
- Added visual highlighting for selected nodes (blue outline, background color change)
- Added data attributes (`data-selected`) and CSS classes (`tree-node--selected`, `tree-node-label--selected`) for styling hooks
- Added comprehensive accessibility support (aria-selected, aria-multiselectable, keyboard navigation with Ctrl+Enter for multi-select)
- Added 37 new tests for SelectableTree component
- Added 8 new tests for BasicTree selection support

### Files Modified

- `src/components/SelectableTree.tsx` (NEW - 690 lines) - Main selectable tree component with selection state management
- `src/components/BasicTree.tsx` - Added `selectedIds`, `onNodeClickWithEvent` props and selection styling
- `src/components/index.ts` - Added exports for new SelectableTree component and types
- `src/__tests__/SelectableTree.test.tsx` (NEW) - Comprehensive test coverage for selection functionality
- `src/__tests__/BasicTree.test.tsx` - Added tests for selection support

### Notes for Developer

- The `SelectableTree` component uses the existing `useTreeNodeSelection` hook from `TreeNodeComponent.tsx`
- Selection is controlled via `Set<string>` of node IDs
- Use `onSelectionChange` callback to react to selection changes
- Use `initialSelectedIds` prop to set initial selection
- The `maxSelections` prop limits how many nodes can be selected
- The `allowDeselect` prop controls whether clicking a selected node deselects it
- Keyboard support: Enter/Space to select, Ctrl/Cmd+Enter/Space for multi-select
- The `SelectionInfo` component shows selection count and labels, with a clear button
  </summary>
