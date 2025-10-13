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
- **環境変数**: `.env.local` (推奨) または `.env`
- **環境変数の設定**:
  - `WP_HOME`: `http://localhost:8080`
  - `WP_SITEURL`: `http://localhost:8080`
  - データベース認証情報（MYSQL_*）

### 本番環境
- **プラットフォーム**: 自宅NAS（AkiraSynology）
- **URL**: https://trust-code.net
- **Docker Compose**: `docker-compose.production.yml`
- **環境変数**: `.env.production`
- **NASパス**: `/volume1/docker/trust-code/`
- **運用方針**: Docker Hub からイメージをPULLして使用（NASではビルドしない）
- **環境変数の設定**:
  - `WP_HOME`: `https://trust-code.net`
  - `WP_SITEURL`: `https://trust-code.net`
  - データベース認証情報（MYSQL_*）
  - Cloudflare Tunnel トークン（CF_TUNNEL_TOKEN）

### 環境変数テンプレート
- **ファイル**: `.env.example`
- **用途**: 環境変数のテンプレート（Git管理対象）
- **使用方法**:
  - 開発環境: `.env.example` を `.env.local` にコピーして編集
  - 本番環境: `.env.example` を参考に NAS上に `.env.production` を作成

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
- **イメージ**: `akirakano1101/trust-code-wordpress:latest`
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
- **マークダウン**: Parsedown + ParsedownExtra（公式版、inc/ディレクトリに配置）
  - ACFカスタムフィールド `md_body` でMarkdown記述可能
  - REST APIで `md_body` と `md_html` フィールドを提供

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
  - プラグイン: [Simple Like](https://wordpress.org/plugins/simple-like/)
  - インストール後、記事に自動的にいいねボタンが表示される
  - フロントエンド: `functions.php` でREST APIに `likes_count` フィールドを追加
  - single/page.tsxにプレースホルダーを配置（プラグインが自動挿入）
- **コメント機能**: WordPress標準コメント機能 + カスタムREST API
  - ログイン不要
  - 管理者承認制
  - `/readdy/v1/posts/{id}/comments` エンドポイントでフォーム送信

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

**📖 詳細な手順**: `docs/deployment-guide.md` を参照してください。

#### 🔴 初回セットアップ または Dockerイメージの変更時

**対象**: `Dockerfile`, `init-wordpress.sh`, `docker-entrypoint-wrapper.sh` などの変更

##### 1. 環境変数ファイルを準備
```bash
# 開発環境（ローカル）
cp .env.example .env.local
# .env.local を編集（WP_HOME, MYSQL_PASSWORD など）

# 本番環境（NAS上）
# NASに SSH接続して .env.production を作成
ssh root@AkiraSynology
cd /volume1/docker/trust-code
# .env.production を作成・編集（WP_HOME=https://trust-code.net など）
```

##### 2. Dockerイメージをビルド・プッシュ（ローカル）
```bash
cd /Users/akirakano/IdeaProjects/homepage
./build-and-push.sh
```

**処理内容**:
1. Docker Hubへのログイン確認
2. WordPress カスタムイメージをビルド
3. タグ付け（`latest` + タイムスタンプ版）
4. Docker Hub にプッシュ
5. 次のステップを表示

##### 3. NASで最新イメージをPULL
```bash
ssh root@AkiraSynology
cd /volume1/docker/trust-code
docker pull akirakano1101/trust-code-wordpress:latest
docker-compose -f docker-compose.production.yml --env-file .env.production down
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

##### 4. ログ確認
```bash
docker-compose -f docker-compose.production.yml --env-file .env.production logs -f wordpress
# "WordPress initialized. Setting up URLs..." が表示されることを確認
```

---

#### 🟢 テーマの変更のみ

**対象**: React/TypeScript ソースコード、PHPテンプレート、スタイルシート

##### 方法1: テーマビルド統合型（推奨）
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
6. ユーザー確認後、NASへテーマを転送（scp）
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

##### 方法2: NAS上での操作
```bash
ssh root@AkiraSynology
cd /volume1/docker/trust-code
docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp cache flush --allow-root
docker-compose -f docker-compose.production.yml --env-file .env.production exec wordpress wp rewrite flush --allow-root
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

### Gitコミットメッセージのガイドライン

#### 基本ルール
- **言語**: 日本語を使用
- **形式**: 簡潔な要約 + 詳細（必要に応じて）
- **署名**: Claude Codeで生成したコミットには以下を含める
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

#### コミットメッセージ例
```bash
# 良い例
git commit -m "不要なファイルを削除、Aboutページの表示問題を修正

主な変更:
- 不要なファイル削除: build-quick.sh, Parsedown関連ファイル
- functions.phpからMarkdown関連コードを削除
- Aboutページのbio表示問題を修正

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 避けるべき例
git commit -m "fix"
git commit -m "Update files"
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
1. **Simple Like**: いいね機能
   - インストール方法: WordPressダッシュボード → プラグイン → 新規追加 → "Simple Like" で検索してインストール
   - 有効化後、記事に自動的にいいねボタンが追加される
2. **Akismet Anti-spam**: スパムコメント対策
3. **WP Super Cache** または **W3 Total Cache**: キャッシュ（検討中）

### カスタム実装機能
1. **お問い合わせフォーム**: カスタムREST APIで実装（`functions.php` + `/readdy/v1/contact`）
2. **Markdown対応**: Parsedown + ParsedownExtra（`inc/`ディレクトリに配置）
3. **コメント投稿API**: `/readdy/v1/posts/{id}/comments` エンドポイント

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

### 2025-10-08

#### 初版作成
- ヒアリング結果を基に要件定義ドキュメントを作成

#### コードクリーンアップとバグ修正
**コミット**: `7a8c046` - "不要なコードとファイルを削除、Aboutページの表示問題を修正"

**削除したファイル**:
- `build-quick.sh`: 簡易ビルドスクリプト（`deploy-dev.sh`に統合済み）
- `inc/Parsedown.php`: Markdownパーサー（不要、WordPressの標準エディタを使用）
- `inc/ParsedownExtra.php`: Parsedown拡張機能（不要）
- `src/data/posts.ts`: 静的ブログデータ（WordPress REST APIに移行済み）
- `src/pages/home/components/BlogPost.tsx`: 重複コンポーネント（BlogCardに統合）
- `src/pages/top/page.tsx`: 未使用のトップページ

**functions.phpの変更**:
- Markdown変換関連のコードを完全削除（70行以上削減）
- `rtheme_get_parsedown()`, `rtheme_get_md_body()`, `rtheme_render_markdown()` 関数を削除
- REST APIから `md_body` と `md_html` フィールドを削除
- コメントヘッダーを更新してMarkdown関連の記述を削除

**Aboutページの修正**:
- `src/pages/about/page.tsx`: bio（"ケーキ屋の社内エンジニア"）と birthdate（"1989年11月1日生"）を別々の `<p>` タグに分割
- `\n` エスケープ文字が表示される問題を解決

**いいね機能の確認**:
- バックエンド: `functions.php` の `/readdy/v1/posts/{id}/like` と `/readdy/v1/posts/{id}/unlike` エンドポイントが正常に実装されていることを確認
- フロントエンド: `src/hooks/usePostLikes.ts` が正常に機能することを確認
- UI: `src/pages/single/page.tsx` でいいねボタンが正しく表示されることを確認

**その他**:
- Gitコミットメッセージガイドラインを追加（日本語使用、Claude Code署名）
- 技術スタックを更新（Firebase, Supabase, Stripeは削除済み）

#### Markdown対応の再追加とSimple Like Pluginへの切り替え
**コミット**: `fdf1cc6` - "Markdown対応を再追加、Simple Like Pluginに切り替え、表示問題を修正"

**Markdown対応の再追加**:
- 公式ParsedownとParsedownExtraをGitHubから再ダウンロード（inc/ディレクトリに配置）
- functions.phpにMarkdown変換機能を再追加
  - `rtheme_get_parsedown()`, `rtheme_get_md_body()`, `rtheme_render_markdown()` 関数
  - ACFカスタムフィールド `md_body` からのMarkdown読み込み
  - キャッシュ機能（`_md_html_cache` メタデータ）
  - REST APIに `md_body` と `md_html` フィールドを追加

**Simple Like Pluginへの切り替え**:
- カスタムいいねAPIエンドポイント（`/readdy/v1/posts/{id}/like` と `/readdy/v1/posts/{id}/unlike`）を削除
- カスタムいいね関数（`readdy_like_post()`, `readdy_unlike_post()`）を削除
- single/page.tsxから `usePostLikes` フックの使用を削除
- single/page.tsxにSimple Like Pluginのプレースホルダーを追加
- functions.phpで `likes_count` フィールドをSimple Like Pluginのメタデータ（`_post_like_count`）に変更

**Aboutページの修正**:
- `src/pages/about/page.tsx`: bio（"ケーキ屋の社内エンジニア"）とbirthdate（"1989年11月1日生"）を `<br />` で改行
- 別々の `<p>` タグではなく、1つの `<p>` タグ内で `<br />` を使用

**確認済み**:
- BlogCardの抜粋は既に「...」表示（「[...]」ではない）

---

## 本番環境へのデプロイ（NAS）

**詳細な手順書**: `docs/deployment-guide.md` を参照してください。

以下は概要のみ記載します。完全な手順については上記ドキュメントをご覧ください。

### Docker Composeのvolume機能を利用したデプロイ

#### 仕組み

**docker-compose.production.yml**（71行目）:
```yaml
volumes:
  - ./wordpress/themes:/var/www/html/wp-content/themes
```

この設定により、NASホスト上の`./wordpress/themes`ディレクトリがWordPressコンテナ内の`/var/www/html/wp-content/themes`に自動マウントされます。

**メリット**:
- rsync不要（SynologyNASで動作が不安定）
- ホスト側のファイル変更が即座にコンテナ内に反映
- シンプルなscpコマンドで十分

#### デプロイフロー

```bash
# 1. ローカルでビルド
cd /Users/akirakano/IdeaProjects/homepage/wordpress/themes/readdy-theme4
npm run build
npm run copy:assets

# 2. NASへ必要なファイルをコピー（scpを使用）
scp -r assets/ manifest.json functions.php inc/ style.css \
  root@AkiraSynology:/volume1/docker/trust-code/wordpress/themes/readdy-theme4/

# 3. NASでキャッシュとリライトルールをフラッシュ
ssh root@AkiraSynology "cd /volume1/docker/trust-code && \
  docker-compose -f docker-compose.production.yml --env-file .env.production exec -T wordpress wp cache flush --allow-root && \
  docker-compose -f docker-compose.production.yml --env-file .env.production exec -T wordpress wp rewrite flush --allow-root"
```

#### ディレクトリ構造

**開発環境（ローカル）**:
```
/Users/akirakano/IdeaProjects/homepage/
├── docker-compose.yml
├── docker-compose.production.yml
└── wordpress/
    └── themes/
        └── readdy-theme4/
            ├── assets/         ← ビルド済みJS/CSS
            ├── manifest.json   ← ビルド済みマニフェスト
            ├── functions.php
            ├── inc/            ← Parsedown等
            └── style.css
```

**本番環境（NAS）**:
```
/volume1/docker/trust-code/
├── docker-compose.production.yml
├── .env.production
└── wordpress/
    └── themes/
        └── readdy-theme4/  ← ここにscpでコピー
```

#### 除外すべきファイル（デプロイ不要）

本番環境には以下のファイルは不要：
- `node_modules/` - 開発依存
- `src/` - TypeScript/Reactソース
- `out/` - Viteビルド一時ファイル
- `.git/` - Git履歴
- `*.sh` - ビルドスクリプト
- `package.json`, `package-lock.json` - npm設定
- `vite.config.ts`, `tsconfig.json` - ビルド設定
- `tailwind.config.ts`, `postcss.config.ts` - CSS設定

#### コピーすべきファイル

本番環境に必要なファイル：
- `assets/*.js` - ビルド済みJavaScript
- `assets/*.css` - ビルド済みCSS
- `manifest.json` - アセットマニフェスト
- `functions.php` - テーマ機能
- `inc/` - PHPライブラリ（Parsedown等）
- `style.css` - WordPressテーマ識別用
- `screenshot.png` - テーマサムネイル（あれば）

#### 検証結果

✅ **問題なし**: volume機能により、rsyncは不要で単純なscpで十分に動作します。

---

## 実装詳細: いいね機能

### 概要
WordPress REST APIを使用したカスタムいいね機能の実装。Cookie認証により、ユーザーごとのいいね状態を30日間保持。

### REST API 500エラーの修正

**問題**: いいねボタンをクリックすると500エラー、`is_numeric() expects exactly 1 argument, 3 given`

**原因**: WordPress REST APIの`validate_callback`は3つの引数を受け取るが、`is_numeric`は1つの引数しか受け取らない

**解決策**: 無名関数でラップ
```php
'args' => ['id' => ['validate_callback' => function($param) { return is_numeric($param); }]],
```

**適用箇所**: functions.php のいいね、コメント、お問い合わせエンドポイント

---

## Single Source of Truth (SSOT) アーキテクチャ

### 問題
`bio`と`birthdate`などの情報が複数の場所にハードコードされ、情報サイロ化していた。

### 解決策
`src/config/siteConfig.ts`を単一の情報源として、全てのコンポーネントとフックがそこから値を取得。

**データフロー**:
```
WordPress DB (最優先)
  ↓ REST API
useWordPressConfig (フォールバック: siteConfig)
  ↓
各コンポーネント (フォールバック: siteConfig)
```

---

## React SPA ルーティング問題と解決

### 問題
- トップページ (`/`) は正常に表示
- `/about`, `/post/123` などにアクセスすると NOT FOUND
- WordPress が存在しないページとして 404 を返す

### 原因
React Router はクライアントサイドでのみ動作。サーバーサイドで全てのリクエストを index.php にリダイレクトする必要がある。

### 解決策

**1. functions.php でテンプレートリダイレクト**:
```php
function readdy_spa_template_redirect() {
  // REST API, 管理画面, 静的ファイルは除外
  if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false ||
      is_admin() ||
      strpos($_SERVER['REQUEST_URI'], '/wp-admin') !== false ||
      strpos($_SERVER['REQUEST_URI'], '/wp-login') !== false ||
      preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf)$/', $_SERVER['REQUEST_URI'])) {
    return;
  }
  // 全てのページでindex.phpを使用
  include get_template_directory() . '/index.php';
  exit;
}
add_action('template_redirect', 'readdy_spa_template_redirect');
```

**2. Dockerfile で mod_rewrite 有効化**:
```dockerfile
RUN a2enmod rewrite
```

**3. init-wordpress.sh でパーマリンク設定**:
```bash
wp rewrite structure '/%postname%/' --allow-root --path=/var/www/html
wp rewrite flush --hard --allow-root --path=/var/www/html
```

### データフロー
```
ブラウザ → Cloudflare Tunnel → Nginx → Apache/WordPress
  → functions.php (template_redirect)
  → index.php (<div id="root"></div>)
  → React Router が /about をハンドル
```

---

## Cloudflare 設定

### 必須設定
- **SSL/TLS 暗号化モード**: フル（完全）推奨
- **「常にHTTPSを使用」**: ON
  - これにより `:8080` リダイレクト問題が解決

### トンネルトークン
- `.env.production` の `CF_TUNNEL_TOKEN` に保存

---

## 🚨 トラブルシューティング（最重要）

### `:8080` リダイレクト問題とブラウザキャッシュ

**⚠️ 最重要**: この問題は解決に非常に時間がかかる可能性があります。サーバー側が正常でも、**ブラウザキャッシュ**が原因で問題が継続することがあります。

#### 症状

- `https://trust-code.net` にアクセスすると `http://trust-code.net:8080` にリダイレクトされる
- `ERR_SSL_PROTOCOL_ERROR` または接続エラーが表示される
- トップページは表示されるが、`/about` やブログ記事にアクセスすると404または `ERR_SSL_PROTOCOL_ERROR`

#### 原因（複数の要因が重なる）

1. **Nginx設定**: `proxy_set_header Host $host;` でポート番号 `:8080` が含まれる
2. **functions.php**: `$_SERVER['HTTP_HOST']` にポート番号が含まれ、WordPressが誤ったURLを生成
3. **.htaccess**: 空または不完全で、React SPAのルーティングが機能しない
4. **ブラウザキャッシュ（最も厄介）**:
   - **301 リダイレクト**がブラウザに永続キャッシュされる
   - **HSTS（HTTP Strict Transport Security）ポリシー**として保存される
   - サーバー側を修正してもブラウザがキャッシュからリダイレクトを実行し続ける

#### 解決策

##### Step 1: サーバー側の修正

**1.1 Nginx設定を修正** (`nginx/conf.d/production.conf`):
```nginx
location / {
  proxy_pass http://wordpress;
  # ポート番号を除去したホスト名を明示的に設定
  proxy_set_header Host              trust-code.net;
  proxy_set_header X-Forwarded-Host  trust-code.net;
  proxy_set_header X-Forwarded-Port  443;
  proxy_set_header X-Forwarded-Proto https;
  # ...
}
```

**1.2 functions.php を修正** (`wordpress/themes/readdy-theme4/functions.php`):
```php
function readdy_fix_server_vars() {
  if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['SERVER_PORT'] = 443;
    $_SERVER['HTTPS'] = 'on';

    // HTTP_HOST からポート番号を削除
    if (!empty($_SERVER['HTTP_HOST'])) {
      $_SERVER['HTTP_HOST'] = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST']);
    }
  }
}
add_action('muplugins_loaded', 'readdy_fix_server_vars');
```

**1.3 .htaccess を自動生成** (`wordpress/init-wordpress.sh`):
```bash
# .htaccess を強制作成（React SPAルーティング用）
if [ ! -f /var/www/html/.htaccess ] || ! grep -q "RewriteRule" /var/www/html/.htaccess; then
  echo "Creating .htaccess for React SPA routing..."
  cat > /var/www/html/.htaccess << 'HTACCESS_EOF'
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
HTACCESS_EOF
  echo ".htaccess created successfully"
fi
```

**1.4 WordPressキャッシュとトランジェントを削除** (NAS上で実行):
```bash
cd /volume1/docker/trust-code
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec db mysql -uroot -p'MYSQL_ROOT_PASSWORD' wordpress_db -e "DELETE FROM wp_options WHERE option_name LIKE '%transient%';"
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec -T wordpress wp cache flush --allow-root
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production restart wordpress
```

##### Step 2: デプロイ

```bash
# ローカル（Mac）で実行
cd /Users/akirakano/IdeaProjects/homepage

# Dockerイメージをビルド＆プッシュ
./build-and-push.sh

# テーマをビルド＆NASにデプロイ
./wordpress/themes/readdy-theme4/deploy-prod.sh
# Step 6: y を選択（イメージ更新）
```

##### Step 3: ブラウザキャッシュのクリア（最重要）

**3.1 Chrome / Arc（Mac & PC）**:

1. **HSTSキャッシュを削除**:
   - Chrome: `chrome://net-internals/#hsts` にアクセス
   - Arc: `arc://net-internals/#hsts` にアクセス
   - 「Delete domain security policies」セクションで `trust-code.net` と入力
   - **Delete** ボタンをクリック

2. **ブラウザを完全に終了**:
   - Mac: `Cmd+Q` でブラウザを完全終了
   - Windows: タスクマネージャーでプロセスを終了

3. **ブラウザを再起動**して、新しいシークレットウィンドウで `https://trust-code.net` にアクセス

**3.2 Safari（Mac）**:
```bash
# キャッシュをクリア
環境設定 → 詳細 → 「開発」メニューを表示 にチェック
開発 → キャッシュを空にする（Cmd+Option+E）

# DNSキャッシュもクリア（Mac全体）
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

**3.3 スマートフォン（Chrome）**:

1. Chrome設定 → プライバシーとセキュリティ → 閲覧履歴データの削除
2. **期間**: 全期間
3. **キャッシュされた画像とファイル** と **Cookie とサイトデータ** をチェック
4. データを削除
5. Chromeアプリを完全に終了して再起動

##### Step 4: Cloudflareのキャッシュをパージ

Cloudflareダッシュボードで：
1. `trust-code.net` ドメインを選択
2. **キャッシング** → **構成**
3. **キャッシュをパージ** → **すべてをパージ**

#### 検証方法

**4.1 サーバー側の確認** (NAS上で実行):
```bash
# .htaccess の内容確認
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress cat /var/www/html/.htaccess

# RewriteRule が含まれていることを確認
# 空または不完全な場合は init-wordpress.sh の修正が必要

# Nginx経由でのアクセステスト
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress curl -I http://wp-nginx/
# 200 OK が返ることを確認
```

**4.2 ブラウザでの確認**:

1. **Safari（最も信頼できる）**でアクセス:
   - Safariはキャッシュが比較的弱いため、サーバー側の状態を確認しやすい
   - `https://trust-code.net/`, `https://trust-code.net/about` が正常に表示されるか確認

2. **Chrome/Arc（HSTSキャッシュクリア後）**でアクセス:
   - シークレットモードで `https://trust-code.net` にアクセス
   - 開発者ツール → ネットワークタブで最初のリクエストのステータスを確認
   - `301` や `Location: http://trust-code.net:8080/` が表示されないことを確認

3. **別のデバイス（スマートフォンなど）**でアクセス:
   - 最もクリーンな検証方法
   - キャッシュの影響を受けていない状態でサーバー側の動作を確認

#### 重要なポイント

- ✅ **Safari で正常に動作すれば、サーバー側は正常**
- ✅ **Chrome/Arc で問題が継続する場合は、HSTSキャッシュが原因**
- ⚠️ **301リダイレクトのキャッシュは非常に強力**で、通常のキャッシュクリアでは削除されないことがある
- ⚠️ **HSTSポリシーはセキュリティ機能**のため、意図的に強力にキャッシュされる
- ⚠️ **DNSキャッシュは関係ない場合がほとんど**（最後の手段として実行）

#### トラブルシューティングの優先順位

1. **まず**: 別のブラウザ（Safari）またはデバイス（スマートフォン）で確認
2. **次に**: Chrome/Arc の HSTS キャッシュを削除（`chrome://net-internals/#hsts`）
3. **それでもダメなら**: ブラウザのキャッシュを完全削除（全期間）
4. **最後の手段**: Cloudflare のキャッシュパージ + DNSキャッシュクリア

#### 参考資料

- [Qiita: bashのheredocでsudo -iを使う方法](https://qiita.com/4486/items/598688dc1d2c05cb7890)
- Chrome HSTS Preload List: `chrome://net-internals/#hsts`

---

### 2025-10-13

#### 環境変数の動的設定とデプロイフロー改善

**目的**: ビルド時に環境変数が固定される問題を解決し、同じDockerイメージを複数環境で使い回せるようにする。

**問題点**:
- `docker-compose.production.yml` で `WP_HOME` と `WP_SITEURL` がハードコードされていた
- NASでのビルドが遅いため、Docker Hub からイメージをPULLする運用に変更したい

**修正内容**:

1. **docker-compose.production.yml を修正** (`wordpress/docker-compose.production.yml:23-52`):
   - ハードコードされたURLを環境変数参照に変更
   - `WP_HOME: ${WP_HOME}`
   - `WP_SITEURL: ${WP_SITEURL}`
   - データベース設定も環境変数参照に統一
   - `WORDPRESS_CONFIG_EXTRA` でHTTPS検知とCloudflare対応を追加

2. **docker-compose.yml を修正** (`docker-compose.yml:47-48`):
   - 開発環境でも環境変数から読み込むように変更
   - デフォルト値を設定: `${WP_HOME:-http://localhost:8080}`

3. **.env.example を作成** (`.env.example`):
   - 環境変数のテンプレートファイルを作成
   - 開発環境と本番環境の両方の設定例を記載
   - Git管理対象として追加

4. **デプロイ手順書を作成** (`docs/deployment-guide.md`):
   - 連番付きの詳細な手順書を作成
   - 環境変数の設定方法
   - Docker イメージのビルド・プッシュ手順
   - 本番環境（NAS）へのデプロイ手順
   - トラブルシューティング

5. **CLAUDE.md を更新**:
   - 環境構成セクションに環境変数の詳細を追加
   - 「本番環境へのデプロイ（NAS）」セクションに手順書への参照を追加
   - 変更履歴を追加

**検証済み**:
- `init-wordpress.sh` は実行時に環境変数を参照するため、問題なし
- `Dockerfile` はビルド時に固定値を埋め込んでいないため、問題なし

**運用フロー**:
```
開発環境（Mac）
  ↓ docker build & push
Docker Hub
  ↓ docker pull
本番環境（NAS）
  ↓ 環境変数で動的設定
WP_HOME=https://trust-code.net
```

**メリット**:
- ✅ 同じイメージを複数環境で使い回せる
- ✅ URL変更時にイメージの再ビルドが不要
- ✅ NASでのビルド不要（PULLのみ）
- ✅ 環境ごとの設定を `.env` ファイルで管理

---

#### build-and-push.sh スクリプトの作成とデプロイ手順の明確化

**背景**: ユーザーから「Docker Hubにイメージをpushしておく必要があるのでは？」という指摘を受け、デプロイ手順が不明確であることが判明。

**問題点**:
- `build-and-push.sh` スクリプトが存在しなかった
- 手順書に「docker pull」の前にpushが必要であることが明記されていなかった
- Dockerイメージのビルド・プッシュとテーマのデプロイが混同されていた

**修正内容**:

1. **build-and-push.sh スクリプトを作成** (`build-and-push.sh`):
   - Docker Hubへのログイン確認機能
   - Dockerイメージのビルド
   - タグ付け（`latest` + タイムスタンプ版）
   - Docker Hub へのプッシュ
   - カラフルなログ出力と次のステップ表示
   - エラーハンドリング

2. **deployment-guide.md を大幅改訂** (`docs/deployment-guide.md`):
   - **1章「概要」に「デプロイのタイミング」セクションを追加**
     - 🔴 初回セットアップ / Dockerイメージの変更時
     - 🟢 テーマの変更のみ
   - **アーキテクチャ図を詳細化**（開発環境→Docker Hub→本番環境のフロー）
   - **4章「Docker イメージのビルド・プッシュ」を詳細化**
     - 実施タイミングを明確化
     - build-and-push.sh の使い方を説明
     - 出力例を追加
   - **5章「本番環境（NAS）へのデプロイ」に前提条件を追加**
     - ✅ Docker Hub に最新イメージがプッシュ済み
     - ✅ NAS上に `.env.production` が作成済み
   - **6章「トラブルシューティング」に「Docker Hub にイメージがない」エラーを追加**
   - **まとめセクションに作業フローを追加**（初回 / テーマのみ）

3. **CLAUDE.md の「本番デプロイフロー」セクションを再構成**:
   - 🔴 初回セットアップ / Dockerイメージの変更時
   - 🟢 テーマの変更のみ
   - `docs/deployment-guide.md` への参照を追加

**ベストプラクティス**:
- **Dockerイメージのバージョニング**: `latest` + タイムスタンプ版（ロールバック用）
- **責任の分離**:
  - `build-and-push.sh`: Dockerイメージのビルド・プッシュ
  - `deploy-dev.sh`: 開発環境でのテーマビルド・デプロイ
  - `deploy-prod.sh`: 本番環境へのテーマデプロイ
- **明確な前提条件**: 各手順の前提条件を明示

**検証済み**:
- `build-and-push.sh` が正しく動作することを確認
- 手順書の流れが明確であることを確認

---

**最終更新**: 2025-10-13
