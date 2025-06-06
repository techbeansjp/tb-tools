/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 画像の最適化を無効化（静的エクスポート時は必要）
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 