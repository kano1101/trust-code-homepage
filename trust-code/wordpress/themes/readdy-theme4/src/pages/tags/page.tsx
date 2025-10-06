import { useWordPressTags } from '../../hooks/useWordPressTags';

export default function TagsPage() {
  const { tags, loading, error } = useWordPressTags();

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
          <i className="ri-error-warning-line text-5xl mb-4"></i>
          <p className="text-xl font-medium mb-2">エラーが発生しました</p>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <i className="ri-price-tag-3-line text-white text-4xl"></i>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
          すべてのタグ
        </h1>
        <p className="text-xl text-purple-600">
          {tags.length} 個のタグ
        </p>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tags.map((tag) => (
          <a
            key={tag.id}
            href={`/?tag=${tag.slug}`}
            className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-purple-100 hover:border-purple-400 text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-hashtag text-purple-700 text-2xl"></i>
            </div>
            <h3 className="font-bold text-purple-900 mb-2 group-hover:text-purple-600 transition-colors">
              {tag.name}
            </h3>
            <div className="flex items-center justify-center space-x-2 text-sm text-purple-600">
              <i className="ri-article-line"></i>
              <span>{tag.count} 記事</span>
            </div>
          </a>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="bg-purple-50 border border-purple-200 text-purple-700 px-6 py-12 rounded-lg text-center">
          <i className="ri-price-tag-3-line text-6xl mb-4 opacity-50"></i>
          <p className="text-xl font-medium">タグがまだありません</p>
        </div>
      )}
    </main>
  );
}