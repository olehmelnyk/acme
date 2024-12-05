import { composePlugins, withNx } from '@nx/next';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // Remove the static export since we want a server-rendered app
  distDir: 'artifacts/apps/web/.next',
  // Ensure Next.js uses the correct base path
  basePath: '',
  // Disable image optimization since we're using static export
  images: {
    unoptimized: true,
  },
  // Enable React strict mode for better development
  reactStrictMode: true,
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

export default composePlugins(...plugins)(nextConfig);
