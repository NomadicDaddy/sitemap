import React from 'react';

import { SitemapEditor } from './components/SitemapEditor';
import { type TreeNode } from './types/TreeNode';
import { generateSitemapText } from './utils/sitemapGenerator';

export function DemoApp(): React.ReactElement {
	const sampleText = generateSitemapText({ breadth: 3, depth: 3 });

	return (
		<div>
			<h1>UX Sitemap Visualizer Demo</h1>
			<p>This is a demo of the SitemapEditor component.</p>
			<SitemapEditor
				initialValue={sampleText}
				onTreeChange={(tree: TreeNode[], success: boolean) =>
					console.log('Tree changed:', tree, success)
				}
				onInputChange={(value: string) => console.log('Input changed:', value)}
			/>
		</div>
	);
}

export default DemoApp;
