import { useState, useEffect } from 'react';

export interface WordPressPost {
  id: number;
  title: { rendered: string; };
  content: { rendered: string; };
  excerpt: { rendered: string; };
  date: string;
  slug: string;
  featured_media?: number;
  comment_status?: string;
  likes_count?: number;
  _embedded?: {
    author?: Array<{ name: string; }>;
    'wp:term'?: Array<Array<{ id: number; name: string; }>>;
    replies?: Array<Array<{
      id: number;
      content: { rendered: string; };
      author_name: string;
      date: string;
    }>>;
  };
}

const getRestUrl = (path: string): string => {
  return `/index.php?rest_route=${encodeURIComponent(path)}`;
};

export const useWordPressPosts = (perPage: number = 10, categoryId?: number, tagSlug?: string) => {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let url = getRestUrl('/wp/v2/posts') + `&per_page=${perPage}&_embed`;

        if (categoryId) {
          url += `&categories=${categoryId}`;
        }

        if (tagSlug) {
          url += `&tags_slug=${tagSlug}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPosts(data);
        setError(null);
      } catch (err: any) {
        console.error('投稿の取得に失敗しました:', err);
        setError(err.message || '投稿の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [perPage, categoryId, tagSlug]);

  return { posts, loading, error };
};

export const useCurrentPost = () => {
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('p');

        if (!postId) {
          setPost(null);
          setLoading(false);
          return;
        }

        const url = getRestUrl(`/wp/v2/posts/${postId}`) + '&_embed';
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPost(data);
        setError(null);
      } catch (err: any) {
        console.error('投稿の取得に失敗しました:', err);
        setError(err.message || '投稿の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  return { post, loading, error };
};