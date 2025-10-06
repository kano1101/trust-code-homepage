
interface BlogPostProps {
  post: {
    id: number;
    title: string;
    subtitle: string;
    date: string;
    author: string;
    content: string;
    tags: string[];
    readTime: string;
  };
}

export default function BlogPost({ post }: BlogPostProps) {
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-purple-800 mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {line}
        </p>
      );
    });
  };

  return (
    <article className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
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

        <div className="prose prose-lg max-w-none">
          {formatContent(post.content)}
        </div>

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
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all cursor-pointer whitespace-nowrap">
              <i className="ri-bookmark-line"></i>
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
