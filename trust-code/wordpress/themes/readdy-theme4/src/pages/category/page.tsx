import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWordPressPosts } from '../../hooks/useWordPressPosts';
import PostList from '../home/components/PostList';
import Sidebar from '../home/components/Sidebar';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [categoryName, setCategoryName] = useState<string>('');
  const categoryId = id ? parseInt(id) : undefined;

  useEffect(() => {
    if (!categoryId) return;

    fetch(`/wp-json/wp/v2/categories/${categoryId}`)
      .then(res => res.json())
      .then(data => {
        setCategoryName(data.name);
        document.title = `${data.name} - Trust Code`;
      });
  }, [categoryId]);

  const { posts, loading, error } = useWordPressPosts(10, categoryId);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {categoryName && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            <i className="ri-folder-open-line mr-3"></i>
            {categoryName}
          </h1>
          <p className="text-purple-600">このカテゴリの記事一覧</p>
        </div>
      )}

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
              <p className="font-medium">このカテゴリに記事がありません</p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && <PostList posts={posts} />}
        </div>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </main>
  );
}