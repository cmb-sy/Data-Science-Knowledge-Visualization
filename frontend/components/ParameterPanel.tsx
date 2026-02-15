"use client";

import type { DistributionInfo, DistributionData } from "@/types/distribution";
import { NUM_POINTS_PARAM, DATA_TYPE_LABELS } from "@/lib/constants/formulas";
import { SettingsIcon } from "@/components/icons";
import ParameterSlider from "@/components/ParameterSlider";
import StatisticsDisplay from "@/components/StatisticsDisplay";

interface ParameterPanelProps {
  selectedInfo: DistributionInfo;
  parameters: Record<string, number>;
  numPoints: number;
  isMachineLearning: boolean;
  distributionData: DistributionData | null;
  onParameterChange: (name: string, value: number) => void;
  onNumPointsChange: (value: number) => void;
}

export default function ParameterPanel({
  selectedInfo,
  parameters,
  numPoints,
  isMachineLearning,
  distributionData,
  onParameterChange,
  onNumPointsChange,
}: ParameterPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
      <div className="mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon />
            パラメータ設定
          </h2>
          <button
            onClick={() => {
              const defaults: Record<string, number> = {};
              selectedInfo.parameters.forEach((p) => {
                defaults[p.name] = p.default_value;
              });
              Object.entries(defaults).forEach(([name, value]) => onParameterChange(name, value));
              if (isMachineLearning) onNumPointsChange(100);
            }}
            className="text-xs text-slate-500 hover:text-primary-600 transition-colors px-2 py-1 rounded hover:bg-primary-50"
          >
            リセット
          </button>
        </div>

        <div className="space-y-6">
          {isMachineLearning && (
            <div className="animate-fade-in">
              <ParameterSlider
                parameter={NUM_POINTS_PARAM}
                value={numPoints}
                onChange={onNumPointsChange}
              />
              <div className="border-t border-slate-100 my-4" />
            </div>
          )}

          {selectedInfo.parameters.map((param) => {
            if (param.name === "pattern_id") {
              return (
                <div key={param.name} className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">
                    {param.label}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2].map((value) => (
                      <button
                        key={value}
                        onClick={() => onParameterChange(param.name, value)}
                        className={`
                          px-3 py-1.5 text-sm rounded-md border transition-all
                          ${parameters[param.name] === value
                            ? "bg-primary-600 text-white border-primary-600 shadow-md"
                            : "bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-600"
                          }
                        `}
                      >
                        {DATA_TYPE_LABELS[value]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{param.description}</p>
                </div>
              );
            }

            return (
              <ParameterSlider
                key={param.name}
                parameter={param}
                value={parameters[param.name] || param.default_value}
                onChange={(value) => onParameterChange(param.name, value)}
              />
            );
          })}
        </div>
      </div>

      {distributionData && (
        <StatisticsDisplay data={distributionData} isMachineLearning={isMachineLearning} />
      )}
    </div>
  );
}
