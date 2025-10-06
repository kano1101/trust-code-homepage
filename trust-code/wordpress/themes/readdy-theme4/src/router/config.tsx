import type { RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import NotFound from "../pages/NotFound";
import TopPage from "../pages/top/page";
import Home from "../pages/home/page";
import Categories from "../pages/categories/page";
import Tags from "../pages/tags/page";
import About from "../pages/about/page";
import Contact from "../pages/contact/page";
import Privacy from "../pages/privacy/page";
import Terms from "../pages/terms/page";
import RSS from "../pages/rss/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout><TopPage /></Layout>,
  },
  {
    path: "/blog",
    element: <Layout><Home /></Layout>,
  },
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
    path: "*",
    element: <Layout><NotFound /></Layout>,
  },
];

export default routes;
