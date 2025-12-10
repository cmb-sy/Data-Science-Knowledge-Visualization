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
  DistributionParameter,
} from "@/types/distribution";
import { getDistributionInfo, calculateDistribution } from "@/lib/api";
import ParameterSlider from "@/components/ParameterSlider";
import DistributionChart from "@/components/DistributionChart";
import FormulaDisplay from "@/components/FormulaDisplay";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

type PageProps = {
  params: { dist: string };
};

// データ数設定用のパラメータ定義（機械学習モデル用）
const NUM_POINTS_PARAM: DistributionParameter = {
  name: "num_points",
  label: "データ数 (N)",
  description: "生成するデータのサンプル数",
  default_value: 100,
  min_value: 10,
  max_value: 1000,
  step: 10,
};

// 母関数の数式を分布タイプごとに定義（将来的にバックエンドから取得可能にする）
const MOMENT_GENERATING_FUNCTIONS: Record<DistributionType, string> = {
  uniform: "M_X(t) = \\frac{e^{tb} - e^{ta}}{t(b-a)}",
  exponential: "M_X(t) = \\frac{\\lambda}{\\lambda - t}, \\quad t < \\lambda",
  linear_regression: "-", // 機械学習モデルには母関数は定義されない
};

// 平均の式を分布タイプごとに定義
const MEAN_FORMULAS: Record<DistributionType, string> = {
  uniform: "\\mu = \\frac{a + b}{2}",
  exponential: "\\mu = \\frac{1}{\\lambda}",
  linear_regression: "-", // 機械学習モデルには平均の式は表示しない
};

// 分散の式を分布タイプごとに定義
const VARIANCE_FORMULAS: Record<DistributionType, string> = {
  uniform: "\\sigma^2 = \\frac{(b-a)^2}{12}",
  exponential: "\\sigma^2 = \\frac{1}{\\lambda^2}",
  linear_regression: "-", // 機械学習モデルには分散の式は表示しない
};

// PDFの追加説明文
const PDF_DESCRIPTIONS: Record<DistributionType, string> = {
  uniform: "区間内の面積が 1 になるように 1/(b-a) に調整されている。",
  exponential: "-",
  linear_regression: "-",
};

// CDFの追加説明文
const CDF_DESCRIPTIONS: Record<DistributionType, string> = {
  uniform: "区間内では線形に増える点が重要。",
  exponential: "-",
  linear_regression: "-",
};

// データタイプのラベル定義
const DATA_TYPE_LABELS: Record<number, string> = {
  0: "線形",
  1: "二次関数",
  2: "外れ値あり",
};

