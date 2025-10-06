
import { useWordPressConfig } from '../../../hooks/useWordPressConfig';

export default function Sidebar() {
  const { config, loading } = useWordPressConfig();

  const recentPosts = [
    {
      title: 'TrustCodeの構想',
      date: '2025年10月3日',
      category: '自己啓発'
    }
  ];

  if (loading || !config) {
    return (
      <aside className="space-y-6">
        {/* ローディング状態 */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-purple-100 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-purple-50 rounded"></div>
                <div className="h-4 bg-purple-50 rounded w-3/4"></div>
                <div className="h-4 bg-purple-50 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="space-y-6">
      {/* プロフィール */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${config.theme.gradients.card} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-white font-bold text-2xl">{config.author.avatar}</span>
          </div>
          <h3 className="text-xl font-bold text-purple-800 mb-2">{config.author.name}</h3>
          <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">
            {config.author.bio}
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            {config.author.description}
          </p>
        </div>
      </div>

      {/* カテゴリー */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
          <i className="ri-folder-line mr-2 text-yellow-500"></i>
          カテゴリー
        </h3>
        <div className="space-y-3">
          {config.categories.map((category, index) => (
            <a
              key={index}
              href="/categories"
              className="flex items-center justify-between cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <i className={`${category.icon} ${category.color}`}></i>
                <span className="text-gray-700">{category.name}</span>
              </div>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {category.count}
              </span>
            </a>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-purple-100">
          <a
            href="/categories"
            className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors cursor-pointer flex items-center"
          >
            すべてのカテゴリを見る
            <i className="ri-arrow-right-line ml-1"></i>
          </a>
        </div>
      </div>

      {/* 最近の投稿 */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
          <i className="ri-time-line mr-2 text-yellow-500"></i>
          最近の投稿
        </h3>
        <div className="space-y-4">
          {recentPosts.map((post, index) => (
            <div key={index} className="cursor-pointer hover:bg-purple-50 p-3 rounded-lg transition-colors">
              <h4 className="font-medium text-purple-800 mb-1">{post.title}</h4>
              <div className="flex items-center justify-between text-sm text-gray-5">
                <span>{post.date}</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                  {post.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* タグクラウド */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
          <i className="ri-price-tag-3-line mr-2 text-yellow-500"></i>
          タグ
        </h3>
        <div className="flex flex-wrap gap-2">
          {config.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-purple-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* ニュースレター */}
      <div className={`bg-gradient-to-br ${config.theme.gradients.card} rounded-2xl shadow-lg p-6 text-white`}>
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <i className="ri-mail-line mr-2 text-yellow-400"></i>
          ニュースレター
        </h3>
        <p className="text-purple-100 text-sm mb-4">
          最新の投稿やアップデートをお届けします
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="メールアドレス"
            className="w-full px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button className="w-full bg-yellow-500 text-purple-800 font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer whitespace-nowrap">
            購読する
          </button>
        </div>
      </div>
    </aside>
  );
}
