import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05080E] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="text-sm font-extrabold tracking-[0.18em] text-[#F1F5F9]">
                VECTRA
              </span>
              <span className="font-mono text-[10px] tracking-widest text-[#94A3B8]">
                ATHLETIC OS
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
              Персональное и онлайн-ведение тренировок для мужчин и женщин: снижение веса,
              натуральный набор и PRO-сопровождение с контролем анализов.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#94A3B8]" aria-label="Навигация подвала">
            <Link to="/" className="hover:text-white">Обзор</Link>
            <Link to="/body-os" className="text-[#93C5FD] hover:text-white">BODY OS</Link>
            <Link to="/atlas" className="hover:text-white">Атлас</Link>
            <Link to="/directions" className="hover:text-white">Направления</Link>
            <Link to="/results" className="hover:text-white">Кейсы</Link>
            <Link to="/pricing" className="hover:text-white">Тарифы</Link>
            <Link to="/apply" className="hover:text-white">Заявка</Link>
          </nav>
        </div>

        {/* Medical / Legal Disclaimer */}
        <div className="mt-10 border-t border-white/[0.08] pt-6 text-xs leading-relaxed text-[#94A3B8]">
          <p>
            Важное уведомление: материалы платформы и направление «Фарм-сопровождение (PRO)»
            носят исключительно информационно-методический характер в части планирования
            тренировочных нагрузок, нутрициологии и интерпретации лабораторных биомаркеров.
            Проект не осуществляет продажу, распространение или назначение лекарственных средств
            и сильнодействующих веществ. Любые медицинские решения и назначения должны
            согласовываться с лечащим врачом на основании очной диагностики.
          </p>
          <p className="mt-3 font-mono text-[11px] text-[#64748B]">
            © {new Date().getFullYear()} VECTRA Athletic Lab. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
