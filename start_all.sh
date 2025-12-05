#!/bin/bash

# クリーンアップ関数（Ctrl+Cで両方のプロセスを終了）
cleanup() {
    echo ""
    echo "シャットダウン中..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "シャットダウン完了"
    exit 0
}

trap cleanup SIGINT SIGTERM

# ログディレクトリの作成
mkdir -p logs

# 既存プロセスのチェックと終了
check_and_kill_port() {
    local port=$1
    local name=$2
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        echo "⚠️  ポート $port ($name) が使用中です。既存プロセスを終了します..."
        kill $pid 2>/dev/null || true
        sleep 1
    fi
}

check_and_kill_port 8000 "バックエンド"
check_and_kill_port 3000 "フロントエンド"

# バックエンドの起動
echo "✨ バックエンドを起動中... (http://localhost:8000)"
cd backend

# 仮想環境の確認
if [ ! -d ".venv" ]; then
    echo "❌ エラー: .venv が見つかりません"
    echo "   以下のコマンドで仮想環境を作成してください:"
    echo "   cd backend && uv venv && uv pip install -r requirements.txt"
    cd ..
    exit 1
fi

uv run python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# 起動確認（少し待ってからチェック）
sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ バックエンドの起動に失敗しました"
    echo "   ログを確認: tail -f logs/backend.log"
    cd ..
    exit 1
fi

cd ..

# フロントエンドの起動
echo "✨ フロントエンドを起動中... (http://localhost:3000)"
cd frontend

# 依存パッケージの確認
if [ ! -d "node_modules" ]; then
    echo "❌ エラー: node_modules が見つかりません"
    echo "   以下のコマンドで依存パッケージをインストールしてください:"
    echo "   cd frontend && npm install"
    cd ..
    exit 1
fi

# nextパッケージの確認（node_modules/.bin/next または node_modules/next の存在確認）
if [ ! -f "node_modules/.bin/next" ] && [ ! -d "node_modules/next" ]; then
    echo "❌ エラー: next パッケージがインストールされていません"
    echo "   以下のコマンドで依存パッケージを再インストールしてください:"
    echo "   cd frontend && rm -rf node_modules package-lock.json && npm install"
    cd ..
    exit 1
fi

# 環境変数ファイルの確認と作成
if [ ! -f ".env.local" ]; then
    echo "   環境変数ファイルを作成中..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
fi

# npm run devを実行（package.jsonのスクリプトを使用）
echo "   フロントエンドサーバーを起動中..."
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# 起動確認（少し待ってからチェック）
sleep 4

# プロセスの生存確認
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ フロントエンドの起動に失敗しました"
    echo "   ログを確認:"
    cat ../logs/frontend.log
    echo ""
    echo "   手動で起動を試してください:"
    echo "   cd frontend && npm run dev"
    cd ..
    exit 1
fi

# ポート3000が実際にリッスンしているか確認
sleep 2
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  警告: ポート3000がリッスンされていません"
    echo "   ログを確認してください:"
    tail -30 ../logs/frontend.log
    echo ""
    echo "   プロセスは実行中ですが、ポートが開いていません"
    echo "   もう少し待ってから再度確認してください"
fi

cd ..

echo ""
echo "✅ 起動完了！"
echo ""
echo "📍 アクセス先:"
echo "   - フロントエンド: http://localhost:3000"
echo "   - バックエンドAPI: http://localhost:8000"
echo "   - API ドキュメント: http://localhost:8000/docs"
echo ""
echo "📝 ログファイル:"
echo "   - バックエンド: logs/backend.log"
echo "   - フロントエンド: logs/frontend.log"
echo ""
echo "💡 ログをリアルタイムで表示:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""
echo "🛑 終了するには Ctrl+C を押してください"
echo ""

# ログを表示（両方のログを並行表示）
tail -f logs/backend.log logs/frontend.log &
TAIL_PID=$!

# プロセスが終了するまで待機
wait $BACKEND_PID $FRONTEND_PID

# クリーンアップ
kill $TAIL_PID 2>/dev/null || true
