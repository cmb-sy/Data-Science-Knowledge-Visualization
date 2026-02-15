"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DistributionInfo, DistributionType } from "@/types/distribution";
import FormulaDisplay from "@/components/FormulaDisplay";
import { ChartIcon, FunctionIcon, AverageIcon, VarianceIcon, MomentIcon } from "@/components/icons";
import {
  MOMENT_GENERATING_FUNCTIONS,
  MEAN_FORMULAS,
  VARIANCE_FORMULAS,
  PDF_DESCRIPTIONS,
  CDF_DESCRIPTIONS,
  ML_COST_FUNCTION,
  ML_NORMAL_EQUATION,
  ML_GRADIENT_UPDATE,
} from "@/lib/constants/formulas";

interface FormulaSectionProps {
  selectedInfo: DistributionInfo;
  distType: DistributionType;
  isMachineLearning: boolean;
}

interface AccordionCardProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  description?: string;
  children: React.ReactNode;
}

function AccordionCard({ title, icon, defaultOpen = false, description, children }: AccordionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold text-slate-700">{title}</span>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-slate-400 flex-shrink-0"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              {description && description !== "-" && (
                <div className="mb-4 bg-primary-50/50 p-3 rounded-lg border border-primary-100/50">
                  <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FormulaSection({ selectedInfo, distType, isMachineLearning }: FormulaSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            {selectedInfo.name}について
          </h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px]">
            {selectedInfo.description}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {isMachineLearning ? "モデル数式" : "数式・特性"}
          </h2>

          {!isMachineLearning ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedInfo.formula_pdf && (
                  <AccordionCard
                    title="確率密度関数 (PDF)"
                    icon={<ChartIcon />}
                    defaultOpen={true}
                    description={PDF_DESCRIPTIONS[distType]}
                  >
                    <FormulaDisplay formula={selectedInfo.formula_pdf} label="" displayMode={true} />
                  </AccordionCard>
                )}
                {selectedInfo.formula_cdf && (
                  <AccordionCard
                    title="累積分布関数 (CDF)"
                    icon={<FunctionIcon />}
                    description={CDF_DESCRIPTIONS[distType]}
                  >
                    <FormulaDisplay formula={selectedInfo.formula_cdf} label="" displayMode={true} />
                  </AccordionCard>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MEAN_FORMULAS[distType] !== "-" && (
                  <AccordionCard title="平均 (μ)" icon={<AverageIcon />}>
                    <FormulaDisplay formula={MEAN_FORMULAS[distType]} label="" displayMode={true} />
                  </AccordionCard>
                )}
                {VARIANCE_FORMULAS[distType] !== "-" && (
                  <AccordionCard title="分散 (σ²)" icon={<VarianceIcon />}>
                    <FormulaDisplay formula={VARIANCE_FORMULAS[distType]} label="" displayMode={true} />
                  </AccordionCard>
                )}
                {MOMENT_GENERATING_FUNCTIONS[distType] !== "-" && (
                  <AccordionCard title="モーメント母関数" icon={<MomentIcon />}>
                    <FormulaDisplay formula={MOMENT_GENERATING_FUNCTIONS[distType]} label="" displayMode={true} />
                  </AccordionCard>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedInfo.formula_pdf && (
                  <AccordionCard
                    title="モデル定義"
                    icon={<ChartIcon />}
                    defaultOpen={true}
                    description={PDF_DESCRIPTIONS[distType]}
                  >
                    <FormulaDisplay formula={selectedInfo.formula_pdf} label="" displayMode={true} />
                  </AccordionCard>
                )}
                {ML_COST_FUNCTION[distType] !== "-" && (
                  <AccordionCard
                    title="コスト関数 (MSE)"
                    icon={<FunctionIcon />}
                    defaultOpen={true}
                    description="予測値と実測値の差の二乗平均。この値を最小化するパラメータθを求めるのが学習の目的。"
                  >
                    <FormulaDisplay formula={ML_COST_FUNCTION[distType]} label="" displayMode={true} />
                  </AccordionCard>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ML_NORMAL_EQUATION[distType] !== "-" && (
                  <AccordionCard
                    title="正規方程式（解析解）"
                    icon={<AverageIcon />}
                    description="行列演算により閉じた形でパラメータを直接計算する手法。データが小規模な場合に高速。"
                  >
                    <FormulaDisplay formula={ML_NORMAL_EQUATION[distType]} label="" displayMode={true} />
                  </AccordionCard>
                )}
                {ML_GRADIENT_UPDATE[distType] !== "-" && (
                  <AccordionCard
                    title="勾配降下法"
                    icon={<VarianceIcon />}
                    description="コスト関数の勾配方向にパラメータを繰り返し更新する手法。学習率αが収束速度を制御する。"
                  >
                    <FormulaDisplay formula={ML_GRADIENT_UPDATE[distType]} label="" displayMode={true} />
                  </AccordionCard>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
