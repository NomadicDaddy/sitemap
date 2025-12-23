/**
 * Tests for SVG Export Utility
 */
import { jest } from '@jest/globals';

import { type TreeNode } from '../types/TreeNode';
import {
	type SvgExportResult,
	copySvgToClipboard,
	downloadSvg,
	exportBasicTreeAsSvg,
	exportD3TreeDiagramAsSvg,
} from '../utils/svgExport';

// Mock DOM APIs
Object.defineProperty(global, 'navigator', {
	value: {
		clipboard: {
			writeText: jest.fn(() => Promise.resolve()),
		},
	},
	writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
	value: jest.fn(),
	writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
	value: jest.fn(),
	writable: true,
});

Object.defineProperty(document, 'createElement', {
	value: jest.fn((tag: string) => {
		if (tag === 'a') {
			return {
				click: jest.fn(),
				download: '',
				href: '',
				rel: '',
				style: {},
			};
		}
		if (tag === 'textarea') {
			return {
				select: jest.fn(),
				style: {},
				value: '',
			};
		}
		// Return a basic element mock for other tags
		const mockElement = {
			appendChild: jest.fn(),
			children: [],
			classList: {
				add: jest.fn(),
			},
			click: jest.fn(),
			cloneNode: jest.fn(() => ({
				children: [],
				classList: { add: jest.fn() },
				outerHTML: `<${tag}></${tag}>`,
			})),
			getBoundingClientRect: jest.fn(() => ({ height: 600, width: 800 })),
			outerHTML: `<${tag}></${tag}>`,
			setAttribute: jest.fn(),
		};
		return mockElement;
	}),
	writable: true,
});

Object.defineProperty(global, 'URL', {
	value: {
		createObjectURL: jest.fn(() => 'blob:url'),
		revokeObjectURL: jest.fn(),
	},
	writable: true,
});

Object.defineProperty(global, 'Blob', {
	value: jest.fn(() => ({ size: 1024 })),
	writable: true,
});

