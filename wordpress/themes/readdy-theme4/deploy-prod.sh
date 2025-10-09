#!/bin/bash
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  本番環境 完全ビルド＆デプロイ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# === 既存変数を利用 ===
NAS_USER="akira_kano1101"
NAS_HOST="akirasynology"
NAS_PORT=922
NAS_THEME_PATH="/volume1/docker/trust-code/wordpress/themes/readdy-theme4"
LOCAL_THEME_DIR="./wordpress/themes/readdy-theme4"

# === ビルド処理 ===
echo "▶ Step 1: Viteキャッシュとビルド成果物をクリーンアップ"
rm -rf out dist node_modules/.vite_cache 2>/dev/null || true

echo "▶ Step 2: 古いアセットを削除"
rm -rf assets/* .vite/manifest.json 2>/dev/null || true

echo "▶ Step 3: npm install"
cd "$LOCAL_THEME_DIR"
npm install

echo "▶ Step 4: 本番ビルド"
npm run build

echo "▶ Step 5: アセットコピー"
npm run copy:assets
cd - >/dev/null

# === デプロイ処理 ===
echo "▶ Step 6: NASへテーマをデプロイ（ssh + tar）"
echo "  デプロイ先: ${NAS_USER}@${NAS_HOST}:${NAS_THEME_PATH}"
read -r -p "NASへのデプロイを実行しますか? (y/N): " yn
[[ ! $yn =~ ^[Yy]$ ]] && echo "中止しました。" && exit 0

TMP_DIR="/tmp/readdy-theme4"

echo "NASへファイルを転送中..."

# (1) 一時ディレクトリへ通常ユーザで展開
ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "rm -rf '$TMP_DIR' && mkdir -p '$TMP_DIR'"
# 送信側（Mac）だけ変更
COPYFILE_DISABLE=1 tar \
  --no-xattrs --no-mac-metadata --no-acls --no-fflags \
  -C "$LOCAL_THEME_DIR" -cf - . \
| ssh -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "tar -C '$TMP_DIR' -xpf -"

# (2) root権限が必要な移動だけsudoで実行（TTY有効）
ssh -t -p "$NAS_PORT" "$NAS_USER@$NAS_HOST" "
  sudo mkdir -p \"\$(dirname \"$NAS_THEME_PATH\")\" &&
  sudo rm -rf \"$NAS_THEME_PATH\" &&
  sudo mv \"$TMP_DIR\" \"$NAS_THEME_PATH\"
"

echo "✅ デプロイ完了：$NAS_THEME_PATH"