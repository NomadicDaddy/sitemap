import { type NodeMetadata, type TreeNode } from '../types/TreeNode';

function cloneMetadata(metadata?: NodeMetadata): NodeMetadata {
	return metadata
		? { ...metadata, style: metadata.style ? { ...metadata.style } : undefined }
		: {};
}

function shouldUpdate(node: TreeNode, targetIds: Set<string>): boolean {
	return targetIds.has(node.id);
}

function updateTree(
	nodes: TreeNode[],
	targetIds: Set<string>,
	updater: (node: TreeNode) => TreeNode | null
): TreeNode[] {
	return nodes
		.map((node) => {
			const children = node.children
				? updateTree(node.children, targetIds, updater)
				: undefined;
			const candidate: TreeNode = children ? { ...node, children } : node;
			const updated = shouldUpdate(candidate, targetIds) ? updater(candidate) : candidate;
			return updated;
		})
		.filter((node): node is TreeNode => node !== null);
}

export function deleteNodes(nodes: TreeNode[], ids: string[]): TreeNode[] {
	const targets = new Set(ids);
	return updateTree(nodes, targets, () => null);
}

export function changeNodesColor(nodes: TreeNode[], ids: string[], color: string): TreeNode[] {
	const targets = new Set(ids);
	return updateTree(nodes, targets, (node) => {
		const metadata = cloneMetadata(node.metadata);
		metadata.style = { ...metadata.style, backgroundColor: color, borderColor: color };
		return { ...node, metadata };
	});
}

export function addTagToNodes(nodes: TreeNode[], ids: string[], tag: string): TreeNode[] {
	const targets = new Set(ids);
	return updateTree(nodes, targets, (node) => {
		const metadata = cloneMetadata(node.metadata);
		const existingTags = metadata.tags ?? [];
		if (!existingTags.includes(tag)) {
			metadata.tags = [...existingTags, tag];
		} else {
			metadata.tags = existingTags;
		}
		return { ...node, metadata };
	});
}

export function modifyNodeProperties(
	nodes: TreeNode[],
	ids: string[],
	properties: Record<string, unknown>
): TreeNode[] {
	const targets = new Set(ids);
	return updateTree(nodes, targets, (node) => {
		const metadata = cloneMetadata(node.metadata);
		const merged: NodeMetadata = { ...metadata, ...properties };
		return { ...node, metadata: merged };
	});
}
