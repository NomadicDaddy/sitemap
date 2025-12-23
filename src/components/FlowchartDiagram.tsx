/**
 * FlowchartDiagram Component
 *
 * A React component that renders tree nodes as flowchart-style boxes with
 * connecting edges using React Flow. Provides interactive visualization
 * with drag-and-drop positioning, zoom, and pan capabilities.
 *
 * @example
 * ```tsx
 * import { FlowchartDiagram } from './components/FlowchartDiagram';
 * import { parseAndBuildTree } from './utils/treeParser';
 *
 * const { tree } = parseAndBuildTree(`
 * Home
 * +-- About
 * +-- Contact
 * `);
 *
 * <FlowchartDiagram nodes={tree} width={800} height={600} />
 * ```
 */
import {
	Background,
	BackgroundVariant,
	Controls,
	type Edge,
	Handle,
	MarkerType,
	MiniMap,
	type Node,
	type NodeProps,
	type NodeTypes,
	Panel,
	Position,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useCallback, useEffect, useMemo } from 'react';

import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Types
// ============================================================================

/**
 * Layout direction options for the flowchart.
 */
export type FlowchartDirection = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * Node style variants for flowchart nodes.
 */
export type FlowchartNodeStyle = 'default' | 'rounded' | 'sharp' | 'pill';

/**
 * Props for the FlowchartDiagram component.
 */
export interface FlowchartDiagramProps {
	/** Array of root-level tree nodes to render */
	nodes: TreeNode[];

	/** Width of the container in pixels (default: 800) */
	width?: number;

	/** Height of the container in pixels (default: 600) */
	height?: number;

	/** Optional CSS class name for the container */
	className?: string;

	/** Layout direction (default: 'TB' - top to bottom) */
	direction?: FlowchartDirection;

	/** Style of node boxes (default: 'rounded') */
	nodeStyle?: FlowchartNodeStyle;

	/** Horizontal spacing between nodes (default: 180) */
	horizontalSpacing?: number;

	/** Vertical spacing between nodes (default: 100) */
	verticalSpacing?: number;

	/** Whether to show the minimap (default: true) */
	showMiniMap?: boolean;

	/** Whether to show the controls (default: true) */
	showControls?: boolean;

	/** Whether to show the background grid (default: true) */
	showBackground?: boolean;

	/** Whether nodes can be dragged (default: true) */
	draggable?: boolean;

	/** Whether to fit the view to content on load (default: true) */
	fitViewOnLoad?: boolean;

	/** Optional callback when a node is clicked */
	onNodeClick?: (node: TreeNode) => void;

	/** Optional callback when a node is double-clicked */
	onNodeDoubleClick?: (node: TreeNode) => void;

	/** Optional callback when node positions change */
	onPositionChange?: (positions: Map<string, { x: number; y: number }>) => void;

	/** Optional custom positions for nodes (overrides auto-layout) */
	customPositions?: Map<string, { x: number; y: number }>;

	/** Optional custom render function for node labels */
	renderLabel?: (node: TreeNode) => React.ReactNode;
}

/**
 * Data structure for flowchart nodes.
 */
interface FlowchartNodeData extends Record<string, unknown> {
	label: string;
	treeNode: TreeNode;
	depth: number;
	nodeStyle: FlowchartNodeStyle;
	direction: FlowchartDirection;
	onClick?: (node: TreeNode) => void;
	onDoubleClick?: (node: TreeNode) => void;
	renderLabel?: (node: TreeNode) => React.ReactNode;
}

/**
 * Type alias for flowchart nodes
 */
type FlowchartFlowNode = Node<FlowchartNodeData, 'flowchartNode'>;

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const DEFAULT_HORIZONTAL_SPACING = 180;
const DEFAULT_VERTICAL_SPACING = 100;

/**
 * Depth-based color configuration matching D3TreeDiagram.
 */
const DEPTH_COLORS = {
	component: { background: '#f9fafb', border: '#e5e7eb', text: '#4b5563' },
	componentLight: { background: '#ffffff', border: '#f3f4f6', text: '#6b7280' },
	page: { background: '#3b82f6', border: '#2563eb', text: '#ffffff' },
	section: { background: '#f3f4f6', border: '#d1d5db', text: '#374151' },
} as const;

/**
 * Gets depth-based colors for nodes.
 */
function getDepthColors(depth: number): { background: string; border: string; text: string } {
	if (depth === 0) return DEPTH_COLORS.page;
	if (depth === 1) return DEPTH_COLORS.section;
	if (depth === 2) return DEPTH_COLORS.component;
	return DEPTH_COLORS.componentLight;
}

