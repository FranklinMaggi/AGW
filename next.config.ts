const nextConfig = {
  experimental: {
    webpackBuildWorker: false,
    
  },

  webpack: (config) => {
    return config;
  },

  turbopack: {},
};

export default nextConfig;
