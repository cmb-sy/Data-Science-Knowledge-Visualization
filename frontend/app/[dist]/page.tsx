"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type {
  DistributionInfo,
  DistributionData,
  DistributionType,
} from "@/types/distribution";
import { getDistributionInfo, calculateDistribution } from "@/lib/api";
import DistributionChart from "@/components/DistributionChart";
import ErrorBoundary from "@/components/ErrorBoundary";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import FormulaSection from "@/components/FormulaSection";
import ParameterPanel from "@/components/ParameterPanel";
import ChartExplanation from "@/components/ChartExplanation";
import { SkeletonChart, Skeleton } from "@/components/Skeleton";
import { SettingsIcon } from "@/components/icons";

type PageProps = {
  params: { dist: string };
};

export default function DistributionPage({ params }: PageProps) {
  const distType = (params.dist as DistributionType) ?? "uniform";

  const [selectedInfo, setSelectedInfo] = useState<DistributionInfo | null>(null);
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [numPoints, setNumPoints] = useState<number>(100);
  const [distributionData, setDistributionData] = useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileParamOpen, setMobileParamOpen] = useState(false);

  const isMachineLearning = selectedInfo?.category?.startsWith("ml_") ?? false;

  useEffect(() => {
    const fetchDistributionInfo = async () => {
      try {
        const data = await getDistributionInfo(distType);
        setSelectedInfo(data);
        const defaultParams: Record<string, number> = {};
        data.parameters.forEach((param) => {
          defaultParams[param.name] = param.default_value;
        });
        setParameters(defaultParams);
        setNumPoints(distType === "linear_regression" ? 100 : 1000);
      } catch {
        toast.error("確率分布の取得に失敗しました。バックエンドが起動しているか確認してください。");
      }
    };
    fetchDistributionInfo();
  }, [distType]);

  const fetchDistributionData = useCallback(async () => {
    if (!selectedInfo || Object.keys(parameters).length === 0) return;
    setLoading(true);
    try {
      const data = await calculateDistribution({
        distribution_type: distType,
        parameters,
        num_points: numPoints,
      });
      setDistributionData(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "計算に失敗しました。パラメータを確認してください。");
    } finally {
      setLoading(false);
    }
  }, [distType, parameters, selectedInfo, numPoints]);

  useEffect(() => {
    if (Object.keys(parameters).length === 0) return;
    const timeoutId = setTimeout(() => fetchDistributionData(), 100);
    return () => clearTimeout(timeoutId);
  }, [fetchDistributionData, parameters]);

  const handleParameterChange = (name: string, value: number) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50/80">
        {/* ヘッダー */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-sm font-medium hidden sm:inline">一覧に戻る</span>
              </Link>

              <div className="flex-1 border-l border-slate-200 pl-4 ml-2">
                <h1 className="text-lg font-bold text-slate-800">
                  {selectedInfo?.name || "読み込み中..."}
                </h1>
                {selectedInfo?.tags && selectedInfo.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {selectedInfo.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 数式セクション */}
          {selectedInfo ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FormulaSection
                selectedInfo={selectedInfo}
                distType={distType}
                isMachineLearning={isMachineLearning}
              />
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          )}

          {/* パラメータ+チャートのレイアウト */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 mb-8">
              {/* デスクトップ: サイドバー */}
              <div className="hidden lg:block">
                {selectedInfo && (
                  <ParameterPanel
                    selectedInfo={selectedInfo}
                    parameters={parameters}
                    numPoints={numPoints}
                    isMachineLearning={isMachineLearning}
                    distributionData={distributionData}
                    onParameterChange={handleParameterChange}
                    onNumPointsChange={setNumPoints}
                  />
                )}
              </div>

              {/* チャートエリア */}
              <div className="relative">
                {distributionData ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
                    <DistributionChart data={distributionData} />
                  </div>
                ) : (
                  <SkeletonChart />
                )}

                {distributionData && loading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 transition-opacity duration-300">
                    <LoadingSpinner message="" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* グラフの説明 */}
          {distributionData && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <ChartExplanation isMachineLearning={isMachineLearning} />
            </motion.div>
          )}
        </div>

        {/* モバイル: パラメータドロワー */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileParamOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white px-5 py-3 rounded-full shadow-lg shadow-primary-500/30 flex items-center gap-2 hover:bg-primary-700 transition-colors active:scale-95"
          >
            <SettingsIcon className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold">パラメータ</span>
          </button>

          <AnimatePresence>
            {mobileParamOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileParamOpen(false)}
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <SettingsIcon />
                      パラメータ設定
                    </h2>
                    <button
                      onClick={() => setMobileParamOpen(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                      aria-label="閉じる"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    {selectedInfo && (
                      <ParameterPanel
                        selectedInfo={selectedInfo}
                        parameters={parameters}
                        numPoints={numPoints}
                        isMachineLearning={isMachineLearning}
                        distributionData={distributionData}
                        onParameterChange={handleParameterChange}
                        onNumPointsChange={setNumPoints}
                      />
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
}
