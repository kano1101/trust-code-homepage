import { useState } from 'react';
import { usePostLikes } from '../../../hooks/usePostLikes';
import { useWordPressComments } from '../../../hooks/useWordPressComments';
import type { WordPressPost } from '../../../hooks/useWordPressPosts';

interface BlogPostProps {
  post: WordPressPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  const { likesCount, isLiked, toggleLike, loading: likesLoading } = usePostLikes(post.id);
  const { comments, submitComment, loading: commentsLoading } = useWordPressComments(post.id);

  const [showComments, setShowComments] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.name || !commentForm.email || !commentForm.content) {
      alert('全ての項目を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitComment(commentForm.name, commentForm.email, commentForm.content);
      setCommentForm({ name: '', email: '', content: '' });
      alert('コメントが送信されました。承認されると表示されます。');
    } catch (error: any) {
      alert(error.message || 'コメントの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const authorName = post._embedded?.author?.[0]?.name || 'Aqun';
  const categories = post._embedded?.['wp:term']?.[0] || [];

  return (
    <article className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <p className="font-semibold text-purple-800">{authorName}</p>
              <p className="text-sm text-gray-500">{formatDate(post.date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
              <i className="ri-share-line mr-1"></i>
              シェア
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-purple-900 mb-4">
          <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
        </h1>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category: any) => (
              <a
                key={category.id}
                href={`/?category=${category.id}`}
                className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium hover:from-purple-200 hover:to-purple-300 transition-colors"
              >
                {category.name}
              </a>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-purple-800 prose-a:text-purple-600 prose-strong:text-purple-900"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-purple-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLike}
                disabled={likesLoading}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-purple-600 hover:text-purple-800'
                } disabled:opacity-50`}
              >
                <i className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
                <span>{likesCount > 0 ? `${likesCount} いいね` : 'いいね'}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
              >
                <i className="ri-chat-3-line text-xl"></i>
                <span>{comments.length > 0 ? `${comments.length} コメント` : 'コメント'}</span>
              </button>
            </div>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all">
              <i className="ri-bookmark-line"></i>
              <span>保存</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 pt-6 border-t border-purple-100">
            <h3 className="text-xl font-bold text-purple-800 mb-6">コメント</h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-8 bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-purple-800 mb-4">コメントを投稿</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="お名前"
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <textarea
                  placeholder="コメント"
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? '送信中...' : 'コメントを送信'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="text-center py-8 text-gray-500">コメントを読み込み中...</div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-purple-800">{comment.author_name}</h5>
                          <span className="text-sm text-gray-500">{formatDate(comment.date)}</span>
                        </div>
                        <div
                          className="text-gray-700 prose prose-sm"
                          dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">まだコメントがありません</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
