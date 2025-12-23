/**
 * DiffViewer Component
 *
 * A React component for displaying side-by-side comparison of two sitemap versions.
 * Highlights added, removed, and modified nodes with visual indicators.
 *
 * @example
 * ```tsx
 * <DiffViewer
 *   baseVersion={savedVersion}
 *   compareVersion={currentVersion}
 *   result={comparisonResult}
 *   viewMode="side-by-side"
 * />
 * ```
 */
import React, { useMemo, useState } from 'react';

import { defaultTheme, getDepthColor } from '../theme/theme';
import type {
	ComparisonResult,
	DiffType,
	NodeDifference,
	SitemapVersion,
	TreeNode,
} from '../types/TreeNode';

// ============================================================================
// Types
// ============================================================================

export interface DiffViewerProps {
	/** The base/old version (left side) */
	baseVersion: SitemapVersion;
	/** The compare/new version (right side) */
	compareVersion: SitemapVersion;
	/** Comparison result from compareTrees */
	result: ComparisonResult;
	/** View mode */
	viewMode?: 'side-by-side' | 'unified' | 'changes-only';
	/** Custom class name */
	className?: string;
	/** Callback when a node is clicked */
	onNodeClick?: (node: TreeNode, side: 'base' | 'compare') => void;
	/** Whether to show the summary header */
	showSummary?: boolean;
	/** Whether to show property changes inline */
	showPropertyChanges?: boolean;
}

// ============================================================================
// Styles
// ============================================================================

const containerStyles: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	gap: '12px',
};

const summaryStyles: React.CSSProperties = {
	backgroundColor: '#f8fafc',
	border: '1px solid #e2e8f0',
	borderRadius: '8px',
	display: 'flex',
	flexWrap: 'wrap',
	gap: '16px',
	padding: '12px 16px',
};

const summaryItemStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	fontSize: '14px',
	gap: '8px',
};

const summaryCountStyles: React.CSSProperties = {
	fontSize: '16px',
	fontWeight: 600,
};

const sideBySideContainerStyles: React.CSSProperties = {
	display: 'grid',
	gap: '16px',
	gridTemplateColumns: '1fr 1fr',
};

const sideHeaderStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#f1f5f9',
	borderBottom: '1px solid #e2e8f0',
	color: '#475569',
	display: 'flex',
	fontSize: '13px',
	fontWeight: 600,
	justifyContent: 'space-between',
	padding: '8px 12px',
};

const sidePanelStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #e2e8f0',
	borderRadius: '8px',
	overflow: 'hidden',
};

const nodeListStyles: React.CSSProperties = {
	maxHeight: '500px',
	overflowY: 'auto',
	padding: '8px 0',
};

const getDiffNodeStyles = (
	diffType: DiffType,
	depth: number,
	isHovered: boolean
): React.CSSProperties => {
	const depthColor = getDepthColor(depth, defaultTheme.depthColors);

	const baseStyles: React.CSSProperties = {
		alignItems: 'center',
		borderLeft: '3px solid transparent',
		cursor: 'pointer',
		display: 'flex',
		fontSize: '14px',
		gap: '8px',
		padding: '6px 12px',
		paddingLeft: `${depth * 20 + 12}px`,
		transition: 'background-color 0.15s ease',
	};

	const hoverBg = isHovered ? 'rgba(0, 0, 0, 0.02)' : undefined;

	switch (diffType) {
		case 'added':
			return {
				...baseStyles,
				backgroundColor: isHovered ? '#dcfce7' : '#f0fdf4',
				borderLeftColor: '#22c55e',
				color: '#166534',
			};
		case 'removed':
			return {
				...baseStyles,
				backgroundColor: isHovered ? '#fee2e2' : '#fef2f2',
				borderLeftColor: '#ef4444',
				color: '#991b1b',
				textDecoration: 'line-through',
			};
		case 'modified':
			return {
				...baseStyles,
				backgroundColor: isHovered ? '#fef3c7' : '#fffbeb',
				borderLeftColor: '#f59e0b',
				color: '#92400e',
			};
		case 'unchanged':
		default:
			return {
				...baseStyles,
				backgroundColor: hoverBg ?? depthColor.bg,
				borderLeftColor: depthColor.border,
				color: depthColor.text,
			};
	}
};

const diffBadgeStyles: Record<DiffType, React.CSSProperties> = {
	added: {
		backgroundColor: '#22c55e',
		borderRadius: '4px',
		color: '#ffffff',
		fontSize: '11px',
		fontWeight: 600,
		padding: '2px 6px',
		textTransform: 'uppercase',
	},
	modified: {
		backgroundColor: '#f59e0b',
		borderRadius: '4px',
		color: '#ffffff',
		fontSize: '11px',
		fontWeight: 600,
		padding: '2px 6px',
		textTransform: 'uppercase',
	},
	moved: {
		backgroundColor: '#8b5cf6',
		borderRadius: '4px',
		color: '#ffffff',
		fontSize: '11px',
		fontWeight: 600,
		padding: '2px 6px',
		textTransform: 'uppercase',
	},
	removed: {
		backgroundColor: '#ef4444',
		borderRadius: '4px',
		color: '#ffffff',
		fontSize: '11px',
		fontWeight: 600,
		padding: '2px 6px',
		textTransform: 'uppercase',
	},
	unchanged: {
		display: 'none',
	},
};

