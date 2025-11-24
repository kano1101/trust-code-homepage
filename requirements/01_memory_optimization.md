# 01. NASメモリ不足問題とパフォーマンス最適化

## 概要

本番環境（NAS: Synology、メモリ3.8GB）において、X投稿後のアクセス急増時にCloudflare 502/504エラーが発生。原因はメモリ不足によるシステム全体の遅延とCloudflare Tunnelのタイムアウト。

---

## 問題の発生状況

### 発生日時
2025-11-18

### 症状
- ユーザーが `https://trust-code.net` にアクセスすると Cloudflare エラー画面が表示
- エラーコード: 502 Bad Gateway / 504 Gateway Timeout
- X（Twitter）投稿後のアクセス急増時に発生

### トリガー
- X投稿によるアクセス急増
- PHP警告の大量ログ出力
- wp-cronのバックグラウンド実行

---

## 根本原因

### 1. メモリ不足

#### 診断結果（最適化前）
```bash
総メモリ: 3.8GB
使用中:   2.0GB (53%)
空き:     278MB (7%)  ← 危険水域（推奨: >500MB）
スワップ: 1.4GB/4.3GB使用 (33%)  ← 大量にスワップ使用中
```

#### コンテナ別メモリ使用量（最適化前）
```
wp-db              437.9MB  (11.26%)  ← 最大の問題
wp-app             150.4MB  (3.86%)
n8n                186.9MB  (4.80%)
wp-pma             23.24MB  (0.60%)   ← 本番環境では不要
benchmark系        27.30MB  (0.72%)   ← テスト用、不要
```

#### スワップ使用の影響
- スワップ使用 = ディスクI/O待機 = 極端に遅い
- zram（圧縮メモリ）を1.4GB使用 → CPU負荷も増加
- WordPressの応答が30秒以上に遅延 → Cloudflare Tunnel タイムアウト

---

### 2. PHP警告の大量出力

#### 警告内容
```
PHP Warning: Constant WP_DEBUG already defined in /var/www/html/wp-config.php(128) : eval()'d code on line 2
PHP Warning: Constant FORCE_SSL_ADMIN already defined in /var/www/html/wp-config.php on line 159
```

#### 原因
`docker-compose.production.yml` の `WORDPRESS_CONFIG_EXTRA` で `WP_DEBUG` と `FORCE_SSL_ADMIN` を定義していたが、これらは既に `wp-config.php` で定義されているため重複。

#### 影響
- 全てのリクエストで警告が2つずつ出力
- ログファイルが肥大化
- ログ書き込みでI/O待機が発生
- メモリ消費とCPU負荷が増加

---

### 3. wp-cronのタイムアウト

#### ログ
```
POST /wp-cron.php HTTP/1.1" 499 0
ERR Request failed error="Incoming request ended abruptly: context canceled"
```

- ステータス `499`: クライアント側がタイムアウト
- wp-cronは訪問者アクセス時に実行されるため、アクセス急増時に負荷が集中
- メモリ不足でwp-cronが完了できず、Cloudflare Tunnelがタイムアウト

---

### 4. Cloudflare Tunnel の接続不安定

#### ログ
```
ERR failed to accept incoming stream requests error="timeout: no recent network activity"
WRN Connection terminated error="datagram manager encountered a failure while serving"
INF Retrying connection in up to 1s
```

- WordPress の応答遅延によりCloudflare Tunnel がタイムアウト
- タイムアウトして再接続を繰り返していた

---

## 問題発生のメカニズム

```
通常時:
  メモリ使用: 2.0GB / 3.8GB (空き 278MB)
  スワップ: 1.4GB使用中 → 既にギリギリ
  ↓
X投稿でアクセス急増:
  + PHP警告の大量ログ（I/O負荷）
  + 追加のPHPプロセス起動（メモリ消費+100MB）
  + wp-cron同時実行（メモリ消費+50MB）
  ↓
メモリ不足が臨界点に:
  空きメモリ < 100MB
  スワップ使用 > 2GB
  ディスクI/O待機でシステム全体が停滞
  ↓
Cloudflare Tunnel タイムアウト:
  WordPressが30秒以内に応答できず
  502/504 エラー表示
```

---

## 解決策

### 即効性のある対策（実施済み）

#### 1. PHP警告の削除

**修正ファイル**: `docker-compose.production.yml`

**変更前**:
```yaml
WORDPRESS_CONFIG_EXTRA: |
  define('WP_MEMORY_LIMIT','256M');
  define('WP_DEBUG', false);
  define('WP_DEBUG_LOG', false);
  define('WP_DEBUG_DISPLAY', false);
  define('FS_METHOD','direct');

  $$wp_home = getenv('WP_HOME');
  if ($$wp_home && strpos($$wp_home, 'https://') === 0) {
    define('FORCE_SSL_ADMIN', true);
    // ...
  }
```

