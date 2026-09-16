import { ImageResponse } from 'next/og';
import { TOKEN_HEX, OG_HEX } from '@/styles/tokens';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * The favicon: the brand mark, which is one accent dot.
 *
 * Generated rather than a checked-in .ico for the same reason the OG image is —
 * it is drawn from the token values, so it cannot drift from the palette, and
 * there is no binary in the repository that someone has to remember to
 * regenerate when the accent changes.
 *
 * The dot is oversized relative to its use in the header. At 32px a mark with
 * the header's proportions is four pixels of orange in a field of near-black,
 * which reads as a smudge in a tab strip.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: TOKEN_HEX.marketing,
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: OG_HEX.accent,
          }}
        />
      </div>
    ),
    size,
  );
}
