import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Barbell,
  Bell,
  BookOpen,
  Check,
  CheckCircle,
  Drop,
  Fire,
  ForkKnife,
  Lightbulb,
  PaperPlaneTilt,
  Plus,
  Pulse,
  Sliders,
  Trash,
  User,
  WarningCircle,
} from '@phosphor-icons/react';
import {
  createDefaultReminders,
  getTodayDateKey,
  LoggedMeal,
  NUTRITION_TIPS,
  NutritionTargets,
  NutritionTip,
  QUICK_FOODS,
  QuickFoodItem,
  ReminderConfig,
} from '../data/miniAppData';

type MiniTab = 'nutrition' | 'reminders' | 'tips' | 'cabinet';
type TipFilter = 'all' | NutritionTip['category'];

const STORAGE_KEY = 'vectra_miniapp_v1';

const DEFAULT_TARGETS: NutritionTargets = {
  kcal: 2500,
  protein: 170,
  fat: 75,
  carbs: 285,
};

const WEEKDAYS = [
  { id: 1, label: 'Пн' },
  { id: 2, label: 'Вт' },
  { id: 3, label: 'Ср' },
  { id: 4, label: 'Чт' },
  { id: 5, label: 'Пт' },
  { id: 6, label: 'Сб' },
  { id: 7, label: 'Вс' },
];

