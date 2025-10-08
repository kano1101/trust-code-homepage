#!/bin/bash

# 本番環境向けテーマビルド＆NASデプロイスクリプト
# 使い方: ./deploy-prod.sh

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# テーマディレクトリに移動
THEME_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$THEME_DIR/../../.." && pwd)"

# NAS設定
NAS_USER="${NAS_USER:-root}"
NAS_HOST="${NAS_HOST:-AkiraSynology}"
NAS_PROJECT_PATH="${NAS_PROJECT_PATH:-/volume1/docker/trust-code}"
NAS_THEME_PATH="${NAS_PROJECT_PATH}/wordpress/themes/readdy-theme4"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  本番環境 完全ビルド＆デプロイ${NC}"
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

echo ""
echo -e "${BLUE}▶ Step 6: NASへテーマをデプロイ${NC}"
echo -e "  デプロイ先: ${NAS_USER}@${NAS_HOST}:${NAS_THEME_PATH}"
echo ""

# 確認
read -p "NASへのデプロイを実行しますか? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}デプロイをキャンセルしました${NC}"
    echo -e "${BLUE}ビルド成果物はローカルに保存されています${NC}"
    exit 0
fi

echo -e "${BLUE}NASへファイルを転送中...${NC}"

# rsyncでファイルを同期
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='src' \
  --exclude='out' \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='build.sh' \
  --exclude='build-production.sh' \
  --exclude='build-quick.sh' \
  --exclude='deploy-dev.sh' \
  --exclude='deploy-prod.sh' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='vite.config.ts' \
  --exclude='tsconfig.json' \
  --exclude='tsconfig.app.json' \
  --exclude='tsconfig.node.json' \
  --exclude='tailwind.config.ts' \
  --exclude='postcss.config.ts' \
  --exclude='postcss.config.js' \
  --exclude='auto-imports.d.ts' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  "${THEME_DIR}/" "${NAS_USER}@${NAS_HOST}:${NAS_THEME_PATH}/"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ ファイル転送に失敗しました${NC}"
    exit 1
fi

echo -e "${GREEN}✓ ファイル転送完了${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ 本番環境デプロイ完了${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${PURPLE}次のステップ:${NC}"
echo -e "  1. NASにSSHでログイン:"
echo -e "     ${YELLOW}ssh ${NAS_USER}@${NAS_HOST}${NC}"
echo -e ""
echo -e "  2. WordPressコンテナを再起動:"
echo -e "     ${YELLOW}cd ${NAS_PROJECT_PATH}${NC}"
echo -e "     ${YELLOW}docker-compose -f docker-compose.production.yml --env-file .env.production restart wordpress${NC}"
echo -e ""
echo -e "  3. キャッシュとリライトルールをフラッシュ:"
echo -e "     ${YELLOW}docker-compose -f docker-compose.production.yml --env-file .env.production exec -T wordpress wp cache flush --allow-root${NC}"
echo -e "     ${YELLOW}docker-compose -f docker-compose.production.yml --env-file .env.production exec -T wordpress wp rewrite flush --allow-root${NC}"
echo -e ""
echo -e "  4. ブラウザで確認:"
echo -e "     ${YELLOW}https://trust-code.net${NC}"
echo ""