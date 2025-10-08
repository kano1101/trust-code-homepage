import { useWordPressConfig } from '../../../hooks/useWordPressConfig';

export default function Footer() {
  const { config } = useWordPressConfig();

  const siteName = config?.siteName || 'Trust Code';
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About', href: '/about', icon: 'ri-information-line' },
    { name: 'Contact', href: '/contact', icon: 'ri-mail-line' },
    { name: 'Privacy', href: '/privacy', icon: 'ri-shield-line' },
    { name: 'Terms', href: '/terms', icon: 'ri-file-text-line' },
    { name: 'RSS', href: '/rss', icon: 'ri-rss-line' },
  ];

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: 'ri-github-fill' },
    { name: 'Twitter', href: 'https://twitter.com', icon: 'ri-twitter-x-fill' },
  ];

  return (
    <footer className="bg-gradient-to-br from-purple-800 to-purple-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <i className="ri-code-s-slash-line text-purple-900 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold" style={{fontFamily: '"Pacifico", serif'}}>
                {siteName}
              </h3>
            </div>
            <p className="text-purple-200 text-sm leading-relaxed">
              ケーキ屋のエンジニアAqunが綴る、自己啓発とテクノロジーの融合。
              気持ちいいコードで信頼を重ねていきましょう。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-links-line mr-2 text-yellow-400"></i>
              クイックリンク
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-purple-200 hover:text-yellow-400 transition-colors flex items-center space-x-2 text-sm"
                  >
                    <i className={`${link.icon} text-xs`}></i>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-share-line mr-2 text-yellow-400"></i>
              フォローする
            </h4>
            <div className="flex space-x-3 mb-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-purple-700 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all hover:text-purple-900"
                  aria-label={social.name}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-3">最新の投稿をお届け</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="メールアドレス"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button className="bg-yellow-500 hover:bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-purple-300 text-sm">
              &copy; {currentYear} {siteName}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-purple-300">
              <span className="flex items-center">
                <i className="ri-heart-fill text-red-400 mr-1"></i>
                Made with love
              </span>
              <span className="flex items-center">
                <i className="ri-reactjs-line text-blue-400 mr-1"></i>
                Powered by React
              </span>
              <span className="flex items-center">
                <i className="ri-wordpress-fill text-blue-300 mr-1"></i>
                WordPress
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
