#!/bin/bash

set -e

echo "========================================="
echo "開発環境ビルドスクリプト"
echo "========================================="

cd "$(dirname "$0")"

echo "Step 1: npm install"
npm install

echo "Step 2: npm run build"
npm run build

echo "Step 3: アセットコピー"
npm run copy:assets

echo "Step 4: Docker Compose 起動"
cd /Users/akirakano/IdeaProjects/homepage/trust-code
docker-compose --env-file .env.local up -d

echo "========================================="
echo "開発環境ビルド完了"
echo "========================================="