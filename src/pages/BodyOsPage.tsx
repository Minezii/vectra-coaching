import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CaretRight, Pulse } from '@phosphor-icons/react';
import { DiagnosticPayload, VectraBodyOS } from '../components/VectraBodyOS';

export function BodyOsPage({
  onApplyDiagnostic,
}: {
  onApplyDiagnostic: (payload: DiagnosticPayload) => void;
}) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Top Breadcrumb / Module Status Strip */}
      <div className="border-b border-white/[0.08] bg-[#0A1120]/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <nav
            aria-label="Навигация по модулю"
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
              VECTRA BODY OS
            </span>
          </nav>

          <div className="inline-flex items-center gap-2 rounded-md border border-[#3B82F6]/30 bg-[#111C30] px-2.5 py-1">
            <Pulse
              size={14}
              weight="regular"
              className="text-[#3B82F6]"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#CBD5E1]">
              Симулятор 16 нед. • 8 маркеров крови
            </span>
          </div>
        </div>
      </div>

      <VectraBodyOS
        standalone
        onApplyDiagnostic={(payload) => {
          onApplyDiagnostic(payload);
          navigate('/apply');
        }}
      />
    </div>
  );
}
