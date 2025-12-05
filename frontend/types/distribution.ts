/**
 * 確率分布関連の型定義
 */

export type DistributionType = "uniform" | "exponential" | "linear_regression";

export type CategoryType =
  | "continuous" // 連続型確率分布
  | "discrete" // 離散確率分布
  | "multivariate" // 多変量分布
  | "ml_regression" // 機械学習: 回帰
  | "ml_classification" // 機械学習: 分類
  | "ml_clustering"; // 機械学習: クラスタリング

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  continuous: "連続型確率分布",
  discrete: "離散確率分布",
  multivariate: "多変量分布",
  ml_regression: "回帰モデル",
  ml_classification: "分類モデル",
  ml_clustering: "クラスタリング",
};

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
  category: CategoryType;
  tags: string[];
  formula_pdf: string;
  formula_cdf?: string;
  parameters: DistributionParameter[];
}

export interface DistributionData {
  x_values: number[];
  pdf_values?: number[];
  cdf_values?: number[];
  y_true?: number[];
  y_observed?: number[];
  y_fitted?: number[];
  // 回帰分析の評価指標
  r_squared?: number;
  slope_estimated?: number;
  intercept_estimated?: number;
  rmse?: number;
  
  mean: number;
  variance: number;
  std_dev: number;
}

export interface CalculateRequest {
  distribution_type: DistributionType;
  parameters: Record<string, number>;
  num_points?: number;
}
