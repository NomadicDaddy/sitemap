import React from 'react';

import { computeNodeThemeStyles, createTheme } from '../theme';
import type { DepthColors as ThemeDepthColors, TreeTheme } from '../theme';
import { type NodeStyleOverrides } from '../types/TreeNode';

export interface DepthColorConfig {
	bg: string;
	border: string;
	text: string;
}

export type DepthColorsInput = Record<number, DepthColorConfig> | ThemeDepthColors | undefined;

export const DEFAULT_DEPTH_COLORS: Record<number, DepthColorConfig> = {
	0: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' }, // Blue
	1: { bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d' }, // Green
	2: { bg: '#faf5ff', border: '#e9d5ff', text: '#581c87' }, // Purple
	3: { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12' }, // Orange
	4: { bg: '#fdf2f8', border: '#fbcfe8', text: '#831843' }, // Pink
};

export const DEFAULT_TREE_NODE_PROPS = {
	fontSize: 14,
	indentSize: 24,
	recursive: true,
	showChildrenCount: true,
	showDepthIndicators: true,
} as const;

export function getDepthColor(depth: number, customColors?: DepthColorsInput): DepthColorConfig {
	const colors = (customColors as Record<number, DepthColorConfig>) ?? DEFAULT_DEPTH_COLORS;
	const colorKeys = Object.keys(colors)
		.map(Number)
		.sort((a, b) => a - b);

	if (colorKeys.length === 0) {
		return DEFAULT_DEPTH_COLORS[0];
	}

	const normalizedDepth = depth % colorKeys.length;
	return colors[colorKeys[normalizedDepth]] ?? DEFAULT_DEPTH_COLORS[0];
}

export function computeNodeStyles(
	depth: number,
	options: {
		depthColors?: DepthColorsInput;
		fontSize?: number;
		indentSize: number;
		isSelected?: boolean;
		showDepthIndicators: boolean;
		styleOverrides?: NodeStyleOverrides;
		theme?: Partial<TreeTheme>;
	}
): React.CSSProperties {
	const {
		depthColors,
		fontSize = DEFAULT_TREE_NODE_PROPS.fontSize,
		indentSize,
		isSelected,
		showDepthIndicators,
		styleOverrides,
		theme,
	} = options;

	if (theme || depthColors) {
		const resolvedTheme = createTheme(theme);
		const mergedDepthColors =
			(depthColors as ThemeDepthColors | undefined) ?? resolvedTheme.depthColors;
		const themedStyles = computeNodeThemeStyles(depth, {
			isSelected,
			showDepthIndicators,
			theme: { ...resolvedTheme, depthColors: mergedDepthColors },
		});

		if (fontSize !== undefined) {
			themedStyles.fontSize = `${fontSize}px`;
		}

		if (styleOverrides?.backgroundColor) {
			themedStyles.backgroundColor = styleOverrides.backgroundColor;
		}
		if (styleOverrides?.textColor) {
			themedStyles.color = styleOverrides.textColor;
		}
		if (styleOverrides?.borderColor) {
			themedStyles.borderColor = styleOverrides.borderColor;
		}

		return themedStyles;
	}

	const depthColor = getDepthColor(depth, depthColors);

	const baseStyles: React.CSSProperties = {
		backgroundColor: showDepthIndicators ? depthColor.bg : undefined,
		borderBottomWidth: showDepthIndicators ? '1px' : undefined,
		borderColor: showDepthIndicators ? depthColor.border : undefined,
		borderLeftWidth: showDepthIndicators ? '1px' : undefined,
		borderRadius: '4px',
		borderRightWidth: showDepthIndicators ? '1px' : undefined,
		borderStyle: showDepthIndicators ? 'solid' : undefined,
		borderTopWidth: showDepthIndicators ? '1px' : undefined,
		color: showDepthIndicators ? depthColor.text : undefined,
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		fontSize: `${fontSize}px`,
		lineHeight: '1.5',
		margin: '2px 0',
		paddingBottom: '8px',
		paddingLeft: `${depth * indentSize + 12}px`,
		paddingRight: '12px',
		paddingTop: '8px',
		transition: 'background-color 0.15s ease, border-color 0.15s ease',
	};

	if (styleOverrides) {
		if (styleOverrides.backgroundColor) {
			baseStyles.backgroundColor = styleOverrides.backgroundColor;
		}
		if (styleOverrides.textColor) {
			baseStyles.color = styleOverrides.textColor;
		}
		if (styleOverrides.borderColor) {
			baseStyles.borderColor = styleOverrides.borderColor;
		}
	}

	if (isSelected) {
		baseStyles.outline = '2px solid #3b82f6';
		baseStyles.outlineOffset = '1px';
	}

	return baseStyles;
}

export function computeBulletStyles(borderColor: string): React.CSSProperties {
	return {
		backgroundColor: borderColor,
		borderRadius: '50%',
		display: 'inline-block',
		flexShrink: 0,
		height: '8px',
		marginRight: '8px',
		width: '8px',
	};
}

export function useTreeNodeSelection(initialSelectedIds: Set<string> = new Set()) {
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(initialSelectedIds);

	const isSelected = React.useCallback(
		(nodeId: string) => selectedIds.has(nodeId),
		[selectedIds]
	);

	const toggleSelection = React.useCallback((nodeId: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(nodeId)) {
				next.delete(nodeId);
			} else {
				next.add(nodeId);
			}
			return next;
		});
	}, []);

	const selectNode = React.useCallback((nodeId: string) => {
		setSelectedIds((prev) => new Set(prev).add(nodeId));
	}, []);

	const deselectNode = React.useCallback((nodeId: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.delete(nodeId);
			return next;
		});
	}, []);

	const clearSelection = React.useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	const selectOnly = React.useCallback((nodeId: string) => {
		setSelectedIds(new Set([nodeId]));
	}, []);

	return {
		clearSelection,
		deselectNode,
		isSelected,
		selectNode,
		selectOnly,
		selectedIds,
		setSelectedIds,
		toggleSelection,
	};
}

export function useTreeNodeExpansion(
	initialExpandedIds: Set<string> = new Set(),
	defaultExpanded: boolean = true
) {
	const [expandedIds, setExpandedIds] = React.useState<Set<string>>(initialExpandedIds);
	const [useDefault, setUseDefault] = React.useState(true);

	const isExpanded = React.useCallback(
		(nodeId: string) => {
			if (useDefault && expandedIds.size === 0) {
				return defaultExpanded;
			}
			return expandedIds.has(nodeId);
		},
		[expandedIds, defaultExpanded, useDefault]
	);

	const toggleExpansion = React.useCallback((nodeId: string) => {
		setUseDefault(false);
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(nodeId)) {
				next.delete(nodeId);
			} else {
				next.add(nodeId);
			}
			return next;
		});
	}, []);

	const expandNode = React.useCallback((nodeId: string) => {
		setUseDefault(false);
		setExpandedIds((prev) => new Set(prev).add(nodeId));
	}, []);

	const collapseNode = React.useCallback((nodeId: string) => {
		setUseDefault(false);
		setExpandedIds((prev) => {
			const next = new Set(prev);
			next.delete(nodeId);
			return next;
		});
	}, []);

	const expandAll = React.useCallback((nodeIds: string[]) => {
		setUseDefault(false);
		setExpandedIds(new Set(nodeIds));
	}, []);

	const collapseAll = React.useCallback(() => {
		setUseDefault(false);
		setExpandedIds(new Set());
	}, []);

	return {
		collapseAll,
		collapseNode,
		expandAll,
		expandNode,
		expandedIds,
		isExpanded,
		setExpandedIds,
		toggleExpansion,
	};
}
