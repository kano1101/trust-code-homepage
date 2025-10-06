
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import MainLayout from "../pages/MainLayout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
  },
  {
    path: "*",
    element: <MainLayout />,
  },
];

export default routes;
