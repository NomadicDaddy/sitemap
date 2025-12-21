/**
 * HorizontalNavBar Component
 *
 * Renders tree nodes as a horizontal navigation bar similar to website navigation.
 * Top-level nodes appear as primary nav items, with children shown as dropdown menus.
 */
import React, { useState } from 'react';

import { type TreeNode } from '../types/TreeNode';

export interface HorizontalNavBarProps {
	nodes: TreeNode[];
	className?: string;
	onNodeClick?: (node: TreeNode) => void;
}

const navBarStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	borderBottom: '2px solid #e5e7eb',
	display: 'flex',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	gap: '4px',
	padding: '0',
};

const navItemStyles: React.CSSProperties = {
	position: 'relative',
};

const navLinkStyles: React.CSSProperties = {
	alignItems: 'center',
	color: '#374151',
	cursor: 'pointer',
	display: 'flex',
	fontSize: '14px',
	fontWeight: 500,
	gap: '4px',
	padding: '12px 16px',
	textDecoration: 'none',
	transition: 'all 0.2s ease',
	userSelect: 'none',
};

const navLinkHoverStyles: React.CSSProperties = {
	backgroundColor: '#f3f4f6',
	color: '#1f2937',
};

const dropdownStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #e5e7eb',
	borderRadius: '6px',
	boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
	left: '0',
	marginTop: '4px',
	minWidth: '200px',
	opacity: 0,
	padding: '8px 0',
	pointerEvents: 'none',
	position: 'absolute',
	top: '100%',
	transform: 'translateY(-8px)',
	transition: 'all 0.2s ease',
	zIndex: 1000,
};

const dropdownVisibleStyles: React.CSSProperties = {
	opacity: 1,
	pointerEvents: 'auto',
	transform: 'translateY(0)',
};

const dropdownItemStyles: React.CSSProperties = {
	color: '#4b5563',
	cursor: 'pointer',
	display: 'block',
	fontSize: '13px',
	padding: '8px 16px',
	transition: 'all 0.15s ease',
	whiteSpace: 'nowrap',
};

const dropdownItemHoverStyles: React.CSSProperties = {
	backgroundColor: '#f3f4f6',
	color: '#1f2937',
};

const subDropdownStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	border: '1px solid #e5e7eb',
	borderRadius: '6px',
	boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
	display: 'none',
	left: '100%',
	marginLeft: '4px',
	minWidth: '180px',
	padding: '8px 0',
	position: 'absolute',
	top: '0',
	zIndex: 1001,
};

const chevronStyles: React.CSSProperties = {
	fontSize: '10px',
	marginLeft: '4px',
	transition: 'transform 0.2s ease',
};

interface NavItemProps {
	node: TreeNode;
	onNodeClick?: (node: TreeNode) => void;
}

function NavItem({ node, onNodeClick }: NavItemProps): React.ReactElement {
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredLink, setHoveredLink] = useState(false);
	const hasChildren = node.children && node.children.length > 0;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onNodeClick) {
			onNodeClick(node);
		}
	};

	return (
		<div
			style={navItemStyles}
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}>
			<div
				style={{
					...navLinkStyles,
					...(hoveredLink ? navLinkHoverStyles : {}),
				}}
				onClick={handleClick}
				onMouseEnter={() => setHoveredLink(true)}
				onMouseLeave={() => setHoveredLink(false)}>
				{node.label}
				{hasChildren && (
					<span
						style={{
							...chevronStyles,
							transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
						}}>
						▼
					</span>
				)}
			</div>

			{hasChildren && (
				<div
					style={{
						...dropdownStyles,
						...(isOpen ? dropdownVisibleStyles : {}),
					}}>
					{node.children!.map((child) => (
						<DropdownItem key={child.id} node={child} onNodeClick={onNodeClick} />
					))}
				</div>
			)}
		</div>
	);
}

interface DropdownItemProps {
	node: TreeNode;
	onNodeClick?: (node: TreeNode) => void;
}

function DropdownItem({ node, onNodeClick }: DropdownItemProps): React.ReactElement {
	const [isHovered, setIsHovered] = useState(false);
	const [showSubMenu, setShowSubMenu] = useState(false);
	const hasChildren = node.children && node.children.length > 0;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onNodeClick) {
			onNodeClick(node);
		}
	};

	return (
		<div
			style={{ position: 'relative' }}
			onMouseEnter={() => {
				setIsHovered(true);
				if (hasChildren) setShowSubMenu(true);
			}}
			onMouseLeave={() => {
				setIsHovered(false);
				setShowSubMenu(false);
			}}>
			<div
				style={{
					...dropdownItemStyles,
					...(isHovered ? dropdownItemHoverStyles : {}),
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
				onClick={handleClick}>
				<span>{node.label}</span>
				{hasChildren && <span style={{ fontSize: '10px' }}>▶</span>}
			</div>

			{hasChildren && (
				<div
					style={{
						...subDropdownStyles,
						display: showSubMenu ? 'block' : 'none',
					}}>
					{node.children!.map((child) => (
						<DropdownItem key={child.id} node={child} onNodeClick={onNodeClick} />
					))}
				</div>
			)}
		</div>
	);
}

export function HorizontalNavBar({
	nodes,
	className = '',
	onNodeClick,
}: HorizontalNavBarProps): React.ReactElement {
	if (!nodes || nodes.length === 0) {
		return (
			<div
				className={`horizontal-navbar horizontal-navbar--empty ${className}`.trim()}
				style={{
					color: '#6b7280',
					fontStyle: 'italic',
					padding: '16px',
					textAlign: 'center',
				}}>
				No navigation items
			</div>
		);
	}

	return (
		<nav className={`horizontal-navbar ${className}`.trim()} style={navBarStyles}>
			{nodes.map((node) => (
				<NavItem key={node.id} node={node} onNodeClick={onNodeClick} />
			))}
		</nav>
	);
}

export default HorizontalNavBar;
