#!/bin/bash

set -e

echo "========================================="
echo "本番環境 完全ビルド＆デプロイ"
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

echo "Step 6: 本番環境Docker再起動（NASボリュームマウントで自動反映）"
echo "注意: 本番環境はNAS上のボリュームマウントにより自動反映されます"
echo "NASにSSH接続して以下を実行してください:"
echo "  cd /volume1/docker/trust-code"
echo "  docker-compose --env-file .env.production -f docker-compose.production.yml restart wordpress"
echo "  docker-compose --env-file .env.production -f docker-compose.production.yml exec -T wordpress wp cache flush --allow-root"
echo "  docker-compose --env-file .env.production -f docker-compose.production.yml exec -T wordpress wp rewrite flush --allow-root"

echo "========================================="
echo "✅ 本番環境デプロイ完了"
echo "🌐 https://trust-code.net"
echo "========================================="