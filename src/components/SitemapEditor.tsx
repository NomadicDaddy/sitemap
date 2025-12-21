/**
 * SitemapEditor Component
 *
 * A React component that provides real-time sitemap visualization.
 * Features a textarea input with an onChange handler that instantly
 * re-parses and re-renders the visualization as users type.
 *
 * @example
 * ```tsx
 * import { SitemapEditor } from './components/SitemapEditor';
 *
 * function App() {
 *   return (
 *     <SitemapEditor
 *       initialValue="Home\n├── About\n└── Contact"
 *       onTreeChange={(tree) => console.log('Tree updated:', tree)}
 *     />
 *   );
 * }
 * ```
 */
import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';

import { useTreeParser } from '../hooks/useTreeParser';
import { type ParseError, type ParserOptions, type TreeNode } from '../types/TreeNode';
import { treeNodesToText } from '../utils/sitemapGenerator';
import {
	addTagToNodes,
	changeNodesColor,
	collapseAllNodes,
	deleteNodes,
	expandAllNodes,
	modifyNodeProperties,
	toggleNodeExpanded,
} from '../utils/treeOperations';
import { D3TreeDiagram } from './D3TreeDiagram';
import { SelectableTree, type SelectableTreeProps } from './SelectableTree';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SitemapEditor component.
 */
export interface SitemapEditorProps {
	/** Initial text value for the textarea */
	initialValue?: string;

	/** Parser options to customize parsing behavior */
	parserOptions?: ParserOptions;

	/** Optional CSS class name for the container */
	className?: string;

	/** Placeholder text for the textarea */
	placeholder?: string;

	/** Number of rows for the textarea (default: 10) */
	rows?: number;

	/** Whether the textarea is disabled */
	disabled?: boolean;

	/** Whether to show the tree preview (default: true) */
	showPreview?: boolean;

	/** Preview type to show: 'list' (default), 'd3-horizontal', or 'd3-vertical' */
	previewType?: 'list' | 'd3-horizontal' | 'd3-vertical';

	/** Whether to show preview type selector (default: true) */
	showPreviewSelector?: boolean;

	/** Whether to show parsing errors (default: true) */
	showErrors?: boolean;

	/** Whether to show statistics (node count, depth) (default: false) */
	showStats?: boolean;

	/** Callback when the tree changes */
	onTreeChange?: (tree: TreeNode[], success: boolean) => void;

	/** Callback when parsing errors change */
	onErrorsChange?: (errors: ParseError[]) => void;

	/** Callback when the input value changes */
	onInputChange?: (value: string) => void;

	/** Props to pass to the SelectableTree component */
	treeProps?: Omit<SelectableTreeProps, 'nodes'>;

	/** Custom render function for the error list */
	renderErrors?: (errors: ParseError[]) => React.ReactNode;

	/** Custom render function for the stats section */
	renderStats?: (nodeCount: number, maxDepth: number) => React.ReactNode;

	/** Aria label for the textarea */
	textareaLabel?: string;

	/** Aria label for the preview section */
	previewLabel?: string;
}

// ============================================================================
// Default Styles
// ============================================================================

const containerStyles: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	gap: '16px',
};

const editorContainerStyles: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: '16px',
};

const textareaContainerStyles: React.CSSProperties = {
	flex: '1 1 300px',
	minWidth: '300px',
};

const textareaStyles: React.CSSProperties = {
	border: '1px solid #d1d5db',
	borderRadius: '6px',
	boxSizing: 'border-box',
	fontFamily: 'Monaco, Consolas, "Courier New", monospace',
	fontSize: '14px',
	lineHeight: '1.5',
	padding: '12px',
	resize: 'vertical',
	width: '100%',
};

const textareaFocusStyles: React.CSSProperties = {
	borderColor: '#3b82f6',
	boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
	outline: 'none',
};

const previewContainerStyles: React.CSSProperties = {
	backgroundColor: '#fafafa',
	border: '1px solid #e5e7eb',
	borderRadius: '6px',
	flex: '1 1 300px',
	maxHeight: '400px',
	minWidth: '300px',
	overflow: 'auto',
	padding: '12px',
};

const errorListStyles: React.CSSProperties = {
	listStyle: 'none',
	margin: 0,
	padding: 0,
};

const errorItemStyles: React.CSSProperties = {
	borderRadius: '4px',
	fontSize: '13px',
	lineHeight: '1.4',
	marginBottom: '4px',
	padding: '8px 12px',
};

