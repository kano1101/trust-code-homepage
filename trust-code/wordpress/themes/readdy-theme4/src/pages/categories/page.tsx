import { useWordPressCategories } from '../../hooks/useWordPressCategories';

export default function CategoriesPage() {
  const { categories, loading, error } = useWordPressCategories();

  const getCategoryIcon = (slug: string) => {
    const iconMap: { [key: string]: { icon: string; color: string } } = {
      'self-development': { icon: 'ri-lightbulb-line', color: 'text-yellow-600' },
      'aquarium': { icon: 'ri-water-percent-line', color: 'text-blue-600' },
      'gadget': { icon: 'ri-smartphone-line', color: 'text-green-600' },
      'programming': { icon: 'ri-code-line', color: 'text-purple-600' },
      'ai-it': { icon: 'ri-robot-line', color: 'text-red-600' },
      'uncategorized': { icon: 'ri-folder-line', color: 'text-gray-600' }
    };
    return iconMap[slug] || { icon: 'ri-folder-line', color: 'text-purple-600' };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4">
              <i className="ri-folder-open-line text-5xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
              カテゴリ一覧
            </h1>
            <p className="text-lg text-purple-700 max-w-2xl mx-auto">
              興味のあるカテゴリから記事を探してみてください
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
              <p className="mt-4 text-purple-700">カテゴリを読み込み中...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <i className="ri-error-warning-line text-4xl text-red-600 mb-2"></i>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Categories Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const { icon, color } = getCategoryIcon(category.slug);
                const isUncategorized = category.slug === 'uncategorized' || category.name === '未分類';

                return (
                  <a
                    key={category.id}
                    href={`/?category=${category.id}`}
                    className="group bg-white rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${isUncategorized ? 'bg-gray-100' : 'bg-purple-100'} group-hover:scale-110 transition-transform`}>
                        <i className={`${icon} text-3xl ${color}`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-purple-900 mb-2 group-hover:text-purple-700 transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {category.count} {category.count === 1 ? '記事' : '記事'}
                          </span>
                          <i className="ri-arrow-right-line text-purple-600 group-hover:translate-x-1 transition-transform"></i>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* No Categories */}
          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-folder-open-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">カテゴリがまだありません</p>
            </div>
          )}

          {/* Back to Home Link */}
          <div className="text-center mt-12">
            <a
              href="/"
              className="inline-flex items-center space-x-2 text-purple-700 hover:text-purple-900 font-semibold transition-colors"
            >
              <i className="ri-home-line"></i>
              <span>ホームに戻る</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}