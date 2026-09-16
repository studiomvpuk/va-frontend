import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChatBubble } from './chat-bubble';
import { Button } from './button';

const meta: Meta<typeof ChatBubble> = {
  title: 'UI/ChatBubble',
  component: ChatBubble,
};
export default meta;

/** The exchange from screen 7, in order. */
export const Conversation: StoryObj<typeof ChatBubble> = {
  render: () => (
    <div className="flex w-[820px] flex-col gap-5">
      <ChatBubble role="va">
        Pasted job description: &ldquo;Marketing Coordinator, Descasio Ltd &mdash;
        1&ndash;2 years experience, social media &amp; reporting...&rdquo;
      </ChatBubble>
      <ChatBubble role="ai">
        Fit score 7.5/10 &mdash; good match. Drafted answers ready below.
      </ChatBubble>
      <ChatBubble role="va">
        What should I put for &ldquo;why do you want to work here?&rdquo;
      </ChatBubble>
      <ChatBubble
        role="ai"
        footer={
          <Button size="sm" variant="ghost" className="px-0 text-accent">
            Copy
          </Button>
        }
      >
        &ldquo;I&rsquo;m drawn to Descasio&rsquo;s work across fintech and logistics
        clients &mdash; the kind of varied, fast-moving environment where I can put
        my content and reporting background to immediate use.&rdquo;
      </ChatBubble>
      <ChatBubble role="ai" flagged>
        Flagged: notice period wasn&rsquo;t on file &mdash; used &ldquo;Immediately
        available&rdquo; as best-effort for this one. Review/correct anytime.
      </ChatBubble>
    </div>
  ),
};

export const Flagged: StoryObj<typeof ChatBubble> = {
  args: {
    role: 'ai',
    flagged: true,
    children:
      'Flagged: notice period wasn’t on file — used “Immediately available” as best-effort.',
  },
};
