import { useWordPressConfig } from '../../hooks/useWordPressConfig';
import PageHero from '../../components/PageHero';

export default function AboutPage() {
  const { config } = useWordPressConfig();

  const author = config?.author || {
    name: 'Aqun',
    bio: 'ケーキ屋の社内エンジニア\n1989年11月1日生',
    description: 'プログラマ、花屋、医療従事者を経て現在のケーキ屋社内エンジニアとして活動。自己啓発とテクノロジーの融合を追求。',
    avatar: 'A'
  };

  const skills = [
    { name: 'プログラミング', icon: 'ri-code-line', color: 'text-purple-600' },
    { name: '自己啓発', icon: 'ri-lightbulb-line', color: 'text-yellow-600' },
    { name: 'アクアリウム', icon: 'ri-water-percent-line', color: 'text-blue-600' },
    { name: 'ガジェット', icon: 'ri-smartphone-line', color: 'text-green-600' },
    { name: 'AI・IT', icon: 'ri-robot-line', color: 'text-red-600' }
  ];

  const timeline = [
    { year: '1989年', event: '11月1日生まれ', icon: 'ri-cake-line' },
    { year: '過去', event: 'プログラマとして活動', icon: 'ri-code-line' },
    { year: '過去', event: '花屋で勤務', icon: 'ri-plant-line' },
    { year: '過去', event: '医療従事者として活動', icon: 'ri-heart-pulse-line' },
    { year: '現在', event: 'ケーキ屋の社内エンジニア', icon: 'ri-cake-3-line' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <PageHero title="About" subtitle="私について" colorScheme="blue" />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-5xl">{author.avatar}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
              {author.name}
            </h1>
            <p className="text-xl text-purple-700 whitespace-pre-line">
              {author.bio}
            </p>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
              <i className="ri-user-line mr-3 text-purple-600"></i>
              自己紹介
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              {author.description}
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              このブログでは、日々の学びや経験、自己啓発、テクノロジー、趣味のアクアリウムやガジェットについて発信しています。
              信頼あるコードと人生を築くための思考と実践を共有していきます。
            </p>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
              <i className="ri-star-line mr-3 text-purple-600"></i>
              興味・関心
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                >
                  <i className={`${skill.icon} text-4xl ${skill.color} mb-2 block`}></i>
                  <p className="text-purple-900 font-semibold">{skill.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
              <i className="ri-time-line mr-3 text-purple-600"></i>
              経歴
            </h2>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <i className={`${item.icon} text-white text-xl`}></i>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-purple-800 font-bold">{item.year}</p>
                    <p className="text-gray-700">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <i className="ri-heart-line mr-3 text-yellow-400"></i>
              理念
            </h2>
            <blockquote className="text-lg leading-relaxed italic border-l-4 border-yellow-400 pl-6">
              「気持ちいいコードで信頼を重ねて」
              <br />
              <br />
              技術と人生、どちらも信頼できる基盤の上に重ねられるべきです。
              日々の実践と学びを通じて、より良いコードとより良い人生を追求しています。
            </blockquote>
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <p className="text-purple-700 mb-4">お気軽にご連絡ください</p>
            <a
              href="/contact"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
            >
              <i className="ri-mail-line"></i>
              <span>お問い合わせ</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}