"""
確率分布モデルの数学的性質のテスト
"""

import sys
from pathlib import Path

import numpy as np
import pytest

# backendディレクトリをsys.pathに追加
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.distributions.uniform import UniformDistribution
from models.distributions.exponential import ExponentialDistribution


class TestUniformDistribution:
    """一様分布のテスト"""

    def test_uniform_pdf_integrates_to_one(self):
        """一様分布のPDFの面積が1に近似することを台形公式で検証"""
        result = UniformDistribution.calculate(a=0.0, b=1.0, num_points=5000)
        x = np.array(result.x_values)
        pdf = np.array(result.pdf_values)
        area = np.trapz(pdf, x)
        assert abs(area - 1.0) < 0.01, f"PDF area = {area}, expected ~1.0"

    def test_uniform_cdf_range(self):
        """CDFが0から1の範囲であることを検証"""
        result = UniformDistribution.calculate(a=0.0, b=1.0, num_points=1000)
        cdf = np.array(result.cdf_values)
        assert cdf.min() >= -1e-10, f"CDF min = {cdf.min()}, expected >= 0"
        assert cdf.max() <= 1.0 + 1e-10, f"CDF max = {cdf.max()}, expected <= 1"
        # CDFの最初は0付近、最後は1付近
        assert cdf[0] < 0.01
        assert cdf[-1] > 0.99

    def test_uniform_mean_variance(self):
        """平均と分散が理論値と一致することを検証"""
        a, b = 2.0, 5.0
        result = UniformDistribution.calculate(a=a, b=b, num_points=1000)

        expected_mean = (a + b) / 2.0
        expected_variance = ((b - a) ** 2) / 12.0

        assert abs(result.mean - expected_mean) < 1e-10, (
            f"mean = {result.mean}, expected {expected_mean}"
        )
        assert abs(result.variance - expected_variance) < 1e-10, (
            f"variance = {result.variance}, expected {expected_variance}"
        )


class TestExponentialDistribution:
    """指数分布のテスト"""

    def test_exponential_pdf_integrates_to_one(self):
        """指数分布のPDFの面積が1に近似することを台形公式で検証"""
        result = ExponentialDistribution.calculate(lambda_=1.0, num_points=5000)
        x = np.array(result.x_values)
        pdf = np.array(result.pdf_values)
        area = np.trapz(pdf, x)
        assert abs(area - 1.0) < 0.01, f"PDF area = {area}, expected ~1.0"

    def test_exponential_mean_variance(self):
        """平均=1/lambda, 分散=1/lambda^2 であることを検証"""
        lambda_ = 2.5
        result = ExponentialDistribution.calculate(lambda_=lambda_, num_points=1000)

        expected_mean = 1.0 / lambda_
        expected_variance = 1.0 / (lambda_ ** 2)

        assert abs(result.mean - expected_mean) < 1e-10, (
            f"mean = {result.mean}, expected {expected_mean}"
        )
        assert abs(result.variance - expected_variance) < 1e-10, (
            f"variance = {result.variance}, expected {expected_variance}"
        )
