# 確率分布可視化システム

インタラクティブに確率分布のパラメータを調整し、リアルタイムでグラフが更新される可視化システムです。

## 🎯 機能

- **分布選択**: 一覧から確率分布を選択（現在は一様分布を実装）
- **パラメータ調整**: スライダーでパラメータをリアルタイムに変更
- **グラフ表示**: 確率密度関数（PDF）と累積分布関数（CDF）を同時表示
- **数式表示**: LaTeX 形式で数式を美しく描画
- **統計量表示**: 平均、分散、標準偏差を自動計算・表示
- **拡張性**: 新しい確率分布や機械学習モデルを簡単に追加可能

## 🏗️ 技術スタック

### フロントエンド

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (スタイリング)
- **Recharts** (グラフ描画)
- **KaTeX** (数式レンダリング)
- **Axios** (API 通信)

### バックエンド

- **FastAPI** (高速な Python Web フレームワーク)
- **Pydantic** (データバリデーション)
- **NumPy** (数値計算)
- **SciPy** (統計計算)
- **Uvicorn** (ASGI サーバー)

## 📁 プロジェクト構造

```
.
├── backend/                    # バックエンド（Python + FastAPI）
│   ├── main.py                # FastAPIアプリケーション
│   ├── requirements.txt       # Python依存パッケージ
│   ├── models/
│   │   └── distributions.py   # 確率分布のモデル定義
│   ├── api/
│   │   └── routes.py          # APIエンドポイント
│   └── utils/
│       └── logger.py          # ロギング設定
│
└── frontend/                   # フロントエンド（TypeScript + Next.js）
    ├── app/
    │   ├── layout.tsx         # ルートレイアウト
    │   ├── page.tsx           # メインページ
    │   └── globals.css        # グローバルスタイル
    ├── components/
    │   ├── DistributionSelector.tsx   # 分布選択
    │   ├── ParameterSlider.tsx        # パラメータ調整
    │   ├── DistributionChart.tsx      # グラフ表示
    │   ├── FormulaDisplay.tsx         # 数式表示
    │   └── StatisticsDisplay.tsx      # 統計量表示
    ├── lib/
    │   └── api.ts             # API通信ユーティリティ
    ├── types/
    │   └── distribution.ts    # 型定義
    └── package.json           # Node.js依存パッケージ
```

## 🚀 セットアップと起動方法

### 前提条件

**選択肢 A: Docker を使用（推奨）**

- Docker Desktop または Docker Engine
- Docker Compose

**選択肢 B: ローカル環境で実行**

- Python 3.9 以上
- **uv** (高速な Python パッケージマネージャー)
  - インストール: `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - または: `pip install uv`
- Node.js 18 以上
- npm または yarn

---

### 方法 1: Docker で起動（推奨・最も簡単）

**1 つのコマンドで全て起動:**

```bash
docker-compose up
```

これだけでバックエンドとフロントエンドの両方が起動します！

- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

詳細は [DOCKER.md](DOCKER.md) を参照してください。

---

### 方法 2: 統合スクリプトで起動（ローカル環境）

**1 つのシェルで両方を起動:**

```bash
./start_all.sh
```

ログは `logs/` ディレクトリに保存されます。

---

### 方法 3: 個別に起動（ローカル環境）

#### 1. バックエンドのセットアップ

```bash
# バックエンドディレクトリに移動
cd backend

# uvのインストール確認（未インストールの場合）
# curl -LsSf https://astral.sh/uv/install.sh | sh
# または: pip install uv

# 仮想環境の作成（uv venv）
uv venv

# 依存パッケージのインストール
uv pip install -r requirements.txt

# サーバーの起動（uv runを使用）
uv run python main.py
```

バックエンド API は `http://localhost:8000` で起動します。

- API ドキュメント: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**uv について:**

- `uv` は Rust で書かれた高速な Python パッケージマネージャーです
- `pip` より 10-100 倍高速にパッケージをインストールできます
- 仮想環境の管理も自動化されています

#### 2. フロントエンドのセットアップ

```bash
# 新しいターミナルを開いて、フロントエンドディレクトリに移動
cd frontend

# 依存パッケージのインストール
npm install

# 環境変数ファイルの作成
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# 開発サーバーの起動
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

---

### クイックスタート比較

| 方法           | コマンド                      | 特徴                   |
| -------------- | ----------------------------- | ---------------------- |
| Docker         | `docker-compose up`           | 最も簡単、環境依存なし |
| 統合スクリプト | `./start_all.sh`              | 1 つのシェルで両方起動 |
| 個別起動       | バックエンド + フロントエンド | 詳細な制御が可能       |

初めての方は**Docker**の使用を推奨します！

## 🎨 使い方

1. ブラウザで `http://localhost:3000` にアクセス
2. 左側のパネルから確率分布を選択（現在は「一様分布」のみ）
3. スライダーでパラメータ（下限 a、上限 b）を調整
4. グラフがリアルタイムで更新されます
5. 数式と統計量も自動的に更新されます

