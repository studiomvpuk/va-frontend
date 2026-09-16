import type { Meta, StoryObj } from '@storybook/nextjs';
import { Card, CardRow } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { EmptyState } from './empty-state';

const meta: Meta<typeof Card> = { title: 'UI/Card', component: Card };
export default meta;
type Story = StoryObj<typeof Card>;

export const WithLabel: Story = {
  args: {
    label: 'Experience',
    className: 'w-[520px]',
    children: <p className="text-ink-muted">Describe your work experience...</p>,
  },
};

export const RowList: Story = {
  render: () => (
    <Card label="Fields & sensitivity" className="w-[620px]" bodyClassName="p-0">
      <CardRow>
        <span>Current role</span>
        <Badge tone="neutral">General</Badge>
      </CardRow>
      <CardRow>
        <span>Home address</span>
        <Badge tone="sensitive">Sensitive</Badge>
      </CardRow>
      <CardRow>
        <span>Salary history</span>
        <Badge tone="sensitive">Sensitive</Badge>
      </CardRow>
      <CardRow>
        <span>Target salary range</span>
        <Badge tone="neutral">General</Badge>
      </CardRow>
    </Card>
  ),
};

export const WithHeaderAction: Story = {
  render: () => (
    <Card
      label="Sites"
      className="w-[620px]"
      action={<Button size="sm">+ Add site</Button>}
    >
      <p className="text-ink-muted">Where your VA is allowed to apply.</p>
    </Card>
  ),
};

export const Empty: Story = {
  render: () => (
    <Card label="Applications" className="w-[620px]" bodyClassName="p-0">
      <EmptyState
        title="No applications yet"
        description="Once your VA starts applying, every role they score will show up here."
      />
    </Card>
  ),
};
