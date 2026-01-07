/**
 * HorizontalNavBar Component
 *
 * Renders tree nodes as a horizontal navigation bar similar to website navigation.
 * Top-level nodes appear as primary nav items, with children shown as dropdown menus.
 */
import React, { useEffect, useRef, useState } from 'react';

import { type TreeNode } from '../types/TreeNode';

export interface HorizontalNavBarProps {
	nodes: TreeNode[];
	className?: string;
	onNodeClick?: (node: TreeNode) => void;
}

const navBarStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	borderBottom: '1px solid #e5e7eb',
	boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
	display: 'flex',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	gap: '0',
	padding: '0',
	position: 'relative',
	zIndex: 1000,
};

const navItemStyles: React.CSSProperties = {
	position: 'relative',
};

const navLinkStyles: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'transparent',
	borderBottomColor: 'transparent',
	borderBottomStyle: 'solid',
	borderBottomWidth: '0px',
	borderLeftColor: 'transparent',
	borderLeftStyle: 'solid',
	borderLeftWidth: '3px',
	borderRightColor: 'transparent',
	borderRightStyle: 'solid',
	borderRightWidth: '0px',
	borderTopColor: 'transparent',
	borderTopStyle: 'solid',
	borderTopWidth: '0px',
	color: '#374151',
	cursor: 'pointer',
	display: 'flex',
	fontSize: '14px',
	fontWeight: 500,
	gap: '6px',
	padding: '16px 20px',
	position: 'relative',
	textDecoration: 'none',
	transition: 'all 0.2s ease',
	userSelect: 'none',
};

const navLinkHoverStyles: React.CSSProperties = {
	backgroundColor: '#f9fafb',
	borderLeftColor: '#3b82f6',
	color: '#111827',
};

const dropdownStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	borderBottomColor: '#e5e7eb',
	borderBottomStyle: 'solid',
	borderBottomWidth: '1px',
	borderLeftColor: '#e5e7eb',
	borderLeftStyle: 'solid',
	borderLeftWidth: '1px',
	borderRadius: '8px',
	borderRightColor: '#e5e7eb',
	borderRightStyle: 'solid',
	borderRightWidth: '1px',
	borderTopColor: '#e5e7eb',
	borderTopStyle: 'solid',
	borderTopWidth: '1px',
	boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
	left: '0',
	marginTop: '0',
	minWidth: '220px',
	opacity: 0,
	padding: '8px 0',
	pointerEvents: 'none',
	position: 'absolute',
	top: '100%',
	transform: 'translateY(-10px)',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	zIndex: 1000,
};

const dropdownVisibleStyles: React.CSSProperties = {
	opacity: 1,
	pointerEvents: 'auto',
	transform: 'translateY(0)',
};

const dropdownItemStyles: React.CSSProperties = {
	backgroundColor: 'transparent',
	borderBottomColor: 'transparent',
	borderBottomStyle: 'solid',
	borderBottomWidth: '0px',
	borderLeftColor: 'transparent',
	borderLeftStyle: 'solid',
	borderLeftWidth: '3px',
	borderRightColor: 'transparent',
	borderRightStyle: 'solid',
	borderRightWidth: '0px',
	borderTopColor: 'transparent',
	borderTopStyle: 'solid',
	borderTopWidth: '0px',
	color: '#374151',
	cursor: 'pointer',
	display: 'block',
	fontSize: '14px',
	lineHeight: '1.5',
	padding: '10px 20px',
	transition: 'all 0.15s ease',
	whiteSpace: 'nowrap',
};

const dropdownItemHoverStyles: React.CSSProperties = {
	backgroundColor: '#f3f4f6',
	borderLeftColor: '#3b82f6',
	color: '#111827',
};

const subDropdownStyles: React.CSSProperties = {
	backgroundColor: '#ffffff',
	borderBottomColor: '#e5e7eb',
	borderBottomStyle: 'solid',
	borderBottomWidth: '1px',
	borderLeftColor: '#e5e7eb',
	borderLeftStyle: 'solid',
	borderLeftWidth: '1px',
	borderRadius: '8px',
	borderRightColor: '#e5e7eb',
	borderRightStyle: 'solid',
	borderRightWidth: '1px',
	borderTopColor: '#e5e7eb',
	borderTopStyle: 'solid',
	borderTopWidth: '1px',
	boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
	display: 'none',
	left: '100%',
	marginLeft: '8px',
	minWidth: '200px',
	padding: '8px 0',
	position: 'absolute',
	top: '-8px',
	zIndex: 1001,
};

const chevronStyles: React.CSSProperties = {
	color: '#9ca3af',
	fontSize: '10px',
	marginLeft: '4px',
	transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

interface NavItemProps {
	node: TreeNode;
	onNodeClick?: (node: TreeNode) => void;
}

function NavItem({ node, onNodeClick }: NavItemProps): React.ReactElement {
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredLink, setHoveredLink] = useState(false);
	const hasChildren = node.children && node.children.length > 0;
	const navItemRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (navItemRef.current && !navItemRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onNodeClick) {
			onNodeClick(node);
		}
		if (hasChildren) {
			setIsOpen(!isOpen);
		}
	};

	return (
		<div ref={navItemRef} style={navItemStyles}>
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
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close submenu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowSubMenu(false);
			}
		};

		if (showSubMenu) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showSubMenu]);

	const handleMouseEnter = () => {
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onNodeClick) {
			onNodeClick(node);
		}
		if (hasChildren) {
			setShowSubMenu(!showSubMenu);
		}
	};

	return (
		<div
			ref={dropdownRef}
			style={{ position: 'relative' }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}>
			<div
				style={{
					...dropdownItemStyles,
					...(isHovered ? dropdownItemHoverStyles : {}),
					alignItems: 'center',
					display: 'flex',
					justifyContent: 'space-between',
				}}
				onClick={handleClick}>
				<span>{node.label}</span>
				{hasChildren && <span style={{ color: '#9ca3af', fontSize: '10px' }}>▶</span>}
			</div>

			{hasChildren && (
				<div
					style={{
						...subDropdownStyles,
						display: showSubMenu ? 'block' : 'none',
					}}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}>
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
