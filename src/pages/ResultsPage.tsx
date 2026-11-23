import { Link } from 'react-router-dom';
import { ArrowRight, Pulse } from '@phosphor-icons/react';
import { ResultsSection } from '../components/ResultsSection';

export function ResultsPage() {
  return (
    <>
      <ResultsSection />

      <section className="border-t border-white/[0.08] bg-[#05080E] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-[#0A1120] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
                Следующий шаг
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#F1F5F9]">
                Смоделируйте свой 16-недельный блок или оставьте заявку
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                Рассчитайте прогноз композиции тела в VECTRA BODY OS и прикрепите
                цифры напрямую к анкете на стартовый разбор.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/body-os"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#3B82F6]/40 bg-[#111C30] px-5 py-3 text-sm font-semibold text-[#F1F5F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:border-[#3B82F6] hover:bg-[#182742] active:scale-[0.98]"
              >
                <Pulse size={17} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
                <span>Запустить BODY OS</span>
              </Link>

              <Link
                to="/apply"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] active:scale-[0.98]"
              >
                <span>Подать заявку</span>
                <ArrowRight size={17} weight="regular" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
