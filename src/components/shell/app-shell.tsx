'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { NavPills, NotificationBell, type NavItem } from '@/components/ui';
import { HelpLink } from './help-link';
import { AccountMenu } from './account-menu';

/**
 * Ordered by how often it is opened, not by the order things were built.
 *
 * Dashboard first because it is the answer to "is anything waiting on me",
 * which is why the Client came. How to Use is not here — it is the `?` in the
 * header, which is where people look for help, and it kept the nav at five.
 */
const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'applications', label: 'Applications', href: '/applications' },
  { key: 'profile', label: 'Profile', href: '/profile' },
  { key: 'sites', label: 'Sites', href: '/sites' },
  { key: 'assistants', label: 'Assistants', href: '/assistants' },
  { key: 'settings', label: 'Settings', href: '/settings' },
];

/**
 * The Client workspace chrome.
 *
 * The nav pill is a shared element across routes — `layoutId` is what makes it
 * travel between items rather than fade. On phones the same nav moves to a
 * bottom bar, keeping the treatment and the muscle memory.
 */
export function AppShell({
  children,
  unreadCount = 0,
}: {
  children: ReactNode;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const activeKey =
    NAV.find((item) => pathname.startsWith(item.href))?.key ?? NAV[0].key;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-app items-center justify-between gap-6 px-4 md:px-8">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-pill bg-accent"
            />
            <span className="font-display text-lg font-bold text-ink">
              Job Application Assistant
            </span>
          </Link>

          {/* Horizontal on desktop; the bottom bar below takes over on phones. */}
          <NavPills
            items={NAV}
            activeKey={activeKey}
            className="hidden lg:flex"
          />

          <div className="flex shrink-0 items-center gap-3">
            <HelpLink />
            <NotificationBell count={unreadCount} />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-app flex-1 px-4 pb-28 pt-10 md:px-8 lg:pb-16">
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-2 py-2 lg:hidden"
      >
        <NavPills
          items={NAV}
          activeKey={activeKey}
          layoutId="nav-pill-mobile"
          className="justify-between overflow-x-auto"
        />
      </nav>
    </div>
  );
}
