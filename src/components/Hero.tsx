import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Barbell,
  ChartLineUp,
  Heartbeat,
  Pulse,
  ShieldCheck,
} from '@phosphor-icons/react';

const KEY_METRICS = [
  { label: 'Активных атлетов', value: '140+' },
  { label: 'Средний блок', value: '12–16 нед' },
  { label: 'Женщины / Мужчины', value: '48% / 52%' },
  { label: 'Панель биомаркеров', value: '8 показателей' },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-[#05080E]">
      {/* Background Dark-Navy Gradient Atmosphere + Right Editorial Image */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(29,78,216,0.18),transparent_56%)]"
          aria-hidden="true"
        />
        <div className="absolute inset-y-0 right-0 w-full lg:w-[64%]">
          <img
            src="/images/hero-athlete.jpg"
            alt="Атлет в тёмно-синем минималистичном тренировочном зале"
            className="h-full w-full object-cover object-center opacity-55 lg:opacity-80"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#05080E] via-[#05080E]/85 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-transparent to-[#05080E]/70"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 110, damping: 22 }}
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0A1120]/90 px-3.5 py-1.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3B82F6] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3B82F6]" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#CBD5E1]">
                Открыт набор • 4 места на персональное ведение
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.06 }}
              className="text-4xl font-bold tracking-tight text-[#F1F5F9] sm:text-5xl lg:text-6xl lg:leading-[1.06]"
            >
              Системное ведение
              <span className="block text-[#94A3B8]">
                под вашу физиологию и цель
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.12 }}
              className="mt-6 max-w-[60ch] text-base leading-relaxed text-[#94A3B8] sm:text-lg"
            >
              Индивидуальная работа в зале и онлайн-сопровождение для мужчин и женщин.
              Снижение веса без срывов, натуральный набор массы и PRO-трек с контролем
              общего и свободного тестостерона внутри платформы{' '}
              <strong className="font-semibold text-[#CBD5E1]">VECTRA BODY OS</strong>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.18 }}
              className="mt-6 flex flex-wrap gap-2.5"
            >
              <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0A1120]/85 px-3 py-1.5 text-xs font-medium text-[#CBD5E1]">
                <Heartbeat size={15} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
                Похудение и рекомпозиция
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0A1120]/85 px-3 py-1.5 text-xs font-medium text-[#CBD5E1]">
                <Barbell size={15} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
                Натуральный набор
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0A1120]/85 px-3 py-1.5 text-xs font-medium text-[#CBD5E1]">
                <ShieldCheck size={15} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
                PRO / Фарм-сопровождение
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.24 }}
              className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center"
            >
              <Link
                to="/body-os"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#3B82F6] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#2563EB] active:scale-[0.98]"
              >
                <Pulse size={18} weight="regular" aria-hidden="true" />
                <span>Запустить BODY OS</span>
                <ArrowRight size={17} weight="regular" aria-hidden="true" />
              </Link>
              <Link
                to="/directions"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 bg-[#0A1120]/85 px-6 py-3.5 text-sm font-semibold text-[#E2E8F0] backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-[#111C30] active:scale-[0.98]"
              >
                <span>Направления и калькулятор</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Floating BODY OS Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 24, delay: 0.28 }}
            className="hidden lg:col-span-5 lg:block"
          >
            <div className="ml-auto max-w-sm rounded-2xl border border-white/12 bg-[#0A1120]/85 p-5 backdrop-blur-md shadow-[0_24px_48px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#F1F5F9]">
                  <ChartLineUp size={16} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
                  <span>VECTRA BODY OS</span>
                </div>
                <span className="rounded border border-[#3B82F6]/35 bg-[#182742] px-2 py-0.5 font-mono text-[10px] text-[#93C5FD]">
                  В ТАРИФЕ
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Прогноз веса и LBM на 16 нед.</span>
                  <span className="font-mono font-semibold text-[#F1F5F9] tabular-nums">Симулятор</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Т общ / Т своб / E2 / Гематокрит</span>
                  <span className="font-mono font-semibold text-emerald-300 tabular-nums">8 маркеров</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Еженедельная коррекция КБЖУ</span>
                  <span className="font-mono font-semibold text-[#93C5FD] tabular-nums">АВТО + ТРЕНЕР</span>
                </div>
              </div>

              <Link
                to="/body-os"
                className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-[#05080E]/85 px-3.5 py-2.5 text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#3B82F6] hover:text-white"
              >
                <span>Открыть интерактивный расчёт</span>
                <ArrowRight size={14} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Technical Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.3 }}
          className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4 lg:mt-16"
        >
          {KEY_METRICS.map((item) => (
            <div key={item.label}>
              <div className="font-mono text-xl font-semibold tracking-tight text-[#F1F5F9] tabular-nums sm:text-2xl">
                {item.value}
              </div>
              <div className="mt-1 text-xs font-medium text-[#94A3B8] sm:text-sm">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
