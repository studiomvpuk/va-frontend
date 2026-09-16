import { ImageResponse } from 'next/og';
import { TOKEN_HEX, OG_HEX } from '@/styles/tokens';

export const alt = 'Hand over the applying. Not your life.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The social card, drawn rather than designed in a file.
 *
 * ── Why this one place takes hex values ─────────────────────────────────────
 * Satori renders this at build time with no stylesheet and no CSS custom
 * properties — `var(--color-accent)` resolves to nothing and the text comes out
 * invisible. So the values come from src/styles/tokens.ts, the one module that
 * mirrors the stylesheet for consumers that cannot read it, rather than being
 * typed as literals here. That file is exempt from the no-raw-hex rule; this
 * one is not, and that is the right way round.
 *
 * Type is the system stack rather than General Sans: loading a variable font
 * into Satori means shipping the woff2 through the edge runtime for an image
 * regenerated on every deploy, and the headline is set large enough that the
 * difference is a detail nobody sees in a timeline.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: TOKEN_HEX.marketing,
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              background: OG_HEX.accent,
            }}
          />
          <div style={{ fontSize: 30, color: OG_HEX.textMuted }}>
            Job Application Assistant
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: OG_HEX.textOnDark,
          }}
        >
          <div>Hand over the applying.</div>
          <div style={{ color: OG_HEX.accent }}>Not your life.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 30, color: OG_HEX.textMuted, maxWidth: 760 }}>
            Your assistant never sees your profile. They ask one question, and
            get one answer.
          </div>
          {/* A second colour, so the card is not two-tone either. */}
          <div
            style={{
              width: 120,
              height: 8,
              borderRadius: 999,
              background: OG_HEX.indigo,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
