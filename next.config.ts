
import type {NextConfig} from 'next';
import path from 'path'; // Import path module

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Ensure this runs only for client-side bundles
    if (!isServer) {
      // Provide a fallback for 'async_hooks' to an empty module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Often needed for other Node.js modules
        async_hooks: path.resolve(__dirname, './src/lib/empty-module.ts'),
      };

      // Alias specific OpenTelemetry modules that might try to use 'async_hooks'
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/context-async-hooks': path.resolve(__dirname, './src/lib/empty-module.ts'),
        '@opentelemetry/sdk-node': path.resolve(__dirname, './src/lib/empty-module.ts'),
        '@opentelemetry/sdk-trace-node': path.resolve(__dirname, './src/lib/empty-module.ts'),
      };
    }
    
    // Add a loader for .node files if any native modules are involved (less common for this error)
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });


    return config;
  },
};

export default nextConfig;
