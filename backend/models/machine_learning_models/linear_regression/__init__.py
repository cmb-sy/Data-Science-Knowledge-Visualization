"""
線形回帰モデルモジュール

単回帰分析（スクラッチ実装）
最小二乗法による線形回帰モデル

3つの実装方法:
1. 解析解（公式による計算）
2. 行列計算（正規方程式）
3. 最急降下法（PyTorch）

ファイル構成:
- model.py: LinearRegressionクラス（3つの実装方法）
- main.py: フロントエンド連携（get_info + calculate）
- cross_test.py: クロステスト（3つの実装方法の検証）
"""

from .model import LinearRegression
from .main import get_info, calculate

__all__ = [
    "LinearRegression",
    "get_info",
    "calculate",
]
