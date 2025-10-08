import { useState } from 'react';
import { useWordPressConfig } from '../../hooks/useWordPressConfig';

export default function RSSPage() {
  const { config } = useWordPressConfig();
  const [copied, setCopied] = useState(false);

  const siteName = config?.siteName || 'Trust Code';
  const siteUrl = window.location.origin;
  const rssUrl = `${siteUrl}/feed`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const rssReaders = [
    {
      name: 'Feedly',
      icon: 'ri-rss-line',
      url: `https://feedly.com/i/subscription/feed/${encodeURIComponent(rssUrl)}`,
      color: 'bg-green-600',
      description: '最も人気のあるRSSリーダー'
    },
    {
      name: 'Inoreader',
      icon: 'ri-book-open-line',
      url: `https://www.inoreader.com/feed/${encodeURIComponent(rssUrl)}`,
      color: 'bg-blue-600',
      description: '高機能なRSSリーダー'
    },
    {
      name: 'The Old Reader',
      icon: 'ri-glasses-line',
      url: `https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(rssUrl)}`,
      color: 'bg-red-600',
      description: 'シンプルで使いやすい'
    },
    {
      name: 'NewsBlur',
      icon: 'ri-newspaper-line',
      url: `https://newsblur.com/?url=${encodeURIComponent(rssUrl)}`,
      color: 'bg-yellow-600',
      description: 'ソーシャル機能付き'
    }
  ];

  const features = [
    {
      icon: 'ri-notification-line',
      title: '最新記事をお届け',
      description: '新しい記事が公開されたらすぐに通知を受け取れます'
    },
    {
      icon: 'ri-time-line',
      title: 'いつでも読める',
      description: 'オフラインでも記事を読むことができます'
    },
    {
      icon: 'ri-layout-grid-line',
      title: '一括管理',
      description: '複数のサイトをまとめて購読・管理できます'
    },
    {
      icon: 'ri-star-line',
      title: '広告なし',
      description: 'RSSフィードには広告が含まれません'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4">
              <i className="ri-rss-line text-5xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
              RSS購読
            </h1>
            <p className="text-lg text-purple-700 max-w-2xl mx-auto">
              {siteName}の最新記事をRSSリーダーで購読できます
            </p>
          </div>

          {/* RSS URL */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
              <i className="ri-link-line mr-3 text-purple-600"></i>
              RSSフィードURL
            </h2>
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between gap-4">
                <code className="text-purple-800 break-all flex-1">{rssUrl}</code>
                <button
                  onClick={() => copyToClipboard(rssUrl)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shrink-0 flex items-center space-x-2"
                >
                  <i className={`${copied ? 'ri-check-line' : 'ri-file-copy-line'}`}></i>
                  <span>{copied ? 'コピー完了' : 'コピー'}</span>
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              このURLをお使いのRSSリーダーに登録してください
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
              <i className="ri-star-line mr-3 text-purple-600"></i>
              RSSのメリット
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shrink-0">
                    <i className={`${feature.icon} text-purple-600 text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RSS Readers */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
              <i className="ri-apps-line mr-3 text-purple-600"></i>
              おすすめRSSリーダー
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {rssReaders.map((reader, index) => (
                <a
                  key={index}
                  href={reader.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-4 p-4 rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 ${reader.color} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <i className={`${reader.icon} text-white text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-900 group-hover:text-purple-700 transition-colors">
                      {reader.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{reader.description}</p>
                  </div>
                  <i className="ri-external-link-line text-purple-600 group-hover:translate-x-1 transition-transform"></i>
                </a>
              ))}
            </div>
          </div>

          {/* How to Subscribe */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
              <i className="ri-question-line mr-3 text-purple-600"></i>
              購読方法
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0 text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">RSSリーダーを選ぶ</h3>
                  <p className="text-gray-600 text-sm">
                    上記のおすすめリーダーから、お好みのものを選択してください
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0 text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">フィードを登録</h3>
                  <p className="text-gray-600 text-sm">
                    RSSリーダーにフィードURLを登録するか、上記のボタンから直接登録できます
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0 text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">最新記事を受け取る</h3>
                  <p className="text-gray-600 text-sm">
                    新しい記事が公開されると、RSSリーダーに自動的に配信されます
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <i className="ri-mail-line mr-3 text-yellow-400"></i>
              その他の購読方法
            </h2>
            <p className="text-purple-100 mb-6">
              RSS以外にも、ニュースレターでの購読も可能です。
              メールアドレスを登録すると、新着記事の通知をお届けします。
            </p>
            <a
              href="/"
              className="inline-flex items-center space-x-2 bg-white text-purple-800 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
            >
              <i className="ri-mail-send-line"></i>
              <span>ニュースレターに登録</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}