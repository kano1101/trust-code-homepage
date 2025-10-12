<?php
/**
 * カスタムParsedown拡張
 * リッチなMarkdown表示のための拡張機能
 */

require_once __DIR__ . '/Parsedown.php';
require_once __DIR__ . '/ParsedownExtra.php';

class CustomParsedown extends ParsedownExtra {

  /**
   * コードブロックをカスタマイズ（言語クラス追加）
   */
  protected function blockFencedCodeComplete($Block) {
    $Block = parent::blockFencedCodeComplete($Block);

    if (isset($Block['element']['text']['attributes']['class'])) {
      $class = $Block['element']['text']['attributes']['class'];
      // language-xxx クラスを追加
      $Block['element']['text']['attributes']['class'] = $class . ' code-block';
    }

    return $Block;
  }

  /**
   * テーブルにカスタムクラスを追加
   */
  protected function blockTable($Line, array $Block = null) {
    $Block = parent::blockTable($Line, $Block);

    if ($Block) {
      $Block['element']['attributes']['class'] = 'markdown-table';
    }

    return $Block;
  }

  /**
   * 画像にカスタムクラスを追加
   */
  protected function inlineImage($Excerpt) {
    $Image = parent::inlineImage($Excerpt);

    if (!isset($Image)) {
      return null;
    }

    // 画像にクラスを追加
    $Image['element']['attributes']['class'] = 'markdown-image';

    // 画像にloading="lazy"を追加
    $Image['element']['attributes']['loading'] = 'lazy';

    return $Image;
  }

  /**
   * リンクにカスタム属性を追加
   */
  protected function inlineLink($Excerpt) {
    $Link = parent::inlineLink($Excerpt);

    if (!isset($Link)) {
      return null;
    }

    $url = $Link['element']['attributes']['href'] ?? '';

    // 外部リンクの場合、target="_blank"とrel="noopener noreferrer"を追加
    if (strpos($url, 'http') === 0 && strpos($url, home_url()) === false) {
      $Link['element']['attributes']['target'] = '_blank';
      $Link['element']['attributes']['rel'] = 'noopener noreferrer';
      $Link['element']['attributes']['class'] = 'external-link';
    }

    return $Link;
  }

  /**
   * カスタムブロック：警告ボックス
   * :::warning
   * 警告内容
   * :::
   */
  protected function blockCustomContainer($Line) {
    if (preg_match('/^:::(\w+)/', $Line['text'], $matches)) {
      $type = $matches[1];

      $Block = [
        'type' => $type,
        'element' => [
          'name' => 'div',
          'attributes' => [
            'class' => "custom-block custom-block-{$type}"
          ],
          'text' => ''
        ]
      ];

      return $Block;
    }
  }

  protected function blockCustomContainerContinue($Line, $Block) {
    if ($Line['text'] === ':::') {
      return;
    }

    $Block['element']['text'] .= "\n" . $Line['body'];

    return $Block;
  }

  protected function blockCustomContainerComplete($Block) {
    $Block['element']['text'] = $this->text($Block['element']['text']);

    // アイコンとタイトルを追加
    $type = $Block['type'];
    $icons = [
      'note' => 'ri-information-line',
      'warning' => 'ri-error-warning-line',
      'tip' => 'ri-lightbulb-line',
      'danger' => 'ri-alert-line',
      'info' => 'ri-information-line'
    ];

    $titles = [
      'note' => '注意',
      'warning' => '警告',
      'tip' => 'ヒント',
      'danger' => '重要',
      'info' => '情報'
    ];

    $icon = $icons[$type] ?? 'ri-information-line';
    $title = $titles[$type] ?? ucfirst($type);

    $Block['element']['text'] =
      '<div class="custom-block-title"><i class="' . $icon . '"></i> ' . $title . '</div>' .
      '<div class="custom-block-content">' . $Block['element']['text'] . '</div>';

    return $Block;
  }
}
