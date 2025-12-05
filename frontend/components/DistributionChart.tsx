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

interface DistributionChartProps {
  data: DistributionData;
  showPDF?: boolean;
  showCDF?: boolean;
}

// 描画する最大データポイント数（間引きの基準）
const MAX_DISPLAY_POINTS = 300;

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
    // 線グラフの滑らかさを保つため、単純な間引きで良いか検討が必要だが、
    // 1000点程度なら単純間引きでも概形は崩れない。
    // ただし、散布図の密度感は変わるが、パフォーマンス優先とする。
    const step = totalPoints > MAX_DISPLAY_POINTS 
      ? Math.ceil(totalPoints / MAX_DISPLAY_POINTS) 
      : 1;

    const result = [];
    for (let i = 0; i < totalPoints; i++) {
      // stepごとにデータを採用、または最後のデータは必ず含める
      if (i % step === 0 || i === totalPoints - 1) {
        result.push({
          x: parseFloat(data.x_values[i].toFixed(4)),
          pdf: data.pdf_values ? parseFloat(data.pdf_values[i].toFixed(6)) : null,
          cdf: data.cdf_values ? parseFloat(data.cdf_values[i].toFixed(6)) : null,
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
    <div className="border border-gray-200 rounded-lg p-6">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="x"
            type="number"
            domain={["auto", "auto"]}
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            label={{ value: "x", position: "bottom", offset: 0 }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            formatter={(value: number | null) =>
              value !== null ? value.toFixed(6) : "-"
            }
            labelStyle={{ color: "#6b7280", marginBottom: "4px" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "16px",
              fontSize: "13px",
            }}
            iconType="plainline"
          />

          {/* 確率分布用 */}
          {!isRegression && showPDF && (
            <Line
              type="monotone"
              dataKey="pdf"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="PDF"
              isAnimationActive={false}
            />
          )}
          {!isRegression && showCDF && (
            <Line
              type="monotone"
              dataKey="cdf"
              stroke="#64748b"
              strokeWidth={2}
              dot={false}
              name="CDF"
              isAnimationActive={false}
            />
          )}

          {/* 回帰分析用 */}
          {isRegression && (
            <>
              {/* 真のモデル（正解線） */}
              <Line
                type="monotone"
                dataKey="true"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="真のモデル"
                isAnimationActive={false}
                opacity={0.7}
              />
              <Scatter
                name="観測データ"
                dataKey="observed"
                fill="#2563eb"
                fillOpacity={0.6}
                // パフォーマンスのためアニメーション無効化
                isAnimationActive={false} 
              />
              <Line
                type="monotone"
                dataKey="fitted"
                stroke="#ef4444"
                strokeWidth={2}
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
