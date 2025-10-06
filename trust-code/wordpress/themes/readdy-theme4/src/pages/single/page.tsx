import { useCurrentPost } from '../../hooks/useWordPressPosts';
import { usePostLikes } from '../../hooks/usePostLikes';
import { useWordPressComments } from '../../hooks/useWordPressComments';
import { useState } from 'react';
import Sidebar from '../home/components/Sidebar';

export default function SinglePost() {
  const { post, loading, error } = useCurrentPost();
  const { likesCount, isLiked, toggleLike } = usePostLikes(post?.id || null);
  const { comments, submitComment } = useWordPressComments(post?.id || null);

  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: '',
  });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.name || !commentForm.email || !commentForm.content) {
      setCommentError('すべての項目を入力してください');
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError(null);
      await submitComment(commentForm.name, commentForm.email, commentForm.content);
      setCommentSuccess(true);
      setCommentForm({ name: '', email: '', content: '' });
      setTimeout(() => setCommentSuccess(false), 5000);
    } catch (err: any) {
      setCommentError(err.message || 'コメントの投稿に失敗しました');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
          <i className="ri-error-warning-line text-5xl mb-4"></i>
          <p className="text-xl font-medium mb-2">記事が見つかりません</p>
          <p className="mb-4">{error || '指定された記事は存在しないか削除されました'}</p>
          <a href="/" className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            トップページに戻る
          </a>
        </div>
      </main>
    );
  }

  const categories = post._embedded?.['wp:term']?.[0] || [];
  const author = post._embedded?.author?.[0];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat: any) => (
                  <a
                    key={cat.id}
                    href={`/?category=${cat.id}`}
                    className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-purple-900 mb-4 leading-tight">
              {post.title.rendered}
            </h1>

            {/* Meta */}
            <div className="flex items-center text-sm text-purple-600 mb-6 pb-6 border-b border-purple-100">
              <i className="ri-calendar-line mr-2"></i>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {author && (
                <>
                  <span className="mx-3">•</span>
                  <i className="ri-user-line mr-2"></i>
                  <span>{author.name}</span>
                </>
              )}
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Like Button */}
            <div className="flex items-center justify-center py-6 border-y border-purple-100">
              <button
                onClick={toggleLike}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                <i className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
                <span className="font-medium">
                  {isLiked ? 'いいね済み' : 'いいね'}
                  {likesCount > 0 && ` (${likesCount})`}
                </span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
                <i className="ri-chat-3-line mr-2"></i>
                コメント ({comments.length})
              </h2>

              {/* Comment Form */}
              <div className="bg-purple-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">コメントを投稿</h3>

                {commentSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    <p className="flex items-center">
                      <i className="ri-checkbox-circle-line mr-2"></i>
                      コメントを投稿しました。承認後に表示されます。
                    </p>
                  </div>
                )}

                {commentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="flex items-center">
                      <i className="ri-error-warning-line mr-2"></i>
                      {commentError}
                    </p>
                  </div>
                )}

                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-purple-900 mb-1">
                        名前 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={commentForm.name}
                        onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-purple-900 mb-1">
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={commentForm.email}
                        onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-purple-900 mb-1">
                      コメント <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="content"
                      rows={4}
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                      className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {commentSubmitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        送信中...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-line mr-2"></i>
                        コメントを投稿
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-center text-purple-600 py-8">まだコメントがありません</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-white border border-purple-100 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                            <i className="ri-user-line text-purple-700"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-900">{comment.author_name}</p>
                            <p className="text-sm text-purple-600">{formatDate(comment.date)}</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>

        <aside className="lg:col-span-1">
          <Sidebar />
        </aside>
      </div>
    </main>
  );
}