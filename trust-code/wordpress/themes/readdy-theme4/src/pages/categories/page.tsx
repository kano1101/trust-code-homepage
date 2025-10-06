
import { useState } from 'react';
import { useWordPressConfig } from '../../hooks/useWordPressConfig';
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';

export default function Categories() {
  const { config, loading } = useWordPressConfig();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // サンプル記事データ（実際のWordPressでは動的に取得）
  const samplePosts = [
    {
      id: 1,
      title: 'TrustCodeの構想',
      excerpt: '1989年11月1日生、プログラマ、花屋、医療従事者として職を移り変わり現在のケーキ屋社内エンジニアとして職場、業界の経済効果を最大化する方法を模索。',
      date: '2025年10月3日',
      category: '自己啓発',
      categorySlug: 'self-development',
      author: 'Aqun',
      readTime: '3分',
      tags: ['自己啓発', 'エンジニア', 'ライフスタイル']
    }
  ];

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-purple-100 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="h-6 bg-purple-100 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-purple-50 rounded mb-2"></div>
                  <div className="h-4 bg-purple-50 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredPosts = selectedCategory 
    ? samplePosts.filter(post => post.categorySlug === selectedCategory)
    : samplePosts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <Header />
      
      {/* ヒーローセクション */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20digital%20library%20with%20organized%20colorful%20folders%20and%20documents%20floating%20in%20a%20clean%20minimalist%20space%2C%20soft%20purple%20and%20white%20gradient%20background%2C%20professional%20tech%20aesthetic%2C%20organized%20knowledge%20concept%2C%20clean%20design&width=1200&height=400&seq=categories-hero&orientation=landscape')`
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${config.theme.gradients.hero}`}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            カテゴリ一覧
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            興味のあるトピックから記事を探してみてください
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* カテゴリフィルター */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === null
                  ? `bg-gradient-to-r ${config.theme.gradients.button} text-white shadow-lg`
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              すべて
            </button>
            {config.categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-6 py-3 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 ${
                  selectedCategory === category.slug
                    ? `bg-gradient-to-r ${config.theme.gradients.button} text-white shadow-lg`
                    : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                <i className={`${category.icon} ${selectedCategory === category.slug ? 'text-yellow-300' : category.color}`}></i>
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.slug 
                    ? 'bg-white/20 text-white' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* カテゴリカード表示 */}
        {!selectedCategory && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-purple-800 mb-8 text-center">
              カテゴリから探す
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.categories.map((category) => (
                <div
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${config.theme.gradients.card} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <i className={`${category.icon} text-2xl text-white`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-purple-800 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.count}件の記事
                    </p>
                    <div className="text-sm text-purple-600 group-hover:text-purple-800 transition-colors">
                      記事を見る →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 記事一覧 */}
        <div>
          {selectedCategory && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-purple-800 mb-4">
                {config.categories.find(cat => cat.slug === selectedCategory)?.name}の記事
              </h2>
              <p className="text-gray-600">
                {filteredPosts.length}件の記事が見つかりました
              </p>
            </div>
          )}

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div 
                    className="h-48 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url('https://readdy.ai/api/search-image?query=Professional%20blog%20post%20illustration%20about%20$%7Bpost.title%7D%2C%20modern%20clean%20design%2C%20soft%20purple%20and%20white%20colors%2C%20minimalist%20aesthetic%2C%20inspiring%20and%20motivational%20theme&width=400&height=200&seq=post-${post.id}&orientation=landscape')`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`bg-gradient-to-r ${config.theme.gradients.button} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-purple-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <i className="ri-user-line mr-1"></i>
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-time-line mr-1"></i>
                          {post.readTime}
                        </span>
                      </div>
                      <span>{post.date}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-purple-600 font-medium group-hover:text-purple-800 transition-colors">
                      続きを読む →
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className={`w-24 h-24 bg-gradient-to-br ${config.theme.gradients.card} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <i className="ri-file-text-line text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-4">
                記事が見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-6">
                このカテゴリにはまだ記事がありません。<br />
                他のカテゴリをお試しください。
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`bg-gradient-to-r ${config.theme.gradients.button} text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all cursor-pointer whitespace-nowrap`}
              >
                すべてのカテゴリを見る
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
