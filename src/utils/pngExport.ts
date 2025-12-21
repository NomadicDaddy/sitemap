/**
 * PNG Export Utility
 *
 * Renders the existing SVG export output to PNG using the browser's Canvas API.
 * Reuses the SVG export helpers so both D3 (native SVG) and Basic (HTML to SVG)
 * visualizations can be rasterized without extra dependencies.
 */
import { type TreeNode } from '../types/TreeNode';
import {
	type SvgExportOptions,
	type SvgExportResult,
	exportBasicTreeAsSvg,
	exportD3TreeDiagramAsSvg,
} from './svgExport';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for PNG export.
 * Mirrors SvgExportOptions and adds an optional scale factor.
 */
export interface PngExportOptions extends SvgExportOptions {
	/** Multiplier applied to width/height for higher resolution exports */
	scale?: number;
}

/**
 * Result of a PNG export operation.
 */
export interface PngExportResult {
	/** Data URL containing the PNG image */
	dataUrl: string;
	/** The generated filename (with .png extension) */
	filename: string;
	/** Size of the PNG in bytes (best-effort estimate from the Blob) */
	size: number;
}

// ============================================================================
// Helpers
// ============================================================================

function parseSvgDimensions(svgContent: string): { height: number; width: number } {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgContent, 'image/svg+xml');
		const svgEl = doc.querySelector('svg');
		if (!svgEl) {
			return { height: 600, width: 800 };
		}
		const width = Number(svgEl.getAttribute('width')) || 800;
		const height = Number(svgEl.getAttribute('height')) || 600;
		return { height, width };
	} catch {
		return { height: 600, width: 800 };
	}
}

function dataUrlToBlob(dataUrl: string): Blob {
	const [header, data] = dataUrl.split(',');
	const isBase64 = header.includes('base64');
	const byteString = isBase64 ? atob(data) : decodeURIComponent(data);
	const mimeMatch = header.match(/data:(.*?);/);
	const mimeType = mimeMatch?.[1] || 'image/png';
	const buffer = new Uint8Array(byteString.length);
	for (let i = 0; i < byteString.length; i += 1) {
		buffer[i] = byteString.charCodeAt(i);
	}
	return new Blob([buffer], { type: mimeType });
}

function createPngFilename(baseName: string): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	return `${baseName}-${timestamp}.png`;
}

async function svgContentToPngDataUrl(
	svgContent: string,
	options: Required<PngExportOptions>
): Promise<PngExportResult> {
	const { width: parsedWidth, height: parsedHeight } = parseSvgDimensions(svgContent);
	const width = Math.ceil((options.width || parsedWidth) * options.scale);
	const height = Math.ceil((options.height || parsedHeight) * options.scale);

	const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(svgBlob);

	try {
		const image = await new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = (err) => reject(err);
			img.src = url;
		});

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Canvas 2D context is unavailable');
		}

		// Fill background
		ctx.fillStyle = options.backgroundColor || '#ffffff';
		ctx.fillRect(0, 0, width, height);

		// Draw SVG
		ctx.drawImage(image, 0, 0, width, height);

		const dataUrl = canvas.toDataURL('image/png');
		const blob = dataUrlToBlob(dataUrl);

		return {
			dataUrl,
			filename: createPngFilename(options.filename || 'sitemap-visualization'),
			size: blob.size,
		};
	} finally {
		URL.revokeObjectURL(url);
	}
}

// ============================================================================
// Main Export Functions
// ============================================================================

export async function exportD3TreeDiagramAsPng(
	svgRef: SVGSVGElement | null,
	nodes: TreeNode[],
	options: PngExportOptions = {}
): Promise<PngExportResult> {
	if (!svgRef) {
		throw new Error('SVG element reference is required');
	}

	if (!nodes || nodes.length === 0) {
		throw new Error('No nodes to export');
	}

	const svgResult = await exportD3TreeDiagramAsSvg(svgRef, nodes, options);

	const finalOptions: Required<PngExportOptions> = {
		backgroundColor: options.backgroundColor || '#ffffff',
		customClasses: options.customClasses || [],
		filename: options.filename || svgResult.filename.replace(/\.svg$/, ''),
		height: options.height || parseSvgDimensions(svgResult.svgContent).height,
		includeStyles: options.includeStyles ?? true,
		padding: options.padding ?? 20,
		scale: options.scale ?? 1,
		width: options.width || parseSvgDimensions(svgResult.svgContent).width,
	};

	return svgContentToPngDataUrl(svgResult.svgContent, finalOptions);
}

export async function exportBasicTreeAsPng(
	containerRef: HTMLElement | null,
	nodes: TreeNode[],
	options: PngExportOptions = {}
): Promise<PngExportResult> {
	if (!containerRef) {
		throw new Error('Container element reference is required');
	}

	if (!nodes || nodes.length === 0) {
		throw new Error('No nodes to export');
	}

	const svgResult: SvgExportResult = await exportBasicTreeAsSvg(containerRef, nodes, options);

	const finalOptions: Required<PngExportOptions> = {
		backgroundColor: options.backgroundColor || '#ffffff',
		customClasses: options.customClasses || [],
		filename: options.filename || svgResult.filename.replace(/\.svg$/, ''),
		height: options.height || parseSvgDimensions(svgResult.svgContent).height,
		includeStyles: options.includeStyles ?? true,
		padding: options.padding ?? 20,
		scale: options.scale ?? 1,
		width: options.width || parseSvgDimensions(svgResult.svgContent).width,
	};

	return svgContentToPngDataUrl(svgResult.svgContent, finalOptions);
}

// ============================================================================
// Convenience helpers
// ============================================================================

export function downloadPng(result: PngExportResult): void {
	const blob = dataUrlToBlob(result.dataUrl);
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = result.filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export async function copyPngToClipboard(result: PngExportResult): Promise<void> {
	try {
		const blob = dataUrlToBlob(result.dataUrl);
		const ClipboardCtor = (
			globalThis as typeof globalThis & { ClipboardItem?: typeof ClipboardItem }
		).ClipboardItem;
		if (ClipboardCtor) {
			const item = new ClipboardCtor({ 'image/png': blob });
			await navigator.clipboard.write([item]);
			return;
		}
		throw new Error('ClipboardItem not available');
	} catch {
		// Fallback: copy Data URL as text
		try {
			await navigator.clipboard.writeText(result.dataUrl);
		} catch {
			// Fallback to execCommand if available
			const textArea = document.createElement('textarea');
			textArea.value = result.dataUrl;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
	}
}
