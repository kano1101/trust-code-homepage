import type { RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Categories from "../pages/categories/page";
import Tags from "../pages/tags/page";
import CategoryPage from "../pages/category/page";
import TagPage from "../pages/tag/page";
import About from "../pages/about/page";
import Contact from "../pages/contact/page";
import Privacy from "../pages/privacy/page";
import Terms from "../pages/terms/page";
import RSS from "../pages/rss/page";
import FAQ from "../pages/faq/page";
import SinglePost from "../pages/single/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout><Home /></Layout>,
  },
  // 固定ページ（優先度高）
  {
    path: "/categories",
    element: <Layout><Categories /></Layout>,
  },
  {
    path: "/tags",
    element: <Layout><Tags /></Layout>,
  },
  {
    path: "/about",
    element: <Layout><About /></Layout>,
  },
  {
    path: "/contact",
    element: <Layout><Contact /></Layout>,
  },
  {
    path: "/privacy",
    element: <Layout><Privacy /></Layout>,
  },
  {
    path: "/terms",
    element: <Layout><Terms /></Layout>,
  },
  {
    path: "/rss",
    element: <Layout><RSS /></Layout>,
  },
  {
    path: "/faq",
    element: <Layout><FAQ /></Layout>,
  },
  // カテゴリアーカイブ（IDベース）
  {
    path: "/category/:id",
    element: <Layout><CategoryPage /></Layout>,
  },
  // タグアーカイブ（IDベース）
  {
    path: "/tag/:id",
    element: <Layout><TagPage /></Layout>,
  },
  // 個別記事（IDベース）
  {
    path: "/post/:id",
    element: <Layout><SinglePost /></Layout>,
  },
  {
    path: "*",
    element: <Layout><NotFound /></Layout>,
  },
];

export default routes;
