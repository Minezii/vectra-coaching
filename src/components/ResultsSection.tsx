import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartLineUp, ArrowRight } from '@phosphor-icons/react';
import { CASE_STUDIES, TrackId } from '../data/coachingData';

type FilterId = 'all' | TrackId;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Все кейсы' },
  { id: 'fat-loss', label: 'Похудение' },
  { id: 'natural-mass', label: 'Натуральный набор' },
  { id: 'enhanced', label: 'Фарм-поддержка' },
];

export function ResultsSection() {
  const [filter, setFilter] = useState<FilterId>('all');

  const filteredCases =
    filter === 'all'
      ? CASE_STUDIES
      : CASE_STUDIES.filter((item) => item.track === filter);

  return (
    <section id="results" className="scroll-mt-20 border-t border-white/[0.08] bg-[#0A1120]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
              05 / Кейсы и метрики
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              Прогресс в цифрах до и после блока
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
              Реальные протоколы мужчин и женщин с разным опытом, типом нагрузки и
              уровнем подготовки.
            </p>
          </div>

          {/* Filter Pills */}
          <div
            role="tablist"
            aria-label="Фильтр кейсов"
            className="inline-flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#06090F] p-1.5"
          >
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={`relative rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    active ? 'text-white' : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="cases-filter-pill"
                      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                      className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#182742]"
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Asymmetric Bento Grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredCases.map((c, idx) => {
              const isWide = filter === 'all' && idx === 0;
              return (
                <motion.article
                  layout
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                  className={`flex flex-col justify-between rounded-2xl border border-white/10 bg-[#06090F] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8 ${
                    isWide ? 'md:col-span-2' : ''
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-bold text-[#F1F5F9]">
                            {c.name}
                          </h3>
                          <span className="rounded border border-white/10 bg-[#0B1220] px-2 py-0.5 font-mono text-[11px] text-[#94A3B8]">
                            {c.gender === 'men' ? 'Мужчина' : 'Женщина'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#64748B]">
                          {c.protocolSummary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#3B82F6]/30 bg-[#111C30] px-2.5 py-1 font-mono text-xs font-medium text-[#93C5FD]">
                          {c.trackLabel}
                        </span>
                        <span className="rounded-md border border-white/10 bg-[#0B1220] px-2.5 py-1 font-mono text-xs text-[#CBD5E1] tabular-nums">
                          {c.duration}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2.5">
                      <ChartLineUp size={20} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
                      <div className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {c.headlineResult}
                      </div>
                    </div>

                    {/* Metrics Before / After */}
                    <div
                      className={`mt-6 grid grid-cols-1 gap-3 ${
                        isWide ? 'sm:grid-cols-3' : 'sm:grid-cols-3'
                      }`}
                    >
                      {c.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl border border-white/[0.07] bg-[#0B1220]/80 p-3.5"
                        >
                          <div className="text-xs text-[#64748B]">{m.label}</div>
                          <div className="mt-1.5 flex items-center gap-2 font-mono text-sm tabular-nums">
                            <span className="text-[#94A3B8]">{m.before}</span>
                            <ArrowRight size={13} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
                            <span className="font-semibold text-[#F1F5F9]">{m.after}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <blockquote className="mt-6 border-l-2 border-[#3B82F6]/60 pl-4 text-sm leading-relaxed text-[#CBD5E1]">
                    «{c.quote}»
                  </blockquote>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
