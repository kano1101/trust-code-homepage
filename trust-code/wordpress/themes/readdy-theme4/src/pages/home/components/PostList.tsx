import { WordPressPost } from '../../../hooks/useWordPressPosts';

interface PostListProps {
  posts: WordPressPost[];
}

export default function PostList({ posts }: PostListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="space-y-8">
      {posts.map((post) => {
        const categories = post._embedded?.['wp:term']?.[0] || [];
        const excerpt = stripHtml(post.excerpt.rendered).substring(0, 150) + '...';

        return (
          <article key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-6">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map((cat: any) => (
                    <a
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full hover:bg-purple-200 transition-colors"
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                <a href={`/post/${post.id}`} className="hover:text-purple-600 transition-colors">
                  {post.title.rendered}
                </a>
              </h2>

              {/* Meta */}
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
                {post.likes_count !== undefined && post.likes_count > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <i className="ri-heart-line mr-1"></i>
                    <span>{post.likes_count}</span>
                  </>
                )}
              </div>

              {/* Excerpt */}
              <p className="text-gray-700 mb-4 leading-relaxed">{excerpt}</p>

              {/* Read More */}
              <a
                href={`/post/${post.id}`}
                className="inline-flex items-center text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                続きを読む
                <i className="ri-arrow-right-line ml-1"></i>
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}