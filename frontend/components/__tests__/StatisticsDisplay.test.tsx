import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatisticsDisplay from '../StatisticsDisplay';
import type { DistributionData } from '@/types/distribution';

const baseData: DistributionData = {
  x_values: [1, 2, 3],
  mean: 2.5,
  variance: 1.25,
  std_dev: 1.118,
};

describe('StatisticsDisplay', () => {
  it('renders basic statistics (mean, variance, std dev) for non-ML', () => {
    render(<StatisticsDisplay data={baseData} isMachineLearning={false} />);

    expect(screen.getByText('統計量')).toBeInTheDocument();
    expect(screen.getByText('平均')).toBeInTheDocument();
    expect(screen.getByText('分散')).toBeInTheDocument();
    expect(screen.getByText('標準偏差')).toBeInTheDocument();

    expect(screen.getByText('2.5000')).toBeInTheDocument();
    expect(screen.getByText('1.2500')).toBeInTheDocument();
    expect(screen.getByText('1.1180')).toBeInTheDocument();
  });

  it('renders model evaluation (R², RMSE) for ML data', () => {
    const mlData: DistributionData = {
      ...baseData,
      r_squared: 0.95,
      rmse: 0.3,
      slope_estimated: 1.2,
      intercept_estimated: 0.5,
    };

    render(<StatisticsDisplay data={mlData} isMachineLearning={true} />);

    expect(screen.getByText('モデル評価')).toBeInTheDocument();
    expect(screen.getByText('決定係数')).toBeInTheDocument();
    expect(screen.getByText('0.9500')).toBeInTheDocument();
    expect(screen.getByText('0.3000')).toBeInTheDocument();
    expect(screen.getByText('傾き')).toBeInTheDocument();
    expect(screen.getByText('切片')).toBeInTheDocument();
  });

  it('handles undefined optional values', () => {
    const mlDataPartial: DistributionData = {
      ...baseData,
      r_squared: 0.85,
    };

    render(<StatisticsDisplay data={mlDataPartial} isMachineLearning={true} />);

    expect(screen.getByText('決定係数')).toBeInTheDocument();
    expect(screen.getByText('0.8500')).toBeInTheDocument();
    // RMSE, slope, intercept are undefined so should not render
    expect(screen.queryByText('RMSE')).not.toBeInTheDocument();
    expect(screen.queryByText('傾き')).not.toBeInTheDocument();
    expect(screen.queryByText('切片')).not.toBeInTheDocument();
  });
});
