import { useState, useEffect } from 'react';

export interface WordPressComment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  content: {
    rendered: string;
  };
  status: string;
}

const getRestUrl = (path: string): string => {
  return `/index.php?rest_route=${encodeURIComponent(path)}`;
};

export const useWordPressComments = (postId: number | null) => {
  const [comments, setComments] = useState<WordPressComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = getRestUrl(`/wp/v2/comments`) + `&post=${postId}&status=approve&per_page=100`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComments(data);
      setError(null);
    } catch (err: any) {
      console.error('コメントの取得に失敗しました:', err);
      setError(err.message || 'コメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const submitComment = async (name: string, email: string, content: string) => {
    if (!postId) {
      throw new Error('Invalid post ID');
    }

    try {
      // カスタムエンドポイントを使用（認証不要）
      const url = getRestUrl(`/readdy/v1/posts/${postId}/comments`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_name: name,
          author_email: email,
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'コメントの投稿に失敗しました');
      }

      const data = await response.json();

      // コメント一覧を再読み込み
      await loadComments();

      return data;
    } catch (err: any) {
      console.error('コメント投稿エラー:', err);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    submitComment,
    reload: loadComments,
  };
};