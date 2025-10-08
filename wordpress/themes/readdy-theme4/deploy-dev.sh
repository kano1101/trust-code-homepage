#!/bin/bash

# 開発環境向けテーマビルド＆デプロイスクリプト
# 使い方: ./deploy-dev.sh

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# テーマディレクトリに移動
THEME_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$THEME_DIR/../../.." && pwd)"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  開発環境 完全ビルド＆デプロイ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$THEME_DIR"

echo -e "${YELLOW}▶ Step 1: Viteキャッシュとビルド成果物をクリーンアップ${NC}"
rm -rf node_modules/.vite dist out

echo -e "${YELLOW}▶ Step 2: 古いアセットを削除${NC}"
rm -f assets/*.js assets/*.css assets/*.map manifest.json

echo -e "${YELLOW}▶ Step 3: npm install${NC}"
npm install

echo -e "${YELLOW}▶ Step 4: 本番ビルド${NC}"
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ ビルドに失敗しました${NC}"
    exit 1
fi

echo -e "${YELLOW}▶ Step 5: アセットコピー${NC}"
npm run copy:assets

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ アセットのコピーに失敗しました${NC}"
    exit 1
fi

echo -e "${YELLOW}▶ Step 6: Docker Compose再起動（ボリュームマウントで自動反映）${NC}"
cd "$PROJECT_ROOT"

if [ ! -f docker-compose.yml ]; then
    echo -e "${RED}✗ docker-compose.yml が見つかりません${NC}"
    exit 1
fi

# .env.local が存在する場合は使用、なければ .env を使用
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE=".env"
fi

echo -e "${BLUE}  環境ファイル: ${ENV_FILE}${NC}"
docker-compose --env-file "$ENV_FILE" restart wordpress

echo -e "${YELLOW}▶ Step 7: WordPressキャッシュとリライトルールをフラッシュ${NC}"
sleep 2
docker-compose --env-file "$ENV_FILE" exec -T wordpress wp cache flush --allow-root 2>&1 || echo -e "${YELLOW}  (キャッシュフラッシュをスキップ)${NC}"
docker-compose --env-file "$ENV_FILE" exec -T wordpress wp rewrite flush --allow-root 2>&1 || echo -e "${YELLOW}  (リライトルールフラッシュをスキップ)${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ 開発環境デプロイ完了${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🌐 http://localhost:8080${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""