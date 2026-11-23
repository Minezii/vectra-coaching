import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppShell } from './components/AppShell';
import { DiagnosticPayload } from './components/VectraBodyOS';
import { SelectedProtocol } from './components/ProtocolBuilder';
import { FormatId, TrackId } from './data/coachingData';
import { HomePage } from './pages/HomePage';
import { BodyOsPage } from './pages/BodyOsPage';
import { AtlasPage } from './pages/AtlasPage';
import { DirectionsPage } from './pages/DirectionsPage';
import { ResultsPage } from './pages/ResultsPage';
import { PricingPage } from './pages/PricingPage';
import { ApplyPage } from './pages/ApplyPage';
import { MiniAppPage } from './pages/MiniAppPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  const [selectedProtocol, setSelectedProtocol] = useState<SelectedProtocol | null>(null);

  const handleApplyProtocol = (protocol: SelectedProtocol) => {
    setSelectedProtocol((prev) => ({
      ...protocol,
      diagnosticNote: prev?.diagnosticNote,
    }));
  };

  const handleApplyDiagnostic = (payload: DiagnosticPayload) => {
    setSelectedProtocol({
      gender: payload.gender,
      goal: payload.goal,
      format: payload.format,
      diagnosticNote: payload.diagnosticNote,
    });
  };

  const handleSelectTariff = (params: {
    format: FormatId;
    goal?: TrackId;
  }) => {
    setSelectedProtocol((prev) => ({
      gender: prev?.gender ?? 'men',
      goal: params.goal ?? prev?.goal ?? 'fat-loss',
      format: params.format,
      diagnosticNote: prev?.diagnosticNote,
    }));
  };

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Standalone Telegram Mini App route without desktop navbar/footer */}
          <Route path="/mini-app" element={<MiniAppPage />} />
          <Route
            path="*"
            element={
              <AppShell>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/body-os"
                    element={<BodyOsPage onApplyDiagnostic={handleApplyDiagnostic} />}
                  />
                  <Route path="/atlas" element={<AtlasPage />} />
                  <Route
                    path="/directions"
                    element={<DirectionsPage onApplyProtocol={handleApplyProtocol} />}
                  />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route
                    path="/pricing"
                    element={<PricingPage onSelectTariff={handleSelectTariff} />}
                  />
                  <Route
                    path="/apply"
                    element={<ApplyPage selectedProtocol={selectedProtocol} />}
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
