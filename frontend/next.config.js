/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 本番ビルドの最適化
  output: "standalone",
  // 画像最適化
  images: {
    domains: ["localhost"],
  },
  // パフォーマンス最適化
  swcMinify: true,
  // 実験的機能
  experimental: {
    optimizeCss: true,
  },
  // TypeScriptエラーでのビルド中断を防止
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
