import { useLocation } from "react-router-dom";

export const HOME_ROUTES = ["/"];
export const DARK_ROUTES = ["/reservar"];
export const LIGHT_ROUTES = ["/menu", "/descubrenos"];

const normalizePath = (path = "") => {
  if (!path) return "/";
  if (path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

export const useRouteMode = () => {
  const { pathname } = useLocation();
  const currentPath = normalizePath(pathname);

  const isHome = HOME_ROUTES.map(normalizePath).includes(currentPath);
  const isDark = DARK_ROUTES.map(normalizePath).includes(currentPath);
  const isLight = LIGHT_ROUTES.map(normalizePath).includes(currentPath);

  return {
    isHome,
    isDark,
    isLight,
    currentPath,
  };
};
