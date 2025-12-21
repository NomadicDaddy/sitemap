import React from 'react';

import { SitemapEditor } from './components/SitemapEditor';
import { type TreeNode } from './types/TreeNode';
import { generateSitemapText } from './utils/sitemapGenerator';

export function DemoApp(): React.ReactElement {
	const sampleText = generateSitemapText({ breadth: 3, depth: 3 });

	return (
		<div style={{ padding: '20px' }}>
			<h1>UX Sitemap Visualizer Demo</h1>
			<p>
				This demo showcases the enhanced sitemap editor with horizontal/vertical layouts and
				collapsible nodes.
			</p>
			<p>
				<strong>Features:</strong>
			</p>
			<ul>
				<li>Toggle between List, Horizontal, and Vertical preview modes</li>
				<li>Expand/Collapse individual nodes by clicking the arrow buttons</li>
				<li>Use Expand All / Collapse All buttons to control all nodes at once</li>
			</ul>
			<SitemapEditor
				initialValue={sampleText}
				onTreeChange={(tree: TreeNode[], success: boolean) =>
					console.log('Tree changed:', tree, success)
				}
				onInputChange={(value: string) => console.log('Input changed:', value)}
				showStats={true}
			/>
		</div>
	);
}

export default DemoApp;