## 📊 実装されている確率分布

### 一様分布（連続）

区間 [a, b] 上で等しい確率密度を持つ連続確率分布です。

**パラメータ:**

- `a`: 下限（デフォルト: 0.0）
- `b`: 上限（デフォルト: 1.0）

**確率密度関数 (PDF):**

```
f(x) = 1/(b-a)  (a ≤ x ≤ b)
f(x) = 0        (otherwise)
```

**統計量:**

- 平均: (a + b) / 2
- 分散: (b - a)² / 12
- 標準偏差: (b - a) / √12

## 🔧 今後の拡張予定

システムは拡張性を重視して設計されており、以下のような追加が容易です：

### 追加予定の確率分布

- 正規分布（Normal Distribution）
- 指数分布（Exponential Distribution）
- 二項分布（Binomial Distribution）
- ポアソン分布（Poisson Distribution）
- ガンマ分布（Gamma Distribution）
- ベータ分布（Beta Distribution）

### 機械学習モデル

- 線形回帰
- ロジスティック回帰
- k-means クラスタリング
- 決定木

## 🛠️ 新しい確率分布の追加方法

### バックエンド側

1. `backend/models/distributions.py` に新しい分布クラスを追加:

```python
class NormalDistribution:
    @staticmethod
    def get_info() -> DistributionInfo:
        return DistributionInfo(
            type=DistributionType.NORMAL,
            name="正規分布",
            description="...",
            formula_pdf=r"f(x) = ...",
            parameters=[...]
        )

    @staticmethod
    def calculate(mu: float, sigma: float, num_points: int = 1000) -> DistributionData:
        # 計算ロジック
        pass
```

2. `DistributionType` Enum に新しいタイプを追加
3. `DISTRIBUTION_REGISTRY` に登録

### フロントエンド側

型定義を更新（`frontend/types/distribution.ts`）:

```typescript
export type DistributionType = "uniform" | "normal" | ...;
```

それだけです！UI は自動的に新しい分布を認識し、表示します。

## 📚 API エンドポイント

### GET /api/v1/distributions

利用可能な全ての確率分布のリストを取得

### GET /api/v1/distributions/{dist_type}

特定の確率分布の詳細情報を取得

### POST /api/v1/calculate

確率分布のデータを計算

**リクエストボディ:**

```json
{
  "distribution_type": "uniform",
  "parameters": {
    "a": 0.0,
    "b": 1.0
  },
  "num_points": 1000
}
```

**レスポンス:**

```json
{
  "x_values": [...],
  "pdf_values": [...],
  "cdf_values": [...],
  "mean": 0.5,
  "variance": 0.0833,
  "std_dev": 0.2887
}
```

### GET /api/v1/health

ヘルスチェック

## 🧪 開発 Tips

### バックエンドのログ確認

FastAPI は自動的にリクエストログを出力します。詳細なログは `utils/logger.py` で設定されています。

### フロントエンドのデバッグ

ブラウザの開発者ツールでネットワークタブを確認すると、API 通信の詳細を確認できます。

### パフォーマンス最適化

- `num_points` パラメータでグラフの解像度を調整できます（デフォルト: 1000）
- フロントエンドではデバウンス（300ms）を使用して API 呼び出しを最適化

## 🎯 最適化機能

このシステムには以下の最適化が実装されています：

### バックエンド

- **GZip 圧縮**: レスポンスサイズを大幅に削減
- **リクエスト処理時間のロギング**: パフォーマンス監視
- **設定管理**: 環境変数による柔軟な設定
- **エラーハンドリング**: 詳細なエラーメッセージ
- **ヘルスチェック**: Docker での自動監視

### フロントエンド

- **エラーバウンダリ**: 予期しないエラーを優雅に処理
- **デバウンス**: API 呼び出しの最適化（300ms）
- **ローディング状態**: ユーザーフレンドリーなフィードバック
- **Standalone 出力**: 本番ビルドの最適化
- **画像最適化**: Next.js の最適化機能

## 📚 ドキュメント

- [README.md](README.md) - このファイル（概要と使い方）
- [QUICKSTART.md](QUICKSTART.md) - 5 分で始めるガイド
- [ARCHITECTURE.md](ARCHITECTURE.md) - システムアーキテクチャ
- [DOCKER.md](DOCKER.md) - Docker 利用ガイド

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 貢献

新しい確率分布や機械学習モデルの追加、UI の改善など、貢献を歓迎します！

## 📞 サポート

問題が発生した場合：

1. [QUICKSTART.md](QUICKSTART.md) のトラブルシューティングを確認
2. [DOCKER.md](DOCKER.md) のトラブルシューティングを確認（Docker 使用時）
3. GitHub の Issues で報告

---

**開発者向けメモ:**

- バックエンド: http://localhost:8000
- フロントエンド: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Docker: `docker-compose up`
- 統合起動: `./start_all.sh`
