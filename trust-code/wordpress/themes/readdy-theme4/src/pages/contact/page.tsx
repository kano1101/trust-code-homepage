import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // WordPress REST APIを使用してメールを送信
      const response = await fetch('/index.php?rest_route=/readdy/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('送信に失敗しました');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: 'ri-mail-line',
      title: 'Email',
      content: 'info@trustcode.example',
      color: 'text-purple-600'
    },
    {
      icon: 'ri-twitter-x-line',
      title: 'Twitter',
      content: '@trustcode',
      color: 'text-blue-600'
    },
    {
      icon: 'ri-github-line',
      title: 'GitHub',
      content: 'github.com/trustcode',
      color: 'text-gray-700'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4">
              <i className="ri-mail-send-line text-5xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
              お問い合わせ
            </h1>
            <p className="text-lg text-purple-700 max-w-2xl mx-auto">
              ご質問、ご意見、コラボレーションのご提案など、お気軽にお問い合わせください
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
                <h2 className="text-2xl font-bold text-purple-900 mb-6">メッセージを送る</h2>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                    <i className="ri-checkbox-circle-line text-green-600 text-2xl"></i>
                    <div>
                      <p className="text-green-800 font-semibold">送信完了</p>
                      <p className="text-green-700 text-sm">メッセージが正常に送信されました。ご連絡ありがとうございます！</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                    <i className="ri-error-warning-line text-red-600 text-2xl"></i>
                    <div>
                      <p className="text-red-800 font-semibold">送信エラー</p>
                      <p className="text-red-700 text-sm">申し訳ございません。もう一度お試しください。</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-purple-900 font-semibold mb-2">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="山田太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-900 font-semibold mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-900 font-semibold mb-2">
                      件名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="お問い合わせの件名"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-900 font-semibold mb-2">
                      メッセージ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="お問い合わせ内容をご記入ください"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        送信中...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <i className="ri-send-plane-fill mr-2"></i>
                        送信する
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-4">連絡先情報</h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 bg-purple-100 rounded-lg shrink-0`}>
                        <i className={`${info.icon} ${info.color} text-xl`}></i>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-900 text-sm">{info.title}</p>
                        <p className="text-gray-600 text-sm">{info.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <i className="ri-question-line mr-2 text-yellow-400"></i>
                  FAQ
                </h3>
                <p className="text-purple-100 text-sm mb-3">
                  よくある質問は別ページでご確認いただけます
                </p>
                <a
                  href="/"
                  className="inline-flex items-center text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                >
                  FAQを見る
                  <i className="ri-arrow-right-line ml-1"></i>
                </a>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-3">
                  <i className="ri-time-line mr-2 text-purple-600"></i>
                  対応時間
                </h3>
                <p className="text-gray-600 text-sm">
                  通常、24〜48時間以内に返信いたします。
                  お急ぎの場合は件名に「緊急」とご記入ください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}