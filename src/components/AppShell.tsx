import { ReactNode, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, List, X } from '@phosphor-icons/react';
import { Footer } from './Footer';

const NAV_ITEMS = [
  { to: '/', label: 'Обзор', end: true },
  { to: '/body-os', label: 'BODY OS', hasPulse: true },
  { to: '/atlas', label: 'Атлас' },
  { to: '/directions', label: 'Направления' },
  { to: '/results', label: 'Кейсы' },
  { to: '/pricing', label: 'Тарифы' },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[#05080E] text-[#F1F5F9]">
      {/* Subtle fixed micro-grain texture overlay (pointer-events-none, zero scroll repaint cost) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.6) 0.5px, transparent 0.5px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Top Application Header */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.08] bg-[#05080E]/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center gap-3 rounded-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0A1120] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-200 group-hover:-translate-y-[1px]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 5L12 19L20 5"
                  stroke="#F1F5F9"
                  strokeWidth="2.2"
                  strokeLinecap="square"
                />
                <path
                  d="M9 5L12 10.5L15 5"
                  stroke="#3B82F6"
                  strokeWidth="2.2"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-extrabold tracking-[0.18em] text-[#F1F5F9]">
                VECTRA
              </span>
              <span className="mt-0.5 font-mono text-[10px] tracking-widest text-[#94A3B8]">
                ATHLETIC OS
              </span>
            </div>
          </Link>

          {/* Desktop Platform Tabs */}
          <nav
            className="hidden items-center gap-1 rounded-xl border border-white/[0.08] bg-[#0A1120]/90 p-1 lg:flex"
            aria-label="Навигация по платформе"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : item.hasPulse
                      ? 'font-mono text-xs font-semibold tracking-wider text-[#93C5FD] hover:text-white'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="top-nav-active"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#182742]"
                      />
                    )}
                    {item.hasPulse && (
                      <span className="relative z-10 flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3B82F6] opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3B82F6]" />
                      </span>
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/apply"
              className="hidden items-center gap-2 rounded-lg border border-[#3B82F6]/40 bg-[#111C30] px-4 py-2 text-sm font-semibold text-[#F1F5F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-[#3B82F6] hover:bg-[#182742] active:scale-[0.98] sm:inline-flex"
            >
              <span>Подать заявку</span>
              <ArrowUpRight size={16} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-[#0A1120] text-[#F1F5F9] transition-colors hover:bg-[#111C30] lg:hidden"
              aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={20} weight="regular" aria-hidden="true" />
              ) : (
                <List size={20} weight="regular" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#05080E]/95 px-4 pb-6 pt-4 backdrop-blur-lg lg:hidden">
            <nav className="flex flex-col gap-1.5" aria-label="Мобильная навигация">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-base font-medium transition-colors ${
                      isActive
                        ? 'border-[#3B82F6]/40 bg-[#182742] text-white'
                        : 'border-transparent text-[#CBD5E1] hover:border-white/10 hover:bg-[#0A1120] hover:text-white'
                    }`
                  }
                >
                  {item.hasPulse && (
                    <span className="h-2 w-2 rounded-full bg-[#3B82F6]" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <Link
                to="/apply"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              >
                <span>Подать заявку</span>
                <ArrowUpRight size={16} weight="regular" aria-hidden="true" />
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
