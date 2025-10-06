#!/bin/bash

# NASへのデプロイスクリプト
# 使い方: ./deploy-to-nas.sh

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 設定
LOCAL_THEME_DIR="$(pwd)/wordpress/themes/readdy-theme4"
NAS_USER="${NAS_USER:-root}"
NAS_HOST="${NAS_HOST:-AkiraSynology}"
NAS_PATH="${NAS_PATH:-/volume1/docker/trust-code/wordpress/themes/readdy-theme4}"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Readdy Theme 4 - NASデプロイ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# テーマディレクトリの存在確認
if [ ! -d "${LOCAL_THEME_DIR}" ]; then
    echo -e "${RED}エラー: テーマディレクトリが見つかりません${NC}"
    echo -e "${RED}  パス: ${LOCAL_THEME_DIR}${NC}"
    exit 1
fi

echo -e "${YELLOW}デプロイ設定:${NC}"
echo -e "  ローカル: ${LOCAL_THEME_DIR}"
echo -e "  NAS: ${NAS_USER}@${NAS_HOST}:${NAS_PATH}"
echo ""

# 確認
read -p "デプロイを実行しますか? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}デプロイをキャンセルしました${NC}"
    exit 0
fi

echo -e "${BLUE}▶ NASへファイルを転送中...${NC}"

# rsyncでファイルを同期
# -a: アーカイブモード
# -v: 詳細表示
# -z: 圧縮転送
# --delete: NAS側の不要ファイルを削除
# --exclude: 除外するファイル
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='src' \
  --exclude='out' \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='build.sh' \
  --exclude='build-production.sh' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='vite.config.ts' \
  --exclude='tsconfig.json' \
  --exclude='tsconfig.app.json' \
  --exclude='tsconfig.node.json' \
  --exclude='tailwind.config.ts' \
  --exclude='postcss.config.ts' \
  --exclude='postcss.config.js' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  "${LOCAL_THEME_DIR}/" "${NAS_USER}@${NAS_HOST}:${NAS_PATH}/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ファイル転送完了${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ デプロイ成功！${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${PURPLE}次のステップ:${NC}"
    echo -e "  1. NASにSSHでログイン:"
    echo -e "     ${YELLOW}ssh ${NAS_USER}@${NAS_HOST}${NC}"
    echo -e ""
    echo -e "  2. WordPressコンテナを再起動:"
    echo -e "     ${YELLOW}cd /volume1/docker/trust-code${NC}"
    echo -e "     ${YELLOW}docker-compose restart wordpress${NC}"
    echo -e ""
    echo -e "  3. ブラウザで確認:"
    echo -e "     ${YELLOW}https://trust-code.net${NC}"
else
    echo -e "${RED}✗ デプロイに失敗しました${NC}"
    exit 1
fi