# 02. Google Analytics 4 (gtag.js) 導入仕様

## 概要

ユーザーの動向を分析するため、Google Analytics 4（GA4）のトラッキングコードを導入。環境変数で測定IDを管理し、開発環境と本番環境で柔軟に切り替え可能な設計。

---

## 要件

### 機能要件
- Google Analytics 4 のトラッキングコード（gtag.js）を全ページに挿入
- 環境変数で測定IDを管理（`.env.production` および `.env.local`）
- 測定IDが未設定の場合はトラッキングを無効化（開発環境で誤ってトラッキングしない）
- シングルページアプリケーション（React SPA）に対応

### 非機能要件
- セキュリティ: XSS対策として `esc_attr()` と `esc_js()` を使用
- パフォーマンス: `async` 属性でスクリプトを非同期読み込み
- 保守性: 測定IDの変更は環境変数のみで対応可能

---

## 設計

### アーキテクチャ

```
.env.production (NAS)
  ↓
docker-compose.production.yml
  ↓ 環境変数として渡す
WordPressコンテナ (環境変数 GA_MEASUREMENT_ID)
  ↓
functions.php (環境変数を読み込み、定数化)
  ↓
header.php (定数が存在する場合にgtagスクリプトを出力)
  ↓
ブラウザ (全ページでGoogle Analyticsトラッキング)
```

---

## 実装

### 1. 環境変数の定義

#### `.env.example` への追加
```bash
# ----------------------------------------------
# Google Analytics 測定ID
# ----------------------------------------------
# Google Analytics 4 の測定ID（例: G-XXXXXXXXXX）
# 未設定の場合はトラッキングが無効化されます
GA_MEASUREMENT_ID=
```

#### `.env.production` への設定（NAS上）
```bash
GA_MEASUREMENT_ID=G-4NSE5TQJT7
```

#### `.env.local` への設定（ローカル開発環境）
```bash
# 開発環境ではトラッキングを無効化（空白のまま）
GA_MEASUREMENT_ID=
```

---

### 2. Docker Compose設定

#### `docker-compose.production.yml`
```yaml
services:
  wordpress:
    environment:
      # ...
      GA_MEASUREMENT_ID: ${GA_MEASUREMENT_ID:-}
```

#### `docker-compose.yml`（開発環境）
```yaml
services:
  wordpress:
    environment:
      # ...
      GA_MEASUREMENT_ID: ${GA_MEASUREMENT_ID:-}
```

---

### 3. テーマファイルの実装

#### `functions.php`（wordpress/themes/readdy-theme4/functions.php）

**追加箇所**: ファイルの先頭（11-13行目）

```php
/* ========== Google Analytics 設定 ========== */
// Google Analytics 測定IDを定義（環境変数から取得、なければ空）
define('GA_MEASUREMENT_ID', getenv('GA_MEASUREMENT_ID') ?: '');
```

**説明**:
- `getenv('GA_MEASUREMENT_ID')` で環境変数を取得
- 未設定の場合は空文字列を返す（`?:` 演算子）
- 定数 `GA_MEASUREMENT_ID` として定義し、テーマ全体で利用可能に

---

#### `header.php`（wordpress/themes/readdy-theme4/header.php）

**追加箇所**: 15-25行目（`<?php wp_head(); ?>` の直前）

```php
<!-- Google Analytics 4 -->
<?php if (defined('GA_MEASUREMENT_ID') && GA_MEASUREMENT_ID): ?>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr(GA_MEASUREMENT_ID); ?>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '<?php echo esc_js(GA_MEASUREMENT_ID); ?>');
</script>
<?php endif; ?>
```

**説明**:
1. **条件分岐**: `GA_MEASUREMENT_ID` が定義されており、かつ空でない場合のみスクリプトを出力
2. **XSS対策**:
   - `esc_attr()`: HTML属性内で使用（`id=` 属性）
   - `esc_js()`: JavaScript文字列内で使用（`gtag('config', ...)` 内）
3. **非同期読み込み**: `async` 属性でページ表示を妨げない
4. **標準的なGAコード**: Google公式のトラッキングコードをそのまま使用

---

## デプロイ手順

### Step 1: 環境変数を設定（NAS上）

```bash
ssh akiranas
cd /volume1/docker/trust-code

# .env.production を編集
sudo vi .env.production

# 以下の行を追加
GA_MEASUREMENT_ID=G-4NSE5TQJT7
```

---

### Step 2: テーマをビルド＆デプロイ（ローカル）

```bash
cd /Users/akirakano/IdeaProjects/homepage/wordpress/themes/readdy-theme4

# ビルド
npm run build
npm run copy:assets

# NASに転送
tar czf - assets/ manifest.json functions.php header.php style.css inc/ | \
  ssh akiranas "cd /volume1/docker/trust-code/wordpress/themes/readdy-theme4 && tar xzf -"
```

---

### Step 3: 環境変数ファイルを転送（ローカル）

```bash
cd /Users/akirakano/IdeaProjects/homepage

# .env.production を転送
tar czf - .env.production | \
  ssh akiranas "cd /volume1/docker/trust-code && tar xzf -"
```

