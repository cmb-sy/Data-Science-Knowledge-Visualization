"""
FastAPI ルート定義
確率分布の計算とデータ提供API
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List
from pydantic import BaseModel, Field, field_validator

from models.distributions import (
    DistributionType,
    DistributionInfo,
    DistributionData,
    get_available_distributions,
    get_distribution_info,
    calculate_distribution,
)
from utils.logger import setup_logger

logger = setup_logger()
router = APIRouter()


class CalculateRequest(BaseModel):
    """分布計算リクエスト"""

    distribution_type: DistributionType = Field(..., description="分布の種類")
    parameters: Dict[str, float] = Field(
        ..., min_length=1, max_length=20, description="パラメータの辞書"
    )
    num_points: int = Field(
        default=1000,
        ge=10,
        le=10000,
        description="グラフのデータポイント数（10〜10000）",
    )

    @field_validator("parameters")
    @classmethod
    def validate_parameters(cls, v: Dict[str, float]) -> Dict[str, float]:
        """パラメータの値が有効な数値であることを検証"""
        for key, value in v.items():
            if not isinstance(value, (int, float)):
                raise ValueError(f"パラメータ {key} の値が数値ではありません: {value}")
            # NaNやInfをチェック
            import math

            if math.isnan(value) or math.isinf(value):
                raise ValueError(f"パラメータ {key} の値が無効です（NaN/Inf）: {value}")
        return v


@router.get("/distributions", response_model=List[DistributionInfo])
async def list_distributions():
    """
    利用可能な全ての確率分布のリストを取得

    Returns:
        List[DistributionInfo]: 確率分布の情報リスト
    """
    logger.info("Fetching available distributions")
    return get_available_distributions()


@router.get("/distributions/{dist_type}", response_model=DistributionInfo)
async def get_distribution(dist_type: DistributionType):
    """
    特定の確率分布の詳細情報を取得

    Args:
        dist_type: 分布の種類

    Returns:
        DistributionInfo: 確率分布の詳細情報
    """
    logger.info(f"Fetching distribution info for: {dist_type}")
    try:
        return get_distribution_info(dist_type)
    except ValueError as e:
        logger.error(f"Distribution not found: {dist_type}")
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/calculate", response_model=DistributionData)
async def calculate(request: CalculateRequest):
    """
    指定されたパラメータで確率分布を計算

    Args:
        request: 計算リクエスト（分布タイプ、パラメータ）

    Returns:
        DistributionData: グラフ描画用のデータ

    Raises:
        HTTPException: バリデーションエラーまたは計算エラー
    """
    logger.info(
        f"Calculating distribution: {request.distribution_type} "
        f"with parameters: {request.parameters}, "
        f"num_points: {request.num_points}"
    )

    try:
        # パラメータのバリデーション（分布固有のチェック）
        validate_distribution_parameters(request.distribution_type, request.parameters)

        data = calculate_distribution(
            dist_type=request.distribution_type,
            parameters=request.parameters,
            num_points=request.num_points,
        )
        logger.info("Calculation successful")
        return data
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


def validate_distribution_parameters(
    dist_type: DistributionType, parameters: Dict[str, float]
) -> None:
    """
    分布固有のパラメータバリデーション

    Args:
        dist_type: 分布の種類
        parameters: パラメータの辞書

    Raises:
        ValueError: パラメータが無効な場合
    """
    # 分布情報を取得
    dist_info = get_distribution_info(dist_type)

    # 必要なパラメータが全て存在するか確認
    required_params = {p.name for p in dist_info.parameters}
    provided_params = set(parameters.keys())

    missing = required_params - provided_params
    if missing:
        raise ValueError(f"必須パラメータが不足しています: {missing}")

    extra = provided_params - required_params
    if extra:
        raise ValueError(f"不要なパラメータが含まれています: {extra}")

    # 各パラメータの範囲をチェック
    for param_def in dist_info.parameters:
        value = parameters[param_def.name]
        if not (param_def.min_value <= value <= param_def.max_value):
            raise ValueError(
                f"パラメータ {param_def.name} の値 {value} が範囲外です "
                f"（{param_def.min_value} 〜 {param_def.max_value}）"
            )


@router.get("/health")
async def health_check():
    """
    ヘルスチェックエンドポイント

    Returns:
        dict: ステータス情報
    """
    return {"status": "healthy", "service": "probability-distribution-api"}
