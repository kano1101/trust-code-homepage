# TrustCode WordPress Theme - 技術ドキュメント

## いいね機能の実装

### 概要
WordPress REST APIを使用したカスタムいいね機能の実装。Cookie認証により、ユーザーごとのいいね状態を30日間保持。

### 問題と解決策

#### 問題1: REST API 500エラー（ArgumentCountError）
**症状**: いいねボタンをクリックすると500エラー、`is_numeric() expects exactly 1 argument, 3 given`

**原因**:
WordPress REST APIの`validate_callback`は3つの引数を受け取る関数を期待しますが、`is_numeric`や`is_email`のようなPHP標準関数は1つの引数しか受け取りません。

```php
// ❌ 間違い
'args' => ['id' => ['validate_callback' => 'is_numeric']],

// WordPressが内部で呼び出す:
is_numeric('6', $request, 'id')  // エラー！
```

**解決策**:
無名関数でラップして引数を調整：

```php
// ✅ 正しい
'args' => ['id' => ['validate_callback' => function($param) { return is_numeric($param); }]],
```

#### 問題2: いいねボタンをクリックしても状態が変わらない（フロントエンド）
**症状**: いいねボタンは表示されるが、クリックしても赤いハートに変わらない

**原因**:
1. REST APIのURL形式が旧形式（`/index.php?rest_route=`）を使用していた
2. fetch呼び出しに`credentials: 'same-origin'`が欠けており、Cookieが送受信されていなかった
3. 初期状態で記事のいいね数を取得していなかった

**解決策**:
```typescript
// 1. WordPress標準のREST API URL形式を使用
const getRestUrl = (path: string): string => {
  return `/wp-json${path}`;  // /wp-json/readdy/v1/posts/{id}/like
};

// 2. credentials オプションを追加してCookie送受信を有効化
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin',  // 重要: Cookie認証に必須
});

// 3. 初期化時に記事データからいいね数を取得
useEffect(() => {
  if (postId) {
    const likeKey = `readdy_liked_${postId}`;
    setIsLiked(getCookie(likeKey) === '1');

    fetch(`/wp-json/wp/v2/posts/${postId}`)
      .then(res => res.json())
      .then(data => {
        if (data.likes_count !== undefined) {
          setLikesCount(data.likes_count);
        }
      })
      .catch(err => console.error('Failed to fetch likes count:', err));
  }
}, [postId]);
```

### ベストプラクティス

#### 1. REST API URL形式
**推奨**: `/wp-json/` プレフィックス
```typescript
const url = `/wp-json/readdy/v1/posts/${postId}/like`;
```

**理由**:
- WordPress標準の形式
- Pretty permalinksが有効でなくても動作
- より簡潔で読みやすい
- モダンなWordPress開発の標準

**非推奨**: `/index.php?rest_route=` 形式（旧形式）

#### 2. Cookie認証パターン
**重要**: `credentials: 'same-origin'` オプション

```typescript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin',  // 同一オリジンのCookieを送受信
});
```

**理由**:
- ブラウザのデフォルトではCookieは送信されない
- WordPressのセッション認証にCookieが必要
- サーバー側の`setcookie()`で設定したCookieを受け取るために必須

#### 3. 二重Cookie管理（サーバー + クライアント）
**パターン**: バックエンドとフロントエンドの両方でCookieを管理

```php
// バックエンド（PHP）
function readdy_like_post($request) {
  $post_id = $request['id'];
  $like_key = 'readdy_liked_' . $post_id;

  // Cookie確認
  if (isset($_COOKIE[$like_key])) {
    return new WP_Error('already_liked', 'Already liked', ['status' => 400]);
  }

  // いいね処理
  $likes = (int) get_post_meta($post_id, '_readdy_likes_count', true) + 1;
  update_post_meta($post_id, '_readdy_likes_count', $likes);

  // Cookie設定（30日間）
  setcookie($like_key, '1', time() + (30 * 24 * 60 * 60), '/');

  return ['success' => true, 'likes_count' => $likes];
}
```

```typescript
// フロントエンド（TypeScript）
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// API成功後にクライアント側でもCookieを設定（バックアップ）
const likeKey = `readdy_liked_${postId}`;
setCookie(likeKey, '1', 30);
```

**理由**:
- サーバー側: 信頼できる認証元として機能
- クライアント側: 即座にUIを更新、APIレスポンス前の状態反映
- 冗長性: 片方が失敗しても動作継続

#### 4. エラーハンドリングとデバッグ
**パターン**: 段階的なログ出力

```typescript
const likePost = async () => {
  console.log('[Like] Attempting to like post:', postId);

  try {
    const url = getRestUrl(`/readdy/v1/posts/${postId}/like`);
    console.log('[Like] Fetching URL:', url);

    const response = await fetch(url, { /* ... */ });
    console.log('[Like] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('[Like] Error response:', errorData);
      throw new Error(errorData.message || 'Failed to like post');
    }

    const data = await response.json();
    console.log('[Like] Success response:', data);

    // 状態更新...
  } catch (err: any) {
    setError(err.message || 'いいねに失敗しました');
    console.error('[Like] Error:', err);
  }
};
```

