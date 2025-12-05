/**
 * 確率分布選択コンポーネント
 * 利用可能な分布の一覧から選択
 */
'use client';

import type { DistributionInfo, DistributionType } from '@/types/distribution';

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
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        確率分布を選択
      </h3>
      
      <select
        value={selectedType}
        onChange={(e) => onSelect(e.target.value as DistributionType)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {distributions.map((dist) => (
          <option key={dist.type} value={dist.type}>
            {dist.name}
          </option>
        ))}
      </select>
      
      {distributions
        .filter((dist) => dist.type === selectedType)
        .map((dist) => (
          <div key={dist.type} className="mt-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              {dist.description}
            </p>
          </div>
        ))}
    </div>
  );
}

