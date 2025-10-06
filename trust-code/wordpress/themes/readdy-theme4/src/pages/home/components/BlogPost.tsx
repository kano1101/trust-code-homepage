
import { useWordPressConfig } from '../../../hooks/useWordPressConfig';
import { WordPressPost } from '../../../hooks/useWordPressPosts';

interface BlogPostProps {
  post: WordPressPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  const { config, loading } = useWordPressConfig();

  // WordPressのHTML contentをそのまま表示
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  if (loading || !config) {
    return (
      <article className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-purple-100 rounded w-24"></div>
                <div className="h-3 bg-purple-50 rounded w-16"></div>
              </div>
            </div>
            <div className="h-8 bg-purple-100 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-purple-50 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${config.theme.gradients.card} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">{config.author.avatar}</span>
            </div>
            <div>
              <p className="font-semibold text-purple-800">{post.author}</p>
              <p className="text-sm text-gray-500">{post.date}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <i className="ri-time-line mr-1"></i>
              {post.readTime}
            </span>
            <button className="flex items-center text-purple-600 hover:text-purple-800 cursor-pointer">
              <i className="ri-share-line mr-1"></i>
              シェア
            </button>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-3">
          {post.title}
        </h1>
        <h2 className="text-xl text-purple-700 mb-6 font-medium">
          {post.subtitle}
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={createMarkup(post.content)} />

        <div className="mt-8 pt-6 border-t border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 cursor-pointer">
                <i className="ri-heart-line text-xl"></i>
                <span>いいね</span>
              </button>
              <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 cursor-pointer">
                <i className="ri-chat-3-line text-xl"></i>
                <span>コメント</span>
              </button>
            </div>
            <button className={`flex items-center space-x-2 bg-gradient-to-r ${config.theme.gradients.button} text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all cursor-pointer whitespace-nowrap`}>
              <i className="ri-bookmark-line"></i>
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
