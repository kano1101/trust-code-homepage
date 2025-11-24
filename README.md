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
- アクセス: `https://trust-code.net`
- nginx設定: `nginx/conf.d/production.conf` を使用
- 環境設定: `.env.production`

## セットアップ

### ローカル開発環境

1. リポジトリをクローン
2. イメージをビルド（初回のみ）:
   ```bash
   docker-compose build
   ```

3. ローカル開発環境を起動:
   ```bash
   docker-compose --env-file .env.local up -d
   ```

4. ブラウザで `http://localhost:8080` にアクセス

### 本番環境（NAS）デプロイ

#### 📦 デプロイ方法

このプロジェクトは、**手動デプロイ**と**GitHub Actions自動デプロイ**の2つの方法をサポートしています。

##### 方法1: GitHub Actions（推奨）

`main` または `master` ブランチにプッシュすると、自動的にデプロイが実行されます。

```bash
git add .
git commit -m "Update theme styles"
git push origin main
```

**セットアップ方法**: `docs/github-actions-setup.md` を参照してください。

**クイックスタート（検証）**:
```bash
# 1. 環境変数ファイルを作成
cp .env.secrets.example .env.secrets
nano .env.secrets  # 実際の値を設定

# 2. 検証スクリプトを実行
./scripts/verify-secrets.sh

# 3. すべてのテストに合格したらGitHub Secretsに設定
```

**メリット**:
- ✅ git push で自動デプロイ
- ✅ テーマのみの変更時はDockerイメージのビルドをスキップ
- ✅ GitHub Actions UIでデプロイ状況を確認
- ✅ Tailscale経由のセキュアな接続

##### 方法2: 手動デプロイ

**詳細な手順**: `docs/deployment-guide.md` を参照してください。

**🔴 初回セットアップ / Dockerイメージの変更時**

1. ローカルでイメージをビルド＆プッシュ:
   ```bash
   ./build-and-push.sh
   ```

2. NASで最新イメージをpullして起動:
   ```bash
   cd /volume1/docker/trust-code/

   # 最新イメージをpull
   docker pull akirakano1101/trust-code-wordpress:latest

   # コンテナを起動（ベースファイル + オーバーレイファイルの両方を指定）
   sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production down
   sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production up -d
   ```

**🟢 テーマの変更のみ**

1. ローカルでテーマをビルド＆デプロイ:
   ```bash
   cd wordpress/themes/readdy-theme4
   ./deploy-prod.sh
   ```

2. NAS上でキャッシュをクリア:
   ```bash
   cd /volume1/docker/trust-code/
   sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress wp cache flush --allow-root
   sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress wp rewrite flush --allow-root
   ```

## 環境変数

### 必須環境変数（.envファイルで設定）

- `WP_HOME`: WordPressのホームURL
- `WP_SITEURL`: WordPressのサイトURL
- `MYSQL_ROOT_PASSWORD`: MySQLのrootパスワード
- `MYSQL_DATABASE`: データベース名
- `MYSQL_USER`: MySQLユーザー名
- `MYSQL_PASSWORD`: MySQLパスワード
- `CF_TUNNEL_TOKEN`: Cloudflare Tunnelトークン（本番環境のみ）
- `GA_MEASUREMENT_ID`: Google Analytics 測定ID（オプション）

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

## 注意事項

- `.env`、`.env.local`、`.env.production` にはパスワードなどの機密情報が含まれるため、Gitにコミットしないこと
- 本番環境デプロイ前に必ず `.env.production` のパスワードを変更すること
- Docker Hubにプッシュする場合、イメージ名を自分のアカウント名に変更すること