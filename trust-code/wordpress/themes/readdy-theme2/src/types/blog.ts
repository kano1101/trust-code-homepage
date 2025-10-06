
export interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  author: string;
  content: string;
  tags: string[];
  readTime: string;
  category: string;
  slug: string;
}

export interface Category {
  name: string;
  count: number;
  icon: string;
  color: string;
  slug: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  active?: boolean;
}
