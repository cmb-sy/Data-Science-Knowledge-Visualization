"use client";

interface ChartExplanationProps {
  isMachineLearning: boolean;
}

export default function ChartExplanation({ isMachineLearning }: ChartExplanationProps) {
  return (
    <div className="px-4 pt-3 pb-1 text-sm text-slate-500 leading-relaxed space-y-1.5">
      {!isMachineLearning ? (
        <>
          <p>
            <strong className="text-slate-700">確率密度関数 (PDF)</strong>:
            横軸の各点での確率密度を示す。PDF曲線の下の面積が、その区間の確率に対応する。面積全体は必ず1になる。
          </p>
          <p>
            <strong className="text-slate-700">累積分布関数 (CDF)</strong>:
            ある値x以下になる確率を示す。PDFを左端から積分した値に等しく、0から1まで単調増加する。CDFの傾きが急な箇所はPDFの値が大きい箇所と対応する。
          </p>
          <p className="text-xs text-slate-400">
            パラメータを変更すると、グラフの形状がリアルタイムで更新されます。分布の特性（尖度、歪度など）がパラメータによってどう変化するか観察してみてください。
          </p>
        </>
      ) : (
        <>
          <p>
            <strong className="text-slate-700">真のモデル（緑の破線）</strong>:
            データ生成に使用された真の回帰直線。実際の分析ではこの線は未知であり、観測データからこれを推定することが目標。
          </p>
          <p>
            <strong className="text-slate-700">観測データ（青い点）</strong>:
            ノイズを含む実際に観測されたデータポイント。ノイズの大きさ（σ）が増えると点が回帰直線から離れ、推定が困難になる。
          </p>
          <p>
            <strong className="text-slate-700">予測モデル（赤い線）</strong>:
            観測データから最小二乗法で推定された回帰直線。データ数が多くノイズが小さいほど、真のモデルに近づく。
          </p>
          <p className="text-xs text-slate-400">
            データ数（N）を増やすと推定精度が向上し、ノイズ（σ）を増やすと精度が低下する様子を確認できます。決定係数R²が1に近いほどモデルの当てはまりが良いことを示します。
          </p>
        </>
      )}
    </div>
  );
}
