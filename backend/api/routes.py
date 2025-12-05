"""
FastAPI ルート定義
確率分布の計算とデータ提供API
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List
from pydantic import BaseModel

from models.distributions import (
    DistributionType,
    DistributionInfo,
    DistributionData,
    get_available_distributions,
    get_distribution_info,
    calculate_distribution
)
from utils.logger import setup_logger

logger = setup_logger()
router = APIRouter()


class CalculateRequest(BaseModel):
    """分布計算リクエスト"""
    distribution_type: DistributionType
    parameters: Dict[str, float]
    num_points: int = 1000


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
    """
    logger.info(
        f"Calculating distribution: {request.distribution_type} "
        f"with parameters: {request.parameters}"
    )
    
    try:
        data = calculate_distribution(
            dist_type=request.distribution_type,
            parameters=request.parameters,
            num_points=request.num_points
        )
        logger.info("Calculation successful")
        return data
    except ValueError as e:
        logger.error(f"Calculation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health")
async def health_check():
    """
    ヘルスチェックエンドポイント
    
    Returns:
        dict: ステータス情報
    """
    return {"status": "healthy", "service": "probability-distribution-api"}

