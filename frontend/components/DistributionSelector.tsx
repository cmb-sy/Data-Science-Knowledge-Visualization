/**
 * 確率分布選択コンポーネント
 * 利用可能な分布の一覧から選択
 */
"use client";

import type { DistributionInfo, DistributionType } from "@/types/distribution";

interface DistributionSelectorProps {
  distributions: DistributionInfo[];
  selectedType: DistributionType;
  onSelect: (type: DistributionType) => void;
}

export default function DistributionSelector({
  distributions,
  selectedType,
  onSelect,
}: DistributionSelectorProps) {
  const selectedDistribution = distributions.find(
    (d) => d.type === selectedType
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100">
      <label
        htmlFor="distribution-select"
        className="block text-sm font-bold text-slate-700 mb-3"
      >
        確率分布・モデルを選択
      </label>

      <div className="relative">
        <select
          id="distribution-select"
          value={selectedType}
          onChange={(e) => onSelect(e.target.value as DistributionType)}
          className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium
                     focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
                     transition-all duration-200 cursor-pointer hover:border-primary-300"
        >
          {distributions.map((dist) => (
            <option key={dist.type} value={dist.type}>
              {dist.name}
            </option>
          ))}
        </select>

        {/* カスタム矢印アイコン */}
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {selectedDistribution && (
        <div className="mt-4 p-4 bg-primary-50/50 rounded-lg border border-primary-100/50">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedDistribution.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
