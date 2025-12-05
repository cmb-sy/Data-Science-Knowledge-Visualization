"""
確率分布のモデル定義
各確率分布のパラメータ、数式、説明を管理
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Dict, Any, Optional
from enum import Enum
import numpy as np
from scipy import stats


class DistributionType(str, Enum):
    """サポートする確率分布の種類"""

    UNIFORM = "uniform"
    # 将来的に追加予定: NORMAL, EXPONENTIAL, BINOMIAL, etc.


class CategoryType(str, Enum):
    """分布・モデルのカテゴリ"""

    CONTINUOUS = "continuous"  # 連続型確率分布
    DISCRETE = "discrete"  # 離散確率分布
    MULTIVARIATE = "multivariate"  # 多変量分布
    ML_REGRESSION = "ml_regression"  # 機械学習: 回帰
    ML_CLASSIFICATION = "ml_classification"  # 機械学習: 分類
    ML_CLUSTERING = "ml_clustering"  # 機械学習: クラスタリング


class DistributionParameter(BaseModel):
    """分布のパラメータ定義"""

    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="パラメータの識別子（英数字のみ）",
        pattern="^[a-zA-Z_][a-zA-Z0-9_]*$",
    )
    label: str = Field(
        ..., min_length=1, max_length=100, description="表示用のラベル（日本語）"
    )
    description: str = Field(
        ..., min_length=1, max_length=500, description="パラメータの説明"
    )
    default_value: float = Field(..., description="デフォルト値")
    min_value: float = Field(..., description="最小値")
    max_value: float = Field(..., description="最大値")
    step: float = Field(..., gt=0, description="スライダーのステップ幅（正の数）")

    @field_validator("default_value")
    @classmethod
    def validate_default_in_range(cls, v: float, info) -> float:
        """デフォルト値が範囲内にあることを検証"""
        if "min_value" in info.data and "max_value" in info.data:
            min_val = info.data["min_value"]
            max_val = info.data["max_value"]
            if not (min_val <= v <= max_val):
                raise ValueError(
                    f"default_value ({v}) は min_value ({min_val}) と "
                    f"max_value ({max_val}) の間である必要があります"
                )
        return v

    @model_validator(mode="after")
    def validate_min_max(self) -> "DistributionParameter":
        """最小値が最大値より小さいことを検証"""
        if self.min_value >= self.max_value:
            raise ValueError(
                f"min_value ({self.min_value}) は max_value ({self.max_value}) "
                "より小さくなければなりません"
            )
        return self


class DistributionInfo(BaseModel):
    """確率分布の情報"""

    type: DistributionType = Field(..., description="分布の種類")
    name: str = Field(..., min_length=1, max_length=100, description="表示名（日本語）")
    description: str = Field(
        ..., min_length=1, max_length=1000, description="分布の説明"
    )
    category: CategoryType = Field(..., description="カテゴリ（連続型、離散型など）")
    tags: List[str] = Field(
        default_factory=list,
        max_length=20,
        description="タグ（検索・フィルタリング用）",
    )
    formula_pdf: str = Field(
        ..., min_length=1, description="確率密度関数の数式（LaTeX形式）"
    )
    formula_cdf: Optional[str] = Field(
        None, description="累積分布関数の数式（LaTeX形式）"
    )
    parameters: List[DistributionParameter] = Field(
        ..., min_length=1, max_length=20, description="パラメータのリスト"
    )

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """タグの重複を削除し、各タグの長さを検証"""
        if not v:
            return v
        # 重複を削除
        unique_tags = list(dict.fromkeys(v))
        # 各タグの長さを検証
        for tag in unique_tags:
            if not tag or len(tag) > 30:
                raise ValueError(f"タグは1〜30文字である必要があります: {tag}")
        return unique_tags

    @field_validator("parameters")
    @classmethod
    def validate_unique_param_names(
        cls, v: List[DistributionParameter]
    ) -> List[DistributionParameter]:
        """パラメータ名がユニークであることを検証"""
        names = [p.name for p in v]
        if len(names) != len(set(names)):
            duplicates = [name for name in names if names.count(name) > 1]
            raise ValueError(f"パラメータ名が重複しています: {duplicates}")
        return v

    class Config:
        use_enum_values = True


class DistributionData(BaseModel):
    """グラフ描画用のデータ"""

    x_values: List[float] = Field(
        ..., min_length=10, max_length=10000, description="X軸の値"
    )
    pdf_values: List[float] = Field(
        ..., min_length=10, max_length=10000, description="確率密度関数の値"
    )
    cdf_values: List[float] = Field(
        ..., min_length=10, max_length=10000, description="累積分布関数の値"
    )
    mean: float = Field(..., description="平均")
    variance: float = Field(..., ge=0, description="分散（0以上）")
    std_dev: float = Field(..., ge=0, description="標準偏差（0以上）")

    @model_validator(mode="after")
    def validate_array_lengths(self) -> "DistributionData":
        """全ての配列の長さが一致することを検証"""
        lengths = [len(self.x_values), len(self.pdf_values), len(self.cdf_values)]
        if len(set(lengths)) != 1:
            raise ValueError(
                f"x_values, pdf_values, cdf_values の長さが一致しません: {lengths}"
            )
        return self

    @field_validator("pdf_values", "cdf_values")
    @classmethod
    def validate_no_nan_inf(cls, v: List[float]) -> List[float]:
        """NaNやInfが含まれていないことを検証"""
        if any(np.isnan(val) or np.isinf(val) for val in v):
            raise ValueError("NaNまたはInfが含まれています")
        return v


class UniformDistribution:
    """一様分布の実装"""

    @staticmethod
    def get_info() -> DistributionInfo:
        """一様分布の情報を取得"""
        return DistributionInfo(
            type=DistributionType.UNIFORM,
            name="一様分布",
            description="区間 [a, b] 上で等しい確率密度を持つ連続確率分布。全ての値が等確率で出現します。",
            category=CategoryType.CONTINUOUS,
            tags=["基本", "連続", "一様", "等確率"],
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
                    step=0.1,
                ),
                DistributionParameter(
                    name="b",
                    label="上限 (b)",
                    description="分布の上限値。この値以下で一様に分布します。",
                    default_value=1.0,
                    min_value=-10.0,
                    max_value=10.0,
                    step=0.1,
                ),
            ],
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
        dist = stats.uniform(loc=a, scale=b - a)

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
            std_dev=float(std_dev),
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

    raise NotImplementedError(f"Distribution {dist_type} not implemented")
