/**
 * 統計量表示コンポーネント
 * 平均、分散、標準偏差などを表示
 */
'use client';

interface StatisticsDisplayProps {
  mean: number;
  variance: number;
  stdDev: number;
}

export default function StatisticsDisplay({
  mean,
  variance,
  stdDev,
}: StatisticsDisplayProps) {
  const formatNumber = (num: number) => {
    return num.toFixed(4);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">統計量</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">平均 (μ):</span>
          <span className="text-sm font-mono font-semibold text-primary-600">
            {formatNumber(mean)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">分散 (σ²):</span>
          <span className="text-sm font-mono font-semibold text-primary-600">
            {formatNumber(variance)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">標準偏差 (σ):</span>
          <span className="text-sm font-mono font-semibold text-primary-600">
            {formatNumber(stdDev)}
          </span>
        </div>
      </div>
    </div>
  );
}

