
import { useState, useEffect } from 'react';

export interface WordPressConfig {
  siteName: string;
  tagline: string;
  description: string;
  author: {
    name: string;
    bio: string;
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
        siteName: siteInfo.title || 'TrustCode',
        tagline: siteInfo.description || 'ともに信頼あるコードを築こう',
        description: siteInfo.site_description || 'ケーキ屋のエンジニアAqunが綴る、自己啓発とテクノロジーの融合',
        author: {
          name: siteInfo.author_name || 'Aqun',
          bio: siteInfo.author_bio || 'ケーキ屋の社内エンジニア\\n1989年11月1日生',
          description: siteInfo.author_description || 'プログラマ、花屋、医療従事者を経て現在のケーキ屋社内エンジニアとして活動。自己啓発とテクノロジーの融合を追求。',
          avatar: siteInfo.author_avatar || 'A'
        },
        navigation: menus.length > 0 ? menus.map((item: any) => ({
          name: item.title,
          href: item.url,
          active: item.current || false
        })) : [
          { name: 'ホーム', href: '#', active: true },
          { name: '自己啓発', href: '#' },
          { name: 'アクアリウム', href: '#' },
          { name: 'ガジェット', href: '#' },
          { name: 'プログラミング', href: '#' },
          { name: 'AI・IT', href: '#' },
          { name: 'About', href: '#' }
        ],
        categories: categories.map((cat: any) => ({
          name: cat.name,
          count: cat.count,
          icon: cat.meta?.icon || 'ri-folder-line',
          color: cat.meta?.color || 'text-purple-600',
          slug: cat.slug
        })),
        tags: tags.map((tag: any) => tag.name),
        theme: {
          primary: siteInfo.theme_primary || 'purple',
          accent: siteInfo.theme_accent || 'yellow',
          gradients: {
            hero: siteInfo.theme_hero_gradient || 'from-purple-900/60 to-purple-600/40',
            card: siteInfo.theme_card_gradient || 'from-purple-600 to-purple-800',
            button: siteInfo.theme_button_gradient || 'from-purple-600 to-purple-700'
          }
        }
      };
    } else {
      // 開発環境用のフォールバック設定
      return {
        siteName: 'TrustCode',
        tagline: 'ともに信頼あるコードを築こう',
        description: 'ケーキ屋のエンジニアAqunが綴る、自己啓発とテクノロジーの融合',
        author: {
          name: 'Aqun',
          bio: 'ケーキ屋の社内エンジニア\\n1989年11月1日生',
          description: 'プログラマ、花屋、医療従事者を経て現在のケーキ屋社内エンジニアとして活動。自己啓発とテクノロジーの融合を追求。',
          avatar: 'A'
        },
        navigation: [
          { name: 'ホーム', href: '#', active: true },
          { name: '自己啓発', href: '#' },
          { name: 'アクアリウム', href: '#' },
          { name: 'ガジェット', href: '#' },
          { name: 'プログラミング', href: '#' },
          { name: 'AI・IT', href: '#' },
          { name: 'About', href: '#' }
        ],
        categories: [
          { name: '自己啓発', count: 1, icon: 'ri-lightbulb-line', color: 'text-yellow-600', slug: 'self-development' },
          { name: 'アクアリウム', count: 0, icon: 'ri-water-percent-line', color: 'text-blue-600', slug: 'aquarium' },
          { name: 'ガジェット', count: 0, icon: 'ri-smartphone-line', color: 'text-green-600', slug: 'gadget' },
          { name: 'プログラミング', count: 0, icon: 'ri-code-line', color: 'text-purple-600', slug: 'programming' },
          { name: 'AI・IT', count: 0, icon: 'ri-robot-line', color: 'text-red-600', slug: 'ai-it' }
        ],
        tags: ['エンジニア', 'ライフスタイル', '自己効力感', 'ケーキ屋', 'プログラマ', '美学', 'ゴールデンルール', 'メモアプリ', 'Why', '活動'],
        theme: {
          primary: 'purple',
          accent: 'yellow',
          gradients: {
            hero: 'from-purple-900/60 to-purple-600/40',
            card: 'from-purple-600 to-purple-800',
            button: 'from-purple-600 to-purple-700'
          }
        }
      };
    }
  } catch (error) {
    console.error('WordPress設定の取得に失敗しました:', error);
    // エラー時のフォールバック設定
    return {
      siteName: 'TrustCode',
      tagline: 'ともに信頼あるコードを築こう',
      description: 'ケーキ屋のエンジニアAqunが綴る、自己啓発とテクノロジーの融合',
      author: {
        name: 'Aqun',
        bio: 'ケーキ屋の社内エンジニア\\n1989年11月1日生',
        description: 'プログラマ、花屋、医療従事者を経て現在のケーキ屋社内エンジニアとして活動。自己啓発とテクノロジーの融合を追求。',
        avatar: 'A'
      },
      navigation: [
        { name: 'ホーム', href: '#', active: true },
        { name: '自己啓発', href: '#' },
        { name: 'アクアリウム', href: '#' },
        { name: 'ガジェット', href: '#' },
        { name: 'プログラミング', href: '#' },
        { name: 'AI・IT', href: '#' },
        { name: 'About', href: '#' }
      ],
      categories: [
        { name: '自己啓発', count: 1, icon: 'ri-lightbulb-line', color: 'text-yellow-600', slug: 'self-development' },
        { name: 'アクアリウム', count: 0, icon: 'ri-water-percent-line', color: 'text-blue-600', slug: 'aquarium' },
        { name: 'ガジェット', count: 0, icon: 'ri-smartphone-line', color: 'text-green-600', slug: 'gadget' },
        { name: 'プログラミング', count: 0, icon: 'ri-code-line', color: 'text-purple-600', slug: 'programming' },
        { name: 'AI・IT', count: 0, icon: 'ri-robot-line', color: 'text-red-600', slug: 'ai-it' }
      ],
      tags: ['エンジニア', 'ライフスタイル', '自己効力感', 'ケーキ屋', 'プログラマ', '美学', 'ゴールデンルール', 'メモアプリ', 'Why', '活動'],
      theme: {
        primary: 'purple',
        accent: 'yellow',
        gradients: {
          hero: 'from-purple-900/60 to-purple-600/40',
          card: 'from-purple-600 to-purple-800',
          button: 'from-purple-600 to-purple-700'
        }
      }
    };
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
