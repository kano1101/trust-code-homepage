
import { useState } from 'react';
import { useWordPressConfig } from '../../../hooks/useWordPressConfig';
import { useWordPressCategories } from '../../../hooks/useWordPressCategories';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { config } = useWordPressConfig();
  const { categories } = useWordPressCategories();

  const siteName = config?.site?.title || 'Trust Code';
  const tagline = config?.site?.tagline || '気持ちいいコードで信頼を重ねて';

  const mainNavigation = [
    { name: 'HOME', href: '/', active: window.location.pathname === '/' },
    { name: 'About', href: '/about', active: window.location.pathname === '/about' },
    { name: 'Contact', href: '/contact', active: window.location.pathname === '/contact' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <i className="ri-code-s-slash-line text-purple-900 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-800" style={{fontFamily: '"Pacifico", serif'}}>
                {siteName}
              </h1>
              <p className="text-xs text-purple-600">{tagline}</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {mainNavigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`font-medium transition-colors ${
                  item.active
                    ? 'text-purple-900 font-semibold'
                    : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                {item.name}
              </a>
            ))}

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="font-medium text-purple-700 hover:text-purple-900 transition-colors flex items-center space-x-1"
              >
                <span>Category</span>
                <i className={`ri-arrow-down-s-line transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isCategoryOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoryOpen(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-purple-100 py-2 z-20">
                    <a
                      href="/categories"
                      className="block px-4 py-2 text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <i className="ri-list-unordered mr-2"></i>
                      すべてのカテゴリ
                    </a>
                    <div className="border-t border-purple-100 my-2"></div>
                    {categories.map((category) => (
                      <a
                        key={category.id}
                        href={`/category/${category.id}`}
                        className="block px-4 py-2 text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <span>{category.name}</span>
                        <span className="text-xs text-purple-500 ml-2">({category.count})</span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* RSS Link */}
            <a
              href="/rss"
              className="font-medium text-purple-700 hover:text-purple-900 transition-colors"
            >
              <i className="ri-rss-line"></i>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-purple-700 hover:text-purple-900"
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <nav className="flex flex-col space-y-3">
              {mainNavigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`font-medium transition-colors ${
                    item.active
                      ? 'text-purple-900 font-semibold'
                      : 'text-purple-700 hover:text-purple-900'
                  }`}
                >
                  {item.name}
                </a>
              ))}

              <div className="border-t border-purple-100 pt-3">
                <a
                  href="/categories"
                  className="block font-medium text-purple-700 hover:text-purple-900 mb-2"
                >
                  カテゴリ一覧
                </a>
                {categories.slice(0, 5).map((category) => (
                  <a
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="block pl-4 py-1 text-sm text-purple-600 hover:text-purple-900"
                  >
                    {category.name} ({category.count})
                  </a>
                ))}
              </div>

              <a
                href="/rss"
                className="font-medium text-purple-700 hover:text-purple-900"
              >
                <i className="ri-rss-line mr-2"></i>RSS
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
