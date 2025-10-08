<?php
/**
 * Readdy Theme 4 Functions
 * - Viteビルド資産のenqueue
 * - Markdown変換（Parsedown）
 * - カスタムコメント投稿エンドポイント
 * - いいね機能（Simple Like Plugin使用）
 * - お問い合わせフォーム
 */

/* ========== テーマサポートの設定 ========== */
function readdy_theme_setup() {
  add_theme_support('title-tag');
  add_theme_support('html5', array(
    'search-form',
    'comment-form',
    'comment-list',
    'gallery',
    'caption',
  ));
  add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'readdy_theme_setup');

/* ========== WordPressデフォルトスタイルを無効化 ========== */
function readdy_remove_wp_styles() {
  wp_dequeue_style('wp-block-library');
  wp_dequeue_style('wp-block-library-theme');
  wp_dequeue_style('classic-theme-styles');
  wp_dequeue_style('global-styles');
}
add_action('wp_enqueue_scripts', 'readdy_remove_wp_styles', 100);

/* ========== Vite資産の読み込み ========== */
function readdy_theme_assets() {
  $dir  = get_template_directory();
  $uri  = get_template_directory_uri();
  $mf   = $dir . '/manifest.json';

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
      $css_url = $uri . '/' . $css;
      wp_enqueue_style('readdy-'.md5($css), $css_url, [], null);
    }
  }

  // JS (type=module)
  $js_url = $uri . '/' . $entry['file'];
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

/* ========== Markdown変換 ========== */
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
  $parser->setSafeMode(true);
  return $parser;
}

function rtheme_get_md_body($post_id) {
  return function_exists('get_field') && ($md = get_field('md_body', $post_id))
    ? $md
    : (get_post_meta($post_id, 'md_body', true) ?: '');
}

function rtheme_render_markdown($md, $post_id) {
  $hash = md5($md);
  $cached = get_post_meta($post_id, '_md_html_cache', true);

  if (is_array($cached) && ($cached['hash'] ?? '') === $hash) {
    return $cached['html'];
  }

  $rendered = wp_kses_post(rtheme_get_parsedown()->text($md));
  update_post_meta($post_id, '_md_html_cache', ['hash' => $hash, 'html' => $rendered]);
  return $rendered;
}

add_filter('the_content', function ($html) {
  global $post;
  if (empty($post->ID) || !($md = rtheme_get_md_body($post->ID))) return $html;
  return rtheme_render_markdown($md, $post->ID);
}, 9);

add_action('updated_post_meta', function ($meta_id, $post_id, $meta_key) {
  if ($meta_key === 'md_body') delete_post_meta($post_id, '_md_html_cache');
}, 10, 3);

add_action('acf/save_post', function ($post_id) {
  if (get_post_type($post_id) === 'post') delete_post_meta($post_id, '_md_html_cache');
}, 20);

