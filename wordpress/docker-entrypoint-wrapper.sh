#!/bin/bash
set -e

# オリジナルのdocker-entrypointを実行してWordPressをインストール
docker-entrypoint.sh apache2-foreground &
APACHE_PID=$!

# init-wordpress.sh を呼び出し（バックグラウンドで実行）
/usr/local/bin/init-wordpress.sh &

# Apacheプロセスを待機
wait $APACHE_PID