**メリット**:
- 問題発生箇所の特定が容易
- ブラウザDevToolsで動作確認可能
- 本番環境でも安全（console.logは実害なし）

#### 5. localhost環境での動作
**確認事項**:
- ✅ `/wp-json/` 形式は localhost で正常に動作
- ✅ `credentials: 'same-origin'` は同一オリジンなので動作
- ✅ Cookie は `localhost` ドメインで正常に保存される

**注意点**:
- HTTPS不要（ただし本番環境ではHTTPS推奨）
- CORS設定不要（同一オリジン）
- プロキシ不要（WordPress組み込み）

### ファイル構成

```
wordpress/themes/readdy-theme4/
├── functions.php                    # いいねAPI登録、エンドポイント実装
├── src/
│   ├── hooks/
│   │   └── usePostLikes.ts         # いいね機能のReact Hook
│   └── pages/
│       └── single/
│           └── page.tsx            # 記事ページ、いいねボタンUI
```

### API仕様

#### エンドポイント1: いいね追加
```
POST /wp-json/readdy/v1/posts/{id}/like
```

**レスポンス（成功）**:
```json
{
  "success": true,
  "likes_count": 5
}
```

**レスポンス（すでにいいね済み）**:
```json
{
  "code": "already_liked",
  "message": "Already liked",
  "data": {
    "status": 400
  }
}
```

#### エンドポイント2: いいね解除
```
POST /wp-json/readdy/v1/posts/{id}/unlike
```

**レスポンス（成功）**:
```json
{
  "success": true,
  "likes_count": 4
}
```

**レスポンス（いいねしていない）**:
```json
{
  "code": "not_liked",
  "message": "Not liked yet",
  "data": {
    "status": 400
  }
}
```

### データ保存

#### WordPress Post Meta
- **Key**: `_readdy_likes_count`
- **Value**: 整数（いいね数）
- **説明**: 各記事ごとのいいね数を保存

#### Cookie
- **名前**: `readdy_liked_{post_id}`
- **値**: `'1'`（いいね済み）
- **有効期限**: 30日間
- **パス**: `/`（サイト全体）
- **説明**: ユーザーごとのいいね状態を保存

---

## その他の実装

### Markdown対応
- **パーサー**: 公式Parsedown + ParsedownExtra
- **場所**: `inc/Parsedown.php`, `inc/ParsedownExtra.php`
- **キャッシュ**: Transient API使用（12時間）

### About ページの改行
- **問題**: `\n`が文字列として表示される
- **解決**: 別フィールド（`bio`と`birthdate`）に分割し、React側で`<br />`タグ挿入

### ブログカードの抜粋
- **問題**: 抜粋が`[...]`で終わる
- **解決**: `excerpt_more` フィルターで`...`に変更

```php
add_filter('excerpt_more', function($more) {
  return '...';
});
```

---

## Single Source of Truth (SSOT) アーキテクチャ

### 問題: 情報サイロ化
**症状**: `bio`と`birthdate`などの情報が複数の場所にハードコードされている

**発見された重複箇所**:
1. `src/config/siteConfig.ts` - 11-12行目
2. `src/hooks/useWordPressConfig.ts` - 60-61, 98-99, 140-141行目（3箇所）
3. `src/pages/about/page.tsx` - 11-12行目
4. `src/pages/home/components/Sidebar.tsx` - 13-14, 27-28行目（2箇所）

**問題点**:
- データの一貫性が保証されない
- 変更時に複数箇所を修正する必要がある
- メンテナンス性の低下
- バグの温床

### 解決策: siteConfig.tsを単一の情報源に

**アーキテクチャ**:
```
WordPress DB (最優先)
  ↓ REST API
useWordPressConfig (フォールバック: siteConfig)
  ↓
各コンポーネント (フォールバック: siteConfig)
```

**実装**:

#### 1. siteConfig.tsを単一の情報源として定義
```typescript
// src/config/siteConfig.ts
export const siteConfig = {
  siteName: 'TrustCode',
  tagline: 'ともに信頼あるコードを築こう',
  author: {
    name: 'Aqun',
    bio: 'ケーキ屋の社内エンジニア',
    birthdate: '1989年11月1日生',
    // ...
  },
  // ...
};
```

#### 2. useWordPressConfig.tsでsiteConfigをimport
```typescript
import { siteConfig } from '../config/siteConfig';

// WordPressから取得した値のフォールバック
author: {
  name: siteInfo.author_name || siteConfig.author.name,
  bio: siteInfo.author_bio || siteConfig.author.bio,
  birthdate: siteInfo.author_birthdate || siteConfig.author.birthdate,
  // ...
}

// 開発環境・エラー時のフォールバック
return siteConfig;
```

#### 3. 各コンポーネントでsiteConfigをimport
```typescript
// src/pages/about/page.tsx
import { siteConfig } from '../../config/siteConfig';

const author = config?.author || siteConfig.author;
```

