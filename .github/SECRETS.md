# GitHub Secrets クイックリファレンス

このファイルは、GitHub Actionsワークフローで使用するSecretsの一覧です。

## 必須のSecrets

| Secret名 | 説明 | 取得方法 |
|----------|------|----------|
| `DOCKER_HUB_USERNAME` | Docker Hub のユーザー名 | Docker Hubアカウント |
| `DOCKER_HUB_ACCESS_TOKEN` | Docker Hub のアクセストークン | [Docker Hub > Account Settings > Security](https://hub.docker.com/settings/security) |
| `NAS_SSH_KEY` | NASにSSH接続するための秘密鍵（ED25519形式） | `ssh-keygen -t ed25519` で生成 |
| `NAS_SSH_PORT` | NASのSSHポート番号 | 例: `922` または `22` |
| `NAS_USER` | NASのユーザー名 | 例: `akira_kano1101` |
| `NAS_HOST` | NASのホスト名またはIPアドレス | 例: `akirasynology` またはTailscale hostname |

## オプションのSecrets（Tailscale使用時）

| Secret名 | 説明 | 取得方法 |
|----------|------|----------|
| `TAILSCALE_OAUTH_CLIENT_ID` | Tailscale OAuth クライアントID | [Tailscale Admin Console](https://login.tailscale.com/admin/settings/oauth) |
| `TAILSCALE_OAUTH_SECRET` | Tailscale OAuth シークレット | 同上 |

## セットアップ方法

詳細なセットアップ方法は、[docs/github-actions-setup.md](../docs/github-actions-setup.md) を参照してください。

### クイックスタート

1. **Docker Hub アクセストークンを生成**
   - https://hub.docker.com/settings/security
   - "New Access Token" → Permissions: `Read, Write, Delete`

2. **SSH鍵を生成**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions@trust-code.net" -f ~/.ssh/github-actions-trust-code
   ```

3. **公開鍵をNASに登録**
   ```bash
   cat ~/.ssh/github-actions-trust-code.pub | ssh -p 922 akira_kano1101@akirasynology 'cat >> ~/.ssh/authorized_keys'
   ```

4. **GitHub Secretsに登録**
   - Repository → Settings → Secrets and variables → Actions
   - "New repository secret" で各Secretを追加

5. **Tailscale OAuth（オプション）**
   - https://login.tailscale.com/admin/settings/oauth
   - "Generate OAuth client" → Scopes: `Devices: Write`

## セキュリティ上の注意

- ⚠️ **秘密鍵は絶対にGitにコミットしないこと**
- ⚠️ **アクセストークンは安全に管理すること**
- ⚠️ **不要になったトークン・鍵は削除すること**
- ✅ GitHub Secretsは暗号化されて保存されます
- ✅ ワークフローのログには `***` でマスキングされます

## トラブルシューティング

### SSH接続エラー
- 公開鍵がNASの `~/.ssh/authorized_keys` に正しく登録されているか確認
- GitHub Secretsに登録した秘密鍵が正しいか確認（`-----BEGIN` から `-----END` まで全て含む）

### Docker Hub プッシュエラー
- リポジトリ `trust-code-wordpress` が https://hub.docker.com/ に存在するか確認
- アクセストークンが `Read, Write, Delete` 権限を持っているか確認

### Tailscale接続エラー
- OAuth クライアントが `Devices: Write` スコープを持っているか確認
- NASでTailscaleが起動しているか確認
