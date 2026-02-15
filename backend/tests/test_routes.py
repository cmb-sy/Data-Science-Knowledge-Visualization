"""
APIルートのテスト
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """GET /api/v1/health が 200 を返すことを確認"""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_list_distributions(client: AsyncClient):
    """GET /api/v1/distributions が uniform と exponential を含むリストを返すことを確認"""
    response = await client.get("/api/v1/distributions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    types = [d["type"] for d in data]
    assert "uniform" in types
    assert "exponential" in types


@pytest.mark.asyncio
async def test_get_distribution_info_uniform(client: AsyncClient):
    """GET /api/v1/distributions/uniform が正しいスキーマを返すことを確認"""
    response = await client.get("/api/v1/distributions/uniform")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "uniform"
    assert "name" in data
    assert "description" in data
    assert "category" in data
    assert "parameters" in data
    assert isinstance(data["parameters"], list)
    assert len(data["parameters"]) >= 1
    # パラメータにはa, bがあるはず
    param_names = [p["name"] for p in data["parameters"]]
    assert "a" in param_names
    assert "b" in param_names


@pytest.mark.asyncio
async def test_get_distribution_info_404(client: AsyncClient):
    """GET /api/v1/distributions/invalid が 422 を返すことを確認（Enumバリデーション）"""
    response = await client.get("/api/v1/distributions/invalid")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_calculate_uniform(client: AsyncClient):
    """POST /api/v1/calculate で一様分布の計算が正しく動作することを確認"""
    payload = {
        "distribution_type": "uniform",
        "parameters": {"a": 0.0, "b": 1.0},
        "num_points": 100,
    }
    response = await client.post("/api/v1/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "x_values" in data
    assert "pdf_values" in data
    assert "cdf_values" in data
    assert len(data["x_values"]) == 100
    assert len(data["pdf_values"]) == 100
    assert len(data["cdf_values"]) == 100


@pytest.mark.asyncio
async def test_calculate_exponential(client: AsyncClient):
    """POST /api/v1/calculate で指数分布の計算が正しく動作することを確認"""
    payload = {
        "distribution_type": "exponential",
        "parameters": {"lambda_": 2.0},
        "num_points": 100,
    }
    response = await client.post("/api/v1/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "x_values" in data
    assert "pdf_values" in data
    assert "cdf_values" in data
    assert len(data["x_values"]) == 100
