import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Toggle } from './toggle';
import { Card } from './card';

const meta: Meta<typeof Toggle> = { title: 'UI/Toggle', component: Toggle };
export default meta;

/** The two settings from screen 4. */
export const SettingsGroup: StoryObj<typeof Toggle> = {
  render: function Render() {
    const [guess, setGuess] = useState(true);
    const [byok, setByok] = useState(false);
    return (
      <Card className="w-[560px]" bodyClassName="p-0">
        <div className="border-b border-line px-6 py-5">
          <Toggle
            checked={guess}
            onChange={setGuess}
            label="When the AI is uncertain"
            description="Guess and proceed, vs. ask you first."
          />
        </div>
        <div className="px-6 py-5">
          <Toggle
            checked={byok}
            onChange={setByok}
            label="Bring your own API key"
            description="Pay Anthropic/OpenAI directly instead of platform billing."
          />
        </div>
      </Card>
    );
  },
};
