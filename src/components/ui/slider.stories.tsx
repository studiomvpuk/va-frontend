import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Slider } from './slider';
import { Card } from './card';

const meta: Meta<typeof Slider> = { title: 'UI/Slider', component: Slider };
export default meta;

export const MinimumFitScore: StoryObj<typeof Slider> = {
  render: function Render() {
    const [value, setValue] = useState(6);
    return (
      <Card label="Minimum fit score" className="w-[420px]">
        <p className="mb-5 font-display text-3xl font-bold text-positive">
          {value.toFixed(1)}
          <span className="text-lg text-ink-muted">/10</span>
        </p>
        <Slider value={value} onChange={setValue} label="Minimum fit score" />
      </Card>
    );
  },
};
