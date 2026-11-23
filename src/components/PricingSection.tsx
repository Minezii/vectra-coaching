import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck } from '@phosphor-icons/react';
import { FormatId, TARIFFS, TariffPlan, TrackId } from '../data/coachingData';

interface PricingSectionProps {
  onSelectTariff: (params: { format: FormatId; goal?: TrackId }) => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function PricingSection({ onSelectTariff }: PricingSectionProps) {
  const [billing, setBilling] = useState<'monthly' | 'quarterly'>('monthly');

  const handleChoose = (plan: TariffPlan) => {
    onSelectTariff({
      format: plan.format,
      goal: plan.goalHint,
    });
  };

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-white/[0.08] bg-[#05080E] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
              06 / Тарифы ведения
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              Прозрачные форматы сопровождения
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
              Выберите онлайн-ведение, углублённый PRO-контроль с анализами крови
              или очные персональные тренировки в зале.
            </p>
          </div>

          {/* Billing Period Switch */}
          <div className="inline-flex items-center gap-1.5 self-start rounded-xl border border-white/10 bg-[#0B1220] p-1.5 lg:self-auto">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                billing === 'monthly' ? 'text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {billing === 'monthly' && (
                <motion.span
                  layoutId="billing-pill"
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#182742]"
                />
              )}
              <span className="relative z-10">1 месяц</span>
            </button>
            <button
              type="button"
              onClick={() => setBilling('quarterly')}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                billing === 'quarterly' ? 'text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {billing === 'quarterly' && (
                <motion.span
                  layoutId="billing-pill"
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#182742]"
                />
              )}
              <span className="relative z-10">3 месяца</span>
              <span className="relative z-10 rounded bg-[#3B82F6]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#93C5FD]">
                -10%
              </span>
            </button>
          </div>
        </div>

        {/* Asymmetric Layout: Featured PRO Card Left (7 cols on lg? No, let's do 2 stacked standard on left 5 cols and Featured PRO 7 cols, or 12-col asymmetric grid so it avoids 3-equal-cards AI cliché!) */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Featured PRO Plan (5 cols, prominent dark navy refraction) */}
          {(() => {
            const pro = TARIFFS.find((t) => t.highlighted)!;
            const proPrice = billing === 'monthly' ? pro.monthlyPrice : pro.quarterlyPrice;
            return (
              <div className="flex flex-col justify-between rounded-2xl border border-[#3B82F6]/45 bg-gradient-to-b from-[#111C30] to-[#0B1220] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-9 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#3B82F6]/40 bg-[#182742] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#93C5FD]">
                      <ShieldCheck size={14} weight="regular" aria-hidden="true" />
                      {pro.badge}
                    </span>
                    <span className="font-mono text-xs text-[#64748B]">PRO ТРЕК</span>
                  </div>

                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">
                    {pro.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                    {pro.description}
                  </p>

                  <div className="mt-6 border-y border-white/10 py-5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl">
                        {formatPrice(proPrice)} ₽
                      </span>
                      <span className="text-sm text-[#94A3B8]">
                        / {billing === 'monthly' ? 'месяц' : '3 месяца'}
                      </span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {pro.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-[#E2E8F0]">
                        <Check size={17} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0 text-[#3B82F6]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleChoose(pro)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] active:scale-[0.98]"
                >
                  <span>Выбрать PRO-ведение</span>
                  <ArrowRight size={17} weight="regular" aria-hidden="true" />
                </button>
              </div>
            );
          })()}

          {/* Standard & In-Person Plans stacked cleanly in 7 cols */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {TARIFFS.filter((t) => !t.highlighted).map((plan) => {
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.quarterlyPrice;
              return (
                <div
                  key={plan.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start">
                    <div className="max-w-md">
                      <h3 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
                        {plan.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-[#94A3B8]">
                        {plan.description}
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <div className="font-mono text-2xl font-bold text-white tabular-nums sm:text-3xl">
                        {formatPrice(price)} ₽
                      </div>
                      <div className="text-xs text-[#64748B]">
                        за {billing === 'monthly' ? '1 месяц' : '3 месяца'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
                        <Check size={16} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0 text-[#3B82F6]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleChoose(plan)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#111C30] px-5 py-3 text-sm font-semibold text-[#F1F5F9] transition-colors hover:border-[#3B82F6] hover:bg-[#182742] active:scale-[0.98] sm:w-auto"
                    >
                      <span>Выбрать этот формат</span>
                      <ArrowRight size={16} weight="regular" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
