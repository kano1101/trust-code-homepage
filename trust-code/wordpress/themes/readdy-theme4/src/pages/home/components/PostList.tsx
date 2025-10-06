import { WordPressPost } from '../../../hooks/useWordPressPosts';
import { useWordPressConfig } from '../../../hooks/useWordPressConfig';

interface PostListProps {
  posts: WordPressPost[];
}

export default function PostList({ posts }: PostListProps) {
  const { config } = useWordPressConfig();

  if (!config) return null;

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => {
            window.location.href = `/?p=${post.id}`;
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${config.theme.gradients.card} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold">{config.author.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-800 text-sm">{post.author}</p>
                  <p className="text-xs text-gray-500">{post.date}</p>
                </div>
              </div>
              {post.readTime && (
                <span className="flex items-center text-sm text-gray-500">
                  <i className="ri-time-line mr-1"></i>
                  {post.readTime}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-purple-900 mb-2 hover:text-purple-700 transition-colors">
              {post.title}
            </h2>

            {post.subtitle && (
              <p className="text-purple-700 mb-3 font-medium">
                {post.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                  <i className="ri-heart-line"></i>
                  <span>いいね</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                  <i className="ri-chat-3-line"></i>
                  <span>コメント</span>
                </button>
              </div>
              <span className="text-purple-600 font-medium flex items-center">
                続きを読む
                <i className="ri-arrow-right-line ml-1"></i>
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}