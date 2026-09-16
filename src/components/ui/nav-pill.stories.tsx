import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { NavPills, type NavItem } from './nav-pill';

const items: NavItem[] = [
  { key: 'profile', label: 'Profile', href: '#' },
  { key: 'sites', label: 'Sites', href: '#' },
  { key: 'settings', label: 'Settings', href: '#' },
  { key: 'dashboard', label: 'Dashboard', href: '#' },
  { key: 'how', label: 'How to Use', href: '#' },
];

const meta: Meta<typeof NavPills> = { title: 'UI/NavPills', component: NavPills };
export default meta;

/**
 * The signature move. Click between items and watch the black pill travel
 * rather than fade out and in.
 */
export const SharedElement: StoryObj<typeof NavPills> = {
  render: function Render() {
    const [active, setActive] = useState('profile');
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        <NavPills
          items={items}
          activeKey={active}
          onSelect={(item) => setActive(item.key)}
        />
      </div>
    );
  },
};
