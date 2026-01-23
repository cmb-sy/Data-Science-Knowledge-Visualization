# Astral公式のuv+Pythonイメージを使用
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージのインストール（ビルドに必要な最小限のパッケージ）
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 依存関係ファイルをコピー（レイヤーキャッシングの最適化）
COPY requirements.txt .

# uvを使用して依存パッケージをインストール（BuildKitキャッシュで高速化）
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# ポート8000を公開
EXPOSE 8000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/v1/health')"

# アプリケーションの起動
# --systemフラグでインストールしたため、uv runは不要（直接実行可能）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

