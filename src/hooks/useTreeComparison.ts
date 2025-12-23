/**
 * useTreeComparison Hook
 *
 * A custom React hook for managing tree comparison state and operations.
 * Provides functionality for comparing two sitemap versions side-by-side.
 *
 * @example
 * ```tsx
 * const {
 *   isComparing,
 *   startComparison,
 *   endComparison,
 *   result,
 *   versions
 * } = useTreeComparison();
 *
 * // Start comparing current state with a saved version
 * startComparison(currentNodes, selectedVersion);
 * ```
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
	ComparisonOptions,
	ComparisonResult,
	ComparisonState,
	SitemapVersion,
	TreeNode,
} from '../types/TreeNode';
import { compareTrees, flattenDifferences, getChangedNodes } from '../utils/treeComparison';
import {
	type VersionStorageOptions,
	createCurrentVersion,
	deleteVersion,
	getVersions,
	saveVersion,
} from '../utils/versionStorage';

// ============================================================================
// Types
// ============================================================================

export interface UseTreeComparisonOptions {
	/** Storage options for version persistence */
	storageOptions?: VersionStorageOptions;
	/** Comparison options */
	comparisonOptions?: ComparisonOptions;
	/** Whether to auto-load versions on mount */
	autoLoadVersions?: boolean;
}

export interface UseTreeComparisonResult {
	/** Whether comparison mode is active */
	isComparing: boolean;

	/** Current comparison state */
	state: ComparisonState;

	/** Comparison result (when comparing) */
	result: ComparisonResult | undefined;

	/** All saved versions */
	versions: SitemapVersion[];

	/** Current view mode */
	viewMode: ComparisonState['viewMode'];

	// Actions
	/** Start comparison between two versions */
	startComparison: (base: SitemapVersion, compare: SitemapVersion) => void;

	/** Start comparison between current state and a saved version */
	compareWithCurrent: (
		currentNodes: TreeNode[],
		currentText: string | undefined,
		savedVersion: SitemapVersion
	) => void;

	/** Start comparison between current state and the most recent version */
	compareWithLatest: (currentNodes: TreeNode[], currentText?: string) => void;

	/** End comparison mode */
	endComparison: () => void;

	/** Change the view mode */
	setViewMode: (mode: ComparisonState['viewMode']) => void;

	/** Save a new version */
	saveNewVersion: (
		nodes: TreeNode[],
		name: string,
		sourceText?: string,
		description?: string
	) => SitemapVersion;

	/** Delete a saved version */
	deleteSavedVersion: (versionId: string) => boolean;

	/** Refresh versions list from storage */
	refreshVersions: () => void;

	/** Get flat list of changed nodes */
	getChanges: () => ReturnType<typeof getChangedNodes>;

	/** Get all differences as flat list */
	getAllDifferences: () => ReturnType<typeof flattenDifferences>;

