# Trust Code WordPress ブログプロジェクト - 要件定義

## プロジェクト概要

### サイトの目的
- **用途**: ブログサイト
- **最終目標**: コミュニティ支援を目的としたブログプラットフォーム
- **アクセス規模**:
  - 初期: 小〜中規模（100〜1,000アクセス/日）
  - 数年後の目標: 10,000アクセス/日

---

## 環境構成

### 開発環境
- **プラットフォーム**: Mac（ローカルDocker）
- **URL**: http://localhost:8080
- **Docker Compose**: `docker-compose.yml`
- **環境変数**: `.env` または `.env.local`

### 本番環境
- **プラットフォーム**: 自宅NAS（AkiraSynology）
- **URL**: https://trust-code.net
- **Docker Compose**: `docker-compose.production.yml`
- **環境変数**: `.env.production`
- **NASパス**: `/volume1/docker/trust-code/`

### ステージング環境（検討中）
- ベストプラクティスに基づき、必要に応じて追加
- 本番環境へのデプロイ前のテスト環境として利用

---

## インフラ構成

### Docker Services

#### 1. MySQL (db)
- **イメージ**: `mysql:8.0`
- **コンテナ名**: `wp-db`
- **ポート**: 3306
- **Volume**:
  - 開発: `homepage_db_data_dev`
  - 本番: `db_data`
- **ヘルスチェック**: 有効

#### 2. WordPress (wordpress)
- **イメージ**: `akirakano/trust-code-wordpress:latest`
- **コンテナ名**: `wp-app`
- **ベースイメージ**: `wordpress:latest`
- **追加機能**:
  - WP-CLI インストール済み
  - カスタムエントリポイント（初期化スクリプト）
- **Volume マウント**:
  - `wp_html_dev` または `wp_html`: WordPressファイル
  - `./wordpress/themes`: テーマディレクトリ（開発時のホットリロード用）
  - `./php/php.ini`: PHPカスタム設定

#### 3. Nginx (nginx)
- **イメージ**: `nginx:alpine`
- **コンテナ名**: `wp-nginx`
- **ポート**:
  - 開発: `8080:80`
  - 本番: `80` (expose only)
- **設定ファイル**: `./nginx/conf.d/`

#### 4. phpMyAdmin (phpmyadmin)
- **イメージ**: `phpmyadmin/phpmyadmin:latest`
- **コンテナ名**: `wp-pma`
- **ポート**: 80 (expose)
- **用途**: データベース管理

#### 5. Cloudflare Tunnel (cloudflared)
- **イメージ**: `cloudflare/cloudflared:latest`
- **コンテナ名**: `wp-cloudflared`
- **設定**: `.env.production` の `CF_TUNNEL_TOKEN`
- **用途**: HTTPS公開（本番のみ）

---

## カスタムテーマ: readdy-theme4

### 技術スタック
- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **多言語対応**: i18next
- **ルーティング**: React Router DOM
- **その他**: Firebase, Supabase, Stripe (将来的な拡張用)

### ページ構成

#### 動的ページ
1. **トップページ** (`index.php`): ブログ一覧を兼ねる
2. **カテゴリ一覧** (`page-categories.php`)
3. **カテゴリ別記事一覧** (`category.php`)
4. **タグ一覧** (`page-rss.php`)
5. **タグ別記事一覧** (`tag.php`)
6. **個別記事ページ** (`single.php`)
7. **アーカイブページ** (`archive.php`)

#### 固定ページ
1. **About** (`page-about.php`)
2. **Contact** (`page-contact.php`)
3. **プライバシーポリシー** (`page-privacy.php`)
4. **利用規約** (`page-terms.php`)

### 機能要件

#### コア機能
- **いいね機能**: Simple Like Plugin を使用
- **コメント機能**: WordPress標準コメント機能
  - ログイン不要
  - 管理者承認制

#### デザイン要件
- レスポンシブデザイン（モバイル対応）
- 各記事にいいねボタンとコメント欄を表示
- Tailwind CSS によるモダンなUI

### 完成度
- 現在: **50〜60%**
- 主要ページのテンプレートは作成済み
- フロントエンドビルドシステムは稼働中

---

## ビルド・デプロイフロー

### 開発フロー

#### 1. テーマのビルド（開発環境）
```bash
cd wordpress/themes/readdy-theme4
./deploy-dev.sh
```

**処理内容**:
1. Viteキャッシュとビルド成果物をクリア
2. 古いアセット（JS/CSS）を削除
3. `npm install`
4. 本番ビルド（`npm run build`）
5. アセットコピー（`npm run copy:assets`）
6. Docker Compose でWordPressコンテナ再起動
7. WordPressキャッシュとリライトルールをフラッシュ

**特徴**:
- プロジェクトルートを動的に検出（環境非依存）
- `.env.local` が存在しない場合は `.env` を使用
- エラーハンドリング強化
- カラフルなログ出力

#### 2. Docker環境の起動
```bash
# プロジェクトルートで
docker-compose up -d --build
```

