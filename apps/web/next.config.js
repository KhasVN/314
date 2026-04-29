const { composePlugins, withNx } = require('@nx/next');

const nextConfig = {
  devIndicators: false,
  output: 'standalone',
  nx: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').join(__dirname, 'src'),
      '@components': require('path').join(__dirname, 'src/features/talent/components'),
      '@lib': require('path').join(__dirname, 'src/lib'),
      '@features': require('path').join(__dirname, 'src/features'),
    };
    return config;
  },
};

module.exports = composePlugins(withNx)(nextConfig);
