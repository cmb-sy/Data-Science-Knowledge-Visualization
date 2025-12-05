"""
ロギング設定
"""
import logging
import sys
from datetime import datetime


def setup_logger(name: str = "probability_viz") -> logging.Logger:
    """
    ロガーをセットアップ
    
    Args:
        name: ロガーの名前
        
    Returns:
        logging.Logger: 設定済みのロガー
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # ハンドラが既に存在する場合は追加しない
    if logger.handlers:
        return logger
    
    # コンソールハンドラの作成
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    
    # フォーマッターの作成
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    
    # ハンドラをロガーに追加
    logger.addHandler(handler)
    
    return logger

