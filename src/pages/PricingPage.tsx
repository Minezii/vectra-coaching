import { useNavigate } from 'react-router-dom';
import { FormatId, TrackId } from '../data/coachingData';
import { PricingSection } from '../components/PricingSection';
import { FaqSection } from '../components/FaqSection';

interface PricingPageProps {
  onSelectTariff: (params: { format: FormatId; goal?: TrackId }) => void;
}

export function PricingPage({ onSelectTariff }: PricingPageProps) {
  const navigate = useNavigate();

  return (
    <>
      <PricingSection
        onSelectTariff={(p) => {
          onSelectTariff(p);
          navigate('/apply');
        }}
      />
      <FaqSection />
    </>
  );
}
