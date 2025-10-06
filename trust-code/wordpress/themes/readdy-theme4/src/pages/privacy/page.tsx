export default function PrivacyPage() {
  const sections = [
    {
      title: '個人情報の収集',
      icon: 'ri-shield-user-line',
      content: `当サイトでは、お問い合わせやコメント投稿の際に、お名前とメールアドレスなどの個人情報をご提供いただく場合があります。
      これらの情報は、お問い合わせへの返信やサービスの提供のためにのみ使用いたします。`
    },
    {
      title: 'Cookieの使用',
      icon: 'ri-file-list-line',
      content: `当サイトでは、より良いユーザー体験を提供するためにCookieを使用しています。
      Cookieは、サイトの利用状況を分析し、サービスの改善に役立てるために使用されます。
      ブラウザの設定でCookieを無効にすることも可能ですが、一部の機能が正常に動作しない場合があります。`
    },
    {
      title: 'アクセス解析ツール',
      icon: 'ri-line-chart-line',
      content: `当サイトでは、サイトの利用状況を把握するためにアクセス解析ツールを使用しています。
      これらのツールは、訪問者の行動を匿名で追跡し、サイトの改善に役立てています。
      収集されたデータは統計的な分析にのみ使用され、個人を特定する情報は含まれません。`
    },
    {
      title: '個人情報の第三者提供',
      icon: 'ri-shield-cross-line',
      content: `当サイトは、法律で義務付けられている場合を除き、お客様の個人情報を第三者に提供、開示することはありません。
      ただし、サービスの提供に必要な範囲で、業務委託先に個人情報を提供する場合があります。
      その際は、適切な管理を行うよう委託先に義務付けています。`
    },
    {
      title: '個人情報の管理',
      icon: 'ri-lock-line',
      content: `当サイトは、お客様の個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス、紛失、破損、改ざん、漏洩などを防止するため、
      セキュリティシステムの維持、管理体制の整備等の必要な措置を講じています。`
    },
    {
      title: '免責事項',
      icon: 'ri-alert-line',
      content: `当サイトに掲載されている情報の正確性については万全を期していますが、利用者が当サイトの情報を用いて行う一切の行為について、
      一切の責任を負わないものとします。
      また、当サイトからリンクやバナーなどによって他のサイトに移動した場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。`
    },
    {
      title: 'プライバシーポリシーの変更',
      icon: 'ri-refresh-line',
      content: `当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直し、その改善に努めます。
      修正された最新のプライバシーポリシーは常に本ページにて開示されます。`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4">
              <i className="ri-shield-check-line text-5xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
              プライバシーポリシー
            </h1>
            <p className="text-lg text-purple-700">
              個人情報の取り扱いについて
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              Trust Code（以下「当サイト」）は、お客様の個人情報の保護を重要視しています。
              本プライバシーポリシーは、当サイトがどのように個人情報を収集、使用、管理するかについて説明するものです。
            </p>
            <p className="text-gray-700 leading-relaxed">
              当サイトをご利用いただくことで、本プライバシーポリシーに同意したものとみなされます。
            </p>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <i className={`${section.icon} text-purple-600 text-xl`}></i>
                  </div>
                  {index + 1}. {section.title}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <i className="ri-customer-service-line mr-3 text-yellow-400"></i>
              お問い合わせ
            </h2>
            <p className="text-purple-100 mb-6">
              個人情報の取り扱いに関するご質問やご不明な点がございましたら、
              お気軽にお問い合わせください。
            </p>
            <a
              href="/contact"
              className="inline-flex items-center space-x-2 bg-white text-purple-800 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
            >
              <i className="ri-mail-line"></i>
              <span>お問い合わせフォームへ</span>
            </a>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              最終更新日: {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}