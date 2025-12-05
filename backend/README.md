# バックエンド - 確率分布可視化 API

FastAPI を使用した確率分布計算 API です。

## 🚀 クイックスタート

### uv を使用した起動（推奨）

```bash
# uvのインストール（未インストールの場合）
curl -LsSf https://astral.sh/uv/install.sh | sh
# または: pip install uv

# 仮想環境の作成
uv venv

# 依存パッケージのインストール
uv pip install -r requirements.txt

# サーバーの起動
uv run python main.py
```

### 従来の方法（pip + venv）

```bash
# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

# 依存パッケージのインストール
pip install -r requirements.txt

# サーバーの起動
python main.py
```

## 📦 uv について

**uv** は Rust で書かれた高速な Python パッケージマネージャーです。

### メリット

- ⚡ **高速**: pip より 10-100 倍高速
- 🔒 **信頼性**: 依存関係の解決が正確
- 🎯 **シンプル**: 仮想環境の管理が自動化
- 📦 **互換性**: pip と完全互換

### 主なコマンド

```bash
# 仮想環境の作成
uv venv

# パッケージのインストール
uv pip install -r requirements.txt

# 仮想環境内でコマンドを実行
uv run python main.py
uv run pytest
uv run uvicorn main:app --reload
```

## 🏗️ プロジェクト構造

```
backend/
├── main.py              # FastAPIアプリケーション
├── config.py            # 設定管理
├── requirements.txt     # 依存パッケージ
├── models/
│   └── distributions.py # 確率分布のモデルとロジック
├── api/
│   └── routes.py       # APIエンドポイント
└── utils/
    └── logger.py        # ロギング設定
```

## 🔧 開発

### 環境変数

`.env` ファイルを作成して設定をカスタマイズできます：

```env
LOG_LEVEL=INFO
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### 依存パッケージの追加

```bash
# パッケージをインストール
uv pip install <package-name>

# requirements.txtを更新
uv pip freeze > requirements.txt
```

### テスト（将来実装予定）

```bash
uv run pytest
```

## 📚 API ドキュメント

サーバー起動後、以下の URL で API ドキュメントを確認できます：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🐳 Docker

Docker を使用する場合、`uv` が自動的にインストールされます：

```bash
docker-compose up backend
```

詳細は [../DOCKER.md](../DOCKER.md) を参照してください。
