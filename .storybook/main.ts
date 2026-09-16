import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    // Storybook 9 folds the old "essentials" (controls, actions, viewport,
    // backgrounds) into core, so only these two are listed.
    '@storybook/addon-docs',
    // Every component is checked for accessibility violations as part of the
    // story, not as a separate audit somebody remembers to run.
    '@storybook/addon-a11y',
  ],
  framework: { name: '@storybook/nextjs', options: {} },
  staticDirs: ['../public'],
};

export default config;
