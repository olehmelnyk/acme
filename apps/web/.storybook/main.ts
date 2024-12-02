import type { StorybookConfig } from '@storybook/nextjs';
import { mergeConfig } from 'vite';
import type { UserConfig as ViteConfig } from 'vite';

const config = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/nextjs',
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  core: {
    disableTelemetry: true,
  },
  // @ts-expect-error - viteFinal is not in StorybookConfig type but is supported
  async viteFinal(config: ViteConfig) {
    return mergeConfig(config, {
      build: {
        modulePreload: true,
        target: 'esnext',
      },
      optimizeDeps: {
        force: true,
      },
      resolve: {
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
      },
    });
  },
} satisfies Partial<StorybookConfig>;

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
