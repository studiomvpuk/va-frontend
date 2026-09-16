import type { Meta, StoryObj } from '@storybook/nextjs';
import { EmptyState } from './empty-state';
import { Button } from './button';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoApplications: Story = {
  args: {
    title: 'No applications yet',
    description:
      'Once your VA starts applying, every role they score shows up here with its fit score and status.',
  },
};

export const NoSites: Story = {
  args: {
    title: 'No sites added',
    description: 'Add the job boards your VA is allowed to apply through.',
    action: <Button size="sm">+ Add site</Button>,
  },
};
