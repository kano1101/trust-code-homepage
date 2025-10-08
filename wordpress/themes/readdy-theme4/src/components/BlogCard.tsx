import { WordPressPost } from '../hooks/useWordPressPosts';

interface BlogCardProps {
  post: WordPressPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const categories = post._embedded?.['wp:term']?.[0] || [];
  const excerpt = stripHtml(post.excerpt.rendered);
  const truncatedExcerpt = excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt;

  const likesCount = post.likes_count || 0;
  const commentsCount = post._embedded?.replies?.[0]?.length || 0;

  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
      {/* クリック可能なカード全体のリンク */}
      <a
        href={`/post/${post.id}`}
        className="absolute inset-0 z-10"
        aria-label={`${post.title.rendered}を読む`}
      />

      <div className="p-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat: any) => (
              <a
                key={cat.id}
                href={`/category/${cat.id}`}
                className="relative z-20 inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full hover:bg-purple-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-bold text-purple-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
          {post.title.rendered}
        </h2>

        {/* Meta - Date and Author */}
        <div className="flex items-center text-sm text-purple-600 mb-4">
          <i className="ri-calendar-line mr-1"></i>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post._embedded?.author?.[0] && (
            <>
              <span className="mx-2">•</span>
              <i className="ri-user-line mr-1"></i>
              <span>{post._embedded.author[0].name}</span>
            </>
          )}
        </div>

        {/* Excerpt */}
        <p className="text-gray-700 mb-6 leading-relaxed">{truncatedExcerpt}</p>

        {/* Footer: Likes/Comments (左) と Read More (右) */}
        <div className="flex items-center justify-between">
          {/* Likes and Comments - 左下 */}
          <div className="flex items-center space-x-4 text-sm text-purple-600">
            {likesCount > 0 && (
              <div className="flex items-center space-x-1">
                <i className="ri-heart-line"></i>
                <span>{likesCount}</span>
              </div>
            )}
            {commentsCount > 0 && (
              <div className="flex items-center space-x-1">
                <i className="ri-chat-3-line"></i>
                <span>{commentsCount}</span>
              </div>
            )}
          </div>

          {/* Read More - 右下 */}
          <a
            href={`/post/${post.id}`}
            className="relative z-20 inline-flex items-center space-x-1 text-purple-700 hover:text-purple-900 font-medium transition-all group-hover:translate-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span>続きを読む</span>
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
      </div>
    </article>
  );
}
