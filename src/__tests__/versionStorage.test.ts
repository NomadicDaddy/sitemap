/**
 * Tests for version storage utilities
 */
import type { TreeNode } from '../types/TreeNode';
import {
	clearAllVersions,
	createCurrentVersion,
	deleteVersion,
	getLatestManualSave,
	getLatestVersion,
	getStorageInfo,
	getVersion,
	getVersions,
	saveVersion,
	updateVersion,
} from '../utils/versionStorage';

describe('versionStorage', () => {
	// Helper to create test nodes
	const createNode = (
		id: string,
		label: string,
		depth: number,
		children?: TreeNode[]
	): TreeNode => ({
		children,
		depth,
		id,
		label,
	});

	// Clear storage before each test
	beforeEach(() => {
		localStorage.clear();
	});

	describe('saveVersion', () => {
		it('should save a version to localStorage', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			const saved = saveVersion(nodes, 'Test Version', 'Home');

			expect(saved.id).toBeDefined();
			expect(saved.name).toBe('Test Version');
			expect(saved.nodes).toHaveLength(1);
			expect(saved.sourceText).toBe('Home');
			expect(saved.createdAt).toBeDefined();
		});

		it('should save with description', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			const saved = saveVersion(nodes, 'Test', 'Home', 'My description');

			expect(saved.description).toBe('My description');
		});

		it('should mark auto-saves correctly', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			const saved = saveVersion(nodes, 'Auto', undefined, undefined, true);

			expect(saved.isAutoSave).toBe(true);
		});

		it('should create unique IDs for each version', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			const v1 = saveVersion(nodes, 'Version 1');
			const v2 = saveVersion(nodes, 'Version 2');

			expect(v1.id).not.toBe(v2.id);
		});
	});

	describe('getVersions', () => {
		it('should return empty array when no versions saved', () => {
			const versions = getVersions();

			expect(versions).toEqual([]);
		});

		it('should return all saved versions', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			saveVersion(nodes, 'Version 1');
			saveVersion(nodes, 'Version 2');

			const versions = getVersions();

			expect(versions).toHaveLength(2);
		});

		it('should return versions sorted by date (newest first)', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			saveVersion(nodes, 'Old');
			saveVersion(nodes, 'New');

			const versions = getVersions();

			expect(versions[0].name).toBe('New');
			expect(versions[1].name).toBe('Old');
		});
	});

	describe('getVersion', () => {
		it('should return version by ID', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];
			const saved = saveVersion(nodes, 'Test');

			const retrieved = getVersion(saved.id);

			expect(retrieved).toBeDefined();
			expect(retrieved!.name).toBe('Test');
		});

		it('should return undefined for non-existent ID', () => {
			const result = getVersion('non-existent-id');

			expect(result).toBeUndefined();
		});
	});

	describe('updateVersion', () => {
		it('should update version name', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];
			const saved = saveVersion(nodes, 'Original');

			const updated = updateVersion(saved.id, { name: 'Updated' });

			expect(updated).toBeDefined();
			expect(updated!.name).toBe('Updated');

			const retrieved = getVersion(saved.id);
			expect(retrieved!.name).toBe('Updated');
		});

		it('should update version description', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];
			const saved = saveVersion(nodes, 'Test');

			updateVersion(saved.id, { description: 'New description' });

			const retrieved = getVersion(saved.id);
			expect(retrieved!.description).toBe('New description');
		});

		it('should return undefined for non-existent ID', () => {
			const result = updateVersion('non-existent', { name: 'Test' });

			expect(result).toBeUndefined();
		});
	});

	describe('deleteVersion', () => {
		it('should delete a version', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];
			const saved = saveVersion(nodes, 'Test');

			const deleted = deleteVersion(saved.id);

			expect(deleted).toBe(true);
			expect(getVersion(saved.id)).toBeUndefined();
		});

		it('should return false for non-existent ID', () => {
			const result = deleteVersion('non-existent-id');

			expect(result).toBe(false);
		});

		it('should only delete the specified version', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			const v1 = saveVersion(nodes, 'Version 1');
			const v2 = saveVersion(nodes, 'Version 2');

			deleteVersion(v1.id);

			expect(getVersion(v1.id)).toBeUndefined();
			expect(getVersion(v2.id)).toBeDefined();
		});
	});

	describe('clearAllVersions', () => {
		it('should remove all versions', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			saveVersion(nodes, 'Version 1');
			saveVersion(nodes, 'Version 2');

			clearAllVersions();

			expect(getVersions()).toHaveLength(0);
		});
	});

	describe('getLatestVersion', () => {
		it('should return the most recent version', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			saveVersion(nodes, 'Old');
			saveVersion(nodes, 'New');

			const latest = getLatestVersion();

			expect(latest).toBeDefined();
			expect(latest!.name).toBe('New');
		});

		it('should return undefined when no versions exist', () => {
			expect(getLatestVersion()).toBeUndefined();
		});
	});

	describe('getLatestManualSave', () => {
		it('should return the most recent manual save', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			saveVersion(nodes, 'Manual 1', undefined, undefined, false);
			saveVersion(nodes, 'Auto', undefined, undefined, true);
			saveVersion(nodes, 'Manual 2', undefined, undefined, false);

			const latest = getLatestManualSave();

			expect(latest).toBeDefined();
			expect(latest!.name).toBe('Manual 2');
		});

		it('should skip auto-saves', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			saveVersion(nodes, 'Manual', undefined, undefined, false);
			saveVersion(nodes, 'Auto', undefined, undefined, true);

			const latest = getLatestManualSave();

			expect(latest!.name).toBe('Manual');
		});
	});

	describe('createCurrentVersion', () => {
		it('should create a temporary version object', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			const current = createCurrentVersion(nodes, 'Home');

			expect(current.id).toBe('current');
			expect(current.name).toBe('Current State');
			expect(current.nodes).toHaveLength(1);
			expect(current.sourceText).toBe('Home');
		});

		it('should not persist to storage', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			createCurrentVersion(nodes, 'Home');

			expect(getVersions()).toHaveLength(0);
		});
	});

	describe('getStorageInfo', () => {
		it('should return storage statistics', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			saveVersion(nodes, 'Manual', undefined, undefined, false);
			saveVersion(nodes, 'Auto', undefined, undefined, true);

			const info = getStorageInfo();

			expect(info.versionCount).toBe(2);
			expect(info.manualSaveCount).toBe(1);
			expect(info.autoSaveCount).toBe(1);
			expect(info.estimatedSizeKB).toBeGreaterThanOrEqual(0);
		});

		it('should return zeros when no versions exist', () => {
			const info = getStorageInfo();

			expect(info.versionCount).toBe(0);
			expect(info.manualSaveCount).toBe(0);
			expect(info.autoSaveCount).toBe(0);
		});
	});

	describe('version limits', () => {
		it('should limit auto-saves to maxAutoSaves', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0)];

			// Save more than the default limit
			for (let i = 0; i < 15; i++) {
				saveVersion(nodes, `Auto ${i}`, undefined, undefined, true);
			}

			const versions = getVersions();
			const autoSaves = versions.filter((v) => v.isAutoSave);

			// Default is 10 auto-saves
			expect(autoSaves.length).toBeLessThanOrEqual(10);
		});
	});

	describe('node cloning', () => {
		it('should deep clone nodes on save', () => {
			const nodes: TreeNode[] = [createNode('1', 'Home', 0, [createNode('2', 'About', 1)])];

			const saved = saveVersion(nodes, 'Test');

			// Modify original
			nodes[0].label = 'Modified';

			// Saved version should be unchanged
			const retrieved = getVersion(saved.id);
			expect(retrieved!.nodes[0].label).toBe('Home');
		});
	});
});
