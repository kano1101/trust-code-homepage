# GitHub Actions 自動デプロイ セットアップガイド

このドキュメントでは、Trust Code WordPress プロジェクトのGitHub Actionsによる自動デプロイの設定方法を説明します。

---

## 📋 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [GitHub Secrets の設定](#github-secrets-の設定)
4. [Tailscale の設定（オプション）](#tailscale-の設定オプション)
5. [SSH キーの生成と設定](#ssh-キーの生成と設定)
6. [ワークフローのトリガー](#ワークフローのトリガー)
7. [デプロイフロー](#デプロイフロー)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

GitHub Actionsワークフローは、以下の処理を自動化します：

### 🟢 テーマのみの変更
- `wordpress/themes/readdy-theme4/` 配下のファイルが変更された場合
- React/TypeScript のビルド
- ビルド済みアセットをNASに転送
- WordPress キャッシュフラッシュ

### 🔴 Dockerイメージの変更
- `wordpress/Dockerfile`, `wordpress/*.sh`, `nginx/`, `php/` が変更された場合
- Dockerイメージのビルド・Docker Hubへプッシュ
- NASで最新イメージをPULL
- コンテナ再起動

### 🟠 Docker Compose の変更
- `docker-compose.yml`, `docker-compose.production.yml` が変更された場合
- composeファイルをNASに転送
- コンテナ再起動

---

## 前提条件

以下の環境が整っていることを確認してください：

- ✅ GitHub リポジトリが作成されている
- ✅ Docker Hub アカウントが作成されている
- ✅ NAS（Synology）でSSHが有効化されている
- ✅ NAS上に `/volume1/docker/trust-code` ディレクトリが存在する
- ✅ NAS上に `.env.production` ファイルが配置されている
- ✅ （オプション）Tailscale アカウントが作成されている

---

## GitHub Secrets の設定

### 事前検証（推奨）

GitHub Secretsに設定する前に、ローカル環境で動作確認することを推奨します。

#### ステップ1: 検証用の環境変数ファイルを作成

```bash
# プロジェクトルートで実行
cp .env.secrets.example .env.secrets

# .env.secrets を編集して実際の値を設定
nano .env.secrets
```

#### ステップ2: 検証スクリプトを実行

```bash
./scripts/verify-secrets.sh
```

**検証内容**:
- ✅ Docker Hub 認証テスト
- ✅ SSH鍵の形式・パーミッション確認
- ✅ NASへのSSH接続テスト
- ✅ プロジェクトディレクトリ・環境変数ファイルの存在確認
- ✅ tar + SSH によるファイル転送テスト
- ✅ Tailscale設定（オプション）

すべてのテストに合格したら、GitHub Secretsに設定を進めてください。

---

### GitHub Secretsへの登録

GitHubリポジトリの **Settings > Secrets and variables > Actions** で以下のSecretsを設定します。

### 必須のSecrets

#### 1. Docker Hub 認証情報

| Secret名 | 説明 | 取得方法 |
|----------|------|----------|
| `DOCKER_HUB_USERNAME` | Docker Hub のユーザー名 | Docker Hubにログインして確認 |
| `DOCKER_HUB_ACCESS_TOKEN` | Docker Hub のアクセストークン | [Docker Hub > Account Settings > Security](https://hub.docker.com/settings/security) で生成 |

**Docker Hub アクセストークンの生成方法**:
1. https://hub.docker.com/settings/security にアクセス
2. **New Access Token** をクリック
3. **Description**: `GitHub Actions - trust-code-wordpress`
4. **Access permissions**: `Read, Write, Delete` を選択
5. **Generate** をクリック
6. 生成されたトークンをコピー（一度しか表示されません）

#### 2. NAS SSH 接続情報

| Secret名 | 説明 | 例 |
|----------|------|------|
| `NAS_SSH_KEY` | NASにSSH接続するための秘密鍵 | （下記「SSH キーの生成」参照） |
| `NAS_SSH_PORT` | NASのSSHポート番号 | `922` または `22` |
| `NAS_USER` | NASのユーザー名 | `akira_kano1101` |
| `NAS_HOST` | NASのホスト名またはIPアドレス | `akirasynology` または Tailscale hostname |

### オプションのSecrets（Tailscale使用時）

| Secret名 | 説明 | 取得方法 |
|----------|------|----------|
| `TAILSCALE_OAUTH_CLIENT_ID` | Tailscale OAuth クライアントID | [Tailscale Admin Console](https://login.tailscale.com/admin/settings/oauth) で生成 |
| `TAILSCALE_OAUTH_SECRET` | Tailscale OAuth シークレット | 同上 |

**Tailscale OAuth の生成方法**:
1. https://login.tailscale.com/admin/settings/oauth にアクセス
2. **Generate OAuth client** をクリック
3. **Description**: `GitHub Actions - trust-code-wordpress`
4. **Scopes**: `Devices: Write` を選択
5. **Generate client** をクリック
6. `Client ID` と `Client secret` をコピー

---

## SSH キーの生成と設定

GitHub ActionsからNASにSSH接続するための鍵ペアを生成します。

### ステップ1: ローカルでSSHキーを生成

```bash
# ED25519形式の鍵を生成（推奨）
ssh-keygen -t ed25519 -C "github-actions@trust-code.net" -f ~/.ssh/github-actions-trust-code

# パスフレーズは空のままEnterを押す（2回）
```

以下の2つのファイルが生成されます：
- `~/.ssh/github-actions-trust-code` : 秘密鍵（GitHub Secretsに登録）
- `~/.ssh/github-actions-trust-code.pub` : 公開鍵（NASに登録）

### ステップ2: 公開鍵をNASに登録

```bash
# 公開鍵の内容を表示
cat ~/.ssh/github-actions-trust-code.pub

# NASにSSH接続
ssh -p 922 akira_kano1101@akirasynology

# .ssh ディレクトリが存在しない場合は作成
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 公開鍵を authorized_keys に追加
echo "公開鍵の内容をペースト" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 確認
cat ~/.ssh/authorized_keys

# exitしてローカルに戻る
exit
```

### ステップ3: SSH接続をテスト

```bash
# 秘密鍵を使ってNASに接続（パスワードなしで接続できることを確認）
ssh -i ~/.ssh/github-actions-trust-code -p 922 akira_kano1101@akirasynology

# 成功したら exit
exit
```

### ステップ4: 秘密鍵をGitHub Secretsに登録

```bash
# 秘密鍵の内容をクリップボードにコピー（Mac）
cat ~/.ssh/github-actions-trust-code | pbcopy

# または、内容を表示してコピー
cat ~/.ssh/github-actions-trust-code
```

GitHub リポジトリの **Settings > Secrets and variables > Actions** で：
1. **New repository secret** をクリック
2. **Name**: `NAS_SSH_KEY`
3. **Secret**: 秘密鍵の内容を貼り付け（`-----BEGIN OPENSSH PRIVATE KEY-----` から `-----END OPENSSH PRIVATE KEY-----` まで全て）
4. **Add secret** をクリック

---

## Tailscale の設定（オプション）

Tailscale を使用すると、NASがインターネットに公開されていなくても、GitHub ActionsからセキュアにSSH接続できます。

### Tailscale を使用しない場合

- `NAS_HOST` に NASのグローバルIPアドレスまたはDDNSホスト名を設定
- ルーターでポートフォワーディング（`NAS_SSH_PORT` → NASの22番ポート）を設定

### Tailscale を使用する場合

1. NASにTailscaleをインストール（Synology DSMの場合はPackage Centerから）
2. Tailscale OAuth クライアントを生成（上記「GitHub Secrets の設定」参照）
3. `NAS_HOST` に Tailscale ホスト名（例: `akira-synology`）を設定

**メリット**:
- ✅ ポートフォワーディング不要
- ✅ セキュアなVPN接続
- ✅ グローバルIPアドレス不要

---

## ワークフローのトリガー

### 自動トリガー（Push）

`main` または `master` ブランチにプッシュすると、変更されたファイルに応じて自動的にデプロイが実行されます。

```bash
git add .
git commit -m "Update theme styles"
git push origin main
```

**変更検知**:
- `wordpress/themes/readdy-theme4/**` → テーマのビルド・デプロイ
- `wordpress/Dockerfile` → Dockerイメージのビルド・デプロイ
- `docker-compose*.yml` → Composeファイルの更新

### 手動トリガー（Workflow Dispatch）

GitHubリポジトリの **Actions** タブから手動で実行できます。

1. GitHub リポジトリの **Actions** タブを開く
2. **Deploy Trust Code WordPress to NAS** ワークフローを選択
3. **Run workflow** をクリック
4. オプションを選択:
   - **Force Docker image rebuild**: Dockerイメージを強制的にビルド・プッシュ
   - **Force theme rebuild**: テーマを強制的にビルド・デプロイ
5. **Run workflow** をクリック

---

## デプロイフロー

### 全体のフロー

```
┌─────────────────────────────────────────────────────────────┐
│ 1. detect-changes: 変更されたファイルを検知                │
└───────────────┬─────────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌───────────────┐  ┌───────────────┐
│ 2a. テーマ    │  │ 2b. Docker    │
│   ビルド      │  │   ビルド      │
│               │  │               │
│ - npm install │  │ - build image │
│ - npm build   │  │ - push to Hub │
└───────┬───────┘  └───────┬───────┘
        │                  │
        ▼                  ▼
┌───────────────┐  ┌───────────────┐
│ 3a. テーマ    │  │ 3b. Docker    │
│   デプロイ    │  │   デプロイ    │
│               │  │               │
│ - tar & scp   │  │ - pull image  │
│ - rsync       │  │ - restart     │
│ - cache flush │  │               │
└───────────────┘  └───────────────┘
        │                  │
        └────────┬─────────┘
                 ▼
        ┌────────────────┐
        │ 4. notify      │
        │  デプロイ完了  │
        └────────────────┘
```

### 各ジョブの詳細

#### 1. detect-changes
- **目的**: 変更されたファイルを検知
- **使用アクション**: `dorny/paths-filter@v3`
- **出力**: `theme`, `docker`, `compose` の真偽値

#### 2a. build-theme
- **実行条件**: テーマが変更された場合
- **処理**:
  1. Node.js 20をセットアップ
  2. npm依存関係をインストール
  3. Viteでビルド
  4. アセットをコピー
  5. ビルド成果物をアーティファクトとしてアップロード

#### 2b. build-docker
- **実行条件**: Dockerfileまたは関連ファイルが変更された場合
- **処理**:
  1. Docker Buildxをセットアップ
  2. Docker Hubにログイン
  3. Dockerイメージをビルド（linux/amd64）
  4. `latest` と タイムスタンプタグでプッシュ

#### 3a. deploy-theme
- **実行条件**: テーマが変更された場合
- **処理**:
  1. Tailscaleに接続（オプション）
  2. SSH鍵をセットアップ
  3. ビルド成果物をダウンロード
  4. tar & SSH でNASに転送
  5. rsync で本番ディレクトリに配置
  6. WordPressキャッシュをフラッシュ

#### 3b. deploy-docker
- **実行条件**: Dockerまたはcomposeファイルが変更された場合
- **処理**:
  1. Tailscaleに接続（オプション）
  2. SSH鍵をセットアップ
  3. Docker関連ファイルをNASに転送
  4. NASで最新イメージをPULL
  5. コンテナを再起動
  6. デプロイを検証（ログ確認）

#### 4. notify
- **実行条件**: 常に実行
- **処理**: デプロイ結果のサマリーをGitHub Actions UIに表示

---

## トラブルシューティング

### SSH接続エラー

**エラー**: `Permission denied (publickey,password)`

**原因**: SSH鍵の設定が正しくない

**解決策**:
1. 公開鍵がNASの `~/.ssh/authorized_keys` に正しく登録されているか確認
2. `~/.ssh/authorized_keys` のパーミッションが `600` であることを確認
3. GitHub Secretsに登録した秘密鍵が正しいか確認（`-----BEGIN` から `-----END` まで全て含む）

### Docker Hub プッシュエラー

**エラー**: `denied: requested access to the resource is denied`

**原因**: Docker Hubの認証情報が正しくない、またはリポジトリが存在しない

**解決策**:
1. https://hub.docker.com/ にログイン
2. リポジトリ `trust-code-wordpress` が存在することを確認
3. 存在しない場合は **Create Repository** で作成（Public推奨）
4. アクセストークンが `Read, Write, Delete` 権限を持っているか確認

### Tailscale接続エラー

**エラー**: `Failed to connect to Tailscale`

**原因**: Tailscale OAuth クライアントの設定が正しくない

**解決策**:
1. https://login.tailscale.com/admin/settings/oauth で新しいOAuthクライアントを生成
2. `Devices: Write` スコープを選択
3. GitHub Secretsに `TAILSCALE_OAUTH_CLIENT_ID` と `TAILSCALE_OAUTH_SECRET` を再登録

**代替案**: Tailscaleを使用せず、`NAS_HOST` にグローバルIPアドレスまたはDDNSホスト名を設定

### NASでのコンテナ再起動エラー

**エラー**: `docker-compose: command not found`

**原因**: NAS上のDockerまたはDocker Composeのパスが正しくない

**解決策**:
NAS（Synology）では、`docker` と `docker-compose` コマンドは以下のパスにあります：
- `/usr/local/bin/docker`
- `/usr/local/bin/docker-compose`

ワークフローの該当箇所を修正するか、NASのPATH環境変数に `/usr/local/bin` を追加してください。

### `.env.production` が見つからない

**エラー**: `No such file or directory: .env.production`

**原因**: NAS上に `.env.production` ファイルが配置されていない

**解決策**:
1. NASにSSH接続
   ```bash
   ssh -p 922 akira_kano1101@akirasynology
   ```

2. `.env.production` を作成
   ```bash
   cd /volume1/docker/trust-code
   nano .env.production
   ```

3. 環境変数を設定（`.env.example` を参照）
   ```env
   WP_HOME=https://trust-code.net
   WP_SITEURL=https://trust-code.net
   MYSQL_ROOT_PASSWORD=your_secure_password
   MYSQL_PASSWORD=your_secure_password
   CF_TUNNEL_TOKEN=your_cloudflare_tunnel_token
   ```

4. 保存して終了（`Ctrl+O`, `Enter`, `Ctrl+X`）

---

## 参考資料

- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [Docker Hub - アクセストークン](https://docs.docker.com/docker-hub/access-tokens/)
- [Tailscale - GitHub Actions](https://tailscale.com/kb/1132/github-actions/)
- [Synology - SSH接続](https://kb.synology.com/en-global/DSM/help/DSM/AdminCenter/system_terminal)

---

## まとめ

GitHub Actionsによる自動デプロイを設定することで、以下のメリットがあります：

✅ **自動化**: git push でデプロイが自動実行
✅ **効率化**: テーマのみの変更時はDockerイメージのビルドをスキップ
✅ **安全性**: Tailscale経由のセキュアな接続
✅ **可視性**: GitHub Actions UIでデプロイ状況を確認
✅ **ロールバック**: タイムスタンプ付きDockerイメージでロールバック可能

何か問題が発生した場合は、GitHub Actions の Logs タブでエラーメッセージを確認してください。
