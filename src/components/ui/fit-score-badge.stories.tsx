import type { Meta, StoryObj } from '@storybook/nextjs';
import { FitScoreBadge } from './fit-score-badge';

const meta: Meta<typeof FitScoreBadge> = {
  title: 'UI/FitScoreBadge',
  component: FitScoreBadge,
  args: { threshold: 6 },
};
export default meta;
type Story = StoryObj<typeof FitScoreBadge>;

export const High: Story = { args: { score: 7.5 } };
export const Borderline: Story = { args: { score: 6.0 } };
export const Low: Story = { args: { score: 4.0 } };

export const LargeVariant: Story = {
  args: { score: 7.5, variant: 'large' },
};

/** Tone is relative to the Client's own threshold, not a fixed number. */
export const AgainstAStricterThreshold: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <FitScoreBadge score={7.5} threshold={6} />
      <span className="text-sm text-ink-muted">threshold 6.0 &rarr; good</span>
      <FitScoreBadge score={7.5} threshold={8} />
      <span className="text-sm text-ink-muted">threshold 8.0 &rarr; borderline</span>
    </div>
  ),
};