const errorStyles: React.CSSProperties = {
	...errorItemStyles,
	backgroundColor: '#fef2f2',
	borderLeft: '3px solid #ef4444',
	color: '#991b1b',
};

const warningStyles: React.CSSProperties = {
	...errorItemStyles,
	backgroundColor: '#fffbeb',
	borderLeft: '3px solid #f59e0b',
	color: '#92400e',
};

const statsStyles: React.CSSProperties = {
	backgroundColor: '#f3f4f6',
	borderRadius: '4px',
	color: '#4b5563',
	display: 'flex',
	fontSize: '13px',
	gap: '16px',
	padding: '8px 12px',
};

const labelStyles: React.CSSProperties = {
	color: '#374151',
	display: 'block',
	fontSize: '14px',
	fontWeight: 500,
	marginBottom: '6px',
};

const previewControlsStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexWrap: 'wrap',
	gap: '8px',
	marginBottom: '8px',
};

const buttonStyles: React.CSSProperties = {
	backgroundColor: '#f3f4f6',
	border: '1px solid #d1d5db',
	borderRadius: '4px',
	color: '#374151',
	cursor: 'pointer',
	fontSize: '12px',
	fontWeight: 500,
	padding: '4px 10px',
	transition: 'all 0.15s ease',
};

const activeButtonStyles: React.CSSProperties = {
	...buttonStyles,
	backgroundColor: '#3b82f6',
	borderColor: '#2563eb',
	color: '#ffffff',
};

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Default error list renderer.
 */
function DefaultErrorList({ errors }: { errors: ParseError[] }): React.ReactElement | null {
	if (errors.length === 0) {
		return null;
	}

	return (
		<ul style={errorListStyles} role="alert" aria-live="polite">
			{errors.map((error, index) => (
				<li
					key={`${error.lineNumber}-${error.code}-${index}`}
					style={error.severity === 'error' ? errorStyles : warningStyles}>
					<strong>Line {error.lineNumber}:</strong> {error.message}
					{error.suggestion && (
						<span style={{ display: 'block', fontStyle: 'italic', marginTop: '4px' }}>
							Suggestion: {error.suggestion}
						</span>
					)}
				</li>
			))}
		</ul>
	);
}

/**
 * Default stats renderer.
 */
function DefaultStats({
	nodeCount,
	maxDepth,
}: {
	nodeCount: number;
	maxDepth: number;
}): React.ReactElement {
	return (
		<div style={statsStyles} aria-live="polite">
			<span>
				<strong>Nodes:</strong> {nodeCount}
			</span>
			<span>
				<strong>Max Depth:</strong> {maxDepth}
			</span>
		</div>
	);
}

// ============================================================================
// SitemapEditor Component
// ============================================================================

/**
 * SitemapEditor provides a real-time editing experience for sitemap structures.
 *
 * Features:
 * - Instant parsing and visualization on every keystroke
 * - Error display with helpful suggestions
 * - Optional statistics display (node count, max depth)
 * - Customizable appearance and behavior
 * - Accessible with proper ARIA attributes
 * - Callbacks for tree changes, errors, and input changes
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SitemapEditor />
 *
 * // With initial value and callbacks
 * <SitemapEditor
 *   initialValue="Home\n├── About\n└── Contact"
 *   onTreeChange={(tree) => console.log('Tree:', tree)}
 *   onErrorsChange={(errors) => console.log('Errors:', errors)}
 *   showStats
 * />
 *
 * // With custom tree props
 * <SitemapEditor
 *   treeProps={{
 *     indentSize: 32,
 *     showDepthIndicators: true,
 *     onNodeClick: (node) => console.log('Clicked:', node)
 *   }}
 * />
 *
 * // Minimal view (no preview)
 * <SitemapEditor showPreview={false} showErrors />
 * ```
 */
