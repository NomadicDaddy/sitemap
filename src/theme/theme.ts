import type React from 'react';

export interface DepthColorValue {
	bg: string;
	border: string;
	text: string;
}

export type DepthColors = Record<number, DepthColorValue>;

export interface TypographyScale {
	base: number;
	decrement: number;
	min: number;
}

export interface SpacingScale {
	indentSize: number;
	paddingX: number;
	paddingY: number;
	radius: number;
}

export interface SelectionStyle {
	outline: string;
	outlineOffset: string;
	bg: string;
}

export interface TreeTheme {
	depthColors: DepthColors;
	typography: TypographyScale;
	spacing: SpacingScale;
	selection: SelectionStyle;
}

export const defaultTheme: TreeTheme = {
	depthColors: {
		0: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }, // Page
		1: { bg: '#ffffff', border: '#e5e7eb', text: '#374151' }, // Section
		2: { bg: '#f3f4f6', border: '#d1d5db', text: '#4b5563' }, // Component
		3: { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' }, // Component light
		4: { bg: '#fafafa', border: '#f3f4f6', text: '#9ca3af' }, // Component lighter
	},
	selection: {
		bg: '#dbeafe',
		outline: '2px solid #3b82f6',
		outlineOffset: '1px',
	},
	spacing: {
		indentSize: 24,
		paddingX: 12,
		paddingY: 8,
		radius: 4,
	},
	typography: {
		base: 15,
		decrement: 0.5,
		min: 12,
	},
};

function mergeDepthColors(base: DepthColors, overrides?: DepthColors): DepthColors {
	if (!overrides) return base;

	const merged: DepthColors = { ...base };
	for (const [depth, value] of Object.entries(overrides)) {
		const numericDepth = Number(depth);
		merged[numericDepth] = {
			bg: value.bg ?? base[numericDepth]?.bg ?? defaultTheme.depthColors[0].bg,
			border:
				value.border ?? base[numericDepth]?.border ?? defaultTheme.depthColors[0].border,
			text: value.text ?? base[numericDepth]?.text ?? defaultTheme.depthColors[0].text,
		};
	}

	return merged;
}

export function createTheme(overrides?: Partial<TreeTheme>): TreeTheme {
	if (!overrides) return defaultTheme;

	const mergedDepthColors = mergeDepthColors(defaultTheme.depthColors, overrides.depthColors);

	return {
		depthColors: mergedDepthColors,
		selection: { ...defaultTheme.selection, ...overrides.selection },
		spacing: { ...defaultTheme.spacing, ...overrides.spacing },
		typography: { ...defaultTheme.typography, ...overrides.typography },
	};
}

export function getDepthColor(depth: number, colors?: DepthColors): DepthColorValue {
	const palette = colors ?? defaultTheme.depthColors;
	const keys = Object.keys(palette)
		.map(Number)
		.sort((a, b) => a - b);

	if (keys.length === 0) return defaultTheme.depthColors[0];

	const normalizedDepth = depth % keys.length;
	return palette[keys[normalizedDepth]] ?? defaultTheme.depthColors[0];
}

export function getDepthFontSize(depth: number, typography?: TypographyScale): number {
	const { base, decrement, min } = typography ?? defaultTheme.typography;
	const reduction = Math.min(depth * decrement, base - min);
	return Math.max(base - reduction, min);
}

export function computeNodeThemeStyles(
	depth: number,
	options: {
		theme?: Partial<TreeTheme>;
		showDepthIndicators: boolean;
		isSelected?: boolean;
	}
): React.CSSProperties {
	const { showDepthIndicators, isSelected, theme } = options;
	const resolvedTheme = createTheme(theme);
	const depthColor = getDepthColor(depth, resolvedTheme.depthColors);

	const styles: React.CSSProperties = {
		backgroundColor: showDepthIndicators ? depthColor.bg : undefined,
		borderColor: showDepthIndicators ? depthColor.border : undefined,
		borderRadius: `${resolvedTheme.spacing.radius}px`,
		borderStyle: 'solid',
		borderWidth: showDepthIndicators ? '1px' : '0',
		color: showDepthIndicators ? depthColor.text : undefined,
		fontSize: `${getDepthFontSize(depth, resolvedTheme.typography)}px`,
		fontWeight: depth === 0 ? 600 : depth === 1 ? 500 : 400,
		paddingBottom: `${resolvedTheme.spacing.paddingY}px`,
		paddingLeft: `${depth * resolvedTheme.spacing.indentSize + resolvedTheme.spacing.paddingX}px`,
		paddingRight: `${resolvedTheme.spacing.paddingX}px`,
		paddingTop: `${resolvedTheme.spacing.paddingY}px`,
		transition: 'background-color 0.15s ease, border-color 0.15s ease, outline 0.15s ease',
	};

	if (isSelected) {
		styles.outline = resolvedTheme.selection.outline;
		styles.outlineOffset = resolvedTheme.selection.outlineOffset;
		styles.backgroundColor = resolvedTheme.selection.bg;
	}

	return styles;
}

export function computeBulletThemeStyles(
	depth: number,
	options?: { theme?: Partial<TreeTheme> }
): React.CSSProperties {
	const resolvedTheme = createTheme(options?.theme);
	const depthColor = getDepthColor(depth, resolvedTheme.depthColors);
	return {
		backgroundColor: depthColor.border,
		borderRadius: '50%',
		display: 'inline-block',
		height: '8px',
		marginRight: '8px',
		width: '8px',
	};
}
