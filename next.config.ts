import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статический экспорт для GitHub Pages
  output: "export",

  // basePath = имя репозитория (сайт будет на artem-nikiforov.github.io/gostemania)
  basePath: "/gostemania",

  // Добавляем слэш в конце URL: /speeches → /speeches/
  trailingSlash: true,

  // Отключаем серверную оптимизацию изображений (не поддерживается в статике)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
