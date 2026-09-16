import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input, Textarea } from './input';

const meta: Meta<typeof Input> = { title: 'UI/Input', component: Input };
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: 'Full name', placeholder: 'e.g. Tolulope Olonibua' },
};
export const WithHint: Story = {
  args: { label: 'Email', placeholder: 'you@email.com', hint: 'We only use this to sign you in.' },
};
export const WithError: Story = {
  args: { label: 'Email', defaultValue: 'not-an-email', error: 'Enter a valid email address.' },
};
export const Password: Story = {
  args: { label: 'Password', type: 'password', defaultValue: 'correcthorse' },
};
export const LongForm: StoryObj<typeof Textarea> = {
  render: () => (
    <Textarea
      label="Experience"
      placeholder="Describe your work experience and what you're looking for..."
    />
  ),
};
