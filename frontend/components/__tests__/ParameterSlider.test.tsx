import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParameterSlider from '../ParameterSlider';
import type { DistributionParameter } from '@/types/distribution';

const mockParameter: DistributionParameter = {
  name: 'mean',
  label: '平均',
  description: '分布の平均値',
  default_value: 0,
  min_value: -10,
  max_value: 10,
  step: 0.1,
};

describe('ParameterSlider', () => {
  it('renders parameter label and value', () => {
    render(
      <ParameterSlider parameter={mockParameter} value={5} onChange={() => {}} />
    );

    expect(screen.getByText('平均')).toBeInTheDocument();
    // The number input should show the value
    const numberInput = screen.getByRole('spinbutton');
    expect(numberInput).toHaveValue(5);
  });

  it('calls onChange when number input value changes', () => {
    const handleChange = vi.fn();
    render(
      <ParameterSlider parameter={mockParameter} value={0} onChange={handleChange} />
    );

    const numberInput = screen.getByRole('spinbutton');
    fireEvent.change(numberInput, { target: { value: '3.5' } });

    expect(handleChange).toHaveBeenCalledWith(3.5);
  });

  it('respects min/max/step from parameter', () => {
    render(
      <ParameterSlider parameter={mockParameter} value={0} onChange={() => {}} />
    );

    // The Radix slider root should have aria-label
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();

    // Number input should have min/max/step attributes
    const numberInput = screen.getByRole('spinbutton');
    expect(numberInput).toHaveAttribute('min', '-10');
    expect(numberInput).toHaveAttribute('max', '10');
    expect(numberInput).toHaveAttribute('step', '0.1');

    // Min/max labels displayed below the slider
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
