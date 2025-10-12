import { useState } from 'react';
import PageHero from '../../components/PageHero';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: 'このブログは何について書かれていますか？',
      answer: 'このブログは、自己啓発、プログラミング、アクアリウム、ガジェット、AI・ITなど、多岐にわたるテーマについて綴っています。ケーキ屋の社内エンジニアとして働きながら、技術と人生の融合を追求しています。',
      category: 'general'
    },
    {
      id: 2,
      question: '記事の更新頻度はどれくらいですか？',
      answer: '不定期ですが、週に1〜2回程度の更新を目指しています。質の高いコンテンツを提供することを優先していますので、内容によって更新頻度は変動します。',
      category: 'general'
    },
    {
      id: 3,
      question: 'コメントや質問は受け付けていますか？',
      answer: 'はい、各記事のコメント欄やお問い合わせフォームから質問やフィードバックを受け付けています。すべてのコメントに返信できるわけではありませんが、できる限り対応させていただきます。',
      category: 'general'
    },
    {
      id: 4,
      question: 'Markdown記法を使って記事を書いていますか？',
      answer: 'はい、すべての記事はMarkdown形式で記述しています。見出し、リスト、コードブロック、テーブルなど、豊富な表現が可能です。特別な記法（:::warning など）を使った警告ボックスもサポートしています。',
      category: 'technical'
    },
    {
      id: 5,
      question: '使用している技術スタックは何ですか？',
      answer: 'このブログは、WordPress（バックエンド）+ React + TypeScript + Tailwind CSS（フロントエンド）で構築されています。Dockerを使った開発環境で、Viteによる高速なビルドを実現しています。',
      category: 'technical'
    },
    {
      id: 6,
      question: 'いいね機能はどのように動作しますか？',
      answer: 'いいね機能は、Cookieを使ってユーザーごとのいいね状態を30日間保持します。WordPressのカスタムREST APIを通じて、いいね数を管理しています。ログイン不要で利用できます。',
      category: 'technical'
    },
    {
      id: 7,
      question: '記事の転載や引用は可能ですか？',
      answer: '個人的な利用や学習目的であれば、適切な引用元の明記とともに転載・引用していただけます。商業利用の場合は、事前にお問い合わせください。',
      category: 'general'
    },
    {
      id: 8,
      question: 'ニュースレターの配信はありますか？',
      answer: '現在、ニュースレター機能を準備中です。サイドバーから登録いただくと、最新の投稿やアップデート情報をお届けする予定です。',
      category: 'general'
    }
  ];

  const categories = [
    { id: 'all', name: 'すべて', icon: 'ri-grid-line' },
    { id: 'general', name: '一般', icon: 'ri-question-line' },
    { id: 'technical', name: '技術', icon: 'ri-code-line' }
  ];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <PageHero title="FAQ" subtitle="よくある質問" colorScheme="green" />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              <i className={`${category.icon} mr-2`}></i>
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ一覧 */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <i className="ri-inbox-line text-5xl mb-4"></i>
              <p>該当する質問がありません</p>
            </div>
          ) : (
            filteredFAQs.map(faq => (
              <div
                key={faq.id}
                className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden transition-all hover:shadow-lg"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <i className="ri-questionnaire-line text-purple-600 text-xl mt-1"></i>
                    <h3 className="text-lg font-semibold text-purple-900">
                      {faq.question}
                    </h3>
                  </div>
                  <i
                    className={`ri-arrow-down-s-line text-2xl text-purple-600 transition-transform ${
                      openId === faq.id ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {openId === faq.id && (
                  <div className="px-6 pb-4 pt-2 border-t border-purple-100 bg-purple-50">
                    <div className="flex gap-3">
                      <i className="ri-chat-check-line text-green-600 text-xl mt-1"></i>
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* お問い合わせCTA */}
        <div className="mt-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center shadow-lg">
          <i className="ri-question-answer-line text-5xl mb-4"></i>
          <h2 className="text-2xl font-bold mb-3">
            他にご質問がありますか？
          </h2>
          <p className="mb-6 text-purple-100">
            上記以外のご質問やフィードバックがございましたら、お気軽にお問い合わせください。
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-md"
          >
            <i className="ri-mail-send-line mr-2"></i>
            お問い合わせ
          </a>
        </div>
      </main>
    </div>
  );
}
