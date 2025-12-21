/**
 * SVG Export Utility
 *
 * Provides functionality to export tree visualizations as SVG files.
 * Supports both D3TreeDiagram (native SVG) and BasicTree (HTML to SVG conversion).
 */
import { type TreeNode } from '../types/TreeNode';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for SVG export.
 */
export interface SvgExportOptions {
	/** Filename for the exported SVG (without extension) */
	filename?: string;

	/** Width of the SVG in pixels (for HTML to SVG conversion) */
	width?: number;

	/** Height of the SVG in pixels (for HTML to SVG conversion) */
	height?: number;

	/** Whether to include styling in the SVG (default: true) */
	includeStyles?: boolean;

	/** Custom CSS class names to include in the SVG */
	customClasses?: string[];

	/** Background color for the SVG (default: '#fafafa' to match D3 diagram) */
	backgroundColor?: string;

	/** Padding around the exported content in pixels (default: 20) */
	padding?: number;
}

/**
 * Result of an SVG export operation.
 */
export interface SvgExportResult {
	/** The SVG content as a string */
	svgContent: string;

	/** The filename that was used */
	filename: string;

	/** The size of the SVG content in bytes */
	size: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FILENAME = 'sitemap-visualization';
const DEFAULT_BACKGROUND_COLOR = '#fafafa';
const DEFAULT_PADDING = 20;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a filename with timestamp for the exported SVG.
 */
function createFilename(baseName: string): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	return `${baseName}-${timestamp}.svg`;
}

/**
 * Gets computed styles for an element and its children.
 */
function getComputedStyles(element: Element, includeStyles: boolean): string {
	if (!includeStyles) return '';

	const styles: string[] = [];
	const computedStyle = getComputedStyle(element);

	// Extract relevant CSS properties
	const relevantProperties = [
		'color',
		'background-color',
		'border-color',
		'border-width',
		'border-style',
		'border-radius',
		'padding',
		'margin',
		'font-family',
		'font-size',
		'font-weight',
		'line-height',
		'text-align',
		'display',
		'position',
		'width',
		'height',
		'opacity',
		'visibility',
		'transform',
		'box-shadow',
	];

	const styleString = relevantProperties
		.map((prop) => `${prop}: ${computedStyle.getPropertyValue(prop)};`)
		.join(' ');

	if (styleString) {
		styles.push(`.svg-exported-element { ${styleString} }`);
	}

	// Recursively get styles for children
	for (const child of element.children) {
		styles.push(getComputedStyles(child, includeStyles));
	}

	return styles.join('\n');
}

/**
 * Converts an HTML element to SVG using foreignObject.
 * This is used for the BasicTree component which renders HTML.
 */
