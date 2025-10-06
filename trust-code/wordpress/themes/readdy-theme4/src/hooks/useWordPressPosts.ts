import { useState, useEffect } from 'react';

export interface WordPressPost {
  id: number;
  title: string;
  subtitle?: string;
  date: string;
  author: string;
  content: string;
  excerpt?: string;
  tags: string[];
  readTime?: string;
  slug: string;
  featured_media?: number;
}

// 投稿データを変換する共通関数
const transformPost = (post: any): WordPressPost => {
  // タグ情報を取得
  const tags = post._embedded?.['wp:term']?.[1]?.map((tag: any) => tag.name) || [];

  // 著者情報を取得
  const author = post._embedded?.author?.[0]?.name || 'Author';

  // md_htmlがあればそれを使用、なければcontent.renderedを使用
  const content = post.md_html || post.content?.rendered || '';

  // 日付フォーマット
  const date = new Date(post.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    id: post.id,
    title: post.title?.rendered || '',
    subtitle: post.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '',
    date,
    author,
    content,
    excerpt: post.excerpt?.rendered || '',
    tags,
    slug: post.slug,
    featured_media: post.featured_media
  };
};

// REST APIのベースURL（パーマリンク設定に対応）
const getRestUrl = (path: string): string => {
  // /wp-json/ が使えない場合は index.php?rest_route= を使用
  return `/index.php?rest_route=${encodeURIComponent(path)}`;
};

// WordPress REST APIから投稿を取得（複数）
const fetchWordPressPosts = async (perPage: number = 10): Promise<WordPressPost[]> => {
  try {
    const url = getRestUrl(`/wp/v2/posts`) + `&per_page=${perPage}&_embed`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();
    return posts.map(transformPost);
  } catch (error) {
    console.error('WordPress投稿の取得に失敗しました:', error);
    return [];
  }
};

// WordPress REST APIからIDで投稿を取得（単一）
const fetchWordPressPostById = async (id: string): Promise<WordPressPost | null> => {
  try {
    const url = getRestUrl(`/wp/v2/posts/${id}`) + '&_embed';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const post = await response.json();
    return transformPost(post);
  } catch (error) {
    console.error('WordPress投稿の取得に失敗しました:', error);
    return null;
  }
};

// WordPress REST APIからslugで投稿を取得（単一）
const fetchWordPressPostBySlug = async (slug: string): Promise<WordPressPost | null> => {
  try {
    const url = getRestUrl(`/wp/v2/posts`) + `&slug=${slug}&_embed`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();

    if (posts.length === 0) {
      return null;
    }

    return transformPost(posts[0]);
  } catch (error) {
    console.error('WordPress投稿の取得に失敗しました:', error);
    return null;
  }
};

// 現在のURLから投稿IDまたはslugを取得
const getPostIdentifier = (): { type: 'id' | 'slug' | null; value: string | null } => {
  // ?p=1 形式のパーマリンクをチェック
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('p');

  if (postId) {
    return { type: 'id', value: postId };
  }

  // /slug/ または /slug の形式からslugを抽出
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/?$/);

  if (match) {
    return { type: 'slug', value: match[1] };
  }

  return { type: null, value: null };
};

export const useWordPressPosts = (perPage: number = 10) => {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const wpPosts = await fetchWordPressPosts(perPage);
        setPosts(wpPosts);
        setError(null);
      } catch (err) {
        setError('投稿の読み込みに失敗しました');
        console.error('WordPress投稿エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [perPage]);

  return { posts, loading, error };
};

// slugで単一の投稿を取得するhook
export const useWordPressPostBySlug = (slug: string | null) => {
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setPost(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const wpPost = await fetchWordPressPostBySlug(slug);
        setPost(wpPost);
        setError(wpPost ? null : '投稿が見つかりませんでした');
      } catch (err) {
        setError('投稿の読み込みに失敗しました');
        console.error('WordPress投稿エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  return { post, loading, error };
};

// 現在のURLから投稿を取得するhook
export const useCurrentPost = () => {
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      const identifier = getPostIdentifier();
      console.log('[DEBUG] useCurrentPost - identifier:', identifier);
      console.log('[DEBUG] useCurrentPost - URL:', window.location.href);
      console.log('[DEBUG] useCurrentPost - pathname:', window.location.pathname);
      console.log('[DEBUG] useCurrentPost - search:', window.location.search);

      if (!identifier.value) {
        console.log('[DEBUG] useCurrentPost - No identifier, showing post list');
        setPost(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let wpPost: WordPressPost | null = null;

        if (identifier.type === 'id') {
          console.log('[DEBUG] useCurrentPost - Fetching by ID:', identifier.value);
          wpPost = await fetchWordPressPostById(identifier.value);
        } else if (identifier.type === 'slug') {
          console.log('[DEBUG] useCurrentPost - Fetching by slug:', identifier.value);
          wpPost = await fetchWordPressPostBySlug(identifier.value);
        }

        console.log('[DEBUG] useCurrentPost - Result:', wpPost);
        setPost(wpPost);
        setError(wpPost ? null : '投稿が見つかりませんでした');
      } catch (err) {
        console.error('[ERROR] useCurrentPost - Failed to load post:', err);
        setError('投稿の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, []);

  return { post, loading, error };
};