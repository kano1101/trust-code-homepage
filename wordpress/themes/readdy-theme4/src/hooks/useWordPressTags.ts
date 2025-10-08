import { useState, useEffect } from 'react';

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

const getRestUrl = (path: string): string => {
  return `/index.php?rest_route=${encodeURIComponent(path)}`;
};

export const useWordPressTags = () => {
  const [tags, setTags] = useState<WordPressTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const url = getRestUrl('/wp/v2/tags') + '&per_page=100';
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: WordPressTag[] = await response.json();

        // 記事数の多い順にソート
        const sortedTags = data.sort((a, b) => b.count - a.count);

        setTags(sortedTags);
        setError(null);
      } catch (err: any) {
        console.error('タグの取得に失敗しました:', err);
        setError(err.message || 'タグの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, loading, error };
};