function htmlToSvg(element: HTMLElement, options: Required<SvgExportOptions>): string {
	const rect = element.getBoundingClientRect();
	const width = options.width || Math.ceil(rect.width) + options.padding * 2;
	const height = options.height || Math.ceil(rect.height) + options.padding * 2;

	// Clone the element to avoid modifying the original
	const clone = element.cloneNode(true) as HTMLElement;
	clone.classList.add('svg-exported-element');

	// Get computed styles
	const styles = getComputedStyles(element, options.includeStyles);

	// Create the SVG
	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
	<defs>
		<style type="text/css">
			${styles}
			.svg-exported-element {
				padding: ${options.padding}px;
			}
		</style>
	</defs>
	<rect width="${width}" height="${height}" fill="${options.backgroundColor}"/>
	<foreignObject width="${width}" height="${height}">
		<div xmlns="http://www.w3.org/1999/xhtml">
			${clone.outerHTML}
		</div>
	</foreignObject>
</svg>`;

	return svg.trim();
}

/**
 * Serializes an SVG element to a string.
 * This is used for the D3TreeDiagram component which renders native SVG.
 */
function serializeSvgElement(
	svgElement: SVGSVGElement,
	options: Required<SvgExportOptions>
): string {
	// Clone the SVG to avoid modifying the original
	const clone = svgElement.cloneNode(true) as SVGSVGElement;

	// Ensure the SVG has proper dimensions
	if (!clone.hasAttribute('width')) {
		clone.setAttribute('width', (options.width || 800).toString());
	}
	if (!clone.hasAttribute('height')) {
		clone.setAttribute('height', (options.height || 600).toString());
	}

	// Add background if not present
	if (!clone.querySelector('rect[background]')) {
		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		rect.setAttribute('width', clone.getAttribute('width') || '800');
		rect.setAttribute('height', clone.getAttribute('height') || '600');
		rect.setAttribute('fill', options.backgroundColor);
		clone.insertBefore(rect, clone.firstChild);
	}

	// Add custom classes
	if (options.customClasses.length > 0) {
		clone.classList.add(...options.customClasses);
	}

	// Serialize to string
	const serializer = new XMLSerializer();
	return serializer.serializeToString(clone);
}

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Exports a D3TreeDiagram component as SVG.
 *
 * @param svgRef - Reference to the SVG element in D3TreeDiagram
 * @param nodes - The tree nodes being rendered
 * @param options - Export configuration options
 * @returns Promise that resolves to the export result
 */
export async function exportD3TreeDiagramAsSvg(
	svgRef: SVGSVGElement | null,
	nodes: TreeNode[],
	options: SvgExportOptions = {}
): Promise<SvgExportResult> {
	if (!svgRef) {
		throw new Error('SVG element reference is required');
	}

	if (!nodes || nodes.length === 0) {
		throw new Error('No nodes to export');
	}

	const finalOptions: Required<SvgExportOptions> = {
		backgroundColor: options.backgroundColor || DEFAULT_BACKGROUND_COLOR,
		customClasses: options.customClasses || [],
		filename: options.filename || DEFAULT_FILENAME,
		height: options.height || 600,
		includeStyles: options.includeStyles ?? true,
		padding: options.padding || DEFAULT_PADDING,
		width: options.width || 800,
	};

	// Serialize the SVG
	const svgContent = serializeSvgElement(svgRef, finalOptions);

	// Create result
	const result: SvgExportResult = {
		filename: createFilename(finalOptions.filename),
		size: new Blob([svgContent]).size,
		svgContent,
	};

	return result;
}

/**
 * Exports a BasicTree component as SVG using foreignObject.
 *
 * @param containerRef - Reference to the container element of BasicTree
 * @param nodes - The tree nodes being rendered
 * @param options - Export configuration options
 * @returns Promise that resolves to the export result
 */
export async function exportBasicTreeAsSvg(
	containerRef: HTMLElement | null,
	nodes: TreeNode[],
	options: SvgExportOptions = {}
): Promise<SvgExportResult> {
	if (!containerRef) {
		throw new Error('Container element reference is required');
	}

	if (!nodes || nodes.length === 0) {
		throw new Error('No nodes to export');
	}

	// Get element dimensions
	const rect = containerRef.getBoundingClientRect();

	const finalOptions: Required<SvgExportOptions> = {
		backgroundColor: options.backgroundColor || '#ffffff',
		customClasses: options.customClasses || [],
		filename: options.filename || DEFAULT_FILENAME,
		height: options.height || Math.ceil(rect.height) + DEFAULT_PADDING * 2,
		includeStyles: options.includeStyles ?? true,
		padding: options.padding || DEFAULT_PADDING,
		width: options.width || Math.ceil(rect.width) + DEFAULT_PADDING * 2,
	};

	// Convert HTML to SVG
	const svgContent = htmlToSvg(containerRef, finalOptions);

	// Create result
	const result: SvgExportResult = {
		filename: createFilename(finalOptions.filename),
		size: new Blob([svgContent]).size,
		svgContent,
	};

	return result;
}

/**
 * Downloads an SVG export result as a file.
 *
 * @param result - The export result from exportD3TreeDiagramAsSvg or exportBasicTreeAsSvg
 */
export function downloadSvg(result: SvgExportResult): void {
	const blob = new Blob([result.svgContent], { type: 'image/svg+xml' });
	const url = URL.createObjectURL(blob);

	// Create download link
	const link = document.createElement('a');
	link.href = url;
	link.download = result.filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up
	URL.revokeObjectURL(url);
}

/**
 * Copies an SVG export result to clipboard as SVG code.
 *
 * @param result - The export result from exportD3TreeDiagramAsSvg or exportBasicTreeAsSvg
 * @returns Promise that resolves when the copy is complete
 */
export async function copySvgToClipboard(result: SvgExportResult): Promise<void> {
	try {
		await navigator.clipboard.writeText(result.svgContent);
	} catch {
		// Fallback for older browsers
		const textArea = document.createElement('textarea');
		textArea.value = result.svgContent;
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
	}
}
