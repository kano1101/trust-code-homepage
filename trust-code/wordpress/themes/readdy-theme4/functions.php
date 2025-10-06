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

/* ========== 管理画面での警告表示 ========== */
function readdy_admin_notices() {
  // Simple Like Pageプラグインのチェック（現在は独自実装を使用）
  // 将来的にSimple Like Pageを使用する場合はこのコメントを外す
  /*
  if (!is_plugin_active('simple-like-page-plugin/simple-like-page-plugin.php')) {
    echo '<div class="notice notice-warning is-dismissible">';
    echo '<p><strong>Readdy Theme:</strong> Simple Like Pageプラグインがインストールされていません。いいね機能を使用するにはプラグインをインストールしてください。</p>';
    echo '</div>';
  }
  */
}
add_action('admin_notices', 'readdy_admin_notices');

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

  // type="module" を設定するため、add_inline_scriptを使用
  wp_register_script('readdy-main', $js_url, [], null, true);
  add_filter('script_loader_tag', function($tag, $handle, $src) {
    if ('readdy-main' === $handle) {
      $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
    }
    return $tag;
  }, 10, 3);
  wp_enqueue_script('readdy-main');
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

  // サイト設定エンドポイント
  register_rest_route('readdy/v1', '/site-config', [
    'methods' => 'GET',
    'callback' => 'readdy_get_site_config',
    'permission_callback' => '__return_true'
  ]);

  // いいね機能のエンドポイント
  register_rest_route('readdy/v1', '/posts/(?P<id>\d+)/like', [
    'methods' => 'POST',
    'callback' => 'readdy_like_post',
    'permission_callback' => '__return_true',
    'args' => [
      'id' => [
        'validate_callback' => function($param) {
          return is_numeric($param);
        }
      ],
    ],
  ]);

  register_rest_route('readdy/v1', '/posts/(?P<id>\d+)/unlike', [
    'methods' => 'POST',
    'callback' => 'readdy_unlike_post',
    'permission_callback' => '__return_true',
    'args' => [
      'id' => [
        'validate_callback' => function($param) {
          return is_numeric($param);
        }
      ],
    ],
  ]);

  // いいね数をREST APIレスポンスに追加
  register_rest_field('post', 'likes_count', [
    'get_callback' => fn($obj) => (int) get_post_meta($obj['id'], '_readdy_likes_count', true),
    'schema' => ['type' => 'integer'],
  ]);

  // コメント投稿用カスタムエンドポイント（認証不要）
  register_rest_route('readdy/v1', '/posts/(?P<id>\d+)/comments', [
    'methods' => 'POST',
    'callback' => 'readdy_submit_comment',
    'permission_callback' => '__return_true',
    'args' => [
      'id' => [
        'required' => true,
        'validate_callback' => function($param) {
          return is_numeric($param);
        }
      ],
      'author_name' => [
        'required' => true,
        'sanitize_callback' => 'sanitize_text_field',
      ],
      'author_email' => [
        'required' => true,
        'sanitize_callback' => 'sanitize_email',
        'validate_callback' => function($param) {
          return is_email($param);
        }
      ],
      'content' => [
        'required' => true,
        'sanitize_callback' => 'sanitize_textarea_field',
      ],
    ],
  ]);
});

/* ========== いいね機能 ========== */
function readdy_like_post($request) {
  $post_id = $request['id'];

  // 投稿の存在確認
  if (!get_post($post_id)) {
    return new WP_Error('invalid_post', 'Invalid post ID', ['status' => 404]);
  }

  // クライアントIPを取得（簡易的な重複防止）
  $user_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
  $like_key = 'readdy_liked_' . $post_id;

  // クッキーで既にいいねしているかチェック
  if (isset($_COOKIE[$like_key])) {
    return new WP_Error('already_liked', 'Already liked this post', ['status' => 400]);
  }

  // いいね数を取得して増やす
  $current_likes = (int) get_post_meta($post_id, '_readdy_likes_count', true);
  $new_likes = $current_likes + 1;
  update_post_meta($post_id, '_readdy_likes_count', $new_likes);

  // クッキーを設定（30日間）
  setcookie($like_key, '1', time() + (30 * 24 * 60 * 60), '/');

  return [
    'success' => true,
    'likes_count' => $new_likes,
    'message' => 'Post liked successfully'
  ];
}

function readdy_unlike_post($request) {
  $post_id = $request['id'];

  // 投稿の存在確認
  if (!get_post($post_id)) {
    return new WP_Error('invalid_post', 'Invalid post ID', ['status' => 404]);
  }

  $like_key = 'readdy_liked_' . $post_id;

  // クッキーでいいねしているかチェック
  if (!isset($_COOKIE[$like_key])) {
    return new WP_Error('not_liked', 'Post not liked yet', ['status' => 400]);
  }

  // いいね数を取得して減らす
  $current_likes = (int) get_post_meta($post_id, '_readdy_likes_count', true);
  $new_likes = max(0, $current_likes - 1); // 0未満にならないように
  update_post_meta($post_id, '_readdy_likes_count', $new_likes);

  // クッキーを削除
  setcookie($like_key, '', time() - 3600, '/');

  return [
    'success' => true,
    'likes_count' => $new_likes,
    'message' => 'Post unliked successfully'
  ];
}

