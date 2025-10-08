export default function TermsPage() {
  const sections = [
    {
      title: '利用規約への同意',
      icon: 'ri-checkbox-circle-line',
      content: `本利用規約（以下「本規約」）は、Trust Code（以下「当サイト」）が提供するサービスの利用条件を定めるものです。
      当サイトをご利用される方は、本規約に同意したものとみなされます。
      本規約に同意いただけない場合は、当サイトのご利用をお控えください。`
    },
    {
      title: 'サービスの内容',
      icon: 'ri-service-line',
      content: `当サイトは、自己啓発、テクノロジー、プログラミング、アクアリウム、ガジェットなどに関する情報を発信するブログサービスを提供します。
      記事の閲覧、コメントの投稿、いいね機能の利用などが可能です。
      サービスの内容は予告なく変更される場合があります。`
    },
    {
      title: '禁止事項',
      icon: 'ri-forbid-line',
      content: `以下の行為を禁止します：
      ・法令または公序良俗に違反する行為
      ・犯罪行為に関連する行為
      ・他者の権利を侵害する行為
      ・当サイトのサーバーやネットワークに過度な負荷をかける行為
      ・不正アクセスやこれに準ずる行為
      ・他者になりすます行為
      ・当サイトの運営を妨害する行為
      ・その他、当サイトが不適切と判断する行為`
    },
    {
      title: 'コンテンツの著作権',
      icon: 'ri-copyright-line',
      content: `当サイトに掲載されている文章、画像、その他のコンテンツの著作権は、当サイトまたはコンテンツ提供者に帰属します。
      これらのコンテンツを無断で転載、複製、改変、配布することを禁じます。
      ただし、個人的な利用や引用の範囲内での使用は認められます。`
    },
    {
      title: 'ユーザー投稿コンテンツ',
      icon: 'ri-chat-upload-line',
      content: `ユーザーが当サイトに投稿したコメントやその他のコンテンツについて、投稿者が著作権を保持します。
      ただし、投稿することにより、当サイトに対して、投稿コンテンツを無償で使用する権利を許諾したものとみなされます。
      投稿内容が第三者の権利を侵害する場合、投稿者が一切の責任を負うものとします。`
    },
    {
      title: '免責事項',
      icon: 'ri-shield-cross-line',
      content: `当サイトは、サービスの正確性、完全性、安全性、有用性について保証しません。
      サービスの利用により生じた損害について、当サイトは一切の責任を負いません。
      当サイトからのリンク先サイトの内容について、当サイトは責任を負いません。
      サービスの中断、停止、終了によって生じた損害について、当サイトは責任を負いません。`
    },
    {
      title: 'サービスの変更・停止',
      icon: 'ri-pause-circle-line',
      content: `当サイトは、事前の通知なく、サービスの内容を変更、または一時的に停止することがあります。
      システムメンテナンス、不可抗力、その他の理由により、サービスを提供できない場合があります。
      これらの変更や停止によって生じた損害について、当サイトは責任を負いません。`
    },
    {
      title: '利用規約の変更',
      icon: 'ri-file-edit-line',
      content: `当サイトは、必要に応じて本規約を変更することができます。
      変更後の利用規約は、当サイトに掲載された時点で効力を生じるものとします。
      変更後も当サイトを継続して利用される場合、変更後の利用規約に同意したものとみなされます。`
    },
    {
      title: '準拠法・管轄裁判所',
      icon: 'ri-scales-line',
      content: `本規約の解釈にあたっては、日本法を準拠法とします。
      当サイトのサービスに関して紛争が生じた場合には、当サイトの所在地を管轄する裁判所を専属的合意管轄裁判所とします。`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4">
              <i className="ri-file-text-line text-5xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
              利用規約
            </h1>
            <p className="text-lg text-purple-700">
              サービス利用に関する規約
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-information-line text-purple-600 text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-900 mb-2">はじめに</h2>
                <p className="text-gray-700 leading-relaxed">
                  この利用規約は、Trust Codeが提供するサービスをご利用いただく際の条件を定めています。
                  本サービスをご利用になる前に、必ずお読みください。
                </p>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
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
                  第{index + 1}条 {section.title}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
              <i className="ri-alert-line mr-3 text-yellow-600 text-2xl"></i>
              重要なお知らせ
            </h2>
            <p className="text-yellow-800 leading-relaxed mb-4">
              本規約に違反した場合、当サイトは事前の通知なく、該当ユーザーのアクセスを制限、
              またはサービスの利用を停止することがあります。
            </p>
            <p className="text-yellow-800 leading-relaxed">
              不明な点がございましたら、お問い合わせページよりご連絡ください。
            </p>
          </div>

          {/* Contact Section */}
          <div className="mt-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <i className="ri-question-line mr-3 text-yellow-400"></i>
              ご質問・お問い合わせ
            </h2>
            <p className="text-purple-100 mb-6">
              利用規約に関するご質問やご不明な点がございましたら、
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
              制定日・最終更新日: {new Date().toLocaleDateString('ja-JP', {
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