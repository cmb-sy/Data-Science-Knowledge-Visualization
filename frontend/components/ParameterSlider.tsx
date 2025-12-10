/**
 * パラメータスライダーコンポーネント
 * 分布のパラメータをインタラクティブに調整
 */
"use client";

import type { DistributionParameter } from "@/types/distribution";

interface ParameterSliderProps {
  parameter: DistributionParameter;
  value: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
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

  const handleMouseUp = () => {
    onCommit?.();
  };

  const handleTouchEnd = () => {
    onCommit?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700">
          {parameter.label}
        </label>
        <div className="relative">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            step={parameter.step}
            min={parameter.min_value}
            max={parameter.max_value}
            className="w-20 px-2 py-1 text-sm text-right font-mono font-medium text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50"
          />
        </div>
      </div>

      <div className="relative h-4 flex items-center">
        <input
          type="range"
          min={parameter.min_value}
          max={parameter.max_value}
          step={parameter.step}
          value={value}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleTouchEnd}
          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400 font-mono">
        <span>{parameter.min_value}</span>
        <span>{parameter.max_value}</span>
      </div>
    </div>
  );
}
