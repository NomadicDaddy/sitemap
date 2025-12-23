/**
 * Version Storage Utilities
 *
 * Provides functions for saving, loading, and managing sitemap versions
 * using localStorage. Supports version history with automatic cleanup.
 */
import type { SitemapVersion, TreeNode } from '../types/TreeNode';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'sitemap-versions';
const MAX_VERSIONS = 50;
const MAX_AUTO_SAVES = 10;

// ============================================================================
// Types
// ============================================================================

export interface VersionStorageOptions {
	/** Maximum number of versions to keep */
	maxVersions?: number;
	/** Maximum number of auto-saves to keep */
	maxAutoSaves?: number;
	/** Custom storage key prefix */
	storageKeyPrefix?: string;
}

export interface VersionExport {
	/** Export format version */
	formatVersion: string;
	/** Timestamp of export */
	exportedAt: string;
	/** All versions */
	versions: SitemapVersion[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique ID for a version.
 */
function generateVersionId(): string {
	return `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gets the storage key based on options.
 */
function getStorageKey(options?: VersionStorageOptions): string {
	const prefix = options?.storageKeyPrefix ?? '';
	return prefix ? `${prefix}-${STORAGE_KEY}` : STORAGE_KEY;
}

/**
 * Safely parses JSON from localStorage.
 */
function safeParseJSON<T>(json: string | null, defaultValue: T): T {
	if (!json) return defaultValue;
	try {
		return JSON.parse(json) as T;
	} catch {
		console.warn('Failed to parse version storage data');
		return defaultValue;
	}
}

/**
 * Deep clones tree nodes to ensure they're serializable.
 */
function cloneNodes(nodes: TreeNode[]): TreeNode[] {
	return JSON.parse(JSON.stringify(nodes));
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Checks if localStorage is available.
 */
export function isStorageAvailable(): boolean {
	try {
		const testKey = '__storage_test__';
		window.localStorage.setItem(testKey, testKey);
		window.localStorage.removeItem(testKey);
		return true;
	} catch {
		return false;
	}
}

/**
 * Gets all saved versions from localStorage.
 *
 * @param options - Storage options
 * @returns Array of saved versions, sorted by creation date (newest first)
 */
export function getVersions(options?: VersionStorageOptions): SitemapVersion[] {
	if (!isStorageAvailable()) {
		console.warn('localStorage not available');
		return [];
	}

	const key = getStorageKey(options);
	const data = window.localStorage.getItem(key);
	const versions = safeParseJSON<SitemapVersion[]>(data, []);

	// Sort by creation date (newest first)
	return versions.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
}

/**
 * Gets a specific version by ID.
 *
 * @param versionId - ID of the version to retrieve
 * @param options - Storage options
 * @returns The version if found, undefined otherwise
 */
export function getVersion(
	versionId: string,
	options?: VersionStorageOptions
): SitemapVersion | undefined {
	const versions = getVersions(options);
	return versions.find((v) => v.id === versionId);
}

/**
 * Saves a new version to localStorage.
 *
 * @param nodes - Tree nodes to save
 * @param name - Display name for the version
 * @param sourceText - Original text representation
 * @param description - Optional description
 * @param isAutoSave - Whether this is an auto-save
 * @param options - Storage options
 * @returns The saved version
 */
export function saveVersion(
	nodes: TreeNode[],
	name: string,
	sourceText?: string,
	description?: string,
	isAutoSave = false,
	options?: VersionStorageOptions
): SitemapVersion {
	if (!isStorageAvailable()) {
		throw new Error('localStorage not available');
	}

	const version: SitemapVersion = {
		createdAt: new Date().toISOString(),
		description,
		id: generateVersionId(),
		isAutoSave,
		name,
		nodes: cloneNodes(nodes),
		sourceText,
	};

	const versions = getVersions(options);
	versions.unshift(version);

	// Cleanup old versions
	const cleanedVersions = cleanupVersions(versions, options);

	// Save to localStorage
	const key = getStorageKey(options);
	window.localStorage.setItem(key, JSON.stringify(cleanedVersions));

	return version;
}

/**
 * Updates an existing version.
 *
 * @param versionId - ID of the version to update
 * @param updates - Partial updates to apply
 * @param options - Storage options
 * @returns Updated version if found
 */
export function updateVersion(
	versionId: string,
	updates: Partial<Omit<SitemapVersion, 'id' | 'createdAt'>>,
	options?: VersionStorageOptions
): SitemapVersion | undefined {
	if (!isStorageAvailable()) {
		throw new Error('localStorage not available');
	}

	const versions = getVersions(options);
	const index = versions.findIndex((v) => v.id === versionId);

	if (index === -1) {
		return undefined;
	}

	const updated: SitemapVersion = {
		...versions[index],
		...updates,
		nodes: updates.nodes ? cloneNodes(updates.nodes) : versions[index].nodes,
	};

	versions[index] = updated;

	const key = getStorageKey(options);
	window.localStorage.setItem(key, JSON.stringify(versions));

	return updated;
}

/**
 * Deletes a version by ID.
 *
 * @param versionId - ID of the version to delete
 * @param options - Storage options
 * @returns True if version was deleted
 */
export function deleteVersion(versionId: string, options?: VersionStorageOptions): boolean {
	if (!isStorageAvailable()) {
		throw new Error('localStorage not available');
	}

	const versions = getVersions(options);
	const filtered = versions.filter((v) => v.id !== versionId);

	if (filtered.length === versions.length) {
		return false;
	}

	const key = getStorageKey(options);
	window.localStorage.setItem(key, JSON.stringify(filtered));

	return true;
}

/**
 * Deletes all versions.
 *
 * @param options - Storage options
 */
export function clearAllVersions(options?: VersionStorageOptions): void {
	if (!isStorageAvailable()) {
		throw new Error('localStorage not available');
	}

	const key = getStorageKey(options);
	window.localStorage.removeItem(key);
}

/**
 * Cleans up old versions based on limits.
 *
 * @param versions - Array of versions to clean
 * @param options - Storage options
 * @returns Cleaned array of versions
 */
export function cleanupVersions(
	versions: SitemapVersion[],
	options?: VersionStorageOptions
): SitemapVersion[] {
	const maxVersions = options?.maxVersions ?? MAX_VERSIONS;
	const maxAutoSaves = options?.maxAutoSaves ?? MAX_AUTO_SAVES;

	// Separate auto-saves and manual saves
	const autoSaves = versions.filter((v) => v.isAutoSave);
	const manualSaves = versions.filter((v) => !v.isAutoSave);

	// Keep only the most recent auto-saves
	const keptAutoSaves = autoSaves.slice(0, maxAutoSaves);

	// Combine and limit total
	const combined = [...manualSaves, ...keptAutoSaves];
	combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return combined.slice(0, maxVersions);
}

/**
 * Exports all versions as a JSON object.
 *
 * @param options - Storage options
 * @returns Export object containing all versions
 */
export function exportVersions(options?: VersionStorageOptions): VersionExport {
	const versions = getVersions(options);

	return {
		exportedAt: new Date().toISOString(),
		formatVersion: '1.0',
		versions,
	};
}

/**
 * Imports versions from an export object.
 *
 * @param data - Export data to import
 * @param merge - Whether to merge with existing versions (default: false)
 * @param options - Storage options
 * @returns Number of versions imported
 */
export function importVersions(
	data: VersionExport,
	merge = false,
	options?: VersionStorageOptions
): number {
	if (!isStorageAvailable()) {
		throw new Error('localStorage not available');
	}

	if (!data.versions || !Array.isArray(data.versions)) {
		throw new Error('Invalid export data');
	}

	let versions: SitemapVersion[] = [];

	if (merge) {
		const existing = getVersions(options);
		const existingIds = new Set(existing.map((v) => v.id));

		// Add new versions that don't already exist
		const newVersions = data.versions.filter((v) => !existingIds.has(v.id));
		versions = [...existing, ...newVersions];
	} else {
		versions = data.versions;
	}

	// Clean up and save
	const cleaned = cleanupVersions(versions, options);
	const key = getStorageKey(options);
	window.localStorage.setItem(key, JSON.stringify(cleaned));

	return data.versions.length;
}

/**
 * Gets the most recent version.
 *
 * @param options - Storage options
 * @returns Most recent version, or undefined if none exist
 */
export function getLatestVersion(options?: VersionStorageOptions): SitemapVersion | undefined {
	const versions = getVersions(options);
	return versions[0];
}

/**
 * Gets the most recent manual save.
 *
 * @param options - Storage options
 * @returns Most recent manual save, or undefined if none exist
 */
export function getLatestManualSave(options?: VersionStorageOptions): SitemapVersion | undefined {
	const versions = getVersions(options);
	return versions.find((v) => !v.isAutoSave);
}

/**
 * Creates a version from the current state for comparison.
 * Does not persist to storage.
 *
 * @param nodes - Current tree nodes
 * @param sourceText - Current source text
 * @returns Temporary version object
 */
export function createCurrentVersion(nodes: TreeNode[], sourceText?: string): SitemapVersion {
	return {
		createdAt: new Date().toISOString(),
		description: 'Current unsaved state',
		id: 'current',
		isAutoSave: false,
		name: 'Current State',
		nodes: cloneNodes(nodes),
		sourceText,
	};
}

/**
 * Gets storage usage information.
 *
 * @param options - Storage options
 * @returns Storage usage info
 */
export function getStorageInfo(options?: VersionStorageOptions): {
	versionCount: number;
	autoSaveCount: number;
	manualSaveCount: number;
	estimatedSizeKB: number;
} {
	const versions = getVersions(options);
	const key = getStorageKey(options);
	const data = window.localStorage.getItem(key) ?? '';

	const autoSaveCount = versions.filter((v) => v.isAutoSave).length;
	const manualSaveCount = versions.length - autoSaveCount;
	const estimatedSizeKB = Math.round((data.length * 2) / 1024); // UTF-16 encoding

	return {
		autoSaveCount,
		estimatedSizeKB,
		manualSaveCount,
		versionCount: versions.length,
	};
}

export default {
	clearAllVersions,
	createCurrentVersion,
	deleteVersion,
	exportVersions,
	getLatestManualSave,
	getLatestVersion,
	getStorageInfo,
	getVersion,
	getVersions,
	importVersions,
	isStorageAvailable,
	saveVersion,
	updateVersion,
};
