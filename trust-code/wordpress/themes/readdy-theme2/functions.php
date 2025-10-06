<?php
/**
 * Readdy Theme functions
 * - Viteビルド資産のenqueue（既存）
 * - Markdown(ACF: md_body) → HTML 変換
 * - RESTに md_body / md_html 追加
 */

/* ========== テーマサポートの設定 ========== */
function readdy_theme_setup() {
  // タイトルタグの自動生成
  add_theme_support('title-tag');

  // HTML5対応
  add_theme_support('html5', array(
    'search-form',
    'comment-form',
    'comment-list',
    'gallery',
    'caption',
  ));

  // 投稿サムネイル
  add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'readdy_theme_setup');

/* ========== WordPressデフォルトスタイルを無効化 ========== */
function readdy_remove_wp_styles() {
  // WordPressのブロックエディタスタイルを削除
  wp_dequeue_style('wp-block-library');
  wp_dequeue_style('wp-block-library-theme');
  wp_dequeue_style('classic-theme-styles');
  wp_dequeue_style('global-styles');
}
add_action('wp_enqueue_scripts', 'readdy_remove_wp_styles', 100);

/* ========== 既存：Vite資産の読み込み ========== */
function readdy_theme_assets() {
  $dir  = get_template_directory();
  $uri  = get_template_directory_uri();
  $mf   = $dir . '/manifest.json';

  // デバッグ: manifest.jsonの存在確認
  if (!file_exists($mf)) {
    error_log('Readdy Theme: manifest.json not found at ' . $mf);
    return;
  }

  $manifest = json_decode(file_get_contents($mf), true);
  $entry = null;
  foreach ($manifest as $k => $v) {
    if (!empty($v['isEntry'])) { $entry = $v; break; }
  }

  if (!$entry) {
    error_log('Readdy Theme: No entry found in manifest.json');
    return;
  }

  // CSS
  if (!empty($entry['css'])) {
    foreach ($entry['css'] as $css) {
      // manifest.json の css パスは "assets/..." なのでそのまま結合
      $css_url = $uri . '/' . $css;
      error_log('Readdy Theme: Enqueuing CSS - ' . $css_url);
      wp_enqueue_style('readdy-'.md5($css), $css_url, [], null);
    }
  }

  // JS（type=module を付与）
  // manifest.json の file パスは "assets/..." なのでそのまま結合
  $js_url = $uri . '/' . $entry['file'];
  error_log('Readdy Theme: Enqueuing JS - ' . $js_url);
  wp_enqueue_script('readdy-main', $js_url, [], null, true);
  wp_script_add_data('readdy-main', 'type', 'module');
}
add_action('wp_enqueue_scripts', 'readdy_theme_assets');

/* ========== Markdown 変換準備 ========== */
function rtheme_get_parsedown() {
  static $parser = null;
  if ($parser) return $parser;

  require_once get_template_directory() . '/inc/Parsedown.php';
  $extra = get_template_directory() . '/inc/ParsedownExtra.php';
  if (file_exists($extra)) {
    require_once $extra;
    $parser = new ParsedownExtra();
  } else {
    $parser = new Parsedown();
  }
  if (method_exists($parser, 'setSafeMode')) {
    $parser->setSafeMode(true);
  }
  return $parser;
}

/**
 * ACFの md_body を取得
 */
function rtheme_get_md_body($post_id) {
  if (function_exists('get_field')) {
    $md = get_field('md_body', $post_id);
    if (!empty($md)) return $md;
  }
  $md = get_post_meta($post_id, 'md_body', true);
  return $md ?: '';
}

/* ========== the_content をMD優先でHTML化 ========== */
add_filter('the_content', function ($html) {
  global $post;
  if (empty($post) || !isset($post->ID)) return $html;

  $md = rtheme_get_md_body($post->ID);
  if ($md === '' || $md === null) return $html;

  $hash    = md5($md);
  $cached  = get_post_meta($post->ID, '_md_html_cache', true);
  if (is_array($cached) && ($cached['hash'] ?? '') === $hash) {
    $rendered = $cached['html'];
  } else {
    $parser   = rtheme_get_parsedown();
    $rendered = $parser->text($md);
    $rendered = wp_kses_post($rendered);
    update_post_meta($post->ID, '_md_html_cache', [
      'hash' => $hash,
      'html' => $rendered,
    ]);
  }
  return $rendered;
}, 9);

/* ========== キャッシュ無効化 ========== */
add_action('updated_post_meta', function ($meta_id, $post_id, $meta_key, $_prev) {
  if ($meta_key === 'md_body') {
    delete_post_meta($post_id, '_md_html_cache');
  }
}, 10, 4);

add_action('acf/save_post', function ($post_id) {
  if (get_post_type($post_id) !== 'post') return;
  delete_post_meta($post_id, '_md_html_cache');
}, 20);

/* ========== REST APIフィールド登録 ========== */
add_action('rest_api_init', function () {
  register_rest_field('post', 'md_body', [
    'get_callback' => fn($obj) => rtheme_get_md_body($obj['id']),
    'schema' => ['type' => 'string'],
  ]);

  register_rest_field('post', 'md_html', [
    'get_callback' => function ($obj) {
      $post_id = $obj['id'];
      $md = rtheme_get_md_body($post_id);
      if ($md === '' || $md === null) return null;

      $hash    = md5($md);
      $cached  = get_post_meta($post_id, '_md_html_cache', true);
      if (is_array($cached) && ($cached['hash'] ?? '') === $hash) {
        return $cached['html'];
      }
      $parser   = rtheme_get_parsedown();
      $rendered = wp_kses_post($parser->text($md));
      update_post_meta($post_id, '_md_html_cache', [
        'hash' => $hash,
        'html' => $rendered,
      ]);
      return $rendered;
    },
    'schema' => ['type' => 'string'],
  ]);
});