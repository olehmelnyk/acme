import type { StorybookConfig } from '@storybook/nextjs';

const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: 'apps/web/vite.config.mts',
      },
    },
    disableTelemetry: true,
  },

  docs: {
    autodocs: true,
  },

  typescript: {
    reactDocgen: 'react-docgen',
    check: false,
  },
} satisfies StorybookConfig;

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
