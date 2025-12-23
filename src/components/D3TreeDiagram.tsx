/**
 * D3TreeDiagram Component
 *
 * A React component that renders tree diagrams using D3.js with connecting
 * lines and arcs between parent and child nodes. Provides hierarchical
 * force-directed layout with smooth animations.
 *
 * @example
 * ```tsx
 * import { D3TreeDiagram } from './components/D3TreeDiagram';
 * import { parseAndBuildTree } from './utils/treeParser';
 *
 * const { tree } = parseAndBuildTree(`
 * Home
 * ├── About
 * └── Contact
 * `);
 *
 * <D3TreeDiagram nodes={tree} width={800} height={600} />
 * ```
 */
import * as d3 from 'd3';
import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';

import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Types
// ============================================================================

/**
 * Layout type options for the tree diagram.
 */
export type LayoutType = 'tree' | 'radial' | 'cluster';

/**
 * Link style options for connecting lines.
 */
export type LinkStyle = 'diagonal' | 'elbow' | 'straight';

/**
 * Orientation options for tree layout.
 */
export type OrientationType = 'horizontal' | 'vertical';

/**
 * Props for the D3TreeDiagram component.
 */
export interface D3TreeDiagramProps {
	/** Array of root-level tree nodes to render */
	nodes: TreeNode[];

	/** Width of the SVG container in pixels (default: 800) */
	width?: number;

	/** Height of the SVG container in pixels (default: 600) */
	height?: number;

	/** Optional CSS class name for the container */
	className?: string;

	/** Layout algorithm to use (default: 'tree') */
	layout?: LayoutType;

	/** Orientation of the tree (default: 'horizontal') */
	orientation?: OrientationType;

	/** Style of connecting lines (default: 'diagonal') */
	linkStyle?: LinkStyle;

	/** Duration of animations in milliseconds (default: 500) */
	animationDuration?: number;

	/** Size of node circles in pixels (default: 8) */
	nodeSize?: number;

	/** Color for connecting lines (default: '#999') */
	linkColor?: string;

	/** Color for node circles (default: '#4A90A4') */
	nodeColor?: string;

	/** Color for node text (default: '#333') */
	textColor?: string;

	/** Horizontal spacing between nodes (default: 180) */
	nodeSpacing?: number;

	/** Whether to enable zoom and pan (default: true) */
	enableZoom?: boolean;

	/** Optional callback when a node is clicked */
	onNodeClick?: (node: TreeNode) => void;

	/** Optional callback when a node is hovered */
	onNodeHover?: (node: TreeNode | null) => void;

	/** Optional custom render function for node labels */
	renderLabel?: (node: TreeNode) => string;

	/** Margin around the tree diagram */
	margin?: { top: number; right: number; bottom: number; left: number };

	/** Minimum zoom level at which to show text labels (default: 0.5) */
	labelVisibilityThreshold?: number;

	/** Maximum label width before clipping in pixels (default: 150) */
	maxLabelWidth?: number;

	/** Enable GPU-accelerated CSS transforms for smoother animations (default: true) */
	useGPUAcceleration?: boolean;
}

/**
 * Internal D3 hierarchy node type with TreeNode data.
 */
type D3HierarchyNode = d3.HierarchyPointNode<TreeNode>;

/**
 * Internal D3 hierarchy link type.
 */
type D3HierarchyLink = d3.HierarchyPointLink<TreeNode>;

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const DEFAULT_ANIMATION_DURATION = 500;
const DEFAULT_NODE_SIZE = 8;
const DEFAULT_LINK_COLOR = '#999';
const DEFAULT_NODE_COLOR = '#4A90A4';
const DEFAULT_TEXT_COLOR = '#333';
const DEFAULT_NODE_SPACING = 180;
const DEFAULT_MARGIN = { bottom: 40, left: 120, right: 120, top: 40 };
const DEFAULT_LABEL_VISIBILITY_THRESHOLD = 0.5;
const DEFAULT_MAX_LABEL_WIDTH = 150;
const DEFAULT_USE_GPU_ACCELERATION = true;

// ============================================================================
// CSS Styles for GPU-accelerated animations
// ============================================================================

/**
 * Injects CSS styles for GPU-accelerated transforms and smooth animations.
 * Uses will-change and transform for hardware acceleration.
 */
