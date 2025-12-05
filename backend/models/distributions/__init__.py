"""
確率分布モジュール
各確率分布の実装とレジストリを管理
"""

from typing import Dict, List, Any

# 基底クラスと型定義をインポート
from .base import (
    DistributionType,
    CategoryType,
    DistributionParameter,
    DistributionInfo,
    DistributionData,
)

# 各分布の実装をインポート
from .uniform import UniformDistribution
from .exponential import ExponentialDistribution
from .linear_regression import LinearRegression


# 分布のレジストリ
DISTRIBUTION_REGISTRY: Dict[DistributionType, Any] = {
    DistributionType.UNIFORM: UniformDistribution,
    DistributionType.EXPONENTIAL: ExponentialDistribution,
    DistributionType.LINEAR_REGRESSION: LinearRegression,
}


def get_available_distributions() -> List[DistributionInfo]:
    """利用可能な全ての分布の情報を取得"""
    return [dist_class.get_info() for dist_class in DISTRIBUTION_REGISTRY.values()]


def get_distribution_info(dist_type: DistributionType) -> DistributionInfo:
    """特定の分布の情報を取得"""
    if dist_type not in DISTRIBUTION_REGISTRY:
        raise ValueError(f"Unknown distribution type: {dist_type}")
    return DISTRIBUTION_REGISTRY[dist_type].get_info()


def calculate_distribution(
    dist_type: DistributionType, parameters: Dict[str, float], num_points: int = 1000
) -> DistributionData:
    """
    指定された分布とパラメータでデータを計算

    Args:
        dist_type: 分布の種類
        parameters: パラメータの辞書
        num_points: グラフのデータポイント数

    Returns:
        DistributionData: グラフ描画用のデータ
    """
    if dist_type not in DISTRIBUTION_REGISTRY:
        raise ValueError(f"Unknown distribution type: {dist_type}")

    dist_class = DISTRIBUTION_REGISTRY[dist_type]

    # 一様分布の場合
    if dist_type == DistributionType.UNIFORM:
        return dist_class.calculate(
            a=parameters.get("a", 0.0),
            b=parameters.get("b", 1.0),
            num_points=num_points,
        )

    # 指数分布の場合
    if dist_type == DistributionType.EXPONENTIAL:
        return dist_class.calculate(
            lambda_=parameters.get("lambda_", 1.0),
            num_points=num_points,
        )

    # 単回帰分析の場合
    if dist_type == DistributionType.LINEAR_REGRESSION:
        return dist_class.calculate(
            slope=parameters.get("slope", 1.0),
            intercept=parameters.get("intercept", 0.0),
            noise_std=parameters.get("noise_std", 1.0),
            pattern_id=parameters.get("pattern_id", 0.0),
            num_points=num_points,
        )

    raise NotImplementedError(f"Distribution {dist_type} not implemented")


# 公開API
__all__ = [
    # 型定義
    "DistributionType",
    "CategoryType",
    "DistributionParameter",
    "DistributionInfo",
    "DistributionData",
    # 分布実装
    "UniformDistribution",
    "ExponentialDistribution",
    "LinearRegression",
    # レジストリと関数
    "DISTRIBUTION_REGISTRY",
    "get_available_distributions",
    "get_distribution_info",
    "calculate_distribution",
]
