#!/bin/bash
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  本番環境 完全ビルド＆デプロイ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# === 既存変数を利用 ===
NAS_USER="akira_kano1101"
NAS_HOST="akirasynology"
NAS_PORT=922
NAS_THEME_PATH="/volume1/docker/trust-code/wordpress/themes/readdy-theme4"
LOCAL_THEME_DIR="./wordpress/themes/readdy-theme4"
PROJECT_ROOT="$(pwd)"
NAS_COMPOSE_DIR="/volume1/docker/trust-code"

# === ビルド処理 ===
echo "▶ Step 1: Viteキャッシュとビルド成果物をクリーンアップ"
rm -rf out dist node_modules/.vite_cache 2>/dev/null || true

echo "▶ Step 2: 古いアセットを削除"
rm -rf assets/* .vite/manifest.json 2>/dev/null || true

echo "▶ Step 3: npm install"
cd "$LOCAL_THEME_DIR"
npm install

echo "▶ Step 4: 本番ビルド"
npm run build

echo "▶ Step 5: アセットコピー"
npm run copy:assets
cd - >/dev/null

# === デプロイ処理 ===
echo "▶ Step 6: NASへテーマとcomposeをデプロイ（ssh + tar）"
echo "  デプロイ先: ${NAS_USER}@${NAS_HOST}:${NAS_THEME_PATH}"
read -r -p "NASへのデプロイを実行しますか? (y/N): " yn
[[ ! $yn =~ ^[Yy]$ ]] && echo "中止しました。" && exit 0

TMP_DIR="/tmp/readdy-theme4"
echo "NASへファイルを転送中..."

# (1) 一時ディレクトリ準備
ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "rm -rf '$TMP_DIR' && mkdir -p '$TMP_DIR/theme' '$TMP_DIR/cfg'"

# (2) テーマを /tmp へ展開
COPYFILE_DISABLE=1 tar \
  --no-xattrs --no-mac-metadata --no-acls --no-fflags \
  -C "$LOCAL_THEME_DIR" -cf - . \
| ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "tar -C '$TMP_DIR/theme' -xpf -"

# (3) composeファイルを /tmp へ展開
echo "composeファイルを確認中..."
ls -la "$PROJECT_ROOT"/.env.production "$PROJECT_ROOT"/docker-compose.yml "$PROJECT_ROOT"/docker-compose.production.yml

echo "composeファイルを転送中..."
COPYFILE_DISABLE=1 tar \
  --no-xattrs --no-mac-metadata --no-acls --no-fflags \
  -C "$PROJECT_ROOT" -cvf - .env.production docker-compose.yml docker-compose.production.yml \
| ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "tar -C '$TMP_DIR/cfg' -xvpf -"

if [ $? -ne 0 ]; then
  echo "エラー: composeファイルの転送に失敗しました"
  exit 1
fi

echo "転送直後のファイル確認..."
ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "ls -la '$TMP_DIR/cfg/' && echo '--- .env.production の内容 (先頭5行) ---' && head -5 '$TMP_DIR/cfg/.env.production'"

if [ $? -ne 0 ]; then
  echo "エラー: ファイルが正しく転送されていません"
  exit 1
fi

echo "Dockerファイルを確認中..."
ls -la "$PROJECT_ROOT"/wordpress/Dockerfile "$PROJECT_ROOT"/wordpress/docker-entrypoint-wrapper.sh "$PROJECT_ROOT"/wordpress/init-wordpress.sh

echo "Dockerファイルを転送中..."
COPYFILE_DISABLE=1 tar \
  --no-xattrs --no-mac-metadata --no-acls --no-fflags \
  -C "$PROJECT_ROOT/wordpress" -cvf - Dockerfile docker-entrypoint-wrapper.sh init-wordpress.sh \
| ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "tar -C '$TMP_DIR/cfg' -xvpf -"

if [ $? -ne 0 ]; then
  echo "エラー: Dockerファイルの転送に失敗しました"
  exit 1
fi

echo "Nginx設定ファイルを確認中..."
ls -la "$PROJECT_ROOT"/nginx/conf.d/production.conf

echo "Nginx設定ファイルを転送中..."
COPYFILE_DISABLE=1 tar \
  --no-xattrs --no-mac-metadata --no-acls --no-fflags \
  -C "$PROJECT_ROOT/nginx/conf.d" -cvf - production.conf \
| ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "tar -C '$TMP_DIR/cfg' -xvpf -"

if [ $? -ne 0 ]; then
  echo "エラー: Nginx設定ファイルの転送に失敗しました"
  exit 1
fi

# (4) root環境で本番配置＆compose再起動
echo "NAS上でroot権限で操作を実行します（パスワード入力が必要です）"
ssh -t -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" '
  sudo -i bash << "ROOTEOF"
set -e

# 変数設定
NAS_THEME_PATH="/volume1/docker/trust-code/wordpress/themes/readdy-theme4"
TMP_DIR="/tmp/readdy-theme4"
NAS_COMPOSE_DIR="/volume1/docker/trust-code"

# ファイル配置
mkdir -p "$(dirname "$NAS_THEME_PATH")"
rm -rf "$NAS_THEME_PATH"
mv "$TMP_DIR/theme" "$NAS_THEME_PATH"
mv "$TMP_DIR/cfg/.env.production" "$NAS_COMPOSE_DIR/"
mv "$TMP_DIR/cfg/docker-compose.yml" "$NAS_COMPOSE_DIR/"
mv "$TMP_DIR/cfg/docker-compose.production.yml" "$NAS_COMPOSE_DIR/"
mv "$TMP_DIR/cfg/Dockerfile" "$NAS_COMPOSE_DIR/wordpress/"
mv "$TMP_DIR/cfg/docker-entrypoint-wrapper.sh" "$NAS_COMPOSE_DIR/wordpress/"
mv "$TMP_DIR/cfg/init-wordpress.sh" "$NAS_COMPOSE_DIR/wordpress/"
mkdir -p "$NAS_COMPOSE_DIR/nginx/conf.d"
mv "$TMP_DIR/cfg/production.conf" "$NAS_COMPOSE_DIR/nginx/conf.d/"
echo "テーマ、compose、nginx設定を反映しました。"

# Docker volume準備
cd "$NAS_COMPOSE_DIR"
docker volume inspect db_data >/dev/null 2>&1 || docker volume create db_data
docker volume inspect wp_html >/dev/null 2>&1 || docker volume create wp_html

# 環境変数ファイルの確認
if [ ! -f "$NAS_COMPOSE_DIR/.env.production" ]; then
  echo "エラー: .env.productionが見つかりません"
  exit 1
fi

# 構成変更検出と選択的再起動
CURRENT_HASH=$(docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file $NAS_COMPOSE_DIR/.env.production config | sha1sum)
PREVIOUS_HASH=$(cat .compose_config_hash 2>/dev/null || echo "")

if [ -z "$(docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file $NAS_COMPOSE_DIR/.env.production ps -q)" ]; then
  echo "コンテナが起動していません：初回起動を実行します"
  docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file $NAS_COMPOSE_DIR/.env.production up -d --pull=missing
  echo "$CURRENT_HASH" > .compose_config_hash
elif [ "$CURRENT_HASH" != "$PREVIOUS_HASH" ]; then
  echo "構成変更を検出：変更があったコンテナのみ再作成します"
  # up -d は変更があったコンテナだけを自動的に再作成
  docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file $NAS_COMPOSE_DIR/.env.production up -d --pull=missing
  echo "$CURRENT_HASH" > .compose_config_hash
else
  echo "構成変更なし：wordpress と nginx のみ再起動します"
  # テーマ変更を反映（wordpress）、nginx設定変更を反映（nginx）
  docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file $NAS_COMPOSE_DIR/.env.production restart wordpress nginx
fi

echo "NAS docker compose デプロイ完了"
ROOTEOF
'
echo "✅ デプロイ完了：$NAS_THEME_PATH"