/* ========== REST APIエンドポイント ========== */
add_action('rest_api_init', function () {
  // Markdownフィールド追加
  register_rest_field('post', 'md_body', [
    'get_callback' => fn($obj) => rtheme_get_md_body($obj['id']),
    'schema' => ['type' => 'string'],
  ]);

  register_rest_field('post', 'md_html', [
    'get_callback' => function ($obj) {
      $md = rtheme_get_md_body($obj['id']);
      return $md ? rtheme_render_markdown($md, $obj['id']) : null;
    },
    'schema' => ['type' => 'string'],
  ]);

  // サイト設定エンドポイント
  register_rest_route('readdy/v1', '/site-config', [
    'methods' => 'GET',
    'callback' => 'readdy_get_site_config',
    'permission_callback' => '__return_true'
  ]);

  // Simple Like Plugin用のいいね数をREST APIレスポンスに追加
  register_rest_field('post', 'likes_count', [
    'get_callback' => function($obj) {
      // Simple Like Pluginのメタデータキーを確認
      $likes = get_post_meta($obj['id'], '_post_like_count', true);
      return $likes ? (int) $likes : 0;
    },
    'schema' => ['type' => 'integer'],
  ]);

  // コメント投稿
  register_rest_route('readdy/v1', '/posts/(?P<id>\d+)/comments', [
    'methods' => 'POST',
    'callback' => 'readdy_submit_comment',
    'permission_callback' => '__return_true',
    'args' => [
      'id' => ['required' => true, 'validate_callback' => 'is_numeric'],
      'author_name' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
      'author_email' => ['required' => true, 'sanitize_callback' => 'sanitize_email', 'validate_callback' => 'is_email'],
      'content' => ['required' => true, 'sanitize_callback' => 'sanitize_textarea_field'],
    ],
  ]);

  // お問い合わせフォーム
  register_rest_route('readdy/v1', '/contact', [
    'methods' => 'POST',
    'callback' => 'readdy_submit_contact',
    'permission_callback' => '__return_true',
    'args' => [
      'name' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
      'email' => ['required' => true, 'sanitize_callback' => 'sanitize_email', 'validate_callback' => 'is_email'],
      'subject' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
      'message' => ['required' => true, 'sanitize_callback' => 'sanitize_textarea_field'],
    ],
  ]);
});

/* ========== コメント投稿 ========== */
function readdy_submit_comment($request) {
  $post_id = $request['id'];
  if (!get_post($post_id)) return new WP_Error('invalid_post', 'Invalid post ID', ['status' => 404]);
  if (!comments_open($post_id)) return new WP_Error('comments_closed', 'Comments closed', ['status' => 403]);

  $comment_id = wp_insert_comment([
    'comment_post_ID' => $post_id,
    'comment_author' => $request['author_name'],
    'comment_author_email' => $request['author_email'],
    'comment_content' => $request['content'],
    'comment_type' => 'comment',
    'comment_parent' => 0,
    'user_id' => 0,
    'comment_author_IP' => $_SERVER['REMOTE_ADDR'] ?? '',
    'comment_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'comment_date' => current_time('mysql'),
    'comment_approved' => 0,
  ]);

  if (!$comment_id) return new WP_Error('comment_failed', 'Failed to submit', ['status' => 500]);

  return ['success' => true, 'comment_id' => $comment_id, 'status' => 'pending'];
}

/* ========== お問い合わせフォーム送信 ========== */
function readdy_submit_contact($request) {
  try {
    $name = $request['name'];
    $email = $request['email'];
    $subject = $request['subject'];
    $message = $request['message'];

    // 管理者メールアドレス
    $admin_email = get_option('admin_email');

    // メール本文
    $email_body = "お問い合わせがありました。\n\n";
    $email_body .= "名前: {$name}\n";
    $email_body .= "メールアドレス: {$email}\n";
    $email_body .= "件名: {$subject}\n\n";
    $email_body .= "メッセージ:\n{$message}\n";

    // 開発環境判定（localhost または WP_DEBUG）
    $is_dev = (
      (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) ||
      (defined('WP_DEBUG') && WP_DEBUG)
    );

    if ($is_dev) {
      // 開発環境: ログに記録
      error_log("=== お問い合わせフォーム送信 ===");
      error_log("To: {$admin_email}");
      error_log("Subject: 【Trust Code】{$subject}");
      error_log($email_body);
      error_log("================================");

      return rest_ensure_response(['success' => true, 'message' => 'Contact form logged (dev mode)']);
    } else {
      // 本番環境: メール送信
      $headers = ['Content-Type: text/plain; charset=UTF-8'];
      $mail_sent = wp_mail($admin_email, "【Trust Code】{$subject}", $email_body, $headers);

      if (!$mail_sent) {
        return new WP_Error('mail_failed', 'Failed to send email', ['status' => 500]);
      }

      return rest_ensure_response(['success' => true, 'message' => 'Email sent successfully']);
    }
  } catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
    return new WP_Error('server_error', $e->getMessage(), ['status' => 500]);
  }
}

