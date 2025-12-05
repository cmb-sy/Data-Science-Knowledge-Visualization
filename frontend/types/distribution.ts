/**
 * 確率分布関連の型定義
 */

export type DistributionType = "uniform";

export interface DistributionParameter {
  name: string;
  label: string;
  description: string;
  default_value: number;
  min_value: number;
  max_value: number;
  step: number;
}

export interface DistributionInfo {
  type: DistributionType;
  name: string;
  description: string;
  formula_pdf: string;
  formula_cdf?: string;
  parameters: DistributionParameter[];
}

export interface DistributionData {
  x_values: number[];
  pdf_values: number[];
  cdf_values: number[];
  mean: number;
  variance: number;
  std_dev: number;
}

export interface CalculateRequest {
  distribution_type: DistributionType;
  parameters: Record<string, number>;
  num_points?: number;
}

