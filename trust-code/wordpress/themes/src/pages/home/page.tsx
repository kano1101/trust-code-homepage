import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type PostMeta = { title: string; date: string; excerpt: string; slug: string };

export default function Home() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // WordPress REST API から投稿を動的に取得
    const apiUrl = '/wp-json/wp/v2/posts?_embed&per_page=100';
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then((wpPosts) => {
        const postsData: PostMeta[] = wpPosts.map((post: any) => ({
          title: post.title.rendered,
          date: new Date(post.date).toLocaleDateString('ja-JP'),
          excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          slug: post.slug,
        }));
        setPosts(postsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setError('投稿の取得に失敗しました');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <p className="text-center text-gray-600">読み込み中...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <p className="text-center text-red-600">{error}</p>
      </main>
    );
  }

  return (
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">ブログ記事一覧</h1>
        {posts.length === 0 ? (
          <p className="text-center text-gray-600">投稿が見つかりません</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => (
                <li key={p.slug} className="border-b pb-4">
                  <Link
                      to={`/posts/${p.slug}`}
                      className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{p.date}</p>
                  <p className="text-gray-700 mt-2">{p.excerpt}</p>
                </li>
            ))}
          </ul>
        )}
      </main>
  );
}