#### 3. Docker環境の停止
```bash
docker-compose down
```

### 本番デプロイフロー

#### 方法1: テーマビルド統合型（推奨）
```bash
cd wordpress/themes/readdy-theme4
./deploy-prod.sh
```

**処理内容**:
1. Viteキャッシュとビルド成果物をクリア
2. 古いアセット（JS/CSS）を削除
3. `npm install`
4. 本番ビルド（`npm run build`）
5. アセットコピー（`npm run copy:assets`）
6. ユーザー確認後、`rsync` でNASへテーマを転送
7. NAS上での操作手順を表示

**特徴**:
- ビルドからデプロイまで一括実行
- デプロイ前に確認プロンプト表示
- 不要ファイル自動除外（開発用ファイル、設定ファイルなど）
- 環境変数でNAS接続情報をカスタマイズ可能

**環境変数**:
- `NAS_USER`: NASのユーザー名（デフォルト: root）
- `NAS_HOST`: NASのホスト名（デフォルト: AkiraSynology）
- `NAS_PROJECT_PATH`: NASのプロジェクトパス（デフォルト: /volume1/docker/trust-code）

#### 方法2: テーマのみデプロイ
```bash
# プロジェクトルートで
./deploy-to-nas.sh
```

**用途**: 既にビルド済みのテーマをNASへデプロイする場合

#### 3. NAS上での操作
```bash
ssh root@AkiraSynology
cd /volume1/docker/trust-code
docker-compose -f docker-compose.production.yml --env-file .env.production restart wordpress
docker-compose -f docker-compose.production.yml --env-file .env.production exec -T wordpress wp cache flush --allow-root
docker-compose -f docker-compose.production.yml --env-file .env.production exec -T wordpress wp rewrite flush --allow-root
```

#### 4. Dockerイメージのビルド・プッシュ（必要時）
```bash
./build-and-push.sh
```

---

## Git管理戦略

### リポジトリ構成

#### 1. メインリポジトリ (homepage)
- **対象**: プロジェクト全体
- **Git管理対象**:
  - `docker-compose.yml`, `docker-compose.production.yml`
  - `nginx/`, `php/`, `wordpress/Dockerfile`, etc.
  - スクリプト類（`build-and-push.sh`, `deploy-to-nas.sh`, etc.）
  - `.env.example`（環境変数のテンプレート）
- **Git管理対象外** (`.gitignore`):
  - `.env`, `.env.local`, `.env.production`（秘密情報）
  - `wordpress/themes/readdy-theme4/node_modules`
  - `wordpress/themes/readdy-theme4/out`, `wordpress/themes/readdy-theme4/assets/*.js`, `*.css`, `*.map`
- **GitHub URL**: （設定予定）

#### 2. サブモジュール (readdy-theme4)
- **対象**: カスタムテーマ
- **パス**: `wordpress/themes/readdy-theme4`
- **Git管理対象**:
  - `src/`: TypeScript/React ソースコード
  - `*.php`: テーマテンプレート
  - `package.json`, `vite.config.ts`, `tailwind.config.ts`
  - `deploy-dev.sh`, `deploy-prod.sh`
- **Git管理対象外**:
  - `node_modules/`, `out/`, `assets/*.js`, `*.css`, `*.map`, `manifest.json`
- **GitHub URL**: （設定予定）

### サブモジュールの運用

#### 初期設定
```bash
cd /Users/akirakano/IdeaProjects/homepage
git submodule add <readdy-theme4のGitHub URL> wordpress/themes/readdy-theme4
git submodule update --init --recursive
```

#### 更新時
```bash
cd wordpress/themes/readdy-theme4
git pull origin main
cd ../../../
git add wordpress/themes/readdy-theme4
git commit -m "Update readdy-theme4 submodule"
```

---

## データ管理

### データベースバックアップ

#### 1. 手動バックアップ
```bash
# 開発環境
docker-compose exec db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} wordpress_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 本番環境（NAS上で実行）
docker-compose -f docker-compose.production.yml exec db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} wordpress_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. 自動バックアップ（検討中）
- cron ジョブで定期実行
- バックアップファイルをNASまたはクラウドストレージに保存

### データベースリストア

#### 方法1: SQLファイルから復元
```bash
# バックアップファイルをコンテナ内にコピー
docker cp backup.sql wp-db:/tmp/backup.sql