/* ========== コメント投稿機能（認証不要） ========== */
function readdy_submit_comment($request) {
  $post_id = $request['id'];
  $author_name = $request['author_name'];
  $author_email = $request['author_email'];
  $content = $request['content'];

  // 投稿の存在確認
  $post = get_post($post_id);
  if (!$post) {
    return new WP_Error('invalid_post', 'Invalid post ID', ['status' => 404]);
  }

  // コメントが許可されているか確認
  if (!comments_open($post_id)) {
    return new WP_Error('comments_closed', 'Comments are closed for this post', ['status' => 403]);
  }

  // コメントデータを準備
  $comment_data = [
    'comment_post_ID' => $post_id,
    'comment_author' => $author_name,
    'comment_author_email' => $author_email,
    'comment_content' => $content,
    'comment_type' => 'comment',
    'comment_parent' => 0,
    'user_id' => 0, // 匿名コメント
    'comment_author_IP' => $_SERVER['REMOTE_ADDR'] ?? '',
    'comment_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'comment_date' => current_time('mysql'),
    'comment_approved' => 0, // モデレーション待ち
  ];

  // コメントを挿入
  $comment_id = wp_insert_comment($comment_data);

  if (!$comment_id) {
    return new WP_Error('comment_failed', 'Failed to submit comment', ['status' => 500]);
  }

  return [
    'success' => true,
    'comment_id' => $comment_id,
    'message' => 'Comment submitted successfully and is awaiting moderation',
    'status' => 'pending'
  ];
}

/* ========== サイト設定取得 ========== */
function readdy_get_site_config() {
  return [
    'site' => [
      'title' => get_option('readdy_site_title', get_bloginfo('name')),
      'tagline' => get_option('readdy_site_tagline', '気持ちよく信頼あるコードを築こう'),
      'description' => get_option('readdy_site_description', ''),
      'url' => home_url(),
    ],
    'author' => [
      'name' => get_option('readdy_author_name', 'Author'),
      'role' => get_option('readdy_author_role', 'Writer'),
      'avatar' => get_option('readdy_author_avatar', 'A'),
      'bio' => get_option('readdy_author_bio', ''),
    ],
    'theme' => [
      'primaryColor' => get_option('readdy_theme_primary_color', '#7C3AED'),
      'accentColor' => get_option('readdy_theme_accent_color', '#14B8A6'),
      'gradients' => [
        'hero' => get_option('readdy_theme_gradient_hero', 'from-purple-600 to-purple-800'),
        'card' => get_option('readdy_theme_gradient_card', 'from-purple-600 to-purple-800'),
        'button' => get_option('readdy_theme_gradient_button', 'from-purple-600 to-purple-800'),
      ],
    ],
    'navigation' => [
      'items' => json_decode(get_option('readdy_nav_items', '[]'), true),
    ],
    'features' => json_decode(get_option('readdy_features', '[]'), true),
  ];
}

/* ========== カスタムURL用のリライトルール ========== */
add_action('init', function() {
  error_log('[Readdy Theme] Adding rewrite rules');
  add_rewrite_rule('^categories/?$', 'index.php?custom_page=categories', 'top');
  add_rewrite_rule('^about/?$', 'index.php?custom_page=about', 'top');
  add_rewrite_rule('^contact/?$', 'index.php?custom_page=contact', 'top');
  add_rewrite_rule('^privacy/?$', 'index.php?custom_page=privacy', 'top');
  add_rewrite_rule('^terms/?$', 'index.php?custom_page=terms', 'top');
  add_rewrite_rule('^rss/?$', 'index.php?custom_page=rss', 'top');
});

// テーマ有効化時にリライトルールをフラッシュ
add_action('after_switch_theme', function() {
  error_log('[Readdy Theme] Theme activated - flushing rewrite rules');
  flush_rewrite_rules();
});

add_filter('query_vars', function($vars) {
  error_log('[Readdy Theme] Registering custom_page query var');
  $vars[] = 'custom_page';
  return $vars;
});

add_action('template_include', function($template) {
  $custom_page = get_query_var('custom_page');
  error_log('[Readdy Theme] template_include - custom_page: ' . var_export($custom_page, true));

  if ($custom_page) {
    $template_file = 'page-' . $custom_page . '.php';
    error_log('[Readdy Theme] Loading template: ' . $template_file);
    $new_template = locate_template([$template_file]);
    if ($new_template) {
      error_log('[Readdy Theme] Found template: ' . $new_template);
      return $new_template;
    } else {
      error_log('[Readdy Theme] Template ' . $template_file . ' not found');
    }
  }

  return $template;
});