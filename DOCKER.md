# Docker 利用ガイド

このドキュメントでは、Docker を使用した確率分布可視化システムの構築と実行方法を説明します。

## 🐳 Docker を使う理由

このプロジェクトに Docker を導入した理由：

1. **環境の一貫性**: 開発環境と本番環境で同じ動作を保証
2. **簡単なセットアップ**: Python 仮想環境や Node.js のバージョン管理が不要
3. **依存関係の分離**: システムに直接パッケージをインストールせずに済む
4. **スケーラビリティ**: 将来的なデプロイや負荷分散が容易
5. **再現性**: どの環境でも同じ手順で起動可能

## 📋 前提条件

- Docker Desktop (または Docker Engine)
- Docker Compose

### インストール確認

```bash
docker --version
docker-compose --version
```

### Docker のインストール

まだインストールしていない場合：

**macOS/Windows:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop)をダウンロードしてインストール

**Linux:**

```bash
# Ubuntuの例
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## 🚀 クイックスタート

### 方法 1: Docker Compose で起動（推奨）

**最も簡単な方法 - 1 コマンドで全て起動:**

```bash
docker-compose up
```

初回起動時は少し時間がかかります（依存パッケージのダウンロードとビルド）。

**バックグラウンドで起動:**

```bash
docker-compose up -d
```

**ログの確認:**

```bash
docker-compose logs -f
```

**停止:**

```bash
docker-compose down
```

### 方法 2: 手動で Docker コンテナを起動

**バックエンド:**

```bash
cd backend
docker build -t probability-viz-backend .
docker run -p 8000:8000 probability-viz-backend
```

**フロントエンド:**

```bash
cd frontend
docker build -t probability-viz-frontend .
docker run -p 3000:3000 probability-viz-frontend
```

## 📊 アクセス先

起動後、以下の URL にアクセス：

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

## 🔧 開発モード vs 本番モード

### 開発モード（デフォルト）

```bash
docker-compose up
```

**特徴:**

- ホットリロード有効
- ソースコードの変更が即座に反映
- 詳細なログ出力
- デバッグ用ポートが開放

### 本番モード

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**特徴:**

- 最適化されたビルド
- リソース制限
- 自動再起動
- セキュリティ強化

## 🛠️ よく使うコマンド

### コンテナの管理

```bash
# コンテナの起動
docker-compose up

# バックグラウンドで起動
docker-compose up -d

# 特定のサービスのみ起動
docker-compose up backend
docker-compose up frontend

# コンテナの停止
docker-compose stop

# コンテナの停止と削除
docker-compose down

# コンテナとボリュームの削除
docker-compose down -v

# コンテナの再起動
docker-compose restart
```

### ログとデバッグ

```bash
# 全サービスのログを表示
docker-compose logs -f

# 特定のサービスのログを表示
docker-compose logs -f backend
docker-compose logs -f frontend

# 最新100行のログを表示
docker-compose logs --tail=100

# コンテナの中に入る
docker-compose exec backend bash
docker-compose exec frontend sh
```

### イメージの管理

```bash
# イメージの再ビルド
docker-compose build

# キャッシュを使わずに再ビルド
docker-compose build --no-cache

# 特定のサービスのみ再ビルド
docker-compose build backend

# イメージの一覧
docker images

# 未使用のイメージを削除
docker image prune
```

### ヘルスチェック

```bash
# コンテナの状態を確認
docker-compose ps

# ヘルスチェックの詳細
docker inspect probability-viz-backend | grep -A 10 Health
```

## 🔄 開発ワークフロー

### 1. コードの変更

**バックエンド:**

- `backend/` 内の Python ファイルを編集
- Uvicorn が自動的にリロード
- 変更が即座に反映

**フロントエンド:**

- `frontend/` 内の TypeScript/React ファイルを編集
- Next.js の Fast Refresh が動作
- ブラウザが自動的にリロード

### 2. 依存パッケージの追加

**バックエンド:**

```bash
# requirements.txtを編集
# コンテナを再ビルド
docker-compose up --build backend
```

**フロントエンド:**

```bash
# package.jsonを編集
# コンテナを再ビルド
docker-compose up --build frontend
```

### 3. データベースやストレージの追加（将来）

`docker-compose.yml` にサービスを追加:

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: probability_viz
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## 🐛 トラブルシューティング

### ポートが既に使用されている

**エラー:**

```
Error starting userland proxy: listen tcp4 0.0.0.0:8000: bind: address already in use
```

**解決方法:**

```bash
# 使用中のプロセスを確認
lsof -i :8000
lsof -i :3000