const TIP_FILTERS: { id: TipFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'protein', label: 'Белок' },
  { id: 'carbs', label: 'Углеводы' },
  { id: 'fats', label: 'Жиры и анализы' },
  { id: 'timing', label: 'Тайминг' },
];

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function MiniAppPage() {
  const [activeTab, setActiveTab] = useState<MiniTab>('nutrition');
  const [tgUser, setTgUser] = useState<{ id: number; name: string; username?: string } | null>(
    null
  );
  const [linkedUserId, setLinkedUserId] = useState<number | null>(null);

  const [targets, setTargets] = useState<NutritionTargets>(DEFAULT_TARGETS);
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [reminders, setReminders] = useState<ReminderConfig>(createDefaultReminders);

  // UI toggles & inputs
  const [showTargetEditor, setShowTargetEditor] = useState(false);
  const [showCustomMeal, setShowCustomMeal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');

  const [newMealTime, setNewMealTime] = useState('15:30');
  const [tipFilter, setTipFilter] = useState<TipFilter>('all');
  const [addedTipId, setAddedTipId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [testToast, setTestToast] = useState<{ ok: boolean; text: string } | null>(null);

  // Initialize Telegram WebApp SDK & load saved state from bot API / localStorage
  useEffect(() => {
    const wa = window.Telegram?.WebApp;
    let detectedUserId = 0;

    if (wa) {
      wa.ready();
      wa.expand();
      wa.setHeaderColor?.('#05080E');
      wa.setBackgroundColor?.('#05080E');

      const u = wa.initDataUnsafe?.user;
      if (u?.id) {
        detectedUserId = u.id;
        setTgUser({
          id: u.id,
          name: u.first_name || u.username || `ID ${u.id}`,
          username: u.username,
        });
      }
    }

    // Load local cache immediately for instant render
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          dateKey?: string;
          targets?: NutritionTargets;
          meals?: LoggedMeal[];
          reminders?: ReminderConfig;
        };
        if (parsed.targets) setTargets(parsed.targets);
        if (parsed.reminders) setReminders(parsed.reminders);
        if (parsed.dateKey === getTodayDateKey() && Array.isArray(parsed.meals)) {
          setMeals(parsed.meals);
        }
      }
    } catch {
      // ignore invalid cache
    }

    // Sync from Bot API
    const query = detectedUserId > 0 ? `?userId=${detectedUserId}` : '';
    fetch(`/api/miniapp/state${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: {
          ok?: boolean;
          linkedUserId?: number | null;
          state?: {
            targets: NutritionTargets;
            meals: LoggedMeal[];
            reminders: ReminderConfig;
          };
        } | null) => {
          if (!data?.ok) return;
          if (data.linkedUserId) setLinkedUserId(data.linkedUserId);
          if (data.state && (detectedUserId > 0 || data.linkedUserId)) {
            setTargets(data.state.targets);
            setMeals(data.state.meals);
            setReminders(data.state.reminders);
          }
        }
      )
      .catch(() => {
        // Offline / preview fallback works via localStorage
      });
  }, []);

  // Persist locally on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          dateKey: getTodayDateKey(),
          targets,
          meals,
          reminders,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [targets, meals, reminders]);

  const syncStateToBot = async (
    nextTargets = targets,
    nextMeals = meals,
    nextReminders = reminders,
    silent = true
  ) => {
    if (!silent) {
      setSaveStatus('saving');
      setSaveMessage(null);
    }

    try {
      const res = await fetch('/api/miniapp/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tgUser?.id ?? linkedUserId ?? undefined,
          dateKey: getTodayDateKey(),
          targets: nextTargets,
          meals: nextMeals,
          reminders: nextReminders,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        savedForUserId?: number | null;
      } | null;

      if (!res.ok || !data?.ok) {
        throw new Error('Ошибка сохранения');
      }
      if (data.savedForUserId) {
        setLinkedUserId(data.savedForUserId);
      }

      if (!silent) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        setSaveStatus('saved');
        setSaveMessage(
          data.savedForUserId
            ? `Сохранено и синхронизировано с ботом (ID ${data.savedForUserId})`
            : 'Сохранено локально. Нажмите /start в @VECTRA_gym_bot для привязки Telegram-уведомлений.'
        );
      }
    } catch {
      if (!silent) {
        setSaveStatus('error');
        setSaveMessage('Сервер бота временно недоступен, настройки сохранены локально.');
      }
    }
  };

  const totals = useMemo(() => {
    const kcal = meals.reduce((s, m) => s + m.kcal, 0);
    const protein = meals.reduce((s, m) => s + m.protein, 0);
    const fat = meals.reduce((s, m) => s + m.fat, 0);
    const carbs = meals.reduce((s, m) => s + m.carbs, 0);

    return {
      kcal,
      protein,
      fat,
      carbs,
      remKcal: Math.max(0, targets.kcal - kcal),
      overKcal: Math.max(0, kcal - targets.kcal),
      remProtein: Math.max(0, targets.protein - protein),
      remFat: Math.max(0, targets.fat - fat),
      remCarbs: Math.max(0, targets.carbs - carbs),
      kcalPct: Math.min(100, Math.round((kcal / Math.max(1, targets.kcal)) * 100)),
    };
  }, [meals, targets]);

  const handleAddQuickFood = (item: QuickFoodItem, fromTipId?: string) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    const newMeal: LoggedMeal = {
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: item.name,
      portion: item.portion,
      kcal: item.kcal,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      time: nowHHMM(),
    };
    const nextMeals = [newMeal, ...meals];
    setMeals(nextMeals);
    void syncStateToBot(targets, nextMeals, reminders, true);

    if (fromTipId) {
      setAddedTipId(fromTipId);
      window.setTimeout(() => setAddedTipId(null), 1600);
    }
  };

  const handleAddCustomMeal = (e: FormEvent) => {
    e.preventDefault();
    const kcalVal = Math.max(0, Math.round(Number(customKcal) || 0));
    const pVal = Math.max(0, Math.round(Number(customProtein) || 0));
    const fVal = Math.max(0, Math.round(Number(customFat) || 0));
    const cVal = Math.max(0, Math.round(Number(customCarbs) || 0));
    if (!customName.trim() || kcalVal <= 0) return;

    const newMeal: LoggedMeal = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      portion: 'порция',
      kcal: kcalVal,
      protein: pVal,
      fat: fVal,
      carbs: cVal,
      time: nowHHMM(),
    };
    const nextMeals = [newMeal, ...meals];
    setMeals(nextMeals);
    void syncStateToBot(targets, nextMeals, reminders, true);

    setCustomName('');
    setCustomKcal('');
    setCustomProtein('');
    setCustomFat('');
    setCustomCarbs('');
    setShowCustomMeal(false);
  };

  const handleDeleteMeal = (id: string) => {
    const nextMeals = meals.filter((m) => m.id !== id);
    setMeals(nextMeals);
    void syncStateToBot(targets, nextMeals, reminders, true);
  };

  const handleResetDay = () => {
    setMeals([]);
    void syncStateToBot(targets, [], reminders, true);
  };

  const handleTestReminder = async (type: 'gym' | 'meal' | 'bloodwork') => {
    setTestToast(null);
    try {
      const res = await fetch('/api/miniapp/test-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tgUser?.id ?? linkedUserId ?? undefined,
          type,
          state: {
            dateKey: getTodayDateKey(),
            targets,
            meals,
            reminders,
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        sentTo?: number;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        setTestToast({
          ok: false,
          text:
            data?.error ||
            'Сначала нажмите /start в @VECTRA_gym_bot, чтобы бот мог отправить уведомление.',
        });
        return;
      }

      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setTestToast({
        ok: true,
        text: `Тестовое напоминание отправлено в Telegram (ID ${data.sentTo}).`,
      });
    } catch {
      setTestToast({ ok: false, text: 'Не удалось связаться с API бота.' });
    }
  };

  const toggleGymDay = (dayId: number) => {
    setReminders((prev) => {
      const exists = prev.gym.days.includes(dayId);
      const nextDays = exists
        ? prev.gym.days.filter((d) => d !== dayId)
        : [...prev.gym.days, dayId].sort((a, b) => a - b);
      return {
        ...prev,
        gym: { ...prev.gym, days: nextDays },
      };
    });
  };

  const addMealTime = () => {
    if (!newMealTime) return;
    setReminders((prev) => {
      if (prev.meals.times.includes(newMealTime)) return prev;
      return {
        ...prev,
        meals: {
          ...prev.meals,
          times: [...prev.meals.times, newMealTime].sort(),
        },
      };
    });
  };

  const removeMealTime = (t: string) => {
    setReminders((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        times: prev.meals.times.filter((item) => item !== t),
      },
    }));
  };

  const filteredTips =
    tipFilter === 'all'
      ? NUTRITION_TIPS
      : NUTRITION_TIPS.filter((t) => t.category === tipFilter);

  const activeReminderCount =
    (reminders.gym.enabled ? 1 : 0) +
    (reminders.meals.enabled ? 1 : 0) +
    (reminders.bloodwork.enabled ? 1 : 0);

  // SVG Calorie Ring Geometry
  const ringRadius = 68;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset =
    ringCircumference - (totals.kcalPct / 100) * ringCircumference;

  // Smart Contextual Tip matching user's remaining macros
  const smartAdvice = useMemo(() => {
    const salmon = QUICK_FOODS.find((f) => f.id === 'salmon')!;
    const salad = QUICK_FOODS.find((f) => f.id === 'salad')!;

    if (totals.remProtein >= 25) {
      return {
        title: `До нормы белка осталось ${totals.remProtein} г`,
        body: 'В 100 г красной рыбы (лосось/форель) около 21 г белка (31 г в порции 150 г) + полезные Омега-3 для сосудов. Отличный способ быстро закрыть белковый дефицит.',
        actionFood: salmon,
      };
    }
    if (totals.remKcal >= 200) {
      return {
        title: `Осталось ${totals.remKcal} ккал до дневной цели`,
        body: 'Добавьте порцию сложных углеводов (крупу взвешивайте в сухом виде!) или салат с оливковым маслом, чтобы набрать норму клетчатки (30+ г) без тяжести.',
        actionFood: salad,
      };
    }
    return {
      title: 'Дневной коридор КБЖУ практически закрыт',
      body: 'Отличная дисциплина! Пейте чистую воду (35–40 мл/кг), чтобы не завышать гематокрит, и сохраняйте стабильный сон для восстановления.',
      actionFood: null,
    };
  }, [totals.remKcal, totals.remProtein]);

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-[#05080E] bg-blueprint-grid text-[#F1F5F9]">
      {/* Native Mobile Shell Container */}
      <div className="mx-auto min-h-[100dvh] w-full max-w-[460px] border-x border-white/[0.06] bg-[#05080E]/95 pb-28">
        {/* Compact Native App Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.08] bg-[#05080E]/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#0A1120] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M4 5L12 19L20 5" stroke="#F1F5F9" strokeWidth="2.3" strokeLinecap="square" />
                <path d="M9 5L12 10.5L15 5" stroke="#3B82F6" strokeWidth="2.3" strokeLinecap="square" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold tracking-[0.16em] text-white">VECTRA</span>
                <span className="rounded border border-[#3B82F6]/40 bg-[#182742] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#93C5FD]">
                  MINI APP
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#94A3B8]">
                {tgUser ? `Атлет: ${tgUser.name}` : 'Трекер КБЖУ и напоминаний'}
              </div>
            </div>
          </div>

          <a
            href="https://t.me/VECTRA_gym_bot"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0A1120] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#93C5FD] transition-colors hover:border-[#3B82F6] hover:text-white"
          >
            <PaperPlaneTilt size={13} weight="regular" aria-hidden="true" />
            <span>Бот</span>
          </a>
        </header>

        {/* Active Tab Viewport */}
        <main className="px-4 pt-5">
          <AnimatePresence mode="wait">
            {activeTab === 'nutrition' && (
              <motion.div
                key="tab-nutrition"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="space-y-4"
              >
                {/* Hero Calorie Ring Card */}
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0A1120] to-[#05080E] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#3B82F6]">
                        Дневной баланс
                      </span>
                      <h1 className="mt-0.5 text-lg font-bold text-white">Питание сегодня</h1>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTargetEditor((p) => !p)}
                      aria-expanded={showTargetEditor}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#05080E] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#3B82F6] hover:text-white"
                    >
                      <Sliders size={13} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
                      <span>Норма</span>
                    </button>
                  </div>

                  {/* Ring + Consumed / Remaining Split */}
                  <div className="mt-4 flex items-center gap-3.5 sm:gap-5">
                    <div className="relative h-[122px] w-[122px] shrink-0 sm:h-[140px] sm:w-[140px]">
                      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label={`Прогресс калорий: ${totals.kcalPct}%`}>
                        <defs>
                          <linearGradient id="vectraMiniRing" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="100%" stopColor="#2563EB" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="90"
                          cy="90"
                          r={ringRadius}
                          fill="none"
                          stroke="#111C30"
                          strokeWidth="12"
                        />
                        <motion.circle
                          cx="90"
                          cy="90"
                          r={ringRadius}
                          fill="none"
                          stroke={totals.overKcal > 0 ? '#F59E0B' : 'url(#vectraMiniRing)'}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={ringCircumference}
                          animate={{ strokeDashoffset }}
                          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="font-mono text-[9px] uppercase text-[#94A3B8] sm:text-[10px]">
                          {totals.overKcal > 0 ? 'Сверх нормы' : 'Осталось'}
                        </span>
                        <span className="mt-0.5 font-mono text-xl font-bold tracking-tight text-white tabular-nums sm:text-2xl">
                          {totals.overKcal > 0 ? `+${totals.overKcal}` : totals.remKcal}
                        </span>
                        <span className="font-mono text-[9px] text-[#93C5FD] tabular-nums sm:text-[10px]">
                          {totals.kcalPct}% от цели
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-2.5 sm:space-y-3">
                      <div className="rounded-xl border border-white/[0.08] bg-[#05080E]/85 p-2.5 sm:p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs">
                          <span className="text-[#94A3B8]">Съедено</span>
                          <span className="whitespace-nowrap font-mono font-bold text-white tabular-nums">
                            {totals.kcal} ккал
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs">
                          <span className="text-[#94A3B8]">Цель</span>
                          <span className="whitespace-nowrap font-mono font-semibold text-[#93C5FD] tabular-nums">
                            {targets.kcal} ккал
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs leading-snug text-[#CBD5E1]">
                        <Fire size={15} weight="regular" className="mt-0.5 shrink-0 text-[#3B82F6]" aria-hidden="true" />
                        <span className="min-w-0">
                          {meals.length > 0
                            ? `Записано приёмов: ${meals.length}`
                            : 'Добавьте первый приём пищи ниже'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Target Editor */}
                  {showTargetEditor && (
                    <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-[#3B82F6]/30 bg-[#05080E] p-3.5">
                      <div>
                        <label htmlFor="t-kcal" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                          Калории
                        </label>
                        <input
                          id="t-kcal"
                          type="number"
                          value={targets.kcal}
                          onChange={(e) =>
                            setTargets((p) => ({ ...p, kcal: Math.max(800, Number(e.target.value) || 0) }))
                          }
                          className="mt-1 w-full rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-1.5 font-mono text-xs text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="t-protein" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                          Белок (г)
                        </label>
                        <input
                          id="t-protein"
                          type="number"
                          value={targets.protein}
                          onChange={(e) =>
                            setTargets((p) => ({ ...p, protein: Math.max(30, Number(e.target.value) || 0) }))
                          }
                          className="mt-1 w-full rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-1.5 font-mono text-xs text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="t-fat" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                          Жиры (г)
                        </label>
                        <input
                          id="t-fat"
                          type="number"
                          value={targets.fat}
                          onChange={(e) =>
                            setTargets((p) => ({ ...p, fat: Math.max(20, Number(e.target.value) || 0) }))
                          }
                          className="mt-1 w-full rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-1.5 font-mono text-xs text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="t-carbs" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                          Углеводы (г)
                        </label>
                        <input
                          id="t-carbs"
                          type="number"
                          value={targets.carbs}
                          onChange={(e) =>
                            setTargets((p) => ({ ...p, carbs: Math.max(20, Number(e.target.value) || 0) }))
                          }
                          className="mt-1 w-full rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-1.5 font-mono text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3 Macro Progress Bars */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-white/10 pt-4">
                    {[
                      {
                        label: 'Белок',
                        val: totals.protein,
                        max: targets.protein,
                        rem: totals.remProtein,
                        barClass: 'bg-[#3B82F6]',
                      },
                      {
                        label: 'Жиры',
                        val: totals.fat,
                        max: targets.fat,
                        rem: totals.remFat,
                        barClass: 'bg-[#60A5FA]',
                      },
                      {
                        label: 'Углеводы',
                        val: totals.carbs,
                        max: targets.carbs,
                        rem: totals.remCarbs,
                        barClass: 'bg-[#93C5FD]',
                      },
                    ].map((m) => {
                      const pct = Math.min(100, Math.round((m.val / Math.max(1, m.max)) * 100));
                      return (
                        <div key={m.label} className="rounded-xl border border-white/[0.06] bg-[#05080E]/80 p-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#CBD5E1]">{m.label}</span>
                            <span className="font-mono text-[10px] text-[#94A3B8] tabular-nums">
                              {m.val}/{m.max}г
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#111C30]">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${m.barClass}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="mt-1.5 font-mono text-[10px] text-[#93C5FD] tabular-nums">
                            Ост. {m.rem} г
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Smart Contextual Advice Based on Remaining Macros */}
                <section className="rounded-2xl border border-[#3B82F6]/35 bg-[#0A1120]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#3B82F6]/40 bg-[#182742] text-[#93C5FD]">
                      <Lightbulb size={18} weight="regular" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">
                        Умный совет под остаток
                      </div>
                      <h2 className="mt-0.5 text-sm font-bold text-white">{smartAdvice.title}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">{smartAdvice.body}</p>
                      {smartAdvice.actionFood && (
                        <button
                          type="button"
                          onClick={() => handleAddQuickFood(smartAdvice.actionFood!)}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#3B82F6]/45 bg-[#111C30] px-3 py-1.5 text-xs font-semibold text-[#93C5FD] transition-colors hover:border-[#3B82F6] hover:text-white"
                        >
                          <Plus size={13} weight="bold" aria-hidden="true" />
                          <span>
                            Добавить {smartAdvice.actionFood.name} ({smartAdvice.actionFood.portion})
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Quick Food Chips + Custom Entry */}
                <section className="rounded-2xl border border-white/10 bg-[#0A1120] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-white">Быстро добавить еду</h2>
                    <button
                      type="button"
                      onClick={() => setShowCustomMeal((p) => !p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-[#05080E] px-2.5 py-1 text-xs font-semibold text-[#93C5FD] hover:border-[#3B82F6]"
                    >
                      <Plus size={12} weight="bold" aria-hidden="true" />
                      <span>Своё блюдо</span>
                    </button>
                  </div>

                  {showCustomMeal && (
                    <form
                      onSubmit={handleAddCustomMeal}
                      className="mt-3 space-y-2.5 rounded-xl border border-white/10 bg-[#05080E] p-3.5"
                    >
                      <input
                        type="text"
                        placeholder="Название блюда (например, Стейк лосося 150 г)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-white/12 bg-[#0A1120] px-3 py-2 text-xs text-white placeholder-[#64748B]"
                      />
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="number"
                          placeholder="Ккал"
                          value={customKcal}
                          onChange={(e) => setCustomKcal(e.target.value)}
                          required
                          className="rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-2 font-mono text-xs text-white placeholder-[#64748B]"
                        />
                        <input
                          type="number"
                          placeholder="Б (г)"
                          value={customProtein}
                          onChange={(e) => setCustomProtein(e.target.value)}
                          className="rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-2 font-mono text-xs text-white placeholder-[#64748B]"
                        />
                        <input
                          type="number"
                          placeholder="Ж (г)"
                          value={customFat}
                          onChange={(e) => setCustomFat(e.target.value)}
                          className="rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-2 font-mono text-xs text-white placeholder-[#64748B]"
                        />
                        <input
                          type="number"
                          placeholder="У (г)"
                          value={customCarbs}
                          onChange={(e) => setCustomCarbs(e.target.value)}
                          className="rounded-lg border border-white/12 bg-[#0A1120] px-2.5 py-2 font-mono text-xs text-white placeholder-[#64748B]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-[#3B82F6] py-2 text-xs font-semibold text-white hover:bg-[#2563EB]"
                      >
                        Записать в рацион
                      </button>
                    </form>
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {QUICK_FOODS.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleAddQuickFood(food)}
                        className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-[#05080E]/85 px-3 py-2.5 text-left transition-colors hover:border-[#3B82F6]/60 hover:bg-[#111C30]"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-[#F1F5F9]">
                            {food.name}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-[#94A3B8] tabular-nums">
                            {food.portion} • {food.kcal} ккал • Б {food.protein} / Ж {food.fat} / У {food.carbs}
                          </div>
                        </div>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#3B82F6]/35 bg-[#111C30] text-[#3B82F6]">
                          <Plus size={14} weight="bold" aria-hidden="true" />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Today's Meal Log */}
                <section className="rounded-2xl border border-white/10 bg-[#0A1120] p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Съедено сегодня</h2>
                    {meals.length > 0 && (
                      <button
                        type="button"
                        onClick={handleResetDay}
                        className="font-mono text-[11px] text-[#94A3B8] hover:text-rose-300"
                      >
                        Очистить день
                      </button>
                    )}
                  </div>

                  {meals.length === 0 ? (
                    <p className="mt-3 text-xs text-[#64748B]">
                      Список пока пуст. Нажмите на любой продукт выше, чтобы зафиксировать приём пищи.
                    </p>
                  ) : (
                    <div className="mt-3 divide-y divide-white/[0.06]">
                      {meals.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-[#F1F5F9]">
                              {m.name} <span className="font-normal text-[#94A3B8]">({m.portion})</span>
                            </div>
                            <div className="mt-0.5 font-mono text-[10px] text-[#93C5FD] tabular-nums">
                              {m.time} • {m.kcal} ккал • Б {m.protein} / Ж {m.fat} / У {m.carbs}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMeal(m.id)}
                            aria-label={`Удалить ${m.name}`}
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#05080E] text-[#94A3B8] hover:border-rose-500/40 hover:text-rose-300"
                          >
                            <Trash size={13} weight="regular" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'reminders' && (
              <motion.div
                key="tab-reminders"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-white/10 bg-[#0A1120] p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#3B82F6]">
                    Push-уведомления в Telegram
                  </span>
                  <h1 className="mt-1 text-lg font-bold text-white">
                    Расписание напоминаний
                  </h1>
                  <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                    Бот <strong className="text-[#CBD5E1]">@VECTRA_gym_bot</strong> будет присылать вам
                    точные напоминания о тренировках, приёмах пищи (с вашим остатком КБЖУ) и сдаче анализов.
                  </p>
                  {!tgUser && !linkedUserId && (
                    <div className="mt-3 rounded-lg border border-amber-500/35 bg-amber-950/25 px-3 py-2 text-[11px] text-amber-200">
                      Чтобы бот знал ваш чат, сначала нажмите <code className="font-mono">/start</code> в{' '}
                      <a
                        href="https://t.me/VECTRA_gym_bot"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        @VECTRA_gym_bot
                      </a>
                      .
                    </div>
                  )}
                </div>

                {testToast && (
                  <div
                    role="alert"
                    className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                      testToast.ok
                        ? 'border-emerald-500/40 bg-emerald-950/35 text-emerald-200'
                        : 'border-rose-500/40 bg-rose-950/35 text-rose-200'
                    }`}
                  >
                    {testToast.ok ? (
                      <CheckCircle size={16} weight="regular" className="mt-0.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <WarningCircle size={16} weight="regular" className="mt-0.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>{testToast.text}</span>
                  </div>
                )}

                {/* 1. Gym Reminder */}
                <section className="rounded-2xl border border-white/10 bg-[#0A1120] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3B82F6]/35 bg-[#182742] text-[#3B82F6]">
                        <Barbell size={18} weight="regular" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white">Пойти в зал</h2>
                        <div className="font-mono text-[10px] text-[#94A3B8]">
                          Дни и время тренировки
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={reminders.gym.enabled}
                      onClick={() =>
                        setReminders((p) => ({
                          ...p,
                          gym: { ...p.gym, enabled: !p.gym.enabled },
                        }))
                      }
                      className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold transition-colors ${
                        reminders.gym.enabled
                          ? 'border-[#3B82F6] bg-[#182742] text-white'
                          : 'border-white/15 bg-[#05080E] text-[#64748B]'
                      }`}
                    >
                      {reminders.gym.enabled ? 'ВКЛ' : 'ВЫКЛ'}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((d) => {
                      const active = reminders.gym.days.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleGymDay(d.id)}
                          aria-pressed={active}
                          className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs font-semibold transition-colors ${
                            active
                              ? 'border-[#3B82F6] bg-[#182742] text-white'
                              : 'border-white/10 bg-[#05080E] text-[#94A3B8]'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <div>
                      <label htmlFor="gym-time" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                        Время
                      </label>
                      <input
                        id="gym-time"
                        type="time"
                        value={reminders.gym.time}
                        onChange={(e) =>
                          setReminders((p) => ({ ...p, gym: { ...p.gym, time: e.target.value } }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/12 bg-[#05080E] px-2.5 py-2 font-mono text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="gym-note" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                        Фокус тренировки
                      </label>
                      <input
                        id="gym-note"
                        type="text"
                        value={reminders.gym.note}
                        onChange={(e) =>
                          setReminders((p) => ({ ...p, gym: { ...p.gym, note: e.target.value } }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/12 bg-[#05080E] px-2.5 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleTestReminder('gym')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#05080E] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#93C5FD] hover:border-[#3B82F6] hover:text-white"
                    >
                      <PaperPlaneTilt size={12} weight="regular" aria-hidden="true" />
                      <span>Тест в ТГ</span>
                    </button>
                  </div>
                </section>

                {/* 2. Meals Reminder */}
                <section className="rounded-2xl border border-white/10 bg-[#0A1120] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3B82F6]/35 bg-[#182742] text-[#3B82F6]">
                        <ForkKnife size={18} weight="regular" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white">Напоминалка поесть</h2>
                        <div className="font-mono text-[10px] text-[#94A3B8]">
                          С вашим остатком КБЖУ
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={reminders.meals.enabled}
                      onClick={() =>
                        setReminders((p) => ({
                          ...p,
                          meals: { ...p.meals, enabled: !p.meals.enabled },
                        }))
                      }
                      className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold transition-colors ${
                        reminders.meals.enabled
                          ? 'border-[#3B82F6] bg-[#182742] text-white'
                          : 'border-white/15 bg-[#05080E] text-[#64748B]'
                      }`}
                    >
                      {reminders.meals.enabled ? 'ВКЛ' : 'ВЫКЛ'}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {reminders.meals.times.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#05080E] px-2.5 py-1.5 font-mono text-xs text-white"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => removeMealTime(t)}
                          aria-label={`Удалить время ${t}`}
                          className="text-[#64748B] hover:text-rose-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="time"
                      value={newMealTime}
                      onChange={(e) => setNewMealTime(e.target.value)}
                      className="rounded-lg border border-white/12 bg-[#05080E] px-2.5 py-1.5 font-mono text-xs text-white"
                      aria-label="Новое время приёма пищи"
                    />
                    <button
                      type="button"
                      onClick={addMealTime}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-[#111C30] px-3 py-1.5 text-xs font-semibold text-[#E2E8F0] hover:border-[#3B82F6]"
                    >
                      <Plus size={12} weight="bold" aria-hidden="true" />
                      <span>Добавить время</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleTestReminder('meal')}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#05080E] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#93C5FD] hover:border-[#3B82F6] hover:text-white"
                    >
                      <PaperPlaneTilt size={12} weight="regular" aria-hidden="true" />
                      <span>Тест в ТГ</span>
                    </button>
                  </div>
                </section>

                {/* 3. Bloodwork Reminder */}
                <section className="rounded-2xl border border-white/10 bg-[#0A1120] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3B82F6]/35 bg-[#182742] text-[#3B82F6]">
                        <Drop size={18} weight="regular" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white">Сдать анализы крови</h2>
                        <div className="font-mono text-[10px] text-[#94A3B8]">
                          Циклический чек-ап биомаркеров
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={reminders.bloodwork.enabled}
                      onClick={() =>
                        setReminders((p) => ({
                          ...p,
                          bloodwork: { ...p.bloodwork, enabled: !p.bloodwork.enabled },
                        }))
                      }
                      className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold transition-colors ${
                        reminders.bloodwork.enabled
                          ? 'border-[#3B82F6] bg-[#182742] text-white'
                          : 'border-white/15 bg-[#05080E] text-[#64748B]'
                      }`}
                    >
                      {reminders.bloodwork.enabled ? 'ВКЛ' : 'ВЫКЛ'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      { id: 'base' as const, label: 'Базовая панель' },
                      { id: 'pro' as const, label: 'PRO / Фарм-панель' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setReminders((p) => ({
                            ...p,
                            bloodwork: { ...p.bloodwork, panel: opt.id },
                          }))
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                          reminders.bloodwork.panel === opt.id
                            ? 'border-[#3B82F6] bg-[#182742] text-white'
                            : 'border-white/10 bg-[#05080E] text-[#94A3B8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="blood-date" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                        Следующая сдача
                      </label>
                      <input
                        id="blood-date"
                        type="date"
                        value={reminders.bloodwork.nextDate}
                        onChange={(e) =>
                          setReminders((p) => ({
                            ...p,
                            bloodwork: { ...p.bloodwork, nextDate: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/12 bg-[#05080E] px-2.5 py-2 font-mono text-xs text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="blood-time" className="block font-mono text-[10px] uppercase text-[#94A3B8]">
                        Время утром
                      </label>
                      <input
                        id="blood-time"
                        type="time"
                        value={reminders.bloodwork.time}
                        onChange={(e) =>
                          setReminders((p) => ({
                            ...p,
                            bloodwork: { ...p.bloodwork, time: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/12 bg-[#05080E] px-2.5 py-2 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-1.5">
                      {[14, 28, 45, 90].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() =>
                            setReminders((p) => ({
                              ...p,
                              bloodwork: { ...p.bloodwork, intervalDays: days },
                            }))
                          }
                          className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                            reminders.bloodwork.intervalDays === days
                              ? 'border-[#3B82F6] bg-[#182742] text-white'
                              : 'border-white/10 bg-[#05080E] text-[#94A3B8]'
                          }`}
                        >
                          {days}д
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleTestReminder('bloodwork')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#05080E] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#93C5FD] hover:border-[#3B82F6] hover:text-white"
                    >
                      <PaperPlaneTilt size={12} weight="regular" aria-hidden="true" />
                      <span>Тест в ТГ</span>
                    </button>
                  </div>
                </section>

                {/* Save Reminders Primary CTA */}
                <button
                  type="button"
                  onClick={() => void syncStateToBot(targets, meals, reminders, false)}
                  disabled={saveStatus === 'saving'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] active:scale-[0.98] disabled:opacity-60"
                >
                  <Bell size={17} weight="regular" aria-hidden="true" />
                  <span>
                    {saveStatus === 'saving'
                      ? 'Сохранение в бота...'
                      : 'Сохранить напоминания в бота'}
                  </span>
                </button>

                {saveMessage && (
                  <div
                    role="status"
                    className={`rounded-xl border p-3 text-xs ${
                      saveStatus === 'error'
                        ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                        : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                    }`}
                  >
                    {saveMessage}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tips' && (
              <motion.div
                key="tab-tips"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="space-y-4"
              >
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#3B82F6]">
                    База знаний по рациону
                  </span>
                  <h1 className="mt-1 text-lg font-bold text-white">
                    Советы и шпаргалка по еде
                  </h1>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {TIP_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTipFilter(f.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        tipFilter === f.id
                          ? 'border-[#3B82F6] bg-[#182742] text-white'
                          : 'border-white/10 bg-[#0A1120] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Tips Feed */}
                <div className="space-y-3">
                  {filteredTips.map((tip) => {
                    const quickFood = tip.quickFoodId
                      ? QUICK_FOODS.find((q) => q.id === tip.quickFoodId)
                      : undefined;
                    const justAdded = addedTipId === tip.id;

                    return (
                      <article
                        key={tip.id}
                        className="rounded-2xl border border-white/10 bg-[#0A1120] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">
                            {tip.categoryLabel}
                          </span>
                        </div>
                        <h2 className="mt-1.5 text-sm font-bold text-white">{tip.title}</h2>
                        <div className="mt-2 inline-block rounded-md border border-[#3B82F6]/35 bg-[#111C30] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#93C5FD]">
                          {tip.highlightMetric}
                        </div>
                        <p className="mt-2.5 text-xs leading-relaxed text-[#CBD5E1]">{tip.body}</p>

                        {quickFood && (
                          <button
                            type="button"
                            onClick={() => handleAddQuickFood(quickFood, tip.id)}
                            className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                              justAdded
                                ? 'border-emerald-500/45 bg-emerald-950/40 text-emerald-300'
                                : 'border-white/12 bg-[#05080E] text-[#E2E8F0] hover:border-[#3B82F6]'
                            }`}
                          >
                            {justAdded ? (
                              <>
                                <Check size={13} weight="bold" aria-hidden="true" />
                                <span>Добавлено в рацион</span>
                              </>
                            ) : (
                              <>
                                <Plus size={13} weight="bold" className="text-[#3B82F6]" aria-hidden="true" />
                                <span>
                                  В рацион: {quickFood.name} ({quickFood.portion})
                                </span>
                              </>
                            )}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'cabinet' && (
              <motion.div
                key="tab-cabinet"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="space-y-4"
              >
                <section className="rounded-2xl border border-white/10 bg-[#0A1120] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3B82F6]/40 bg-[#182742] text-[#93C5FD]">
                      <User size={22} weight="regular" aria-hidden="true" />
                    </div>
                    <div>
                      <h1 className="text-base font-bold text-white">
                        {tgUser ? tgUser.name : 'Профиль атлета VECTRA'}
                      </h1>
                      <div className="font-mono text-[11px] text-[#94A3B8]">
                        {tgUser
                          ? `TG ID: ${tgUser.id}`
                          : linkedUserId
                          ? `Привязан TG ID: ${linkedUserId}`
                          : 'Режим веб-предпросмотра'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div className="rounded-xl border border-white/[0.07] bg-[#05080E] p-3">
                      <div className="font-mono text-[10px] uppercase text-[#94A3B8]">
                        Прогресс КБЖУ
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                        {totals.kcalPct}%
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#05080E] p-3">
                      <div className="font-mono text-[10px] uppercase text-[#94A3B8]">
                        Напоминаний актив.
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-[#93C5FD] tabular-nums">
                        {activeReminderCount} / 3
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-2.5">
                  {[
                    {
                      to: '/body-os',
                      title: 'VECTRA BODY OS',
                      sub: '16-недельный симулятор веса и радар 8 анализов крови',
                    },
                    {
                      to: '/atlas',
                      title: '3D-Атлас упражнений',
                      sub: '7 групп мышц, 25 анатомических зон и видеоразборы',
                    },
                    {
                      to: '/apply',
                      title: 'Оформить заявку на ведение',
                      sub: 'Похудение, натуральный набор или PRO / фарм-сопровождение',
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0A1120] p-4 transition-colors hover:border-[#3B82F6]/60 hover:bg-[#111C30]"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{item.title}</div>
                        <div className="mt-0.5 text-xs text-[#94A3B8]">{item.sub}</div>
                      </div>
                      <ArrowRight size={16} weight="regular" className="shrink-0 text-[#3B82F6]" aria-hidden="true" />
                    </Link>
                  ))}
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sticky Bottom 4-Tab Glass Dock */}
        <nav
          aria-label="Навигация Mini App"
          className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[460px] border-t border-white/10 bg-[#05080E]/95 px-2.5 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-lg"
        >
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'nutrition' as MiniTab, label: 'Питание', icon: ForkKnife },
              { id: 'reminders' as MiniTab, label: 'Напом.', icon: Bell },
              { id: 'tips' as MiniTab, label: 'Советы', icon: BookOpen },
              { id: 'cabinet' as MiniTab, label: 'Кабинет', icon: Pulse },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors ${
                    active ? 'text-white' : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="miniapp-dock-pill"
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      className="absolute inset-0 rounded-xl border border-[#3B82F6]/45 bg-[#182742]"
                    />
                  )}
                  <Icon
                    size={19}
                    weight="regular"
                    className={`relative z-10 ${active ? 'text-[#3B82F6]' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