/**
 * Gets border radius based on node style.
 */
function getBorderRadius(style: FlowchartNodeStyle): string {
	switch (style) {
		case 'sharp':
			return '0px';
		case 'pill':
			return '20px';
		case 'rounded':
		default:
			return '8px';
	}
}

// ============================================================================
// Custom Node Component
// ============================================================================

/**
 * Custom node component for flowchart visualization.
 */
function FlowchartNode({ data, selected }: NodeProps<FlowchartFlowNode>) {
	const colors = getDepthColors(data.depth);
	const borderRadius = getBorderRadius(data.nodeStyle);
	const direction = data.direction;

	// Determine handle positions based on direction
	const sourcePosition =
		direction === 'TB'
			? Position.Bottom
			: direction === 'BT'
				? Position.Top
				: direction === 'LR'
					? Position.Right
					: Position.Left;
	const targetPosition =
		direction === 'TB'
			? Position.Top
			: direction === 'BT'
				? Position.Bottom
				: direction === 'LR'
					? Position.Left
					: Position.Right;

	const handleClick = useCallback(() => {
		if (data.onClick) {
			data.onClick(data.treeNode);
		}
	}, [data]);

	const handleDoubleClick = useCallback(() => {
		if (data.onDoubleClick) {
			data.onDoubleClick(data.treeNode);
		}
	}, [data]);

	return (
		<div
			onClick={handleClick}
			onDoubleClick={handleDoubleClick}
			className="flowchart-node"
			data-testid={`flowchart-node-${data.treeNode.id}`}
			style={{
				backgroundColor: colors.background,
				border: `2px solid ${selected ? '#3b82f6' : colors.border}`,
				borderRadius,
				boxShadow: selected
					? '0 0 0 2px rgba(59, 130, 246, 0.3)'
					: '0 1px 3px rgba(0, 0, 0, 0.1)',
				color: colors.text,
				cursor: data.onClick ? 'pointer' : 'default',
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				fontSize: data.depth === 0 ? '14px' : data.depth === 1 ? '13px' : '12px',
				fontWeight: data.depth === 0 ? 600 : data.depth === 1 ? 500 : 400,
				minWidth: '120px',
				padding: '10px 16px',
				textAlign: 'center',
				transition: 'all 0.15s ease',
			}}>
			<Handle type="target" position={targetPosition} style={{ visibility: 'hidden' }} />
			{data.renderLabel ? data.renderLabel(data.treeNode) : data.label}
			<Handle type="source" position={sourcePosition} style={{ visibility: 'hidden' }} />
		</div>
	);
}

// ============================================================================
// Layout Utilities
// ============================================================================

/**
 * Calculates node positions using a hierarchical layout algorithm.
 */
function calculateLayoutPositions(
	treeNodes: TreeNode[],
	direction: FlowchartDirection,
	horizontalSpacing: number,
	verticalSpacing: number,
	customPositions?: Map<string, { x: number; y: number }>
): Map<string, { x: number; y: number }> {
	const positions = new Map<string, { x: number; y: number }>();

	// Track the widths at each depth level
	const depthCounts: Map<number, number> = new Map();

	// Helper to count nodes at each depth
	function countNodesAtDepth(nodes: TreeNode[], depth: number): void {
		nodes.forEach((node) => {
			depthCounts.set(depth, (depthCounts.get(depth) || 0) + 1);
			if (node.children) {
				countNodesAtDepth(node.children, depth + 1);
			}
		});
	}

	// Count all nodes at each depth
	countNodesAtDepth(treeNodes, 0);

	// Helper to calculate positions recursively
	const depthIndices: Map<number, number> = new Map();

	function calculatePositionsRecursively(
		nodes: TreeNode[],
		depth: number,
		parentX?: number
	): void {
		const nodesAtDepth = nodes.length;
		const totalWidth = nodesAtDepth * horizontalSpacing;
		const startX = parentX !== undefined ? parentX - totalWidth / 2 + horizontalSpacing / 2 : 0;

		nodes.forEach((node, index) => {
			// Check for custom position first
			if (customPositions?.has(node.id)) {
				const customPos = customPositions.get(node.id)!;
				positions.set(node.id, customPos);
			} else {
				let x: number;
				let y: number;

				if (direction === 'TB' || direction === 'BT') {
					// Top-Bottom or Bottom-Top layout
					x = startX + index * horizontalSpacing;
					y = direction === 'TB' ? depth * verticalSpacing : -depth * verticalSpacing;
				} else {
					// Left-Right or Right-Left layout
					const depthIndex = depthIndices.get(depth) || 0;
					depthIndices.set(depth, depthIndex + 1);
					x = direction === 'LR' ? depth * horizontalSpacing : -depth * horizontalSpacing;
					y = depthIndex * verticalSpacing;
				}

				positions.set(node.id, { x, y });
			}

			if (node.children && node.children.length > 0) {
				const nodePos = positions.get(node.id);
				calculatePositionsRecursively(
					node.children,
					depth + 1,
					direction === 'TB' || direction === 'BT' ? nodePos?.x : undefined
				);
			}
		});
	}

	calculatePositionsRecursively(treeNodes, 0);

	return positions;
}

