# 04. .htaccess の確認と修正

## 問題

Apache の .htaccess が存在しないか、React SPA ルーティングに対応していない可能性がある。

## 確認手順

### 開発環境

```bash
# .htaccess の存在確認
docker compose exec wordpress ls -la /var/www/html/.htaccess

# .htaccess の内容確認
docker compose exec wordpress cat /var/www/html/.htaccess
```

### 本番環境

```bash
ssh -p 922 akira_kano1101@akirasynology
sudo -i
cd /volume1/docker/trust-code

docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress ls -la /var/www/html/.htaccess

docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress cat /var/www/html/.htaccess
```

## 期待される内容

.htaccess には以下が含まれているべき:

```apache
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
```

## 修正方法

### init-wordpress.sh で .htaccess を強制生成

```bash
# パーマリンク構造を設定し、.htaccess を強制生成
wp rewrite structure '/%postname%/' --allow-root --path=/var/www/html
wp rewrite flush --hard --allow-root --path=/var/www/html

# .htaccess の権限を設定
chmod 644 /var/www/html/.htaccess
chown www-data:www-data /var/www/html/.htaccess
```

### Apache の設定確認

wordpress/Dockerfile で `AllowOverride All` が設定されているか確認:

```dockerfile
# .htaccess を有効化
RUN echo '<Directory /var/www/html>\n\
  AllowOverride All\n\
</Directory>' > /etc/apache2/conf-available/wordpress.conf \
  && a2enconf wordpress
```

## チェックポイント

- [ ] .htaccess が存在するか確認
- [ ] .htaccess の内容が正しいか確認
- [ ] mod_rewrite が有効か確認（既に Dockerfile で有効化済み）
- [ ] AllowOverride All が設定されているか確認
- [ ] 必要に応じて Dockerfile を修正
- [ ] 開発環境でテスト
- [ ] 本番環境にデプロイ

## 次のステップ

05-fix-functions-timing.md で functions.php の実行タイミングを調整する。

## ステータス

- [ ] .htaccess 確認完了
- [ ] 必要な修正実施完了
- [ ] テスト完了
