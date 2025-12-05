/**
 * 分布詳細ページ（動的ルート）
 * 例: /uniform で一様分布ページへ遷移
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type {
  DistributionInfo,
  DistributionData,
  DistributionType,
} from "@/types/distribution";
import { getDistributionInfo, calculateDistribution } from "@/lib/api";
import ParameterSlider from "@/components/ParameterSlider";
import DistributionChart from "@/components/DistributionChart";
import FormulaDisplay from "@/components/FormulaDisplay";
import StatisticsDisplay from "@/components/StatisticsDisplay";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

type PageProps = {
  params: { dist: string };
};

export default function DistributionPage({ params }: PageProps) {
  const distType = (params.dist as DistributionType) ?? "uniform";

  const [selectedInfo, setSelectedInfo] = useState<DistributionInfo | null>(
    null
  );
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [distributionData, setDistributionData] =
    useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 分布情報の取得
  useEffect(() => {
    const fetchDistributionInfo = async () => {
      try {
        const data = await getDistributionInfo(distType);
        setSelectedInfo(data);

        // デフォルトパラメータを設定
        const defaultParams: Record<string, number> = {};
        data.parameters.forEach((param) => {
          defaultParams[param.name] = param.default_value;
        });
        setParameters(defaultParams);
      } catch (err) {
        console.error("Failed to fetch distribution info:", err);
        setError(
          "確率分布の取得に失敗しました。バックエンドが起動しているか確認してください。"
        );
      }
    };

    fetchDistributionInfo();
  }, [distType]);

  // 分布データの計算（パラメータ変更時に自動実行）
  const fetchDistributionData = useCallback(async () => {
    if (!selectedInfo || Object.keys(parameters).length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await calculateDistribution({
        distribution_type: distType,
        parameters,
        num_points: 1000,
      });
      setDistributionData(data);
    } catch (err: any) {
      console.error("Failed to calculate distribution:", err);
      setError(
        err.response?.data?.detail ||
          "計算に失敗しました。パラメータを確認してください。"
      );
    } finally {
      setLoading(false);
    }
  }, [distType, parameters, selectedInfo]);

  // パラメータ変更時に即座に再計算（デバウンス20ms - より滑らかに）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDistributionData();
    }, 20);

    return () => clearTimeout(timeoutId);
  }, [fetchDistributionData]);

  // パラメータ値変更時の処理
  const handleParameterChange = (name: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {selectedInfo?.name || "確率分布可視化"}
                </h1>
                <p className="text-gray-600">
                  {selectedInfo?.description ||
                    "パラメータをリアルタイムで調整して確率分布の変化を観察できます"}
                </p>
              </div>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                ← 一覧に戻る
              </Link>
            </div>
          </header>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左カラム: パラメータ調整 */}
            <div className="lg:col-span-1 space-y-4">
              {selectedInfo && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 px-1">
                      パラメータ調整
                    </h3>
                    {selectedInfo.parameters.map((param) => (
                      <ParameterSlider
                        key={param.name}
                        parameter={param}
                        value={parameters[param.name] || param.default_value}
                        onChange={(value) =>
                          handleParameterChange(param.name, value)
                        }
                        onCommit={() => fetchDistributionData()}
                      />
                    ))}
                  </div>

                  {distributionData && (
                    <StatisticsDisplay
                      mean={distributionData.mean}
                      variance={distributionData.variance}
                      stdDev={distributionData.std_dev}
                    />
                  )}
                </>
              )}
            </div>

            {/* 右カラム: グラフと数式 */}
            <div className="lg:col-span-2 space-y-6">
              {loading && <LoadingSpinner message="グラフデータを計算中..." />}

              {!loading && distributionData && (
                <>
                  <DistributionChart data={distributionData} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInfo?.formula_pdf && (
                      <FormulaDisplay
                        formula={selectedInfo.formula_pdf}
                        label="確率密度関数 (PDF)"
                      />
                    )}

                    {selectedInfo?.formula_cdf && (
                      <FormulaDisplay
                        formula={selectedInfo.formula_cdf}
                        label="累積分布関数 (CDF)"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* フッター */}
          <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              ← 確率分布一覧に戻る
            </Link>
          </footer>
        </div>
      </main>
    </ErrorBoundary>
  );
}
