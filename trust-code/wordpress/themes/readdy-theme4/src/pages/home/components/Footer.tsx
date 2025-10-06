
export default function Footer() {
  return (
    <footer className="bg-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <a href="/" className="flex items-center space-x-3 mb-4 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <i className="ri-code-s-slash-line text-purple-900 text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{fontFamily: '"Pacifico", serif'}}>
                  TrustCode
                </h3>
                <p className="text-sm text-purple-300">ともに信頼あるコードを築こう</p>
              </div>
            </a>
            <p className="text-purple-200 mb-4 leading-relaxed">
              ケーキ屋の社内エンジニアAqunが、自己啓発、アクアリウム、ガジェット、プログラミング、AI・ITについて綴るブログサイトです。
              日々の学びと経験を通じて、信頼あるコードと人生を築いていきます。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <i className="ri-twitter-line"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <i className="ri-github-line"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <i className="ri-linkedin-line"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                <i className="ri-mail-line"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">カテゴリー</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">自己啓発</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">アクアリウム</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">ガジェット</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">プログラミング</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">AI・IT</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">サイト情報</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">About</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">お問い合わせ</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">プライバシーポリシー</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">利用規約</a></li>
              <li><a href="#" className="text-purple-200 hover:text-white transition-colors cursor-pointer">RSS</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-purple-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-purple-300 text-sm">
            © 2025 TrustCode by Aqun. All rights reserved.
          </p>
          <a 
            href="https://readdy.ai/?origin=logo" 
            className="text-purple-300 hover:text-white text-sm transition-colors cursor-pointer mt-2 md:mt-0"
          >
            Powered by Readdy
          </a>
        </div>
      </div>
    </footer>
  );
}
