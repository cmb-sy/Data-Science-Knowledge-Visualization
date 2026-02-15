"""
線形回帰モデルのテスト

cross_test.py のロジックをpytest形式に移植
"""

import sys
from pathlib import Path

import numpy as np
import pytest

# backendディレクトリをsys.pathに追加
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.machine_learning_models.linear_regression.model import LinearRegression


def _generate_test_data(
    n_samples: int = 200,
    true_slope: float = 2.0,
    true_intercept: float = 1.0,
    noise_std: float = 0.5,
    seed: int = 42,
):
    """テスト用データを生成"""
    np.random.seed(seed)
    x = np.random.uniform(-5, 5, n_samples)
    noise = np.random.normal(0, noise_std, n_samples)
    y = true_slope * x + true_intercept + noise
    return x, y


def test_analytical_produces_reasonable_r_squared():
    """解析解でフィットした結果のR^2が妥当な値（> 0.9）であることを確認"""
    x, y = _generate_test_data(n_samples=200, true_slope=2.0, true_intercept=1.0, noise_std=0.5)

    model = LinearRegression()
    model.fit(x, y, method="analytical")
    y_pred = model.predict(x)

    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r_squared = 1.0 - ss_res / ss_tot

    assert r_squared > 0.9, f"R^2 = {r_squared}, expected > 0.9"


def test_three_methods_agree():
    """解析解、行列計算、最急降下法の3手法で傾きと切片が近似一致することを確認"""
    x, y = _generate_test_data(n_samples=200, true_slope=2.0, true_intercept=1.0, noise_std=0.5)
    tolerance = 0.05

    model_a = LinearRegression()
    model_a.fit(x, y, method="analytical")
    slope_a, intercept_a = model_a.get_params()

    model_m = LinearRegression()
    model_m.fit(x, y, method="matrix")
    slope_m, intercept_m = model_m.get_params()

    model_g = LinearRegression()
    model_g.fit(x, y, method="gradient_descent", lr=0.01, epochs=5000)
    slope_g, intercept_g = model_g.get_params()

    # 解析解 vs 行列計算
    assert abs(slope_a - slope_m) < tolerance, (
        f"analytical vs matrix slope: {slope_a} vs {slope_m}"
    )
    assert abs(intercept_a - intercept_m) < tolerance, (
        f"analytical vs matrix intercept: {intercept_a} vs {intercept_m}"
    )

    # 解析解 vs 最急降下法
    assert abs(slope_a - slope_g) < tolerance, (
        f"analytical vs gradient_descent slope: {slope_a} vs {slope_g}"
    )
    assert abs(intercept_a - intercept_g) < tolerance, (
        f"analytical vs gradient_descent intercept: {intercept_a} vs {intercept_g}"
    )

    # 行列計算 vs 最急降下法
    assert abs(slope_m - slope_g) < tolerance, (
        f"matrix vs gradient_descent slope: {slope_m} vs {slope_g}"
    )
    assert abs(intercept_m - intercept_g) < tolerance, (
        f"matrix vs gradient_descent intercept: {intercept_m} vs {intercept_g}"
    )
