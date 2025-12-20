/**
 * InlineEditInput Component Tests
 *
 * Tests for the InlineEditInput and EditButton components
 * used for inline editing of tree node labels.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { EditButton, InlineEditInput } from '../components/InlineEditInput';

// ============================================================================
// InlineEditInput Tests
// ============================================================================

describe('InlineEditInput', () => {
	const defaultProps = {
		onCancel: jest.fn(),
		onChange: jest.fn(),
		onCommit: jest.fn(),
		value: 'Test Value',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('rendering', () => {
		it('should render an input element', () => {
			render(<InlineEditInput {...defaultProps} />);

			const input = screen.getByRole('textbox');
			expect(input).toBeInTheDocument();
		});

		it('should display the initial value', () => {
			render(<InlineEditInput {...defaultProps} value="Initial Value" />);

			const input = screen.getByRole('textbox');
			expect(input).toHaveValue('Initial Value');
		});

		it('should have correct aria-label', () => {
			render(<InlineEditInput {...defaultProps} ariaLabel="Edit node" />);

			const input = screen.getByRole('textbox');
			expect(input).toHaveAttribute('aria-label', 'Edit node');
		});

		it('should apply custom className', () => {
			render(<InlineEditInput {...defaultProps} className="custom-class" />);

			const input = screen.getByRole('textbox');
			expect(input).toHaveClass('custom-class');
		});

		it('should apply custom fontSize', () => {
			render(<InlineEditInput {...defaultProps} fontSize={18} />);

			const input = screen.getByRole('textbox') as HTMLInputElement;
			expect(input.style.fontSize).toBe('18px');
		});
	});

	describe('auto-focus', () => {
		it('should auto-focus on mount', () => {
			render(<InlineEditInput {...defaultProps} />);

			const input = screen.getByRole('textbox');
			expect(document.activeElement).toBe(input);
		});
	});

	describe('onChange', () => {
		it('should call onChange when input value changes', () => {
			const onChange = jest.fn();
			render(<InlineEditInput {...defaultProps} onChange={onChange} />);

			const input = screen.getByRole('textbox');
			fireEvent.change(input, { target: { value: 'New Value' } });

			expect(onChange).toHaveBeenCalledWith('New Value');
		});
	});

	describe('keyboard interactions', () => {
		it('should call onCommit when Enter is pressed', () => {
			const onCommit = jest.fn();
			render(<InlineEditInput {...defaultProps} onCommit={onCommit} />);

			const input = screen.getByRole('textbox');
			fireEvent.keyDown(input, { key: 'Enter' });

			expect(onCommit).toHaveBeenCalledTimes(1);
		});

		it('should call onCancel when Escape is pressed', () => {
			const onCancel = jest.fn();
			render(<InlineEditInput {...defaultProps} onCancel={onCancel} />);

			const input = screen.getByRole('textbox');
			fireEvent.keyDown(input, { key: 'Escape' });

			expect(onCancel).toHaveBeenCalledTimes(1);
		});

		it('should prevent default and stop propagation on Enter', () => {
			render(<InlineEditInput {...defaultProps} />);

			const input = screen.getByRole('textbox');
			const enterEvent = fireEvent.keyDown(input, { key: 'Enter' });

			// fireEvent returns false if preventDefault was called
			expect(enterEvent).toBe(false);
		});

		it('should prevent default and stop propagation on Escape', () => {
			render(<InlineEditInput {...defaultProps} />);

			const input = screen.getByRole('textbox');
			const escapeEvent = fireEvent.keyDown(input, { key: 'Escape' });

			expect(escapeEvent).toBe(false);
		});

		it('should not call handlers for other keys', () => {
			const onCommit = jest.fn();
			const onCancel = jest.fn();
			render(<InlineEditInput {...defaultProps} onCommit={onCommit} onCancel={onCancel} />);

			const input = screen.getByRole('textbox');
			fireEvent.keyDown(input, { key: 'Tab' });
			fireEvent.keyDown(input, { key: 'a' });
			fireEvent.keyDown(input, { key: 'ArrowDown' });

			expect(onCommit).not.toHaveBeenCalled();
			expect(onCancel).not.toHaveBeenCalled();
		});
	});

	describe('blur behavior', () => {
		it('should call onCommit on blur by default', () => {
			const onCommit = jest.fn();
			render(<InlineEditInput {...defaultProps} onCommit={onCommit} />);

			const input = screen.getByRole('textbox');
			fireEvent.blur(input);

			expect(onCommit).toHaveBeenCalledTimes(1);
		});

		it('should not call onCommit on blur when commitOnBlur is false', () => {
			const onCommit = jest.fn();
			render(<InlineEditInput {...defaultProps} onCommit={onCommit} commitOnBlur={false} />);

			const input = screen.getByRole('textbox');
			fireEvent.blur(input);

			expect(onCommit).not.toHaveBeenCalled();
		});
	});

	describe('click propagation', () => {
		it('should stop click propagation', () => {
			const parentClick = jest.fn();
			render(
				<div onClick={parentClick}>
					<InlineEditInput {...defaultProps} />
				</div>
			);

			const input = screen.getByRole('textbox');
			fireEvent.click(input);

			expect(parentClick).not.toHaveBeenCalled();
		});
	});

	describe('styling', () => {
		it('should apply minWidth', () => {
			render(<InlineEditInput {...defaultProps} minWidth={100} />);

			const input = screen.getByRole('textbox') as HTMLInputElement;
			expect(input.style.minWidth).toBe('100px');
		});

		it('should apply maxWidth when provided', () => {
			render(<InlineEditInput {...defaultProps} maxWidth={300} />);

			const input = screen.getByRole('textbox') as HTMLInputElement;
			expect(input.style.maxWidth).toBe('300px');
		});
	});
});

// ============================================================================
// EditButton Tests
// ============================================================================

describe('EditButton', () => {
	const defaultProps = {
		onClick: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('rendering', () => {
		it('should render a button', () => {
			render(<EditButton {...defaultProps} />);

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
		});

		it('should have aria-label', () => {
			render(<EditButton {...defaultProps} ariaLabel="Edit item" />);

			const button = screen.getByRole('button', { name: 'Edit item' });
			expect(button).toBeInTheDocument();
		});

		it('should render SVG icon', () => {
			render(<EditButton {...defaultProps} />);

			const button = screen.getByRole('button');
			const svg = button.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});

		it('should apply custom className', () => {
			render(<EditButton {...defaultProps} className="custom-btn" />);

			const button = screen.getByRole('button');
			expect(button).toHaveClass('custom-btn');
		});
	});

	describe('visibility', () => {
		it('should be visible by default', () => {
			render(<EditButton {...defaultProps} />);

			const button = screen.getByRole('button') as HTMLButtonElement;
			expect(button.style.opacity).toBe('1');
		});

		it('should be visible when visible prop is true', () => {
			render(<EditButton {...defaultProps} visible={true} />);

			const button = screen.getByRole('button') as HTMLButtonElement;
			expect(button.style.opacity).toBe('1');
		});

		it('should be hidden when visible prop is false', () => {
			render(<EditButton {...defaultProps} visible={false} />);

			const button = screen.getByRole('button') as HTMLButtonElement;
			expect(button.style.opacity).toBe('0');
		});

		it('should not be focusable when hidden', () => {
			render(<EditButton {...defaultProps} visible={false} />);

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('tabIndex', '-1');
		});

		it('should be focusable when visible', () => {
			render(<EditButton {...defaultProps} visible={true} />);

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('tabIndex', '0');
		});
	});

	describe('click handling', () => {
		it('should call onClick when clicked', () => {
			const onClick = jest.fn();
			render(<EditButton {...defaultProps} onClick={onClick} />);

			const button = screen.getByRole('button');
			fireEvent.click(button);

			expect(onClick).toHaveBeenCalledTimes(1);
		});

		it('should stop click propagation', () => {
			const parentClick = jest.fn();
			const onClick = jest.fn();
			render(
				<div onClick={parentClick}>
					<EditButton {...defaultProps} onClick={onClick} />
				</div>
			);

			const button = screen.getByRole('button');
			fireEvent.click(button);

			expect(onClick).toHaveBeenCalled();
			expect(parentClick).not.toHaveBeenCalled();
		});

		it('should prevent default on click', () => {
			render(<EditButton {...defaultProps} />);

			const button = screen.getByRole('button');
			const clickEvent = fireEvent.click(button);

			expect(clickEvent).toBe(false);
		});
	});

	describe('keyboard interactions', () => {
		it('should call onClick on Enter key', () => {
			const onClick = jest.fn();
			render(<EditButton {...defaultProps} onClick={onClick} />);

			const button = screen.getByRole('button');
			fireEvent.keyDown(button, { key: 'Enter' });

			expect(onClick).toHaveBeenCalledTimes(1);
		});

		it('should call onClick on Space key', () => {
			const onClick = jest.fn();
			render(<EditButton {...defaultProps} onClick={onClick} />);

			const button = screen.getByRole('button');
			fireEvent.keyDown(button, { key: ' ' });

			expect(onClick).toHaveBeenCalledTimes(1);
		});

		it('should prevent default on Enter/Space', () => {
			render(<EditButton {...defaultProps} />);

			const button = screen.getByRole('button');

			const enterEvent = fireEvent.keyDown(button, { key: 'Enter' });
			expect(enterEvent).toBe(false);

			const spaceEvent = fireEvent.keyDown(button, { key: ' ' });
			expect(spaceEvent).toBe(false);
		});
	});

	describe('size', () => {
		it('should apply custom size', () => {
			render(<EditButton {...defaultProps} size={24} />);

			const button = screen.getByRole('button') as HTMLButtonElement;
			expect(button.style.width).toBe('24px');
			expect(button.style.height).toBe('24px');
		});
	});
});