export function SitemapEditor({
	initialValue = '',
	parserOptions,
	className = '',
	placeholder = 'Enter your sitemap structure here...\n\nExample:\nHome\n├── About\n│   ├── Team\n│   └── History\n└── Contact',
	rows = 10,
	disabled = false,
	showPreview = true,
	previewType: initialPreviewType = 'list',
	showPreviewSelector = true,
	showErrors = true,
	showStats = false,
	onTreeChange,
	onErrorsChange,
	onInputChange,
	treeProps = {},
	renderErrors,
	renderStats,
	textareaLabel = 'Sitemap Input',
	previewLabel = 'Preview',
}: SitemapEditorProps): React.ReactElement {
	// Generate unique IDs for accessibility
	const textareaId = useId();
	const previewId = useId();

	// Use the tree parser hook for real-time parsing
	const {
		inputValue,
		setInputValue,
		handleInputChange: baseHandleInputChange,
		tree,
		errors,
		success,
	} = useTreeParser({
		initialValue,
		parserOptions,
	});

	// Local view of the tree that can diverge via bulk operations
	const [viewTree, setViewTree] = useState<TreeNode[]>(tree);

	// Preview type state
	const [previewType, setPreviewType] = useState<'list' | 'd3-horizontal' | 'd3-vertical'>(
		initialPreviewType
	);

	// Sync parsed tree into local view when parser output changes
	useEffect(() => {
		setViewTree(tree);
	}, [tree]);

	const computeNodeCount = useCallback((nodes: TreeNode[]): number => {
		let count = 0;
		const traverse = (nodeList: TreeNode[]): void => {
			nodeList.forEach((node) => {
				count++;
				if (node.children) {
					traverse(node.children);
				}
			});
		};
		traverse(nodes);
		return count;
	}, []);

	const computeMaxDepth = useCallback((nodes: TreeNode[]): number => {
		let maxDepth = 0;
		const traverse = (nodeList: TreeNode[]): void => {
			nodeList.forEach((node) => {
				if (node.depth > maxDepth) {
					maxDepth = node.depth;
				}
				if (node.children) {
					traverse(node.children);
				}
			});
		};
		traverse(nodes);
		return maxDepth;
	}, []);

	const nodeCount = useMemo(() => computeNodeCount(viewTree), [computeNodeCount, viewTree]);
	const maxDepth = useMemo(() => computeMaxDepth(viewTree), [computeMaxDepth, viewTree]);

	// Track previous values for callbacks
	const prevTreeRef = React.useRef<TreeNode[]>(viewTree);
	const prevErrorsRef = React.useRef<ParseError[]>(errors);
	const prevInputRef = React.useRef<string>(inputValue);

	// Effect to call callbacks when values change
	React.useEffect(() => {
		// Check if tree changed (parsed or mutated)
		if (onTreeChange && viewTree !== prevTreeRef.current) {
			onTreeChange(viewTree, success);
			prevTreeRef.current = viewTree;
		}

		// Check if errors changed
		if (onErrorsChange && errors !== prevErrorsRef.current) {
			onErrorsChange(errors);
			prevErrorsRef.current = errors;
		}
	}, [viewTree, errors, success, onTreeChange, onErrorsChange]);

	// Custom onChange handler that calls parent callback
	const handleInputChange = React.useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			baseHandleInputChange(event);

			// Call parent callback if provided
			if (onInputChange && event.target.value !== prevInputRef.current) {
				onInputChange(event.target.value);
				prevInputRef.current = event.target.value;
			}
		},
		[baseHandleInputChange, onInputChange]
	);

	// Track focus state for styling
	const [isFocused, setIsFocused] = React.useState(false);

	// Bulk action handlers
	const applyTreeUpdate = useCallback((updater: (nodes: TreeNode[]) => TreeNode[]) => {
		setViewTree((prev) => updater(prev));
	}, []);

	const handleBulkDelete = useCallback(
		(selectedNodes: TreeNode[]) => {
			if (!selectedNodes.length) return;
			const ids = selectedNodes.map((node) => node.id);
			const updated = deleteNodes(viewTree, ids);
			setViewTree(updated);
			setInputValue(treeNodesToText(updated));
		},
		[setInputValue, viewTree]
	);

	const handleBulkChangeColor = useCallback(
		(selectedNodes: TreeNode[], color: string) => {
			if (!selectedNodes.length) return;
			const ids = selectedNodes.map((node) => node.id);
			applyTreeUpdate((nodes) => changeNodesColor(nodes, ids, color));
		},
		[applyTreeUpdate]
	);

	const handleBulkAddTag = useCallback(
		(selectedNodes: TreeNode[], tag: string) => {
			if (!selectedNodes.length || !tag.trim()) return;
			const ids = selectedNodes.map((node) => node.id);
			applyTreeUpdate((nodes) => addTagToNodes(nodes, ids, tag));
		},
		[applyTreeUpdate]
	);

	const handleBulkModifyProperties = useCallback(
		(selectedNodes: TreeNode[], properties: Record<string, unknown>) => {
			if (!selectedNodes.length) return;
			const ids = selectedNodes.map((node) => node.id);
			applyTreeUpdate((nodes) => modifyNodeProperties(nodes, ids, properties));
		},
		[applyTreeUpdate]
	);

	const handleToggleCollapse = useCallback((node: TreeNode) => {
		setViewTree((prev) => toggleNodeExpanded(prev, node.id));
	}, []);

	const handleExpandAll = useCallback(() => {
		setViewTree((prev) => expandAllNodes(prev));
	}, []);

	const handleCollapseAll = useCallback(() => {
		setViewTree((prev) => collapseAllNodes(prev));
	}, []);

	const { showBulkActions: propShowBulkActions = true, ...restTreeProps } = treeProps ?? {};

	return (
		<div className={`sitemap-editor ${className}`.trim()} style={containerStyles}>
			{/* Statistics section */}
			{showStats && (
				<div className="sitemap-editor-stats">
					{renderStats ? (
						renderStats(nodeCount, maxDepth)
					) : (
						<DefaultStats nodeCount={nodeCount} maxDepth={maxDepth} />
					)}
				</div>
			)}

			{/* Main editor area */}
			<div className="sitemap-editor-content" style={editorContainerStyles}>
				{/* Textarea input */}
				<div className="sitemap-editor-input" style={textareaContainerStyles}>
					<label htmlFor={textareaId} style={labelStyles}>
						{textareaLabel}
					</label>
					<textarea
						id={textareaId}
						value={inputValue}
						onChange={handleInputChange}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder={placeholder}
						rows={rows}
						disabled={disabled}
						style={{
							...textareaStyles,
							...(isFocused ? textareaFocusStyles : {}),
							...(disabled
								? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' }
								: {}),
						}}
						aria-describedby={
							showErrors && errors.length > 0 ? `${textareaId}-errors` : undefined
						}
						aria-invalid={!success}
						spellCheck={false}
					/>
				</div>

				{/* Preview section */}
				{showPreview && (
					<div
						className="sitemap-editor-preview"
						style={previewContainerStyles}
						id={previewId}
						role="region"
						aria-label={previewLabel}
						aria-live="polite">
						<label style={{ ...labelStyles, marginBottom: '8px' }}>{previewLabel}</label>

						{/* Preview controls */}
						{showPreviewSelector && (
							<div style={previewControlsStyles}>
								<button
									type="button"
									onClick={() => setPreviewType('list')}
									style={previewType === 'list' ? activeButtonStyles : buttonStyles}>
									List
								</button>
								<button
									type="button"
									onClick={() => setPreviewType('d3-horizontal')}
									style={
										previewType === 'd3-horizontal' ? activeButtonStyles : buttonStyles
									}>
									Horizontal
								</button>
								<button
									type="button"
									onClick={() => setPreviewType('d3-vertical')}
									style={
										previewType === 'd3-vertical' ? activeButtonStyles : buttonStyles
									}>
									Vertical
								</button>
								<div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
									<button
										type="button"
										onClick={handleExpandAll}
										style={buttonStyles}
										title="Expand all nodes">
										Expand All
									</button>
									<button
										type="button"
										onClick={handleCollapseAll}
										style={buttonStyles}
										title="Collapse all nodes">
										Collapse All
									</button>
								</div>
							</div>
						)}

						{/* Render preview based on type */}
						{previewType === 'list' ? (
							<SelectableTree
								nodes={viewTree}
								showBulkActions={propShowBulkActions}
								onBulkDelete={handleBulkDelete}
								onBulkChangeColor={handleBulkChangeColor}
								onBulkAddTag={handleBulkAddTag}
								onBulkModifyProperties={handleBulkModifyProperties}
								collapsible={true}
								onToggleCollapse={handleToggleCollapse}
								{...restTreeProps}
							/>
						) : (
							<div style={{ marginTop: '12px', overflow: 'auto' }}>
								<D3TreeDiagram
									nodes={viewTree}
									width={600}
									height={400}
									orientation={
										previewType === 'd3-vertical' ? 'vertical' : 'horizontal'
									}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Error display */}
			{showErrors && errors.length > 0 && (
				<div
					className="sitemap-editor-errors"
					id={`${textareaId}-errors`}
					role="alert"
					aria-live="polite">
					{renderErrors ? renderErrors(errors) : <DefaultErrorList errors={errors} />}
				</div>
			)}
		</div>
	);
}

// Default export for convenience
export default SitemapEditor;
