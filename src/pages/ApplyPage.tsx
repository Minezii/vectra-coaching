import { Link } from 'react-router-dom';
import { Pulse } from '@phosphor-icons/react';
import { ApplicationSection } from '../components/ApplicationSection';
import { SelectedProtocol } from '../components/ProtocolBuilder';

interface ApplyPageProps {
  selectedProtocol: SelectedProtocol | null;
}

export function ApplyPage({ selectedProtocol }: ApplyPageProps) {
  return (
    <>
      <div className="bg-[#0A1120]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 text-xs text-[#94A3B8] sm:text-sm">
            <Pulse size={16} weight="regular" aria-hidden="true" className="shrink-0 text-[#3B82F6]" />
            <span>
              {selectedProtocol?.diagnosticNote
                ? 'Расчёт из VECTRA BODY OS прикреплён — вы можете обновить параметры перед отправкой.'
                : 'Нужен предварительный расчёт массы, КБЖУ и панели анализов для анкеты?'}
            </span>
          </div>

          <Link
            to="/body-os"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#3B82F6]/40 bg-[#111C30] px-4 py-2 text-xs font-semibold text-[#F1F5F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:border-[#3B82F6] hover:bg-[#182742] active:scale-[0.98] sm:text-sm"
          >
            <Pulse size={15} weight="regular" aria-hidden="true" className="text-[#3B82F6]" />
            <span>Открыть BODY OS</span>
          </Link>
        </div>
      </div>

      <ApplicationSection selectedProtocol={selectedProtocol} />
    </>
  );
}
