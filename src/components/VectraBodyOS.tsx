import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  Drop,
  Gauge,
  LockOpen,
  Pulse,
  ShieldCheck,
  Table,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';
import { FormatId, GenderId, TrackId } from '../data/coachingData';

export interface DiagnosticPayload {
  gender: GenderId;
  goal: TrackId;
  format: FormatId;
  diagnosticNote: string;
}

interface VectraBodyOSProps {
  onApplyDiagnostic: (payload: DiagnosticPayload) => void;
  standalone?: boolean;
}

type OsTab = 'simulator' | 'biomarkers';
type DisciplineLevel = 0.8 | 0.9 | 1.0;
type BaseExperience = 'novice' | 'experienced';
type PanelMode = 'natural' | 'pro';

interface WeekPoint {
  week: number;
  totalWeight: number;
  leanMass: number;
  bodyFatPct: number;
  isBloodCheckpoint: boolean;
}

type BiomarkerId =
  | 'totalTest'
  | 'freeTest'
  | 'hematocrit'
  | 'estradiol'
  | 'prolactin'
  | 'alt'
  | 'ldl'
  | 'systolic';

interface BiomarkerConfig {
  id: BiomarkerId;
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  optimalLabel: (mode: PanelMode) => string;
  evaluate: (
    val: number,
    mode: PanelMode
  ) => {
    status: 'optimal' | 'borderline' | 'alert';
    badgeText: string;
    note: string;
  };
}

const BIOMARKERS: BiomarkerConfig[] = [
  {
    id: 'totalTest',
    name: 'Тестостерон общий',
    unit: 'нмоль/л',
    min: 5,
    max: 150,
    step: 1,
    optimalLabel: (mode) => (mode === 'pro' ? '45–115 нмоль/л' : '16–34 нмоль/л'),
    evaluate: (v, mode) => {
      if (mode === 'pro') {
        if (v < 25 || v > 135) {
          return {
            status: 'alert',
            badgeText: 'К врачу',
            note:
              v > 135
                ? 'Чрезмерно высокий фон: повышенная нагрузка на гематокрит и миокард — корректировать дозировки с врачом.'
                : 'Уровень ниже целевого коридора блока или задержка после эфира — проверить профиль и ХГЧ/ПКТ.',
          };
        }
        if (v < 45 || v > 115) {
          return {
            status: 'borderline',
            badgeText: 'Погранично',
            note: 'Сверить кратность инъекций, проверить E2 и ГСПГ для оценки реальной отдачи блока.',
          };
        }
        return {
          status: 'optimal',
          badgeText: 'Норма блока',
          note: 'Целевой анаболический фон для синтеза белка и высокой тренировочной переносимости.',
        };
      }

      if (v < 12 || v > 42) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note:
            v < 12
              ? 'Снижение эндогенного тестостерона: проверить ЛГ/ФСГ, сон, дефицит калорий и обратиться к эндокринологу.'
              : 'Выше естественного референса без поддержки: исключить лабораторную ошибку и пройти консультацию врача.',
        };
      }
      if (v < 16 || v > 34) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Увеличить сон до 8 ч, добавить жиры до 1 г/кг, снизить избыточный кардио-стресс.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Здоровый натуральный андрогенный статус и полноценное восстановление ЦНС.',
      };
    },
  },
  {
    id: 'freeTest',
    name: 'Тестостерон свободный',
    unit: 'пг/мл',
    min: 3,
    max: 120,
    step: 1,
    optimalLabel: (mode) => (mode === 'pro' ? '35–90 пг/мл' : '12–32 пг/мл'),
    evaluate: (v, mode) => {
      if (mode === 'pro') {
        if (v < 20 || v > 108) {
          return {
            status: 'alert',
            badgeText: 'К врачу',
            note:
              v > 108
                ? 'Экстремально высокая свободная фракция: контроль АД, кожи, простаты и липидов со специалистом.'
                : 'Низкая свободная фракция при фоне: проверить ГСПГ, альбумин и функцию печени.',
          };
        }
        if (v < 35 || v > 90) {
          return {
            status: 'borderline',
            badgeText: 'Погранично',
            note: 'Отслеживать ГСПГ и соотношение с эстрадиолом перед увеличением рабочего тоннажа.',
          };
        }
        return {
          status: 'optimal',
          badgeText: 'Норма блока',
          note: 'Активная биодоступная фракция работает без перегруза систем адаптации.',
        };
      }

      if (v < 9 || v > 40) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note:
            v < 9
              ? 'Низкая свободная фракция при возможно высоком ГСПГ: проверить ТТГ, печень и обратиться к врачу.'
              : 'Превышение референсной зоны: перепроверить метод анализа (ИФА / масс-спектрометрия).',
        };
      }
      if (v < 12 || v > 32) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Оценить уровень ГСПГ, цинк/бор/витамин D и скорректировать глубину дефицита калорий.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Высокая биодоступность тестостерона для стабильной прогрессии рабочих весов.',
      };
    },
  },
  {
    id: 'hematocrit',
    name: 'Гематокрит',
    unit: '%',
    min: 36,
    max: 56,
    step: 0.5,
    optimalLabel: () => '38–48%',
    evaluate: (v) => {
      if (v > 51 || v < 38) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note:
            v > 51
              ? 'Повышенная вязкость крови: пауза в пиковых весах, срочная консультация врача.'
              : 'Ниже оптимума: проверить ферритин, железо и B12 с врачом.',
        };
      }
      if (v > 48) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Усилить гидратацию (35–40 мл/кг), добавить аэробный LISS-контроль, повтор через 2 нед.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Оптимальная реология крови и перенос кислорода для силовых блоков.',
      };
    },
  },
  {
    id: 'estradiol',
    name: 'Эстрадиол (E2)',
    unit: 'пг/мл',
    min: 10,
    max: 120,
    step: 1,
    optimalLabel: () => '18–45 пг/мл',
    evaluate: (v) => {
      if (v > 68 || v < 15) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note:
            v > 68
              ? 'Выраженное повышение E2: риск задержки жидкости и АД — нужна коррекция со специалистом.'
              : 'Низкий E2 ухудшает состояние суставов и липидов: необходим врачебный разбор.',
        };
      }
      if (v > 45 || v < 18) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Следить за отёчностью, давлением и качеством сна; повторный контроль через 3 недели.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Баланс для защиты связок, нейромышечной передачи и липидного профиля.',
      };
    },
  },
  {
    id: 'prolactin',
    name: 'Пролактин',
    unit: 'нг/мл',
    min: 3,
    max: 35,
    step: 0.5,
    optimalLabel: () => '4–15 нг/мл',
    evaluate: (v) => {
      if (v > 22) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note: 'Выраженный рост пролактина: исключить стресс-факторы и обратиться к эндокринологу.',
        };
      }
      if (v > 15) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Снизить ЦНС-утомление, скорректировать сон до 8 ч и пересдать в покое.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Стабильный драйв ЦНС и восстановление между тяжёлыми сессиями.',
      };
    },
  },
  {
    id: 'alt',
    name: 'АЛТ (печень)',
    unit: 'Ед/л',
    min: 10,
    max: 110,
    step: 1,
    optimalLabel: () => '10–40 Ед/л',
    evaluate: (v) => {
      if (v > 65) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note: 'Существенный подъём фермента: сдать АСТ/ГГТ/билирубин и пройти очный осмотр врача.',
        };
      }
      if (v > 40) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Возможен тренировочный отклик после тяжёлых ног: сдать через 48 ч отдыха от зала.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Печёночный обмен в рабочем коридоре без признаков перегрузки.',
      };
    },
  },
  {
    id: 'ldl',
    name: 'ЛПНП (холестерин)',
    unit: 'ммоль/л',
    min: 1.5,
    max: 5.5,
    step: 0.1,
    optimalLabel: () => '1.5–3.0 ммоль/л',
    evaluate: (v) => {
      if (v > 3.8) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note: 'Повышенный атерогенный риск: пересмотр рациона и консультация кардиолога.',
        };
      }
      if (v > 3.0) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Добавить 150 мин LISS-кардио/нед, клетчатку 30+ г и сместить жиры к омега-3.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Чистый липидный профиль и минимальная нагрузка на сосуды.',
      };
    },
  },
  {
    id: 'systolic',
    name: 'АД систолическое',
    unit: 'мм рт.ст.',
    min: 100,
    max: 160,
    step: 1,
    optimalLabel: () => '105–125 мм',
    evaluate: (v) => {
      if (v > 138) {
        return {
          status: 'alert',
          badgeText: 'К врачу',
          note: 'Артериальная гипертензия: убрать проходки/отказ и согласовать контроль АД с врачом.',
        };
      }
      if (v > 125) {
        return {
          status: 'borderline',
          badgeText: 'Погранично',
          note: 'Снизить натрий, исключить предтреники, ввести ежедневное кардио в зоне 2.',
        };
      }
      return {
        status: 'optimal',
        badgeText: 'Норма',
        note: 'Сосудистый тонус в норме — разрешён полный силовой и кардио-объём.',
      };
    },
  },
];

