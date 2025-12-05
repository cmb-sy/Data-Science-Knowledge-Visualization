"""
FastAPI メインアプリケーション
確率分布可視化システムのバックエンドAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from api.routes import router
from utils.logger import setup_logger
from config import get_settings
import time

# 設定の読み込み
settings = get_settings()

# ロガーのセットアップ
logger = setup_logger()

# FastAPIアプリケーションの作成
app = FastAPI(
    title=settings.app_name,
    description="確率分布のパラメータを受け取り、グラフデータを返すAPI",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ミドルウェアの追加

# GZip圧縮（レスポンスサイズを削減）
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORSミドルウェア（フロントエンドからのリクエストを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# リクエスト処理時間のロギング
@app.middleware("http")
async def add_process_time_header(request, call_next):
    """各リクエストの処理時間を計測"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    return response


# ルーターの登録
app.include_router(router, prefix="/api/v1", tags=["distributions"])


@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    logger.info("Starting Probability Distribution Visualization API")
    logger.info("API Documentation available at: http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時の処理"""
    logger.info("Shutting down Probability Distribution Visualization API")


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {"message": "確率分布可視化API", "docs": "/docs", "health": "/api/v1/health"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower(),
    )