function injectGPUStyles(): void {
	const styleId = 'd3-tree-gpu-styles';
	if (document.getElementById(styleId)) return;

	const style = document.createElement('style');
	style.id = styleId;
	style.textContent = `
		.d3-tree-node {
			will-change: transform, opacity;
		}
		.d3-tree-node circle {
			will-change: r, transform;
			transition: r 150ms ease-out;
		}
		.d3-tree-node text {
			will-change: opacity;
			transition: opacity 200ms ease-out;
		}
		.d3-tree-node text.label-hidden {
			opacity: 0;
			pointer-events: none;
		}
		.d3-tree-node text.label-visible {
			opacity: 1;
		}
		.d3-tree-node:hover circle {
			transform: scale(1.3);
			transform-origin: center;
		}
		.d3-tree-link {
			will-change: opacity;
		}
	`;
	document.head.appendChild(style);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Converts TreeNode array to D3 hierarchy format.
 * Wraps multiple roots in a virtual root node.
 */
function convertToD3Hierarchy(nodes: TreeNode[]): d3.HierarchyNode<TreeNode> {
	if (nodes.length === 0) {
		// Return an empty virtual root
		return d3.hierarchy<TreeNode>({
			children: [],
			depth: -1,
			id: '__virtual_root__',
			label: '',
		});
	}

	if (nodes.length === 1) {
		return d3.hierarchy(nodes[0]);
	}

	// Multiple roots: create a virtual root node
	const virtualRoot: TreeNode = {
		children: nodes,
		depth: -1,
		id: '__virtual_root__',
		label: '',
	};

	return d3.hierarchy(virtualRoot);
}

/**
 * Gets the link path generator based on link style and orientation.
 */
function getLinkPathGenerator(
	linkStyle: LinkStyle,
	layout: LayoutType,
	orientation: OrientationType
): (link: D3HierarchyLink) => string {
	if (layout === 'radial') {
		return (link: D3HierarchyLink): string => {
			const sourceAngle = ((link.source.x - 90) * Math.PI) / 180;
			const sourceRadius = link.source.y;
			const targetAngle = ((link.target.x - 90) * Math.PI) / 180;
			const targetRadius = link.target.y;

			const sourceX = sourceRadius * Math.cos(sourceAngle);
			const sourceY = sourceRadius * Math.sin(sourceAngle);
			const targetX = targetRadius * Math.cos(targetAngle);
			const targetY = targetRadius * Math.sin(targetAngle);

			if (linkStyle === 'straight') {
				return `M${sourceX},${sourceY}L${targetX},${targetY}`;
			}

			return (
				d3
					.linkRadial<D3HierarchyLink, D3HierarchyNode>()
					.angle((d) => (d.x * Math.PI) / 180)
					.radius((d) => d.y)(link) || ''
			);
		};
	}

	if (orientation === 'vertical') {
		switch (linkStyle) {
			case 'straight':
				return (link: D3HierarchyLink): string =>
					`M${link.source.x},${link.source.y}L${link.target.x},${link.target.y}`;

			case 'elbow':
				return (link: D3HierarchyLink): string => {
					const midY = (link.source.y + link.target.y) / 2;
					return `M${link.source.x},${link.source.y}
	                V${midY}
	                H${link.target.x}
	                V${link.target.y}`;
				};

			case 'diagonal':
			default:
				return (link: D3HierarchyLink): string =>
					d3
						.linkVertical<D3HierarchyLink, D3HierarchyNode>()
						.x((d) => d.x)
						.y((d) => d.y)(link) || '';
		}
	}

	switch (linkStyle) {
		case 'straight':
			return (link: D3HierarchyLink): string =>
				`M${link.source.y},${link.source.x}L${link.target.y},${link.target.x}`;

		case 'elbow':
			return (link: D3HierarchyLink): string => {
				const midY = (link.source.y + link.target.y) / 2;
				return `M${link.source.y},${link.source.x}
                H${midY}
                V${link.target.x}
                H${link.target.y}`;
			};

		case 'diagonal':
		default:
			return (link: D3HierarchyLink): string =>
				d3
					.linkHorizontal<D3HierarchyLink, D3HierarchyNode>()
					.x((d) => d.y)
					.y((d) => d.x)(link) || '';
	}
}

/**
 * Depth-based color configuration for visual hierarchy in D3 diagrams:
 * - Depth 0 (Pages): Blue - Primary, most prominent
 * - Depth 1 (Sections): Light gray/white - Secondary level
 * - Depth 2+ (Components): Gray shades - Progressively lighter
 */
const D3_DEPTH_COLORS = {
	// Sub-components: Gray shades with progressive lightening
	component: '#6b7280',

	componentLight: '#9ca3af',

	componentLighter: '#d1d5db',

	// Top-level pages: Blue (matching BasicTree)
	page: '#3b82f6',
	// Sub-sections: Light gray (white doesn't show well on diagrams)
	section: '#9ca3af',
} as const;

/**
 * Gets depth-based colors for nodes following visual hierarchy:
 * - Top-level pages appear blue
 * - Sub-sections appear light gray
 * - Sub-components appear progressively lighter gray
 */
function getDepthColor(depth: number): string {
	if (depth === 0) {
		return D3_DEPTH_COLORS.page;
	} else if (depth === 1) {
		return D3_DEPTH_COLORS.section;
	} else if (depth === 2) {
		return D3_DEPTH_COLORS.component;
	} else if (depth === 3) {
		return D3_DEPTH_COLORS.componentLight;
	} else {
		return D3_DEPTH_COLORS.componentLighter;
	}
}

/**
 * Gets the node size based on depth for visual hierarchy.
 * Top-level nodes are larger, deeper nodes progressively smaller.
 *
 * @param baseSize - The base node size from props
 * @param depth - The depth level of the node
 * @returns Node size in pixels
 */
function getDepthNodeSize(baseSize: number, depth: number): number {
	const minSizeFactor = 0.6; // Minimum 60% of base size
	const reduction = Math.min(depth * 0.1, 0.4); // Max 40% reduction
	return baseSize * Math.max(1 - reduction, minSizeFactor);
}

/**
 * Gets the font size based on depth for visual hierarchy.
 * Top-level nodes have larger text, deeper nodes have smaller text.
 *
 * @param depth - The depth level of the node
 * @returns Font size in pixels
 */
function getDepthFontSize(depth: number): number {
	const baseFontSize = 13;
	const minFontSize = 10;
	const reduction = Math.min(depth * 0.5, 3); // Max 3px reduction
	return Math.max(baseFontSize - reduction, minFontSize);
}

/**
 * Gets the font weight based on depth for visual hierarchy.
 * Top-level nodes are bolder, deeper nodes are lighter.
 *
 * @param depth - The depth level of the node
 * @returns Font weight (CSS value)
 */
function getDepthFontWeight(depth: number): number {
	if (depth === 0) return 600;
	if (depth === 1) return 500;
	return 400;
}

// ============================================================================
// D3TreeDiagram Component
// ============================================================================

/**
 * D3TreeDiagram component renders a hierarchical tree diagram using D3.js.
 *
 * Features:
 * - Multiple layout algorithms (tree, radial, cluster)
 * - Different link styles (diagonal, elbow, straight)
 * - Smooth animations on data changes
 * - Interactive zoom and pan
 * - Click and hover callbacks
 * - Depth-based node coloring
 * - Customizable styling
 * - Accessible with ARIA labels
 *
 * Performance optimized with React.memo() and split useEffect hooks
 * to minimize unnecessary re-renders.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <D3TreeDiagram nodes={treeNodes} />
 *
 * // With custom layout and styling
 * <D3TreeDiagram
 *   nodes={treeNodes}
 *   layout="radial"
 *   linkStyle="diagonal"
 *   nodeColor="#FF5722"
 *   onNodeClick={(node) => console.log('Clicked:', node.label)}
 * />
 *
 * // With zoom disabled
 * <D3TreeDiagram
 *   nodes={treeNodes}
 *   enableZoom={false}
 *   width={1200}
 *   height={800}
 * />
 * ```
 */
const D3TreeDiagramInner = forwardRef<SVGSVGElement, D3TreeDiagramProps>(
	(
		{
			nodes,
			width = DEFAULT_WIDTH,
			height = DEFAULT_HEIGHT,
			className = '',
			layout = 'tree',
			orientation = 'horizontal',
			linkStyle = 'diagonal',
			animationDuration = DEFAULT_ANIMATION_DURATION,
			nodeSize = DEFAULT_NODE_SIZE,
			linkColor = DEFAULT_LINK_COLOR,
			// Note: nodeColor prop is kept for API compatibility but depth-based
			// colors are used instead. To use custom nodeColor, override via metadata.
			nodeColor: _nodeColor = DEFAULT_NODE_COLOR,
			textColor = DEFAULT_TEXT_COLOR,
			nodeSpacing = DEFAULT_NODE_SPACING,
			enableZoom = true,
			onNodeClick,
			onNodeHover,
			renderLabel,
			margin = DEFAULT_MARGIN,
			labelVisibilityThreshold = DEFAULT_LABEL_VISIBILITY_THRESHOLD,
			maxLabelWidth = DEFAULT_MAX_LABEL_WIDTH,
			useGPUAcceleration = DEFAULT_USE_GPU_ACCELERATION,
		}: D3TreeDiagramProps,
		ref
	): React.ReactElement => {
		const svgRef = useRef<SVGSVGElement>(null);
		const gRef = useRef<SVGGElement | null>(null);

		// Track current zoom scale for lazy label rendering
		const [currentZoomScale, setCurrentZoomScale] = useState<number>(1);
		const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

		// Expose the SVG element to parent components via ref
		useImperativeHandle(ref, () => svgRef.current!, []);

		// ====================================================================
		// Memoized computed values to prevent recalculation on every render
		// ====================================================================

		/**
		 * Inner dimensions after accounting for margins.
		 */
		const dimensions = useMemo(
			() => ({
				innerHeight: height - margin.top - margin.bottom,
				innerWidth: width - margin.left - margin.right,
			}),
			[width, height, margin.left, margin.right, margin.top, margin.bottom]
		);

		/**
		 * Memoized D3 hierarchy from nodes array.
		 * Only recalculates when nodes change.
		 */
		const hierarchyRoot = useMemo(() => {
			if (!nodes || nodes.length === 0) return null;
			return convertToD3Hierarchy(nodes);
		}, [nodes]);

		/**
		 * Memoized link path generator based on layout and style.
		 * Only recalculates when layout options change.
		 */
		const linkPathGenerator = useMemo(
			() => getLinkPathGenerator(linkStyle, layout, orientation),
			[linkStyle, layout, orientation]
		);

		// ====================================================================
		// Memoized callback functions to prevent unnecessary effect triggers
		// ====================================================================

		/**
		 * Handles node click events.
		 */
		const handleNodeClick = useCallback(
			(event: MouseEvent, d: D3HierarchyNode) => {
				event.stopPropagation();
				if (d.data.id !== '__virtual_root__' && onNodeClick) {
					onNodeClick(d.data);
				}
			},
			[onNodeClick]
		);

		/**
		 * Handles node hover events.
		 */
		const handleNodeHover = useCallback(
			(d: D3HierarchyNode | null) => {
				if (onNodeHover) {
					onNodeHover(d && d.data.id !== '__virtual_root__' ? d.data : null);
				}
			},
			[onNodeHover]
		);

		/**
		 * Gets the label text for a node.
		 */
		const getNodeLabel = useCallback(
			(d: D3HierarchyNode): string => {
				if (d.data.id === '__virtual_root__') return '';
				if (renderLabel) return renderLabel(d.data);
				return d.data.label;
			},
			[renderLabel]
		);

		// ====================================================================
		// Effect 0: Inject/remove GPU-accelerated CSS styles
		// ====================================================================
		useEffect(() => {
			if (useGPUAcceleration) {
				injectGPUStyles();
			}
			return () => {
				// Only remove if no other instances are using the styles
				// In practice, we keep them around for better performance
			};
		}, [useGPUAcceleration]);

		// ====================================================================
		// Effect 1: Initialize SVG container and accessibility elements
		// Only depends on basic container setup
		// ====================================================================
		useEffect(() => {
			if (!svgRef.current) return;

			const svg = d3.select(svgRef.current);

			// Clear previous content
			svg.selectAll('*').remove();

			// Re-add accessibility elements
			svg.append('title').text('Tree Diagram');
			svg.append('desc').text('A hierarchical tree diagram');

			// Handle empty nodes - render empty state message
			if (!hierarchyRoot) {
				svg.append('text')
					.attr('x', width / 2)
					.attr('y', height / 2)
					.attr('text-anchor', 'middle')
					.attr('fill', '#6b7280')
					.attr('font-style', 'italic')
					.text('No nodes to display');
				return;
			}

			// Add defs for clipPath (SVG text clipping)
			const defs = svg.append('defs');

			// Create clipPath for text labels to prevent overflow
			defs.append('clipPath')
				.attr('id', 'label-clip')
				.append('rect')
				.attr('x', 0)
				.attr('y', -10)
				.attr('width', maxLabelWidth)
				.attr('height', 20);

			// Create container group with margins
			const g = svg.append('g').attr('class', 'd3-tree-container');
			gRef.current = g.node();

			// Set initial transform based on layout
			if (layout === 'radial') {
				g.attr('transform', `translate(${width / 2},${height / 2})`);
			} else {
				g.attr('transform', `translate(${margin.left},${margin.top})`);
			}
		}, [hierarchyRoot, width, height, layout, margin.left, margin.top, maxLabelWidth]);

		// ====================================================================
		// Effect 2: Setup zoom behavior with scale tracking for lazy labels
		// Only depends on zoom-related props
		// ====================================================================
		useEffect(() => {
			if (!svgRef.current || !gRef.current || !enableZoom || !hierarchyRoot) return undefined;

			const svg = d3.select(svgRef.current);
			const g = d3.select(gRef.current);

			// Throttle function to limit zoom scale updates for performance
			let lastUpdateTime = 0;
			const throttleMs = 16; // ~60fps

			const zoom = d3
				.zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.1, 4])
				.on('zoom', (event) => {
					// Use CSS transform for GPU acceleration when available
					if (useGPUAcceleration) {
						const { x, y, k } = event.transform;
						g.style('transform', `translate(${x}px, ${y}px) scale(${k})`);
						g.style('transform-origin', '0 0');
					} else {
						g.attr('transform', event.transform);
					}

					// Throttle zoom scale state updates to reduce React re-renders
					const now = Date.now();
					if (now - lastUpdateTime > throttleMs) {
						lastUpdateTime = now;
						const newScale = event.transform.k;
						setCurrentZoomScale(newScale);

						// Update label visibility based on zoom level
						const labelsVisible = newScale >= labelVisibilityThreshold;
						g.selectAll('.d3-tree-node text')
							.classed('label-visible', labelsVisible)
							.classed('label-hidden', !labelsVisible);
					}
				});

			zoomBehaviorRef.current = zoom;
			svg.call(zoom);

			// Set initial transform
			if (layout === 'radial') {
				svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));
			} else {
				svg.call(zoom.transform, d3.zoomIdentity.translate(margin.left, margin.top));
			}

			// Cleanup: remove zoom behavior on unmount
			return () => {
				svg.on('.zoom', null);
				zoomBehaviorRef.current = null;
			};
		}, [
			enableZoom,
			layout,
			width,
			height,
			margin.left,
			margin.top,
			hierarchyRoot,
			labelVisibilityThreshold,
			useGPUAcceleration,
		]);

		// ====================================================================
		// Effect 3: Render tree layout, links, and nodes
		// Core rendering logic with optimized dependencies
		// ====================================================================
		useEffect(() => {
			if (!svgRef.current || !gRef.current || !hierarchyRoot) return;

			const g = d3.select(gRef.current);
			const { innerWidth, innerHeight } = dimensions;

			// Clear previous tree content but keep container
			g.selectAll('.d3-tree-links, .d3-tree-nodes').remove();

			// Create layout
			let treeLayout: d3.TreeLayout<TreeNode> | d3.ClusterLayout<TreeNode>;

			if (layout === 'cluster') {
				treeLayout = d3.cluster<TreeNode>();
			} else {
				treeLayout = d3.tree<TreeNode>();
			}

			// Configure layout size
			if (layout === 'radial') {
				treeLayout.size([360, Math.min(innerWidth, innerHeight) / 2 - nodeSpacing]);
			} else if (orientation === 'vertical') {
				treeLayout.size([innerWidth, innerHeight]);
			} else {
				treeLayout.size([innerHeight, innerWidth]);
			}

			// Set node separation
			treeLayout.separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

			// Apply layout
			const layoutRoot = treeLayout(hierarchyRoot) as D3HierarchyNode;

			// Get all nodes and links (excluding virtual root if present)
			let allNodes = layoutRoot.descendants();
			let allLinks = layoutRoot.links();

			// Filter out virtual root if it exists
			if (layoutRoot.data.id === '__virtual_root__') {
				allNodes = allNodes.filter((d) => d.data.id !== '__virtual_root__');
				allLinks = allLinks.filter(
					(d) =>
						d.source.data.id !== '__virtual_root__' &&
						d.target.data.id !== '__virtual_root__'
				);
			}

			// Create links group
			const linksGroup = g.append('g').attr('class', 'd3-tree-links');

			// Draw links
			linksGroup
				.selectAll('path')
				.data(allLinks)
				.join('path')
				.attr('class', 'd3-tree-link')
				.attr('fill', 'none')
				.attr('stroke', linkColor)
				.attr('stroke-width', 1.5)
				.attr('stroke-opacity', 0.6)
				.attr('d', linkPathGenerator)
				.attr('opacity', 0)
				.transition()
				.duration(animationDuration)
				.attr('opacity', 1);

			// Create nodes group
			const nodesGroup = g.append('g').attr('class', 'd3-tree-nodes');

			// Draw nodes
			const nodeGroups = nodesGroup
				.selectAll('g')
				.data(allNodes)
				.join('g')
				.attr('class', 'd3-tree-node')
				.attr('data-node-id', (d) => d.data.id)
				.attr('data-depth', (d) => d.data.depth)
				.attr('transform', (d) => {
					if (layout === 'radial') {
						const angle = ((d.x - 90) * Math.PI) / 180;
						const radius = d.y;
						const x = radius * Math.cos(angle);
						const y = radius * Math.sin(angle);
						return `translate(${x},${y})`;
					}
					if (orientation === 'vertical') {
						return `translate(${d.x},${d.y})`;
					}
					return `translate(${d.y},${d.x})`;
				})
				.style('cursor', onNodeClick ? 'pointer' : 'default')
				.attr('opacity', 0);

			// Animate nodes in
			nodeGroups.transition().duration(animationDuration).attr('opacity', 1);

			// Add circles for nodes with depth-based sizing
			nodeGroups
				.append('circle')
				.attr('r', (d) => getDepthNodeSize(nodeSize, d.data.depth))
				.attr('fill', (d) => {
					if (d.data.metadata?.style?.backgroundColor) {
						return d.data.metadata.style.backgroundColor;
					}
					return getDepthColor(d.data.depth);
				})
				.attr('stroke', (d) => {
					const baseColor =
						d.data.metadata?.style?.borderColor || getDepthColor(d.data.depth);
					return d3.color(baseColor)?.darker(0.5).toString() || baseColor;
				})
				.attr('stroke-width', (d) =>
					d.data.depth === 0 ? 2.5 : d.data.depth === 1 ? 2 : 1.5
				);

			// Add text labels with depth-based styling and lazy rendering
			// Labels are initially visible/hidden based on current zoom level
			const initialLabelsVisible = currentZoomScale >= labelVisibilityThreshold;

			// Create a wrapper group for each text element to apply clipping
			const textGroups = nodeGroups.append('g').attr('class', 'd3-tree-label-group');

			textGroups
				.append('text')
				.attr('class', () => (initialLabelsVisible ? 'label-visible' : 'label-hidden'))
				.attr('dy', (d) => {
					if (orientation === 'vertical') {
						return d.children ? -15 : 15;
					}
					return '0.31em';
				})
				.attr('x', (d) => {
					if (layout === 'radial') {
						return d.x < 180 === !d.children ? 12 : -12;
					}
					if (orientation === 'vertical') {
						return 0;
					}
					return d.children ? -12 : 12;
				})
				.attr('text-anchor', (d) => {
					if (layout === 'radial') {
						return d.x < 180 === !d.children ? 'start' : 'end';
					}
					if (orientation === 'vertical') {
						return 'middle';
					}
					return d.children ? 'end' : 'start';
				})
				.attr('transform', (d) => {
					if (layout === 'radial') {
						return d.x >= 180 ? 'rotate(180)' : null;
					}
					return null;
				})
				.attr('fill', (d) => d.data.metadata?.style?.textColor || textColor)
				.attr('font-size', (d) => `${getDepthFontSize(d.data.depth)}px`)
				.attr('font-weight', (d) => getDepthFontWeight(d.data.depth))
				.attr(
					'font-family',
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
				)
				// Apply text clipping via textLength and lengthAdjust for overflow
				.each(function (d) {
					const text = d3.select(this);
					const label = getNodeLabel(d);
					text.text(label);

					// Truncate text if it exceeds maxLabelWidth
					// This is more performant than SVG clipPath for text
					const node = this as SVGTextElement;
					if (
						node.getComputedTextLength &&
						node.getComputedTextLength() > maxLabelWidth
					) {
						let truncatedLabel = label;
						while (
							truncatedLabel.length > 0 &&
							node.getComputedTextLength() > maxLabelWidth - 12
						) {
							truncatedLabel = truncatedLabel.slice(0, -1);
							text.text(truncatedLabel + '…');
						}
					}
				});

			// Add interactive events
			nodeGroups
				.on('click', (event, d) => handleNodeClick(event, d))
				.on('mouseenter', (_, d) => handleNodeHover(d))
				.on('mouseleave', () => handleNodeHover(null));

			// Add hover effect using CSS transforms for smoother GPU-accelerated animations
			// When useGPUAcceleration is true, hover effects are handled by CSS (see injectGPUStyles)
			// When false, fall back to D3 transitions
			if (!useGPUAcceleration) {
				nodeGroups
					.on('mouseenter.style', function (_, d) {
						const depthSize = getDepthNodeSize(nodeSize, d.data.depth);
						d3.select(this)
							.select('circle')
							.transition()
							.duration(150)
							.attr('r', depthSize * 1.3);
					})
					.on('mouseleave.style', function (_, d) {
						const depthSize = getDepthNodeSize(nodeSize, d.data.depth);
						d3.select(this)
							.select('circle')
							.transition()
							.duration(150)
							.attr('r', depthSize);
					});
			}
		}, [
			// Tree structure dependencies
			hierarchyRoot,
			dimensions,
			// Layout dependencies
			layout,
			orientation,
			nodeSpacing,
			// Visual style dependencies
			linkColor,
			textColor,
			nodeSize,
			animationDuration,
			linkPathGenerator,
			// Callback dependencies (memoized, stable)
			onNodeClick,
			handleNodeClick,
			handleNodeHover,
			getNodeLabel,
			// Optimization dependencies
			currentZoomScale,
			labelVisibilityThreshold,
			maxLabelWidth,
			useGPUAcceleration,
		]);

		// Render empty state
		if (!nodes || nodes.length === 0) {
			return (
				<div
					className={`d3-tree-diagram d3-tree-diagram--empty ${className}`.trim()}
					style={{
						alignItems: 'center',
						color: '#6b7280',
						display: 'flex',
						fontStyle: 'italic',
						height,
						justifyContent: 'center',
						width,
					}}
					role="img"
					aria-label="Empty tree diagram">
					No nodes to display
				</div>
			);
		}

		return (
			<div
				className={`d3-tree-diagram ${className}`.trim()}
				style={{
					height,
					overflow: 'hidden',
					width,
				}}>
				<svg
					ref={svgRef}
					width={width}
					height={height}
					style={{
						background: '#fafafa',
						display: 'block',
					}}
					role="img"
					aria-label="Tree diagram visualization">
					<title>Tree Diagram</title>
					<desc>
						A hierarchical tree diagram showing {nodes.length} root node(s) with their
						children connected by lines.
					</desc>
				</svg>
			</div>
		);
	}
);

// Set display name for debugging
D3TreeDiagramInner.displayName = 'D3TreeDiagram';

/**
 * Memoized D3TreeDiagram component.
 *
 * Wrapped with React.memo() for performance optimization to prevent unnecessary
 * re-renders when parent components update but props haven't changed.
 */
export const D3TreeDiagram = memo(D3TreeDiagramInner);

// Default export for convenience
export default D3TreeDiagram;
