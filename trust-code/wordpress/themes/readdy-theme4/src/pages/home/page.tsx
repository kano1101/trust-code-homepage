import Header from './components/Header';
import Hero from './components/Hero';
import BlogPost from './components/BlogPost';
import PostList from './components/PostList';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { useCurrentPost, useWordPressPosts } from '../../hooks/useWordPressPosts';

export default function Home() {
  // URLパスからslugまたは?p=idを取得して記事を表示
  const { post: currentPost, loading: currentPostLoading, error: currentPostError } = useCurrentPost();

  // トップページ（パラメータなし）は記事一覧を表示
  const { posts, loading: postsLoading, error: postsError } = useWordPressPosts(10);

  const loading = currentPostLoading || postsLoading;
  const error = currentPostError || postsError;

  // currentPostがある場合は単一記事表示、ない場合は一覧表示
  const showSinglePost = currentPost !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <Header />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">読み込み中...</p>
              </div>
            )}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {!loading && !error && showSinglePost && (
              <BlogPost post={currentPost} />
            )}
            {!loading && !error && !showSinglePost && posts.length > 0 && (
              <PostList posts={posts} />
            )}
            {!loading && !error && !showSinglePost && posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">投稿がありません</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
