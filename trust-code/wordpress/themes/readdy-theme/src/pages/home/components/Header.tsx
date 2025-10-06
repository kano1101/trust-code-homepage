
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
              <i className="ri-code-s-slash-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-800" style={{fontFamily: '"Pacifico", serif'}}>
                TrustCode
              </h1>
              <p className="text-xs text-purple-600">ともに信頼あるコードを築こう</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
              ホーム
            </a>
            <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
              自己啓発
            </a>
            <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
              アクアリウム
            </a>
            <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
              ガジェット
            </a>
            <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
              プログラミング
            </a>
            <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
              AI・IT
            </a>
            <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
              About
            </a>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-purple-700 hover:text-purple-900 cursor-pointer"
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
                ホーム
              </a>
              <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
                自己啓発
              </a>
              <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
                アクアリウム
              </a>
              <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
                ガジェット
              </a>
              <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
                プログラミング
              </a>
              <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
                AI・IT
              </a>
              <a href="#" className="text-purple-700 hover:text-purple-900 font-medium transition-colors cursor-pointer">
                About
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
