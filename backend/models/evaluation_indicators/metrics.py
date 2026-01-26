"""
機械学習モデルの評価指標
様々なモデルから共通で呼び出せる評価関数を定義
"""

import numpy as np
from typing import NamedTuple


class RegressionMetrics(NamedTuple):
    """回帰モデルの評価指標"""

    r_squared: float  # 決定係数
    rmse: float  # 二乗平均平方根誤差
    mse: float  # 平均二乗誤差
    mae: float  # 平均絶対誤差


def calculate_r_squared(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    決定係数 (R²) を計算

    R² = 1 - SS_res / SS_tot

    Args:
        y_true: 実測値
        y_pred: 予測値

    Returns:
        決定係数（0〜1の値、1に近いほど良い適合）
    """
    y_mean = np.mean(y_true)
    ss_tot = np.sum((y_true - y_mean) ** 2)
    ss_res = np.sum((y_true - y_pred) ** 2)

    if ss_tot == 0:
        return 0.0

    return float(1 - (ss_res / ss_tot))


def calculate_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    二乗平均平方根誤差 (RMSE) を計算

    RMSE = √(Σ(y_true - y_pred)² / n)

    Args:
        y_true: 実測値
        y_pred: 予測値

    Returns:
        RMSE（小さいほど良い）
    """
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def calculate_mse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    平均二乗誤差 (MSE) を計算

    MSE = Σ(y_true - y_pred)² / n

    Args:
        y_true: 実測値
        y_pred: 予測値

    Returns:
        MSE（小さいほど良い）
    """
    return float(np.mean((y_true - y_pred) ** 2))


def calculate_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    平均絶対誤差 (MAE) を計算

    MAE = Σ|y_true - y_pred| / n

    Args:
        y_true: 実測値
        y_pred: 予測値

    Returns:
        MAE（小さいほど良い）
    """
    return float(np.mean(np.abs(y_true - y_pred)))


def evaluate_regression(y_true: np.ndarray, y_pred: np.ndarray) -> RegressionMetrics:
    """
    回帰モデルの評価指標をまとめて計算

    Args:
        y_true: 実測値
        y_pred: 予測値

    Returns:
        RegressionMetrics: 各種評価指標を含むNamedTuple
    """
    return RegressionMetrics(
        r_squared=calculate_r_squared(y_true, y_pred),
        rmse=calculate_rmse(y_true, y_pred),
        mse=calculate_mse(y_true, y_pred),
        mae=calculate_mae(y_true, y_pred),
    )
