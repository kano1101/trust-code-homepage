import { useState, useEffect } from 'react';

const getRestUrl = (path: string): string => {
  // WordPressのREST API標準URLを使用（/wp-json/プレフィックス）
  return `/wp-json${path}`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const usePostLikes = (postId: number | null) => {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 初期化：記事のいいね数を取得
  useEffect(() => {
    if (postId) {
      const likeKey = `readdy_liked_${postId}`;
      setIsLiked(getCookie(likeKey) === '1');

      // REST APIからいいね数を取得
      fetch(`/wp-json/wp/v2/posts/${postId}`)
        .then(res => res.json())
        .then(data => {
          if (data.likes_count !== undefined) {
            setLikesCount(data.likes_count);
          }
        })
        .catch(err => console.error('Failed to fetch likes count:', err));
    }
  }, [postId]);

  const likePost = async () => {
    if (!postId || loading) return;

    console.log('[Like] Attempting to like post:', postId);

    try {
      setLoading(true);
      setError(null);

      const url = getRestUrl(`/readdy/v1/posts/${postId}/like`);
      console.log('[Like] Fetching URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Cookieを送受信
      });

      console.log('[Like] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('[Like] Error response:', errorData);
        throw new Error(errorData.message || 'Failed to like post');
      }

      const data = await response.json();
      console.log('[Like] Success response:', data);

      setLikesCount(data.likes_count);
      setIsLiked(true);

      // フロントエンドでもCookieを設定（バックアップ）
      const likeKey = `readdy_liked_${postId}`;
      setCookie(likeKey, '1', 30);
    } catch (err: any) {
      setError(err.message || 'いいねに失敗しました');
      console.error('[Like] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const unlikePost = async () => {
    if (!postId || loading) return;

    console.log('[Unlike] Attempting to unlike post:', postId);

    try {
      setLoading(true);
      setError(null);

      const url = getRestUrl(`/readdy/v1/posts/${postId}/unlike`);
      console.log('[Unlike] Fetching URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Cookieを送受信
      });

      console.log('[Unlike] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('[Unlike] Error response:', errorData);
        throw new Error(errorData.message || 'Failed to unlike post');
      }

      const data = await response.json();
      console.log('[Unlike] Success response:', data);

      setLikesCount(data.likes_count);
      setIsLiked(false);

      // フロントエンドでもCookieを削除（バックアップ）
      const likeKey = `readdy_liked_${postId}`;
      deleteCookie(likeKey);
    } catch (err: any) {
      setError(err.message || 'いいねの解除に失敗しました');
      console.error('[Unlike] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (isLiked) {
      await unlikePost();
    } else {
      await likePost();
    }
  };

  return {
    likesCount,
    isLiked,
    loading,
    error,
    likePost,
    unlikePost,
    toggleLike,
  };
};