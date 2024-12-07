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
  // Base path configuration
  // - Empty string ('') serves the app from the root URL (e.g., example.com/)
  // - Set to '/subdirectory' when deploying to a subdirectory (e.g., example.com/subdirectory)
  // - Affects all asset paths and internal routing
  // - Must match the path where the app is deployed to avoid 404 errors
  basePath: '',
  images: {
    unoptimized: false,
  },
  // Enable React strict mode for better development
  reactStrictMode: true,
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

export default composePlugins(...plugins)(nextConfig);
