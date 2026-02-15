"use client";

import type { DistributionData } from "@/types/distribution";
import { StatsIcon } from "@/components/icons";

interface StatisticsDisplayProps {
  data: DistributionData;
  isMachineLearning: boolean;
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return num.toFixed(4);
}

function R2ProgressBar({ value }: { value: number }) {
  const percentage = Math.max(0, Math.min(100, value * 100));
  const color =
    percentage >= 90
      ? "bg-emerald-500"
      : percentage >= 70
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="mt-1.5">
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-400">0</span>
        <span className="text-[10px] text-slate-400">1</span>
      </div>
    </div>
  );
}

export default function StatisticsDisplay({ data, isMachineLearning }: StatisticsDisplayProps) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <StatsIcon />
        {isMachineLearning ? "モデル評価" : "統計量"}
      </h2>

      {!isMachineLearning ? (
        <div className="space-y-4">
          <StatRow label="平均" symbol="μ" value={data.mean} />
          <StatRow label="分散" symbol="σ²" value={data.variance} />
          <StatRow label="標準偏差" symbol="σ" value={data.std_dev} />
        </div>
      ) : (
        <div className="space-y-3">
          {data.r_squared !== undefined && (
            <div>
              <StatRow label="決定係数" symbol="R²" value={data.r_squared} />
              <R2ProgressBar value={data.r_squared} />
            </div>
          )}
          {data.mae !== undefined && (
            <StatRow label="平均絶対誤差" symbol="MAE" value={data.mae} />
          )}
          {data.mse !== undefined && (
            <StatRow label="平均二乗誤差" symbol="MSE" value={data.mse} />
          )}
          {data.rmse !== undefined && (
            <StatRow label="二乗平均平方根誤差" symbol="RMSE" value={data.rmse} />
          )}
          <div className="border-t border-slate-100 pt-3 mt-3">
            <p className="text-[11px] font-bold text-slate-500 mb-2">推定パラメータ</p>
            {data.slope_estimated !== undefined && (
              <StatRow label="傾き" symbol="â" value={data.slope_estimated} />
            )}
            {data.intercept_estimated !== undefined && (
              <StatRow label="切片" symbol="b̂" value={data.intercept_estimated} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, symbol, value }: { label: string; symbol: string; value: number | undefined }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50">
      <span className="text-sm text-slate-600">
        {label} <span className="font-mono text-slate-400">({symbol})</span>
      </span>
      <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
        {formatNumber(value)}
      </span>
    </div>
  );
}
