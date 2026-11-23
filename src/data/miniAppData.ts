export interface QuickFoodItem {
  id: string;
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  category: 'protein' | 'carbs' | 'fats';
}

export interface LoggedMeal {
  id: string;
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  time: string;
}

export interface NutritionTargets {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface ReminderConfig {
  gym: {
    enabled: boolean;
    days: number[]; // 1=Пн .. 7=Вс
    time: string;
    note: string;
  };
  meals: {
    enabled: boolean;
    times: string[];
  };
  bloodwork: {
    enabled: boolean;
    intervalDays: number;
    nextDate: string; // YYYY-MM-DD
    time: string;
    panel: 'base' | 'pro';
  };
}

export interface NutritionTip {
  id: string;
  category: 'protein' | 'carbs' | 'fats' | 'timing';
  categoryLabel: string;
  title: string;
  highlightMetric: string;
  body: string;
  quickFoodId?: string;
}

export const QUICK_FOODS: QuickFoodItem[] = [
  {
    id: 'salmon',
    name: 'Красная рыба (лосось/форель)',
    portion: '150 г',
    kcal: 312,
    protein: 31,
    fat: 20,
    carbs: 0,
    category: 'protein',
  },
  {
    id: 'chicken',
    name: 'Куриная грудка / индейка',
    portion: '200 г',
    kcal: 220,
    protein: 46,
    fat: 4,
    carbs: 0,
    category: 'protein',
  },
  {
    id: 'eggs',
    name: 'Яйца куриные С0',
    portion: '3 шт.',
    kcal: 234,
    protein: 19,
    fat: 16,
    carbs: 1,
    category: 'protein',
  },
  {
    id: 'cottage',
    name: 'Творог 5%',
    portion: '200 г',
    kcal: 242,
    protein: 34,
    fat: 10,
    carbs: 4,
    category: 'protein',
  },
  {
    id: 'beef',
    name: 'Постная говядина',
    portion: '180 г',
    kcal: 336,
    protein: 47,
    fat: 16,
    carbs: 0,
    category: 'protein',
  },
  {
    id: 'buckwheat',
    name: 'Гречка / рис (варёные)',
    portion: '200 г',
    kcal: 260,
    protein: 8,
    fat: 2,
    carbs: 56,
    category: 'carbs',
  },
  {
    id: 'oats',
    name: 'Овсянка (в сухом виде)',
    portion: '70 г',
    kcal: 255,
    protein: 9,
    fat: 4,
    carbs: 44,
    category: 'carbs',
  },
  {
    id: 'whey',
    name: 'Сывороточный протеин',
    portion: '35 г',
    kcal: 135,
    protein: 27,
    fat: 2,
    carbs: 3,
    category: 'protein',
  },
  {
    id: 'avocado',
    name: 'Авокадо',
    portion: '100 г',
    kcal: 160,
    protein: 2,
    fat: 15,
    carbs: 2,
    category: 'fats',
  },
  {
    id: 'salad',
    name: 'Овощи + олив. масло (10 г)',
    portion: '250 г',
    kcal: 145,
    protein: 2,
    fat: 10,
    carbs: 12,
    category: 'fats',
  },
];

export const NUTRITION_TIPS: NutritionTip[] = [
  {
    id: 'tip-red-fish',
    category: 'protein',
    categoryLabel: 'Белок и жиры',
    title: 'Красная рыба: двойной удар по белку и Омега-3',
    highlightMetric: '~21 г белка на 100 г (31 г в стейке 150 г)',
    body: 'В 100 г слабосолёного или запечённого лосося / форели содержится 20–23 г полноценного белка (в порции 150 г — около 31 г) и более 2 г EPA/DHA. Это помогает одновременно добирать норму белка и удерживать чистый липидный профиль (ЛПНП/ЛПВП).',
    quickFoodId: 'salmon',
  },
  {
    id: 'tip-dry-vs-cooked',
    category: 'carbs',
    categoryLabel: 'Углеводы',
    title: 'Крупы всегда взвешивайте в сухом виде',
    highlightMetric: '100 г сухой гречки = ~320 ккал → ~280 г варёной',
    body: 'Варёная крупа вбирает воду от 2.5 до 3.5 раз по весу в зависимости от времени варки. Ошибка между сухим и варёным весом легко даёт промах на 400–600 ккал в сутки и ломает темп похудения или набора.',
    quickFoodId: 'buckwheat',
  },
  {
    id: 'tip-leucine-split',
    category: 'timing',
    categoryLabel: 'Тайминг',
    title: 'Распределяйте белок по 30–45 г на приём пищи',
    highlightMetric: '3–4 г лейцина запускают синтез белка',
    body: 'Вместо одного гигантского ужина на 100 г белка делите суточную норму на 3–5 приёмов по 30–45 г белка. Это поддерживает стабильный уровень аминокислот в крови и снижает вечерний голод на дефиците.',
    quickFoodId: 'chicken',
  },
  {
    id: 'tip-egg-yolks',
    category: 'fats',
    categoryLabel: 'Жиры и анализы',
    title: 'Не выбрасывайте все желтки без причины',
    highlightMetric: '3 цельных яйца = ~19 г белка + холин',
    body: 'Яичный белок усваивается почти на 95%, но именно в желтке находятся витамины A, D, E, K2 и холин для работы нервной системы и синтеза стероидных гормонов. При нормальных липидах 2–4 цельных яйца в день — идеальный завтрак.',
    quickFoodId: 'eggs',
  },
  {
    id: 'tip-fiber-ldl',
    category: 'fats',
    categoryLabel: 'Жиры и анализы',
    title: 'Минимум 30 г клетчатки для ЖКТ и сосудов',
    highlightMetric: '400–500 г овощей + ягоды / зелень ежедневно',
    body: 'При высокобелковом рационе (особенно на массонаборе или PRO-блоке) нехватка клетчатки бьёт по усвоению белка и повышает уровень «плохого» холестерина ЛПНП. Добавляйте овощи к каждому основному приёму пищи.',
    quickFoodId: 'salad',
  },
  {
    id: 'tip-pre-workout',
    category: 'timing',
    categoryLabel: 'Тайминг',
    title: 'Углеводы за 60–90 минут до тяжёлой тренировки',
    highlightMetric: '45–70 г сложных углеводов + щепотка соли',
    body: 'Гликоген и умеренная доза натрия перед залом дают лучший памп, удерживают рабочие веса на 10–15% дольше в подходе и снижают риск гипогликемии к концу тренировки ног или спины.',
    quickFoodId: 'oats',
  },
  {
    id: 'tip-night-casein',
    category: 'protein',
    categoryLabel: 'Белок',
    title: 'Творог или казеин на ужин гасят ночной голод',
    highlightMetric: '200 г творога 5% = 34 г «долгого» белка',
    body: 'Казеиновый белок творога переваривается 5–7 часов, плавно снабжая мышцы аминокислотами во сне и предотвращая ночные срывы к холодильнику на сушке.',
    quickFoodId: 'cottage',
  },
  {
    id: 'tip-red-meat',
    category: 'protein',
    categoryLabel: 'Белок',
    title: 'Постная говядина 2–3 раза в неделю для железа и креатина',
    highlightMetric: '180 г = ~47 г белка + гемовое железо',
    body: 'Красное мясо богато гемовым железом (критично для ферритина, особенно у девушек), цинком, B12 и натуральным креатином — это напрямую влияет на энергию и восстановление ЦНС.',
    quickFoodId: 'beef',
  },
  {
    id: 'tip-hydration',
    category: 'fats',
    categoryLabel: 'Жиры и анализы',
    title: 'Вода 35–40 мл/кг и контроль гематокрита',
    highlightMetric: '2.5–3.5 л чистой воды в сутки',
    body: 'Даже лёгкое обезвоживание искусственно завышает гематокрит в анализах крови на 2–3% и снижает силовую выносливость. Выпивайте 400–500 мл воды сразу после пробуждения.',
  },
  {
    id: 'tip-whey-speed',
    category: 'timing',
    categoryLabel: 'Тайминг',
    title: 'Сывороточный протеин — инструмент добора, а не замена еды',
    highlightMetric: '35 г порции = 27 г белка всего за 135 ккал',
    body: 'Когда по калориям осталось мало места, а белка не хватает — 1–2 скупа изолята/концентрата закрывают дефицит белка с минимальными жирами и углеводами.',
    quickFoodId: 'whey',
  },
];

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultNextBloodDate(): string {
  const d = new Date(Date.now() + 28 * 86400_000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function createDefaultReminders(): ReminderConfig {
  return {
    gym: {
      enabled: true,
      days: [1, 3, 5],
      time: '18:30',
      note: 'Силовая тренировка + разминка плеч/таза',
    },
    meals: {
      enabled: true,
      times: ['09:00', '13:30', '17:30', '21:00'],
    },
    bloodwork: {
      enabled: true,
      intervalDays: 28,
      nextDate: getDefaultNextBloodDate(),
      time: '08:00',
      panel: 'pro',
    },
  };
}
