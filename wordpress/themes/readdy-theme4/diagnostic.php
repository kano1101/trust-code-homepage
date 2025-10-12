<?php
/**
 * Template Name: Diagnostic
 * 診断情報を表示
 */

// WordPress を読み込む
if (!defined('ABSPATH')) {
  // CLI から実行される場合
  require_once(dirname(__FILE__) . '/../../../../wp-load.php');
}

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
