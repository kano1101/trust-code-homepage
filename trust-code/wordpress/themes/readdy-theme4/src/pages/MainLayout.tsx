import { useEffect, useState } from 'react';
import Home from './home/page';
import Categories from './categories/page';

export default function MainLayout() {
  const [currentPage, setCurrentPage] = useState<'home' | 'categories'>('home');

  useEffect(() => {
    // URLパスから現在のページを判定
    const path = window.location.pathname;
    console.log('[DEBUG] MainLayout - Current path:', path);

    if (path.includes('/categories')) {
      setCurrentPage('categories');
    } else {
      setCurrentPage('home');
    }

    // URLが変更されたときに再チェック
    const handlePopState = () => {
      const path = window.location.pathname;
      console.log('[DEBUG] MainLayout - PopState path:', path);
      setCurrentPage(path.includes('/categories') ? 'categories' : 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  console.log('[DEBUG] MainLayout - Rendering page:', currentPage);

  if (currentPage === 'categories') {
    return <Categories />;
  }

  return <Home />;
}