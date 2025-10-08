#!/bin/bash
set -e

# オリジナルのdocker-entrypointを実行してWordPressをインストール
docker-entrypoint.sh apache2-foreground &
APACHE_PID=$!

# WordPressの初期化が完了するまで待機
echo "Waiting for WordPress to be initialized..."
while [ ! -f /var/www/html/wp-config.php ]; do
  sleep 2
done

echo "WordPress initialized. Setting up URLs..."

# 環境変数からURLを取得
WP_HOME_URL="${WP_HOME:-https://trust-code.net}"
WP_SITEURL_URL="${WP_SITEURL:-https://trust-code.net}"

# wp-cliを使用してデータベースのURLを更新
if command -v wp &> /dev/null; then
  echo "Updating WordPress URLs in database..."
  wp option update home "$WP_HOME_URL" --allow-root --path=/var/www/html 2>&1 || echo "Failed to update home URL"
  wp option update siteurl "$WP_SITEURL_URL" --allow-root --path=/var/www/html 2>&1 || echo "Failed to update siteurl URL"
  echo "WordPress URLs updated to: $WP_HOME_URL"
else
  echo "wp-cli not found, skipping database URL update"
fi

# Apacheプロセスを待機
wait $APACHE_PID