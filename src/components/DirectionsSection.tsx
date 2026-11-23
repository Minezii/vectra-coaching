import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  ShieldCheck,
  User,
  Users,
  WarningCircle,
  Pulse,
} from '@phosphor-icons/react';
import { DIRECTIONS, GenderId, TrackId } from '../data/coachingData';

export function DirectionsSection() {
  const [activeTrack, setActiveTrack] = useState<TrackId>('fat-loss');
  const [activeGender, setActiveGender] = useState<GenderId>('men');

  const currentDirection =
    DIRECTIONS.find((item) => item.id === activeTrack) ?? DIRECTIONS[0];
  const currentProfile = currentDirection.profiles[activeGender];

  const imageSrc =
    activeGender === 'women'
      ? '/images/track-women.jpg'
      : '/images/track-strength.jpg';

  const imageAlt =
    activeGender === 'women'
      ? 'Женский силовой и функциональный тренинг в тёмном зале'
      : 'Штанга и силовое оборудование в тёмно-синем минималистичном зале';

  return (
    <section id="directions" className="scroll-mt-20 border-t border-white/[0.08] bg-[#05080E] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header + Track Tabs */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
              02 / Направления работы
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              Три сценария — единая точность контроля
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
              Выберите цель и пол, чтобы увидеть структуру тренировок, логику питания
              и ключевые маркеры, которые мы отслеживаем каждую неделю.
            </p>
          </div>

          {/* Track Segmented Control */}
          <div
            role="tablist"
            aria-label="Выбор направления"
            className="inline-flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0B1220] p-1.5"
          >
            {DIRECTIONS.map((dir) => {
              const isSelected = dir.id === activeTrack;
              return (
                <button
                  key={dir.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTrack(dir.id)}
                  className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isSelected ? 'text-white' : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="direction-pill"
                      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                      className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#182742] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    />
                  )}
                  <span className="relative z-10">{dir.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Asymmetric 12-Column Detail Canvas */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left 7 Cols: Track Content + Gender Switch */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8 lg:col-span-7">
            <div>
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-2xl font-bold tracking-tight text-[#F1F5F9]">
                      {currentDirection.title}
                    </h3>
                    {currentDirection.isEnhanced && (
                      <span className="rounded border border-[#3B82F6]/40 bg-[#182742] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-[#93C5FD]">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    {currentDirection.subtitle}
                  </p>
                </div>

                {/* Men / Women Toggle */}
                <div
                  role="group"
                  aria-label="Физиология атлета"
                  className="inline-flex shrink-0 rounded-lg border border-white/10 bg-[#06090F] p-1"
                >
                  <button
                    type="button"
                    onClick={() => setActiveGender('men')}
                    className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeGender === 'men'
                        ? 'text-white'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {activeGender === 'men' && (
                      <motion.span
                        layoutId="gender-pill"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="absolute inset-0 rounded-md bg-[#1D4ED8]/80"
                      />
                    )}
                    <User size={14} weight="regular" className="relative z-10" aria-hidden="true" />
                    <span className="relative z-10">Мужчины</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGender('women')}
                    className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeGender === 'women'
                        ? 'text-white'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {activeGender === 'women' && (
                      <motion.span
                        layoutId="gender-pill"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="absolute inset-0 rounded-md bg-[#1D4ED8]/80"
                      />
                    )}
                    <Users size={14} weight="regular" className="relative z-10" aria-hidden="true" />
                    <span className="relative z-10">Женщины</span>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTrack}-${activeGender}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 space-y-6"
                >
                  <p className="text-sm leading-relaxed text-[#CBD5E1] sm:text-base">
                    {currentDirection.description}
                  </p>

                  <div>
                    <div className="mb-3 font-mono text-xs uppercase tracking-wider text-[#3B82F6]">
                      {currentProfile.focusTitle}
                    </div>
                    <ul className="space-y-2.5">
                      {currentProfile.focusPoints.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm text-[#E2E8F0]">
                          <CheckCircle
                            size={18}
                            weight="regular"
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-[#3B82F6]"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Split & Nutrition Specifications */}
                  <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.07] bg-[#06090F]/70 p-4">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                        Тренировочный сплит
                      </div>
                      <div className="mt-1.5 text-sm font-medium leading-snug text-[#E2E8F0]">
                        {currentProfile.splitExample}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#06090F]/70 p-4">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                        Вектор питания
                      </div>
                      <div className="mt-1.5 text-sm font-medium leading-snug text-[#E2E8F0]">
                        {currentProfile.nutritionVector}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Medical / Harm-Reduction Notice when Enhanced is selected */}
            {currentDirection.safetyNote && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#3B82F6]/25 bg-[#111C30]/90 p-4">
                <WarningCircle size={20} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0 text-[#3B82F6]" />
                <p className="text-xs leading-relaxed text-[#CBD5E1]">
                  {currentDirection.safetyNote}
                </p>
              </div>
            )}
          </div>

          {/* Right 5 Cols: Editorial Photography + Glass Biomarker Overlay */}
          <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] lg:col-span-5">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover object-center transition-opacity duration-300"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#06090F] via-[#06090F]/45 to-transparent"
              aria-hidden="true"
            />

            {/* Floating Telemetry Panel */}
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/12 bg-[#06090F]/85 p-5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  {currentDirection.isEnhanced ? (
                    <ShieldCheck size={17} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
                  ) : (
                    <Pulse size={17} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
                  )}
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F1F5F9]">
                    Контролируемые метрики
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#64748B]">
                  {activeGender === 'men' ? 'ПРОФИЛЬ М' : 'ПРОФИЛЬ Ж'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {currentProfile.trackedMetrics.map((metric) => (
                  <div
                    key={metric}
                    className="flex items-center gap-2 text-xs text-[#CBD5E1]"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" />
                    <span>{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
