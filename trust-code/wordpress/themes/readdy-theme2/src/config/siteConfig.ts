
export const siteConfig = {
  // サイト基本情報
  siteName: 'TrustCode',
  tagline: 'ともに信頼あるコードを築こー',
  description: 'ケーキ屋のエンジニアAqunが綴る、自己啓発とテクノロジーの融合',
  
  // 作者情報
  author: {
    name: 'Aqun',
    bio: 'ケーキ屋の社内エンジニア\n1989年11月1日生',
    description: 'プログラマ、花屋、医療従事者を経て現在のケーキ屋社内エンジニアとして活動。自己啓発とテクノロジーの融合を追求。',
    avatar: 'A' // アバター文字
  },

  // ナビゲーションメニュー
  navigation: [
    { name: 'ホーム', href: '#', active: true },
    { name: '自己啓発', href: '#' },
    { name: 'アクアリウム', href: '#' },
    { name: 'ガジェット', href: '#' },
    { name: 'プログラミング', href: '#' },
    { name: 'AI・IT', href: '#' },
    { name: 'About', href: '#' }
  ],

  // カテゴリー設定
  categories: [
    { 
      name: '自己啓発', 
      count: 1, 
      icon: 'ri-lightbulb-line', 
      color: 'text-yellow-600',
      slug: 'self-development'
    },
    { 
      name: 'アクアリウム', 
      count: 0, 
      icon: 'ri-water-percent-line', 
      color: 'text-blue-600',
      slug: 'aquarium'
    },
    { 
      name: 'ガジェット', 
      count: 0, 
      icon: 'ri-smartphone-line', 
      color: 'text-green-600',
      slug: 'gadget'
    },
    { 
      name: 'プログラミング', 
      count: 0, 
      icon: 'ri-code-line', 
      color: 'text-purple-600',
      slug: 'programming'
    },
    { 
      name: 'AI・IT', 
      count: 0, 
      icon: 'ri-robot-line', 
      color: 'text-red-600',
      slug: 'ai-it'
    }
  ],

  // タグ設定
  tags: [
    'エンジニア', 'ライフスタイル', '自己効力感', 'ケーキ屋', 'プログラマ',
    '美学', 'ゴールデンルール', 'メモアプリ', 'Why', '活動'
  ],

  // テーマカラー設定
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