# データベースに復元
docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} wordpress_db < /tmp/backup.sql
```

#### 方法2: Volumeから復元
```bash
# 既存のVolumeを使用してコンテナを起動
# docker-compose.yml の volumes セクションで指定
```

### データマイグレーション（現在の課題）

#### 現状
- 以前のデータは以下のVolumeに保存されている:
  - `trust-code_db_data_dev`: MySQLデータベース
  - `trust-code_wp_html_dev`: WordPressファイル
- ディレクトリ構成変更により、新しいVolume (`homepage_db_data_dev`, `homepage_wp_html_dev`) が作成された

#### マイグレーション方法（対応予定）
1. **Volume名の変更**:
   - `docker-compose.yml` で古いVolumeを参照する
   - または、Volume間でデータをコピー

2. **SQLダンプを使った移行**:
   ```bash
   # 古いVolumeからバックアップ
   docker run --rm -v trust-code_db_data_dev:/source -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz /source

   # 新しいVolumeにリストア
   docker run --rm -v homepage_db_data_dev:/target -v $(pwd):/backup alpine tar xzf /backup/db_backup.tar.gz -C /target --strip-components=1
   ```

---

## パフォーマンス・セキュリティ

### キャッシュ戦略
- **WordPress キャッシュプラグイン**: WP Super Cache または W3 Total Cache（検討中）
- **CDN**: Cloudflare 経由（設定済み）
- **オブジェクトキャッシュ**: Redis（将来的に検討）

### セキュリティ対策
- **HTTPS**: Cloudflare Tunnel 経由で強制
- **WordPress設定**:
  - `FORCE_SSL_ADMIN`: 有効（本番のみ）
  - `WP_DEBUG`: 開発環境のみ有効
  - `FS_METHOD`: 'direct'（ファイル書き込み権限）
- **ファイアウォール**: NASのファイアウォール設定
- **定期更新**: WordPress本体、プラグイン、テーマの定期アップデート

### バックアップ戦略
- **頻度**: 週次（自動化予定）
- **対象**:
  - データベース（MySQLダンプ）
  - WordPressファイル（wp-content/uploads）
  - テーマファイル（Git管理）
- **保存先**: NAS + クラウドストレージ（検討中）

---

## プラグイン構成

### 必須プラグイン
1. **Simple Like Plugin**: いいね機能
2. **Akismet Anti-spam**: スパムコメント対策
3. **WP Super Cache** または **W3 Total Cache**: キャッシュ（検討中）
4. **Contact Form 7**: お問い合わせフォーム（Contactページ用）

### 推奨プラグイン
- **Yoast SEO** または **Rank Math**: SEO対策
- **UpdraftPlus**: バックアップ自動化
- **Wordfence Security**: セキュリティ強化

---

## 開発ガイドライン

### ディレクトリ構造
```
homepage/
├── docker-compose.yml              # 開発環境用
├── docker-compose.production.yml   # 本番環境用
├── .env.local                      # 開発環境変数
├── .env.production                 # 本番環境変数
├── build-and-push.sh               # Dockerイメージビルド・プッシュ
├── deploy-to-nas.sh                # NASへのデプロイ
├── nginx/
│   └── conf.d/                     # Nginx設定
├── php/
│   └── php.ini                     # PHP設定
├── wordpress/
│   ├── Dockerfile                  # WordPressカスタムイメージ
│   ├── docker-entrypoint-wrapper.sh
│   ├── init-wordpress.sh
│   └── themes/
│       └── readdy-theme4/          # カスタムテーマ（Git submodule）
│           ├── src/                # React/TypeScript ソース
│           ├── assets/             # ビルド済みアセット
│           ├── out/                # Vite ビルド出力
│           ├── *.php               # テーマテンプレート
│           ├── functions.php       # テーマ関数
│           ├── package.json
│           ├── vite.config.ts
│           ├── tailwind.config.ts
│           ├── deploy-dev.sh       # 開発環境デプロイ
│           └── deploy-prod.sh      # 本番環境デプロイ
└── CLAUDE.md                       # 本ドキュメント
```

### コーディング規約
- **PHP**: WordPress Coding Standards
- **TypeScript/React**: ESLint + Prettier（設定済み）
- **CSS**: Tailwind CSS ユーティリティクラス優先

### テスト戦略（今後）
- **単体テスト**: Jest（Reactコンポーネント）
- **E2Eテスト**: Playwright または Cypress
- **手動テスト**: 各ブラウザでの表示確認

---

## 今後のタスク

### 緊急度: 高
1. **データマイグレーション**: 旧Volumeから新Volumeへのデータ移行
2. **deploy-dev.sh, deploy-prod.sh のパス修正**: `trust-code` → `homepage`
3. **Git管理の開始**: メインリポジトリとサブモジュールの作成
4. **テーマ開発の継続**: 50% → 100% への完成

### 緊急度: 中
1. **キャッシュプラグインの選定・導入**
2. **バックアップ自動化の構築**
3. **ステージング環境の検討・構築**
4. **SEOプラグインの導入と設定**

### 緊急度: 低
1. **Redis オブジェクトキャッシュの導入**
2. **E2Eテストの導入**
3. **CI/CDパイプラインの構築**（GitHub Actions）
4. **モニタリング・ログ収集の設定**

---

## 連絡先・参考資料

- **NAS SSH**: `ssh root@AkiraSynology`
- **本番URL**: https://trust-code.net
- **開発URL**: http://localhost:8080
- **Cloudflare Tunnel**: トークンは `.env.production` に保存

---

## 変更履歴

- **2025-10-08**: 初版作成（ヒアリング結果を基に）
