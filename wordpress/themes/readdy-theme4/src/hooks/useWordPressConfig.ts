
import { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';

export interface WordPressConfig {
  siteName: string;
  tagline: string;
  description: string;
  author: {
    name: string;
    bio: string;
    birthdate: string;
    description: string;
    avatar: string;
  };
  navigation: Array<{
    name: string;
    href: string;
    active?: boolean;
  }>;
  categories: Array<{
    name: string;
    count: number;
    icon: string;
    color: string;
    slug: string;
  }>;
  tags: string[];
  theme: {
    primary: string;
    accent: string;
    gradients: {
      hero: string;
      card: string;
      button: string;
    };
  };
}

// WordPressのREST APIから設定を取得する関数
const fetchWordPressConfig = async (): Promise<WordPressConfig> => {
  try {
    // 本番環境ではWordPress REST APIエンドポイントを使用
    // 開発環境では静的設定をフォールバックとして使用
    const isProduction = window.location.hostname !== 'localhost';
    
    if (isProduction) {
      // WordPress REST API呼び出し
      const [siteInfo, categories, tags, menus] = await Promise.all([
        fetch('/wp-json/wp/v2/settings').then(res => res.json()),
        fetch('/wp-json/wp/v2/categories').then(res => res.json()),
        fetch('/wp-json/wp/v2/tags').then(res => res.json()),
        fetch('/wp-json/wp/v2/menus').then(res => res.json()).catch(() => [])
      ]);

      return {
        siteName: siteInfo.title || siteConfig.siteName,
        tagline: siteInfo.description || siteConfig.tagline,
        description: siteInfo.site_description || siteConfig.description,
        author: {
          name: siteInfo.author_name || siteConfig.author.name,
          bio: siteInfo.author_bio || siteConfig.author.bio,
          birthdate: siteInfo.author_birthdate || siteConfig.author.birthdate,
          description: siteInfo.author_description || siteConfig.author.description,
          avatar: siteInfo.author_avatar || siteConfig.author.avatar
        },
        navigation: menus.length > 0 ? menus.map((item: any) => ({
          name: item.title,
          href: item.url,
          active: item.current || false
        })) : siteConfig.navigation,
        categories: categories.map((cat: any) => ({
          name: cat.name,
          count: cat.count,
          icon: cat.meta?.icon || 'ri-folder-line',
          color: cat.meta?.color || 'text-purple-600',
          slug: cat.slug
        })),
        tags: tags.map((tag: any) => tag.name),
        theme: {
          primary: siteInfo.theme_primary || siteConfig.theme.primary,
          accent: siteInfo.theme_accent || siteConfig.theme.accent,
          gradients: {
            hero: siteInfo.theme_hero_gradient || siteConfig.theme.gradients.hero,
            card: siteInfo.theme_card_gradient || siteConfig.theme.gradients.card,
            button: siteInfo.theme_button_gradient || siteConfig.theme.gradients.button
          }
        }
      };
    } else {
      // 開発環境用のフォールバック設定
      return siteConfig;
    }
  } catch (error) {
    console.error('WordPress設定の取得に失敗しました:', error);
    // エラー時のフォールバック設定
    return siteConfig;
  }
};

export const useWordPressConfig = () => {
  const [config, setConfig] = useState<WordPressConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const wpConfig = await fetchWordPressConfig();
        setConfig(wpConfig);
        setError(null);
      } catch (err) {
        setError('設定の読み込みに失敗しました');
        console.error('WordPress設定エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();

    // WordPress管理画面での変更を検知するためのポーリング（本番環境のみ）
    const isProduction = window.location.hostname !== 'localhost';
    if (isProduction) {
      const interval = setInterval(loadConfig, 30000); // 30秒ごとに更新チェック
      return () => clearInterval(interval);
    }
  }, []);

  return { config, loading, error };
};
