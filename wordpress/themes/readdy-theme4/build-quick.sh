#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "========================================="
echo "簡易ビルド（キャッシュクリアなし）"
echo "========================================="

echo "Step 1: 本番ビルド"
NODE_ENV=production npm run build

echo "Step 2: アセットコピー"
npm run copy:assets

echo "========================================="
echo "✅ ビルド完了"
echo "ブラウザでスーパーリロード (Cmd+Shift+R) してください"
echo "========================================="