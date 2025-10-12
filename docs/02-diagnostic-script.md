# 02. 診断スクリプトの作成と実行

## 目的

WordPress が認識している環境変数、サーバー変数、URL 設定を確認する。

## 診断用 PHP ファイルの作成

`wordpress/themes/readdy-theme4/diagnostic.php` を作成:

```php
<?php
/**
 * Template Name: Diagnostic
 * 診断情報を表示
 */

// WordPress を読み込む
require_once('../../../wp-load.php');

header('Content-Type: text/plain; charset=utf-8');

echo "=== WordPress URL Diagnostic ===\n\n";

echo "## 1. WordPress Options\n";
echo "home: " . get_option('home') . "\n";
echo "siteurl: " . get_option('siteurl') . "\n\n";

echo "## 2. Environment Variables\n";
echo "WP_HOME: " . getenv('WP_HOME') . "\n";
echo "WP_SITEURL: " . getenv('WP_SITEURL') . "\n\n";

echo "## 3. Server Variables\n";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'not set') . "\n";
echo "SERVER_NAME: " . ($_SERVER['SERVER_NAME'] ?? 'not set') . "\n";
echo "SERVER_PORT: " . ($_SERVER['SERVER_PORT'] ?? 'not set') . "\n";
echo "HTTPS: " . ($_SERVER['HTTPS'] ?? 'not set') . "\n";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'not set') . "\n\n";

echo "## 4. Proxy Headers (X-Forwarded-*)\n";
echo "X-Forwarded-Proto: " . ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? 'not set') . "\n";
echo "X-Forwarded-Host: " . ($_SERVER['HTTP_X_FORWARDED_HOST'] ?? 'not set') . "\n";
echo "X-Forwarded-Port: " . ($_SERVER['HTTP_X_FORWARDED_PORT'] ?? 'not set') . "\n";
echo "X-Forwarded-For: " . ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'not set') . "\n\n";

echo "## 5. WordPress Constants\n";
echo "WP_HOME (constant): " . (defined('WP_HOME') ? WP_HOME : 'not defined') . "\n";
echo "WP_SITEURL (constant): " . (defined('WP_SITEURL') ? WP_SITEURL : 'not defined') . "\n";
echo "FORCE_SSL_ADMIN: " . (defined('FORCE_SSL_ADMIN') ? (FORCE_SSL_ADMIN ? 'true' : 'false') : 'not defined') . "\n\n";

echo "## 6. WordPress Functions\n";
echo "home_url(): " . home_url() . "\n";
echo "site_url(): " . site_url() . "\n";
echo "admin_url(): " . admin_url() . "\n";
echo "wp_login_url(): " . wp_login_url() . "\n\n";

echo "## 7. is_ssl() Check\n";
echo "is_ssl(): " . (is_ssl() ? 'true' : 'false') . "\n\n";

echo "=== End of Diagnostic ===\n";
```

## 実行手順

### 開発環境で実行

```bash
# プロジェクトルートで
cd /Users/akirakano/IdeaProjects/homepage

# 診断ファイルに直接アクセス
curl http://localhost:8080/wp-content/themes/readdy-theme4/diagnostic.php

# または Docker 内で実行
docker compose exec wordpress php /var/www/html/wp-content/themes/readdy-theme4/diagnostic.php
```

### 本番環境で実行（デプロイ後）

```bash
# NAS にログイン
ssh -p 922 akira_kano1101@akirasynology
sudo -i
cd /volume1/docker/trust-code

# Docker 内で実行
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress php /var/www/html/wp-content/themes/readdy-theme4/diagnostic.php
```

## 期待される出力

正常な場合:
```
## 1. WordPress Options
home: https://trust-code.net
siteurl: https://trust-code.net

## 3. Server Variables
SERVER_PORT: 443
HTTPS: on

## 4. Proxy Headers
X-Forwarded-Proto: https
X-Forwarded-Port: 443

## 7. is_ssl() Check
is_ssl(): true
```

## チェックポイント

- [ ] 開発環境で診断スクリプト作成
- [ ] 開発環境で実行して結果確認
- [ ] 本番環境にデプロイ
- [ ] 本番環境で実行して結果確認
- [ ] 問題箇所を特定

## 次のステップ

診断結果を元に 03-fix-wp-config.md で wp-config.php の修正を行う。

## ステータス

- [ ] 診断スクリプト作成完了
- [ ] 開発環境で実行完了
- [ ] 本番環境で実行完了
- [ ] 問題箇所特定完了
