/**
 * ExportButton Component
 *
 * Provides buttons to export tree visualizations as SVG files.
 * Supports both download and copy-to-clipboard functionality.
 */
import React, { useCallback, useState } from 'react';

import { type TreeNode } from '../types/TreeNode';
import {
	type SvgExportOptions,
	type SvgExportResult,
	copySvgToClipboard,
	downloadSvg,
	exportBasicTreeAsSvg,
	exportD3TreeDiagramAsSvg,
} from '../utils/svgExport';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the ExportButton component.
 */
export interface ExportButtonProps {
	/** The type of visualization being exported */
	visualizationType: 'd3-tree' | 'basic-tree';

	/** Reference to the element to export */
	elementRef: React.RefObject<SVGSVGElement | HTMLElement | null>;

	/** The tree nodes being rendered */
	nodes: TreeNode[];

	/** Optional CSS class name */
	className?: string;

	/** Whether to show the copy button (default: true) */
	showCopyButton?: boolean;

	/** Whether to show the download button (default: true) */
	showDownloadButton?: boolean;

	/** Custom export options */
	exportOptions?: SvgExportOptions;

	/** Optional callback when export starts */
	onExportStart?: () => void;

	/** Optional callback when export completes successfully */
	onExportComplete?: (result: SvgExportResult) => void;

	/** Optional callback when export fails */
	onExportError?: (error: Error) => void;

	/** Button size variant (default: 'medium') */
	size?: 'small' | 'medium' | 'large';

	/** Button variant (default: 'primary') */
	variant?: 'primary' | 'secondary' | 'outline';
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets the CSS classes for the button based on variant and size.
 */
function getButtonClasses(variant: string, size: string): string {
	const baseClasses =
		'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

	const variantClasses = {
		outline:
			'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
		primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
		secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
	};

	const sizeClasses = {
		large: 'px-6 py-3 text-base',
		medium: 'px-4 py-2 text-sm',
		small: 'px-3 py-1.5 text-sm',
	};

	return `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]} ${sizeClasses[size as keyof typeof sizeClasses]}`;
}

// ============================================================================
// ExportButton Component
// ============================================================================

/**
 * ExportButton component provides export functionality for tree visualizations.
 *
 * Features:
 * - Export to SVG file download
 * - Copy SVG code to clipboard
 * - Loading states and error handling
 * - Customizable styling and options
 * - Support for both D3 and Basic tree visualizations
 *
 * @example
 * ```tsx
 * // With D3TreeDiagram
 * const svgRef = useRef<SVGSVGElement>(null);
 *
 * <ExportButton
 *   visualizationType="d3-tree"
 *   elementRef={svgRef}
 *   nodes={treeNodes}
 *   onExportComplete={(result) => console.log('Exported:', result.filename)}
 * />
 *
 * // With BasicTree
 * const containerRef = useRef<HTMLElement>(null);
 *
 * <ExportButton
 *   visualizationType="basic-tree"
 *   elementRef={containerRef}
 *   nodes={treeNodes}
 *   exportOptions={{ backgroundColor: '#ffffff' }}
 * />
 * ```
 */
export function ExportButton({
	visualizationType,
	elementRef,
	nodes,
	className = '',
	showCopyButton = true,
	showDownloadButton = true,
	exportOptions,
	onExportStart,
	onExportComplete,
	onExportError,
	size = 'medium',
	variant = 'primary',
}: ExportButtonProps): React.ReactElement {
	const [isExporting, setIsExporting] = useState(false);
	const [exportAction, setExportAction] = useState<'download' | 'copy' | null>(null);

	/**
	 * Performs the export operation.
	 */
	const performExport = useCallback(
		async (action: 'download' | 'copy') => {
			if (!elementRef.current || !nodes || nodes.length === 0) {
				onExportError?.(new Error('No content to export'));
				return;
			}

			setIsExporting(true);
			setExportAction(action);
			onExportStart?.();

			try {
				// Export based on visualization type
				let result: SvgExportResult;

				if (visualizationType === 'd3-tree') {
					result = await exportD3TreeDiagramAsSvg(
						elementRef.current as SVGSVGElement,
						nodes,
						exportOptions
					);
				} else {
					result = await exportBasicTreeAsSvg(
						elementRef.current as HTMLElement,
						nodes,
						exportOptions
					);
				}

				// Perform the requested action
				if (action === 'download') {
					downloadSvg(result);
				} else {
					await copySvgToClipboard(result);
				}

				onExportComplete?.(result);
			} catch (error) {
				const err = error instanceof Error ? error : new Error('Export failed');
				onExportError?.(err);
			} finally {
				setIsExporting(false);
				setExportAction(null);
			}
		},
		[
			elementRef,
			nodes,
			visualizationType,
			exportOptions,
			onExportStart,
			onExportComplete,
			onExportError,
		]
	);

	/**
	 * Handles download button click.
	 */
	const handleDownload = useCallback(() => {
		performExport('download');
	}, [performExport]);

	/**
	 * Handles copy button click.
	 */
	const handleCopy = useCallback(() => {
		performExport('copy');
	}, [performExport]);

	// Don't render if no buttons are shown
	if (!showDownloadButton && !showCopyButton) {
		return <></>;
	}

	// Single button mode
	if (!showDownloadButton || !showCopyButton) {
		const action = showDownloadButton ? 'download' : 'copy';
		const isLoading = isExporting && exportAction === action;

		return (
			<button
				className={`${getButtonClasses(variant, size)} ${className}`.trim()}
				onClick={action === 'download' ? handleDownload : handleCopy}
				disabled={isExporting || !nodes || nodes.length === 0}
				title={action === 'download' ? 'Download as SVG' : 'Copy SVG to clipboard'}>
				{isLoading ? (
					<>
						<svg
							className="mr-2 -ml-1 h-4 w-4 animate-spin"
							fill="none"
							viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Exporting...
					</>
				) : (
					<>
						{action === 'download' ? (
							<svg
								className="mr-2 -ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
						) : (
							<svg
								className="mr-2 -ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
						)}
						{action === 'download' ? 'Download SVG' : 'Copy SVG'}
					</>
				)}
			</button>
		);
	}

	// Two button mode
	return (
		<div className={`flex gap-2 ${className}`.trim()}>
			{/* Download button */}
			<button
				className={getButtonClasses(variant, size)}
				onClick={handleDownload}
				disabled={isExporting || !nodes || nodes.length === 0}
				title="Download as SVG file">
				{isExporting && exportAction === 'download' ? (
					<>
						<svg
							className="mr-2 -ml-1 h-4 w-4 animate-spin"
							fill="none"
							viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Exporting...
					</>
				) : (
					<>
						<svg
							className="mr-2 -ml-1 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						Download
					</>
				)}
			</button>

			{/* Copy button */}
			<button
				className={`${getButtonClasses(variant === 'primary' ? 'secondary' : 'outline', size)}`}
				onClick={handleCopy}
				disabled={isExporting || !nodes || nodes.length === 0}
				title="Copy SVG code to clipboard">
				{isExporting && exportAction === 'copy' ? (
					<>
						<svg
							className="mr-2 -ml-1 h-4 w-4 animate-spin"
							fill="none"
							viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Copying...
					</>
				) : (
					<>
						<svg
							className="mr-2 -ml-1 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						Copy SVG
					</>
				)}
			</button>
		</div>
	);
}

// Default export for convenience
export default ExportButton;
