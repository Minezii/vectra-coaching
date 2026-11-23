import { METHODOLOGY_STEPS } from '../data/coachingData';

export function MethodologySection() {
  return (
    <section id="methodology" className="scroll-mt-20 border-t border-white/[0.08] bg-[#05080E] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Sticky Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
                04 / Система работы
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
                Никаких шаблонных PDF-программ
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#94A3B8]">
                Результат строится на обратной связи: мы измеряем отклик вашего организма
                каждую неделю и вносим точечные правки в тренировочный объём, калорийность
                и восстановление.
              </p>
              <div className="mt-8 rounded-xl border border-white/10 bg-[#0B1220] p-5">
                <div className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                  Принцип работы
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                  Вы тренируетесь в своём темпе и городе или лично в зале, а вся
                  аналитика, прогрессия весов и корректировка питания находятся под
                  ежедневным контролем тренера.
                </p>
              </div>
            </div>
          </div>

          {/* Right Timeline List separated by hairline dividers */}
          <div className="divide-y divide-white/10 border-t border-b border-white/10 lg:col-span-7">
            {METHODOLOGY_STEPS.map((step) => (
              <div key={step.number} className="py-8 first:pt-2 last:pb-2 sm:py-9">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-[#3B82F6] tabular-nums">
                    ЭТАП {step.number}
                  </span>
                  <span className="rounded border border-white/10 bg-[#0B1220] px-2.5 py-1 font-mono text-xs text-[#94A3B8]">
                    {step.duration}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-[#F1F5F9]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                  {step.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-[#CBD5E1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                  <span>Результат этапа: {step.deliverable}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
