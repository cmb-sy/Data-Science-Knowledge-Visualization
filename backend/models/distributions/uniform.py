import numpy as np

from .base import (
    DistributionType,
    CategoryType,
    DistributionParameter,
    DistributionInfo,
    DistributionData,
)


class UniformDistribution:

    @staticmethod
    def get_info() -> DistributionInfo:
        return DistributionInfo(
            type=DistributionType.UNIFORM,
            name="一様分布",
            description="""一様分布は「ある範囲の中では、どの値もまったく同じ確率で出現する」という性質を持つ分布です。
イメージは「完全に平らな山」です。高さは一定で、どの位置も同じだけ選ばれやすい。

■ 性質
・連続型なら：区間 [a, b] のどこを選ぶ確率も均等
・離散型なら：1〜n のどの整数も同じ確率

■ 実は、一様分布は多くの確率論の基礎に使われる理由があります。
1. 最も何も情報を持たない分布（最大エントロピー分布）
   区間が決まっていて、期待値や分散など制約がなければ「最も無知（＝公平）」な分布は一様分布になります。
2. 「乱数の基準」として世界共通""",
            category=CategoryType.CONTINUOUS,
            tags=["基本", "連続", "一様", "等確率"],
            formula_pdf=r"f(x) = \begin{cases} \frac{1}{b-a} & \text{if } a \leq x \leq b \\ 0 & \text{otherwise} \end{cases}",
            formula_cdf=r"F(x) = \begin{cases} 0 & \text{if } x < a \\ \frac{x-a}{b-a} & \text{if } a \leq x \leq b \\ 1 & \text{if } x > b \end{cases}",
            parameters=[
                DistributionParameter(
                    name="a",
                    label="下限 (a)",
                    description="分布の下限値。この値以上で一様に分布します。",
                    default_value=0.0,
                    min_value=-10.0,
                    max_value=10.0,
                    step=0.1,
                ),
                DistributionParameter(
                    name="b",
                    label="上限 (b)",
                    description="分布の上限値。この値以下で一様に分布します。",
                    default_value=1.0,
                    min_value=-10.0,
                    max_value=10.0,
                    step=0.1,
                ),
            ],
        )

    @staticmethod
    def calculate(a: float, b: float, num_points: int = 1000) -> DistributionData:
        if a >= b:
            raise ValueError("aはbより小さくなければなりません")

        margin = (b - a) * 0.2
        x = np.linspace(a - margin, b + margin, num_points)

        pdf = np.where((x >= a) & (x <= b), 1.0 / (b - a), 0.0)

        cdf = np.clip((x - a) / (b - a), 0.0, 1.0)

        mean = (a + b) / 2.0
        variance = ((b - a) ** 2) / 12.0
        std_dev = np.sqrt(variance)

        return DistributionData(
            x_values=x.tolist(),
            pdf_values=pdf.tolist(),
            cdf_values=cdf.tolist(),
            mean=float(mean),
            variance=float(variance),
            std_dev=float(std_dev),
        )