const changeDetailsStyles: React.CSSProperties = {
	color: '#64748b',
	fontSize: '12px',
	fontStyle: 'italic',
	marginLeft: '8px',
};

const emptyStateStyles: React.CSSProperties = {
	color: '#94a3b8',
	fontSize: '14px',
	padding: '24px',
	textAlign: 'center',
};

const similarityBarContainerStyles: React.CSSProperties = {
	backgroundColor: '#e2e8f0',
	borderRadius: '4px',
	height: '8px',
	overflow: 'hidden',
	width: '100px',
};

const getSimilarityBarStyles = (percentage: number): React.CSSProperties => {
	let color = '#22c55e'; // green
	if (percentage < 50)
		color = '#ef4444'; // red
	else if (percentage < 75) color = '#f59e0b'; // yellow

	return {
		backgroundColor: color,
		height: '100%',
		transition: 'width 0.3s ease',
		width: `${percentage}%`,
	};
};

// ============================================================================
// Helper Components
// ============================================================================

interface DiffNodeProps {
	diff: NodeDifference;
	side: 'base' | 'compare';
	showBadge?: boolean;
	showPropertyChanges?: boolean;
	onClick?: (node: TreeNode, side: 'base' | 'compare') => void;
}

function DiffNode({
	diff,
	side,
	showBadge = true,
	showPropertyChanges = true,
	onClick,
}: DiffNodeProps): React.ReactElement | null {
	const [isHovered, setIsHovered] = useState(false);

	const node = side === 'base' ? diff.baseNode : diff.compareNode;

	// For added nodes, only show on compare side
	if (diff.type === 'added' && side === 'base') {
		return (
			<div
				style={{
					...getDiffNodeStyles('unchanged', diff.compareNode?.depth ?? 0, false),
					opacity: 0.3,
				}}>
				<span style={{ color: '#94a3b8' }}>—</span>
			</div>
		);
	}

	// For removed nodes, only show on base side
	if (diff.type === 'removed' && side === 'compare') {
		return (
			<div
				style={{
					...getDiffNodeStyles('unchanged', diff.baseNode?.depth ?? 0, false),
					opacity: 0.3,
				}}>
				<span style={{ color: '#94a3b8' }}>—</span>
			</div>
		);
	}

	if (!node) return null;

	const handleClick = () => {
		onClick?.(node, side);
	};

	const labelChange = diff.changes?.find((c) => c.property === 'label');

	return (
		<div
			style={getDiffNodeStyles(diff.type, node.depth, isHovered)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={handleClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
			{showBadge && diff.type !== 'unchanged' && (
				<span style={diffBadgeStyles[diff.type]}>{diff.type}</span>
			)}

			<span style={{ flex: 1 }}>
				{side === 'base' && labelChange ? (
					<>
						<span style={{ opacity: 0.7, textDecoration: 'line-through' }}>
							{labelChange.oldValue as string}
						</span>
					</>
				) : side === 'compare' && labelChange ? (
					<>
						<span style={{ fontWeight: 500 }}>{labelChange.newValue as string}</span>
					</>
				) : (
					node.label
				)}
			</span>

			{showPropertyChanges && diff.type === 'modified' && diff.changes && (
				<span style={changeDetailsStyles}>
					{diff.changes
						.filter((c) => c.property !== 'label')
						.map((c) => c.property.replace('metadata.', ''))
						.join(', ')}
					{diff.changes.filter((c) => c.property !== 'label').length > 0 && ' changed'}
				</span>
			)}
		</div>
	);
}

interface DiffNodeListProps {
	differences: NodeDifference[];
	side: 'base' | 'compare';
	showPropertyChanges?: boolean;
	onClick?: (node: TreeNode, side: 'base' | 'compare') => void;
}

function DiffNodeList({
	differences,
	side,
	showPropertyChanges,
	onClick,
}: DiffNodeListProps): React.ReactElement {
	const renderDiffs = (diffs: NodeDifference[]): React.ReactNode => {
		return diffs.map((diff) => (
			<React.Fragment key={diff.id}>
				<DiffNode
					diff={diff}
					side={side}
					showPropertyChanges={showPropertyChanges}
					onClick={onClick}
				/>
				{diff.childDifferences && renderDiffs(diff.childDifferences)}
			</React.Fragment>
		));
	};

	return <div style={nodeListStyles}>{renderDiffs(differences)}</div>;
}

// ============================================================================
// Summary Component
// ============================================================================

interface DiffSummaryProps {
	result: ComparisonResult;
}

function DiffSummary({ result }: DiffSummaryProps): React.ReactElement {
	const { summary } = result;

	return (
		<div style={summaryStyles}>
			<div style={summaryItemStyles}>
				<span style={{ color: '#22c55e' }}>+</span>
				<span style={summaryCountStyles}>{summary.addedCount}</span>
				<span style={{ color: '#64748b' }}>added</span>
			</div>

			<div style={summaryItemStyles}>
				<span style={{ color: '#ef4444' }}>-</span>
				<span style={summaryCountStyles}>{summary.removedCount}</span>
				<span style={{ color: '#64748b' }}>removed</span>
			</div>

			<div style={summaryItemStyles}>
				<span style={{ color: '#f59e0b' }}>~</span>
				<span style={summaryCountStyles}>{summary.modifiedCount}</span>
				<span style={{ color: '#64748b' }}>modified</span>
			</div>

			<div style={{ ...summaryItemStyles, marginLeft: 'auto' }}>
				<span style={{ color: '#64748b' }}>Similarity:</span>
				<div style={similarityBarContainerStyles}>
					<div style={getSimilarityBarStyles(summary.similarityPercentage)} />
				</div>
				<span style={{ fontWeight: 600 }}>{summary.similarityPercentage}%</span>
			</div>
		</div>
	);
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * DiffViewer displays a visual comparison between two sitemap versions.
 *
 * Features:
 * - Side-by-side view showing both versions
 * - Color-coded indicators for added, removed, and modified nodes
 * - Summary statistics with similarity percentage
 * - Interactive node highlighting
 * - Property change details
 */
export function DiffViewer({
	baseVersion,
	compareVersion,
	result,
	viewMode = 'side-by-side',
	className = '',
	onNodeClick,
	showSummary = true,
	showPropertyChanges = true,
}: DiffViewerProps): React.ReactElement {
	// Filter differences based on view mode
	const displayDifferences = useMemo(() => {
		if (viewMode === 'changes-only') {
			const filterChanges = (diffs: NodeDifference[]): NodeDifference[] => {
				return diffs
					.filter((d) => d.type !== 'unchanged' || d.childDifferences?.some(hasChanges))
					.map((d) => ({
						...d,
						childDifferences: d.childDifferences
							? filterChanges(d.childDifferences)
							: undefined,
					}));
			};

			const hasChanges = (d: NodeDifference): boolean => {
				if (d.type !== 'unchanged') return true;
				return d.childDifferences?.some(hasChanges) ?? false;
			};

			return filterChanges(result.differences);
		}
		return result.differences;
	}, [result.differences, viewMode]);

	const formatDate = (dateStr: string): string => {
		const date = new Date(dateStr);
		return date.toLocaleString();
	};

	if (viewMode === 'unified') {
		// Unified view shows all changes in a single column
		return (
			<div className={`diff-viewer ${className}`.trim()} style={containerStyles}>
				{showSummary && <DiffSummary result={result} />}

				<div style={sidePanelStyles}>
					<div style={sideHeaderStyles}>
						<span>Unified Diff View</span>
						<span style={{ fontSize: '12px', fontWeight: 400 }}>
							{baseVersion.name} → {compareVersion.name}
						</span>
					</div>
					{displayDifferences.length > 0 ? (
						<DiffNodeList
							differences={displayDifferences}
							side="compare"
							showPropertyChanges={showPropertyChanges}
							onClick={onNodeClick}
						/>
					) : (
						<div style={emptyStateStyles}>No differences found</div>
					)}
				</div>
			</div>
		);
	}

	// Side-by-side view (default)
	return (
		<div className={`diff-viewer ${className}`.trim()} style={containerStyles}>
			{showSummary && <DiffSummary result={result} />}

			<div style={sideBySideContainerStyles}>
				{/* Base (old) version */}
				<div style={sidePanelStyles}>
					<div style={sideHeaderStyles}>
						<span>{baseVersion.name}</span>
						<span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 400 }}>
							{formatDate(baseVersion.createdAt)}
						</span>
					</div>
					{displayDifferences.length > 0 ? (
						<DiffNodeList
							differences={displayDifferences}
							side="base"
							showPropertyChanges={showPropertyChanges}
							onClick={onNodeClick}
						/>
					) : (
						<div style={emptyStateStyles}>No nodes</div>
					)}
				</div>

				{/* Compare (new) version */}
				<div style={sidePanelStyles}>
					<div style={sideHeaderStyles}>
						<span>{compareVersion.name}</span>
						<span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 400 }}>
							{formatDate(compareVersion.createdAt)}
						</span>
					</div>
					{displayDifferences.length > 0 ? (
						<DiffNodeList
							differences={displayDifferences}
							side="compare"
							showPropertyChanges={showPropertyChanges}
							onClick={onNodeClick}
						/>
					) : (
						<div style={emptyStateStyles}>No nodes</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default DiffViewer;