# プロセスを終了
kill -9 <PID>

# または docker-compose.yml でポートを変更
ports:
  - "8001:8000"  # ホスト側のポートを変更
```

### コンテナがビルドできない

**解決方法:**

```bash
# キャッシュをクリアして再ビルド
docker-compose build --no-cache

# Dockerのシステムをクリーンアップ
docker system prune -a
```

### コンテナが起動しない

**確認:**

```bash
# コンテナのログを確認
docker-compose logs backend
docker-compose logs frontend

# コンテナの状態を確認
docker-compose ps
```

### ホットリロードが動作しない

**macOS/Windows 特有の問題:**

Docker Desktop の設定で「Use gRPC FUSE for file sharing」を有効化

**Linux:**

`docker-compose.yml` に以下を追加:

```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
```

## 📈 パフォーマンス最適化

### マルチステージビルド

フロントエンドの Dockerfile でマルチステージビルドを使用し、本番イメージのサイズを削減:

```dockerfile
# ビルド段階: 依存関係とビルド
FROM node:18-alpine AS builder
...

# 実行段階: 必要なファイルのみ
FROM node:18-alpine AS runner
...
```

### レイヤーキャッシング

依存関係ファイルを先にコピーすることで、コードの変更時に依存関係の再インストールを回避:

```dockerfile
# 依存関係ファイルのみコピー
COPY requirements.txt .
RUN pip install -r requirements.txt

# その後アプリケーションコードをコピー
COPY . .
```

### ボリュームマウント

開発時はソースコードをマウントすることで、コンテナの再ビルドを不要に:

```yaml
volumes:
  - ./backend:/app
  - /app/venv # 仮想環境は除外
```

## 🌐 本番環境へのデプロイ

### Docker Hub へのプッシュ

```bash
# イメージにタグを付ける
docker tag probability-viz-backend username/probability-viz-backend:1.0.0
docker tag probability-viz-frontend username/probability-viz-frontend:1.0.0

# Docker Hubにプッシュ
docker push username/probability-viz-backend:1.0.0
docker push username/probability-viz-frontend:1.0.0
```

### クラウドプラットフォームへのデプロイ

**AWS ECS:**

- タスク定義でイメージを指定
- サービスを作成

**Google Cloud Run:**

```bash
gcloud run deploy probability-viz-backend \
  --image gcr.io/project-id/probability-viz-backend \
  --platform managed
```

**Azure Container Instances:**

```bash
az container create \
  --resource-group myResourceGroup \
  --name probability-viz \
  --image username/probability-viz-backend:1.0.0
```

## 📊 リソース監視

```bash
# リソース使用状況をリアルタイムで表示
docker stats

# 特定のコンテナのみ
docker stats probability-viz-backend probability-viz-frontend
```

## 🔐 セキュリティベストプラクティス

1. **非 root ユーザーで実行**（フロントエンドで実装済み）
2. **セキュリティスキャン**
   ```bash
   docker scan probability-viz-backend
   ```
3. **最新のベースイメージを使用**
4. **機密情報を環境変数で管理**
5. **不要なファイルを.dockerignore で除外**

## 📚 参考リンク

- [Docker 公式ドキュメント](https://docs.docker.com/)
- [Docker Compose 公式ドキュメント](https://docs.docker.com/compose/)
- [FastAPI + Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [Next.js + Docker](https://nextjs.org/docs/deployment#docker-image)

---

**Docker で快適な開発を！** 🐳