---

### Step 4: コンテナを再起動（NAS上）

```bash
ssh akiranas
cd /volume1/docker/trust-code

# 環境変数を反映させるため、完全再起動が必要
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production down
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production up -d

# 環境変数が正しく設定されているか確認
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress env | grep GA_MEASUREMENT_ID

# 出力例: GA_MEASUREMENT_ID=G-4NSE5TQJT7
```

⚠️ **重要**: `restart` コマンドでは環境変数が再読み込みされないため、`down` → `up -d` で完全再起動する必要があります。

---

## 検証方法

### 1. ブラウザでの確認

1. `https://trust-code.net` にアクセス
2. **開発者ツールを開く**（F12 または 右クリック → 検証）
3. **ネットワークタブ**を開く
4. **ページをリロード**
5. 以下のリクエストが表示されることを確認:
   - `https://www.googletagmanager.com/gtag/js?id=G-4NSE5TQJT7`
   - `https://www.google-analytics.com/g/collect?...`

---

### 2. HTMLソースの確認

1. ページ上で**右クリック → ページのソースを表示**
2. `<head>` セクション内に以下のコードが含まれていることを確認:

```html
<!-- Google Analytics 4 -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4NSE5TQJT7"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-4NSE5TQJT7');
</script>
```

---

### 3. Google Analytics リアルタイムレポート

1. **Google Analytics 4 にログイン**
2. **レポート → リアルタイム**
3. `https://trust-code.net` にアクセスすると、リアルタイムレポートに**アクティブユーザーとして表示**される

---

### 4. 開発環境で無効化されていることを確認

```bash
# ローカル開発環境で起動
cd /Users/akirakano/IdeaProjects/homepage
docker-compose up -d

# http://localhost:8080 にアクセス
# HTMLソースに Google Analytics のコードが含まれていないことを確認
```

---

## トラブルシューティング

### 問題: Google Analytics タグが表示されない

#### 原因1: 環境変数が反映されていない

**確認方法**:
```bash
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress env | grep GA_MEASUREMENT_ID
```

**出力が空の場合**:
1. `.env.production` に `GA_MEASUREMENT_ID=G-4NSE5TQJT7` が記載されているか確認
2. `docker-compose.production.yml` に環境変数の設定があるか確認
3. コンテナを完全再起動（`down` → `up -d`）

---

#### 原因2: functions.php または header.php が更新されていない

**確認方法**:
```bash
# NAS上で確認
ssh akiranas
cat /volume1/docker/trust-code/wordpress/themes/readdy-theme4/functions.php | grep "GA_MEASUREMENT_ID"
cat /volume1/docker/trust-code/wordpress/themes/readdy-theme4/header.php | grep "gtag"
```

**出力が空の場合**:
- テーマファイルが正しく転送されていないため、再度デプロイ

---

#### 原因3: WordPressキャッシュが残っている

**解決方法**:
```bash
sudo docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file .env.production exec wordpress wp cache flush --allow-root
```

---

## セキュリティ考慮事項

### XSS対策
- `esc_attr()`: HTML属性内で使用（タグの属性値をエスケープ）
- `esc_js()`: JavaScript文字列内で使用（JavaScriptコード内の文字列をエスケープ）

これにより、万が一 `GA_MEASUREMENT_ID` に悪意のあるコードが挿入されても、実行されることはありません。

---

## パフォーマンス考慮事項

### 非同期読み込み
- `<script async>` 属性を使用
- ページ表示をブロックせずにバックグラウンドで読み込み
- ユーザー体験への影響を最小化

### DNS プリフェッチ
将来的な最適化として、以下を `header.php` に追加可能：
```html
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://www.google-analytics.com">
```

---

## 今後の拡張

### 1. カスタムイベントの追加
特定のユーザーアクション（記事のいいね、コメント投稿など）をトラッキング：

```javascript
// いいねボタンクリック時
gtag('event', 'like', {
  event_category: 'engagement',
  event_label: 'post_id_123',
  value: 1
});
```

### 2. ユーザープロパティの設定
ログインユーザーと非ログインユーザーを区別：

```php
<?php if (is_user_logged_in()): ?>
<script>
  gtag('set', 'user_properties', {
    user_type: 'logged_in'
  });
</script>
<?php endif; ?>
```

### 3. e-コマーストラッキング
将来的に有料コンテンツを販売する場合：

```javascript
gtag('event', 'purchase', {
  transaction_id: 'T12345',
  value: 1000,
  currency: 'JPY',
  items: [...]
});
```

---

## 関連ドキュメント
- CLAUDE.md: プロジェクト全体の要件定義
- requirements/01_memory_optimization.md: メモリ最適化とパフォーマンス改善

---

## 参考資料
- [Google Analytics 4 公式ドキュメント](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [WordPressテーマ開発 - Data Validation](https://developer.wordpress.org/themes/theme-security/data-sanitization-escaping/)

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2025-11-18 | 初版作成：Google Analytics 4 の導入仕様 |
