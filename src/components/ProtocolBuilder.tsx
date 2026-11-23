import { useState } from 'react';
import { ArrowRight, Sliders, Check } from '@phosphor-icons/react';
import {
  ExperienceId,
  FormatId,
  GenderId,
  TrackId,
} from '../data/coachingData';

export interface SelectedProtocol {
  gender: GenderId;
  goal: TrackId;
  format: FormatId;
  diagnosticNote?: string;
}

interface ProtocolBuilderProps {
  onApplyProtocol: (protocol: SelectedProtocol) => void;
}

const GENDER_OPTIONS: { id: GenderId; label: string }[] = [
  { id: 'men', label: 'Мужчина' },
  { id: 'women', label: 'Женщина' },
];

const GOAL_OPTIONS: { id: TrackId; label: string }[] = [
  { id: 'fat-loss', label: 'Похудение и рекомпозиция' },
  { id: 'natural-mass', label: 'Натуральный набор' },
  { id: 'enhanced', label: 'Фарм-сопровождение (PRO)' },
];

const FORMAT_OPTIONS: { id: FormatId; label: string }[] = [
  { id: 'online', label: 'Онлайн-ведение' },
  { id: 'in-person', label: 'Персонально в зале' },
];

const EXPERIENCE_OPTIONS: { id: ExperienceId; label: string }[] = [
  { id: 'beginner', label: 'До 1 года' },
  { id: 'intermediate', label: '1–3 года' },
  { id: 'advanced', label: 'Более 3 лет' },
];

function computeBlueprint(
  gender: GenderId,
  goal: TrackId,
  format: FormatId,
  experience: ExperienceId
) {
  let split = 'Верх / Низ — 4 тренировки в неделю';
  if (experience === 'beginner') {
    split = gender === 'women'
      ? 'Full-Body с акцентом на ягодицы и спину — 3 раза в неделю'
      : 'Full-Body базовый каркас — 3 раза в неделю';
  } else if (goal === 'enhanced') {
    split = '5-дневный специализированный сплит с акцентом на отстающие группы';
  } else if (gender === 'women' && goal === 'fat-loss') {
    split = 'Низ / Верх / Ягодицы и кор — 3–4 тренировки + 9 500 шагов';
  } else if (goal === 'natural-mass') {
    split = experience === 'advanced'
      ? 'Тяни / Толкай / Ноги + Верх — 4–5 тренировок (RIR 1–2)'
      : 'Верх / Низ с прогрессией рабочих весов — 4 раза в неделю';
  }

  let calories = 'Поддержка / мягкий дефицит -15%';
  if (goal === 'fat-loss') {
    calories =
      gender === 'men'
        ? 'Дефицит 15–20% от TDEE • Белок 2.1 г/кг • Рефиды каждые 10–14 дней'
        : 'Дефицит 12–16% от TDEE • Белок 1.8 г/кг • Адаптация под цикл';
  } else if (goal === 'natural-mass') {
    calories =
      gender === 'men'
        ? 'Профицит +250 ккал • Белок 2.0 г/кг • Прибавка 0.3–0.4% веса/нед'
        : 'Профицит +180 ккал • Белок 1.8 г/кг • Рост силы без лишнего жира';
  } else {
    calories =
      'Высокобелковый профицит или точечная сушка • Белок 2.3 г/кг • Контроль липидов и натрия';
  }

  const checkInFrequency =
    goal === 'enhanced'
      ? 'Отчёт каждые 7 дней + разбор анализов крови каждые 3–4 недели'
      : 'Отчёт каждые 7 дней + видеоразбор техники в Telegram';

  const bloodPanel =
    goal === 'enhanced'
      ? 'ОАК (гематокрит), АЛТ/АСТ, липидограмма, эстрадиол, пролактин, тестостерон, ПСА/ТТГ, контроль АД'
      : experience === 'beginner'
      ? 'Базовый чек-ап: ОАК, ферритин, витамин D, ТТГ, глюкоза натощак'
      : 'ОАК, ТТГ, витамин D, липидный профиль и глюкоза для точной настройки восстановления';

  let recommendedTariff = 'Онлайн-ведение (14 900 ₽/мес)';
  if (format === 'in-person') {
    recommendedTariff = 'Индивидуально в зале + онлайн (36 000 ₽/мес)';
  } else if (goal === 'enhanced') {
    recommendedTariff = 'PRO / Фарм-сопровождение (24 900 ₽/мес)';
  }

  return {
    split,
    calories,
    checkInFrequency,
    bloodPanel,
    recommendedTariff,
  };
}

