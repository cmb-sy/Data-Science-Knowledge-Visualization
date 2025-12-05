"""
確率分布の基底クラスと共通の型定義
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional
from enum import Enum
import numpy as np


class DistributionType(str, Enum):
    """サポートする確率分布の種類"""

    UNIFORM = "uniform"
    EXPONENTIAL = "exponential"
    LINEAR_REGRESSION = "linear_regression"
    # 将来的に追加予定: NORMAL, BINOMIAL, etc.


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
    # 確率分布用
    pdf_values: Optional[List[float]] = Field(
        None, min_length=10, max_length=10000, description="確率密度関数の値"
    )
    cdf_values: Optional[List[float]] = Field(
        None, min_length=10, max_length=10000, description="累積分布関数の値"
    )
    # 回帰分析用
    y_true: Optional[List[float]] = Field(
        None, min_length=10, max_length=10000, description="真の値（生成元の関数）"
    )
    y_observed: Optional[List[float]] = Field(
        None, min_length=10, max_length=10000, description="観測値（散布図用）"
    )
    y_fitted: Optional[List[float]] = Field(
        None, min_length=10, max_length=10000, description="予測値（回帰直線用）"
    )
    
    # 回帰分析の評価指標
    r_squared: Optional[float] = Field(None, description="決定係数 (R^2)")
    slope_estimated: Optional[float] = Field(None, description="推定された傾き")
    intercept_estimated: Optional[float] = Field(None, description="推定された切片")
    rmse: Optional[float] = Field(None, description="二乗平均平方根誤差 (RMSE)")

    mean: float = Field(..., description="平均（回帰の場合はYの平均）")
    variance: float = Field(..., ge=0, description="分散（回帰の場合はYの分散）")
    std_dev: float = Field(..., ge=0, description="標準偏差（回帰の場合はYの標準偏差）")

    @model_validator(mode="after")
    def validate_data_consistency(self) -> "DistributionData":
        """データの整合性を検証"""
        # 確率分布の場合
        if self.pdf_values is not None and self.cdf_values is not None:
            lengths = [len(self.x_values), len(self.pdf_values), len(self.cdf_values)]
            if len(set(lengths)) != 1:
                raise ValueError(
                    f"x_values, pdf_values, cdf_values の長さが一致しません: {lengths}"
                )
        
        # 回帰分析の場合
        if self.y_observed is not None and self.y_fitted is not None:
            lengths = [len(self.x_values), len(self.y_observed), len(self.y_fitted)]
            if len(set(lengths)) != 1:
                raise ValueError(
                    f"x_values, y_observed, y_fitted の長さが一致しません: {lengths}"
                )
                
        return self

    @field_validator("pdf_values", "cdf_values", "y_observed", "y_fitted", "y_true")
    @classmethod
    def validate_no_nan_inf(cls, v: Optional[List[float]]) -> Optional[List[float]]:
        """NaNやInfが含まれていないことを検証"""
        if v is not None and any(np.isnan(val) or np.isinf(val) for val in v):
            raise ValueError("NaNまたはInfが含まれています")
        return v
