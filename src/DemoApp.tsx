import React from 'react';

import { SitemapEditor } from './components/SitemapEditor';
import { type TreeNode } from './types/TreeNode';
import { generateSitemapText } from './utils/sitemapGenerator';

export function DemoApp(): React.ReactElement {
	const sampleText = generateSitemapText({ breadth: 3, depth: 3 });

	return (
		<div>
			{/* Header */}
			<header
				style={{
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					boxShadow:
						'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
					color: '#ffffff',
					padding: '40px 24px',
					textAlign: 'center',
				}}>
				<h1
					style={{
						fontSize: '2.5rem',
						fontWeight: '700',
						margin: '0 0 16px 0',
						textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
					}}>
					UX Sitemap Visualizer
				</h1>
				<p
					style={{
						fontSize: '1.125rem',
						margin: '0',
						marginLeft: 'auto',
						marginRight: 'auto',
						maxWidth: '600px',
						opacity: 0.95,
					}}>
					Transform your sitemap text into beautiful, interactive visualizations with
					real-time preview
				</p>
			</header>

			{/* Main content */}
			<main
				style={{
					margin: '0 auto',
					maxWidth: '1400px',
					padding: '0 24px 40px',
				}}>
				{/* Sitemap Editor */}
				<SitemapEditor
					initialValue={sampleText}
					onTreeChange={(tree: TreeNode[], success: boolean) =>
						console.log('Tree changed:', tree, success)
					}
					onInputChange={(value: string) => console.log('Input changed:', value)}
					showStats={true}
					showErrors={true}
				/>
			</main>
		</div>
	);
}

export default DemoApp;
