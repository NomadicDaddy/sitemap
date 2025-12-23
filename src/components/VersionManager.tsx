/**
 * VersionManager Component
 *
 * A React component for managing sitemap versions. Provides UI for saving,
 * loading, and comparing versions.
 *
 * @example
 * ```tsx
 * <VersionManager
 *   currentNodes={tree}
 *   currentText={inputValue}
 *   onLoadVersion={(version) => setTree(version.nodes)}
 *   onCompare={(base, compare) => startComparison(base, compare)}
 * />
 * ```
 */
import React, { useCallback, useState } from 'react';

import { useTreeComparison } from '../hooks/useTreeComparison';
import type { SitemapVersion, TreeNode } from '../types/TreeNode';
import { createCurrentVersion } from '../utils/versionStorage';

// ============================================================================
// Types
// ============================================================================

export interface VersionManagerProps {
	/** Current tree nodes */
	currentNodes: TreeNode[];
	/** Current source text */
	currentText?: string;
	/** Callback when a version is loaded */
	onLoadVersion?: (version: SitemapVersion) => void;
	/** Callback when comparison is started */
	onCompare?: (base: SitemapVersion, compare: SitemapVersion) => void;
	/** Whether to show in compact mode */
	compact?: boolean;
	/** Custom class name */
	className?: string;
}

// ============================================================================
// Styles
// ============================================================================

const containerStyles: React.CSSProperties = {
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const headerStyles: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'space-between',
	marginBottom: '12px',
};

const titleStyles: React.CSSProperties = {
	color: '#374151',
	fontSize: '14px',
	fontWeight: 600,
	margin: 0,
};

const buttonStyles: React.CSSProperties = {
	backgroundColor: '#3b82f6',
	border: 'none',
	borderRadius: '6px',
	color: '#ffffff',
	cursor: 'pointer',
	fontSize: '13px',
	fontWeight: 500,
	padding: '8px 16px',
	transition: 'background-color 0.15s ease',
};

const secondaryButtonStyles: React.CSSProperties = {
	...buttonStyles,
	backgroundColor: '#f3f4f6',
	border: '1px solid #d1d5db',
	color: '#374151',
};

const smallButtonStyles: React.CSSProperties = {
	...secondaryButtonStyles,
	fontSize: '12px',
	padding: '4px 8px',
};

const versionListStyles: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: '8px',
	maxHeight: '300px',
	overflowY: 'auto',
};

const versionItemStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#f8fafc',
	border: '1px solid #e2e8f0',
	borderRadius: '6px',
	display: 'flex',
	gap: '12px',
	padding: '10px 12px',
	transition: 'border-color 0.15s ease',
};

const versionItemSelectedStyles: React.CSSProperties = {
	...versionItemStyles,
	backgroundColor: '#eff6ff',
	borderColor: '#3b82f6',
};

const versionInfoStyles: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const versionNameStyles: React.CSSProperties = {
	color: '#1f2937',
	fontSize: '14px',
	fontWeight: 500,
	marginBottom: '2px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const versionMetaStyles: React.CSSProperties = {
	color: '#6b7280',
	fontSize: '12px',
};

const versionActionsStyles: React.CSSProperties = {
	display: 'flex',
	flexShrink: 0,
	gap: '6px',
};

const checkboxStyles: React.CSSProperties = {
	cursor: 'pointer',
	height: '18px',
	width: '18px',
};

const emptyStateStyles: React.CSSProperties = {
	backgroundColor: '#f8fafc',
	border: '1px dashed #e2e8f0',
	borderRadius: '6px',
	color: '#94a3b8',
	fontSize: '14px',
	padding: '24px',
	textAlign: 'center',
};

const saveFormStyles: React.CSSProperties = {
	backgroundColor: '#f8fafc',
	border: '1px solid #e2e8f0',
	borderRadius: '8px',
	display: 'flex',
	flexDirection: 'column',
	gap: '12px',
	marginBottom: '16px',
	padding: '16px',
};

const inputStyles: React.CSSProperties = {
	border: '1px solid #d1d5db',
	borderRadius: '6px',
	boxSizing: 'border-box',
	fontSize: '14px',
	padding: '8px 12px',
	width: '100%',
};

const textareaStyles: React.CSSProperties = {
	...inputStyles,
	minHeight: '60px',
	resize: 'vertical',
};

const formActionsStyles: React.CSSProperties = {
	display: 'flex',
	gap: '8px',
	justifyContent: 'flex-end',
};

const compareActionsStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#f0f9ff',
	borderRadius: '6px',
	display: 'flex',
	gap: '8px',
	marginTop: '12px',
	padding: '12px',
};

const badgeStyles: React.CSSProperties = {
	borderRadius: '4px',
	fontSize: '11px',
	fontWeight: 500,
	padding: '2px 6px',
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	// Less than a minute
	if (diff < 60000) {
		return 'Just now';
	}

	// Less than an hour
	if (diff < 3600000) {
		const mins = Math.floor(diff / 60000);
		return `${mins} min${mins > 1 ? 's' : ''} ago`;
	}

	// Less than a day
	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	}

	// Default to date format
	return date.toLocaleDateString(undefined, {
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		month: 'short',
	});
}

function countNodes(nodes: TreeNode[]): number {
	let count = 0;
	const traverse = (list: TreeNode[]) => {
		list.forEach((n) => {
			count++;
			if (n.children) traverse(n.children);
		});
	};
	traverse(nodes);
	return count;
}

// ============================================================================
// Main Component
// ============================================================================

export function VersionManager({
	currentNodes,
	currentText,
	onLoadVersion,
	onCompare,
	className = '',
}: VersionManagerProps): React.ReactElement {
	const { versions, saveNewVersion, deleteSavedVersion } = useTreeComparison();

	const [showSaveForm, setShowSaveForm] = useState(false);
	const [saveName, setSaveName] = useState('');
	const [saveDescription, setSaveDescription] = useState('');
	const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
	const [isCompareMode, setIsCompareMode] = useState(false);

	// Handle saving a new version
	const handleSave = useCallback(() => {
		if (!saveName.trim()) return;

		saveNewVersion(
			currentNodes,
			saveName.trim(),
			currentText,
			saveDescription.trim() || undefined
		);

		setSaveName('');
		setSaveDescription('');
		setShowSaveForm(false);
	}, [currentNodes, currentText, saveName, saveDescription, saveNewVersion]);

	// Handle version selection for comparison
	const handleVersionSelect = useCallback((versionId: string) => {
		setSelectedVersions((prev) => {
			const next = new Set(prev);
			if (next.has(versionId)) {
				next.delete(versionId);
			} else {
				// Limit to 2 selections
				if (next.size >= 2) {
					// Remove the oldest selection
					const firstId = Array.from(next)[0];
					next.delete(firstId);
				}
				next.add(versionId);
			}
			return next;
		});
	}, []);

	// Handle starting comparison
	const handleStartComparison = useCallback(() => {
		const selectedIds = Array.from(selectedVersions);

		if (selectedIds.length === 1) {
			// Compare with current state
			const savedVersion = versions.find((v) => v.id === selectedIds[0]);
			if (savedVersion) {
				const currentVersion = createCurrentVersion(currentNodes, currentText);
				onCompare?.(savedVersion, currentVersion);
			}
		} else if (selectedIds.length === 2) {
			// Compare two saved versions
			const version1 = versions.find((v) => v.id === selectedIds[0]);
			const version2 = versions.find((v) => v.id === selectedIds[1]);
			if (version1 && version2) {
				// Older version as base
				const base =
					new Date(version1.createdAt) < new Date(version2.createdAt)
						? version1
						: version2;
				const compare = base === version1 ? version2 : version1;
				onCompare?.(base, compare);
			}
		}

		setSelectedVersions(new Set());
		setIsCompareMode(false);
	}, [selectedVersions, versions, currentNodes, currentText, onCompare]);

	// Handle comparing with current state
	const handleCompareWithCurrent = useCallback(
		(version: SitemapVersion) => {
			const currentVersion = createCurrentVersion(currentNodes, currentText);
			onCompare?.(version, currentVersion);
		},
		[currentNodes, currentText, onCompare]
	);

	// Handle loading a version
	const handleLoadVersion = useCallback(
		(version: SitemapVersion) => {
			onLoadVersion?.(version);
		},
		[onLoadVersion]
	);

	// Handle deleting a version
	const handleDeleteVersion = useCallback(
		(versionId: string) => {
			if (window.confirm('Are you sure you want to delete this version?')) {
				deleteSavedVersion(versionId);
				setSelectedVersions((prev) => {
					const next = new Set(prev);
					next.delete(versionId);
					return next;
				});
			}
		},
		[deleteSavedVersion]
	);

	return (
		<div className={`version-manager ${className}`.trim()} style={containerStyles}>
			{/* Header */}
			<div style={headerStyles}>
				<h3 style={titleStyles}>Saved Versions ({versions.length})</h3>
				<div style={{ display: 'flex', gap: '8px' }}>
					{!isCompareMode && (
						<button
							type="button"
							style={secondaryButtonStyles}
							onClick={() => setIsCompareMode(true)}
							disabled={versions.length === 0}
							title="Compare versions">
							Compare
						</button>
					)}
					<button
						type="button"
						style={buttonStyles}
						onClick={() => setShowSaveForm(!showSaveForm)}>
						{showSaveForm ? 'Cancel' : 'Save Version'}
					</button>
				</div>
			</div>

			{/* Save Form */}
			{showSaveForm && (
				<div style={saveFormStyles}>
					<input
						type="text"
						placeholder="Version name (e.g., 'Initial draft', 'After review')"
						value={saveName}
						onChange={(e) => setSaveName(e.target.value)}
						style={inputStyles}
						autoFocus
					/>
					<textarea
						placeholder="Description (optional)"
						value={saveDescription}
						onChange={(e) => setSaveDescription(e.target.value)}
						style={textareaStyles}
					/>
					<div style={formActionsStyles}>
						<button
							type="button"
							style={secondaryButtonStyles}
							onClick={() => setShowSaveForm(false)}>
							Cancel
						</button>
						<button
							type="button"
							style={buttonStyles}
							onClick={handleSave}
							disabled={!saveName.trim()}>
							Save
						</button>
					</div>
				</div>
			)}

			{/* Compare Mode Actions */}
			{isCompareMode && (
				<div style={compareActionsStyles}>
					<span style={{ color: '#0369a1', fontSize: '13px' }}>
						{selectedVersions.size === 0
							? 'Select 1-2 versions to compare'
							: selectedVersions.size === 1
								? 'Select another version or compare with current'
								: 'Ready to compare'}
					</span>
					<div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
						<button
							type="button"
							style={secondaryButtonStyles}
							onClick={() => {
								setIsCompareMode(false);
								setSelectedVersions(new Set());
							}}>
							Cancel
						</button>
						<button
							type="button"
							style={buttonStyles}
							onClick={handleStartComparison}
							disabled={selectedVersions.size === 0}>
							{selectedVersions.size === 1 ? 'Compare with Current' : 'Compare'}
						</button>
					</div>
				</div>
			)}

			{/* Version List */}
			{versions.length === 0 ? (
				<div style={emptyStateStyles}>
					<p style={{ margin: '0 0 8px 0' }}>No saved versions yet</p>
					<p style={{ fontSize: '13px', margin: 0 }}>
						Save your sitemap to create checkpoints and enable comparisons
					</p>
				</div>
			) : (
				<div style={versionListStyles}>
					{versions.map((version) => {
						const isSelected = selectedVersions.has(version.id);
						const nodeCount = countNodes(version.nodes);

						return (
							<div
								key={version.id}
								style={isSelected ? versionItemSelectedStyles : versionItemStyles}>
								{isCompareMode && (
									<input
										type="checkbox"
										checked={isSelected}
										onChange={() => handleVersionSelect(version.id)}
										style={checkboxStyles}
									/>
								)}

								<div style={versionInfoStyles}>
									<div style={versionNameStyles}>
										{version.name}
										{version.isAutoSave && (
											<span
												style={{
													...badgeStyles,
													backgroundColor: '#e5e7eb',
													color: '#4b5563',
													marginLeft: '8px',
												}}>
												Auto
											</span>
										)}
									</div>
									<div style={versionMetaStyles}>
										{formatDate(version.createdAt)} • {nodeCount} nodes
										{version.description && ` • ${version.description}`}
									</div>
								</div>

								{!isCompareMode && (
									<div style={versionActionsStyles}>
										<button
											type="button"
											style={smallButtonStyles}
											onClick={() => handleCompareWithCurrent(version)}
											title="Compare with current state">
											Diff
										</button>
										<button
											type="button"
											style={smallButtonStyles}
											onClick={() => handleLoadVersion(version)}
											title="Load this version">
											Load
										</button>
										<button
											type="button"
											style={{
												...smallButtonStyles,
												backgroundColor: '#fee2e2',
												borderColor: '#fecaca',
												color: '#991b1b',
											}}
											onClick={() => handleDeleteVersion(version.id)}
											title="Delete this version">
											Delete
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default VersionManager;
