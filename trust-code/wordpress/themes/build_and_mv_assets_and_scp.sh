#!/bin/zsh

rm -rf readdy-theme/manifest.json
rm -rf readdy-theme/assets/*

npm run build

mkdir -p readdy-theme/assets
mv dist/.vite/manifest.json readdy-theme/manifest.json
mv dist/assets/* readdy-theme/assets/

echo "Theme built successfully. Mounting NAS..."

# 環境変数を読み込み
source ../../.env

# マウントポイントを作成
MOUNT_POINT="/tmp/nas_docker_mount"
mkdir -p "$MOUNT_POINT"

# NASをマウント（既にマウントされている場合はスキップ）
if ! mount | grep -q "$MOUNT_POINT"; then
  echo "Mounting NAS share..."
  mount_smbfs "//akira_kano1101:${NAS_PASSWORD}@192.168.1.30/docker" "$MOUNT_POINT"
fi

echo "Copying theme to NAS..."

# テーマをコピー
rm -rf "$MOUNT_POINT/trust-code/wordpress/themes/readdy-theme"
cp -r readdy-theme "$MOUNT_POINT/trust-code/wordpress/themes/"

echo "Copy complete. Restarting WordPress..."

# WordPress再起動
ssh -p 922 -i ~/.ssh/id_ed25519_nas -t akira_kano1101@192.168.1.30 \
  "cd /volume1/docker/trust-code && sudo /usr/local/bin/docker compose restart wordpress"

# アンマウント（オプション - コメントアウトして常時マウントしておくことも可能）
# umount "$MOUNT_POINT"

echo "Deployment complete!"
