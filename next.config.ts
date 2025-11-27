import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },

  // Questa linea disabilita l'errore di Turbopack
  turbopack: {},
};

export default nextConfig;
