"""
線形回帰モデルのクロステスト

3つの実装方法の結果が一致するかを検証:
1. 解析解（公式による計算）
2. 行列計算（正規方程式）
3. 最急降下法（PyTorch）

実行方法:
    cd backend && uv run python -m models.machine_learning_models.linear_regression.cross_test
"""

import numpy as np
from typing import Tuple, List, Optional
from .model import LinearRegression


def generate_test_data(
    n_samples: int = 100,
    true_slope: float = 2.0,
    true_intercept: float = 1.0,
    noise_std: float = 0.5,
    seed: int = 42,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    テスト用データを生成

    Args:
        n_samples: サンプル数
        true_slope: 真の傾き
        true_intercept: 真の切片
        noise_std: ノイズの標準偏差
        seed: 乱数シード

    Returns:
        (x, y): 説明変数と目的変数のタプル
    """
    np.random.seed(seed)
    x = np.random.uniform(-5, 5, n_samples)
    noise = np.random.normal(0, noise_std, n_samples)
    y = true_slope * x + true_intercept + noise
    return x, y


def test_cross_validation(
    x: Optional[np.ndarray] = None,
    y: Optional[np.ndarray] = None,
    tolerance: float = 0.01,
    verbose: bool = True,
) -> bool:
    """
    3つの実装方法のクロステスト

    解析解、行列計算、最急降下法の結果が一致するかを検証

    Args:
        x: 説明変数（Noneの場合は自動生成）
        y: 目的変数（Noneの場合は自動生成）
        tolerance: 許容誤差
        verbose: 詳細な出力を行うか

    Returns:
        全ての実装が一致した場合True
    """
    if x is None or y is None:
        true_slope = 2.0
        true_intercept = 1.0
        x, y = generate_test_data(
            n_samples=200,
            true_slope=true_slope,
            true_intercept=true_intercept,
            noise_std=0.5,
        )
        if verbose:
            print("=" * 60)
            print("線形回帰モデル クロステスト")
            print("=" * 60)
            print(f"\n真のパラメータ: slope={true_slope}, intercept={true_intercept}")
            print(f"データ数: {len(x)}")
            print("-" * 60)
    else:
        if verbose:
            print("=" * 60)
            print("線形回帰モデル クロステスト")
            print("=" * 60)
            print(f"\nデータ数: {len(x)}")
            print("-" * 60)

    # 1. 解析解
    model_analytical = LinearRegression()
    model_analytical.fit(x, y, method="analytical")
    slope_a, intercept_a = model_analytical.get_params()
    if verbose:
        print(f"\n1. 解析解（公式）:")
        print(f"   slope     = {slope_a:.6f}")
        print(f"   intercept = {intercept_a:.6f}")

    # 2. 行列計算
    model_matrix = LinearRegression()
    model_matrix.fit(x, y, method="matrix")
    slope_m, intercept_m = model_matrix.get_params()
    if verbose:
        print(f"\n2. 行列計算（正規方程式）:")
        print(f"   slope     = {slope_m:.6f}")
        print(f"   intercept = {intercept_m:.6f}")

    # 3. 最急降下法（PyTorch）
    model_gd = LinearRegression()
    model_gd.fit(x, y, method="gradient_descent", lr=0.01, epochs=5000)
    slope_g, intercept_g = model_gd.get_params()
    if verbose:
        print(f"\n3. 最急降下法（PyTorch）:")
        print(f"   slope     = {slope_g:.6f}")
        print(f"   intercept = {intercept_g:.6f}")

    # 結果の比較
    if verbose:
        print("\n" + "=" * 60)
        print("結果の比較")
        print("=" * 60)

    # 解析解 vs 行列計算
    diff_am_slope = abs(slope_a - slope_m)
    diff_am_intercept = abs(intercept_a - intercept_m)
    match_am = diff_am_slope < tolerance and diff_am_intercept < tolerance

    if verbose:
        print(f"\n解析解 vs 行列計算:")
        print(
            f"   slope差     = {diff_am_slope:.8f} "
            f"{'✓' if diff_am_slope < tolerance else '✗'}"
        )
        print(
            f"   intercept差 = {diff_am_intercept:.8f} "
            f"{'✓' if diff_am_intercept < tolerance else '✗'}"
        )
        print(f"   結果: {'一致 ✓' if match_am else '不一致 ✗'}")

    # 解析解 vs 最急降下法
    diff_ag_slope = abs(slope_a - slope_g)
    diff_ag_intercept = abs(intercept_a - intercept_g)
    match_ag = diff_ag_slope < tolerance and diff_ag_intercept < tolerance

    if verbose:
        print(f"\n解析解 vs 最急降下法:")
        print(
            f"   slope差     = {diff_ag_slope:.8f} "
            f"{'✓' if diff_ag_slope < tolerance else '✗'}"
        )
        print(
            f"   intercept差 = {diff_ag_intercept:.8f} "
            f"{'✓' if diff_ag_intercept < tolerance else '✗'}"
        )
        print(f"   結果: {'一致 ✓' if match_ag else '不一致 ✗'}")

    # 行列計算 vs 最急降下法
    diff_mg_slope = abs(slope_m - slope_g)
    diff_mg_intercept = abs(intercept_m - intercept_g)
    match_mg = diff_mg_slope < tolerance and diff_mg_intercept < tolerance

    if verbose:
        print(f"\n行列計算 vs 最急降下法:")
        print(
            f"   slope差     = {diff_mg_slope:.8f} "
            f"{'✓' if diff_mg_slope < tolerance else '✗'}"
        )
        print(
            f"   intercept差 = {diff_mg_intercept:.8f} "
            f"{'✓' if diff_mg_intercept < tolerance else '✗'}"
        )
        print(f"   結果: {'一致 ✓' if match_mg else '不一致 ✗'}")

    # 総合結果
    all_match = match_am and match_ag and match_mg
    if verbose:
        print("\n" + "=" * 60)
        if all_match:
            print("総合結果: 全ての実装が一致しました ✓")
        else:
            print("総合結果: 一部の実装で差異があります ✗")
        print("=" * 60)

    return all_match


def test_with_different_data(
    test_cases: Optional[List[dict]] = None,
    tolerance: float = 0.05,
    verbose: bool = True,
) -> bool:
    """
    異なるデータセットでのテスト

    Args:
        test_cases: テストケースのリスト（Noneの場合はデフォルトケースを使用）
        tolerance: 許容誤差
        verbose: 詳細な出力を行うか

    Returns:
        全てのテストがパスした場合True
    """
    if test_cases is None:
        test_cases = [
            {
                "n_samples": 50,
                "true_slope": 1.5,
                "true_intercept": -2.0,
                "noise_std": 0.3,
            },
            {
                "n_samples": 500,
                "true_slope": -3.0,
                "true_intercept": 5.0,
                "noise_std": 1.0,
            },
            {
                "n_samples": 1000,
                "true_slope": 0.5,
                "true_intercept": 0.0,
                "noise_std": 2.0,
            },
        ]

    if verbose:
        print("\n\n" + "=" * 60)
        print("異なるデータセットでのテスト")
        print("=" * 60)

    all_passed = True

    for i, case in enumerate(test_cases):
        if verbose:
            print(f"\nテストケース {i+1}:")
            print(
                f"   真のパラメータ: slope={case['true_slope']}, "
                f"intercept={case['true_intercept']}"
            )
            print(f"   データ数: {case['n_samples']}, ノイズ: {case['noise_std']}")

        x, y = generate_test_data(**case)

        # 3つの方法でフィット
        model_a = LinearRegression()
        model_a.fit(x, y, method="analytical")

        model_m = LinearRegression()
        model_m.fit(x, y, method="matrix")

        model_g = LinearRegression()
        model_g.fit(x, y, method="gradient_descent", lr=0.01, epochs=5000)

        # 結果比較
        slopes = [model_a.slope, model_m.slope, model_g.slope]
        intercepts = [model_a.intercept, model_m.intercept, model_g.intercept]

        slope_diff = max(slopes) - min(slopes)
        intercept_diff = max(intercepts) - min(intercepts)

        passed = slope_diff < tolerance and intercept_diff < tolerance
        all_passed = all_passed and passed

        if verbose:
            print(
                f"   slope範囲: {min(slopes):.4f} ~ {max(slopes):.4f} "
                f"(差: {slope_diff:.6f})"
            )
            print(
                f"   intercept範囲: {min(intercepts):.4f} ~ {max(intercepts):.4f} "
                f"(差: {intercept_diff:.6f})"
            )
            print(f"   結果: {'PASS ✓' if passed else 'FAIL ✗'}")

    if verbose:
        print("\n" + "=" * 60)
        print(f"全テスト結果: {'PASS ✓' if all_passed else 'FAIL ✗'}")
        print("=" * 60)

    return all_passed


def run_all_tests(verbose: bool = True) -> bool:
    """
    全てのクロステストを実行

    Args:
        verbose: 詳細な出力を行うか

    Returns:
        全てのテストがパスした場合True
    """
    test1_passed = test_cross_validation(verbose=verbose)
    test2_passed = test_with_different_data(verbose=verbose)

    if verbose:
        print("\n\n" + "=" * 60)
        print("最終結果")
        print("=" * 60)
        if test1_passed and test2_passed:
            print("全てのテストがパスしました ✓")
        else:
            print("一部のテストが失敗しました ✗")
        print("=" * 60)

    return test1_passed and test2_passed


if __name__ == "__main__":
    print("線形回帰モデルのクロステストを実行します...\n")
    success = run_all_tests(verbose=True)

    if success:
        print("\n✓ 全ての実装方法が一致することを確認しました")
        exit(0)
    else:
        print("\n✗ 一部の実装方法で差異が見つかりました")
        exit(1)