```typescript
// src/pages/home/components/Sidebar.tsx
import { siteConfig } from '../../../config/siteConfig';

const author = config?.author || siteConfig.author;

// JSX内で変数を使用（ハードコードしない）
<span className="text-white font-bold text-2xl">{author.avatar}</span>
<h3>{author.name}</h3>
<p>{author.bio}<br />{author.birthdate}</p>
```

### メリット

1. **単一の情報源**: すべてのデフォルト値は`siteConfig.ts`のみで管理
2. **保守性向上**: 変更は1箇所だけで完結
3. **一貫性保証**: データの矛盾が発生しない
4. **型安全**: TypeScriptの型推論が効く
5. **テスト容易**: モックが簡単

### データフロー

```
┌─────────────────┐
│ WordPress DB    │ (最優先のデータソース)
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│ useWordPress    │ フォールバック: siteConfig
│ Config Hook     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Component       │ フォールバック: siteConfig
│ (about, sidebar)│
└─────────────────┘
```

### 変更が必要な場合

**デフォルト値の変更**:
1. `src/config/siteConfig.ts`の1箇所のみを編集
2. すべてのコンポーネントとフックが自動的に新しい値を使用

**WordPress管理画面での変更**:
1. WordPress管理画面で値を設定
2. REST APIを通じて動的に反映
3. データベースに値がない場合のみsiteConfigが使用される

---

## 本番環境デプロイ（NAS）

### デプロイスクリプト
**ファイル**: `./wordpress/themes/readdy-theme4/deploy-prod.sh`

**実行方法**:
```bash
./wordpress/themes/readdy-theme4/deploy-prod.sh
```

**処理内容**:
1. Vite ビルド（クリーンビルド）
2. アセットのコピー（manifest.json含む）
3. テーマファイルを NAS へ tar 転送
4. docker-compose ファイルを NAS へ tar 転送
5. Nginx production.conf を NAS へ転送
6. root 権限でファイル配置
7. Docker Compose で本番環境起動

### Docker Volumes の完全削除（クリーンスタート）

本番環境を完全にクリーンな状態から始めたい場合（全データ削除）：

```bash
# NAS にログイン
ssh -p 922 akira_kano1101@akirasynology

# root に切り替え
sudo -i

# trust-code ディレクトリに移動
cd /volume1/docker/trust-code

# コンテナを停止して削除
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production down

# volumes を完全に削除
# ⚠️ 注意: Docker Compose はプロジェクト名（trust-code）をプレフィックスとして付ける
docker volume rm trust-code_db_data trust-code_wp_html

# 確認（何も表示されなければ削除成功）
docker volume ls | grep -E "db_data|wp_html"

# exit で root から抜ける
exit
exit
```

**削除されるデータ**:
- ❌ 全ての記事、コメント、いいねデータ
- ❌ アップロードした画像などのメディアファイル
- ❌ WordPress の全設定（admin ユーザー含む）
- ❌ データベースの全テーブル

**削除後の効果**:
- ✅ URL の問題が完全にクリアされる
- ✅ 真っ新な WordPress が立ち上がる
- ✅ 次回デプロイ時に新しい volumes が自動作成される

### 本番環境の URL 設定

**問題**: Cloudflare Tunnel 経由で https://trust-code.net にアクセスしても `:8080` にリダイレクトされる

**原因**: WordPress データベースの `siteurl` と `home` オプションに古い URL が保存されている

**解決策**: functions.php で環境変数から URL を強制更新

```php
/* ========== サイトURLの強制設定（本番環境対応） ========== */
function readdy_force_site_url() {
  $wp_home = getenv('WP_HOME');
  $wp_siteurl = getenv('WP_SITEURL');

  if ($wp_home && $wp_home !== get_option('home')) {
    update_option('home', $wp_home);
  }

  if ($wp_siteurl && $wp_siteurl !== get_option('siteurl')) {
    update_option('siteurl', $wp_siteurl);
  }
}
add_action('init', 'readdy_force_site_url');
```

**環境変数**（.env.production）:
```bash
WP_HOME=https://trust-code.net
WP_SITEURL=https://trust-code.net
```

### Nginx 本番環境設定

**ファイル**: `nginx/conf.d/production.conf`

**特徴**:
- Cloudflare Tunnel 経由の HTTPS アクセスに対応
- `X-Forwarded-Proto: https` を常に設定
- WordPress への reverse proxy

**Docker Compose での適用**:
```yaml
# docker-compose.production.yml
nginx:
  ports: []  # Cloudflare Tunnel 使用のためポート公開不要
  expose:
    - "80"
  volumes:
    - ./nginx/conf.d/production.conf:/etc/nginx/conf.d/default.conf:ro
```

### Cloudflare Tunnel

**設定箇所**:
- docker-compose.production.yml の `cloudflared` サービス
- .env.production の `CF_TUNNEL_TOKEN`

**メリット**:
- ポート開放不要（セキュリティ向上）
- 自動 HTTPS 化
- DDoS 保護

---

**最終更新**: 2025-10-12