export function ProtocolBuilder({ onApplyProtocol }: ProtocolBuilderProps) {
  const [gender, setGender] = useState<GenderId>('men');
  const [goal, setGoal] = useState<TrackId>('fat-loss');
  const [format, setFormat] = useState<FormatId>('online');
  const [experience, setExperience] = useState<ExperienceId>('intermediate');

  const blueprint = computeBlueprint(gender, goal, format, experience);

  const handleApply = () => {
    onApplyProtocol({ gender, goal, format });
  };

  return (
    <section id="builder" className="scroll-mt-20 border-t border-white/[0.08] bg-[#0A1120]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
            03 / Конструктор протокола
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
            Предварительная конфигурация вашей программы
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
            Задайте исходные параметры — система сразу сформирует базовую архитектуру
            нагрузки, питания и рекомендуемого медицинского чек-апа.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Column (6 cols) */}
          <div className="space-y-6 rounded-2xl border border-white/10 bg-[#06090F] p-6 sm:p-8 lg:col-span-6">
            {/* Gender */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                1. Пол атлета
              </label>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGender(opt.id)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-all ${
                      gender === opt.id
                        ? 'border-[#3B82F6] bg-[#111C30] text-white'
                        : 'border-white/10 bg-[#0B1220] text-[#94A3B8] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                2. Ключевая задача
              </label>
              <div className="mt-2.5 flex flex-col gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGoal(opt.id)}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-all ${
                      goal === opt.id
                        ? 'border-[#3B82F6] bg-[#111C30] text-white'
                        : 'border-white/10 bg-[#0B1220] text-[#94A3B8] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {goal === opt.id && (
                      <Check size={16} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                3. Формат работы
              </label>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-all ${
                      format === opt.id
                        ? 'border-[#3B82F6] bg-[#111C30] text-white'
                        : 'border-white/10 bg-[#0B1220] text-[#94A3B8] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                4. Тренировочный стаж
              </label>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExperience(opt.id)}
                    className={`rounded-lg border px-3 py-2.5 text-center text-xs font-semibold transition-all sm:text-sm ${
                      experience === opt.id
                        ? 'border-[#3B82F6] bg-[#111C30] text-white'
                        : 'border-white/10 bg-[#0B1220] text-[#94A3B8] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output Blueprint Column (6 cols) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#3B82F6]/30 bg-[#0B1220] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8 lg:col-span-6">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Sliders size={18} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#F1F5F9]">
                    Проект протокола
                  </span>
                </div>
                <span className="rounded bg-[#182742] px-2.5 py-1 font-mono text-[11px] text-[#93C5FD]">
                  {gender === 'men' ? 'М' : 'Ж'} • {format === 'online' ? 'ОНЛАЙН' : 'ЗАЛ'}
                </span>
              </div>

              <div className="mt-6 space-y-5 divide-y divide-white/[0.08]">
                <div className="pt-1">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                    Рекомендуемый сплит
                  </div>
                  <div className="mt-1 text-base font-semibold text-[#F1F5F9]">
                    {blueprint.split}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                    Нутритивная стратегия
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
                    {blueprint.calories}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                    Регламент контроля
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
                    {blueprint.checkInFrequency}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                    Панель биомаркеров / чек-ап
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
                    {blueprint.bloodPanel}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                    Оптимальный тариф
                  </div>
                  <div className="mt-1 font-mono text-base font-semibold text-[#93C5FD]">
                    {blueprint.recommendedTariff}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={handleApply}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#3B82F6] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#2563EB] active:scale-[0.98]"
              >
                <span>Перенести в заявку</span>
                <ArrowRight size={17} weight="regular" aria-hidden="true" />
              </button>
              <p className="mt-2.5 text-center text-xs text-[#64748B]">
                Выбранные параметры автоматически подставятся в анкету ниже
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