**変更後**:
```yaml
WORDPRESS_CONFIG_EXTRA: |
  define('WP_MEMORY_LIMIT','128M');
  define('WP_MAX_MEMORY_LIMIT','256M');
  define('FS_METHOD','direct');
  define('DISABLE_WP_CRON', true);

  // Cloudflare / 逆プロキシ下でのHTTPS検知
  if (!empty($$_SERVER['HTTP_CF_VISITOR'])) {
    $$_cf = json_decode($$_SERVER['HTTP_CF_VISITOR'], true);
    if (!empty($$_cf['scheme']) && $$_cf['scheme'] === 'https') { $$_SERVER['HTTPS'] = 'on'; }
  }
  if (!empty($$_SERVER['HTTP_X_FORWARDED_PROTO']) && $$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $$_SERVER['HTTPS'] = 'on';
  }
  if (!empty($$_SERVER['HTTP_X_FORWARDED_HOST'])) {
    $$_SERVER['HTTP_HOST'] = $$_SERVER['HTTP_X_FORWARDED_HOST'];
  }
```

**効果**:
- PHP警告がゼロになる
- ログI/O負荷が大幅に減少

---

#### 2. wp-cronの無効化

**設定**:
```php
define('DISABLE_WP_CRON', true);
```

**効果**:
- 訪問者アクセス時のバックグラウンド処理が無効化
- システムcronで定期実行する方が安定（将来的に設定）

---

#### 3. MySQLのメモリ設定最適化

**修正ファイル**: `docker-compose.production.yml`

**変更前**:
```yaml
db:
  volumes:
    - db_data:/var/lib/mysql
```

**変更後**:
```yaml
db:
  command:
    - --max_connections=30
    - --innodb_buffer_pool_size=128M
    - --key_buffer_size=8M
    - --table_open_cache=64
  volumes:
    - db_data:/var/lib/mysql
```

**効果**:
- MySQLメモリ使用量: 437MB → 180-220MB（約50%削減）

---

#### 4. 不要なコンテナの停止

**停止したコンテナ**:
- `wp-pma` (phpMyAdmin): 本番環境では不要
- `benchmark-tools`: テスト用
- `benchmark-nextjs-benchmark-1`: テスト用

**効果**:
- 約50MBのメモリ解放

---

#### 5. WordPressメモリ制限の削減

**変更**:
- `WP_MEMORY_LIMIT`: 256M → 128M
- `WP_MAX_MEMORY_LIMIT`: 256M（管理画面用）

**効果**:
- PHPプロセス1つあたりのメモリ消費が削減

---

### 期待される改善

#### メモリ使用量（最適化後）
```
総メモリ: 3.8GB
使用中:   1.5GB (40%)
空き:     700MB以上  ← 改善
スワップ: 300MB以下  ← 大幅削減
MySQL:    200MB      ← 半減
```

#### パフォーマンス
- PHP警告ゼロ → ログI/O負荷削減
- wp-cron無効化 → バックグラウンド処理による遅延減少
- MySQL最適化 → クエリ実行が高速化
- スワップ使用減少 → システム全体の応答速度向上

---

## 中長期的な対策

### 1. NASメモリ増設（計画中）
- **現在**: 3.8GB
- **計画**: 32GB増設
- **効果**:
  - スワップ使用ゼロ
  - Redis導入可能
  - 複数サイト同時運用可能

### 2. Redis オブジェクトキャッシュ導入（メモリ増設後）
- WordPressのデータベースクエリをキャッシュ
- ページ生成速度が大幅に向上

### 3. 定期的なコンテナ再起動
- メモリリーク対策
- 毎週日曜日の午前3時に自動再起動（cronジョブ）

---

## 検証方法

### メモリ使用状況の確認
```bash
ssh akiranas
cd /volume1/docker/trust-code

# メモリ使用状況
free -h

# スワップ使用状況
swapon -s

# コンテナ別メモリ使用量
sudo docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### パフォーマンスの確認
```bash
# ログにPHP警告が出ていないことを確認
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production logs wordpress | grep -E "Warning|Error"

# wp-cronのタイムアウトが発生していないことを確認
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production logs nginx | grep "wp-cron.php" | grep "499"
```

### Cloudflare Tunnel の確認
```bash
# 接続が安定していることを確認
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production logs cloudflared | grep "Registered tunnel connection"
```

---

## 関連ドキュメント
- CLAUDE.md: プロジェクト全体の要件定義
- docs/deployment-guide.md: デプロイ手順書

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2025-11-18 | 初版作成：メモリ最適化とCloudflare Tunnelタイムアウト問題の解決 |
