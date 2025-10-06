#!/bin/bash
# WordPressカスタムイメージをビルドしてDocker Hubにプッシュ

set -e

# イメージ名とタグ
IMAGE_NAME="akirakano/trust-code-wordpress"
TAG="${1:-latest}"

echo "Building WordPress custom image..."
docker build -t ${IMAGE_NAME}:${TAG} ./wordpress

echo "Pushing image to Docker Hub..."
docker push ${IMAGE_NAME}:${TAG}

echo "Done! Image pushed: ${IMAGE_NAME}:${TAG}"
echo ""
echo "To use this image on NAS, run:"
echo "docker-compose pull wordpress"