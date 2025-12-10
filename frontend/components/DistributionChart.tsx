/**
 * 確率分布グラフコンポーネント
 * RechartsでPDFとCDF、または回帰分析の結果を描画
 */
"use client";

import React, { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DistributionData } from "@/types/distribution";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface DistributionChartProps {
  data: DistributionData;
  showPDF?: boolean;
  showCDF?: boolean;
}

// 描画する最大データポイント数（間引きの基準）
const MAX_DISPLAY_POINTS = 300;

// テーマカラー定義 (Tailwind colors.emerald, colors.slate等に基づいた値)
const COLORS = {
  pdf: "#059669", // emerald-600
  cdf: "#94a3b8", // slate-400
  true: "#14b8a6", // teal-500
  observed: "#6366f1", // indigo-500
  fitted: "#f43f5e", // rose-500
  grid: "#e2e8f0", // slate-200
  axis: "#94a3b8", // slate-400
  tooltipBg: "#ffffff",
  tooltipBorder: "#e2e8f0",
};

function DistributionChartComponent({
  data,
  showPDF = true,
  showCDF = true,
}: DistributionChartProps) {
  const isRegression = !!data.y_observed;

  // データの変換と間引き処理をメモ化
  const chartData = useMemo(() => {
    const totalPoints = data.x_values.length;

    // 間引きステップの計算（最大数を超える場合のみ間引く）
    const step =
      totalPoints > MAX_DISPLAY_POINTS
        ? Math.ceil(totalPoints / MAX_DISPLAY_POINTS)
        : 1;

    const result = [];
    for (let i = 0; i < totalPoints; i++) {
      // stepごとにデータを採用、または最後のデータは必ず含める
      if (i % step === 0 || i === totalPoints - 1) {
        result.push({
          x: parseFloat(data.x_values[i].toFixed(4)),
          pdf: data.pdf_values
            ? parseFloat(data.pdf_values[i].toFixed(6))
            : null,
          cdf: data.cdf_values
            ? parseFloat(data.cdf_values[i].toFixed(6))
            : null,
          true: data.y_true ? parseFloat(data.y_true[i].toFixed(6)) : null,
          // 観測データ（散布図）も間引く
          observed: data.y_observed
            ? parseFloat(data.y_observed[i].toFixed(6))
            : null,
          fitted: data.y_fitted
            ? parseFloat(data.y_fitted[i].toFixed(6))
            : null,
        });
      }
    }
    return result;
  }, [data]);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-soft">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.grid}
            vertical={false}
          />
          <XAxis
            dataKey="x"
            type="number"
            domain={["auto", "auto"]}
            stroke={COLORS.axis}
            style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
            tickMargin={10}
            // label={{ value: "x", position: "bottom", offset: 0 }} // レイアウト崩れを防ぐため削除し、Tooltipで補完
          />
          <YAxis
            stroke={COLORS.axis}
            style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
            tickMargin={10}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: COLORS.axis }}
            contentStyle={{
              backgroundColor: COLORS.tooltipBg,
              border: `1px solid ${COLORS.tooltipBorder}`,
              borderRadius: "12px",
              fontSize: "12px",
              padding: "12px 16px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontFamily: "var(--font-mono)",
            }}
            formatter={(value: ValueType | null) => {
              if (typeof value === "number") {
                return value.toFixed(6);
              }
              return "-";
            }}
            labelStyle={{ color: COLORS.axis, marginBottom: "8px" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "13px",
              fontWeight: 500,
            }}
            iconType="circle"
          />

          {/* 確率分布用 */}
          {!isRegression && showPDF && (
            <Line
              type="monotone"
              dataKey="pdf"
              stroke={COLORS.pdf}
              strokeWidth={2.5}
              dot={false}
              name="確率密度関数 (PDF)"
              isAnimationActive={true}
              animationDuration={1000}
            />
          )}
          {!isRegression && showCDF && (
            <Line
              type="monotone"
              dataKey="cdf"
              stroke={COLORS.cdf}
              strokeWidth={2}
              dot={false}
              name="累積分布関数 (CDF)"
              isAnimationActive={true}
              animationDuration={1000}
              strokeDasharray="4 4"
            />
          )}

          {/* 回帰分析用 */}
          {isRegression && (
            <>
              {/* 真のモデル（正解線） */}
              <Line
                type="monotone"
                dataKey="true"
                stroke={COLORS.true}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="真のモデル"
                isAnimationActive={false}
                opacity={0.8}
              />
              <Scatter
                name="観測データ"
                dataKey="observed"
                fill={COLORS.observed}
                fillOpacity={0.6}
                isAnimationActive={false}
                r={3} // ドットのサイズを調整
              />
              <Line
                type="monotone"
                dataKey="fitted"
                stroke={COLORS.fitted}
                strokeWidth={2.5}
                dot={false}
                name="予測モデル"
                isAnimationActive={false}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// 不要な再レンダリングを防ぐためにメモ化
export default React.memo(DistributionChartComponent);