Object.defineProperty(global, 'XMLSerializer', {
	value: jest.fn().mockImplementation(() => ({
		serializeToString: jest.fn(() => '<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
	})),
	writable: true,
});

Object.defineProperty(global, 'getComputedStyle', {
	value: jest.fn(() => ({
		getPropertyValue: jest.fn(() => 'value'),
	})),
	writable: true,
});

// Mock test data
const mockNodes: TreeNode[] = [
	{
		children: [
			{
				children: [],
				depth: 1,
				id: 'node-2',
				label: 'About',
			},
			{
				children: [],
				depth: 1,
				id: 'node-3',
				label: 'Contact',
			},
		],
		depth: 0,
		id: 'node-1',
		label: 'Home',
	},
];

describe('svgExport', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('exportD3TreeDiagramAsSvg', () => {
		it('should export D3 tree diagram as SVG', async () => {
			// Create mock SVG element
			const mockSvg = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'svg'
			) as SVGSVGElement;
			mockSvg.setAttribute('width', '800');
			mockSvg.setAttribute('height', '600');

			const result = await exportD3TreeDiagramAsSvg(mockSvg, mockNodes);

			expect(result).toHaveProperty('svgContent');
			expect(result).toHaveProperty('filename');
			expect(result).toHaveProperty('size');
			expect(result.filename).toMatch(
				/^sitemap-visualization-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.svg$/
			);
		});

		it('should throw error when SVG element is null', async () => {
			await expect(exportD3TreeDiagramAsSvg(null, mockNodes)).rejects.toThrow(
				'SVG element reference is required'
			);
		});

		it('should throw error when nodes array is empty', async () => {
			const mockSvg = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'svg'
			) as SVGSVGElement;

			await expect(exportD3TreeDiagramAsSvg(mockSvg, [])).rejects.toThrow(
				'No nodes to export'
			);
		});

		it('should use custom filename when provided', async () => {
			const mockSvg = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'svg'
			) as SVGSVGElement;
			const options = { filename: 'custom-sitemap' };

			const result = await exportD3TreeDiagramAsSvg(mockSvg, mockNodes, options);

			expect(result.filename).toMatch(
				/^custom-sitemap-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.svg$/
			);
		});

		it('should use custom dimensions when provided', async () => {
			const mockSvg = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'svg'
			) as SVGSVGElement;
			const options = { height: 800, width: 1200 };

			const originalSerializer = global.XMLSerializer;
			const serializeSpy = jest.fn().mockReturnValue('<svg></svg>');
			global.XMLSerializer = jest.fn().mockImplementation(() => ({
				serializeToString: serializeSpy,
			})) as any;

			await exportD3TreeDiagramAsSvg(mockSvg, mockNodes, options);

			expect(serializeSpy).toHaveBeenCalled();
			global.XMLSerializer = originalSerializer;
		});
	});

	describe('exportBasicTreeAsSvg', () => {
		it('should export basic tree as SVG', async () => {
			// Create mock HTML element
			const mockDiv = document.createElement('div');
			mockDiv.innerHTML = '<div>Tree content</div>';

			// Mock getBoundingClientRect
			Object.defineProperty(mockDiv, 'getBoundingClientRect', {
				value: jest.fn(() => ({ height: 300, width: 400 })),
				writable: true,
			});

			const result = await exportBasicTreeAsSvg(mockDiv, mockNodes);

			expect(result).toHaveProperty('svgContent');
			expect(result).toHaveProperty('filename');
			expect(result).toHaveProperty('size');
			expect(result.svgContent).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
			expect(result.svgContent).toContain('<foreignObject');
		});

		it('should throw error when container element is null', async () => {
			await expect(exportBasicTreeAsSvg(null, mockNodes)).rejects.toThrow(
				'Container element reference is required'
			);
		});

		it('should throw error when nodes array is empty', async () => {
			const mockDiv = document.createElement('div');

			await expect(exportBasicTreeAsSvg(mockDiv, [])).rejects.toThrow('No nodes to export');
		});

		it('should use custom background color when provided', async () => {
			const mockDiv = document.createElement('div');
			Object.defineProperty(mockDiv, 'getBoundingClientRect', {
				value: jest.fn(() => ({ height: 300, width: 400 })),
				writable: true,
			});

			const options = { backgroundColor: '#ffffff' };
			const result = await exportBasicTreeAsSvg(mockDiv, mockNodes, options);

			expect(result.svgContent).toContain('fill="#ffffff"');
		});
	});

	describe('downloadSvg', () => {
		it('should download SVG as file', () => {
			const mockResult: SvgExportResult = {
				filename: 'test.svg',
				size: 1024,
				svgContent: '<svg></svg>',
			};

			downloadSvg(mockResult);

			expect(global.Blob).toHaveBeenCalledWith([mockResult.svgContent], {
				type: 'image/svg+xml',
			});
			expect(global.URL.createObjectURL).toHaveBeenCalled();
			expect(document.body.appendChild).toHaveBeenCalled();
		});
	});

	describe('copySvgToClipboard', () => {
		it('should copy SVG to clipboard', async () => {
			const mockResult: SvgExportResult = {
				filename: 'test.svg',
				size: 1024,
				svgContent: '<svg></svg>',
			};

			await copySvgToClipboard(mockResult);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockResult.svgContent);
		});

		it('should fallback to execCommand when clipboard API fails', async () => {
			// Mock clipboard API failure
			(navigator.clipboard.writeText as jest.Mock).mockImplementationOnce(() =>
				Promise.reject(new Error('Clipboard API not available'))
			);

			// Mock execCommand
			Object.defineProperty(global.document, 'execCommand', {
				value: jest.fn(() => true),
				writable: true,
			});

			const mockTextArea = {
				select: jest.fn(),
				style: {},
				value: '',
			};

			(document.createElement as jest.Mock).mockImplementation((tag: string) => {
				if (tag === 'textarea') return mockTextArea;
				return document.createElement(tag);
			});

			const mockResult: SvgExportResult = {
				filename: 'test.svg',
				size: 1024,
				svgContent: '<svg></svg>',
			};

			await copySvgToClipboard(mockResult);

			expect(mockTextArea.value).toBe(mockResult.svgContent);
			expect(mockTextArea.select).toHaveBeenCalled();
			expect(document.execCommand).toHaveBeenCalledWith('copy');
		});
	});
});