export default function DistributionPage({ params }: PageProps) {
  const distType = (params.dist as DistributionType) ?? "uniform";

  const [selectedInfo, setSelectedInfo] = useState<DistributionInfo | null>(
    null
  );
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [numPoints, setNumPoints] = useState<number>(
    NUM_POINTS_PARAM.default_value
  );
  const [distributionData, setDistributionData] =
    useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 機械学習モデルかどうかを判定
  const isMachineLearning = selectedInfo?.category?.startsWith("ml_") ?? false;

  // 分布情報の取得
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

        // データ数の初期値を調整
        if (distType === "linear_regression") {
          setNumPoints(100);
        } else {
          setNumPoints(1000);
        }
      } catch (err) {
        console.error("Failed to fetch distribution info:", err);
        setError(
          "確率分布の取得に失敗しました。バックエンドが起動しているか確認してください。"
        );
      }
    };

    fetchDistributionInfo();
  }, [distType]);

  // 分布データの計算
  const fetchDistributionData = useCallback(async () => {
    if (!selectedInfo || Object.keys(parameters).length === 0) return;

    setError(null);
    setLoading(true);

    try {
      const data = await calculateDistribution({
        distribution_type: distType,
        parameters,
        num_points: numPoints,
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
  }, [distType, parameters, selectedInfo, numPoints]);

  // パラメータ変更時に再計算（デバウンス処理）
  useEffect(() => {
    if (Object.keys(parameters).length === 0) return;

    const timeoutId = setTimeout(() => {
      fetchDistributionData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fetchDistributionData, parameters]);

  // パラメータ値変更時の処理
  const handleParameterChange = (name: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 見出しの共通スタイル
  const headerStyle =
    "text-sm font-bold text-slate-700 mb-4 flex items-center gap-2";

  // セクション全体の共通スタイル（統一された外枠付き、ホバー効果あり）
  const sectionStyle =
    "border border-slate-200 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group";

  // アイコンコンポーネント
  const Icons = {
    Chart: () => (
      <svg
        className="w-4 h-4 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>
    ),
    Function: () => (
      <svg
        className="w-4 h-4 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    Average: () => (
      <svg
        className="w-4 h-4 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
        />
      </svg>
    ),
    Variance: () => (
      <svg
        className="w-4 h-4 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    Moment: () => (
      <svg
        className="w-4 h-4 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
  };

  return (
    <ErrorBoundary>
      {/* エラー表示 - 右上固定ポップアップ */}
      {error && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right max-w-md w-full">
          <div className="bg-white border-l-4 border-red-500 rounded-r-lg shadow-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 text-red-500 mt-0.5">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  一覧に戻る
                </span>
              </Link>

              <div className="flex-1 border-l border-slate-200 pl-4 ml-2">
                <h1 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  {selectedInfo?.name || "読み込み中..."}
                </h1>
                {selectedInfo?.tags && selectedInfo.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {selectedInfo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200"
                      >
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
          {/* 説明セクション: 説明、PDF、CDFの式と特徴 */}
          {selectedInfo && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8">
              <div className="space-y-8">
                {/* 分布の説明 */}
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-primary-500 pl-3">
                    {selectedInfo.name}について
                  </h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {selectedInfo.description}
                  </p>
                </div>

                {/* 数式と特徴 */}
                <div className="space-y-8">
                  <h2 className="text-lg font-bold text-slate-800 border-l-4 border-primary-500 pl-3">
                    数式・特性
                  </h2>

                  {/* PDFとCDFの2カラム */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PDF */}
                    {selectedInfo.formula_pdf && (
                      <div className={sectionStyle}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Icons.Chart />
                        </div>
                        <h3 className={headerStyle}>
                          <Icons.Chart />
                          確率密度関数 (PDF)
                        </h3>
                        {PDF_DESCRIPTIONS[distType] !== "-" && (
                          <div className="mb-4 bg-primary-50/50 p-3 rounded-lg border border-primary-100/50">
                            <p className="text-sm text-slate-700">
                              {PDF_DESCRIPTIONS[distType]}
                            </p>
                          </div>
                        )}
                        <div className="space-y-4">
                          <FormulaDisplay
                            formula={selectedInfo.formula_pdf}
                            label=""
                            displayMode={true}
                          />
                        </div>
                      </div>
                    )}

                    {/* CDF */}
                    {selectedInfo.formula_cdf && (
                      <div className={sectionStyle}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Icons.Function />
                        </div>
                        <h3 className={headerStyle}>
                          <Icons.Function />
                          累積分布関数 (CDF)
                        </h3>
                        {CDF_DESCRIPTIONS[distType] !== "-" && (
                          <div className="mb-4 bg-primary-50/50 p-3 rounded-lg border border-primary-100/50">
                            <p className="text-sm text-slate-700">
                              {CDF_DESCRIPTIONS[distType]}
                            </p>
                          </div>
                        )}
                        <div className="space-y-4">
                          <FormulaDisplay
                            formula={selectedInfo.formula_cdf}
                            label=""
                            displayMode={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 平均、分散、確率母関数の式（確率分布の場合のみ） */}
                  {!isMachineLearning && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      {/* 平均 */}
                      {MEAN_FORMULAS[distType] !== "-" && (
                        <div className={sectionStyle}>
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Icons.Average />
                          </div>
                          <h3 className={headerStyle}>
                            <Icons.Average />
                            平均 (μ)
                          </h3>
                          <div className="mt-4">
                            <FormulaDisplay
                              formula={MEAN_FORMULAS[distType]}
                              label=""
                              displayMode={true}
                            />
                          </div>
                        </div>
                      )}

                      {/* 分散 */}
                      {VARIANCE_FORMULAS[distType] !== "-" && (
                        <div className={sectionStyle}>
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Icons.Variance />
                          </div>
                          <h3 className={headerStyle}>
                            <Icons.Variance />
                            分散 (σ²)
                          </h3>
                          <div className="mt-4">
                            <FormulaDisplay
                              formula={VARIANCE_FORMULAS[distType]}
                              label=""
                              displayMode={true}
                            />
                          </div>
                        </div>
                      )}

                      {/* 確率母関数 */}
                      {MOMENT_GENERATING_FUNCTIONS[distType] !== "-" && (
                        <div className={sectionStyle}>
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Icons.Moment />
                          </div>
                          <h3 className={headerStyle}>
                            <Icons.Moment />
                            モーメント母関数
                          </h3>
                          <div className="mt-4">
                            <FormulaDisplay
                              formula={MOMENT_GENERATING_FUNCTIONS[distType]}
                              label=""
                              displayMode={true}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* パラメータ設定とグラフの2カラムレイアウト */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 mb-8">
            {/* 左側: パラメータ設定と統計量（同じ枠に統合） */}
            <div>
              {selectedInfo && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                  {/* パラメータ設定セクション */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      パラメータ設定
                    </h2>

                    <div className="space-y-6">
                      {/* 機械学習モデルの場合のみデータ数を表示 */}
                      {isMachineLearning && (
                        <div className="animate-fade-in">
                          <ParameterSlider
                            parameter={NUM_POINTS_PARAM}
                            value={numPoints}
                            onChange={setNumPoints}
                          />
                          <div className="border-t border-slate-100 my-4" />
                        </div>
                      )}

                      {/* 分布固有パラメータ */}
                      {selectedInfo.parameters.map((param) => {
                        // pattern_idの場合はボタン形式で表示
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
                                    onClick={() =>
                                      handleParameterChange(param.name, value)
                                    }
                                    className={`
                                      px-3 py-1.5 text-sm rounded-md border transition-all
                                      ${
                                        parameters[param.name] === value
                                          ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                          : "bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-600"
                                      }
                                    `}
                                  >
                                    {DATA_TYPE_LABELS[value]}
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">
                                {param.description}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <ParameterSlider
                            key={param.name}
                            parameter={param}
                            value={
                              parameters[param.name] || param.default_value
                            }
                            onChange={(value) =>
                              handleParameterChange(param.name, value)
                            }
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 統計量セクション - 確率分布の場合のみ表示 */}
                  {!isMachineLearning && distributionData && (
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        統計量
                      </h2>
                      <div className="space-y-4">
                        {/* 平均 */}
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="text-sm text-slate-600">
                            平均{" "}
                            <span className="font-mono text-slate-400">
                              (μ)
                            </span>
                          </span>
                          <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
                            {distributionData.mean.toFixed(4)}
                          </span>
                        </div>

                        {/* 分散 */}
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="text-sm text-slate-600">
                            分散{" "}
                            <span className="font-mono text-slate-400">
                              (σ²)
                            </span>
                          </span>
                          <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
                            {distributionData.variance.toFixed(4)}
                          </span>
                        </div>

                        {/* 標準偏差 */}
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="text-sm text-slate-600">
                            標準偏差{" "}
                            <span className="font-mono text-slate-400">
                              (σ)
                            </span>
                          </span>
                          <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
                            {distributionData.std_dev.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 機械学習モデルの場合の統計量 */}
                  {isMachineLearning && distributionData && (
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        モデル評価
                      </h2>
                      <div className="space-y-3">
                        {distributionData.r_squared !== undefined && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-sm text-slate-600">
                              決定係数{" "}
                              <span className="font-mono text-slate-400">
                                (R²)
                              </span>
                            </span>
                            <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
                              {distributionData.r_squared.toFixed(4)}
                            </span>
                          </div>
                        )}
                        {distributionData.rmse !== undefined && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-sm text-slate-600">RMSE</span>
                            <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
                              {distributionData.rmse.toFixed(4)}
                            </span>
                          </div>
                        )}
                        {distributionData.slope_estimated !== undefined && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-sm text-slate-600">
                              推定傾き{" "}
                              <span className="font-mono text-slate-400">
                                (â)
                              </span>
                            </span>
                            <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
                              {distributionData.slope_estimated.toFixed(4)}
                            </span>
                          </div>
                        )}
                        {distributionData.intercept_estimated !== undefined && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-sm text-slate-600">
                              推定切片{" "}
                              <span className="font-mono text-slate-400">
                                (b̂)
                              </span>
                            </span>
                            <span className="text-sm font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded">
                              {distributionData.intercept_estimated.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 右側: グラフ */}
            <div className="relative">
              {distributionData ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
                  <DistributionChart data={distributionData} />
                </div>
              ) : (
                <div className="h-[500px] border border-slate-200 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  {loading && <LoadingSpinner message="計算中..." />}
                </div>
              )}

              {distributionData && loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 transition-opacity duration-300">
                  <LoadingSpinner message="" />
                </div>
              )}
            </div>
          </div>

          {/* グラフの説明 */}
          {distributionData && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                グラフの説明
              </h2>
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                {!isMachineLearning ? (
                  <>
                    <p>
                      <strong className="text-slate-800">青い線（PDF）</strong>:
                      確率密度関数を表します。横軸の各点での確率密度の値を示しています。PDFの下の面積が確率を表します。
                    </p>
                    <p>
                      <strong className="text-slate-800">
                        グレーの線（CDF）
                      </strong>
                      :
                      累積分布関数を表します。横軸の値以下になる確率を示しています。CDFは0から1の範囲の値を取ります。
                    </p>
                    <p>
                      パラメータを変更すると、グラフの形状がリアルタイムで更新されます。各分布の特性を理解するために、様々なパラメータ値を試してみてください。
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-slate-800">
                        緑の破線（真のモデル）
                      </strong>
                      : データ生成に使用された真の回帰直線を表します。
                    </p>
                    <p>
                      <strong className="text-slate-800">
                        青い点（観測データ）
                      </strong>
                      : ノイズを含む実際に観測されたデータポイントです。
                    </p>
                    <p>
                      <strong className="text-slate-800">
                        赤い線（予測モデル）
                      </strong>
                      : 観測データから最小二乗法で推定された回帰直線です。
                    </p>
                    <p>
                      データ数やノイズの大きさを変更すると、モデルの推定精度がどのように変化するか確認できます。
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