/**
 * Converts TreeNode array to React Flow nodes and edges.
 */
function convertToFlowElements(
	treeNodes: TreeNode[],
	positions: Map<string, { x: number; y: number }>,
	nodeStyle: FlowchartNodeStyle,
	direction: FlowchartDirection,
	draggable: boolean,
	onClick?: (node: TreeNode) => void,
	onDoubleClick?: (node: TreeNode) => void,
	renderLabel?: (node: TreeNode) => React.ReactNode
): { edges: Edge[]; nodes: FlowchartFlowNode[] } {
	const flowNodes: FlowchartFlowNode[] = [];
	const flowEdges: Edge[] = [];

	function processNode(node: TreeNode, parentId?: string): void {
		const position = positions.get(node.id) || { x: 0, y: 0 };

		flowNodes.push({
			data: {
				depth: node.depth,
				direction,
				label: node.label,
				nodeStyle,
				onClick,
				onDoubleClick,
				renderLabel,
				treeNode: node,
			},
			draggable,
			id: node.id,
			position,
			type: 'flowchartNode',
		});

		if (parentId) {
			flowEdges.push({
				id: `${parentId}-${node.id}`,
				markerEnd: {
					color: '#94a3b8',
					height: 20,
					type: MarkerType.ArrowClosed,
					width: 20,
				},
				source: parentId,
				style: { stroke: '#94a3b8', strokeWidth: 2 },
				target: node.id,
				type: 'smoothstep',
			});
		}

		if (node.children) {
			node.children.forEach((child) => processNode(child, node.id));
		}
	}

	treeNodes.forEach((rootNode) => processNode(rootNode));

	return { edges: flowEdges, nodes: flowNodes };
}

// ============================================================================
// Node Types Registration
// ============================================================================

const nodeTypes: NodeTypes = {
	flowchartNode: FlowchartNode,
};

// ============================================================================
// Inner Flow Component
// ============================================================================

type FlowchartInnerProps = Omit<FlowchartDiagramProps, 'width' | 'height'>;

