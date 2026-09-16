import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { NotificationBell } from './notification-bell';
import { Button } from './button';

const meta: Meta<typeof NotificationBell> = {
  title: 'UI/NotificationBell',
  component: NotificationBell,
};
export default meta;
type Story = StoryObj<typeof NotificationBell>;

export const Unread: Story = { args: { count: 3 } };
export const None: Story = { args: { count: 0 } };
export const Overflow: Story = { args: { count: 128 } };

export const BadgeArrives: Story = {
  render: function Render() {
    const [count, setCount] = useState(0);
    return (
      <div className="flex items-center gap-4">
        <NotificationBell count={count} />
        <Button size="sm" variant="secondary" onClick={() => setCount((c) => c + 1)}>
          New notification
        </Button>
      </div>
    );
  },
};
