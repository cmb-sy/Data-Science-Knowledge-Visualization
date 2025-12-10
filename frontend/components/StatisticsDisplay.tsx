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
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) {
      return "-";
    }
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
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        統計量
      </h2>
      <div className="space-y-3">
        {/* 基本統計量 */}
        {basicStats.map((stat) => (
          <div
            key={stat.symbol}
            className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
          >
            <span className="text-sm text-slate-600">
              {stat.label}{" "}
              <span className="font-mono text-slate-400">({stat.symbol})</span>
            </span>
            <span className="text-sm font-mono font-medium text-slate-800">
              {formatNumber(stat.value)}
            </span>
          </div>
        ))}

        {/* 回帰分析用統計量（存在する場合のみ表示） */}
        {regressionStats.length > 0 && (
          <>
            <div className="pt-2 mt-2 border-t border-slate-100"></div>
            <h3 className="text-xs font-semibold text-slate-500 mb-2 mt-1">
              モデル評価
            </h3>
            {regressionStats.map((stat) => (
              <div
                key={stat.symbol}
                className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm text-slate-600">
                  {stat.label}{" "}
                  <span className="font-mono text-slate-400">
                    ({stat.symbol})
                  </span>
                </span>
                <span className="text-sm font-mono font-medium text-slate-800">
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
