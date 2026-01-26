"""
線形回帰モデル - フロントエンド連携用

このファイルはフロントエンドとの連携に必要な機能を集約しています:
- get_info(): モデル情報の取得
- calculate(): データ生成とフィッティング
"""

import numpy as np
from ...distributions.base import (
    DistributionInfo,
    DistributionType,
    CategoryType,
    DistributionParameter,
    DistributionData,
)
from ...evaluation_indicators.metrics import evaluate_regression
from .model import LinearRegression


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


def calculate(
    slope: float,
    noise_std: float,
    pattern_id: float,
    intercept: float = 0.0,
    num_points: int = 100,
) -> DistributionData:
    """
    単回帰データの生成とフィッティング

    Args:
        slope: 真の傾き
        noise_std: ノイズの標準偏差
        pattern_id: データパターン（0:線形, 1:二次関数, 2:外れ値）
        intercept: 切片（使用されない、互換性のため）
        num_points: データポイント数

    Returns:
        DistributionData: 計算結果
    """
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

    # モデルのフィッティング（解析解を使用 - フロントエンド連携用）
    model = LinearRegression()
    model.fit(x, y_observed, method="analytical")
    y_fitted = model.predict(x)

    # 評価指標の計算
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


__all__ = [
    "get_info",
    "calculate",
]
