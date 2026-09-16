'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useSession } from '@/lib/session';
import { duration, ease } from '../motion/tokens';

/**
 * Who you are signed in as, and the way out.
 *
 * There was no logout anywhere in the product before this. Not an oversight
 * worth much on its own, but on a product whose whole proposition is control
 * over your own information, "I could not find how to sign out" is the wrong
 * first impression.
 *
 * The initial rather than a full name: the header is already carrying a wordmark,
 * a five-item nav and a bell, and at phone width a name pushes the bell off.
 */
export function AccountMenu() {
  const { session, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (session.status !== 'authenticated') return null;
  const { user } = session;

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account — ${user.fullName}`}
        className="grid h-9 w-9 place-items-center rounded-pill border border-line bg-surface text-sm font-semibold text-ink transition-colors duration-fast ease-out hover:border-line-strong"
      >
        {initialOf(user.fullName)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration('fast'), ease: ease('out') }}
            className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="truncate text-base font-medium text-ink">{user.fullName}</p>
              <p className="truncate text-sm text-ink-muted">{user.email}</p>
            </div>

            <Link
              href="/how-to-use"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-base text-ink transition-colors duration-fast ease-out hover:bg-surface-sunken"
            >
              How to use this
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => void signOut()}
              className="block w-full px-4 py-3 text-left text-base text-danger transition-colors duration-fast ease-out hover:bg-danger-subtle"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function initialOf(fullName: string): string {
  const first = fullName.trim().charAt(0);
  return first ? first.toUpperCase() : '?';
}
