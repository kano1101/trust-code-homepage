FROM wordpress:latest

# mod_rewriteを有効化（React Routerのルーティングに必要）
RUN a2enmod rewrite

# .htaccess を有効化（AllowOverride All）
RUN echo '<Directory /var/www/html>\n\
  Options Indexes FollowSymLinks\n\
  AllowOverride All\n\
  Require all granted\n\
</Directory>' > /etc/apache2/conf-available/wordpress.conf \
  && a2enconf wordpress

# wp-cliをインストール
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && \
    chmod +x wp-cli.phar && \
    mv wp-cli.phar /usr/local/bin/wp

# 初期化スクリプトをコピー
COPY init-wordpress.sh /usr/local/bin/init-wordpress.sh
RUN chmod +x /usr/local/bin/init-wordpress.sh

# カスタムエントリーポイントを作成
COPY docker-entrypoint-wrapper.sh /usr/local/bin/docker-entrypoint-wrapper.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-wrapper.sh

# エントリーポイントを上書き
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-wrapper.sh"]
CMD ["apache2-foreground"]