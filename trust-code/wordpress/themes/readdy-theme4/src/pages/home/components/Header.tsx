
import { useState } from 'react';
import { useWordPressConfig } from '../../../hooks/useWordPressConfig';

export default function Header() {
  const { config, loading } = useWordPressConfig();

  if (loading || !config) {
    return (
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse">
              <div className="h-8 bg-purple-100 rounded w-32"></div>
            </div>
            <div className="hidden md:flex space-x-8 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-purple-100 rounded w-16"></div>
              ))}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <a href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className={`w-10 h-10 bg-gradient-to-br ${config.theme.gradients.card} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-800" style={{ fontFamily: '"Pacifico", serif' }}>
                {config.siteName}
              </h1>
              <p className="text-xs text-gray-600 -mt-1">{config.tagline}</p>
            </div>
          </a>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-purple-800 hover:text-purple-600 font-medium transition-colors cursor-pointer">
              ホーム
            </a>
            <a href="/categories/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors cursor-pointer">
              カテゴリ
            </a>
            <a href="/#about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors cursor-pointer">
              About
            </a>
          </nav>

          {/* 検索とメニューボタン */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors cursor-pointer">
              <i className="ri-search-line text-xl"></i>
            </button>
            <button className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors cursor-pointer">
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