type BiomarkerValues = Record<BiomarkerId, number>;

const NATURAL_PRESET: BiomarkerValues = {
  totalTest: 24,
  freeTest: 21,
  hematocrit: 44.5,
  estradiol: 29,
  prolactin: 9.5,
  alt: 26,
  ldl: 2.4,
  systolic: 118,
};

const PRO_PRESET: BiomarkerValues = {
  totalTest: 86,
  freeTest: 64,
  hematocrit: 49.5,
  estradiol: 54,
  prolactin: 14,
  alt: 46,
  ldl: 3.3,
  systolic: 129,
};

const CHECKPOINT_WEEKS = [0, 4, 8, 12, 16];

export function VectraBodyOS({ onApplyDiagnostic, standalone = false }: VectraBodyOSProps) {
  const [activeTab, setActiveTab] = useState<OsTab>('simulator');

  // Tab 1 state: 16-week predictive simulator
  const [gender, setGender] = useState<GenderId>('men');
  const [goal, setGoal] = useState<TrackId>('enhanced');
  const [experience, setExperience] = useState<BaseExperience>('novice');
  const [weight, setWeight] = useState<number>(60);
  const [bodyFat, setBodyFat] = useState<number>(18);
  const [discipline, setDiscipline] = useState<DisciplineLevel>(0.9);
  const [selectedWeek, setSelectedWeek] = useState<number>(16);
  const [showTable, setShowTable] = useState<boolean>(false);

  // Tab 2 state: Blood Biomarker Radar
  const [panelMode, setPanelMode] = useState<PanelMode>('pro');
  const [biomarkers, setBiomarkers] = useState<BiomarkerValues>(PRO_PRESET);

  const applyPreset = (mode: PanelMode) => {
    setPanelMode(mode);
    setBiomarkers(mode === 'pro' ? PRO_PRESET : NATURAL_PRESET);
  };

  const simulation = useMemo(() => {
    const startLbm = weight * (1 - bodyFat / 100);
    const bmr = 370 + 21.6 * startLbm;
    const tdee = bmr * 1.55;

    let kcal = Math.round(tdee);
    let protein = Math.round(startLbm * 2.2);
    let fat = Math.round(weight * 0.9);
    const points: WeekPoint[] = [];

    if (goal === 'enhanced') {
      const glycogenCap =
        (gender === 'men'
          ? experience === 'novice'
            ? 3.0
            : 2.2
          : experience === 'novice'
          ? 1.5
          : 1.1) * discipline;

      const weeklyTissue =
        gender === 'men'
          ? experience === 'novice'
            ? (0.52 + Math.max(0, 75 - weight) * 0.004) * discipline
            : (0.38 + Math.min(20, Math.max(0, weight - 60)) * 0.003) * discipline
          : (experience === 'novice' ? 0.28 : 0.21) * discipline;

      kcal = Math.round(
        tdee + (gender === 'men' ? (experience === 'novice' ? 520 : 450) : 300)
      );
      protein = Math.round(Math.max(weight * 2.2, startLbm * 2.55));
      fat = Math.round(weight * 0.9);

      for (let w = 0; w <= 16; w++) {
        const glycogenGain = w === 0 ? 0 : glycogenCap * (1 - Math.exp(-w / 2.2));
        const tissueGain = weeklyTissue * w;
        const totalWeight = Number((weight + glycogenGain + tissueGain).toFixed(1));
        const leanMass = Number((startLbm + glycogenGain + tissueGain * 0.78).toFixed(1));
        const computedBf = Math.max(
          gender === 'men' ? 7.5 : 14.0,
          Math.min(44, ((totalWeight - leanMass) / totalWeight) * 100)
        );
        points.push({
          week: w,
          totalWeight,
          leanMass,
          bodyFatPct: Number(computedBf.toFixed(1)),
          isBloodCheckpoint: w === 1 || w === 5 || w === 10 || w === 16,
        });
      }
    } else if (goal === 'natural-mass') {
      const weeklyDelta =
        (gender === 'men'
          ? experience === 'novice'
            ? 0.36
            : 0.24
          : experience === 'novice'
          ? 0.22
          : 0.15) * discipline;
      const leanRatio = 0.7;

      kcal = Math.round(
        tdee + (gender === 'men' ? (experience === 'novice' ? 320 : 250) : 200)
      );
      protein = Math.round(startLbm * 2.15);
      fat = Math.round(weight * 0.95);

      for (let w = 0; w <= 16; w++) {
        const progressFactor = w === 0 ? 0 : Math.pow(w / 16, 0.94) * 16;
        const totalWeight = Number((weight + weeklyDelta * progressFactor).toFixed(1));
        const leanMass = Number(
          (startLbm + weeklyDelta * leanRatio * progressFactor).toFixed(1)
        );
        const computedBf = Math.max(
          gender === 'men' ? 7.5 : 14.0,
          Math.min(44, ((totalWeight - leanMass) / totalWeight) * 100)
        );
        points.push({
          week: w,
          totalWeight,
          leanMass,
          bodyFatPct: Number(computedBf.toFixed(1)),
          isBloodCheckpoint: false,
        });
      }
    } else {
      // fat-loss
      const weeklyDelta =
        -Math.max(0.45, weight * (gender === 'men' ? 0.0072 : 0.0062)) * discipline;
      const leanRatio = 0.04;

      kcal = Math.round(tdee * (gender === 'men' ? 0.82 : 0.85));
      protein = Math.round(startLbm * 2.25);
      fat = Math.round(weight * 0.85);

      for (let w = 0; w <= 16; w++) {
        const progressFactor = w === 0 ? 0 : Math.pow(w / 16, 0.94) * 16;
        const totalWeight = Number(
          Math.max(42, weight + weeklyDelta * progressFactor).toFixed(1)
        );
        const leanMass = Number(
          Math.max(30, startLbm + weeklyDelta * leanRatio * progressFactor).toFixed(1)
        );
        const computedBf = Math.max(
          gender === 'men' ? 6.5 : 13.5,
          Math.min(44, ((totalWeight - leanMass) / totalWeight) * 100)
        );
        points.push({
          week: w,
          totalWeight,
          leanMass,
          bodyFatPct: Number(computedBf.toFixed(1)),
          isBloodCheckpoint: false,
        });
      }
    }

    const carbs = Math.max(80, Math.round((kcal - protein * 4 - fat * 9) / 4));
    const startPoint = points[0];
    const finalPoint = points[16];
    const weightDiff = Number((finalPoint.totalWeight - startPoint.totalWeight).toFixed(1));
    const lbmDiff = Number((finalPoint.leanMass - startPoint.leanMass).toFixed(1));
    const bfDiff = Number((finalPoint.bodyFatPct - startPoint.bodyFatPct).toFixed(1));

    return {
      points,
      startLbm: Number(startLbm.toFixed(1)),
      macros: { kcal, protein, fat, carbs },
      weightDiff,
      lbmDiff,
      bfDiff,
      finalPoint,
    };
  }, [gender, goal, experience, weight, bodyFat, discipline]);

  // Biomarker Radar Readiness Calculation (8 Markers)
  const biomarkerSummary = useMemo(() => {
    let score = 100;
    let alertCount = 0;
    let borderlineCount = 0;

    const evaluated = BIOMARKERS.map((cfg) => {
      const value = biomarkers[cfg.id];
      const result = cfg.evaluate(value, panelMode);
      if (result.status === 'alert') {
        score -= 20;
        alertCount += 1;
      } else if (result.status === 'borderline') {
        score -= 8;
        borderlineCount += 1;
      }
      return { cfg, value, ...result };
    });

    const clampedScore = Math.max(15, score);
    let readinessLabel = 'Готов к прогрессии';
    let readinessTone: 'optimal' | 'borderline' | 'alert' = 'optimal';

    if (alertCount > 0) {
      readinessLabel = 'Требуется консультация врача';
      readinessTone = 'alert';
    } else if (borderlineCount > 0) {
      readinessLabel = 'Нужна коррекция объёма';
      readinessTone = 'borderline';
    }

    return {
      evaluated,
      score: clampedScore,
      readinessLabel,
      readinessTone,
    };
  }, [biomarkers, panelMode]);

  // SVG Chart Geometry
  const chart = useMemo(() => {
    const width = 640;
    const height = 250;
    const padL = 44;
    const padR = 20;
    const padT = 20;
    const padB = 34;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const allVals = simulation.points.flatMap((p) => [p.totalWeight, p.leanMass]);
    const minVal = Math.floor(Math.min(...allVals) - 4);
    const maxVal = Math.ceil(Math.max(...allVals) + 4);
    const span = Math.max(10, maxVal - minVal);

    const xOf = (w: number) => padL + (w / 16) * plotW;
    const yOf = (v: number) => padT + plotH - ((v - minVal) / span) * plotH;

    const weightLine = simulation.points
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(p.week).toFixed(1)} ${yOf(p.totalWeight).toFixed(1)}`
      )
      .join(' ');

    const weightArea = `${weightLine} L ${xOf(16).toFixed(1)} ${(padT + plotH).toFixed(
      1
    )} L ${xOf(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

    const lbmLine = simulation.points
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'} ${xOf(p.week).toFixed(1)} ${yOf(p.leanMass).toFixed(1)}`
      )
      .join(' ');

    const yTicks = [minVal, Math.round(minVal + span * 0.5), maxVal];

    return {
      width,
      height,
      padL,
      padR,
      padT,
      padB,
      plotH,
      xOf,
      yOf,
      weightLine,
      weightArea,
      lbmLine,
      yTicks,
    };
  }, [simulation]);

  const activeWeekPoint = simulation.points[selectedWeek] ?? simulation.points[16];

  const handleTransferToApply = () => {
    const goalText =
      goal === 'fat-loss'
        ? 'Похудение и рекомпозиция'
        : goal === 'natural-mass'
        ? 'Натуральный набор'
        : 'Фарм-сопровождение (PRO)';

    const expText = experience === 'novice' ? 'С нуля / 1-й блок' : 'Опытный атлет';
    const diffPrefix = simulation.weightDiff > 0 ? `+${simulation.weightDiff}` : simulation.weightDiff;

    const diagnosticNote = `VECTRA BODY OS (${goalText}, ${expText}): старт ${weight} кг (${bodyFat}% жира, LBM ${simulation.startLbm} кг) → прогноз за 16 нед: ${simulation.finalPoint.totalWeight} кг (${diffPrefix} кг, LBM ${simulation.finalPoint.leanMass} кг, ${simulation.finalPoint.bodyFatPct}% жира), ориентир ${simulation.macros.kcal} ккал (Б ${simulation.macros.protein} / Ж ${simulation.macros.fat} / У ${simulation.macros.carbs}) | Радар крови (${panelMode === 'pro' ? 'PRO' : 'Натур'}): Т общ ${biomarkers.totalTest} нмоль/л, Т своб ${biomarkers.freeTest} пг/мл, готовность ${biomarkerSummary.score}% (${biomarkerSummary.readinessLabel}).`;

    onApplyDiagnostic({
      gender,
      goal,
      format: 'online',
      diagnosticNote,
    });
  };

  return (
    <section
      id="body-os"
      className={`bg-[#05080E] bg-blueprint-grid ${
        standalone ? 'py-10 lg:py-14' : 'scroll-mt-20 border-t border-white/[0.08] py-20 lg:py-28'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
              <Pulse size={15} weight="regular" aria-hidden="true" />
              <span>VECTRA BODY OS • АНАЛИТИЧЕСКИЙ МОДУЛЬ</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              Личный кабинет физиологии и биомаркеров
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
              Рассчитайте реалистичную траекторию веса и сухой массы с учётом стартовой базы,
              гликогеновой наполненности и гормонального профиля.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg border border-[#3B82F6]/30 bg-[#0A1120]/90 px-3.5 py-2 font-mono text-xs text-[#93C5FD] lg:self-auto">
            <LockOpen size={15} weight="regular" aria-hidden="true" />
            <span>Живой предпросмотр кабинета</span>
          </div>
        </div>

        {/* OS Window Container */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/12 bg-[#0A1120]/95 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]">
          {/* OS Top Window Chrome */}
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-[#05080E]/80 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              </div>
              <span className="font-mono text-xs font-semibold tracking-wider text-[#CBD5E1]">
                VECTRA BODY OS • DEMO КАБИНЕТА
              </span>
            </div>

            {/* OS Mode Tabs */}
            <div
              role="tablist"
              aria-label="Модули VECTRA BODY OS"
              className="inline-flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0A1120] p-1"
            >
              <button
                type="button"
                role="tab"
                id="tab-simulator"
                aria-selected={activeTab === 'simulator'}
                aria-controls="panel-simulator"
                onClick={() => setActiveTab('simulator')}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  activeTab === 'simulator'
                    ? 'text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {activeTab === 'simulator' && (
                  <motion.span
                    layoutId="body-os-tab"
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#182742]"
                  />
                )}
                <ChartLineUp
                  size={16}
                  weight="regular"
                  className="relative z-10 text-[#3B82F6]"
                  aria-hidden="true"
                />
                <span className="relative z-10">Симулятор прогресса 16 нед.</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-biomarkers"
                aria-selected={activeTab === 'biomarkers'}
                aria-controls="panel-biomarkers"
                onClick={() => setActiveTab('biomarkers')}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  activeTab === 'biomarkers'
                    ? 'text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {activeTab === 'biomarkers' && (
                  <motion.span
                    layoutId="body-os-tab"
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#182742]"
                  />
                )}
                <Drop
                  size={16}
                  weight="regular"
                  className="relative z-10 text-[#3B82F6]"
                  aria-hidden="true"
                />
                <span className="relative z-10">Радар биомаркеров крови (8)</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Panels */}
          <div className="p-5 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'simulator' ? (
                <motion.div
                  key="simulator"
                  id="panel-simulator"
                  role="tabpanel"
                  aria-labelledby="tab-simulator"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="grid grid-cols-1 gap-8 lg:grid-cols-12"
                >
                  {/* Left 5 Cols: Physiological Inputs */}
                  <div className="space-y-5 rounded-xl border border-white/10 bg-[#05080E]/85 p-5 sm:p-6 lg:col-span-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                        Входные параметры
                      </span>
                      <span className="font-mono text-xs text-[#3B82F6] tabular-nums">
                        LBM старт: {simulation.startLbm} кг
                      </span>
                    </div>

                    {/* Gender */}
                    <div>
                      <span className="block text-xs font-semibold text-[#CBD5E1]">Пол атлета</span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          { id: 'men' as GenderId, label: 'Мужчина' },
                          { id: 'women' as GenderId, label: 'Женщина' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setGender(item.id)}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                              gender === item.id
                                ? 'border-[#3B82F6] bg-[#111C30] text-white'
                                : 'border-white/10 bg-[#0A1120] text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Goal */}
                    <div>
                      <span className="block text-xs font-semibold text-[#CBD5E1]">Сценарий блока</span>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {[
                          { id: 'fat-loss' as TrackId, label: 'Похудение и рекомпозиция' },
                          { id: 'natural-mass' as TrackId, label: 'Натуральный набор массы' },
                          { id: 'enhanced' as TrackId, label: 'Фарм-поддержка PRO' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setGoal(item.id)}
                            className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors sm:text-sm ${
                              goal === item.id
                                ? 'border-[#3B82F6] bg-[#111C30] text-white'
                                : 'border-white/10 bg-[#0A1120] text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            <span>{item.label}</span>
                            {item.id === 'enhanced' && (
                              <span className="rounded bg-[#182742] px-1.5 py-0.5 font-mono text-[10px] text-[#93C5FD]">
                                + АНАЛИЗЫ
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Base Experience */}
                    <div>
                      <span className="block text-xs font-semibold text-[#CBD5E1]">
                        Уровень базы / опыт
                      </span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          { id: 'novice' as BaseExperience, label: 'С нуля / 1-й блок' },
                          { id: 'experienced' as BaseExperience, label: 'Опытный атлет' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setExperience(item.id)}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                              experience === item.id
                                ? 'border-[#3B82F6] bg-[#111C30] text-white'
                                : 'border-white/10 bg-[#0A1120] text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weight Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <label htmlFor="sim-weight" className="text-[#CBD5E1]">
                          Текущий вес
                        </label>
                        <span className="font-mono text-sm text-[#F1F5F9] tabular-nums">
                          {weight} кг
                        </span>
                      </div>
                      <input
                        id="sim-weight"
                        type="range"
                        min={45}
                        max={135}
                        step={1}
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="vectra-range mt-2.5"
                      />
                    </div>

                    {/* Body Fat Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <label htmlFor="sim-bf" className="text-[#CBD5E1]">
                          Процент жира (ориентир)
                        </label>
                        <span className="font-mono text-sm text-[#F1F5F9] tabular-nums">
                          {bodyFat}%
                        </span>
                      </div>
                      <input
                        id="sim-bf"
                        type="range"
                        min={10}
                        max={38}
                        step={1}
                        value={bodyFat}
                        onChange={(e) => setBodyFat(Number(e.target.value))}
                        className="vectra-range mt-2.5"
                      />
                    </div>

                    {/* Discipline */}
                    <div>
                      <span className="block text-xs font-semibold text-[#CBD5E1]">
                        Дисциплина соблюдения (питание + сон + зал)
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          { val: 0.8 as DisciplineLevel, label: '80%' },
                          { val: 0.9 as DisciplineLevel, label: '90%' },
                          { val: 1.0 as DisciplineLevel, label: '100%' },
                        ].map((d) => (
                          <button
                            key={d.label}
                            type="button"
                            onClick={() => setDiscipline(d.val)}
                            className={`rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition-colors ${
                              discipline === d.val
                                ? 'border-[#3B82F6] bg-[#111C30] text-white'
                                : 'border-white/10 bg-[#0A1120] text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right 7 Cols: Dual-Series SVG Chart + KPIs + Table Fallback */}
                  <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
                    <div className="rounded-xl border border-white/10 bg-[#05080E]/85 p-5 sm:p-6">
                      {/* Chart Header & Non-color-only Legend */}
                      <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
                        <div>
                          <div className="font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                            Траектория на 16 недель
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#E2E8F0]">
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-block h-0.5 w-5 bg-[#3B82F6]" aria-hidden="true" />
                              <span>Общий вес (кг)</span>
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[#93C5FD]"
                                aria-hidden="true"
                              />
                              <span>Сухая масса LBM (кг)</span>
                            </span>
                            {goal === 'enhanced' && (
                              <span className="inline-flex items-center gap-1.5 text-[#93C5FD]">
                                <span
                                  className="inline-block h-2 w-2 rotate-45 border border-[#93C5FD] bg-[#182742]"
                                  aria-hidden="true"
                                />
                                <span>Чек-ин анализов крови</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowTable((prev) => !prev)}
                          aria-expanded={showTable}
                          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/12 bg-[#0A1120] px-3 py-1.5 font-mono text-xs text-[#CBD5E1] transition-colors hover:border-[#3B82F6] hover:text-white sm:self-auto"
                        >
                          <Table size={14} weight="regular" aria-hidden="true" />
                          <span>{showTable ? 'Скрыть таблицу' : 'Таблица данных'}</span>
                        </button>
                      </div>

                      {/* Responsive Accessible SVG Chart */}
                      <div className="mt-4">
                        <svg
                          viewBox={`0 0 ${chart.width} ${chart.height}`}
                          className="h-auto w-full overflow-visible"
                          role="img"
                          aria-label={`График прогноза веса и сухой мышечной массы на 16 недель: старт ${weight} кг, итог ${simulation.finalPoint.totalWeight} кг`}
                        >
                          <defs>
                            <linearGradient id="vectraAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.24" />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Gridlines + Y Labels */}
                          {chart.yTicks.map((tick) => {
                            const y = chart.yOf(tick);
                            return (
                              <g key={tick}>
                                <line
                                  x1={chart.padL}
                                  y1={y}
                                  x2={chart.width - chart.padR}
                                  y2={y}
                                  stroke="rgba(148,163,184,0.12)"
                                  strokeDasharray="3 3"
                                />
                                <text
                                  x={chart.padL - 8}
                                  y={y + 4}
                                  textAnchor="end"
                                  fill="#64748B"
                                  fontSize="11"
                                  fontFamily="JetBrains Mono, monospace"
                                >
                                  {tick}
                                </text>
                              </g>
                            );
                          })}

                          {/* X Axis Labels */}
                          {CHECKPOINT_WEEKS.map((wk) => {
                            const x = chart.xOf(wk);
                            return (
                              <text
                                key={wk}
                                x={x}
                                y={chart.height - 8}
                                textAnchor="middle"
                                fill={selectedWeek === wk ? '#93C5FD' : '#64748B'}
                                fontSize="11"
                                fontFamily="JetBrains Mono, monospace"
                              >
                                Нед {wk}
                              </text>
                            );
                          })}

                          {/* Area Fill + Weight Solid Curve */}
                          <path d={chart.weightArea} fill="url(#vectraAreaGrad)" />
                          <path
                            d={chart.weightLine}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* LBM Dashed Curve */}
                          <path
                            d={chart.lbmLine}
                            fill="none"
                            stroke="#93C5FD"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            strokeLinecap="round"
                          />

                          {/* Selected Week Vertical Guide */}
                          <line
                            x1={chart.xOf(activeWeekPoint.week)}
                            y1={chart.padT}
                            x2={chart.xOf(activeWeekPoint.week)}
                            y2={chart.padT + chart.plotH}
                            stroke="rgba(59,130,246,0.45)"
                            strokeWidth="1.2"
                          />

                          {/* Blood Checkpoint Diamonds for PRO */}
                          {simulation.points
                            .filter((p) => p.isBloodCheckpoint)
                            .map((p) => {
                              const cx = chart.xOf(p.week);
                              const cy = chart.yOf(p.totalWeight) - 12;
                              return (
                                <polygon
                                  key={`blood-${p.week}`}
                                  points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`}
                                  fill="#182742"
                                  stroke="#93C5FD"
                                  strokeWidth="1.5"
                                />
                              );
                            })}

                          {/* Interactive Checkpoint Dots */}
                          {CHECKPOINT_WEEKS.map((wk) => {
                            const pt = simulation.points[wk];
                            const isSelected = selectedWeek === wk;
                            return (
                              <g key={`dot-${wk}`}>
                                <circle
                                  cx={chart.xOf(pt.week)}
                                  cy={chart.yOf(pt.totalWeight)}
                                  r={isSelected ? 5.5 : 4}
                                  fill={isSelected ? '#F1F5F9' : '#3B82F6'}
                                  stroke="#05080E"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx={chart.xOf(pt.week)}
                                  cy={chart.yOf(pt.leanMass)}
                                  r={isSelected ? 4.5 : 3}
                                  fill="#93C5FD"
                                  stroke="#05080E"
                                  strokeWidth="1.5"
                                />
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* Keyboard & Mouse Week Inspector */}
                      <div className="mt-4 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Выбор контрольной недели">
                          {CHECKPOINT_WEEKS.map((wk) => (
                            <button
                              key={wk}
                              type="button"
                              onClick={() => setSelectedWeek(wk)}
                              aria-pressed={selectedWeek === wk}
                              className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                                selectedWeek === wk
                                  ? 'border-[#3B82F6] bg-[#182742] text-white'
                                  : 'border-white/10 bg-[#0A1120] text-[#94A3B8] hover:text-white'
                              }`}
                            >
                              Нед {wk}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 font-mono text-xs tabular-nums">
                          <span className="text-[#CBD5E1]">
                            Вес: <strong className="text-white">{activeWeekPoint.totalWeight} кг</strong>
                          </span>
                          <span className="text-[#CBD5E1]">
                            LBM: <strong className="text-[#93C5FD]">{activeWeekPoint.leanMass} кг</strong>
                          </span>
                          <span className="text-[#CBD5E1]">
                            Жир: <strong className="text-white">{activeWeekPoint.bodyFatPct}%</strong>
                          </span>
                        </div>
                      </div>

                      {/* Accessible Data Table Fallback */}
                      {showTable && (
                        <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-[#0A1120]">
                          <table className="w-full text-left font-mono text-xs tabular-nums">
                            <thead className="border-b border-white/10 text-[#94A3B8]">
                              <tr>
                                <th className="px-3 py-2">Неделя</th>
                                <th className="px-3 py-2">Вес (кг)</th>
                                <th className="px-3 py-2">Сухая масса LBM (кг)</th>
                                <th className="px-3 py-2">% жира</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06] text-[#E2E8F0]">
                              {CHECKPOINT_WEEKS.map((wk) => {
                                const pt = simulation.points[wk];
                                return (
                                  <tr key={wk}>
                                    <td className="px-3 py-2">Нед {pt.week}</td>
                                    <td className="px-3 py-2">{pt.totalWeight}</td>
                                    <td className="px-3 py-2">{pt.leanMass}</td>
                                    <td className="px-3 py-2">{pt.bodyFatPct}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* 4 KPI Cards below Chart */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border border-white/10 bg-[#05080E]/85 p-4">
                        <div className="font-mono text-[11px] uppercase text-[#94A3B8]">
                          Вес через 16 нед.
                        </div>
                        <div className="mt-1.5 font-mono text-xl font-bold text-white tabular-nums">
                          {simulation.finalPoint.totalWeight} кг
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-[#93C5FD] tabular-nums">
                          {simulation.weightDiff > 0
                            ? `+${simulation.weightDiff}`
                            : simulation.weightDiff}{' '}
                          кг
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#05080E]/85 p-4">
                        <div className="font-mono text-[11px] uppercase text-[#94A3B8]">
                          Сухая масса LBM
                        </div>
                        <div className="mt-1.5 font-mono text-xl font-bold text-white tabular-nums">
                          {simulation.finalPoint.leanMass} кг
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-[#93C5FD] tabular-nums">
                          {simulation.lbmDiff > 0 ? `+${simulation.lbmDiff}` : simulation.lbmDiff} кг
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#05080E]/85 p-4">
                        <div className="font-mono text-[11px] uppercase text-[#94A3B8]">
                          Жировая ткань
                        </div>
                        <div className="mt-1.5 font-mono text-xl font-bold text-white tabular-nums">
                          {simulation.finalPoint.bodyFatPct}%
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-[#93C5FD] tabular-nums">
                          {simulation.bfDiff > 0 ? `+${simulation.bfDiff}` : simulation.bfDiff}%
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#05080E]/85 p-4">
                        <div className="font-mono text-[11px] uppercase text-[#94A3B8]">
                          Ориентир КБЖУ
                        </div>
                        <div className="mt-1.5 font-mono text-xl font-bold text-white tabular-nums">
                          {simulation.macros.kcal}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-[#94A3B8] tabular-nums">
                          Б {simulation.macros.protein} • Ж {simulation.macros.fat} • У{' '}
                          {simulation.macros.carbs}
                        </div>
                      </div>
                    </div>

                    {goal === 'enhanced' && (
                      <div className="rounded-xl border border-[#3B82F6]/30 bg-[#111C30]/60 px-4 py-3 text-xs leading-relaxed text-[#CBD5E1]">
                        <strong className="font-semibold text-[#93C5FD]">Учёт гликогена и удержания:</strong>{' '}
                        прогноз включает стартовый скачок внутримышечного гликогена и азотистого
                        баланса в первые 3–4 недели. После выхода на ПКТ / мост удерживается ~80–85%
                        набранной сухой массы после ухода избыточной воды.
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="biomarkers"
                  id="panel-biomarkers"
                  role="tabpanel"
                  aria-labelledby="tab-biomarkers"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="grid grid-cols-1 gap-8 lg:grid-cols-12"
                >
                  {/* Left 4 Cols: Readiness Score + Presets */}
                  <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#05080E]/85 p-6 lg:col-span-4">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                        <Gauge size={16} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
                        <span>Индекс готовности организма</span>
                      </div>

                      <div className="mt-5 flex items-baseline gap-3">
                        <span className="font-mono text-5xl font-bold tracking-tight text-white tabular-nums">
                          {biomarkerSummary.score}%
                        </span>
                      </div>

                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold ${
                            biomarkerSummary.readinessTone === 'optimal'
                              ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                              : biomarkerSummary.readinessTone === 'borderline'
                              ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
                              : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                          }`}
                        >
                          {biomarkerSummary.readinessTone === 'optimal' ? (
                            <CheckCircle size={15} weight="regular" aria-hidden="true" />
                          ) : biomarkerSummary.readinessTone === 'borderline' ? (
                            <Warning size={15} weight="regular" aria-hidden="true" />
                          ) : (
                            <WarningCircle size={15} weight="regular" aria-hidden="true" />
                          )}
                          <span>{biomarkerSummary.readinessLabel}</span>
                        </span>
                      </div>

                      <div className="mt-6 border-t border-white/10 pt-5">
                        <span className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                          Режим референсов и пресеты
                        </span>
                        <div className="mt-3 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => applyPreset('natural')}
                            aria-pressed={panelMode === 'natural'}
                            className={`rounded-lg border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                              panelMode === 'natural'
                                ? 'border-[#3B82F6] bg-[#111C30] text-white'
                                : 'border-white/12 bg-[#0A1120] text-[#E2E8F0] hover:border-[#3B82F6]'
                            }`}
                          >
                            Натуральный чек-ап (оптимум)
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('pro')}
                            aria-pressed={panelMode === 'pro'}
                            className={`rounded-lg border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                              panelMode === 'pro'
                                ? 'border-[#3B82F6] bg-[#111C30] text-[#93C5FD]'
                                : 'border-[#3B82F6]/35 bg-[#0A1120] text-[#93C5FD] hover:border-[#3B82F6]'
                            }`}
                          >
                            PRO / Фарм-контроль (середина блока)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-white/10 bg-[#0A1120] p-3.5 text-xs leading-relaxed text-[#94A3B8]">
                      <ShieldCheck
                        size={18}
                        weight="regular"
                        className="mt-0.5 shrink-0 text-[#3B82F6]"
                        aria-hidden="true"
                      />
                      <span>
                        Инструмент носит справочно-тренировочный характер. При статусе «К врачу»
                        тренировочные пики снимаются до очной консультации со специалистом.
                      </span>
                    </div>
                  </div>

                  {/* Right 8 Cols: 8 Interactive Biomarkers (incl. Total & Free Testosterone) */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
                    {biomarkerSummary.evaluated.map(({ cfg, value, status, badgeText, note }) => {
                      const badgeStyles =
                        status === 'optimal'
                          ? 'border-emerald-500/35 bg-emerald-950/35 text-emerald-300'
                          : status === 'borderline'
                          ? 'border-amber-500/35 bg-amber-950/35 text-amber-300'
                          : 'border-rose-500/40 bg-rose-950/40 text-rose-300';

                      return (
                        <div
                          key={cfg.id}
                          className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#05080E]/85 p-4 sm:p-5"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <label
                                  htmlFor={`bio-${cfg.id}`}
                                  className="text-sm font-bold text-[#F1F5F9]"
                                >
                                  {cfg.name}
                                </label>
                                <div className="font-mono text-[11px] text-[#94A3B8]">
                                  Оптимум: {cfg.optimalLabel(panelMode)}
                                </div>
                              </div>

                              <span
                                className={`inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] font-semibold ${badgeStyles}`}
                              >
                                {status === 'optimal' ? (
                                  <CheckCircle size={12} weight="regular" aria-hidden="true" />
                                ) : status === 'borderline' ? (
                                  <Warning size={12} weight="regular" aria-hidden="true" />
                                ) : (
                                  <WarningCircle size={12} weight="regular" aria-hidden="true" />
                                )}
                                <span>{badgeText}</span>
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <input
                                id={`bio-${cfg.id}`}
                                type="range"
                                min={cfg.min}
                                max={cfg.max}
                                step={cfg.step}
                                value={value}
                                onChange={(e) =>
                                  setBiomarkers((prev) => ({
                                    ...prev,
                                    [cfg.id]: Number(e.target.value),
                                  }))
                                }
                                className="vectra-range"
                              />
                              <span className="w-24 shrink-0 text-right font-mono text-sm font-semibold text-white tabular-nums">
                                {value} {cfg.unit}
                              </span>
                            </div>
                          </div>

                          <p className="mt-3 border-t border-white/[0.06] pt-2.5 text-xs leading-relaxed text-[#94A3B8]">
                            {note}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Monetization Tie-in Footer */}
          <div className="flex flex-col justify-between gap-4 border-t border-white/10 bg-[#05080E]/90 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div className="max-w-2xl text-xs leading-relaxed text-[#94A3B8] sm:text-sm">
              <strong className="font-semibold text-[#F1F5F9]">Почему клиенты остаются в VECTRA:</strong>{' '}
              в платном ведении этот кабинет синхронизируется с тренером — автоматический пересчёт
              КБЖУ по динамике веса, история анализов (включая общий и свободный тестостерон) и
              архив видеоразборов в одном месте.
            </div>
            <button
              type="button"
              onClick={handleTransferToApply}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] active:scale-[0.98]"
            >
              <span>Перенести мой расчёт в заявку</span>
              <ArrowRight size={16} weight="regular" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
