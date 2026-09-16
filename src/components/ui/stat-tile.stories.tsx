import type { Meta, StoryObj } from '@storybook/nextjs';
import { StatTile } from './stat-tile';

const meta: Meta<typeof StatTile> = { title: 'UI/StatTile', component: StatTile };
export default meta;

/** The dashboard row from screen 5. Figures count up, staggered. */
export const DashboardRow: StoryObj<typeof StatTile> = {
  render: () => (
    <div className="grid w-[900px] grid-cols-4 divide-x divide-line rounded-lg border border-line bg-surface">
      <StatTile value={34} label="Applications this week" />
      <StatTile value={2} label="Interviews" />
      <StatTile value={6} decimals={1} label="Min fit score" />
      <StatTile value={2} label="Pending gap reviews" />
    </div>
  ),
};
