import { useWordPressConfig } from '../../hooks/useWordPressConfig';
import { useWordPressPosts } from '../../hooks/useWordPressPosts';
import { useWordPressCategories } from '../../hooks/useWordPressCategories';

export default function TopPage() {
  const { config } = useWordPressConfig();
  const { posts } = useWordPressPosts(3);
  const { categories } = useWordPressCategories();

  const siteName = config?.site?.title || 'Trust Code';
  const tagline = config?.site?.tagline || '気持ちよく信頼あるコードを築こう';

  const features = [
    {
      icon: 'ri-lightbulb-line',
      title: '自己啓発',
      description: 'より良い人生を築くための思考と実践',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: 'ri-code-line',
      title: 'プログラミング',
      description: '信頼あるコードを書くための技術',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: 'ri-water-percent-line',
      title: 'アクアリウム',
      description: '癒しと学びのあるアクアリウム体験',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: 'ri-smartphone-line',
      title: 'ガジェット',
      description: '最新のテクノロジーとガジェット',
      color: 'from-green-400 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform">
            <i className="ri-code-s-slash-line text-purple-900 text-5xl"></i>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{fontFamily: '"Pacifico", serif'}}>
            {siteName}
          </h1>

          <p className="text-2xl md:text-3xl mb-8 text-purple-100 font-medium">
            {tagline}
          </p>

          <p className="text-xl mb-12 text-purple-200 max-w-3xl mx-auto leading-relaxed">
            ケーキ屋のエンジニアAqunが綴る、自己啓発、テクノロジー、アクアリウム、ガジェットについてのブログ。
            日々の学びと実践を通じて、より良いコードとより良い人生を追求しています。
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/blog"
              className="px-8 py-4 bg-yellow-500 text-purple-900 font-bold rounded-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <i className="ri-book-open-line mr-2"></i>
              ブログを読む
            </a>
            <a
              href="/about"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-all border-2 border-white/30"
            >
              <i className="ri-user-line mr-2"></i>
              About
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">
            What I Write About
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <i className={`${feature.icon} text-white text-3xl`}></i>
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-purple-900">
              Latest Posts
            </h2>
            <a
              href="/blog"
              className="text-purple-700 hover:text-purple-900 font-medium flex items-center"
            >
              すべて見る
              <i className="ri-arrow-right-line ml-2"></i>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => {
              const categories = post._embedded?.['wp:term']?.[0] || [];
              const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
              };

              return (
                <article key={post.id} className="bg-gradient-to-br from-purple-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className="p-6">
                    {categories.length > 0 && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mb-3">
                        {categories[0].name}
                      </span>
                    )}

                    <h3 className="text-xl font-bold text-purple-900 mb-3 hover:text-purple-600 transition-colors">
                      <a href={`/?p=${post.id}`}>
                        {post.title.rendered}
                      </a>
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 flex items-center">
                      <i className="ri-calendar-line mr-2"></i>
                      {formatDate(post.date)}
                    </p>

                    <a
                      href={`/?p=${post.id}`}
                      className="text-purple-700 hover:text-purple-900 font-medium inline-flex items-center"
                    >
                      続きを読む
                      <i className="ri-arrow-right-line ml-1"></i>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">
            Categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/?category=${category.id}`}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center group"
              >
                <i className="ri-folder-line text-4xl text-purple-600 mb-3 block group-hover:scale-110 transition-transform"></i>
                <h3 className="font-bold text-purple-900 mb-1">{category.name}</h3>
                <p className="text-sm text-purple-600">{category.count} 記事</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            一緒に学び、成長しましょう
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            最新の記事やアップデートをお届けします
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="メールアドレス"
              className="flex-1 px-6 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="px-8 py-3 bg-yellow-500 text-purple-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors">
              購読する
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}