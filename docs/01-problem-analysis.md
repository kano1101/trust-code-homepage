# 01. 問題分析

## 現象

### 問題1: `:8080` ポート番号が付加される
- **URL**: https://trust-code.net にアクセス
- **リダイレクト先**: https://trust-code.net:8080/post/1/
- **エラー**: ERR_SSL_PROTOCOL_ERROR (ポート 8080 は HTTP なので HTTPS 接続できない)

### 問題2: localhost:8080 へのリダイレクト
- **操作**: 管理画面 (wp-admin) でログイン
- **リダイレクト先**: http://localhost:8080
- **結果**: 本番環境なのに開発環境の URL にリダイレクトされる

## 現在の状況

### ✅ 確認済み
- データベースの `home` と `siteurl` オプションは正しい値 (`https://trust-code.net`)
- .env.production には正しい値が設定されている
  - `WP_HOME=https://trust-code.net`
  - `WP_SITEURL=https://trust-code.net`
- volumes は完全にクリーンな状態（やり直し済み）

### ❓ 原因の可能性

1. **WordPress の URL 生成タイミング問題**
   - `init` フックが遅すぎる可能性
   - WordPress が URL を生成した後に `$_SERVER['SERVER_PORT']` を修正している

2. **環境変数の読み込み失敗**
   - wp-config.php で環境変数が正しく反映されていない
   - Docker の環境変数が WordPress コンテナに渡っていない

3. **Apache の設定不足**
   - mod_rewrite が正しく動作していない
   - .htaccess が存在しないか不完全

4. **Nginx のプロキシヘッダー不足**
   - X-Forwarded-* ヘッダーが不完全
   - WordPress がプロキシの背後にいることを認識していない

5. **WordPress の HTTPS 認識失敗**
   - FORCE_SSL_ADMIN が設定されていない
   - $_SERVER['HTTPS'] が正しく設定されていない

## 次のステップ

02-diagnostic-script.md で診断スクリプトを作成し、現在の状態を詳しく調査する。

## ステータス

- [ ] 問題分析完了
- [ ] 次のステップへ進む準備完了
