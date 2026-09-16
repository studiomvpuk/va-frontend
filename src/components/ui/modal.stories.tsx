import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Modal } from './modal';
import { Button } from './button';

const meta: Meta<typeof Modal> = { title: 'UI/Modal', component: Modal };
export default meta;

/**
 * Focus is trapped and restored. Tab through it — you cannot reach the page
 * behind, and closing returns focus to the trigger.
 */
export const FocusTrapped: StoryObj<typeof Modal> = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex gap-3">
        <Button onClick={() => setOpen(true)}>Reveal credential</Button>
        <Button variant="secondary">Decoy (should be unreachable when open)</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Indeed UK">
          <p className="mb-6 text-ink-muted">
            This password is visible for 60 seconds and the reveal has been logged.
          </p>
          <p className="mb-6 rounded-md bg-surface-sunken px-4 py-3 font-mono text-ink">
            k9-Tulip-Marlow-42
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setOpen(false)}>Done</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      </div>
    );
  },
};
