"""
確率分布のモデル定義
各確率分布のパラメータ、数式、説明を管理
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
import numpy as np
from scipy import stats


class DistributionType(str, Enum):
    """サポートする確率分布の種類"""
    UNIFORM = "uniform"
    # 将来的に追加予定: NORMAL, EXPONENTIAL, BINOMIAL, etc.


class DistributionParameter(BaseModel):
    """分布のパラメータ定義"""
    name: str
    label: str  # 表示用のラベル（日本語）
    description: str  # パラメータの説明
    default_value: float
    min_value: float
    max_value: float
    step: float  # スライダーのステップ幅


class DistributionInfo(BaseModel):
    """確率分布の情報"""
    type: DistributionType
    name: str  # 表示名（日本語）
    description: str  # 分布の説明
    formula_pdf: str  # 確率密度関数の数式（LaTeX形式）
    formula_cdf: Optional[str] = None  # 累積分布関数の数式（LaTeX形式）
    parameters: List[DistributionParameter]
    
    class Config:
        use_enum_values = True


class DistributionData(BaseModel):
    """グラフ描画用のデータ"""
    x_values: List[float]
    pdf_values: List[float]  # 確率密度関数の値
    cdf_values: List[float]  # 累積分布関数の値
    mean: float
    variance: float
    std_dev: float


class UniformDistribution:
    """一様分布の実装"""
    
    @staticmethod
    def get_info() -> DistributionInfo:
        """一様分布の情報を取得"""
        return DistributionInfo(
            type=DistributionType.UNIFORM,
            name="一様分布（連続）",
            description="区間 [a, b] 上で等しい確率密度を持つ連続確率分布。全ての値が等確率で出現します。",
            formula_pdf=r"f(x) = \begin{cases} \frac{1}{b-a} & \text{if } a \leq x \leq b \\ 0 & \text{otherwise} \end{cases}",
            formula_cdf=r"F(x) = \begin{cases} 0 & \text{if } x < a \\ \frac{x-a}{b-a} & \text{if } a \leq x \leq b \\ 1 & \text{if } x > b \end{cases}",
            parameters=[
                DistributionParameter(
                    name="a",
                    label="下限 (a)",
                    description="分布の下限値。この値以上で一様に分布します。",
                    default_value=0.0,
                    min_value=-10.0,
                    max_value=10.0,
                    step=0.1
                ),
                DistributionParameter(
                    name="b",
                    label="上限 (b)",
                    description="分布の上限値。この値以下で一様に分布します。",
                    default_value=1.0,
                    min_value=-10.0,
                    max_value=10.0,
                    step=0.1
                )
            ]
        )
    
    @staticmethod
    def calculate(a: float, b: float, num_points: int = 1000) -> DistributionData:
        """
        一様分布のデータを計算
        
        Args:
            a: 下限
            b: 上限
            num_points: グラフのデータポイント数
            
        Returns:
            DistributionData: グラフ描画用のデータ
        """
        if a >= b:
            raise ValueError("下限 (a) は上限 (b) より小さくなければなりません")
        
        # scipy.statsを使用して一様分布を生成
        dist = stats.uniform(loc=a, scale=b-a)
        
        # x軸の値を生成（分布の範囲より少し広めに）
        margin = (b - a) * 0.2
        x = np.linspace(a - margin, b + margin, num_points)
        
        # PDFとCDFを計算
        pdf = dist.pdf(x)
        cdf = dist.cdf(x)
        
        # 統計量を計算
        mean = dist.mean()
        variance = dist.var()
        std_dev = dist.std()
        
        return DistributionData(
            x_values=x.tolist(),
            pdf_values=pdf.tolist(),
            cdf_values=cdf.tolist(),
            mean=float(mean),
            variance=float(variance),
            std_dev=float(std_dev)
        )


# 分布のレジストリ
DISTRIBUTION_REGISTRY: Dict[DistributionType, Any] = {
    DistributionType.UNIFORM: UniformDistribution
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
    dist_type: DistributionType,
    parameters: Dict[str, float],
    num_points: int = 1000
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
            num_points=num_points
        )
    
    raise NotImplementedError(f"Distribution {dist_type} not implemented")

