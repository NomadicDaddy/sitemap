/**
 * SitemapEditorWithComparison Component
 *
 * An extended version of SitemapEditor that includes version management
 * and comparison/diff view capabilities. Allows users to save versions,
 * compare versions side-by-side, and track changes over time.
 *
 * @example
 * ```tsx
 * <SitemapEditorWithComparison
 *   initialValue="Home\n├── About\n└── Contact"
 *   showVersionManager
 *   onTreeChange={(tree) => console.log('Tree updated:', tree)}
 * />
 * ```
 */
import React, { useCallback, useState } from 'react';

import type { ComparisonState, SitemapVersion, TreeNode } from '../types/TreeNode';
import { treeNodesToText } from '../utils/sitemapGenerator';
import { compareTrees } from '../utils/treeComparison';
import { DiffViewer } from './DiffViewer';
import { SitemapEditor, type SitemapEditorProps } from './SitemapEditor';
import { VersionManager } from './VersionManager';

// ============================================================================
// Types
// ============================================================================

export interface SitemapEditorWithComparisonProps extends SitemapEditorProps {
	/** Whether to show the version manager panel (default: true) */
	showVersionManager?: boolean;
	/** Position of the version manager panel */
	versionManagerPosition?: 'left' | 'right' | 'bottom';
	/** Callback when comparison mode is entered */
	onComparisonStart?: (base: SitemapVersion, compare: SitemapVersion) => void;
	/** Callback when comparison mode is exited */
	onComparisonEnd?: () => void;
	/** Callback when a version is saved */
	_onVersionSave?: (version: SitemapVersion) => void;
	/** Callback when a version is loaded */
	onVersionLoad?: (version: SitemapVersion) => void;
}

// ============================================================================
// Styles
// ============================================================================

const wrapperStyles: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	gap: '16px',
};

const mainContentStyles: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: '16px',
};

const editorSectionStyles: React.CSSProperties = {
	flex: '1 1 70%',
	minWidth: '500px',
};

const versionManagerSectionStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #e5e7eb',
	borderRadius: '8px',
	flex: '1 1 25%',
	maxHeight: 'fit-content',
	maxWidth: '400px',
	minWidth: '300px',
	padding: '16px',
};

const versionManagerBottomStyles: React.CSSProperties = {
	...versionManagerSectionStyles,
	flex: '1 1 100%',
	maxWidth: 'none',
};

const comparisonOverlayStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #e5e7eb',
	borderRadius: '8px',
	padding: '16px',
};

const comparisonHeaderStyles: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: '1px solid #e5e7eb',
	display: 'flex',
	justifyContent: 'space-between',
	marginBottom: '16px',
	paddingBottom: '12px',
};

const comparisonTitleStyles: React.CSSProperties = {
	color: '#1f2937',
	fontSize: '16px',
	fontWeight: 600,
	margin: 0,
};

const buttonStyles: React.CSSProperties = {
	backgroundColor: '#f3f4f6',
	border: '1px solid #d1d5db',
	borderRadius: '6px',
	color: '#374151',
	cursor: 'pointer',
	fontSize: '13px',
	fontWeight: 500,
	padding: '6px 12px',
	transition: 'all 0.15s ease',
};

const primaryButtonStyles: React.CSSProperties = {
	...buttonStyles,
	backgroundColor: '#3b82f6',
	borderColor: '#2563eb',
	color: '#ffffff',
};

const viewModeButtonsStyles: React.CSSProperties = {
	display: 'flex',
	gap: '8px',
};

