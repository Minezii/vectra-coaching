import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, PaperPlaneTilt } from '@phosphor-icons/react';
import { FAQ_ITEMS } from '../data/coachingData';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="scroll-mt-20 border-t border-white/[0.08] bg-[#0A1120]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
              07 / Вопросы и ответы
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              Частые вопросы перед стартом
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#94A3B8]">
              Если у вас специфическая ситуация с травмами, графиком смен или нестандартной
              панелью анализов — напишите напрямую в Telegram до заполнения анкеты.
            </p>
            <a
              href="https://t.me/VECTRA_gym_bot"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[#06090F] px-4 py-2.5 text-sm font-semibold text-[#E2E8F0] transition-colors hover:border-[#3B82F6] hover:bg-[#111C30]"
            >
              <PaperPlaneTilt size={16} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
              <span>Написать боту @VECTRA_gym_bot</span>
            </a>
          </div>

          {/* Right Accordion */}
          <div className="divide-y divide-white/10 border-t border-b border-white/10 lg:col-span-7">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className="py-5">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 text-left focus:outline-none"
                  >
                    <span className="text-base font-semibold text-[#F1F5F9] sm:text-lg">
                      {item.question}
                    </span>
                    <CaretDown
                      size={18}
                      weight="regular"
                      aria-hidden="true"
                      className={`shrink-0 text-[#94A3B8] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#3B82F6]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 pr-8 text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
