#!/bin/bash
set -e

# WordPressの初期化が完了するまで待機
while [ ! -f /var/www/html/wp-config.php ]; do
  echo "Waiting for WordPress to be initialized..."
  sleep 2
done

echo "WordPress initialized. Setting up URLs..."

# 環境変数からURLを取得
WP_HOME_URL="${WP_HOME:-https://trust-code.net}"
WP_SITEURL_URL="${WP_SITEURL:-https://trust-code.net}"

# wp-cliを使用してデータベースのURLを更新
if command -v wp &> /dev/null; then
  echo "Updating WordPress URLs in database..."
  wp option update home "$WP_HOME_URL" --allow-root --path=/var/www/html || echo "Failed to update home URL"
  wp option update siteurl "$WP_SITEURL_URL" --allow-root --path=/var/www/html || echo "Failed to update siteurl URL"
  echo "WordPress URLs updated to: $WP_HOME_URL"

  echo "Setting up permalink structure for React Router..."
  # パーマリンク構造を設定（React Routerのルーティングに必要）
  wp rewrite structure '/%postname%/' --allow-root --path=/var/www/html || echo "Failed to set permalink structure"
  # .htaccess を強制生成
  wp rewrite flush --hard --allow-root --path=/var/www/html || echo "Failed to flush rewrite rules"
  echo "Permalink structure configured"
else
  echo "wp-cli not found, skipping database URL update"
fi

# Apacheを起動
echo "Starting Apache..."
exec apache2-foreground