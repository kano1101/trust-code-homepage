# Trust Code WordPress Environment

WordPressの開発・本番環境を Docker で管理するプロジェクト

## 特徴

- 環境変数で開発/本番環境を切り替え可能
- データベースのURLも自動的に環境に応じて設定
- wp-cli統合でWordPress管理が簡単
- Cloudflare Tunnel対応

## 環境の種類

### 1. ローカル開発環境
- アクセス: `http://localhost:8080`
- nginx設定: `nginx/conf.d/default.conf`
- 環境設定: `.env.local`

### 2. 本番環境（NAS）
- アクセス: `https://trust-code.net/wp-admin`
- nginx設定: `nginx/conf.d/production.conf` を使用
- 環境設定: `.env.production`

## セットアップ

### ローカル開発環境

1. リポジトリをクローン
2. イメージをビルド（初回のみ）:
   ```bash
   cd trust-code
   docker-compose build
   ```

3. ローカル開発環境を起動:
   ```bash
   docker-compose --env-file .env.local up -d
   ```

4. ブラウザで `http://localhost:8080` にアクセス

### 本番環境（NAS）デプロイ

#### 方法1: Docker Hubからイメージをpull（推奨）

1. ローカルでイメージをビルド＆プッシュ:
   ```bash
   cd trust-code
   ./build-and-push.sh
   ```

2. NASで以下を実行:
   ```bash
   cd trust-code

   # nginx設定を本番用に切り替え
   mv nginx/conf.d/default.conf nginx/conf.d/default.conf.dev
   mv nginx/conf.d/production.conf nginx/conf.d/default.conf

   # 本番環境起動
   docker-compose -f docker-compose.production.yml --env-file .env.production pull
   docker-compose -f docker-compose.production.yml --env-file .env.production up -d
   ```

#### 方法2: ローカルでビルド

```bash
cd trust-code
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build
```

## 環境変数

### 必須環境変数（.envファイルで設定）

- `WP_HOME`: WordPressのホームURL
- `WP_SITEURL`: WordPressのサイトURL
- `MYSQL_ROOT_PASSWORD`: MySQLのrootパスワード
- `MYSQL_DATABASE`: データベース名
- `MYSQL_USER`: MySQLユーザー名
- `MYSQL_PASSWORD`: MySQLパスワード
- `CF_TUNNEL_TOKEN`: Cloudflare Tunnelトークン

## ディレクトリ構成

```
trust-code/
├── docker-compose.yml              # 開発環境用（build設定あり）
├── docker-compose.production.yml   # 本番環境用（pullのみ）
├── .env.local                      # ローカル開発環境設定
├── .env.production                 # 本番環境設定
├── build-and-push.sh               # イメージビルド＆プッシュスクリプト
├── wordpress/
│   ├── Dockerfile                  # wp-cli統合カスタムイメージ
│   ├── init-wordpress.sh           # 起動時URL自動設定スクリプト
│   └── themes/                     # カスタムテーマ
├── nginx/
│   └── conf.d/
│       ├── default.conf            # 開発環境用（$schemeを使用）
│       └── production.conf         # 本番環境用（httpsを固定）
└── php/
    └── php.ini                     # PHP設定
```

## よく使うコマンド

### wp-cliを使う
```bash
docker exec wp-app wp --help --allow-root
```

### URLを手動で変更
```bash
# ローカル開発環境に変更
docker exec wp-app wp option update home 'http://localhost:8080' --allow-root
docker exec wp-app wp option update siteurl 'http://localhost:8080' --allow-root

# 本番環境に変更
docker exec wp-app wp option update home 'https://trust-code.net' --allow-root
docker exec wp-app wp option update siteurl 'https://trust-code.net' --allow-root
```

### ログ確認
```bash
docker logs wp-app
docker logs wp-nginx
docker logs wp-db
```

### コンテナ再起動
```bash
docker-compose restart wordpress
docker-compose restart nginx
```

## トラブルシューティング

### localhostでHTTPSリダイレクトされる場合
- nginx設定が `proxy_set_header X-Forwarded-Proto https;` になっていないか確認
- 開発環境では `$scheme` を使用すること

### データベースURLが反映されない場合
```bash
# コンテナを完全に再作成
docker-compose --env-file .env.local up -d --force-recreate wordpress
```

### WordPressファイルがない場合
```bash
# wp_htmlボリュームを削除して再作成
docker-compose down
docker volume rm trust-code_wp_html
docker-compose --env-file .env.local up -d
```

### MySQLのやり直しの際に必要なコード

```bash
# DBコンテナ内で、wp_user のパスワードを WordPress と同じにする
docker compose exec db mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "
ALTER USER 'wp_user'@'%' IDENTIFIED WITH mysql_native_password BY 'change_user_pw';
FLUSH PRIVILEGES;
"
```

### 権限の修正
```bash
# 権限チェック
docker compose exec wordpress bash -lc '
chown -R www-data:www-data /var/www/html/wp-content &&
find /var/www/html/wp-content -type d -exec chmod 775 {} \; &&
find /var/www/html/wp-content -type f -exec chmod 664 {} \;
'
```

## 注意事項

- `.env`、`.env.local`、`.env.production` にはパスワードなどの機密情報が含まれるため、Gitにコミットしないこと
- 本番環境デプロイ前に必ず `.env.production` のパスワードを変更すること
- Docker Hubにプッシュする場合、イメージ名を自分のアカウント名に変更すること
