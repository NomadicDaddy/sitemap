/**
 * Tests for PNG Export Utility
 */
import { jest } from '@jest/globals';

import { type TreeNode } from '../types/TreeNode';
import {
	copyPngToClipboard,
	downloadPng,
	exportBasicTreeAsPng,
	exportD3TreeDiagramAsPng,
} from '../utils/pngExport';
import { exportBasicTreeAsSvg, exportD3TreeDiagramAsSvg } from '../utils/svgExport';

// Mock svgExport to return deterministic SVG content
jest.mock('../utils/svgExport', () => ({
	exportBasicTreeAsSvg: jest.fn(async () => ({
		filename: 'sitemap-visualization-2025-01-01T00-00-00.svg',
		size: 123,
		svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"></svg>',
	})),
	exportD3TreeDiagramAsSvg: jest.fn(async () => ({
		filename: 'sitemap-visualization-2025-01-01T00-00-00.svg',
		size: 123,
		svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"></svg>',
	})),
}));

// Mock DOM APIs
class MockDomParser {
	parseFromString() {
		return {
			querySelector: () => ({
				getAttribute: (attr: string) =>
					attr === 'width' ? '400' : attr === 'height' ? '300' : null,
			}),
		};
	}
}

// @ts-expect-error DOMParser global mock
global.DOMParser = MockDomParser;

Object.defineProperty(global, 'atob', {
	value: jest.fn((data: string) => Buffer.from(data, 'base64').toString('binary')),
	writable: true,
});

Object.defineProperty(global, 'Blob', {
	value: jest.fn((parts: unknown[], opts?: { type?: string }) => ({
		parts,
		size: 512,
		type: opts?.type ?? 'image/png',
	})),
	writable: true,
});

Object.defineProperty(global, 'URL', {
	value: {
		createObjectURL: jest.fn(() => 'blob:url'),
		revokeObjectURL: jest.fn(),
	},
	writable: true,
});

Object.defineProperty(global, 'navigator', {
	value: {
		clipboard: {
			write: jest.fn(() => Promise.resolve()),
			writeText: jest.fn(() => Promise.resolve()),
		},
	},
	writable: true,
});

// Canvas mocks
const mockCanvas = {
	drawImage: jest.fn(),
	fillRect: jest.fn(),
	fillStyle: '',
	getContext: jest.fn(() => ({
		drawImage: jest.fn(),
		fillRect: jest.fn(),
		fillStyle: '',
	})),
	height: 0,
	toDataURL: jest.fn(() => 'data:image/png;base64,aGVsbG8='),
	width: 0,
};

// Mock Image to immediately load
class MockImage {
	onload: (() => void) | null = null;
	onerror: ((err?: unknown) => void) | null = null;
	set src(_: string) {
		// Simulate async load
		setTimeout(() => {
			if (this.onload) this.onload();
		}, 0);
	}
}

// @ts-expect-error Image global mock
global.Image = MockImage;

const realCreateElement = document.createElement.bind(document);

Object.defineProperty(document, 'createElement', {
	value: jest.fn((tag: string) => {
		if (tag === 'canvas') {
			return mockCanvas;
		}
		if (tag === 'textarea') {
			return {
				select: jest.fn(),
				style: {},
				value: '',
			};
		}
		if (tag === 'a') {
			return realCreateElement(tag);
		}
		const el: any = {
			appendChild: jest.fn(),
			children: [],
			classList: { add: jest.fn() },
			click: jest.fn(),
			cloneNode: jest.fn(() => el),
			getBoundingClientRect: jest.fn(() => ({ height: 600, width: 800 })),
			outerHTML: `<${tag}></${tag}>`,
			setAttribute: jest.fn(),
		};
		return el;
	}),
	writable: true,
});

const mockNodes: TreeNode[] = [{ children: [], depth: 0, id: '1', label: 'Home' }];

describe('pngExport', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('exports D3 tree as PNG', async () => {
		const mockSvg = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg'
		) as SVGSVGElement;
		mockSvg.setAttribute('width', '800');
		mockSvg.setAttribute('height', '600');

		const result = await exportD3TreeDiagramAsPng(mockSvg, mockNodes);

		expect(exportD3TreeDiagramAsSvg).toHaveBeenCalled();
		expect(result.filename).toMatch(/\.png$/);
		expect(result.dataUrl).toContain('data:image/png');
	});

	it('exports Basic tree as PNG', async () => {
		const container = document.createElement('div') as HTMLElement;
		const result = await exportBasicTreeAsPng(container, mockNodes, { scale: 2 });

		expect(exportBasicTreeAsSvg).toHaveBeenCalled();
		expect(mockCanvas.width).toBeGreaterThan(0);
		expect(result.dataUrl).toContain('data:image/png');
	});

	it('downloads PNG', () => {
		const mockResult = {
			dataUrl: 'data:image/png;base64,aGVsbG8=',
			filename: 'test.png',
			size: 10,
		};

		downloadPng(mockResult);

		expect(URL.createObjectURL).toHaveBeenCalled();
	});

	it('copies PNG using ClipboardItem when available', async () => {
		// @ts-expect-error mocking global
		global.ClipboardItem = jest.fn((data: Record<string, Blob>) => data);
		const mockResult = {
			dataUrl: 'data:image/png;base64,aGVsbG8=',
			filename: 'test.png',
			size: 10,
		};

		await copyPngToClipboard(mockResult);

		expect(navigator.clipboard.write).toHaveBeenCalled();
	});

	it('falls back to writing data URL text when ClipboardItem is missing', async () => {
		global.ClipboardItem = undefined;
		const mockResult = {
			dataUrl: 'data:image/png;base64,aGVsbG8=',
			filename: 'test.png',
			size: 10,
		};

		await copyPngToClipboard(mockResult);

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockResult.dataUrl);
	});
});
