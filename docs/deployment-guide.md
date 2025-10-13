# Docker イメージのビルド・デプロイ運用手順書

## 目次
1. [概要](#1-概要)
2. [環境変数の設定](#2-環境変数の設定)
3. [開発環境でのビルド・テスト](#3-開発環境でのビルドテスト)
4. [Docker イメージのビルド・プッシュ](#4-docker-イメージのビルドプッシュ)
5. [本番環境（NAS）へのデプロイ](#5-本番環境nasへのデプロイ)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. 概要

### 1.1 運用方針
- **開発環境**: ローカルMacでビルド・テスト
- **本番環境（NAS）**: Docker Hub からイメージをPULLして使用（ビルドしない）
- **環境変数**: 実行時に動的に設定（ビルド時に固定しない）

### 1.2 なぜこの運用方針なのか？
- **NASのビルドは遅い**: NASでDockerイメージをビルドすると時間がかかる
- **環境の柔軟性**: 同じイメージを複数の環境（開発/ステージング/本番）で使い回せる
- **URL変更に対応**: `WP_HOME`や`WP_SITEURL`を実行時に変更可能

### 1.3 デプロイのタイミング

#### 🔴 初回セットアップ または Dockerイメージの変更時
**対象**: `Dockerfile`, `init-wordpress.sh`, `docker-entrypoint-wrapper.sh` などの変更

**フロー**:
```
1. 環境変数ファイルを準備 (.env.local, .env.production)
2. Dockerイメージをビルド (開発環境)
3. Docker Hubへプッシュ (./build-and-push.sh)
4. NASで最新イメージをPULL
5. コンテナを起動
```

#### 🟢 テーマの変更のみ
**対象**: React/TypeScript ソースコード、PHPテンプレート、スタイルシート

**フロー**:
```
開発環境: ./deploy-dev.sh (テーマビルド → ローカルコンテナ再起動)
本番環境: ./deploy-prod.sh (テーマビルド → NASへコピー → キャッシュクリア)
```

**重要**: テーマはvolumeマウントで管理されるため、Dockerイメージの再ビルド・プッシュは不要

### 1.4 アーキテクチャ
```
┌─────────────────────────────────────────┐
│ 開発環境 (Mac)                          │
│                                         │
│  [Dockerイメージの変更時]               │
│    ./build-and-push.sh                  │
│      ↓                                  │
│    Dockerイメージをビルド               │
│      ↓                                  │
│    Docker Hub へプッシュ                │
│                                         │
│  [テーマの変更時]                       │
│    ./deploy-dev.sh                      │
│      ↓                                  │
│    テーマをビルド                       │
│      ↓                                  │
│    ローカルコンテナ再起動               │
└──────┬──────────────────────────────────┘
       │ docker push (build-and-push.sh)
       ↓
┌─────────────┐
│ Docker Hub  │
│ akirakano/  │
│ trust-code  │
│ -wordpress  │
└──────┬──────┘
       │ docker pull
       ↓
┌─────────────────────────────────────────┐
│ 本番環境 (NAS)                          │
│                                         │
│  [Dockerイメージの更新時]               │
│    docker pull                          │
│      ↓                                  │
│    コンテナ再起動                       │
│                                         │
│  [テーマの更新時]                       │
│    ./deploy-prod.sh (ローカルで実行)    │
│      ↓                                  │
│    NASへテーマをコピー                  │
│      ↓                                  │
│    キャッシュクリア                     │
└─────────────────────────────────────────┘
```

---

## 2. 環境変数の設定

### 2.1 開発環境 (`.env.local`)

プロジェクトルートに `.env.local` ファイルを作成（または編集）：

```bash
# データベース設定
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=wordpress_db
MYSQL_USER=wp_user
MYSQL_PASSWORD=your_password

# WordPress URL設定（開発環境）
WP_HOME=http://localhost:8080
WP_SITEURL=http://localhost:8080

# Nginx ポート設定
APP_PORT=8080
```

### 2.2 本番環境 (`.env.production`)

**NAS上**（`/volume1/docker/trust-code/`）に `.env.production` ファイルを作成：

```bash
# データベース設定
MYSQL_ROOT_PASSWORD=your_production_root_password
MYSQL_DATABASE=wordpress_db
MYSQL_USER=wp_user
MYSQL_PASSWORD=your_production_password

# WordPress URL設定（本番環境）
WP_HOME=https://trust-code.net
WP_SITEURL=https://trust-code.net

# Cloudflare Tunnel トークン
CF_TUNNEL_TOKEN=your_cloudflare_tunnel_token
```

### 2.3 環境変数ファイルの管理
- **Git管理対象外**: `.env.local`, `.env.production` は `.gitignore` に含める
- **テンプレート**: `.env.example` をGit管理対象に含める（秘密情報は含めない）

---

## 3. 開発環境でのビルド・テスト

### 3.1 Docker Compose で起動

```bash
# プロジェクトルートで実行
cd /Users/akirakano/IdeaProjects/homepage

# コンテナ起動（初回は自動ビルド）
docker-compose up -d --build

# ログ確認
docker-compose logs -f wordpress
```

### 3.2 アクセス確認

- **WordPress サイト**: http://localhost:8080
- **phpMyAdmin**: http://localhost:8081 (設定している場合)

### 3.3 テーマのビルド・デプロイ（開発環境）

```bash
cd wordpress/themes/readdy-theme4
./deploy-dev.sh
```

**処理内容**:
1. Viteキャッシュとビルド成果物をクリア
2. `npm install`
3. 本番ビルド（`npm run build`）
4. アセットコピー（`npm run copy:assets`）
5. WordPressコンテナ再起動
6. キャッシュとリライトルールをフラッシュ

### 3.4 停止

```bash
docker-compose down
```

---

## 4. Docker イメージのビルド・プッシュ

**⚠️ 重要**: このステップは、**初回セットアップ時** または **Dockerイメージの変更時のみ** 実施してください。

テーマのみの変更では、このステップは不要です（→ `deploy-dev.sh` または `deploy-prod.sh` を使用）。

### 4.1 実施タイミング

以下のファイルを変更した場合のみ実施：
- `wordpress/Dockerfile`
- `wordpress/init-wordpress.sh`
- `wordpress/docker-entrypoint-wrapper.sh`
- その他、Dockerイメージに含まれるファイル

### 4.2 事前準備

Docker Hub にログイン：
```bash
docker login
# ユーザー名: akirakano
# パスワード: (Docker Hub のアクセストークン)
```

### 4.3 イメージのビルド・プッシュ

プロジェクトルートにある `build-and-push.sh` スクリプトを使用：

```bash
cd /Users/akirakano/IdeaProjects/homepage
./build-and-push.sh
```

**処理内容**:
1. Docker Hubへのログイン確認
2. WordPress カスタムイメージをビルド
   - ベース: `wordpress:latest`
   - WP-CLI インストール
   - mod_rewrite 有効化
   - 初期化スクリプト（`init-wordpress.sh`）を含む
3. タグ付け
   - `latest`: 常に最新版
   - `YYYYMMDD-HHMMSS`: タイムスタンプベースのバージョン（ロールバック用）
4. Docker Hub にプッシュ（両方のタグ）
5. 次のステップを表示

**出力例**:
```
========================================
  Docker Image Build & Push Script
========================================

Image: akirakano1101/trust-code-wordpress
Tags: latest, 20251013-143022

[1/5] Docker Hubへのログイン状態を確認中...
✓ ログイン済み

[2/5] Dockerイメージをビルド中...
...
✓ ビルド完了

[3/5] ビルドされたイメージを確認中...
akirakano1101/trust-code-wordpress   latest       abc123def456   2 minutes ago   1.2GB
akirakano1101/trust-code-wordpress   20251013...  abc123def456   2 minutes ago   1.2GB

[4/5] Docker Hubへプッシュ中 (latest)...
✓ プッシュ完了 (latest)

[5/5] Docker Hubへプッシュ中 (20251013-143022)...
✓ プッシュ完了 (20251013-143022)

========================================
✓ すべての処理が完了しました！
========================================

次のステップ:
  1. NASにSSH接続
  2. 最新イメージをPULL
  3. コンテナを再起動
```

### 4.4 ビルド確認（手動）

```bash
# イメージが作成されたか確認
docker images | grep trust-code-wordpress

# 出力例:
# akirakano1101/trust-code-wordpress   latest         abc123def456   2 minutes ago   1.2GB
# akirakano1101/trust-code-wordpress   20251013-...   abc123def456   2 minutes ago   1.2GB
```

### 4.5 Docker Hub で確認

https://hub.docker.com/r/akirakano1101/trust-code-wordpress

- `latest` タグと日付タグの両方が表示されていることを確認
- 「Last pushed」の日時が最新であることを確認

---

## 5. 本番環境（NAS）へのデプロイ

**📋 前提条件**:
- ✅ Docker Hub に最新イメージがプッシュ済みであること（→ 4章を参照）
- ✅ NAS上に `.env.production` が作成済みであること（→ 2章を参照）

### 5.1 NAS への SSH 接続

```bash
ssh root@AkiraSynology
```

### 5.2 プロジェクトディレクトリへ移動

```bash
cd /volume1/docker/trust-code
```

### 5.3 環境変数ファイルの確認

`.env.production` が存在し、正しい内容であることを確認：

```bash
cat .env.production
```

**必須項目**:
- `WP_HOME=https://trust-code.net`
- `WP_SITEURL=https://trust-code.net`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `CF_TUNNEL_TOKEN`

### 5.4 最新イメージの取得

```bash
# Docker Hub から最新イメージをPULL
docker pull akirakano1101/trust-code-wordpress:latest
```

### 5.5 コンテナの再起動

```bash
# docker-compose.production.yml を使用して再起動
docker-compose -f docker-compose.production.yml --env-file .env.production down
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

### 5.6 ログ確認

```bash
# 全サービスのログ
docker-compose -f docker-compose.production.yml --env-file .env.production logs -f

# WordPressのみ
docker-compose -f docker-compose.production.yml --env-file .env.production logs -f wordpress
```

### 5.7 URL設定の確認

コンテナ起動後、`init-wordpress.sh` が自動実行され、`WP_HOME` と `WP_SITEURL` が設定されます。

ログに以下のメッセージが表示されることを確認：

```
WordPress initialized. Setting up URLs...
wp-config.php configured with URL: https://trust-code.net
WordPress URLs updated to: https://trust-code.net
Permalink structure configured
WordPress initialization complete.
```

### 5.8 キャッシュとリライトルールのフラッシュ（必要に応じて）

```bash
docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp cache flush --allow-root
docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp rewrite flush --allow-root
```

### 5.9 アクセス確認

ブラウザで https://trust-code.net にアクセスして、正常に表示されることを確認。

### 5.10 テーマのデプロイ（必要な場合）

テーマファイルは volume マウントで自動的に反映されます。

**ローカル → NAS へのコピー**:

```bash
# ローカル（Mac）で実行
cd /Users/akirakano/IdeaProjects/homepage/wordpress/themes/readdy-theme4

# ビルド
npm run build
npm run copy:assets

# NASへコピー
scp -r assets/ manifest.json functions.php inc/ style.css *.php \
  root@AkiraSynology:/volume1/docker/trust-code/wordpress/themes/readdy-theme4/
```

**NAS側でキャッシュフラッシュ**:

```bash
ssh root@AkiraSynology
cd /volume1/docker/trust-code
docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp cache flush --allow-root
docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp rewrite flush --allow-root
```

または、`wordpress/themes/readdy-theme4/deploy-prod.sh` スクリプトを使用。

---

## 6. トラブルシューティング

### 6.1 Docker Hub へのプッシュ権限エラー (insufficient_scope)

**症状**: `./build-and-push.sh` 実行時に以下のエラーが表示される:
```
server message: insufficient_scope: authorization failed
```

**原因**: Docker Hub への権限が不足している。

**解決方法**:

#### Step 1: Docker Hub にリポジトリが存在するか確認

ブラウザで以下のURLにアクセス:
```
https://hub.docker.com/r/akirakano1101/trust-code-wordpress
```

**リポジトリが存在しない場合**:
1. https://hub.docker.com/ にログイン
2. 「Create Repository」をクリック
3. **Name**: `trust-code-wordpress`
4. **Visibility**: Public（推奨）または Private
5. 「Create」をクリック

#### Step 2: アクセストークンを再生成

1. https://hub.docker.com/settings/security にアクセス
2. 「New Access Token」をクリック
3. **Description**: `trust-code-wordpress-push`
4. **Access permissions**: **Read, Write, Delete** を選択
5. 「Generate」をクリック
6. トークンをコピー（⚠️ 一度しか表示されません）

#### Step 3: Docker に再ログイン

```bash
# ログアウト
docker logout

# 再ログイン
docker login
# Username: akirakano1101
# Password: <Step 2で生成したアクセストークンを貼り付け>
```

#### Step 4: 再度プッシュ

```bash
./build-and-push.sh
```

### 6.2 Docker Hub にイメージがない (manifest not found)

**症状**: `docker pull` 実行時に以下のエラーが表示される:
```
Error response from daemon: manifest for akirakano1101/trust-code-wordpress:latest not found
```

**原因**: Docker Hub にイメージがプッシュされていない。

**解決方法**:

1. **ローカル（Mac）で** `build-and-push.sh` を実行してイメージをプッシュ:
   ```bash
   cd /Users/akirakano/IdeaProjects/homepage
   ./build-and-push.sh
   ```

2. Docker Hub で確認:
   https://hub.docker.com/r/akirakano1101/trust-code-wordpress

3. イメージがプッシュされたら、NASで再度 `docker pull`:
   ```bash
   docker pull akirakano1101/trust-code-wordpress:latest
   ```

### 6.2 URLが localhost:8080 にリダイレクトされる

**症状**: 本番環境で https://trust-code.net にアクセスすると http://localhost:8080 にリダイレクトされる。

**原因**: `WP_HOME` と `WP_SITEURL` が正しく設定されていない。

**解決方法**:

1. `.env.production` を確認：
   ```bash
   cat /volume1/docker/trust-code/.env.production
   ```

2. `docker-compose.production.yml` の `environment` セクションを確認：
   ```yaml
   environment:
     WP_HOME: ${WP_HOME}
     WP_SITEURL: ${WP_SITEURL}
   ```

3. コンテナを再起動：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production restart wordpress
   ```

4. WordPressデータベースのURL設定を確認：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp option get home --allow-root
   docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp option get siteurl --allow-root
   ```

5. 手動で更新（最終手段）：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp option update home "https://trust-code.net" --allow-root
   docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp option update siteurl "https://trust-code.net" --allow-root
   ```

### 6.3 init-wordpress.sh が実行されない

**症状**: ログに "WordPress initialized. Setting up URLs..." が表示されない。

**原因**: エントリーポイントが正しく実行されていない。

**解決方法**:

1. コンテナのログを確認：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production logs wordpress
   ```

2. イメージを再PULL：
   ```bash
   docker pull akirakano1101/trust-code-wordpress:latest
   docker-compose -f docker-compose.production.yml --env-file .env.production up -d --force-recreate
   ```

### 6.4 Docker イメージのビルドエラー

**症状**: `./build-and-push.sh` 実行時にエラーが発生。

**原因**: Dockerfile または関連スクリプトに問題がある。

**解決方法**:

1. エラーメッセージを確認
2. `wordpress/Dockerfile` を確認
3. `wordpress/init-wordpress.sh`, `wordpress/docker-entrypoint-wrapper.sh` の権限を確認：
   ```bash
   chmod +x wordpress/init-wordpress.sh
   chmod +x wordpress/docker-entrypoint-wrapper.sh
   ```

### 6.5 環境変数が反映されない

**症状**: `.env.production` を変更しても反映されない。

**原因**: コンテナが古い環境変数を保持している。

**解決方法**:

1. コンテナを完全に削除して再作成：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production down
   docker-compose -f docker-compose.production.yml --env-file .env.production up -d --force-recreate
   ```

2. キャッシュをクリアして再ビルド（開発環境の場合）：
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

### 6.6 テーマが反映されない

**症状**: テーマファイルを更新しても変更が反映されない。

**原因**: WordPressのキャッシュ、ブラウザキャッシュ、または volume マウントの問題。

**解決方法**:

1. WordPressキャッシュをフラッシュ：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp cache flush --allow-root
   ```

2. ブラウザのキャッシュをクリア（Shift + F5）

3. volume マウントを確認：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress ls -la /var/www/html/wp-content/themes/readdy-theme4/
   ```

4. コンテナを再起動：
   ```bash
   docker-compose -f docker-compose.production.yml --env-file .env.production restart wordpress
   ```

---

## まとめ

この手順書に従うことで：

1. ✅ **開発環境でビルド**: NASでビルドする必要がない
2. ✅ **Docker Hub 経由でデプロイ**: イメージをPULLするだけ
3. ✅ **環境変数で柔軟に設定**: URLを実行時に変更可能
4. ✅ **同じイメージを複数環境で使用**: 開発/ステージング/本番で共通

### 作業フロー（まとめ）

#### 🔴 初回セットアップ または Dockerイメージの変更時
```bash
# 1. 環境変数ファイルを準備
cp .env.example .env.local
# .env.local を編集

# 2. Dockerイメージをビルド・プッシュ（ローカル）
./build-and-push.sh

# 3. NASで最新イメージをPULL（NAS）
ssh root@AkiraSynology
cd /volume1/docker/trust-code
docker pull akirakano1101/trust-code-wordpress:latest
docker-compose -f docker-compose.production.yml --env-file .env.production down
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

#### 🟢 テーマの変更のみ
```bash
# 開発環境
cd wordpress/themes/readdy-theme4
./deploy-dev.sh

# 本番環境（ローカルから実行）
cd wordpress/themes/readdy-theme4
./deploy-prod.sh
```

### 次のステップ
- ステージング環境の構築（オプション）
- CI/CDパイプラインの構築（GitHub Actions）
- 自動バックアップの設定

### 参考リンク
- Docker Hub: https://hub.docker.com/r/akirakano1101/trust-code-wordpress
- CLAUDE.md: プロジェクト要件定義
- .env.example: 環境変数テンプレート

---

**最終更新**: 2025-10-13
