"""
設定管理
環境変数や定数を一元管理
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """アプリケーション設定"""
    
    # アプリケーション情報
    app_name: str = "確率分布可視化API"
    app_version: str = "1.0.0"
    
    # サーバー設定
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS設定
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # ログレベル
    log_level: str = "INFO"
    
    # 計算設定
    default_num_points: int = 1000
    max_num_points: int = 10000
    
    # キャッシュ設定
    enable_cache: bool = True
    cache_ttl: int = 300  # 5分
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """設定のシングルトンインスタンスを取得"""
    return Settings()

