import { useState, useEffect } from 'react';

const getRestUrl = (path: string): string => {
  return `/index.php?rest_route=${encodeURIComponent(path)}`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const usePostLikes = (postId: number | null) => {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      const likeKey = `readdy_liked_${postId}`;
      setIsLiked(getCookie(likeKey) === '1');
    }
  }, [postId]);

  const likePost = async () => {
    if (!postId || loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getRestUrl(`/readdy/v1/posts/${postId}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like post');
      }

      const data = await response.json();
      setLikesCount(data.likes_count);
      setIsLiked(true);
    } catch (err: any) {
      setError(err.message || 'いいねに失敗しました');
      console.error('Like error:', err);
    } finally {
      setLoading(false);
    }
  };

  const unlikePost = async () => {
    if (!postId || loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getRestUrl(`/readdy/v1/posts/${postId}/unlike`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unlike post');
      }

      const data = await response.json();
      setLikesCount(data.likes_count);
      setIsLiked(false);
    } catch (err: any) {
      setError(err.message || 'いいねの解除に失敗しました');
      console.error('Unlike error:', err);
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