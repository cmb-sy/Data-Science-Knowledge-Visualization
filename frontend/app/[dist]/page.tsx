/**
 * 分布詳細ページ（動的ルート）
 * 例: /uniform で一様分布ページへ遷移
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import StatisticsDisplay from "@/components/StatisticsDisplay";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

type PageProps = {
  params: { dist: string };
};

// データ数設定用のパラメータ定義
const NUM_POINTS_PARAM: DistributionParameter = {
  name: "num_points",
  label: "データ数 (N)",
  description: "生成するデータのサンプル数",
  default_value: 100,
  min_value: 10,
  max_value: 1000,
  step: 10,
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

  // APIリクエストの重複を防ぐためのRef
  const abortControllerRef = useRef<AbortController | null>(null);

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

        // データ数の初期値を調整（回帰分析の場合は少なくする等も可能だが、一旦デフォルト）
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

    // 前回のリクエストをキャンセル（必要であれば実装するが、今回は単純なフラグ管理で対応）
    // ここではローディング表示を制御しないことで、再描画時のチラつきを抑える
    // setLoading(true);
    setError(null);

    try {
      const data = await calculateDistribution({
        distribution_type: distType,
        parameters,
        num_points: numPoints,
      });
      setDistributionData(data);
    } catch (err: any) {
      // キャンセルされたエラーは無視するなどの処理が必要な場合があるが、今回は単純化
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
    // 初回マウント時やパラメータがまだない場合はスキップ
    if (Object.keys(parameters).length === 0) return;

    // デバウンス時間を調整 (100ms)
    // スライダー操作への追従性を高めつつ、過度なリクエストを防ぐ
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

  return (
    <ErrorBoundary>
      {/* エラー表示 - 右上固定ポップアップ */}
      {error && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 10000,
            maxWidth: "28rem",
            animation: "slide-in-right 0.3s ease-out forwards",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: "1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "start",
            }}
          >
            <div style={{ flexShrink: 0, marginTop: "0.125rem" }}>
              <svg
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: "#dc2626",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#7f1d1d",
                  fontWeight: 500,
                  wordBreak: "break-word",
                }}
              >
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                color: "#f87171",
                flexShrink: 0,
                marginTop: "0.125rem",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#f87171")}
              aria-label="閉じる"
            >
              <svg
                style={{ width: "1.25rem", height: "1.25rem" }}
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

      <div className="min-h-screen bg-white">
        {/* ヘッダー */}
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-gray-900 transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>

              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedInfo?.name || "読み込み中..."}
                </h1>
                {selectedInfo?.tags && selectedInfo.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {selectedInfo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* メインコンテンツ */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* サイドバー: パラメータ調整 */}
            <aside className="lg:col-span-1">
              {selectedInfo && (
                <div className="space-y-6 sticky top-20">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">
                      パラメータ
                    </h2>
                    <div className="space-y-6">
                      {/* データ数設定 */}
                      <ParameterSlider
                        parameter={NUM_POINTS_PARAM}
                        value={numPoints}
                        onChange={setNumPoints}
                        // onCommit は useEffect の自動更新に任せるため指定しない
                      />

                      <div className="border-t border-gray-200" />

                      {/* 分布固有パラメータ */}
                      {selectedInfo.parameters.map((param) => (
                        <ParameterSlider
                          key={param.name}
                          parameter={param}
                          value={parameters[param.name] || param.default_value}
                          onChange={(value) =>
                            handleParameterChange(param.name, value)
                          }
                          // onCommit は useEffect の自動更新に任せるため指定しない
                        />
                      ))}
                    </div>
                  </div>

                  {distributionData && (
                    <StatisticsDisplay
                      mean={distributionData.mean}
                      variance={distributionData.variance}
                      stdDev={distributionData.std_dev}
                      rSquared={distributionData.r_squared}
                      slope={distributionData.slope_estimated}
                      intercept={distributionData.intercept_estimated}
                      rmse={distributionData.rmse}
                    />
                  )}
                </div>
              )}
            </aside>

            {/* メインエリア: グラフと数式 */}
            <div className="lg:col-span-3 space-y-8">
              {/* 
                ローディング中もグラフを表示し続ける（opacityを下げるなどしても良い）
                計算中はローディングスピナーをオーバーレイ表示するなど
              */}
              <div className="relative">
                {/* グラフ領域 */}
                {distributionData ? (
                  <DistributionChart data={distributionData} />
                ) : (
                  <div className="h-[400px] border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                    {loading && <LoadingSpinner message="計算中..." />}
                  </div>
                )}

                {/* データがある場合のローディングオーバーレイ（オプション） */}
                {distributionData && loading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    {/* 控えめなローディング表示 */}
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {distributionData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