const activeViewModeButtonStyles: React.CSSProperties = {
	...buttonStyles,
	backgroundColor: '#dbeafe',
	borderColor: '#3b82f6',
	color: '#1d4ed8',
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * SitemapEditorWithComparison extends SitemapEditor with version management
 * and diff/comparison capabilities.
 *
 * Features:
 * - All features of SitemapEditor
 * - Save and manage sitemap versions
 * - Compare any two versions side-by-side
 * - Visual diff highlighting (added, removed, modified nodes)
 * - Multiple view modes (side-by-side, unified, changes-only)
 */
export function SitemapEditorWithComparison({
	showVersionManager = true,
	versionManagerPosition = 'right',
	onComparisonStart,
	onComparisonEnd,
	_onVersionSave,
	onVersionLoad,
	initialValue = '',
	...editorProps
}: SitemapEditorWithComparisonProps): React.ReactElement {
	// Track current tree and input value
	const [currentTree, setCurrentTree] = useState<TreeNode[]>([]);
	const [currentInputValue, setCurrentInputValue] = useState<string>(initialValue);

	// Comparison state
	const [comparisonState, setComparisonState] = useState<{
		isComparing: boolean;
		baseVersion?: SitemapVersion;
		compareVersion?: SitemapVersion;
		viewMode: ComparisonState['viewMode'];
	}>({
		isComparing: false,
		viewMode: 'side-by-side',
	});

	// Handle tree changes from editor
	const handleTreeChange = useCallback(
		(tree: TreeNode[], success: boolean) => {
			setCurrentTree(tree);
			editorProps.onTreeChange?.(tree, success);
		},
		[editorProps]
	);

	// Handle input changes from editor
	const handleInputChange = useCallback(
		(value: string) => {
			setCurrentInputValue(value);
			editorProps.onInputChange?.(value);
		},
		[editorProps]
	);

	// Handle starting comparison
	const handleCompare = useCallback(
		(base: SitemapVersion, compare: SitemapVersion) => {
			setComparisonState({
				baseVersion: base,
				compareVersion: compare,
				isComparing: true,
				viewMode: 'side-by-side',
			});
			onComparisonStart?.(base, compare);
		},
		[onComparisonStart]
	);

	// Handle ending comparison
	const handleEndComparison = useCallback(() => {
		setComparisonState((prev) => ({
			...prev,
			baseVersion: undefined,
			compareVersion: undefined,
			isComparing: false,
		}));
		onComparisonEnd?.();
	}, [onComparisonEnd]);

	// Handle changing view mode
	const handleViewModeChange = useCallback((mode: ComparisonState['viewMode']) => {
		setComparisonState((prev) => ({ ...prev, viewMode: mode }));
	}, []);

	// Handle loading a version
	const handleLoadVersion = useCallback(
		(version: SitemapVersion) => {
			// Update the input value with the version's source text or regenerate it
			const textValue = version.sourceText ?? treeNodesToText(version.nodes);
			setCurrentInputValue(textValue);
			setCurrentTree(version.nodes);
			onVersionLoad?.(version);
		},
		[onVersionLoad]
	);

	// Compute comparison result
	const comparisonResult = React.useMemo(() => {
		if (
			!comparisonState.isComparing ||
			!comparisonState.baseVersion ||
			!comparisonState.compareVersion
		) {
			return null;
		}

		return compareTrees(
			comparisonState.baseVersion.nodes,
			comparisonState.compareVersion.nodes
		);
	}, [comparisonState.isComparing, comparisonState.baseVersion, comparisonState.compareVersion]);

	// Render version manager section
	const renderVersionManager = () => {
		if (!showVersionManager) return null;

		const positionStyles =
			versionManagerPosition === 'bottom'
				? versionManagerBottomStyles
				: versionManagerSectionStyles;

		return (
			<div style={positionStyles}>
				<VersionManager
					currentNodes={currentTree}
					currentText={currentInputValue}
					onLoadVersion={handleLoadVersion}
					onCompare={handleCompare}
				/>
			</div>
		);
	};

	// If in comparison mode, show the diff viewer
	if (
		comparisonState.isComparing &&
		comparisonState.baseVersion &&
		comparisonState.compareVersion &&
		comparisonResult
	) {
		return (
			<div style={wrapperStyles}>
				<div style={comparisonOverlayStyles}>
					<div style={comparisonHeaderStyles}>
						<h2 style={comparisonTitleStyles}>
							Comparing: {comparisonState.baseVersion.name} →{' '}
							{comparisonState.compareVersion.name}
						</h2>
						<div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
							<div style={viewModeButtonsStyles}>
								<button
									type="button"
									style={
										comparisonState.viewMode === 'side-by-side'
											? activeViewModeButtonStyles
											: buttonStyles
									}
									onClick={() => handleViewModeChange('side-by-side')}>
									Side by Side
								</button>
								<button
									type="button"
									style={
										comparisonState.viewMode === 'unified'
											? activeViewModeButtonStyles
											: buttonStyles
									}
									onClick={() => handleViewModeChange('unified')}>
									Unified
								</button>
								<button
									type="button"
									style={
										comparisonState.viewMode === 'changes-only'
											? activeViewModeButtonStyles
											: buttonStyles
									}
									onClick={() => handleViewModeChange('changes-only')}>
									Changes Only
								</button>
							</div>
							<button
								type="button"
								style={primaryButtonStyles}
								onClick={handleEndComparison}>
								Exit Comparison
							</button>
						</div>
					</div>

					<DiffViewer
						baseVersion={comparisonState.baseVersion}
						compareVersion={comparisonState.compareVersion}
						result={comparisonResult}
						viewMode={comparisonState.viewMode}
						showSummary
						showPropertyChanges
					/>
				</div>
			</div>
		);
	}

	// Normal editor mode
	const editorContent = (
		<SitemapEditor
			{...editorProps}
			initialValue={currentInputValue}
			onTreeChange={handleTreeChange}
			onInputChange={handleInputChange}
		/>
	);

	// Layout based on version manager position
	if (versionManagerPosition === 'bottom') {
		return (
			<div style={wrapperStyles}>
				<div style={editorSectionStyles}>{editorContent}</div>
				{renderVersionManager()}
			</div>
		);
	}

	return (
		<div style={wrapperStyles}>
			<div style={mainContentStyles}>
				{versionManagerPosition === 'left' && renderVersionManager()}
				<div style={editorSectionStyles}>{editorContent}</div>
				{versionManagerPosition === 'right' && renderVersionManager()}
			</div>
		</div>
	);
}

export default SitemapEditorWithComparison;
