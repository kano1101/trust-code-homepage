import { useState, useEffect } from 'react';

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

const getRestUrl = (path: string): string => {
  return `/index.php?rest_route=${encodeURIComponent(path)}`;
};

export const useWordPressCategories = () => {
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const url = getRestUrl('/wp/v2/categories') + '&per_page=100';
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: WordPressCategory[] = await response.json();

        // 未分類を最後に移動
        const sortedCategories = data.sort((a, b) => {
          const isAUncategorized = a.slug === 'uncategorized' || a.name === '未分類';
          const isBUncategorized = b.slug === 'uncategorized' || b.name === '未分類';
          if (isAUncategorized && !isBUncategorized) return 1;
          if (!isAUncategorized && isBUncategorized) return -1;
          return 0;
        });

        setCategories(sortedCategories);
        setError(null);
      } catch (err: any) {
        console.error('カテゴリの取得に失敗しました:', err);
        setError(err.message || 'カテゴリの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};