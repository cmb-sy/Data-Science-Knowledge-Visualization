/**
 * 統計量表示コンポーネント
 * 平均、分散、標準偏差などを表示
 */
"use client";

interface StatisticsDisplayProps {
  mean: number;
  variance: number;
  stdDev: number;
  // 回帰分析用
  rSquared?: number;
  slope?: number;
  intercept?: number;
  rmse?: number;
}

export default function StatisticsDisplay({
  mean,
  variance,
  stdDev,
  rSquared,
  slope,
  intercept,
  rmse,
}: StatisticsDisplayProps) {
  const formatNumber = (num: number) => {
    return num.toFixed(4);
  };

  // 基本統計量
  const basicStats = [
    { label: "平均", symbol: "μ", value: mean },
    { label: "分散", symbol: "σ²", value: variance },
    { label: "標準偏差", symbol: "σ", value: stdDev },
  ];

  // 回帰分析用統計量
  const regressionStats =
    rSquared !== undefined
      ? [
          { label: "決定係数", symbol: "R²", value: rSquared },
          { label: "RMSE", symbol: "RMSE", value: rmse ?? 0 },
          { label: "推定傾き", symbol: "â", value: slope ?? 0 },
          { label: "推定切片", symbol: "b̂", value: intercept ?? 0 },
        ]
      : [];

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 mb-4">統計量</h2>
      <div className="space-y-3">
        {/* 基本統計量 */}
        {basicStats.map((stat) => (
          <div
            key={stat.symbol}
            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-sm text-gray-600">
              {stat.label} <span className="font-mono">({stat.symbol})</span>
            </span>
            <span className="text-sm font-mono font-semibold text-gray-900">
              {formatNumber(stat.value)}
            </span>
          </div>
        ))}

        {/* 回帰分析用統計量（存在する場合のみ表示） */}
        {regressionStats.length > 0 && (
          <>
            <div className="pt-2 mt-2 border-t border-gray-200"></div>
            <h3 className="text-xs font-semibold text-gray-500 mb-2">
              モデル評価
            </h3>
            {regressionStats.map((stat) => (
              <div
                key={stat.symbol}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">
                  {stat.label}{" "}
                  <span className="font-mono">({stat.symbol})</span>
                </span>
                <span className="text-sm font-mono font-semibold text-gray-900">
                  {formatNumber(stat.value)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
