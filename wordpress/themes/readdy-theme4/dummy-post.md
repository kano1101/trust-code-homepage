# Markdown記事のスタイルガイド

この記事は、Markdown記事のすべてのスタイル要素をテストするためのダミー記事です。

## はじめに

Markdownは、**シンプル**で*読みやすい*テキスト形式でドキュメントを記述できる軽量マークアップ言語です。このサイトでは、技術的な内容を美しく表示するために、リッチなMarkdownスタイルを採用しています。

---

## 見出しのレベル

### レベル3の見出し

レベル3の見出しは、サブセクションのタイトルに使用されます。左側に紫のボーダーが表示されます。

#### レベル4の見出し

レベル4の見出しは、さらに詳細なセクションに使用します。

##### レベル5の見出し

レベル5の見出しは、小さめのセクションに適しています。

###### レベル6の見出し

レベル6は最小の見出しです。

---

## テキスト装飾

通常のテキストに加えて、**太字**、*イタリック*、***太字イタリック***などの装飾ができます。

また、~~取り消し線~~や、<mark>ハイライト</mark>も利用可能です。

<ins>下線付きテキスト</ins>も表示できます。

---

## リンク

[内部リンクの例](/about)と、[外部リンクの例](https://github.com)を表示できます。外部リンクには自動的に「↗」アイコンが付きます。

---

## コード

### インラインコード

テキスト中に `const greeting = "Hello, World!"` のようなインラインコードを埋め込むことができます。

### コードブロック

```javascript
// JavaScriptの例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

```python
# Pythonの例
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```

```bash
# Bashの例
docker-compose up -d
docker-compose logs -f wordpress
```

---

## 引用

> これは引用ブロックの例です。
>
> 複数行にわたる引用も美しく表示されます。引用元を明示する際に便利です。
>
> — 著者名

---

## リスト

### 順序なしリスト

- 最初の項目
- 2番目の項目
  - ネストされた項目1
  - ネストされた項目2
    - さらにネストされた項目
- 3番目の項目

### 順序付きリスト

1. 最初のステップ
2. 2番目のステップ
   1. サブステップA
   2. サブステップB
3. 3番目のステップ

### タスクリスト

- [x] 完了したタスク
- [x] もう一つの完了したタスク
- [ ] 未完了のタスク
- [ ] まだやっていないタスク

---

## テーブル

| 言語 | タイプ | 難易度 | 人気度 |
|------|--------|--------|--------|
| JavaScript | スクリプト言語 | ★★☆☆☆ | ★★★★★ |
| Python | スクリプト言語 | ★★☆☆☆ | ★★★★★ |
| TypeScript | スクリプト言語 | ★★★☆☆ | ★★★★☆ |
| Rust | システム言語 | ★★★★★ | ★★★☆☆ |
| Go | システム言語 | ★★★☆☆ | ★★★★☆ |

---

## 水平線

水平線は、セクションを明確に分けるのに便利です。上下のセクションをご確認ください。

---

## 特殊要素

### キーボード入力

ファイルを保存するには <kbd>Ctrl</kbd> + <kbd>S</kbd> (Mac: <kbd>Cmd</kbd> + <kbd>S</kbd>) を押してください。

### 略語

<abbr title="HyperText Markup Language">HTML</abbr>と<abbr title="Cascading Style Sheets">CSS</abbr>は、Web開発の基礎技術です。

### 変数

この関数は <var>x</var> と <var>y</var> を引数として受け取ります。

### サンプル出力

プログラムの出力: <samp>Error: File not found</samp>

---

## カスタムブロック（参考）

以下は、将来的にサポート予定のカスタムブロックの例です（HTMLで記述）：

<div class="custom-block custom-block-note">
  <div class="custom-block-title">📝 Note（ノート）</div>
  <div class="custom-block-content">
    これは補足情報や追加の説明を記載するためのノートブロックです。
  </div>
</div>

<div class="custom-block custom-block-tip">
  <div class="custom-block-title">💡 Tip（ヒント）</div>
  <div class="custom-block-content">
    これは便利なヒントやコツを記載するためのブロックです。
  </div>
</div>

<div class="custom-block custom-block-warning">
  <div class="custom-block-title">⚠️ Warning（警告）</div>
  <div class="custom-block-content">
    これは注意事項や警告を記載するためのブロックです。
  </div>
</div>

<div class="custom-block custom-block-danger">
  <div class="custom-block-title">🚨 Danger（危険）</div>
  <div class="custom-block-content">
    これは重大な注意事項や危険性を記載するためのブロックです。
  </div>
</div>

<div class="custom-block custom-block-info">
  <div class="custom-block-title">ℹ️ Info（情報）</div>
  <div class="custom-block-content">
    これは一般的な情報や参考資料を記載するためのブロックです。
  </div>
</div>

---

## 定義リスト

Git
: 分散型バージョン管理システム。ソースコードの変更履歴を記録し、複数人での共同作業を支援します。

Docker
: コンテナ型仮想化プラットフォーム。アプリケーションとその依存関係を1つのコンテナにパッケージ化します。

Kubernetes
: コンテナオーケストレーションツール。大規模なコンテナ化されたアプリケーションのデプロイと管理を自動化します。

---

## まとめ

この記事では、Markdownで利用可能なすべてのスタイル要素を紹介しました。これらの要素を組み合わせることで、技術的な内容を**美しく**、*読みやすく*表示できます。

コードブロック、テーブル、引用など、さまざまな要素が統一されたデザインで表示されることで、読者にとって快適な読書体験を提供できます。

---

**この記事がお役に立てば幸いです！**
