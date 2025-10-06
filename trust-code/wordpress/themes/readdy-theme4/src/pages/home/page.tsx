
import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BlogPost from './components/BlogPost';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

export default function Home() {
  const [currentPost] = useState({
    id: 1,
    title: 'TrustCodeの構想',
    subtitle: 'ケーキ屋のエンジニアAqunの美学 for 自己啓発',
    date: '2025年10月3日',
    author: 'Aqun',
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
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <Header />
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BlogPost post={currentPost} />
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
