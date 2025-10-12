# 05. functions.php の実行タイミング調整

## 問題

現在 `init` フックで URL 設定を行っているが、WordPress がそれより早く URL を生成している可能性がある。

## 現在のコード

```php
add_action('init', 'readdy_force_site_url');
```

`init` フックは WordPress が完全に読み込まれた後に実行されるため、遅すぎる可能性がある。

## 解決策

より早いタイミングで実行されるフックに変更する。

### オプション1: muplugins_loaded フック

最も早いタイミングで実行される:

```php
add_action('muplugins_loaded', 'readdy_force_site_url');
```

### オプション2: wp-config.php で直接設定（推奨）

functions.php ではなく、03-fix-wp-config.md で wp-config.php に直接書き込む方が確実。

## 修正内容

functions.php の `readdy_force_site_url()` 関数を簡素化:

```php
/* ========== サイトURLの強制設定（本番環境対応） ========== */
function readdy_force_site_url() {
  // wp-config.php で設定済みのため、ここでは $_SERVER 変数のみ調整
  // HTTPS環境ではサーバーポートを443に強制
  if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['SERVER_PORT'] = 443;
    $_SERVER['HTTPS'] = 'on';
  }
}
// より早いタイミングで実行
add_action('muplugins_loaded', 'readdy_force_site_url');
```

または、完全に削除して wp-config.php のみに依存する。

## チェックポイント

- [ ] functions.php を修正（または削除）
- [ ] 開発環境でテスト
- [ ] 診断スクリプトで $_SERVER['SERVER_PORT'] が 443 になっているか確認
- [ ] 本番環境にデプロイ
- [ ] 動作確認

## 推奨アプローチ

03-fix-wp-config.md で wp-config.php に直接設定を書き込むことで、functions.php の `readdy_force_site_url()` 内の `update_option()` 呼び出しは不要になる。

functions.php は $_SERVER 変数の調整のみに絞る。

## 次のステップ

06-test-and-verify.md で総合テストを実施する。

## ステータス

- [ ] functions.php 修正完了
- [ ] 開発環境テスト完了
- [ ] 本番環境デプロイ完了
- [ ] 動作確認完了
