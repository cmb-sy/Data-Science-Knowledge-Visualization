#!/bin/bash

cleanup() {
    echo ""
    echo "シャットダウン中..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "シャットダウン完了"
    exit 0
}

trap cleanup SIGINT SIGTERM

check_and_kill_port() {
    local port=$1
    local name=$2
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        echo "ポート $port ($name) を使用中。終了中..."
        kill $pid 2>/dev/null || true
        sleep 1
    fi
}

check_and_kill_port 8000 "backend"
check_and_kill_port 3000 "frontend"

echo "バックエンドを起動中... (http://localhost:8000)"
cd backend

if [ ! -d ".venv" ]; then
    echo "⚠️  仮想環境を作成中..."
    uv venv || { echo "仮想環境の作成に失敗"; cd ..; exit 1; }
    echo "   依存パッケージをインストール中..."
    uv pip install -r requirements.txt || { echo "依存パッケージのインストールに失敗"; cd ..; exit 1; }
fi

uv run python main.py &
BACKEND_PID=$!

sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "バックエンドの起動に失敗しました"
    cd ..
    exit 1
fi

cd ..

echo "✨ フロントエンドを起動中... (http://localhost:3000)"
cd frontend

if ! command -v pnpm &> /dev/null; then
    echo "pnpm がインストールされていません"
    echo "インストール: https://pnpm.io/installation"
    cd ..
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "依存パッケージをインストール中..."
    pnpm install || { echo "依存パッケージのインストールに失敗"; cd ..; exit 1; }
fi

if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
fi

pnpm run dev &
FRONTEND_PID=$!

sleep 4
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "フロントエンドの起動に失敗しました"
    cd ..
    exit 1
fi

cd ..

echo "   - フロントエンド: http://localhost:3000"
echo "   - バックエンドAPI: http://localhost:8000"
echo "   - API ドキュメント: http://localhost:8000/docs"

wait $BACKEND_PID $FRONTEND_PID
