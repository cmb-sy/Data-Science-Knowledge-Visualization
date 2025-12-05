/**
 * 確率分布グラフコンポーネント
 * RechartsでPDFとCDFを描画
 */
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DistributionData } from '@/types/distribution';

interface DistributionChartProps {
  data: DistributionData;
  showPDF?: boolean;
  showCDF?: boolean;
}

export default function DistributionChart({
  data,
  showPDF = true,
  showCDF = true,
}: DistributionChartProps) {
  // Rechartsで使用するデータ形式に変換
  const chartData = data.x_values.map((x, index) => ({
    x: parseFloat(x.toFixed(4)),
    pdf: parseFloat(data.pdf_values[index].toFixed(6)),
    cdf: parseFloat(data.cdf_values[index].toFixed(6)),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        確率分布グラフ
      </h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="x"
            label={{ value: 'x', position: 'insideBottomRight', offset: -10 }}
            stroke="#666"
          />
          <YAxis
            label={{ value: 'y', angle: -90, position: 'insideLeft' }}
            stroke="#666"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            formatter={(value: number) => value.toFixed(6)}
          />
          <Legend />
          
          {showPDF && (
            <Line
              type="monotone"
              dataKey="pdf"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              name="確率密度関数 (PDF)"
              isAnimationActive={true}
            />
          )}
          
          {showCDF && (
            <Line
              type="monotone"
              dataKey="cdf"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="累積分布関数 (CDF)"
              isAnimationActive={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

