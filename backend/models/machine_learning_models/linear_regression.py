"""
単回帰分析（スクラッチ実装）
最小二乗法による線形回帰モデル
"""

import numpy as np
from ..base import (
    DistributionInfo,
    DistributionType,
    CategoryType,
    DistributionParameter,
    DistributionData,
)
from .metrics import evaluate_regression


class LinearRegression:
    """
    単回帰モデル（スクラッチ実装）

    最小二乗法を用いて y = ax + b の係数を推定する
    """

    def __init__(self):
        self.slope: float = 0.0
        self.intercept: float = 0.0
        self._is_fitted: bool = False

    def fit(self, x: np.ndarray, y: np.ndarray) -> "LinearRegression":
        """
        最小二乗法で回帰係数を推定

        傾き: a = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²
        切片: b = ȳ - a * x̄

        Args:
            x: 説明変数
            y: 目的変数

        Returns:
            self（メソッドチェーン用）
        """
        n = len(x)
        if n < 2:
            self.slope = 0.0
            self.intercept = 0.0
            self._is_fitted = True
            return self

        x_mean = np.mean(x)
        y_mean = np.mean(y)

        # 傾きの計算: Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²
        numerator = np.sum((x - x_mean) * (y - y_mean))
        denominator = np.sum((x - x_mean) ** 2)

        if denominator == 0:
            self.slope = 0.0
        else:
            self.slope = numerator / denominator

        # 切片の計算: ȳ - a * x̄
        self.intercept = y_mean - self.slope * x_mean
        self._is_fitted = True

        return self

    def predict(self, x: np.ndarray) -> np.ndarray:
        """
        予測値を計算

        Args:
            x: 説明変数

        Returns:
            予測値 (y = ax + b)
        """
        if not self._is_fitted:
            raise RuntimeError(
                "モデルがフィットされていません。fit()を先に呼び出してください。"
            )
        return self.slope * x + self.intercept

    @staticmethod
    def get_info() -> DistributionInfo:
        """単回帰モデルの情報を取得"""
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
        intercept: float = 0.0,
        num_points: int = 100,
    ) -> DistributionData:
        """単回帰データの生成とフィッティング"""
        n_samples = num_points
        pattern_id = int(pattern_id)
        intercept = 0.0  # 切片は0に固定

        # データ生成
        np.random.seed(42)
        x = np.random.uniform(-5, 5, n_samples)
        x.sort()

        noise = np.random.normal(0, noise_std, n_samples)

        # パターン別のデータ生成
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

        # モデルのフィッティング（スクラッチ実装を使用）
        model = LinearRegression()
        model.fit(x, y_observed)
        y_fitted = model.predict(x)

        # 評価指標の計算（別ファイルの関数を使用）
        metrics = evaluate_regression(y_observed, y_fitted)

        return DistributionData(
            x_values=x.tolist(),
            y_true=y_true.tolist(),
            y_observed=y_observed.tolist(),
            y_fitted=y_fitted.tolist(),
            mean=float(np.mean(y_observed)),
            variance=float(np.var(y_observed)),
            std_dev=float(np.std(y_observed)),
            r_squared=metrics.r_squared,
            slope_estimated=float(model.slope),
            intercept_estimated=float(model.intercept),
            rmse=metrics.rmse,
            pdf_values=None,
            cdf_values=None,
        )
