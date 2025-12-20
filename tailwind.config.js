/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			// Custom breakpoints for responsive design
			screens: {
				xs: '475px',
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px',
			},
			// Custom spacing for grid gaps
			spacing: {
				18: '4.5rem',
				22: '5.5rem',
			},
			// Depth-based color palette matching existing component patterns
			colors: {
				depth: {
					0: {
						bg: '#eff6ff',
						border: '#bfdbfe',
						text: '#1e3a8a',
					},
					1: {
						bg: '#f0fdf4',
						border: '#bbf7d0',
						text: '#14532d',
					},
					2: {
						bg: '#faf5ff',
						border: '#e9d5ff',
						text: '#581c87',
					},
					3: {
						bg: '#fff7ed',
						border: '#fed7aa',
						text: '#7c2d12',
					},
					4: {
						bg: '#fdf2f8',
						border: '#fbcfe8',
						text: '#831843',
					},
				},
			},
		},
	},
	plugins: [],
};
