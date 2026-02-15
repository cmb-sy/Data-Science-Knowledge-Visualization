# 開発ガイド

## 前提条件

| ツール | バージョン | 備考 |
|---|---|---|
| Node.js | 18+ | フロントエンドのビルド・実行 |
| Python | 3.11 | バックエンドの実行 |
| pnpm | latest | フロントエンドのパッケージ管理 |

---

## クイックスタート

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

サーバーが `http://localhost:8000` で起動する。API ドキュメントは `http://localhost:8000/docs` (Swagger UI) で確認できる。

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

開発サーバーが `http://localhost:3000` で起動する。

### 一括起動

```bash
./start_all.sh
```

`start_all.sh` により Backend と Frontend を同時に起動できる。

---

## 新しい確率分布の追加手順

以下の手順で新しい確率分布を追加する。ここでは「正規分布 (normal)」を例とする。

### Step 1: Backend - 分布クラスの作成

`backend/models/distributions/normal.py` を作成する。

```python
import numpy as np
from scipy import stats
from .base import DistributionInfo, DistributionData, DistributionParameter, DistributionType, CategoryType


class NormalDistribution:
    @staticmethod
    def get_info() -> DistributionInfo:
        return DistributionInfo(
            type=DistributionType.normal,
            name="正規分布",
            category=CategoryType.distribution,
            description="平均と分散で特徴づけられる連続確率分布",
            parameters=[
                DistributionParameter(
                    name="mu", label="平均 (μ)",
                    min=-10, max=10, step=0.1, default=0
                ),
                DistributionParameter(
                    name="sigma", label="標準偏差 (σ)",
                    min=0.1, max=5, step=0.1, default=1
                ),
            ]
        )

    @staticmethod
    def calculate(params: dict, num_points: int) -> DistributionData:
        mu = params["mu"]
        sigma = params["sigma"]
        x = np.linspace(mu - 4 * sigma, mu + 4 * sigma, num_points)
        dist = stats.norm(loc=mu, scale=sigma)
        y = dist.pdf(x)
        cdf = dist.cdf(x)
        return DistributionData(
            x=x.tolist(),
            y=y.tolist(),
            cdf=cdf.tolist(),
            statistics={
                "mean": float(dist.mean()),
                "variance": float(dist.var()),
                "std": float(dist.std()),
            }
        )
```

### Step 2: Backend - DistributionType enum に追加

`backend/models/distributions/base.py` の `DistributionType` enum に新しい値を追加する。

```python
class DistributionType(str, Enum):
    uniform = "uniform"
    exponential = "exponential"
    linear_regression = "linear_regression"
    normal = "normal"  # 追加
```

### Step 3: Backend - DISTRIBUTION_REGISTRY に登録

`backend/models/distributions/__init__.py` の `DISTRIBUTION_REGISTRY` に追加する。

```python
from .normal import NormalDistribution

DISTRIBUTION_REGISTRY = {
    DistributionType.uniform: UniformDistribution,
    DistributionType.exponential: ExponentialDistribution,
    DistributionType.linear_regression: LinearRegressionModel,
    DistributionType.normal: NormalDistribution,  # 追加
}
```

### Step 4: Backend - calculate_distribution に分岐を追加

`backend/models/distributions/__init__.py` の `calculate_distribution()` 関数に、必要であれば分岐を追加する（Registry パターンにより自動解決される場合は不要）。

### Step 5: Frontend - 数式定数の追加

`frontend/lib/constants/formulas.ts` に LaTeX 数式を追加する。

```typescript
normal: {
  pdf: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
  cdf: "F(x) = \\frac{1}{2}\\left[1 + \\text{erf}\\left(\\frac{x-\\mu}{\\sigma\\sqrt{2}}\\right)\\right]",
  mean: "E[X] = \\mu",
  variance: "Var(X) = \\sigma^2",
},
```

### Step 6: Frontend - TypeScript 型定義の更新

`frontend/types/distribution.ts` の `DistributionType` union に追加する。

```typescript
export type DistributionType =
  | "uniform"
  | "exponential"
  | "linear_regression"
  | "normal"; // 追加
```

---

## 新しい機械学習モデルの追加手順

機械学習モデルの追加も基本的に確率分布と同じ手順である。

1. `backend/models/machine_learning_models/` 以下にモデルディレクトリを作成する
2. `model.py` にモデルの実装、`main.py` に API 連携ロジックを記述する
3. `DistributionType` enum と `DISTRIBUTION_REGISTRY` に登録する
4. 評価指標が必要な場合は `evaluation_indicators/metrics.py` に関数を追加する
5. フロントエンドの定数・型定義を更新する

---

## テスト

### Frontend

```bash
cd frontend
pnpm test
```

Vitest によるユニットテストを実行する。

```bash
# カバレッジ付き
pnpm test -- --coverage

# 特定ファイルのみ
pnpm test -- src/lib/api.test.ts
```

### Backend

```bash
cd backend
pytest -v
```

pytest によるユニットテスト・統合テストを実行する。

```bash
# カバレッジ付き
pytest --cov=. --cov-report=term-missing

# 特定ファイルのみ
pytest tests/test_distributions.py -v
```

---

## CI/CD

GitHub Actions により、`main` ブランチへの push および Pull Request で自動テストが実行される。

### ワークフロー概要

```yaml
# .github/workflows/ci.yml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### 実行ステップ

#### Frontend

1. `pnpm install` - 依存パッケージのインストール
2. `pnpm run lint` - ESLint による静的解析
3. `pnpm run tsc` - TypeScript の型チェック
4. `pnpm test` - Vitest によるテスト実行

#### Backend

1. `pip install -r requirements.txt` - 依存パッケージのインストール
2. `pytest -v` - テスト実行

---

## Docker

Docker Compose により、フルスタック環境を一括で起動できる。

```bash
docker-compose up
```

### サービス構成

| サービス | ポート | 説明 |
|---|---|---|
| frontend | 3000 | Next.js 開発サーバー |
| backend | 8000 | FastAPI サーバー |

### 個別ビルド

```bash
# Backend のみ
docker-compose up backend

# Frontend のみ
docker-compose up frontend
```

### リビルド

依存パッケージを更新した場合はイメージの再ビルドが必要。

```bash
docker-compose up --build
```

---

## コーディング規約

### Backend (Python)

- 型ヒントを必須とする
- Pydantic モデルでリクエスト/レスポンスを定義する
- バリデーションは初回実装パスで含める

### Frontend (TypeScript)

- `strict: true` で TypeScript を運用する
- コンポーネントは関数コンポーネントで記述する
- API レスポンスは型定義と照合する
