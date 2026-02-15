"use client";

import { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
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
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700">
          {parameter.label}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) {
              const clamped = Math.min(Math.max(v, parameter.min_value), parameter.max_value);
              onChange(clamped);
            }
          }}
          step={parameter.step}
          min={parameter.min_value}
          max={parameter.max_value}
          aria-label={`${parameter.label}の値`}
          className="w-20 px-2 py-1 text-sm text-right font-mono font-medium text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50"
        />
      </div>

      <div className="relative py-1">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          onValueCommit={() => onCommit?.()}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          min={parameter.min_value}
          max={parameter.max_value}
          step={parameter.step}
          aria-label={parameter.label}
        >
          <Slider.Track className="relative grow rounded-full h-[6px] bg-slate-200">
            <Slider.Range className="absolute rounded-full h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-colors" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-primary-500 rounded-full shadow-md hover:shadow-lg hover:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all cursor-grab active:cursor-grabbing active:scale-110">
            {isDragging && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                {value}
              </div>
            )}
          </Slider.Thumb>
        </Slider.Root>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-mono">{parameter.min_value}</span>
        {parameter.description && (
          <span className="text-xs text-slate-400 text-center flex-1 mx-2 truncate">
            {parameter.description}
          </span>
        )}
        <span className="text-xs text-slate-400 font-mono">{parameter.max_value}</span>
      </div>
    </div>
  );
}
