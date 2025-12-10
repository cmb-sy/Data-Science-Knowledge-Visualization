import numpy as np
from typing import Dict
from ..base import (
    DistributionInfo,
    DistributionType,
    CategoryType,
    DistributionParameter,
    DistributionData,
)


class LinearRegression:

    @staticmethod
    def get_info() -> DistributionInfo:
        """
        単回帰モデルの情報を取得
        """
        return DistributionInfo(
            type=DistributionType.LINEAR_REGRESSION,
            name="単回帰分析",
            description="単回帰分析のシミュレーション。パラメータを変更して、回帰直線がどのように変化するか確認できます。",
            category=CategoryType.ML_REGRESSION,
            tags=["回帰分析", "機械学習", "統計"],
            formula_pdf=r"y = ax + b + \epsilon, \quad \epsilon \sim N(0, \sigma^2)",
            parameters=[
                DistributionParameter(
                    name="slope",
                    label="傾き (a)",
                    description="真の回帰直線の傾き（データ生成用）",
                    default_value=1.0,
                    min_value=-5.0,
                    max_value=5.0,
                    step=0.1,
                ),
                # intercept は固定のため削除
                DistributionParameter(
                    name="noise_std",
                    label="ノイズ (σ)",
                    description="観測データに含まれるノイズの標準偏差",
                    default_value=1.0,
                    min_value=0.1,
                    max_value=5.0,
                    step=0.1,
                ),
                DistributionParameter(
                    name="pattern_id",
                    label="データタイプ",
                    description="0:線形, 1:二次関数, 2:外れ値",
                    default_value=0.0,
                    min_value=0.0,
                    max_value=2.0,
                    step=1.0,
                ),
            ],
        )

    @staticmethod
    def calculate(
        slope: float,
        noise_std: float,
        pattern_id: float,
        intercept: float = 0.0,  # API互換性のため残すが、パラメータからは渡されない
        num_points: int = 100,
    ) -> DistributionData:
        """
        単回帰データの生成とフィッティング
        """
        n_samples = num_points
        pattern_id = int(pattern_id)

        # 切片は0に固定（パラメータから削除されたため）
        # もしAPIから渡されても、明示的に上書きするか、デフォルト値を使う
        # ここではパラメータ定義にないので request.parameters には含まれないはず。
        # calculate_distribution で .get("intercept", 0.0) しているので、それが渡ってくる。
        # ユーザー要望により操作不要とのことなので、常に0でも良いが、
        # 互換性のため引数は受け取りつつ、意図的に無視するか、デフォルト値を使う。
        # 今回は "切片の操作はいらない" なので、常に0とみなすのが自然。
        intercept = 0.0

        # Xデータの生成 (-5 から 5 の範囲でランダム)
        np.random.seed(42)  # 再現性のためシード固定
        x = np.random.uniform(-5, 5, n_samples)
        x.sort()

        # ノイズ生成
        noise = np.random.normal(0, noise_std, n_samples)

        # Yデータの生成
        if pattern_id == 0:  # 線形
            y_true = slope * x + intercept
            y_observed = y_true + noise
        elif pattern_id == 1:  # 二次関数的
            y_true = slope * x + intercept + 0.5 * (x**2)
            y_observed = y_true + noise
        elif pattern_id == 2:  # 外れ値あり
            y_true = slope * x + intercept
            y_observed = y_true + noise
            n_outliers = int(n_samples * 0.1)
            if n_outliers > 0:
                outlier_indices = np.random.choice(n_samples, n_outliers, replace=False)
                y_observed[outlier_indices] += np.random.choice([-1, 1], n_outliers) * (
                    noise_std * 5 + 5
                )
        else:
            y_true = slope * x + intercept
            y_observed = y_true + noise

        # 単回帰分析 (最小二乗法)
        r_squared = 0.0
        slope_hat = 0.0
        intercept_hat = 0.0
        rmse = 0.0

        if n_samples > 1:
            # 係数の推定
            slope_hat, intercept_hat = np.polyfit(x, y_observed, 1)
            y_fitted = slope_hat * x + intercept_hat

            # 決定係数 (R^2) の計算
            y_mean = np.mean(y_observed)
            ss_tot = np.sum((y_observed - y_mean) ** 2)
            ss_res = np.sum((y_observed - y_fitted) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0.0

            # RMSE の計算
            rmse = np.sqrt(np.mean((y_observed - y_fitted) ** 2))
        else:
            y_fitted = np.zeros_like(x)

        mean_y = float(np.mean(y_observed))
        var_y = float(np.var(y_observed))
        std_y = float(np.std(y_observed))

        return DistributionData(
            x_values=x.tolist(),
            y_true=y_true.tolist(),
            y_observed=y_observed.tolist(),
            y_fitted=y_fitted.tolist(),
            mean=mean_y,
            variance=var_y,
            std_dev=std_y,
            # 評価指標
            r_squared=float(r_squared),
            slope_estimated=float(slope_hat),
            intercept_estimated=float(intercept_hat),
            rmse=float(rmse),
            # 互換性のため
            pdf_values=None,
            cdf_values=None,
        )
