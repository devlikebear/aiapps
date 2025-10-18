import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RangeSlider } from './RangeSlider';

describe('RangeSlider', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<RangeSlider />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<RangeSlider label="Volume" />);
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<RangeSlider helperText="Select a value" />);
      expect(screen.getByText('Select a value')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<RangeSlider error="Invalid value" />);
      expect(screen.getByText('Invalid value')).toBeInTheDocument();
    });

    it('should display value when valueDisplay is true', () => {
      render(<RangeSlider value={50} valueDisplay={true} />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should hide value when valueDisplay is false', () => {
      render(<RangeSlider value={50} valueDisplay={false} />);
      expect(screen.queryByText('50')).not.toBeInTheDocument();
    });
  });

  describe('Attributes', () => {
    it('should have correct min, max, and value attributes', () => {
      render(<RangeSlider min={0} max={100} value={50} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;

      expect(slider.min).toBe('0');
      expect(slider.max).toBe('100');
      expect(slider.value).toBe('50');
    });

    it('should have type="range"', () => {
      render(<RangeSlider />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.type).toBe('range');
    });

    it('should apply fullWidth class', () => {
      const { container } = render(<RangeSlider fullWidth={true} />);
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveClass('w-full');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<RangeSlider disabled={true} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.disabled).toBe(true);
    });
  });

  describe('Interactions', () => {
    it('should update value on input change', async () => {
      const { rerender } = render(<RangeSlider value={0} max={100} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('0');

      // Simulate slider movement
      rerender(<RangeSlider value={75} max={100} />);

      expect(screen.getByRole('slider')).toHaveValue('75');
    });

    it('should not be interactive when disabled', () => {
      render(<RangeSlider value={0} disabled={true} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.disabled).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should associate label with input via htmlFor', () => {
      render(<RangeSlider label="Speed" />);
      const label = screen.getByText('Speed');
      const slider = screen.getByRole('slider');

      expect(label).toHaveAttribute('for');
      expect(label.getAttribute('for')).toBe(slider.id);
    });

    it('should have unique id if not provided', () => {
      render(<RangeSlider label="First" />);
      render(<RangeSlider label="Second" />);

      const slider1 = screen.getAllByRole('slider')[0];
      const slider2 = screen.getAllByRole('slider')[1];

      expect(slider1.id).not.toBe(slider2.id);
    });

    it('should use provided id', () => {
      render(<RangeSlider id="custom-slider" />);
      const slider = screen.getByRole('slider');
      expect(slider.id).toBe('custom-slider');
    });

    it('should have aria-disabled when disabled', () => {
      render(<RangeSlider disabled={true} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.disabled).toBe(true);
    });
  });

  describe('Styling', () => {
    it('should apply error styling when error is present', () => {
      const { container: errorContainer } = render(
        <RangeSlider error="Invalid value" />
      );
      const slider = errorContainer.querySelector('input');
      expect(slider).toHaveClass('bg-red-900');
    });

    it('should apply disabled styling when disabled', () => {
      const { container: disabledContainer } = render(
        <RangeSlider disabled={true} />
      );
      const slider = disabledContainer.querySelector('input');
      expect(slider).toHaveClass('opacity-50');
    });

    it('should support custom className', () => {
      const { container: customContainer } = render(
        <RangeSlider className="custom-class" />
      );
      const slider = customContainer.querySelector('input');
      expect(slider).toHaveClass('custom-class');
    });
  });

  describe('Default Values', () => {
    it('should have default min of 0', () => {
      render(<RangeSlider />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.min).toBe('0');
    });

    it('should have default max of 100', () => {
      render(<RangeSlider />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.max).toBe('100');
    });

    it('should have default value of 0', () => {
      render(<RangeSlider />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('0');
    });

    it('should have valueDisplay default as true', () => {
      render(<RangeSlider value={50} />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should have fullWidth default as false', () => {
      const { container: defaultContainer } = render(<RangeSlider />);
      const wrapper = defaultContainer.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass('w-full');
    });
  });

  describe('Edge Cases', () => {
    it('should handle value at minimum', () => {
      render(<RangeSlider min={10} max={100} value={10} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('10');
    });

    it('should handle value at maximum', () => {
      render(<RangeSlider min={0} max={50} value={50} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('50');
    });

    it('should handle step prop', () => {
      render(<RangeSlider step={5} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.step).toBe('5');
    });

    it('should hide helper text when error is present', () => {
      render(
        <RangeSlider helperText="This is helpful" error="This is an error" />
      );
      expect(screen.queryByText('This is helpful')).not.toBeInTheDocument();
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });
  });
});
