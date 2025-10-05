import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";

export default function PostPage() {
    const { slug } = useParams();
    const [html, setHtml] = useState<string>("");
    const [meta, setMeta] = useState<{ title?: string; date?: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // WordPress REST API から投稿を取得
        fetch(`/wp-json/wp/v2/posts?slug=${slug}&_embed`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch post');
                return res.json();
            })
            .then((posts) => {
                if (posts.length === 0) {
                    setError('投稿が見つかりません');
                    setLoading(false);
                    return;
                }
                const post = posts[0];
                setMeta({
                    title: post.title.rendered,
                    date: new Date(post.date).toLocaleDateString('ja-JP'),
                });
                // content.rendered は既にHTMLなので、そのまま使用（サニタイズは念のため）
                setHtml(DOMPurify.sanitize(post.content.rendered));
                setLoading(false);
            })
            .catch((e) => {
                console.error("読み込み失敗", e);
                setError('投稿の読み込みに失敗しました');
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <main className="prose lg:prose-xl mx-auto p-8">
                <Link to="/" className="text-blue-500 hover:underline">
                    ← 記事一覧へ戻る
                </Link>
                <p className="text-center text-gray-600">読み込み中...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="prose lg:prose-xl mx-auto p-8">
                <Link to="/" className="text-blue-500 hover:underline">
                    ← 記事一覧へ戻る
                </Link>
                <p className="text-center text-red-600">{error}</p>
            </main>
        );
    }

    return (
        <main className="prose lg:prose-xl mx-auto p-8">
            <Link to="/" className="text-blue-500 hover:underline">
                ← 記事一覧へ戻る
            </Link>
            <h1>{meta.title}</h1>
            <p className="text-gray-500">{meta.date}</p>
            <article dangerouslySetInnerHTML={{ __html: html }} />
        </main>
    );
}