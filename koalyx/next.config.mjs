/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Activer ESLint
  },
  typescript: {
    ignoreBuildErrors: false, // Activer la vérification TypeScript
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    typedRoutes: true, // Activer les routes typées
  },
}

export default nextConfig
