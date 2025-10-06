#!/bin/bash

set -e

echo "========================================="
echo "本番環境ビルドスクリプト"
echo "========================================="

cd "$(dirname "$0")"

echo "Step 1: npm install"
npm install

echo "Step 2: npm run build"
NODE_ENV=production npm run build

echo "Step 3: アセットコピー"
npm run copy:assets

echo "Step 4: NASへデプロイ"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'src' \
  --exclude 'build-*.sh' \
  ./ root@192.168.1.100:/volume1/docker/trust-code/wordpress/themes/readdy-theme4/

echo "Step 5: 本番環境Docker Compose 再起動"
essh root@192.168.1.100 "cd /volume1/docker/trust-code && docker-compose --env-file .env.production -f docker-compose.production.yml restart wordpress"

echo "========================================="
echo "本番環境ビルド・デプロイ完了"
echo "========================================="