function FlowchartInner({
	nodes: treeNodes,
	direction = 'TB',
	nodeStyle = 'rounded',
	horizontalSpacing = DEFAULT_HORIZONTAL_SPACING,
	verticalSpacing = DEFAULT_VERTICAL_SPACING,
	showMiniMap = true,
	showControls = true,
	showBackground = true,
	draggable = true,
	fitViewOnLoad = true,
	onNodeClick,
	onNodeDoubleClick,
	onPositionChange,
	customPositions,
	renderLabel,
}: FlowchartInnerProps) {
	const { fitView } = useReactFlow();

	// Calculate positions
	const positions = useMemo(
		() =>
			calculateLayoutPositions(
				treeNodes,
				direction,
				horizontalSpacing,
				verticalSpacing,
				customPositions
			),
		[treeNodes, direction, horizontalSpacing, verticalSpacing, customPositions]
	);

	// Convert to React Flow elements
	const { nodes: initialNodes, edges: initialEdges } = useMemo(
		() =>
			convertToFlowElements(
				treeNodes,
				positions,
				nodeStyle,
				direction,
				draggable,
				onNodeClick,
				onNodeDoubleClick,
				renderLabel
			),
		[
			treeNodes,
			positions,
			nodeStyle,
			direction,
			draggable,
			onNodeClick,
			onNodeDoubleClick,
			renderLabel,
		]
	);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Update nodes when tree changes
	useEffect(() => {
		setNodes(initialNodes);
		setEdges(initialEdges);
	}, [initialNodes, initialEdges, setNodes, setEdges]);

	// Fit view on initial load
	useEffect(() => {
		if (fitViewOnLoad) {
			// Slight delay to ensure nodes are rendered
			const timer = setTimeout(() => {
				fitView({ padding: 0.2 });
			}, 100);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [fitViewOnLoad, fitView]);

	// Handle node position changes
	const handleNodesChange = useCallback(
		(changes: Parameters<typeof onNodesChange>[0]) => {
			onNodesChange(changes);

			// Report position changes if callback provided
			if (onPositionChange) {
				const positionChanges = changes.filter(
					(change) =>
						change.type === 'position' && 'position' in change && change.position
				);
				if (positionChanges.length > 0) {
					const newPositions = new Map<string, { x: number; y: number }>();
					nodes.forEach((node) => {
						newPositions.set(node.id, node.position);
					});
					onPositionChange(newPositions);
				}
			}
		},
		[onNodesChange, onPositionChange, nodes]
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={handleNodesChange}
			onEdgesChange={onEdgesChange}
			nodeTypes={nodeTypes}
			fitView={fitViewOnLoad}
			fitViewOptions={{ padding: 0.2 }}
			minZoom={0.1}
			maxZoom={4}
			className="flowchart-diagram"
			proOptions={{ hideAttribution: true }}>
			{showBackground && <Background variant={BackgroundVariant.Dots} gap={20} size={1} />}
			{showControls && <Controls />}
			{showMiniMap && (
				<MiniMap
					nodeColor={(node) => {
						const data = node.data as FlowchartNodeData;
						return getDepthColors(data?.depth ?? 0).background;
					}}
					style={{ backgroundColor: '#f8fafc' }}
				/>
			)}
			<Panel position="top-left" className="flowchart-panel">
				<div
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.9)',
						borderRadius: '4px',
						fontSize: '12px',
						padding: '4px 8px',
					}}>
					{treeNodes.length === 0 ? 'No nodes to display' : `${nodes.length} nodes`}
				</div>
			</Panel>
		</ReactFlow>
	);
}

// ============================================================================
// FlowchartDiagram Component
// ============================================================================

/**
 * FlowchartDiagram renders tree nodes as a flowchart with connecting edges.
 *
 * Features:
 * - Multiple layout directions (TB, BT, LR, RL)
 * - Customizable node styles (rounded, sharp, pill)
 * - Interactive zoom and pan
 * - Draggable nodes with position tracking
 * - MiniMap for navigation
 * - Controls for zoom
 * - Depth-based node coloring
 * - Custom position support
 * - Accessible with keyboard navigation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FlowchartDiagram nodes={treeNodes} />
 *
 * // With custom layout and styling
 * <FlowchartDiagram
 *   nodes={treeNodes}
 *   direction="LR"
 *   nodeStyle="pill"
 *   onNodeClick={(node) => console.log('Clicked:', node.label)}
 * />
 *
 * // With custom positions
 * const positions = new Map([
 *   ['node-1', { x: 0, y: 0 }],
 *   ['node-2', { x: 200, y: 100 }],
 * ]);
 *
 * <FlowchartDiagram
 *   nodes={treeNodes}
 *   customPositions={positions}
 *   onPositionChange={(newPositions) => console.log(newPositions)}
 * />
 * ```
 */
export function FlowchartDiagram({
	nodes: treeNodes,
	width = DEFAULT_WIDTH,
	height = DEFAULT_HEIGHT,
	className = '',
	...props
}: FlowchartDiagramProps): React.ReactElement {
	// Handle empty state
	if (!treeNodes || treeNodes.length === 0) {
		return (
			<div
				className={`flowchart-diagram flowchart-diagram--empty ${className}`.trim()}
				data-testid="flowchart-empty"
				style={{
					alignItems: 'center',
					backgroundColor: '#fafafa',
					border: '1px solid #e5e7eb',
					borderRadius: '8px',
					color: '#6b7280',
					display: 'flex',
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
					fontStyle: 'italic',
					height,
					justifyContent: 'center',
					width,
				}}
				role="img"
				aria-label="Empty flowchart diagram">
				No nodes to display
			</div>
		);
	}

	return (
		<div
			className={`flowchart-diagram ${className}`.trim()}
			data-testid="flowchart-diagram"
			style={{
				border: '1px solid #e5e7eb',
				borderRadius: '8px',
				height,
				overflow: 'hidden',
				width,
			}}
			role="img"
			aria-label="Flowchart diagram visualization">
			<ReactFlowProvider>
				<FlowchartInner nodes={treeNodes} {...props} />
			</ReactFlowProvider>
		</div>
	);
}

// Set display name for debugging
FlowchartDiagram.displayName = 'FlowchartDiagram';

// Default export for convenience
export default FlowchartDiagram;
