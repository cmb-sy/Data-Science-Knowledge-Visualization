import torch
import numpy as np

from typing import Literal, Tuple

class LinearRegression:

    def __init__(self):
        self.slope: float = 0.0
        self.intercept: float = 0.0
        self._is_fitted: bool = False
        self._method: str = ""

    def fit(
        self,
        x: np.ndarray,
        y: np.ndarray,
        method: Literal["analytical", "matrix", "gradient_descent"] = "analytical",
        lr: float = 0.01,
        epochs: int = 1000,
    ) -> "LinearRegression":
        self._method = method

        if len(x) < 2:
            self.slope = 0.0
            self.intercept = 0.0
            self._is_fitted = True
            return self

        if method == "analytical":
            self._fit_analytical(x, y)
        elif method == "matrix":
            self._fit_matrix(x, y)
        elif method == "gradient_descent":
            self._fit_gradient_descent(x, y, lr, epochs)
        else:
            raise ValueError(f"Unknown method: {method}")

        self._is_fitted = True
        return self

    def _fit_analytical(self, x: np.ndarray, y: np.ndarray) -> None:
        """
        解析解（公式）による推定

        傾き: a = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²
        切片: b = ȳ - a * x̄
        """
        x_mean = np.mean(x)
        y_mean = np.mean(y)

        numerator = np.sum((x - x_mean) * (y - y_mean))
        denominator = np.sum((x - x_mean) ** 2)

        if denominator == 0:
            self.slope = 0.0
        else:
            self.slope = numerator / denominator

        self.intercept = y_mean - self.slope * x_mean

    def _fit_matrix(self, x: np.ndarray, y: np.ndarray) -> None:
        """
        行列計算（正規方程式）による推定

        正規方程式: θ = (X^T X)^(-1) X^T y
        ここで X = [[x₁, 1], [x₂, 1], ...] （デザイン行列）
        θ = [slope, intercept]^T
        """
        n = len(x)
        # デザイン行列: [[x₁, 1], [x₂, 1], ...]
        X = np.column_stack([x, np.ones(n)])

        # 正規方程式: θ = (X^T X)^(-1) X^T y
        XtX = X.T @ X
        Xty = X.T @ y

        # 逆行列を計算
        try:
            theta = np.linalg.inv(XtX) @ Xty
        except np.linalg.LinAlgError:
            # 特異行列の場合は疑似逆行列を使用
            theta = np.linalg.pinv(XtX) @ Xty

        self.slope = float(theta[0])
        self.intercept = float(theta[1])

    def _fit_gradient_descent(
        self, x: np.ndarray, y: np.ndarray, lr: float, epochs: int
    ) -> None:
        """
        最急降下法（PyTorch）による推定

        損失関数: L = (1/n) * Σ(y - (ax + b))²
        勾配降下: a = a - lr * ∂L/∂a, b = b - lr * ∂L/∂b
        """
        # NumPy配列をPyTorchテンソルに変換
        x_tensor = torch.tensor(x, dtype=torch.float32)
        y_tensor = torch.tensor(y, dtype=torch.float32)

        # パラメータを初期化（勾配計算を有効化）
        slope = torch.tensor(0.0, requires_grad=True)
        intercept = torch.tensor(0.0, requires_grad=True)

        # 最急降下法
        for _ in range(epochs):
            # 予測値
            y_pred = slope * x_tensor + intercept

            # 損失関数（平均二乗誤差）
            loss = torch.mean((y_tensor - y_pred) ** 2)

            # 勾配計算
            loss.backward()

            # パラメータ更新（勾配降下）
            with torch.no_grad():
                slope -= lr * slope.grad
                intercept -= lr * intercept.grad

                # 勾配をリセット
                slope.grad.zero_()
                intercept.grad.zero_()

        self.slope = float(slope.item())
        self.intercept = float(intercept.item())

    def predict(self, x: np.ndarray) -> np.ndarray:
        """
        予測値を計算

        Args:
            x: 説明変数

        Returns:
            予測値 (y = ax + b)
        """
        if not self._is_fitted:
            raise RuntimeError(
                "モデルがフィットされていません。fit()を先に呼び出してください。"
            )
        return self.slope * x + self.intercept

    def get_params(self) -> Tuple[float, float]:
        """パラメータを取得"""
        return self.slope, self.intercept
