/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['raw.githubusercontent.com'], // Pour les images Pokemon
  },
  // Configuration spécifique pour les serveurs de production avec Prisma
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./node_modules/.prisma/client/**/*'],
    },
  },
  // Optimisation pour serveurs et Vercel
  serverExternalPackages: ['@prisma/client'],
  // Force server-side pour les modules Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      // S'assurer que Prisma est correctement bundlé côté serveur
      config.plugins = [...config.plugins]
    } else {
      // Empêcher Prisma d'être bundlé côté client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@prisma/client': false,
        '.prisma/client': false,
      }
    }
    return config
  },
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig