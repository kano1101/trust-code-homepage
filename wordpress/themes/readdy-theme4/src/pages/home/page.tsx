import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWordPressPosts } from '../../hooks/useWordPressPosts';
import Hero from './components/Hero';
import PostList from './components/PostList';
import Sidebar from './components/Sidebar';

export default function Home() {
  const { id: categoryId } = useParams<{ id: string }>();
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get('tag');

  const { posts, loading, error } = useWordPressPosts(
    10,
    categoryId ? parseInt(categoryId) : undefined,
    tag || undefined
  );

  useEffect(() => {
    if (tag) {
      document.title = `タグ: ${tag} - Trust Code`;
    } else if (categoryId) {
      document.title = 'カテゴリ別記事 - Trust Code';
    } else {
      document.title = 'Trust Code - 気持ちよく信頼あるコードを築こう';
    }
  }, [categoryId, tag]);

  return (
    <>
      {!categoryId && !tag && <Hero />}

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">エラーが発生しました</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && posts.length === 0 && (
              <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-8 rounded-lg text-center">
                <i className="ri-inbox-line text-4xl mb-2"></i>
                <p className="font-medium">記事がまだありません</p>
              </div>
            )}

            {!loading && !error && posts.length > 0 && (
              <PostList posts={posts} />
            )}
          </div>

          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>
    </>
  );
}