	/** Check if there are unsaved changes between current and latest version */
	hasUnsavedChanges: (currentNodes: TreeNode[]) => boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for managing tree comparison functionality.
 *
 * Provides state management and actions for:
 * - Comparing two sitemap versions
 * - Managing saved versions
 * - Tracking differences and changes
 *
 * @param options - Configuration options
 * @returns Comparison state and actions
 */
export function useTreeComparison(options: UseTreeComparisonOptions = {}): UseTreeComparisonResult {
	const { storageOptions, comparisonOptions, autoLoadVersions = true } = options;

	// State
	const [state, setState] = useState<ComparisonState>({
		isComparing: false,
		viewMode: 'side-by-side',
	});

	const [versions, setVersions] = useState<SitemapVersion[]>([]);

	// Load versions on mount
	useEffect(() => {
		if (autoLoadVersions) {
			setVersions(getVersions(storageOptions));
		}
	}, [autoLoadVersions, storageOptions]);

	// Compute comparison result when versions change
	const result = useMemo(() => {
		if (!state.isComparing || !state.baseVersion || !state.compareVersion) {
			return undefined;
		}

		return compareTrees(state.baseVersion.nodes, state.compareVersion.nodes, comparisonOptions);
	}, [state.isComparing, state.baseVersion, state.compareVersion, comparisonOptions]);

	// Update state with result
	useEffect(() => {
		if (result) {
			setState((prev) => ({ ...prev, result }));
		}
	}, [result]);

	// Actions
	const startComparison = useCallback(
		(base: SitemapVersion, compare: SitemapVersion) => {
			setState({
				baseVersion: base,
				compareVersion: compare,
				isComparing: true,
				viewMode: state.viewMode,
			});
		},
		[state.viewMode]
	);

	const compareWithCurrent = useCallback(
		(
			currentNodes: TreeNode[],
			currentText: string | undefined,
			savedVersion: SitemapVersion
		) => {
			const currentVersion = createCurrentVersion(currentNodes, currentText);

			setState({
				baseVersion: savedVersion,
				compareVersion: currentVersion,
				isComparing: true,
				viewMode: state.viewMode,
			});
		},
		[state.viewMode]
	);

	const compareWithLatest = useCallback(
		(currentNodes: TreeNode[], currentText?: string) => {
			const latestVersion = versions[0];
			if (!latestVersion) {
				console.warn('No saved versions to compare with');
				return;
			}

			const currentVersion = createCurrentVersion(currentNodes, currentText);

			setState({
				baseVersion: latestVersion,
				compareVersion: currentVersion,
				isComparing: true,
				viewMode: state.viewMode,
			});
		},
		[versions, state.viewMode]
	);

	const endComparison = useCallback(() => {
		setState((prev) => ({
			...prev,
			baseVersion: undefined,
			compareVersion: undefined,
			isComparing: false,
			result: undefined,
		}));
	}, []);

	const setViewMode = useCallback((mode: ComparisonState['viewMode']) => {
		setState((prev) => ({ ...prev, viewMode: mode }));
	}, []);

	const saveNewVersion = useCallback(
		(
			nodes: TreeNode[],
			name: string,
			sourceText?: string,
			description?: string
		): SitemapVersion => {
			const version = saveVersion(
				nodes,
				name,
				sourceText,
				description,
				false,
				storageOptions
			);
			setVersions(getVersions(storageOptions));
			return version;
		},
		[storageOptions]
	);

	const deleteSavedVersion = useCallback(
		(versionId: string): boolean => {
			const success = deleteVersion(versionId, storageOptions);
			if (success) {
				setVersions(getVersions(storageOptions));
			}
			return success;
		},
		[storageOptions]
	);

	const refreshVersions = useCallback(() => {
		setVersions(getVersions(storageOptions));
	}, [storageOptions]);

	const getChanges = useCallback(() => {
		if (!result) return [];
		return getChangedNodes(result);
	}, [result]);

	const getAllDifferences = useCallback(() => {
		if (!result) return [];
		return flattenDifferences(result);
	}, [result]);

	const hasUnsavedChanges = useCallback(
		(currentNodes: TreeNode[]): boolean => {
			const latestVersion = versions[0];
			if (!latestVersion) {
				// No saved versions, so any nodes are "unsaved"
				return currentNodes.length > 0;
			}

			const tempResult = compareTrees(latestVersion.nodes, currentNodes, comparisonOptions);

			return (
				tempResult.summary.addedCount > 0 ||
				tempResult.summary.removedCount > 0 ||
				tempResult.summary.modifiedCount > 0
			);
		},
		[versions, comparisonOptions]
	);

	return {
		compareWithCurrent,
		compareWithLatest,

		deleteSavedVersion,

		endComparison,

		getAllDifferences,

		getChanges,

		hasUnsavedChanges,

		isComparing: state.isComparing,

		refreshVersions,

		result,

		saveNewVersion,

		setViewMode,
		// Actions
		startComparison,
		state,
		versions,
		viewMode: state.viewMode,
	};
}

export default useTreeComparison;
