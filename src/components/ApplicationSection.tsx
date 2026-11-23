import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowCounterClockwise,
  ArrowUpRight,
  CheckCircle,
  PaperPlaneTilt,
  Pulse,
  WarningCircle,
} from '@phosphor-icons/react';
import { FormatId, GenderId, TrackId } from '../data/coachingData';
import { SelectedProtocol } from './ProtocolBuilder';

interface ApplicationSectionProps {
  selectedProtocol: SelectedProtocol | null;
}

const GOAL_LABELS: Record<TrackId, string> = {
  'fat-loss': 'Похудение и рекомпозиция',
  'natural-mass': 'Натуральный набор массы',
  enhanced: 'Фарм-сопровождение (PRO)',
};

const GENDER_LABELS: Record<GenderId, string> = {
  men: 'Мужчина',
  women: 'Женщина',
};

const FORMAT_LABELS: Record<FormatId, string> = {
  online: 'Онлайн-ведение',
  'in-person': 'Персонально в зале + онлайн',
};

export function ApplicationSection({ selectedProtocol }: ApplicationSectionProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState<GenderId>('men');
  const [goal, setGoal] = useState<TrackId>('fat-loss');
  const [format, setFormat] = useState<FormatId>('online');
  const [comment, setComment] = useState('');
  const [hasDiagnosticImport, setHasDiagnosticImport] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedLeadId, setSubmittedLeadId] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProtocol) {
      setGender(selectedProtocol.gender);
      setGoal(selectedProtocol.goal);
      setFormat(selectedProtocol.format);
      if (selectedProtocol.diagnosticNote) {
        setComment(selectedProtocol.diagnosticNote);
        setHasDiagnosticImport(true);
      }
      if (status === 'submitted') {
        setStatus('idle');
        setSubmittedLeadId(null);
      }
    }
  }, [selectedProtocol]);

  const validate = () => {
    const nextErrors: { name?: string; contact?: string } = {};
    if (name.trim().length < 2) {
      nextErrors.name = 'Укажите ваше имя (минимум 2 символа)';
    }
    if (contact.trim().length < 3) {
      nextErrors.contact = 'Укажите @username в Telegram или номер телефона для связи';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      window.setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 0);
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          gender,
          goal,
          format,
          comment: comment.trim() || undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; leadId?: number; error?: string }
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Сервер временно недоступен');
      }

      setSubmittedLeadId(data.leadId ?? null);
      setStatus('submitted');
    } catch (err) {
      setStatus('idle');
      setSubmitError(
        err instanceof Error
          ? `${err.message}. Вы также можете оформить заявку напрямую в Telegram-боте @VECTRA_gym_bot.`
          : 'Не удалось отправить заявку на сервер. Вы можете оформить её напрямую в @VECTRA_gym_bot.'
      );
    }
  };

  const handleReset = () => {
    setName('');
    setContact('');
    setComment('');
    setHasDiagnosticImport(false);
    setErrors({});
    setSubmitError(null);
    setSubmittedLeadId(null);
    setStatus('idle');
  };

  const hasErrors = Boolean(errors.name || errors.contact);

  return (
    <section
      id="apply"
      className="scroll-mt-20 border-t border-white/[0.08] bg-[#05080E] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Context Column */}
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
              08 / Заявка на ведение
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              Начать работу с разбора вашей ситуации
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#94A3B8]">
              Заполните короткую анкету — заявка сразу прилетит тренеру в Telegram-админку.
              Либо пройдите интерактивный разбор прямо внутри нашего Telegram-бота.
            </p>

            <div className="mt-6">
              <a
                href="https://t.me/VECTRA_gym_bot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#3B82F6]/40 bg-[#0A1120] px-4 py-2.5 text-sm font-semibold text-[#93C5FD] transition-colors hover:border-[#3B82F6] hover:bg-[#111C30] hover:text-white"
              >
                <PaperPlaneTilt size={16} weight="regular" aria-hidden="true" />
                <span>Открыть бота @VECTRA_gym_bot</span>
                <ArrowUpRight size={15} weight="regular" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" aria-hidden="true" />
                <div className="text-sm text-[#CBD5E1]">
                  После старта вы получаете постоянный доступ к личному кабинету{' '}
                  <strong className="font-semibold text-white">VECTRA BODY OS</strong> с вашими графиками и анализами.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" aria-hidden="true" />
                <div className="text-sm text-[#CBD5E1]">
                  Полная конфиденциальность анкеты, фотофиксации и результатов лабораторных анализов.
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="rounded-2xl border border-white/10 bg-[#0A1120] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8 lg:col-span-7">
            {status === 'submitted' ? (
              <div className="py-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#3B82F6]/40 bg-[#182742] text-[#3B82F6]">
                  <CheckCircle size={26} weight="regular" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-white">
                  {submittedLeadId
                    ? `Заявка #${submittedLeadId} принята и отправлена тренеру`
                    : 'Заявка сформирована и принята'}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                  Данные мгновенно переданы в Telegram-админку. Мы свяжемся с вами по контакту{' '}
                  <span className="font-mono text-[#E2E8F0]">{contact}</span> для назначения
                  стартовой консультации и настройки вашего VECTRA BODY OS.
                </p>

                <div className="mt-6 rounded-xl border border-white/10 bg-[#05080E] p-5">
                  <div className="font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                    Зафиксированные параметры
                  </div>
                  <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[#94A3B8]">Атлет</dt>
                      <dd className="font-medium text-[#F1F5F9]">
                        {name} ({GENDER_LABELS[gender]})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#94A3B8]">Формат</dt>
                      <dd className="font-medium text-[#F1F5F9]">{FORMAT_LABELS[format]}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[#94A3B8]">Направление</dt>
                      <dd className="font-medium text-[#93C5FD]">{GOAL_LABELS[goal]}</dd>
                    </div>
                    {comment.trim() && (
                      <div className="sm:col-span-2">
                        <dt className="text-[#94A3B8]">Досье / расчёт</dt>
                        <dd className="mt-1 font-mono text-xs leading-relaxed text-[#CBD5E1]">
                          {comment}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://t.me/VECTRA_gym_bot"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
                  >
                    <PaperPlaneTilt size={16} weight="regular" aria-hidden="true" />
                    <span>Перейти в @VECTRA_gym_bot</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#111C30] px-4 py-2.5 text-sm font-semibold text-[#E2E8F0] transition-colors hover:border-[#3B82F6] hover:bg-[#182742]"
                  >
                    <ArrowCounterClockwise size={16} weight="regular" aria-hidden="true" />
                    <span>Отправить ещё одну заявку</span>
                  </button>
                </div>
              </div>
            ) : status === 'submitting' ? (
              <div className="space-y-5 py-6" aria-live="polite" aria-busy="true">
                <div className="font-mono text-xs uppercase tracking-wider text-[#3B82F6]">
                  Отправка заявки в Telegram-админку...
                </div>
                <div className="h-11 w-full animate-pulse rounded-lg bg-[#111C30]" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-11 animate-pulse rounded-lg bg-[#111C30]" />
                  <div className="h-11 animate-pulse rounded-lg bg-[#111C30]" />
                </div>
                <div className="h-24 w-full animate-pulse rounded-lg bg-[#111C30]" />
                <div className="h-12 w-full animate-pulse rounded-lg bg-[#182742]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Network / Server Error Banner */}
                {submitError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-500/45 bg-rose-950/30 p-4 text-xs leading-relaxed text-rose-200 sm:text-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <WarningCircle size={18} weight="regular" className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" />
                      <div className="space-y-2">
                        <p>{submitError}</p>
                        <a
                          href="https://t.me/VECTRA_gym_bot"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-[#93C5FD] underline hover:text-white"
                        >
                          <span>Открыть @VECTRA_gym_bot</span>
                          <ArrowUpRight size={14} weight="regular" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Focusable WCAG Error Summary */}
                {hasErrors && (
                  <div
                    ref={errorSummaryRef}
                    role="alert"
                    tabIndex={-1}
                    aria-labelledby="apply-error-summary-title"
                    className="rounded-xl border border-rose-500/45 bg-rose-950/30 p-4 focus:outline-2 focus:outline-rose-400"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-200">
                      <WarningCircle size={18} weight="regular" aria-hidden="true" />
                      <h3 id="apply-error-summary-title">Проверьте обязательные поля анкеты</h3>
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-rose-300">
                      {errors.name && (
                        <li>
                          <a href="#client-name" className="underline hover:text-white">
                            {errors.name}
                          </a>
                        </li>
                      )}
                      {errors.contact && (
                        <li>
                          <a href="#client-contact" className="underline hover:text-white">
                            {errors.contact}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {hasDiagnosticImport && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-[#3B82F6]/35 bg-[#111C30] px-3.5 py-2.5 text-xs text-[#93C5FD]">
                    <Pulse size={16} weight="regular" aria-hidden="true" />
                    <span>Расчёт из VECTRA BODY OS прикреплён к вашей анкете</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="client-name" className="text-sm font-semibold text-[#E2E8F0]">
                      Имя
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      value={name}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'client-name-error' : 'client-name-hint'}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Например, Алексей"
                      className={`rounded-lg border bg-[#05080E] px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none ${
                        errors.name
                          ? 'border-rose-500/70 focus:border-rose-500'
                          : 'border-white/12 focus:border-[#3B82F6]'
                      }`}
                    />
                    <span id="client-name-hint" className="text-xs text-[#94A3B8]">
                      Как к вам обращаться
                    </span>
                    {errors.name && (
                      <span id="client-name-error" className="text-xs text-rose-400" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="client-contact" className="text-sm font-semibold text-[#E2E8F0]">
                      Telegram или телефон
                    </label>
                    <input
                      id="client-contact"
                      type="text"
                      value={contact}
                      aria-invalid={Boolean(errors.contact)}
                      aria-describedby={errors.contact ? 'client-contact-error' : 'client-contact-hint'}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (errors.contact) setErrors((prev) => ({ ...prev, contact: undefined }));
                      }}
                      placeholder="@username или +7 (999) 000-00-00"
                      className={`rounded-lg border bg-[#05080E] px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none ${
                        errors.contact
                          ? 'border-rose-500/70 focus:border-rose-500'
                          : 'border-white/12 focus:border-[#3B82F6]'
                      }`}
                    />
                    <span id="client-contact-hint" className="text-xs text-[#94A3B8]">
                      Куда отправить план разбора
                    </span>
                    {errors.contact && (
                      <span id="client-contact-error" className="text-xs text-rose-400" role="alert">
                        {errors.contact}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="client-gender" className="text-sm font-semibold text-[#E2E8F0]">
                      Пол
                    </label>
                    <select
                      id="client-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as GenderId)}
                      className="rounded-lg border border-white/12 bg-[#05080E] px-3.5 py-3 text-sm text-[#F1F5F9] focus:border-[#3B82F6] focus:outline-none"
                    >
                      <option value="men">Мужчина</option>
                      <option value="women">Женщина</option>
                    </select>
                  </div>

                  {/* Goal */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="client-goal" className="text-sm font-semibold text-[#E2E8F0]">
                      Цель
                    </label>
                    <select
                      id="client-goal"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as TrackId)}
                      className="rounded-lg border border-white/12 bg-[#05080E] px-3.5 py-3 text-sm text-[#F1F5F9] focus:border-[#3B82F6] focus:outline-none"
                    >
                      <option value="fat-loss">Похудение / рельеф</option>
                      <option value="natural-mass">Натуральный набор</option>
                      <option value="enhanced">Фарм-поддержка (PRO)</option>
                    </select>
                  </div>

                  {/* Format */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="client-format" className="text-sm font-semibold text-[#E2E8F0]">
                      Формат
                    </label>
                    <select
                      id="client-format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value as FormatId)}
                      className="rounded-lg border border-white/12 bg-[#05080E] px-3.5 py-3 text-sm text-[#F1F5F9] focus:border-[#3B82F6] focus:outline-none"
                    >
                      <option value="online">Онлайн-ведение</option>
                      <option value="in-person">В зале + онлайн</option>
                    </select>
                  </div>
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="client-comment" className="text-sm font-semibold text-[#E2E8F0]">
                    Кратко о текущей форме, опыте или результатах BODY OS
                  </label>
                  <textarea
                    id="client-comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (!e.target.value.trim()) setHasDiagnosticImport(false);
                    }}
                    placeholder="Возраст, рост/вес, наличие травм или текущие тренировки..."
                    className="rounded-lg border border-white/12 bg-[#05080E] px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none"
                  />
                  <span className="text-xs text-[#94A3B8]">
                    Эта информация поможет подготовиться к диалогу заранее
                  </span>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#3B82F6] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] active:scale-[0.98]"
                >
                  <PaperPlaneTilt size={17} weight="regular" aria-hidden="true" />
                  <span>Отправить заявку на ведение</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
