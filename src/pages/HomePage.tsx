import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChartLineUp,
  CreditCard,
  FilmStrip,
  Pulse,
  Sliders,
} from '@phosphor-icons/react';
import { Hero } from '../components/Hero';
import { METHODOLOGY_STEPS } from '../data/coachingData';

const PLATFORM_MODULES = [
  {
    to: '/body-os',
    code: '01 / МОДУЛЬ',
    badge: 'ИНТЕРАКТИВ',
    title: 'VECTRA BODY OS',
    description:
      '16-недельный симулятор массы тела, расчёт КБЖУ и радар 8 биомаркеров крови.',
    cta: 'Запустить модуль',
    icon: Pulse,
    featured: true,
  },
  {
    to: '/directions',
    code: '02 / ПРОТОКОЛЫ',
    title: 'Направления и конструктор',
    description:
      'Похудение, натуральный набор и PRO-трек с подбором сплита и панели анализов.',
    cta: 'Собрать протокол',
    icon: Sliders,
    featured: false,
  },
  {
    to: '/results',
    code: '03 / КЕЙСЫ',
    title: 'Кейсы и динамика',
    description:
      'Реальные трансформации мужчин и женщин в цифрах до и после блока.',
    cta: 'Смотреть кейсы',
    icon: ChartLineUp,
    featured: false,
  },
  {
    to: '/pricing',
    code: '04 / ТАРИФЫ',
    title: 'Тарифы и FAQ',
    description:
      'Онлайн-ведение, PRO-сопровождение с анализами и очная работа в зале.',
    cta: 'Выбрать формат',
    icon: CreditCard,
    featured: false,
  },
] as const;

export function HomePage() {
  return (
    <>
      <Hero />

      {/* Compact Platform Modules Grid */}
      <section className="border-t border-white/[0.08] bg-[#05080E] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
                Модули платформы
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#F1F5F9] sm:text-3xl">
                Рабочие пространства VECTRA
              </h2>
            </div>
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 self-start font-mono text-xs font-semibold uppercase tracking-wider text-[#93C5FD] transition-colors hover:text-white sm:self-auto"
            >
              <span>Перейти к анкете</span>
              <ArrowRight size={14} weight="regular" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.to}
                  to={mod.to}
                  className={`group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                    mod.featured
                      ? 'border-[#3B82F6]/45 bg-[#0A1120] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#3B82F6] hover:bg-[#111C30]'
                      : 'border-white/10 bg-[#0A1120]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#3B82F6]/50 hover:bg-[#111C30]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
                        {mod.code}
                      </span>
                      {'badge' in mod && mod.badge ? (
                        <span className="rounded border border-[#3B82F6]/40 bg-[#182742] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#93C5FD]">
                          {mod.badge}
                        </span>
                      ) : (
                        <Icon
                          size={18}
                          weight="regular"
                          className="text-[#3B82F6]"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2.5">
                      {mod.featured && (
                        <Icon
                          size={18}
                          weight="regular"
                          className="shrink-0 text-[#3B82F6]"
                          aria-hidden="true"
                        />
                      )}
                      <h3 className="text-base font-bold tracking-tight text-[#F1F5F9]">
                        {mod.title}
                      </h3>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[#94A3B8] sm:text-sm">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-3.5 text-xs font-semibold text-[#CBD5E1] transition-colors group-hover:text-white">
                    <span>{mod.cta}</span>
                    <ArrowRight
                      size={15}
                      weight="regular"
                      className="text-[#3B82F6] transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Horizontal Featured Atlas Strip */}
          <Link
            to="/atlas"
            className="group mt-5 flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#0A1120]/90 p-5 transition-all hover:border-[#3B82F6]/50 hover:bg-[#111C30] sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3.5 sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#3B82F6]/35 bg-[#182742] text-[#3B82F6]">
                <FilmStrip size={20} weight="regular" aria-hidden="true" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#3B82F6]">
                    05 / ВИДЕОБИБЛИОТЕКА
                  </span>
                  <h3 className="text-base font-bold text-[#F1F5F9]">
                    Атлас упражнений и техники тренера
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[#94A3B8] sm:text-sm">
                  Детальная разбивка на 7 групп и 25 анатомических зон на 3D-модели (внешнее/внутреннее
                  предплечье, верх/низ широчайших, все 3 пучка груди и дельт) с видео-разборами.
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#93C5FD] transition-colors group-hover:text-white">
              <span>Открыть Атлас</span>
              <ArrowRight
                size={15}
                weight="regular"
                className="text-[#3B82F6] transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>

          {/* Mini App Companion Strip */}
          <Link
            to="/mini-app"
            className="group mt-3.5 flex flex-col justify-between gap-4 rounded-xl border border-[#3B82F6]/35 bg-gradient-to-r from-[#0A1120] to-[#111C30]/80 p-5 transition-all hover:border-[#3B82F6] sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3.5 sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#3B82F6]/45 bg-[#182742] text-[#93C5FD]">
                <Pulse size={20} weight="regular" aria-hidden="true" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#93C5FD]">
                    06 / TELEGRAM MINI APP
                  </span>
                  <h3 className="text-base font-bold text-[#F1F5F9]">
                    Трекер питания, советы и напоминания в зал / на анализы
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[#94A3B8] sm:text-sm">
                  Живой счётчик «Съедено / Осталось», советы по продуктам (красная рыба, клетчатка,
                  крупы) и push-напоминания от @VECTRA_gym_bot.
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#93C5FD] transition-colors group-hover:text-white">
              <span>Открыть Mini App</span>
              <ArrowRight
                size={15}
                weight="regular"
                className="text-[#3B82F6] transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        </div>
      </section>

      {/* Compact 4-Step Workflow Strip */}
      <section className="border-t border-white/[0.08] bg-[#0A1120]/50 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
                Цикл сопровождения
              </span>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#F1F5F9] sm:text-2xl">
                4 этапа без шаблонных PDF-программ
              </h2>
            </div>
            <Link
              to="/body-os"
              className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-[#05080E] px-3.5 py-2 text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#3B82F6] hover:text-white sm:self-auto"
            >
              <span>Начать с диагностики в BODY OS</span>
              <ArrowRight size={14} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {METHODOLOGY_STEPS.map((step) => (
              <div
                key={step.number}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#05080E]/90 p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-[#3B82F6] tabular-nums">
                      ЭТАП {step.number}
                    </span>
                    <span className="rounded border border-white/10 bg-[#111C30] px-2 py-0.5 font-mono text-[11px] text-[#94A3B8]">
                      {step.duration}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold leading-snug text-[#F1F5F9]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#94A3B8]">
                    {step.description}
                  </p>
                </div>
                <div className="mt-3.5 border-t border-white/[0.06] pt-2.5 font-mono text-[11px] text-[#CBD5E1]">
                  {step.deliverable}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
