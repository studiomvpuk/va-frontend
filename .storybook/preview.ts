import type { Preview } from '@storybook/nextjs';
import '../src/styles/globals.css';
import { TOKEN_HEX } from '../src/styles/tokens';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: 'error' },
    backgrounds: {
      default: 'workspace',
      values: [
        // The two brand registers: light for the work, dark for the pitch.
        { name: 'workspace', value: TOKEN_HEX.workspace },
        { name: 'marketing', value: TOKEN_HEX.marketing },
      ],
    },
  },
  globalTypes: {
    surface: {
      description: 'Brand register',
      defaultValue: 'light',
      toolbar: {
        title: 'Surface',
        items: [
          { value: 'light', title: 'Light (app)' },
          { value: 'dark', title: 'Dark (marketing)' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const dark = context.globals.surface === 'dark';
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      return Story();
    },
  ],
};

export default preview;
