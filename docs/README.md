# :8080 ポート問題 解決手順

## 問題概要

本番環境 (https://trust-code.net) で以下の問題が発生:

1. URL に `:8080` が自動的に付加される (例: `https://trust-code.net:8080/post/1/`)
2. 管理画面ログイン時に `localhost:8080` にリダイレクトされる
3. 結果として ERR_SSL_PROTOCOL_ERROR が発生

## 原因分析

- データベースはクリーン（volumes やり直し済み）
- コードレベルでの URL 生成ロジックに問題がある可能性
- WordPress の環境変数読み込みタイミング、または Apache/Nginx の設定に問題

## 解決手順

### 📋 01. 問題分析
[docs/01-problem-analysis.md](./01-problem-analysis.md)

現象の整理と原因の仮説立て。

**ステータス**: [ ] 完了

---

### 🔍 02. 診断スクリプトの作成と実行
[docs/02-diagnostic-script.md](./02-diagnostic-script.md)

WordPress が認識している環境変数、サーバー変数、URL 設定を確認する診断用 PHP ファイルを作成。

**実施内容**:
- diagnostic.php を作成
- 開発環境で実行
- 本番環境にデプロイして実行
- 問題箇所を特定

**ステータス**:
- [ ] 診断スクリプト作成
- [ ] 開発環境で実行
- [ ] 本番環境で実行
- [ ] 問題箇所特定

---

### 🔧 03. wp-config.php の修正
[docs/03-fix-wp-config.md](./03-fix-wp-config.md)

init-wordpress.sh を修正し、wp-config.php に直接 URL 設定を書き込む。

**実施内容**:
- init-wordpress.sh に wp-config.php 書き込みロジックを追加
- WP_HOME, WP_SITEURL を define() で設定
- FORCE_SSL_ADMIN を設定
- $_SERVER['SERVER_PORT'] を 443 に強制

**ステータス**:
- [ ] init-wordpress.sh 修正
- [ ] 開発環境でテスト
- [ ] wp-config.php 内容確認
- [ ] 本番環境にデプロイ

---

### 📝 04. .htaccess の確認と修正
[docs/04-fix-htaccess.md](./04-fix-htaccess.md)

Apache の .htaccess が正しく生成されているか確認。

**実施内容**:
- .htaccess の存在確認
- .htaccess の内容確認
- 必要に応じて Dockerfile に AllowOverride 設定追加

**ステータス**:
- [ ] .htaccess 確認
- [ ] 必要な修正実施
- [ ] テスト完了

---

### ⏱️ 05. functions.php の実行タイミング調整
[docs/05-fix-functions-timing.md](./05-fix-functions-timing.md)

functions.php の `readdy_force_site_url()` のフックを調整、または wp-config.php に統合。

**実施内容**:
- functions.php を簡素化（update_option 削除）
- init → muplugins_loaded に変更
- または完全に wp-config.php に統合

**ステータス**:
- [ ] functions.php 修正
- [ ] 開発環境でテスト
- [ ] 本番環境にデプロイ

---

### ✅ 06. 総合テストと検証
[docs/06-test-and-verify.md](./06-test-and-verify.md)

全ての修正を適用した後、総合的にテストを実施。

**テスト項目**:
- トップページ
- About ページ
- 記事ページ
- 管理画面ログイン
- REST API
- 診断スクリプト

**ステータス**:
- [ ] 開発環境テスト
- [ ] 本番環境デプロイ
- [ ] 本番環境テスト
- [ ] 全問題解決

---

## 実行順序

1. **01-problem-analysis.md** を読んで問題を理解
2. **02-diagnostic-script.md** で診断スクリプトを作成・実行
3. 診断結果を元に **03, 04, 05** の修正を実施
4. **06-test-and-verify.md** で総合テストを実施
5. 全てのチェックボックスに ✅ をつけたら完了

## 進捗管理

各ドキュメントの末尾にある「ステータス」セクションのチェックボックスに ✅ をつけて進捗を管理してください。

## 完了条件

- [ ] 全ての手順ドキュメントのステータスが完了
- [ ] 本番環境で `:8080` 問題が解決
- [ ] 管理画面が正常にログインできる
- [ ] 全てのページが正しい URL でアクセスできる

---

**作成日**: 2025-10-12
**最終更新**: 2025-10-12
