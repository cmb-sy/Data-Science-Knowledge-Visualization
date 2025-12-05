/**
 * パラメータスライダーコンポーネント
 * 分布のパラメータをインタラクティブに調整
 */
'use client';

import type { DistributionParameter } from '@/types/distribution';

interface ParameterSliderProps {
  parameter: DistributionParameter;
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void; // 変更確定時（スライダー終了時）に呼びたい場合
}

export default function ParameterSlider({
  parameter,
  value,
  onChange,
  onCommit,
}: ParameterSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };
  const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    if (onCommit) onCommit(parseFloat((e.target as HTMLInputElement).value));
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
    if (onCommit)
      onCommit(parseFloat((e.target as HTMLInputElement).value || "0"));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700">
          {parameter.label}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={parameter.step}
          min={parameter.min_value}
          max={parameter.max_value}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      <input
        type="range"
        min={parameter.min_value}
        max={parameter.max_value}
        step={parameter.step}
        value={value}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{parameter.min_value}</span>
        <span>{parameter.max_value}</span>
      </div>
      
      <p className="text-xs text-gray-600 mt-2">
        {parameter.description}
      </p>
    </div>
  );
}

