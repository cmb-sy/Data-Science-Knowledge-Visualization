"""
テスト用の共通フィクスチャ
"""

import sys
from pathlib import Path

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# backendディレクトリをsys.pathに追加（モジュール解決のため）
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app


@pytest_asyncio.fixture
async def client():
    """FastAPIアプリケーションのテストクライアントを生成"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
