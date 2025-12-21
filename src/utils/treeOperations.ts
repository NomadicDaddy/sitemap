import { type DropPosition, type NodeMetadata, type TreeNode } from '../types/TreeNode';

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

export function toggleNodeExpanded(nodes: TreeNode[], nodeId: string): TreeNode[] {
	const targets = new Set([nodeId]);
	return updateTree(nodes, targets, (node) => {
		const metadata = cloneMetadata(node.metadata);
		metadata.expanded = metadata.expanded === false ? true : false;
		return { ...node, metadata };
	});
}

export function expandAllNodes(nodes: TreeNode[]): TreeNode[] {
	function expand(nodeList: TreeNode[]): TreeNode[] {
		return nodeList.map((node) => {
			const metadata = cloneMetadata(node.metadata);
			metadata.expanded = true;
			const children = node.children ? expand(node.children) : undefined;
			return { ...node, children, metadata };
		});
	}
	return expand(nodes);
}

export function collapseAllNodes(nodes: TreeNode[]): TreeNode[] {
	function collapse(nodeList: TreeNode[]): TreeNode[] {
		return nodeList.map((node) => {
			const metadata = cloneMetadata(node.metadata);
			metadata.expanded = false;
			const children = node.children ? collapse(node.children) : undefined;
			return { ...node, children, metadata };
		});
	}
	return collapse(nodes);
}

export function filterCollapsedNodes(nodes: TreeNode[]): TreeNode[] {
	return nodes.map((node) => {
		const isExpanded = node.metadata?.expanded !== false;
		if (!node.children || !isExpanded) {
			return { ...node, children: undefined };
		}
		return { ...node, children: filterCollapsedNodes(node.children) };
	});
}

// ============================================================================
// Drag & Drop helpers
// ============================================================================

interface RemoveResult {
	nodes: TreeNode[];
	removed?: TreeNode;
}

function findNodeById(nodes: TreeNode[], id: string): TreeNode | undefined {
	const stack = [...nodes];
	while (stack.length > 0) {
		const current = stack.shift()!;
		if (current.id === id) {
			return current;
		}
		if (current.children) {
			stack.push(...current.children);
		}
	}
	return undefined;
}

function removeNode(nodes: TreeNode[], targetId: string): RemoveResult {
	let removed: TreeNode | undefined;

	const updated = nodes
		.map((node) => {
			if (node.id === targetId) {
				removed = node;
				return null;
			}

			if (node.children) {
				const result = removeNode(node.children, targetId);
				if (result.removed) {
					removed ??= result.removed;
				}
				if (result.nodes !== node.children) {
					return { ...node, children: result.nodes };
				}
			}

			return node;
		})
		.filter((node): node is TreeNode => node !== null);

	return { nodes: updated, removed };
}

function insertNode(
	nodes: TreeNode[],
	targetId: string,
	position: DropPosition,
	nodeToInsert: TreeNode
): { nodes: TreeNode[]; inserted: boolean } {
	const index = nodes.findIndex((candidate) => candidate.id === targetId);
	if (index >= 0) {
		const updated = [...nodes];
		if (position === 'before') {
			updated.splice(index, 0, nodeToInsert);
		} else if (position === 'after') {
			updated.splice(index + 1, 0, nodeToInsert);
		} else {
			const target = updated[index];
			const children = target.children ? [...target.children, nodeToInsert] : [nodeToInsert];
			updated[index] = { ...target, children };
		}
		return { inserted: true, nodes: updated };
	}

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (!node.children) {
			continue;
		}

		const childResult = insertNode(node.children, targetId, position, nodeToInsert);
		if (childResult.inserted) {
			const updatedNode = { ...node, children: childResult.nodes };
			const updated = [...nodes];
			updated[i] = updatedNode;
			return { inserted: true, nodes: updated };
		}
	}

	return { inserted: false, nodes };
}

function normalizeDepths(nodes: TreeNode[], depth = 0): TreeNode[] {
	return nodes.map((node) => {
		const normalizedChildren = node.children
			? normalizeDepths(node.children, depth + 1)
			: undefined;
		return {
			...node,
			children: normalizedChildren,
			depth,
		};
	});
}

export function isDescendant(nodes: TreeNode[], ancestorId: string, descendantId: string): boolean {
	if (ancestorId === descendantId) {
		return false;
	}
	const ancestor = findNodeById(nodes, ancestorId);
	if (!ancestor) {
		return false;
	}

	const stack = [...(ancestor.children ?? [])];
	while (stack.length > 0) {
		const current = stack.shift()!;
		if (current.id === descendantId) {
			return true;
		}
		if (current.children) {
			stack.push(...current.children);
		}
	}

	return false;
}

export function moveNode(
	nodes: TreeNode[],
	payload: { draggedId: string; targetId: string; position: DropPosition }
): TreeNode[] {
	const { draggedId, targetId, position } = payload;
	if (!draggedId || !targetId || draggedId === targetId) {
		return nodes;
	}

	if (isDescendant(nodes, draggedId, targetId)) {
		return nodes;
	}

	const { nodes: withoutDragged, removed } = removeNode(nodes, draggedId);
	if (!removed) {
		return nodes;
	}

	const { nodes: inserted, inserted: didInsert } = insertNode(
		withoutDragged,
		targetId,
		position,
		removed
	);
	return didInsert ? normalizeDepths(inserted) : nodes;
}