/* ========== サイト設定取得 ========== */
function readdy_get_site_config() {
  return [
    'site' => [
      'title' => get_option('readdy_site_title', get_bloginfo('name')),
      'tagline' => get_option('readdy_site_tagline', '気持ちいいコードで信頼を重ねて'),
      'description' => get_option('readdy_site_description', ''),
      'url' => home_url(),
    ],
    'author' => [
      'name' => get_option('readdy_author_name', 'Aqun'),
      'role' => get_option('readdy_author_role', 'ケーキ屋の社内エンジニア'),
      'avatar' => get_option('readdy_author_avatar', 'A'),
      'bio' => get_option('readdy_author_bio', 'ケーキ屋の社内エンジニア\n1989年11月1日生'),
    ],
    'theme' => [
      'primaryColor' => get_option('readdy_theme_primary_color', '#7C3AED'),
      'accentColor' => get_option('readdy_theme_accent_color', '#EAB308'),
      'gradients' => [
        'hero' => get_option('readdy_theme_gradient_hero', 'from-purple-900/60 to-purple-600/40'),
        'card' => get_option('readdy_theme_gradient_card', 'from-purple-600 to-purple-800'),
        'button' => get_option('readdy_theme_gradient_button', 'from-purple-600 to-purple-700'),
      ],
    ],
    'navigation' => [
      'items' => json_decode(get_option('readdy_nav_items', '[]'), true),
    ],
    'features' => json_decode(get_option('readdy_features', '[]'), true),
  ];
}

/* ========== カスタムページ用リライトルール ========== */
add_action('init', function() {
  // 固定ページ（最優先で追加）
  add_rewrite_rule('^about/?$', 'index.php?pagename=about', 'top');
  add_rewrite_rule('^contact/?$', 'index.php?pagename=contact', 'top');
  add_rewrite_rule('^privacy/?$', 'index.php?pagename=privacy', 'top');
  add_rewrite_rule('^terms/?$', 'index.php?pagename=terms', 'top');
  add_rewrite_rule('^categories/?$', 'index.php?pagename=categories', 'top');
  add_rewrite_rule('^tags/?$', 'index.php?pagename=tags', 'top');
  add_rewrite_rule('^rss/?$', 'index.php?pagename=rss', 'top');

  // カテゴリ・タグアーカイブ（React SPAで処理、IDベース）
  add_rewrite_rule('^category/([0-9]+)/?$', 'index.php?spa_route=category&spa_id=$matches[1]', 'top');
  add_rewrite_rule('^tag/([0-9]+)/?$', 'index.php?spa_route=tag&spa_id=$matches[1]', 'top');

  // 個別投稿（React SPAで処理、IDベース）
  add_rewrite_rule('^post/([0-9]+)/?$', 'index.php?spa_route=post&spa_id=$matches[1]', 'top');
}, 1);

/* ========== カスタムクエリ変数の登録 ========== */
add_filter('query_vars', function($vars) {
  $vars[] = 'spa_route';
  $vars[] = 'spa_id';
  return $vars;
});

add_action('after_switch_theme', function() {
  flush_rewrite_rules();
});

add_filter('template_include', function($template) {
  // SPAルート処理
  $spa_route = get_query_var('spa_route');
  if ($spa_route) {
    // category, tag, post など全て index.php でReact SPAに処理させる
    return get_template_directory() . '/index.php';
  }

  // 固定ページ処理
  $pagename = get_query_var('pagename');
  $custom_pages = ['categories', 'tags', 'about', 'contact', 'privacy', 'terms', 'rss'];
  if (in_array($pagename, $custom_pages)) {
    $template_file = 'page-' . $pagename . '.php';
    $new_template = locate_template([$template_file]);
    if ($new_template) {
      return $new_template;
    }
  }

  return $template;
});