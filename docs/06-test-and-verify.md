# 06. 総合テストと検証

## テスト項目

### 1. トップページ

```bash
# 開発環境
curl -I http://localhost:8080/

# 本番環境
curl -I https://trust-code.net/
```

**期待結果**:
- ステータスコード: 200 OK
- リダイレクトなし

### 2. About ページ

```bash
# 開発環境
curl -I http://localhost:8080/about

# 本番環境
curl -I https://trust-code.net/about
```

**期待結果**:
- ステータスコード: 200 OK
- リダイレクトなし（:8080 へのリダイレクトがないこと）

### 3. 記事ページ

```bash
# 本番環境
curl -I https://trust-code.net/post/1/
```

**期待結果**:
- ステータスコード: 200 OK または 404 Not Found（記事が存在しない場合）
- `:8080` へのリダイレクトがないこと

### 4. 管理画面ログイン

```bash
# 本番環境
curl -I https://trust-code.net/wp-admin/
```

**期待結果**:
- ステータスコード: 302 Found
- Location ヘッダー: `https://trust-code.net/wp-login.php?redirect_to=...`
- `localhost:8080` へのリダイレクトがないこと

### 5. REST API

```bash
# 本番環境
curl https://trust-code.net/wp-json/wp/v2/posts
```

**期待結果**:
- JSON レスポンス
- `_links` 内の URL が全て `https://trust-code.net` で始まる
- `:8080` や `localhost` が含まれていない

### 6. 診断スクリプト

```bash
# 本番環境
ssh -p 922 akira_kano1101@akirasynology "sudo docker compose -f /volume1/docker/trust-code/docker-compose.yml -f /volume1/docker/trust-code/docker-compose.production.yml --env-file /volume1/docker/trust-code/.env.production exec wordpress php /var/www/html/wp-content/themes/readdy-theme4/diagnostic.php"
```

**期待結果**:
```
home: https://trust-code.net
siteurl: https://trust-code.net
SERVER_PORT: 443
HTTPS: on
X-Forwarded-Proto: https
X-Forwarded-Port: 443
is_ssl(): true
home_url(): https://trust-code.net
admin_url(): https://trust-code.net/wp-admin/
```

## ブラウザテスト

### 1. トップページアクセス

1. ブラウザで https://trust-code.net/ にアクセス
2. URL バーを確認 → `:8080` が付いていないこと
3. DevTools のネットワークタブで確認 → リダイレクトがないこと

### 2. About ページアクセス

1. https://trust-code.net/about にアクセス
2. ページが正常に表示される
3. `:8080` へのリダイレクトがない

### 3. 記事ページアクセス

1. トップページから記事をクリック
2. 記事ページが正常に表示される
3. URL に `:8080` が含まれない

### 4. 管理画面ログイン

1. https://trust-code.net/wp-admin/ にアクセス
2. ログイン画面が表示される
3. `localhost:8080` にリダイレクトされない
4. ログイン後、管理画面が正常に表示される
5. URL が `https://trust-code.net/wp-admin/` のまま

### 5. カテゴリ、タグページ

1. サイドバーのカテゴリをクリック
2. カテゴリ別ページが正常に表示される
3. URL に `:8080` が含まれない

## チェックリスト

### 開発環境

- [ ] トップページが正常に表示される
- [ ] About ページが正常に表示される
- [ ] 記事ページが正常に表示される（記事が存在する場合）
- [ ] 管理画面ログインが正常に機能する
- [ ] REST API が正常に動作する
- [ ] 診断スクリプトの出力が期待通り

### 本番環境

- [ ] トップページが正常に表示される（`:8080` なし）
- [ ] About ページが正常に表示される（`:8080` なし）
- [ ] 記事ページが正常に表示される（`:8080` なし）
- [ ] 管理画面ログインが正常に機能する（`localhost` へのリダイレクトなし）
- [ ] REST API の URL が全て `https://trust-code.net`
- [ ] 診断スクリプトの出力が期待通り
- [ ] ブラウザの DevTools でエラーがない
- [ ] SSL 証明書エラーがない

## 問題が残る場合

### デバッグ手順

1. **ログを確認**
   ```bash
   # 本番環境の WordPress ログ
   ssh -p 922 akira_kano1101@akirasynology
   sudo docker compose -f /volume1/docker/trust-code/docker-compose.yml -f /volume1/docker/trust-code/docker-compose.production.yml --env-file /volume1/docker/trust-code/.env.production logs wordpress | tail -100
   ```

2. **wp-config.php の内容を確認**
   ```bash
   sudo docker compose -f /volume1/docker/trust-code/docker-compose.yml -f /volume1/docker/trust-code/docker-compose.production.yml --env-file /volume1/docker/trust-code/.env.production exec wordpress cat /var/www/html/wp-config.php | head -50
   ```

3. **データベースの URL を直接確認**
   ```bash
   sudo docker compose -f /volume1/docker/trust-code/docker-compose.yml -f /volume1/docker/trust-code/docker-compose.production.yml --env-file /volume1/docker/trust-code/.env.production exec wordpress wp option list --search=*url* --allow-root
   ```

4. **ブラウザのキャッシュをクリア**
   - Cmd + Shift + R (Mac) または Ctrl + Shift + R (Windows/Linux)
   - または DevTools を開いて Network タブで「Disable cache」にチェック

5. **Cloudflare のキャッシュをクリア**
   - Cloudflare ダッシュボード → Caching → Purge Everything

## 成功条件

以下の全てが満たされたら完了:

✅ 本番環境で全てのページが `:8080` なしでアクセスできる
✅ 管理画面ログインが `localhost` にリダイレクトされない
✅ REST API の URL が全て正しい
✅ ブラウザのコンソールにエラーがない
✅ SSL 証明書エラーがない

## ステータス

- [ ] 開発環境テスト完了
- [ ] 本番環境デプロイ完了
- [ ] 本番環境テスト完了
- [ ] 全ての問題解決完了
