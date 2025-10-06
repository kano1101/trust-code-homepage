
import { BlogPost } from '../types/blog';

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'TrustCodeの構想',
    subtitle: 'ケーキ屋のエンジニアAqunの美学 for 自己啓発',
    date: '2025年10月3日',
    author: 'Aqun',
    category: '自己啓発',
    slug: 'trustcode-concept',
    content: `1989年11月1日生、プログラマ、花屋、医療従事者として職を移り変わり現在のケーキ屋社内エンジニアとして職場、業界の経済効果を最大化する方法を模索。

日々の業務、ライフタイムを通じて世間に最大限自分の生きた証を残す。

そのためにこのサイトを通じて私、Aqunの持つ自己啓発・美学を発信する。

## 何をするかではない、何故するかだ。

内面的に強くない私なのだが、私は他の人より物忘れしやすい傾向にあると思う。なので、メモアプリを活用するなどして極力思いついたことを書き残すようにしている。

そしてこれらを使って何かをしようと考えることがある。

これがうまくいっている。

ただうまくいかない点がないわけではなく、それはゴールデンルールのWhyがないからではないかと感じる現在の日々思うことなのである。

そして、それはまさにその通りだった。

## サイトの目的はライフスタイルの自己効力感を確認すること

なぜうまくいくことを求めるのだろうか。

このサイトを通してあなたに語りかけたい。

ここtrust-code.netを拠点として私の活動を広げていきたい。その原点になるだろう。

ここから先の話は、思いが馳せる度にブログで綴っていくことにする。`,
    tags: ['自己啓発', 'エンジニア', 'ライフスタイル'],
    readTime: '3分'
  }
];

// postsエイリアスを追加（RSSページとの互換性のため）
export const posts = blogPosts;

// 新しい記事を追加する関数
export const addBlogPost = (post: Omit<BlogPost, 'id'>): BlogPost => {
  const newPost: BlogPost = {
    ...post,
    id: Math.max(...blogPosts.map(p => p.id)) + 1
  };
  blogPosts.push(newPost);
  return newPost;
};

// カテゴリー別の記事を取得する関数
export const getPostsByCategory = (categorySlug: string): BlogPost[] => {
  return blogPosts.filter(post => 
    post.category === categorySlug || 
    post.tags.some(tag => tag.toLowerCase().includes(categorySlug.toLowerCase()))
  );
};

// 最新の記事を取得する関数
export const getRecentPosts = (limit: number = 5): BlogPost[] => {
  return blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
