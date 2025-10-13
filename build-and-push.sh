#!/bin/bash
set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 設定
DOCKER_USERNAME="${DOCKER_USERNAME:-akirakano1101}"
IMAGE_NAME="trust-code-wordpress"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# バージョンタグ（タイムスタンプ）
VERSION_TAG=$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Docker Image Build & Push Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"
echo -e "${YELLOW}Tags: latest, ${VERSION_TAG}${NC}"
echo ""

# Docker Hubへのログイン確認
echo -e "${GREEN}[1/5] Docker Hubへのログイン状態を確認中...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Docker Hubにログインしていません。${NC}"
    echo -e "${YELLOW}以下のコマンドを実行してください:${NC}"
    echo -e "${YELLOW}  docker login${NC}"
    echo ""
    read -p "今すぐログインしますか? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker login
    else
        echo -e "${RED}エラー: Docker Hubにログインしてください${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ ログイン済み${NC}"
echo ""

# Dockerイメージのビルド
echo -e "${GREEN}[2/5] Dockerイメージをビルド中...${NC}"
echo -e "${YELLOW}コンテキスト: ./wordpress${NC}"
echo -e "${YELLOW}プラットフォーム: linux/amd64 (NAS用)${NC}"
echo ""

docker build --load \
             --platform linux/amd64 \
             -t "${FULL_IMAGE_NAME}:latest" \
             -t "${FULL_IMAGE_NAME}:${VERSION_TAG}" \
             -f wordpress/Dockerfile \
             wordpress/

if [ $? -ne 0 ]; then
    echo -e "${RED}エラー: ビルドに失敗しました${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ ビルド完了${NC}"
echo ""

# ビルド結果の確認
echo -e "${GREEN}[3/5] ビルドされたイメージを確認中...${NC}"
docker images | grep "${FULL_IMAGE_NAME}" | head -2
echo ""

# Docker Hubへプッシュ (latest)
echo -e "${GREEN}[4/5] Docker Hubへプッシュ中 (latest)...${NC}"
docker push "${FULL_IMAGE_NAME}:latest"

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}エラー: プッシュに失敗しました (latest)${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}よくある原因:${NC}"
    echo -e "  1. Docker Hub にリポジトリが存在しない"
    echo -e "  2. アクセストークンの権限が不足している"
    echo -e "  3. 認証情報が古いか無効"
    echo ""
    echo -e "${YELLOW}解決方法:${NC}"
    echo ""
    echo -e "${BLUE}■ リポジトリが存在しない場合${NC}"
    echo -e "  1. https://hub.docker.com/ にログイン"
    echo -e "  2. 「Create Repository」をクリック"
    echo -e "  3. Name: trust-code-wordpress"
    echo -e "  4. Visibility: Public"
    echo -e "  5. 「Create」をクリック"
    echo ""
    echo -e "${BLUE}■ アクセストークンの権限が不足している場合${NC}"
    echo -e "  1. https://hub.docker.com/settings/security にアクセス"
    echo -e "  2. 「New Access Token」をクリック"
    echo -e "  3. Description: trust-code-wordpress-push"
    echo -e "  4. Access permissions: Read, Write, Delete を選択"
    echo -e "  5. 「Generate」をクリック"
    echo -e "  6. トークンをコピー"
    echo ""
    echo -e "${BLUE}■ 再ログイン${NC}"
    echo -e "  docker logout"
    echo -e "  docker login"
    echo -e "  # Username: ${DOCKER_USERNAME}"
    echo -e "  # Password: <上記で生成したアクセストークン>"
    echo ""
    echo -e "${YELLOW}詳細は docs/deployment-guide.md を参照してください${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ プッシュ完了 (latest)${NC}"
echo ""

# Docker Hubへプッシュ (version)
echo -e "${GREEN}[5/5] Docker Hubへプッシュ中 (${VERSION_TAG})...${NC}"
docker push "${FULL_IMAGE_NAME}:${VERSION_TAG}"

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}エラー: プッシュに失敗しました (${VERSION_TAG})${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}latest タグのプッシュは成功しましたが、バージョンタグのプッシュに失敗しました。${NC}"
    echo -e "${YELLOW}詳細は docs/deployment-guide.md を参照してください${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ プッシュ完了 (${VERSION_TAG})${NC}"
echo ""

# 完了メッセージ
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ すべての処理が完了しました！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}プッシュされたイメージ:${NC}"
echo -e "  - ${FULL_IMAGE_NAME}:latest"
echo -e "  - ${FULL_IMAGE_NAME}:${VERSION_TAG}"
echo ""
echo -e "${YELLOW}Docker Hubで確認:${NC}"
echo -e "  https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
echo ""
echo -e "${YELLOW}次のステップ:${NC}"
echo -e "  1. NASにSSH接続:"
echo -e "     ssh root@AkiraSynology"
echo ""
echo -e "  2. プロジェクトディレクトリへ移動:"
echo -e "     cd /volume1/docker/trust-code"
echo ""
echo -e "  3. 最新イメージをPULL:"
echo -e "     docker pull ${FULL_IMAGE_NAME}:latest"
echo ""
echo -e "  4. コンテナを再起動:"
echo -e "     docker-compose -f docker-compose.production.yml --env-file .env.production down"
echo -e "     docker-compose -f docker-compose.production.yml --env-file .env.production up -d"
echo ""
echo -e "${GREEN}ロールバックが必要な場合:${NC}"
echo -e "  docker pull ${FULL_IMAGE_NAME}:${VERSION_TAG}"
echo -e "  # docker-compose.production.yml の image を一時的に変更"
echo ""
