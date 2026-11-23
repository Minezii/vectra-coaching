import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CaretRight, Sliders } from '@phosphor-icons/react';
import { DirectionsSection } from '../components/DirectionsSection';
import { ProtocolBuilder, SelectedProtocol } from '../components/ProtocolBuilder';

export function DirectionsPage({
  onApplyProtocol,
}: {
  onApplyProtocol: (protocol: SelectedProtocol) => void;
}) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Top Breadcrumb / Module Status Strip */}
      <div className="bg-[#0A1120]/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <nav
            aria-label="Навигация по разделу"
            className="flex items-center gap-2 text-xs"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-medium text-[#94A3B8] transition-colors hover:text-[#F1F5F9]"
            >
              <ArrowLeft size={14} weight="regular" aria-hidden="true" />
              <span>Обзор</span>
            </Link>
            <CaretRight
              size={12}
              weight="regular"
              className="text-[#475569]"
              aria-hidden="true"
            />
            <span className="font-mono font-semibold tracking-wider text-[#F1F5F9]">
              НАПРАВЛЕНИЯ И КОНСТРУКТОР
            </span>
          </nav>

          <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#111C30] px-2.5 py-1">
            <Sliders
              size={14}
              weight="regular"
              className="text-[#3B82F6]"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#CBD5E1]">
              3 трека • Онлайн и зал
            </span>
          </div>
        </div>
      </div>

      <DirectionsSection />
      <ProtocolBuilder
        onApplyProtocol={(p) => {
          onApplyProtocol(p);
          navigate('/apply');
        }}
      />
    </div>
  );
}
