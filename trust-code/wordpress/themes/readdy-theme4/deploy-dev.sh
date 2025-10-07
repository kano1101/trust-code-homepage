#!/bin/bash

set -e

echo "========================================="
echo "開発環境 完全ビルド＆デプロイ"
echo "========================================="

cd "$(dirname "$0")"

echo "Step 1: Viteキャッシュとビルド成果物をクリーンアップ"
rm -rf node_modules/.vite dist out

echo "Step 2: 古いアセットを削除"
rm -f assets/*.js assets/*.css assets/*.map manifest.json

echo "Step 3: npm install"
npm install

echo "Step 4: 本番ビルド"
NODE_ENV=production npm run build

echo "Step 5: アセットコピー"
npm run copy:assets

echo "Step 6: Docker Compose再起動（ボリュームマウントで自動反映）"
cd /Users/akirakano/IdeaProjects/homepage/trust-code
docker-compose --env-file .env.local restart wordpress

echo "Step 7: WordPressキャッシュとリライトルールをフラッシュ"
sleep 2
docker-compose --env-file .env.local exec -T wordpress wp cache flush --allow-root 2>&1 || true
docker-compose --env-file .env.local exec -T wordpress wp rewrite flush --allow-root 2>&1 || true

echo "========================================="
echo "✅ 開発環境デプロイ完了"
echo "🌐 http://localhost:8080"
echo "========================================="