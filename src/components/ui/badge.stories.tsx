import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';

const meta: Meta<typeof Badge> = { title: 'UI/Badge', component: Badge };
export default meta;
type Story = StoryObj<typeof Badge>;

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral">General</Badge>
      <Badge tone="sensitive">Sensitive</Badge>
      <Badge tone="positive">Signed</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Revoked</Badge>
    </div>
  ),
};

/**
 * The layout-shift check from Phase 2's acceptance criteria: both states are the
 * same width, so the row does not move when the flag is toggled.
 */
export const SensitivityToggle: Story = {
  render: function Render() {
    const [sensitive, setSensitive] = useState(false);
    return (
      <div className="flex w-[420px] items-center justify-between rounded-lg border border-line bg-surface px-6 py-5">
        <span className="text-ink">Home address</span>
        <div className="flex items-center gap-3">
          <Badge tone={sensitive ? 'sensitive' : 'neutral'}>
            {sensitive ? 'Sensitive' : 'General'}
          </Badge>
          <Button size="sm" variant="ghost" onClick={() => setSensitive((s) => !s)}>
            Toggle
          </Button>
        </div>
      </div>
    );
  },
};
